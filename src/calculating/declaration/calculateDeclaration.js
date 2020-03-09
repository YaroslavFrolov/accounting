import { fillCountriesObj } from './fillCountriesObj.js';
import { removeMinusFromEUCountries } from './removeMinusFromEUCountries.js';
import { removeMinusFromNonEUCountries } from './removeMinusFromNonEUCountries.js';
import { getSums, getSumNetSaleEU, getSumNetSaleNonEU } from './getSums.js';
import { createLastTab } from './createLastTab.js';

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


  // @todo  установить фильтрацию в диалоге
  // DB = DB.filter(row=>{
  //   if (row[2] !== 2020) return false;

  //   return row;
  // });

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

  /**
   * Создаём последнюю общую нижнюю вкладку (под названием 'To Be Paid') в будущей табличке.
   */
  WorkSheetsResult['To Be Paid'] = createLastTab(WorkSheetsResult);


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


  //@todo запрос рейтов по месяцам
  //@todo найти апи с актуальными рейтами для стран
  //@todo причесание кода
  //@todo интерфейс
  //@todo стилизация скачиваемой таблички
  return result;
};
