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


export let calculateDeclaration = data => {
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
      WorkSheetsResult[WSname] = createWSData(WSrows);
    }
  }


  return WorkSheetsResult;
};


function createWSData(WSrows) {
  if(!Array.isArray(WSrows)) {
    console.log('createTableData - no WSrows');
  }

  let countries = {};

  WSrows.forEach(row=>{
    let name = row[7];
    let type = row[8];
    let netSale = financial(row[5] * 100);
    let rate = 20;

    if(countries[name]) {
      countries[name] = {
        ...countries[name],
        netSale: countries[name].netSale + netSale,
      }
    } else {
      countries[name] = {
        name,
        type,
        rate,
        netSale,
        basis_for_VAT: null,
        tax: null
      }
    }
  });

  //@todo диалог ввода rate для каждой страны

  Object.values(countries).forEach(country=>{
    country.basis_for_VAT = (country.netSale / (country.rate + 100)) * 100;
    country.tax = (country.netSale * country.rate) / 100; // @todo выяснить расчёт
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
