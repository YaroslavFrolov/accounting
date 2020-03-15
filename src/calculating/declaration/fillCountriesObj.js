import { financial } from 'calculating/helpers';
import { getTax } from './getTax';

export let fillCountriesObj = (WSrows, countriesRate) => {
  let countries = {};

  /**
   * Проходимся по каждой строке и группируем страны в ключи объекта countries.
   *
   * Суммируем всех netSale для каждой отдельной страны.
   * netSale предварительно умножаем на 100, чтобы все дальнейшие вычисления происходили
   * в копейках (для уменьшения погрешности). При выводе результатов во вьюхах, все
   * зависимые и вычисляемые значения от netSale следует поделить на 100.
   */
  WSrows.forEach(row=>{
    let name = row[7]; // имя страны восьмая колонка в эксельке
    let type = row[8]; // тип страны девятая колонка в эксельке
    let netSale = financial(row[5] * 100); // ставка с НДС шестая колонка в эксельке
    let rate = type === 'EU' && (parseFloat(countriesRate[name]) || 0);

    if(countries[name]) {
      countries[name] = {
        ...countries[name],
        netSale: financial(countries[name].netSale + netSale),
      }
    } else {
      countries[name] = {
        name, // имя страны
        type, // EU / non EU
        rate, // ставка НДС
        netSale, // С НДС
        basis_for_VAT: null, // БЕЗ НДС
        tax: null // НДС к оплате
      }
    }
  });


  /**
   * Расчитываем basis_for_VAT и tax для каждой страны на основе
   * их суммарного netSale (вычисленного на предыдущем шаге).
   */
  Object.values(countries).forEach(country=>{
    country.basis_for_VAT = financial((country.netSale / (country.rate + 100)) * 100);
    country.tax = getTax(country.netSale, country.rate);
  });


  return countries;
}
