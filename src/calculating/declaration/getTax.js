import { financial } from 'calculating/helpers.js';

export let getTax = (netSale, rate) => {
  return financial(netSale * rate / (100 + rate));
}
