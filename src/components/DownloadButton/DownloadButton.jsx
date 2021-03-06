import React from 'react';
import { saveAs } from 'file-saver';
import XLSX from 'xlsx';
import styles from './DownloadButton.module.scss';


export let DownloadButton = props => {
  let { wb, name, children, className } = props;

  let download = () => {
    var wbout = XLSX.write(wb, { bookType:'xlsx', bookSST:false, type:'array' });
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), name);
  };

  return (
    <button onClick={download} className={`${styles.button} ${className}`}>{children || 'скачать .xlsx'}</button>
  );
};
