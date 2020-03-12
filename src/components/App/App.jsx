import React from 'react';
import XLSX from 'xlsx';
import { DownloadButton } from 'components/DownloadButton/DownloadButton.jsx';
import { WSDeclaration } from 'components/Declaration/WSDeclaration.jsx';
import { AskRatesPopup } from 'components/Declaration/AskRatesPopup.jsx';
import { calculateDeclaration } from 'calculating/declaration/calculateDeclaration.js';
import { getAllCountries } from 'calculating/declaration/getAllCountries.js';

import 'styles/index.scss';


export class App extends React.Component {
  constructor(props) {
    super(props);
    this.table1 = React.createRef();
    this.table2 = React.createRef();
    this.wb2 = XLSX.utils.book_new();
    this.state = {
      wb: null,
      name: '',
      exelDataObj: {},
      declarationData: {},
      renderedTabs: {},
      activeTab: null,
      // countriesRate: {
      //   Austria: 20,
      //   Denmark: 25,
      //   Belgium: 6,
      //   Bulgaria: 20,
      //   Germany: 19,
      //   Finland: 10,
      //   France: 2.1,
      //   Italy: 4,
      //   Netherlands: 21,
      //   Portugal: 6,
      //   Sweden: 6,
      //   Spain: 21,
      //   'United Kingdom': 20
      // },
      // countriesRate: {
      //   Austria: 20,
      //   Belgium: 6,
      //   Germany: 7,
      //   France: 2.1,
      //   Italy: 4,
      //   Portugal: 6,
      //   Spain: 21,
      //   'United Kingdom': 20
      // },
      countriesRate: {},
      isOpenPopup: false
    };
  }

  setActiveTab = name => () => {
    this.setState({ activeTab: name });
  };

  handleFile = e => {
    let files = e.target.files;
    let f = files[0];
    let reader = new FileReader();
    let rABS = true;
    let result = {};

    reader.onload = e => {
      let data = e.target.result;

      let workbook = XLSX.read(data, {
        type: rABS ? 'binary' : 'array'
      });

      workbook.SheetNames.forEach((sheetName, idx) => {
        let worksheet = workbook.Sheets[workbook.SheetNames[idx]];
        let json = XLSX.utils.sheet_to_json(worksheet, {header:1});
        result[sheetName] = json;
      });

      let allCountries = getAllCountries(result);

      this.setState({
        exelDataObj: result,
        isOpenPopup: true,
        countriesRate: allCountries,
      });
    };

    if (rABS) {
      reader.readAsBinaryString(f);
    } else {
      reader.readAsArrayBuffer(f);
    }

    return false;
  };

  setNewRates = countriesRate => {
    let declarationData = calculateDeclaration(this.state.exelDataObj, countriesRate);
    let ws1Name = Object.keys(declarationData)[0];

    this.setState({
      isOpenPopup: false,
      activeTab: ws1Name,
      countriesRate,
      declarationData,
    });
  };

  componentDidMount = () => {
    let wb = XLSX.utils.book_new();

    let ws1 = XLSX.utils.table_to_sheet(this.table1.current);
    let ws2 = XLSX.utils.table_to_sheet(this.table2.current);

    wb.SheetNames.push('name-1')
    wb.Sheets['name-1'] = ws1;

    wb.SheetNames.push('name-2')
    wb.Sheets['name-2'] = ws2;

    this.setState({
      wb,
      name: 'test!!!!.xlsx'
    });
  };

  saveRef = (table, month) => {
    if(this.wb2.Sheets[month]) {
      return null;
    }

    let ws = XLSX.utils.table_to_sheet(table);

    this.wb2.SheetNames.push(month)
    this.wb2.Sheets[month] = ws;

    this.setState(prevState => ({
      ...prevState,
      renderedTabs: {
        ...prevState.renderedTabs,
        [month]: true,
      }
    }));
  };

  render () {
    let WSnames = Object.keys(this.state.declarationData);
    let isShowDownloadBtn = (WSnames.length > 0) && WSnames.every(month => {
      return this.state.renderedTabs[month];
    });

    return (
      <div>
        <input type="file" onChange={this.handleFile} />
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
          <DownloadButton {...this.state} />
          <br/>
          <br/>
          <br/>
          <div>
            {WSnames.length > 0 && WSnames.map(name=>{
              return (
                <button onClick={this.setActiveTab(name)} key={name}>{name}</button>
              );
            })}
          </div>
          <h1>{this.state.activeTab}</h1>
          <TabContent activeTab={this.state.activeTab}>
            {WSnames.map(name=>{
              let ws = this.state.declarationData[name];
              return (
                <WSDeclaration WSdata={ws} month={name} key={name} saveRef={this.saveRef} />
              );
            })}
          </TabContent>
          {isShowDownloadBtn && <DownloadButton wb={this.wb2} name='tableeee.xlsx' >скачать табличку .xlsx</DownloadButton>}
        </div>
        <AskRatesPopup
          isOpen={this.state.isOpenPopup}
          setNewRates={this.setNewRates}
          countriesRate={this.state.countriesRate}
        />
      </div>
    );
  }
};


let TabContent = props => {
  return props.children.map(child=>{
    if( child.props.month !== props.activeTab ) return null;

    return child;
  })
};
