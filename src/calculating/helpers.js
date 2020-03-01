/**
 * 123.456 => 123.46
 * 0.004 => 0.00
 * 1.23e+5 => 123000.00
 */
export let financial = value => {
  return +Number.parseFloat(value).toFixed(2);
}


/**
 * 15.23 => 15,23
 */
export let coma = str => {
  if(!str) return null;

  return String(str).replace(/\./, ',');
}


/**
 * 10500.50 => 10 000,50
 */
export let localeNumber = value => {
  let numberValue = financial(value);
  return numberValue.toLocaleString('ru', {minimumFractionDigits: 2});
  // return numberValue.toLocaleString();
}
