import React from 'react';
import XLSX from 'xlsx';
import { DownloadButton } from 'components/DownloadButton';
import { WSDeclaration } from './WSDeclaration';
import { AskRatesPopup } from './AskRatesPopup';
import { calculateDeclaration } from 'calculating/declaration/calculateDeclaration';
import { getAllCountries } from 'calculating/declaration/getAllCountries';
import { TabContent } from 'utils/TabContent';


export class PageDeclaration extends React.Component {
  constructor(props) {
    super(props);
    this.wb = XLSX.utils.book_new();
    this.state = {
      exelDataObj: {},
      declarationData: {},
      renderedTabs: {},
      activeTab: null,
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

  saveRef = (table, month) => {
    if(this.wb.Sheets[month]) {
      return null;
    }

    let ws = XLSX.utils.table_to_sheet(table);

    this.wb.SheetNames.push(month)
    this.wb.Sheets[month] = ws;

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
                <WSDeclaration WSdata={ws} month={name} key={name} saveRef={this.saveRef} tabName={name} />
              );
            })}
          </TabContent>
          {isShowDownloadBtn && <DownloadButton wb={this.wb} name='table-for-darling.xlsx' >скачать табличку .xlsx</DownloadButton>}
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
