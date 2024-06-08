import React from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <AppProvider>
      <Header />
      <main>
        <div className='container'>
          <Component {...pageProps} />
        </div>
      </main>
      <Footer />
    </AppProvider>
  );
};

export default MyApp;
