import { fillCountriesObj } from './fillCountriesObj';
import { removeMinusFromEUCountries } from './removeMinusFromEUCountries';
import { removeMinusFromNonEUCountries } from './removeMinusFromNonEUCountries';
import { getSums, getSumNetSaleEU, getSumNetSaleNonEU } from './getSums';
import { createLastTab } from './createLastTab';
import { MONTHS } from './constants';


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
    let month = WSname;

    if (WSrows.length > 0) {
      let countriesRatePerMonth = getCountriesRatePerMonth(month, countriesRate);
      WorkSheetsResult[month] = createMonthData(WSrows, countriesRatePerMonth);
    }
  }

  /**
   * Создаём последнюю общую нижнюю вкладку (под названием 'To Be Paid') в будущей табличке.
   */
  WorkSheetsResult['To Be Paid'] = createLastTab(WorkSheetsResult);


  return WorkSheetsResult;
};


/**
 * Возвращается объект:
 * { страна: rate для этого месяца }
 */
function getCountriesRatePerMonth (month, countriesRate) {
  let countriesRatePerMonth = {};

  for (let countryName in countriesRate) {
    let rate = countriesRate[countryName][month];
    countriesRatePerMonth[countryName] = rate;
  }

  return countriesRatePerMonth;
}



/**
 * @param {array} WSrows - массив объектов (строк) одного месяца с данными
 * @param {object} countriesRate - объект {страна : её rate}
 *
 */
function createMonthData(WSrows, countriesRate) {
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

  // считаем суммы netSale и tax до удаления "минусовых стран"
  let { totalNetSale: totalNetSaleBefore, totalTax: totalTaxBefore } = getSums(countries);

  // удаление "минусовых non-eu стран" (с отрицательным netsale)
  countries = removeMinusFromNonEUCountries(countries);

  // удаление "минусовых eu стран" (с отрицательным netsale)
  countries = removeMinusFromEUCountries(countries);

  // считаем суммы netSale и tax после удаления "минусовых стран"
  let { totalNetSale: totalNetSaleAfter, totalTax: totalTaxAfter } = getSums(countries);

  // считаем суммы netSale после удаления "минусовых стран" отдельно для EU и nonEU стран
  let totalNetSale_EU = getSumNetSaleEU(countries);
  let totalNetSale_nonEU = getSumNetSaleNonEU(countries);



  let result = {
    countries: Object.values(countries),
    totalNetSaleBefore,
    totalTaxBefore,
    totalNetSaleAfter,
    totalTaxAfter,
    totalNetSale_EU,
    totalNetSale_nonEU
  };


  //@todo интерфейс
  //@todo стилизация скачиваемой таблички
  //@todo выложить в паблик для Юльки
  return result;
};
