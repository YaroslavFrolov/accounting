import React from 'react';
import XLSX from 'xlsx';
import { DownloadButton } from 'components/DownloadButton/DownloadButton.jsx';
import { WSDeclaration } from 'components/Tables/WSDeclaration.jsx';
import { calculateDeclaration } from 'calculating/calculateDeclaration.js';
import 'styles/index.scss';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.table1 = React.createRef();
    this.table2 = React.createRef();
    this.state = {
      wb: null,
      name: '',
      declarationData: {},
      activeTab: null
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

      let declarationData = calculateDeclaration(result);
      let ws1Name = Object.keys(declarationData)[0];

      this.setState({
        declarationData,
        activeTab: ws1Name
      });
    };

    if (rABS) {
      reader.readAsBinaryString(f);
    } else {
      reader.readAsArrayBuffer(f);
    }

    return false;
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

  render () {
    let wsList = []

    for (let [WSname, data] of Object.entries(this.state.declarationData)) {
      wsList.push({
        WSname,
        data
      });
    };

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
          <table ref={this.table2}>
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
          <DownloadButton {...this.state} />
          <br/>
          <br/>
          <br/>
          <div>
            {wsList.length > 0 && wsList.map((item, idx)=>{
              return (
                <button onClick={this.setActiveTab(item.WSname)} key={idx}>{item.WSname}</button>
              );
            })}
          </div>
          <TabContent activeTab={this.state.activeTab}>
            {wsList.map((item, idx)=>{
              return (
                <WSDeclaration WSdata={item.data} name={item.WSname} key={idx} />
              );
            })}
          </TabContent>
        </div>
      </div>
    );
  }
};


let TabContent = props => {
  return props.children.map(child=>{
    if( child.props.name !== props.activeTab ) return null;

    return child;
  })
};