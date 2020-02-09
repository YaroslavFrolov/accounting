import { financial } from 'calculating/helpers.js';

const MONTHS = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
};


export let calculateDeclaration = (data, countriesRate) => {
  let { DB } = data || {}; // берём нижнюю вкладку с именем DB из эксельки

  if (!Array.isArray(DB)) {
    console.log('calculateDeclaration - no DB');
  }

  let monthsNumbers = Object.keys(MONTHS);
  let WorkSheetsRaw = {};
  let WorkSheetsResult = {};


  /**
   * Группируем строки с одинаковыми месяцами и наполняем объект WorkSheetsRaw[имя_месяца] этими строками
   * WorkSheetsRaw = {
   *   January: [... строки только с январём, {}, {}, {} ...],
   *   February: [... строки только с февралём, {}, {}, {} ...],
   *   March: [... строки только с мартом, {}, {}, {} ...],
   *   и т.д.
   * };
   */
  monthsNumbers.forEach(monthNumber=>{
    WorkSheetsRaw[MONTHS[monthNumber]] = DB.filter(row=>{
      let lastIndex = row.length - 1;

      return row[lastIndex] === parseInt(monthNumber, 10);
    });
  });


  /**
   * Создаём объект WorkSheetsResult с месяцами; в каждом месяце массив
   * объектов (будущие строки для таблицы) с данными.
   * Каждый месяц - это отдельная нижняя вкладка в будущей табличке.
   */
  for (let [WSname, WSrows] of Object.entries(WorkSheetsRaw)) {
    if (WSrows.length > 0) {
      WorkSheetsResult[WSname] = createWSData(WSrows, countriesRate);
    }
  }


  return WorkSheetsResult;
};


/**
 * @param {array} WSrows - массив объектов (строк) одного месяца с данными
 * @param {object} countriesRate - объект {страна : её rate}
 *
 */
function createWSData(WSrows, countriesRate) {
  if(!Array.isArray(WSrows)) {
    console.log('createTableData - no WSrows');
  }

  /**
   * Создаём и наполняем объект countries на основании строк WSrows и рейтов countriesRate.
   * Ключи объекта - это страны. Каждая страна с такими полями:
   *  countries[name] = {
        name, // имя страны
        type, // EU / non EU
        rate, // ставка НДС
        netSale, // С НДС
        basis_for_VAT: null, // БЕЗ НДС
        tax: null // НДС к оплате
      }
   */
  let countries = fillCountriesObj(WSrows, countriesRate);

  // удаление "минусовых eu стран" (с отрицательным netsale)
  countries = removeMinusFromEUCountries(countries);



  //@todo распидарасить non EU страны
  //@todo футер с суммой цифр
  //@todo нижняя табличка с общими данными
  //@todo создание последней вкладки
  return Object.values(countries);
};



function getTax (netSale, rate) {
  return netSale * rate / (100 + rate);
}



function fillCountriesObj(WSrows, countriesRate) {
  let countries = {};

  /**
   * Проходимся по каждой строке и группируем страны в ключи объекта countries.
   *
   * Суммируем все netSale для каждой отдельной страны.
   * netSale предварительно умножаем на 100, чтобы все дальнейшие вычисления происходили
   * в копейках (для уменьшения погрешности). При выводе результатов во вьюхах, все
   * зависимые и вычисляемые значения от netSale следует поделить на 100.
   */
  WSrows.forEach(row=>{
    let name = row[7]; // имя страны восьмая колонка в эксельке
    let type = row[8]; // тип страны девятая колонка в эксельке
    let netSale = financial(row[5] * 100); // ставка с НДС шестая колонка в эксельке
    let rate = type === 'EU' && (parseFloat(countriesRate[name]) || 0);

    if(countries[name]) {
      countries[name] = {
        ...countries[name],
        netSale: countries[name].netSale + netSale,
      }
    } else {
      countries[name] = {
        name, // имя страны
        type, // EU / non EU
        rate, // ставка НДС
        netSale, // С НДС
        basis_for_VAT: null, // БЕЗ НДС
        tax: null // НДС к оплате
      }
    }
  });


  /**
   * Расчитываем basis_for_VAT и tax для каждой страны на основе
   * их суммарного netSale (вычисленного на предыдущем шаге).
   */
  Object.values(countries).forEach(country=>{
    country.basis_for_VAT = (country.netSale / (country.rate + 100)) * 100;
    country.tax = getTax(country.netSale, country.rate);
  });


  return countries;
}



function removeMinusFromEUCountries(data) {
  let countries = JSON.parse(JSON.stringify(data));

  // подготавливаем нужные данные:
  let totalNetSaleBefore = 0; // сумма всех netSale до удаления "минусовых EU стран"
  let totalTaxMinus = 0; // сумма минусовых tax
  let countryNamesWithMinus = []; // имена EU стран с минусовым netSale
  let totalRateOfCountriesWithPlus = 0; // сумарный rate всех "плюсовых EU стран"

  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;

    totalNetSaleBefore = totalNetSaleBefore + country.netSale;

    if (country.netSale < 0) {
      totalTaxMinus = totalTaxMinus + country.tax;
      countryNamesWithMinus.push(country.name);
    } else {
      totalRateOfCountriesWithPlus = totalRateOfCountriesWithPlus + country.rate;
    }
  });

  // удаляем "минусовые EU страны" из объекта countries
  countryNamesWithMinus.forEach(name=>{
    delete countries[name];
  });


  let copyCountries = JSON.parse(JSON.stringify(countries));

  findSkippingCountries();

  function findSkippingCountries(){
    if ( isExistCountryWithNewMinusNetSale(copyCountries, totalTaxMinus, totalRateOfCountriesWithPlus) ) {
      Object.values(copyCountries).forEach((copyCountry, idx, copyCountries)=>{
        if (copyCountry.type !== 'EU') return null;

        addSkipFlagToCountry(countries, totalTaxMinus, totalRateOfCountriesWithPlus);
        addSkipFlagToCountry(copyCountries, totalTaxMinus, totalRateOfCountriesWithPlus);
        copyCountry.netSale = getNewNetSale(copyCountry, totalTaxMinus, totalRateOfCountriesWithPlus);
        calculateTotalRateOfCountriesWithPlus(copyCountries);
        findSkippingCountries();
      });
    }


    calculateTotalRateOfCountriesWithPlus(countries);
    return null;
  }



  function calculateTotalRateOfCountriesWithPlus(countries){
    totalRateOfCountriesWithPlus = 0;

    Object.values(countries).forEach(country=>{
      if (country.type !== 'EU') return null;
      if (country.skip) return null;

      totalRateOfCountriesWithPlus = totalRateOfCountriesWithPlus + country.rate;
    });
  }





  /**
  * Обновляем netSale и tax для каждой EU страны,
  * чтобы сумма tax до удаления "минусовых EU стран"
  * была равна сумме tax после удаления "минусовых EU стран".
  */
  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;
    if (country.skip) return null;

    country.netSale = getNewNetSale(country, totalTaxMinus, totalRateOfCountriesWithPlus);
    country.tax = getTax(country.netSale, country.rate);
  });

  // сумма всех netSale после удаления "минусовых EU стран"
  let totalNetSaleAfter = 0;
  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;

    totalNetSaleAfter = totalNetSaleAfter + country.netSale;
  });

  // разница сумм netSale до и после удаления "минусовых EU стран"
  let diffTotalNetSale = totalNetSaleBefore - totalNetSaleAfter;

  // массив EU стран с минимальными рейтами
  let countriesWitnMinRate = Object
    .values(countries)
    .filter(country=>country.type === 'EU')
    .reduce((acc, country)=>{
      if (acc.length < 1) {
        return [country];
      }

      if (country.rate < acc[0].rate) {
        return [country];
      }

      if (country.rate === acc[0].rate) {
        return [...acc, country];
      }

      return acc;
    }, []);

  //@todo проверка, чтоб оставшиюся разницу netSale раскидывать только на те страны
  // с минимальными рейтами, у которых достаточно этих netSale
  // (чтоб не образовалсяновый минус, от которых мы так тяжело избавлялись)

  // сумма netSale у стран с минимальными рейтами
  let totalNetSaleWitnMinRate = 0;
  countriesWitnMinRate.forEach(country => {
    totalNetSaleWitnMinRate = totalNetSaleWitnMinRate + country.netSale;
  });


  /**
  * Раскидываем оставшеюся разницу netSale (после удаления "минусовых EU стран")
  * на страны с минимальными рейтами (пропорционально их начальным netSale).
  *
  * Цель - чтобы итоговая сумма netSale до удаления "минусовых EU стран"
  * была строго равна сумме netSale после удаления "минусовых EU стран".
  *
  * При этом сумма tax до и после удаления "минусовых EU стран" будет не равной,
  * а с минимальной погрешностью.
  */
  countriesWitnMinRate.forEach(country => {
    let diffNetSaleProportion = (country.netSale * diffTotalNetSale) / totalNetSaleWitnMinRate;
    country.netSale = country.netSale + diffNetSaleProportion;
    country.tax = getTax(country.netSale, country.rate);
  });

  return countries;
}


function getNewNetSale(country, totalTaxMinus, totalRateOfCountriesWithPlus){
  let proportionTax = country.rate * Math.abs(totalTaxMinus) / totalRateOfCountriesWithPlus;
  let diffNetSale = proportionTax * (100 + country.rate) / country.rate;
  return country.netSale - diffNetSale;
}



function newNetSaleIsMinus(country, totalTaxMinus, totalRateOfCountriesWithPlus){
  let newNetSale = getNewNetSale(country, totalTaxMinus, totalRateOfCountriesWithPlus);
  return newNetSale <= 0 ? true : false;
}


function isExistCountryWithNewMinusNetSale(countries, totalTaxMinus, totalRateOfCountriesWithPlus){
  return Object
    .values(countries)
    .filter(country => country.type === 'EU')
    .filter(country => !country.skip)
    .some(country => {
      if ( newNetSaleIsMinus(country, totalTaxMinus, totalRateOfCountriesWithPlus) ) {
        return true;
      } else {
        return false;
      }
    });
}


function addSkipFlagToCountry(countries, totalTaxMinus, totalRateOfCountriesWithPlus){
  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;
    if (country.skip) return null;

    if ( newNetSaleIsMinus(country, totalTaxMinus, totalRateOfCountriesWithPlus) ) {
      country.skip = true;
    }
  });
}
