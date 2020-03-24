import React, { createRef } from 'react';
import XLSX from 'xlsx';
import { DownloadButton } from 'components/DownloadButton';
import { WSDeclaration } from './WSDeclaration';
import { AskRatesPopup } from './AskRatesPopup';
import { calculateDeclaration } from 'calculating/declaration/calculateDeclaration';
import { getAllCountries } from 'calculating/declaration/getAllCountries';
import { TabContent } from 'utils/TabContent';
import input__xlsx from './input__Argix_4Q_2019.xlsx';
import output__xlsx from './output__Argix_Declaration_4Q .xlsx';
import styles from './PageDeclaration.module.scss';


export class PageDeclaration extends React.Component {
  constructor(props) {
    super(props);
    this.inputFile = createRef();
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

  handleClosePopup = e => {
    this.inputFile.current.value = '';
    this.setState({
      isOpenPopup: false,
      exelDataObj: {},
      countriesRate: {},
    });
  };

  render () {
    let WSnames = Object.keys(this.state.declarationData);
    let isShowDownloadBtn = (WSnames.length > 0) && WSnames.every(month => {
      return this.state.renderedTabs[month];
    });

    return (
      <div>
        <div className={styles.description}>
          <h1>Расчёт декларации</h1>
          <p><a href={input__xlsx} download>Такой</a> пример файла необходимо подать на вход. И <a href={output__xlsx} download>такой</a> вы получите после расчётов.</p>
          <p>Важно, чтобы у входного файла был лист с названием "DB" с такой же структурой столбцов как в примере выше.</p>
          <p className={styles.hint}>Раньше бухгалтер удалял минусовые страны, и руками подбирал значения netSale таким образом, чтобы суммы netSale до и после удаления минусовых стран были строго равны. А суммы tax до и после удаления минусовых стран, различались максимум на 0,03. Сейчас же - эту рутину делает программа.</p>

          {WSnames.length > 0 || (
            <div className={styles.chooseWrapper}>
              <h2>Выберите файл .xlsx для расчёта</h2>
              <label htmlFor='openFile'>Добавить файл ...</label>
              <input type="file" onChange={this.handleFile} id='openFile' ref={this.inputFile} />
            </div>
          )}
        </div>
        <div className={styles.tabs}>
          {WSnames.length > 0 && WSnames.map(name => {
            let isActive = name === this.state.activeTab ? styles.activeTab : '';

            return (
              <button
                onClick={this.setActiveTab(name)}
                key={name}
                className={`${styles.tab} ${isActive}`}
              >
                {name}
              </button>
            );
          })}

          {isShowDownloadBtn && (
            <DownloadButton
              wb={this.wb}
              name='table-for-darling.xlsx'
              className={styles.downloadBtn}
            >
              скачать эту табличку
            </DownloadButton>
          )}
        </div>
        <TabContent activeTab={this.state.activeTab}>
          {WSnames.map(name=>{
            let ws = this.state.declarationData[name];
            return (
              <WSDeclaration WSdata={ws} month={name} key={name} saveRef={this.saveRef} tabName={name} />
            );
          })}
        </TabContent>
        <AskRatesPopup
          isOpen={this.state.isOpenPopup}
          setNewRates={this.setNewRates}
          countriesRate={this.state.countriesRate}
          onClose={this.handleClosePopup}
        />
      </div>
    );
  }
};
