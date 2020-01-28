import React from 'react';
import { financial } from 'calculating/helpers.js';


export let WSDeclaration = props => {
  const { WSdata, name } = props;

  if(!Array.isArray(WSdata)) {
    console.log(`WSDeclaration[${name}] - no data`);
    return null;
  }

  const data = WSdata || [];

  let sortData = data
    .concat() //copy array before sorting, because .sort() is muttable method
    .sort(function(a, b){
      if (a.type === 'EU') {
        return -1;
      } else {
        return 1;
      }
    });

  return (
    <>
      <table>
        <thead>
          <tr>
            <td>SALES</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>Ref</td>
            <td>Inv #</td>
            <td>Date</td>
            <td>Counterparty</td>
            <td>Amount as per Invoice</td>
            <td>Basis for VAT</td>
            <td>Monthly Rate</td>
            <td>Amount in EUR</td>
            <td>Goods/Services</td>
            <td>Country</td>
            <td>EU/Non EU</td>
            <td>VAT Number</td>
            <td>Rate</td>
            <td>Tax</td>
          </tr>
        </thead>
        <tbody>
          {sortData.map((row, idx) => {
            let { netSale, basis_for_VAT, name, type, rate, tax } = row || {};
            netSale = financial(netSale / 100);
            basis_for_VAT = financial(basis_for_VAT / 100);
            tax = financial(tax / 100);

            const style = {
              backgroundColor: netSale < 0 ? 'red' : '',
              color: netSale < 0 ? 'white' : '',
            };

            return (
              <tr key={idx}>
                <td>{idx+1}</td>
                <td>-</td>
                <td>-</td>
                <td>Individuals</td>
                <td style={style}>{netSale}</td>{/* С НДС */ }
                <td>{basis_for_VAT}</td>{/* без НДС */ }
                <td>1.0000</td>
                <td>{netSale}</td>
                <td>Service</td>
                <td>{name}</td>
                <td>{type}</td>
                <td>n/a</td>
                <td>{rate}</td>{/* СТАВКА НДС */ }
                <td>{tax}</td>{/* НДС к оплате */ }
              </tr>
            );
          })}
        </tbody>
        {/* <tfoot>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>820873.32</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>31395.88</td>
          </tr>
        </tfoot> */}
      </table>
    </>
  );
};
