import React, { useState } from 'react';
import { TabContent } from 'utils/TabContent';
import { PageDeclaration } from 'components/PageDeclaration';
import { PageExample } from 'components/PageExample';
import { PageAnotherTab } from 'components/PageAnotherTab';
import { ReactComponent as HeartIcon } from './heartIcon.svg'
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
          <li><button onClick={showTab('declaration')} className={activeTab === 'declaration' ? styles.active : ''}>Расчитать декларацию</button></li>
          <li><button onClick={showTab('example')} className={activeTab === 'example' ? styles.active : ''}>Просто пример..</button></li>
          <li><button onClick={showTab('anotherTab')} className={activeTab === 'anotherTab' ? styles.active : ''}>Другая закладка</button></li>
        </ul>
      </header>

      <main className={styles.main}>
        <TabContent activeTab={activeTab}>
          <PageDeclaration tabName='declaration' />
          <PageExample tabName='example' />
          <PageAnotherTab tabName='anotherTab' />
        </TabContent>
      </main>

      <footer className={styles.footer}>
        <div>
          <span>With love for my wife Yuliia Miahka</span>
          <HeartIcon width='24' height='24' />
        </div>
        <div>
          <p>develop by <a href='https://www.facebook.com/profile.php?id=100001423921210' target='_blank' rel='noopener noreferrer'>Yaroslav Frolov</a></p>
          <p>all rights reserved</p>
          <p>&copy; copyright</p>
        </div>
      </footer>
    </div>
  );
};
