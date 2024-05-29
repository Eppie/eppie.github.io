import React from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import { AppProvider } from '../context/AppContext';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
};

export default MyApp;
