import React from 'react';
import XLSX from 'xlsx';
import { DownloadButton } from 'components/DownloadButton';


export class PageExample extends React.Component {
  constructor(props) {
    super(props);
    this.table1 = React.createRef();
    this.table2 = React.createRef();
    this.wb = XLSX.utils.book_new();
    this.name = 'test-table.xlsx';
  }

  componentDidMount = () => {
    let ws1 = XLSX.utils.table_to_sheet(this.table1.current);
    let ws2 = XLSX.utils.table_to_sheet(this.table2.current);

    this.wb.SheetNames.push('name-1')
    this.wb.Sheets['name-1'] = ws1;

    this.wb.SheetNames.push('name-2')
    this.wb.Sheets['name-2'] = ws2;
  };


  render () {
    return (
      <div>
        <table ref={this.table1}>
          <caption>my table 1</caption>
          <thead>
            <tr>
              <td>col-1</td>
              <td>col-2</td>
              <td>col-3</td>
              <td>col-4</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>value-1</td>
              <td>value-2</td>
              <td>0.100545752</td>
              <td>value-4</td>
            </tr>
            <tr>
              <td>value-1</td>
              <td>value-2</td>
              <td>value-3</td>
              <td>value-4</td>
            </tr>
            <tr>
              <td colSpan='2'>value-1</td>
              {/* <td>value-2</td> */}
              <td>value-3</td>
              <td>value-4</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>footer-1</td>
              <td>footer-2</td>
              <td>footer-3</td>
              <td>footer-4</td>
            </tr>
          </tfoot>
        </table>
        <br/>
        <br/>
        <br/>
        <div ref={this.table2}>
          <table>
            <caption>my table 2</caption>
            <thead>
              <tr>
                <td>col-1</td>
                <td>col-2</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>value-1</td>
                <td>value-2</td>
              </tr>
              <tr>
                <td>value-1</td>
                <td>value-2</td>
              </tr>
              <tr>
                <td>value-1</td>
                <td>value-2</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>footer-1</td>
                <td>footer-2</td>
              </tr>
            </tfoot>
          </table>
          <br/>
          <br/>
          <br/>
          <table>
            <thead>
              <tr>
                <td>col-inner</td>
                <td>col-inner</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>value-inner</td>
                <td>value-inner</td>
              </tr>
              <tr>
                <td>value-inner</td>
                <td>value-inner</td>
              </tr>
              <tr>
                <td>value-inner</td>
                <td>value-inner</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>footer-inner</td>
                <td>footer-inner</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <DownloadButton wb={this.wb} name={this.name} />
        <br/>
        <br/>
        <br/>
      </div>
    );
  }
};
