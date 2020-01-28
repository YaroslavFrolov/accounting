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
  let { DB } = data || {};

  if (!Array.isArray(DB)) {
    console.log('calculateDeclaration - no DB');
  }

  let monthsNumbers = Object.keys(MONTHS);
  let WorkSheetsRaw = {};
  let WorkSheetsResult = {};


  monthsNumbers.forEach(monthNumber=>{
    WorkSheetsRaw[MONTHS[monthNumber]] = DB.filter(row=>{
      let lastIndex = row.length - 1;

      return row[lastIndex] === parseInt(monthNumber, 10);
    });
  });



  for (let [WSname, WSrows] of Object.entries(WorkSheetsRaw)) {
    if (WSrows.length > 0) {
      WorkSheetsResult[WSname] = createWSData(WSrows, countriesRate);
    }
  }


  return WorkSheetsResult;
};


function createWSData(WSrows, countriesRate) {
  if(!Array.isArray(WSrows)) {
    console.log('createTableData - no WSrows');
  }

  let countries = {};

  WSrows.forEach(row=>{
    let name = row[7];
    let type = row[8];
    let netSale = financial(row[5] * 100);
    let rate = type === 'EU' && (parseFloat(countriesRate[name]) || 0);

    if(countries[name]) {
      countries[name] = {
        ...countries[name],
        netSale: countries[name].netSale + netSale,
      }
    } else {
      countries[name] = {
        name,
        type,
        rate, // ставка НДС
        netSale, // С НДС
        basis_for_VAT: null, // БЕЗ НДС
        tax: null // НДС к оплате
      }
    }
  });


  Object.values(countries).forEach(country=>{
    country.basis_for_VAT = (country.netSale / (country.rate + 100)) * 100;
    // country.tax = (country.netSale / (100 + country.rate)) * country.rate
    country.tax = country.netSale - country.basis_for_VAT;
    //@todo удаление минусов
  });


  //@todo футер с суммой цифр
  //@todo нижняя табличка с общими данными
  //@todo создание последней вкладки


  // Object.values(countries).forEach(country=>{
  //   country.netSale = financial(country.netSale / 100);
  // });
  // console.log(countries);

  return Object.values(countries);
};
