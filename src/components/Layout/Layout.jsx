import React, { useState } from 'react';
import { TabContent } from 'utils/TabContent';
import { PageDeclaration } from 'components/PageDeclaration';
import { PageExample } from 'components/PageExample';
import { PageAnotherTab } from 'components/PageAnotherTab';
import styles from './Layout.module.scss';



export let Layout = () => {
  let [activeTab, setActiveTab] = useState('declaration');

  let showTab = name => () => {
    setActiveTab(name);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <ul className={styles.nav}>
          <li><button onClick={showTab('declaration')} className={activeTab === 'declaration' && styles.active}>Расчитать декларацию</button></li>
          <li><button onClick={showTab('example')} className={activeTab === 'example' && styles.active}>Просто пример</button></li>
          <li><button onClick={showTab('anotherTab')} className={activeTab === 'anotherTab' && styles.active}>Другая закладка</button></li>
        </ul>
      </header>
      <main className={styles.main}>
        <TabContent activeTab={activeTab}>
          <PageDeclaration tabName='declaration' />
          <PageExample tabName='example' />
          <PageAnotherTab tabName='anotherTab' />
        </TabContent>
      </main>
      <footer className={styles.footer}>footer</footer>
    </div>
  );
};
