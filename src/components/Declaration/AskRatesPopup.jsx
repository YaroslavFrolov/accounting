import React from 'react';
import Popup from "reactjs-popup";
import { Form, Field } from 'react-final-form';
import styles from './AskRatesPopup.module.scss';


export let AskRatesPopup = props => {
  let { isOpen, setNewRates, countriesRate } = props;

  let onSubmit = values => {
    setNewRates(values);
  };

  return (
    <Popup
      open={isOpen}
      closeOnDocumentClick={false}
      closeOnEscape={false}
    >
      <>
        <h1 className={styles.title}>Укажите Rate-ы</h1>
        <br/>
        <p>Десятые указывать через точку(!), например так "19.5" <br/> Знак процентов ставить не нужно.</p>
        <br/>
        <br/>
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {Object.keys(countriesRate).map(countryName=>(
                  <div key={countryName} className={styles.fieldWrapper}>
                    <label>{countryName}</label>
                    <Field
                      name={countryName}
                      component='input'
                      type='text'
                      initialValue={countriesRate[countryName]}
                    />
                    <span>%</span>
                  </div>
                ))}
                <br/>
                <br/>
                <button type="submit">
                  Далее
                </button>
              </form>
            );
          }}
        />
      </>
    </Popup>
  );
};
