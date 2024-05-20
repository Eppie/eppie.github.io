import React from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import '../styles/Header.css';
import '../styles/Footer.css';
import '../styles/App.css';
import '../styles/index.css';
import { AppProvider } from '../context/AppContext';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
};

export default MyApp;
