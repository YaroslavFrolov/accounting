import React, { useState } from 'react';
import { TabContent } from 'utils/TabContent';
import { PageDeclaration } from 'components/PageDeclaration';
import { PageExample } from 'components/PageExample';
import styles from './Layout.module.scss';

export let Layout = () => {
  let [activeTab, setActiveTab] = useState('declaration');

  let showTab = name => () => {
    setActiveTab(name);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button onClick={showTab('declaration')}>declaration</button>
        <button onClick={showTab('example')}>example</button>
      </header>
      <main className={styles.main}>
        <TabContent activeTab={activeTab}>
          <PageDeclaration tabName='declaration' />
          <PageExample tabName='example' />
        </TabContent>
      </main>
      <footer className={styles.footer}>footer</footer>
    </div>
  );
};
