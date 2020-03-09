/**
 * 123.45628 => 123.4563
 * 0.00004 => 0.0000
 * 1.23e+5 => 123000.0000
 */
export let financial = value => {
  return +Number.parseFloat(value).toFixed(4);
}


/**
 * 15.23 => 15,23
 */
export let coma = str => {
  if(!str) return null;

  return String(str).replace(/\./, ',');
}


/**
 * 10500.50 => 10 000,5000
 */
export let localeNumber = value => {
  let numberValue = financial(value);
  return numberValue.toLocaleString('ru', {minimumFractionDigits: 4});
  // return numberValue.toLocaleString();
}
