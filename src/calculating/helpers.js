/**
 * 123.456 => 123.46
 * 0.004 => 0.00
 * 1.23e+5 => 123000.00
 */
export let financial = value => {
  return +Number.parseFloat(value).toFixed(2);
}
