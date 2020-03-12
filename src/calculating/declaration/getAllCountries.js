import { MONTHS } from './constants.js';

export let getAllCountries = data => {
  let { DB } = data || {};

  if (!Array.isArray(DB)) {
    console.log('getAllCountries: calculateDeclaration - no DB');
  }


  /**
   * Создаём обект:
   * {
   *   месяц-1: 'rate по умолчанию',
   *   месяц-2: 'rate по умолчанию',
   *   месяц-3: 'rate по умолчанию',
   * }
   */
  let monthsRates = {};

  DB.forEach(row=>{
    let lastIndex = row.length - 1;
    let monthNumber = row[lastIndex];

    if (monthNumber < 1 || monthNumber > 12 || !Number.isInteger(monthNumber)) {
      console.log(`invalid month number (${monthNumber})`);
      return null;
    }

    if (monthsRates[MONTHS[monthNumber]]) return null;

    monthsRates[MONTHS[monthNumber]] = 17; // просто значение по умолчанию
  });



  /**
   * Создаём обект:
   * {
   *   страна-1: { месяц-1: rate, месяц-2: rate, месяц-3: rate, }',
   *   страна-2: { месяц-1: rate, месяц-2: rate, месяц-3: rate, }',
   *   страна-3: { месяц-1: rate, месяц-2: rate, месяц-3: rate, }',
   * }
   *
   *
   * @todo где-то здесь сделать запрос в апи за актуальными рейтами для каждого месяца и страны
   * @todo найти такое апи
   */
  let allCountries = {};

  let EURows = DB.filter(row=>row[8] === 'EU');

  EURows.forEach(row=>{
    let country = row[7];

    if(allCountries[country]) {
      return false;
    } else {
      allCountries[country] = monthsRates;
    }
  });

  return allCountries;
};
