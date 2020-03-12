import React from 'react';
import Popup from "reactjs-popup";
import { Form, Field } from 'react-final-form';
import styles from './AskRatesPopup.module.scss';


export let AskRatesPopup = props => {
  let { isOpen, setNewRates, countriesRate } = props;

  if (!isOpen) return null;

  let countries = Object.keys(countriesRate);
  let months = Object.keys(countriesRate[countries[0]]);

  let onSubmit = values => {
    setNewRates(values);
  };

  return (
    <Popup
      open={true}
      closeOnDocumentClick={false}
      closeOnEscape={false}
    >
      <>
        <h1 className={styles.title}>Укажите Rate-ы, %</h1>
        <br/>
        <p>Десятые указывать через точку(!), например так "19.5" <br/> Знак процентов ставить не нужно.</p>
        <br/>
        <br/>
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <td>Страна \ месяц</td>
                      {months.map(month => <td key={month}>{month}</td>)}
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map(countryName=>(
                      <tr key={countryName} className={styles.fieldWrapper}>
                        <td>{countryName}</td>
                        <MonthFieldsPerCountry allCountries={countriesRate} countryName={countryName} />
                      </tr>
                    ))}
                  </tbody>
                </table>
                <br/>
                <br/>
                <button type='submit'>Далее</button>
              </form>
            );
          }}
        />
      </>
    </Popup>
  );
};



let MonthFieldsPerCountry = props => {
  let { allCountries, countryName } = props;
  let monthRates = allCountries[countryName];
  let fields = [];

  for (let month in monthRates) {
    let rate = monthRates[month];

    fields.push(
      <td key={month}>
        <Field
          name={`${countryName}.${month}`}
          component='input'
          type='text'
          initialValue={rate}
        />
      </td>
    );
  }

  return fields;
};
