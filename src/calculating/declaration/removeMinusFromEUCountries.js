import { financial } from 'calculating/helpers';
import { getTax } from './getTax';

export let removeMinusFromEUCountries = countries => {
  const MAX_DIFF_TOTAL_TAX = 0.03;

  let totalNetSaleBefore = 0; // сумма всех netSale до удаления "минусовых EU стран"
  let totalTaxBefore = 0; // сумма всех tax до удаления "минусовых EU стран"
  let totalTaxMinus = 0; // сумма минусовых tax
  let countryNamesWithMinus = []; // имена EU стран с минусовым netSale
  let totalRateOfCountriesWithPlus = 0; // сумарный rate всех "плюсовых EU стран"

  // подготавливаем нужные выше данные:
  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;

    totalNetSaleBefore = financial(totalNetSaleBefore + country.netSale);
    totalTaxBefore = financial(totalTaxBefore + country.tax);

    if (country.netSale < 0) {
      totalTaxMinus = financial(totalTaxMinus + country.tax);
      countryNamesWithMinus.push(country.name);
    } else {
      totalRateOfCountriesWithPlus = financial(totalRateOfCountriesWithPlus + country.rate);
    }
  });

  // удаляем "минусовые EU страны" из объекта countries
  countryNamesWithMinus.forEach(name=>{
    delete countries[name];
  });


  /**
   * Вымученным хитрожопым способом, корректируем netSale каждой EU-страны, чтобы сумма netSale до удаления
   * была строго равна сумме netSale после удаления "минусовых EU-стран". При этом, чтобы разница сумм tax
   * до удаления "минусовых EU-стран" и после, - была минимальной (в пределах MAX_DIFF_TOTAL_TAX).
   *
   * Пример exel-таблички с расчётами лежит в корне проекта (example-declaration-remove-minus-country.xlsx)
   */
  doMagic();

  function doMagic(){
    findSkippingCountries();

    /**
     * Добавляем skip-флаг странам, tax которых после магических преобразований будет минусовым.
     * Если tax оказался минусовым, значит netSale этих стран не корректируем.
     */
    function findSkippingCountries(){
      if ( isExistCountryWithNewMinusTax(countries, totalTaxMinus, totalRateOfCountriesWithPlus) ) {
        Object.values(countries).forEach(country=>{
          if (country.type !== 'EU') return null;

          addSkipFlagToCountry(countries, totalTaxMinus, totalRateOfCountriesWithPlus);
          totalRateOfCountriesWithPlus = calculateTotalRateOfCountriesWithPlus(countries);
          findSkippingCountries();
        });
      }
    }


    /**
    * Обновляем netSale и tax для каждой EU страны,
    * чтобы сумма tax до удаления "минусовых EU стран"
    * была равна сумме tax после удаления "минусовых EU стран".
    */
    Object.values(countries).forEach(country=>{
      if (country.type !== 'EU') return null;
      if (country.skip) return null;

      country.tax = country.tax - getDiffTax(country.rate, totalRateOfCountriesWithPlus, totalTaxMinus);
      country.netSale = getNewNetSale(country.tax, country.rate);
    });




    let { diffTotalNetSale } = getTotalResults(countries, totalNetSaleBefore, totalTaxBefore);


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
    // (чтоб не образовался новый минус, от которых мы так тяжело избавлялись)

    // сумма netSale у стран с минимальными рейтами
    let totalNetSaleWitnMinRate = 0;
    countriesWitnMinRate.forEach(country => {
      totalNetSaleWitnMinRate = financial(totalNetSaleWitnMinRate + country.netSale);
    });


    /**
    * Раскидываем оставшеюся разницу diffTotalNetSale (после удаления "минусовых EU стран")
    * на страны с минимальными рейтами (пропорционально их начальным netSale).
    *
    * Цель - чтобы итоговая сумма netSale до удаления "минусовых EU стран"
    * была строго равна сумме netSale после удаления "минусовых EU стран".
    *
    * При этом суммы tax до и после удаления "минусовых EU стран" будут не равны,
    * а с максимальной погрешностью MAX_DIFF_TOTAL_TAX.
    */
    countriesWitnMinRate.forEach(country => {
      let diffNetSaleProportion = financial((country.netSale * diffTotalNetSale) / totalNetSaleWitnMinRate);
      country.netSale = financial(country.netSale + diffNetSaleProportion);
      country.tax = getTax(country.netSale, country.rate);
    });



    let { diffTotalTax } = getTotalResults(countries, totalNetSaleBefore, totalTaxBefore);


    /**
     * Если в итоге разница сумм tax до и после удаления "минусовых EU стран" нас устраивает - то заканчиваем расчёты.
     * Если разница больше чем мы можем себе позволить, то
     * - обновляем минусовый tax который надо рааскидать (который нас не устроил)
     * - повторяем алгоритм (рекурсивно вызываем ту же функцию doMagic)
     */
    if ( Math.abs(diffTotalTax) > (MAX_DIFF_TOTAL_TAX * 100) ) {
      totalTaxMinus = diffTotalTax;
      doMagic();
    }
  }



  return countries;
}



/**
 * Расчитываем новый tax, и смотрим - отрицательный он или нет.
 */
function newTaxIsMinus(country, totalTaxMinus, totalRateOfCountriesWithPlus){
  let diffTax = getDiffTax(country.rate, totalRateOfCountriesWithPlus, totalTaxMinus);
  let newTax = country.tax - diffTax;
  return newTax <= 0 ? true : false;
}



function getNewNetSale(tax, rate){
  return financial( (tax*(100+rate)) / rate );
}



/**
 * Смотрим, будет ли после магических преобразований хоть одна страна с новым отрицательным tax-ом.
 * Если да - то эта netSale этой страны не годится для корректировок. Не трогаем эту страну.
 */
function isExistCountryWithNewMinusTax(countries, totalTaxMinus, totalRateOfCountriesWithPlus){
  return Object
    .values(countries)
    .filter(country => country.type === 'EU')
    .filter(country => !country.skip)
    .some(country => {
      if ( newTaxIsMinus(country, totalTaxMinus, totalRateOfCountriesWithPlus) ) {
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

    if ( newTaxIsMinus(country, totalTaxMinus, totalRateOfCountriesWithPlus) ) {
      country.skip = true;
    }
  });
}



/**
 * Подсчитываем общий rate всех не "skip-нутых" EU стран
 */
function calculateTotalRateOfCountriesWithPlus(countries){
  let totalRateOfCountriesWithPlus = 0;

  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;
    if (country.skip) return null;

    totalRateOfCountriesWithPlus = financial(totalRateOfCountriesWithPlus + country.rate);
  });

  return totalRateOfCountriesWithPlus;
}



/**
 * Есть общий минусовый tax, который надо раскидать на остальные tax, которые остались после удаления минусовых стран.
 * Есть rate текущей страны.
 * Есть суммарный рейт всех плюсовых не "skip-нутых" стран.
 * Относительно этих данных считаем ЧИСЛО, которое нужно будет отнять от tax-а текущей страны,
 * чтобы потом сумма tax-ов до удаления была равна сумме tax-ов после удаления "минусовых EU" стран.
 */
function getDiffTax(rate, totalRateOfCountriesWithPlus, totalTaxMinus){
  return financial(Math.abs(totalTaxMinus) * rate / totalRateOfCountriesWithPlus);
}



/**
 * Получаем объект с двумя полями:
 * diffTotalNetSale - разница сумм netSale до и после удаления "минусовых EU стран".
 * diffTotalTax - разница сумм tax до и после удаления "минусовых EU стран".
 */
function getTotalResults(countries, totalNetSaleBefore, totalTaxBefore){
  let totalNetSaleAfter = 0; // сумма всех netSale после удаления "минусовых EU стран"
  let totalTaxAfter = 0; // сумма всех tax после удаления "минусовых EU стран"

  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;

    totalNetSaleAfter = financial(totalNetSaleAfter + country.netSale);
    totalTaxAfter = financial(totalTaxAfter + country.tax);
  });

  let diffTotalNetSale = financial(totalNetSaleBefore - totalNetSaleAfter);
  let diffTotalTax = financial(totalTaxBefore - totalTaxAfter);

  return {
    diffTotalNetSale,
    diffTotalTax
  };
}
