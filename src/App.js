import React, {Fragment} from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles.css';
import TextToBinary from "./components/TextToBinary";

const App = () => {


    return (
        <Fragment>
            <Header/>
            <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                <TextToBinary/>
            </div>
            <Footer/>
        </Fragment>
    );
}

export default App;
