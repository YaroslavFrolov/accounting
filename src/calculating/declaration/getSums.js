import { financial } from 'calculating/helpers';


export let getSums = countries => {
  let totalNetSale = 0;
  let totalTax = 0;

  Object.values(countries).forEach(country=>{
    totalNetSale = financial(totalNetSale + country.netSale);
    totalTax = financial(totalTax + country.tax);
  });

  return {
    totalNetSale,
    totalTax
  };
};


export let getSumNetSaleEU = countries => {
  let totalNetSale = 0;

  Object.values(countries).forEach(country=>{
    if (country.type !== 'EU') return null;
    totalNetSale = financial(totalNetSale + country.netSale);
  });

  return totalNetSale
};


export let getSumNetSaleNonEU = countries => {
  let totalNetSale = 0;

  Object.values(countries).forEach(country=>{
    if (country.type === 'EU') return null;
    totalNetSale = financial(totalNetSale + country.netSale);
  });

  return totalNetSale
};
