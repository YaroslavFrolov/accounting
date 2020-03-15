import { financial } from 'calculating/helpers';
import { getTax } from './getTax';


export let removeMinusFromNonEUCountries = countries => {
  let nonEUCountries = Object.values(countries).filter(country => country.type !== 'EU');

  let totalPositiveNetSale = nonEUCountries.reduce((acc, currentCountry) => {
    if (currentCountry.netSale < 0) return acc;
    return acc + currentCountry.netSale;
  } , 0);

  let totalNegativeNetSale = nonEUCountries.reduce((acc, currentCountry) => {
    if (currentCountry.netSale > 0) return acc;
    return acc + currentCountry.netSale;
  } , 0);

  totalNegativeNetSale = Math.abs(totalNegativeNetSale);


  /**
   * Если сумма отрицательных netSale больше суммы положительных netSale, то раскидывать эти минуса негде
   * у non EU стран. Поэтому эту разницу кидаем в EU страну с минимальным рейтом.
   * При этом все non EU страны удаляем.
   */
  if (totalNegativeNetSale > totalPositiveNetSale) {
    let updateCountries = setNegativeNetSaleToEUCountries(countries, totalNegativeNetSale, totalPositiveNetSale);

    for (let key in updateCountries) {
      if (updateCountries[key].type !== 'EU') {
        delete updateCountries[key];
      }
    }

    return updateCountries;
  }


  let countryNamesWithMinus = [];
  Object.values(countries).forEach(country=>{
    if (country.type === 'EU') return null;

    if (country.netSale < 0) {
      countryNamesWithMinus.push(country.name);
    }
  });

  // удаляем минусовые non-EU страны
  countryNamesWithMinus.forEach(name=>{
    delete countries[name];
  });

  // пропорционально раскидываем сумму удалённых минусов на оставшиеся пложительные non-EU страны
  Object
    .values(countries)
    .filter(country => country.type !== 'EU')
    .forEach(country => {
      country.netSale = financial(country.netSale - (country.netSale * totalNegativeNetSale) / totalPositiveNetSale);
    });

  return countries;
};



function setNegativeNetSaleToEUCountries(countries, totalNegativeNetSale, totalPositiveNetSale) {
  let diff = totalNegativeNetSale - totalPositiveNetSale;

  let countryWithMinRate = {rate: Infinity};

  Object
    .values(countries)
    .filter(country => country.type === 'EU')
    .forEach(country => {
      if (country.netSale < diff) return false;

      if (countryWithMinRate.rate > country.rate) {
        countryWithMinRate = country;
        return true;
      }
    });

  let newNetSale = countryWithMinRate.netSale - diff;

  countryWithMinRate.netSale = newNetSale;
  countryWithMinRate.basis_for_VAT = (countryWithMinRate.netSale / (countryWithMinRate.rate + 100)) * 100;
  countryWithMinRate.tax = getTax(countryWithMinRate.netSale, countryWithMinRate.rate);

  return countries;
}
