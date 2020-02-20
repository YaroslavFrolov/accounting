import { fillCountriesObj } from './fillCountriesObj.js';
import { removeMinusFromEUCountries } from './removeMinusFromEUCountries.js';

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
