import React, { useEffect, useRef } from 'react';
import { financial, localeNumber } from 'calculating/helpers.js';


export let WSDeclaration = props => {
  let { WSdata, month, saveRef } = props;
  let { countries, totalNetSaleBefore, totalTaxBefore, totalNetSaleAfter, totalTaxAfter, totalNetSale_EU, totalNetSale_nonEU } = WSdata;
  let tableElement = useRef(null);

  useEffect(() => {
    saveRef(tableElement.current, month);
  }, [month]);

  if(!Array.isArray(countries)) {
    console.log(`WSDeclaration[${month}] - no data`);
    return null;
  }




  let diffNetSale = financial(financial(totalNetSaleBefore/100) - financial(totalNetSaleAfter/100));
  let diffTax = financial(financial(totalTaxAfter/100) - financial(totalTaxBefore/100));

  totalNetSaleBefore = localeNumber(totalNetSaleBefore / 100);
  totalTaxBefore = localeNumber(totalTaxBefore / 100);
  totalNetSaleAfter = localeNumber(totalNetSaleAfter / 100);
  totalTaxAfter = localeNumber(totalTaxAfter / 100);
  totalNetSale_EU = localeNumber(totalNetSale_EU / 100);
  totalNetSale_nonEU = localeNumber(totalNetSale_nonEU / 100);

  let sortData = countries
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
      <table ref={tableElement} id='tablexxx'>
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

            // let str = String(netSale / 100);
            // let arr = str.split('.');
            // let afterComma = arr[1];
            // if (afterComma && afterComma.length > 2) {
            //   afterComma = afterComma.slice(0, 2);
            //   netSale = `${arr[0]}.${afterComma}`;
            // }


            const netSaleStyle = {
              backgroundColor: netSale < 0 ? 'red' : '',
              color: netSale < 0 ? 'white' : '',
            };

            const lowNetSaleStyle = {
              backgroundColor: netSale < 0.01 ? '#dedcf1' : '',
            };

            /**
             * comma() - нужны строки с запятыми без пробелов, чтобы при копировании в гугл-таблицы - таблица
             * корректно воспринимала данные и могла с ними обращаться как с числами (суммировать при выделении и т.д.).
             */

            return (
              <tr key={idx} style={lowNetSaleStyle}>
                <td>{idx+1}</td>
                <td>-</td>
                <td>-</td>
                <td>Individuals</td>
                <td style={netSaleStyle}>{netSale}</td>{/* С НДС */ }
                <td>{basis_for_VAT}</td>{/* без НДС */ }
                <td>{String('1.0000')}</td>
                <td>{netSale}</td>
                <td>Service</td>
                <td>{name}</td>
                <td>{type}</td>
                <td>n/a</td>
                <td>{rate || '-'}</td>{/* СТАВКА НДС */ }
                <td>{tax || '-'}</td>{/* НДС к оплате */ }
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{fontWeight: 'bold'}}>result sum {totalNetSaleAfter}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{fontWeight: 'bold'}}>result sum {totalTaxAfter}</td>
          </tr>
          <tr style={{height: '1em'}}>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
          </tr>
          <tr style={{height: '1em'}}></tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{fontWeight: 'bold'}}>initial sum {totalNetSaleBefore}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{fontWeight: 'bold'}}>initial sum {totalTaxBefore}</td>
          </tr>
          <tr style={{height: '1em'}}>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{textAlign: 'right'}}>diff {diffNetSale}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{textAlign: 'right'}}>diff {diffTax}</td>
          </tr>
          <tr style={{height: '1em'}}>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
            <td rowSpan='2'>{null}</td>
          </tr>
          <tr style={{height: '1em'}}></tr>
          <tr>
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
            <td>VAT</td>
            <td>TOTAL</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>Total EU SALES (Services)</td>
            <td style={{fontWeight: 'bold'}}>€ {totalNetSale_EU}</td>
            <td style={{fontWeight: 'bold'}}>€ {totalTaxAfter}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>Total NON EU SALES (Services)</td>
            <td style={{fontWeight: 'bold'}}>€ {totalNetSale_nonEU}</td>
            <td>-</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>Total Local Sales</td>
            <td style={{fontWeight: 'bold'}}>€ 0.00</td>
            <td>-</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>Total EU SALES (Goods)</td>
            <td style={{fontWeight: 'bold'}}>€ 0.00</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>Total NON EU SALES (Goods)</td>
            <td style={{fontWeight: 'bold'}}>€ 0.00</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
          <tr>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>Total</td>
            <td style={{fontWeight: 'bold'}}>€ {totalNetSaleAfter}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
            <td>{null}</td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};
