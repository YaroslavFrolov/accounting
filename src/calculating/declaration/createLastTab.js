export let createLastTab = WorkSheetsResult => {
  let countries = {};

  /**
   * Для последней вкладки суммируем данные каждой страны с предыдущих вкладок (месяцев).
   * Допустим есть три вкладки - октябрь, ноябрь, декабрь.
   * Если, например, в октябре не было Австрии, а в ноябре и декабре была - то в итоговую
   * вкладку добавляем сумму данных этой страны взятых из ноября и декабря.
   */
  Object.values(WorkSheetsResult).forEach(month => {

    month.countries.forEach(country => {
      let existCountry = countries[country.name];

      if (existCountry) {
        existCountry.netSale = existCountry.netSale + country.netSale;
        existCountry.basis_for_VAT = existCountry.basis_for_VAT + country.basis_for_VAT;
        existCountry.tax = country.tax ? (existCountry.tax + country.tax) : existCountry.tax;
        // @todo - existCountry.rate - брать самый актуальный, или с последнего месяца?
      } else {
        countries[country.name] = country;
      }
    });

  });


  let getTotal = field => {
    return Object.values(WorkSheetsResult).reduce((acc, month) => {
      return acc + month[field];
    }, 0);
  };

  /**
   * Для последней вкладки суммируем значения данных из предыдущих вкладок (месяцев).
   */
  let result = {
    countries: Object.values(countries),
    totalNetSaleBefore: getTotal('totalNetSaleBefore'),
    totalTaxBefore: getTotal('totalTaxBefore'),
    totalNetSaleAfter: getTotal('totalNetSaleAfter'),
    totalTaxAfter: getTotal('totalTaxAfter'),
    totalNetSale_EU: getTotal('totalNetSale_EU'),
    totalNetSale_nonEU: getTotal('totalNetSale_nonEU'),
  };

  return result;
};
