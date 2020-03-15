import { financial } from 'calculating/helpers';

export let getTax = (netSale, rate) => {
  return financial(netSale * rate / (100 + rate));
}
