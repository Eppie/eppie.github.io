import React from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';


const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
      <MantineProvider>
    <AppProvider>
      <Header />
      <main>
        <div className='container'>
          <Component {...pageProps} />
        </div>
      </main>
      <Footer />
    </AppProvider>
    </MantineProvider>
  );
};

export default MyApp;
