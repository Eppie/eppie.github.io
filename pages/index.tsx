import React from 'react';
import Confetti from 'react-confetti';
import {useAppState} from '../context/AppContext';

const HomePage: React.FC = () => {
    const {isFlipped, showConfetti} = useAppState();
    return (
        <div>
            {showConfetti && <Confetti/>}
            <div className={`app-container ${isFlipped ? 'flipped' : ''}`}>
                <div>
                    <h2>Home</h2>
                    <p>
                        Welcome to my personal website! I&apos;m Andrew, an experienced software engineer focused
                        on building scalable and performant systems. In my 10 year career, I&apos;ve worked with
                        Python, Java, and C++, leveraged AWS and GCP, worked with many great people, learned
                        extensively,
                        and had a lot of fun. Lately, I&apos;ve been learning React and TypeScript,
                        and working to understand large language models and how to use them productively.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
