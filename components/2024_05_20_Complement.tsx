import React, { Fragment, useState, ChangeEvent, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '../styles/Complement.module.css'

function stringToBinary(inputString: string): string {
  if (inputString.length > 4) {
    throw new Error('Input string must be 4 characters or less.');
  }

  const padToEightBits = (binaryString: string): string => {
    return binaryString.padStart(8, '0');
  };

  let binaryResult = '';
  for (let i = 0; i < inputString.length; i++) {
    const binaryString = inputString.charCodeAt(i).toString(2);
    binaryResult += padToEightBits(binaryString);
  }

  // Pad the result to 32 bits if the input string is less than 4 characters
  const totalLength = inputString.length * 8;
  if (totalLength < 32) {
    binaryResult = binaryResult.padEnd(32, '0');
  }

  return binaryResult;
}

const convertToBinary = (str: string): string => {
  try {
    return stringToBinary(str);
  } catch (error) {
    return (error as Error).message;
  }
};

interface HighlightBinaryDigitsProps {
  binaryDigits: string;
  colorMap: { [key: number]: string };
}

const HighlightBinaryDigits: React.FC<HighlightBinaryDigitsProps> = ({
  binaryDigits,
  colorMap,
}) => {
  const [previousDigits, setPreviousDigits] = useState<string[]>([]);
  const [digitArray, setDigitArray] = useState<string[]>([]);
  const [changedIndices, setChangedIndices] = useState<number[]>([]);

  useEffect(() => {
    const newDigitArray = binaryDigits.split('');
    setDigitArray(newDigitArray);

    const changes: number[] = [];
    newDigitArray.forEach((digit, index) => {
      if (previousDigits[index] !== digit) {
        changes.push(index);
      }
    });

    setChangedIndices(changes);
    setPreviousDigits(newDigitArray);

    // Remove the animation class after the animation is done
    const timer = setTimeout(() => setChangedIndices([]), 1000); // Match the duration of your CSS animation

    return () => clearTimeout(timer);
  }, [binaryDigits]);

return (
    <div className={styles.container}>
      {digitArray.map((digit, index) => (
        <Fragment key={index}>
          {index % 8 === 0 && index !== 0 && (
            <span className={styles.separator}>|</span>
          )}
          <div className={styles['digit-container']}>
            <span
              className={`${styles.digit} ${changedIndices.includes(index) ? styles.flap : ''} ${styles['dynamic-background']}`}
              style={{
                backgroundColor: colorMap[index]
                  ? `#${colorMap[index]}`
                  : 'transparent',
              }}
            >
              {digit}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
};


function binaryAnd(str1: string, str2: string): string {
  // Ensure both strings are of the same length
  if (str1.length !== str2.length) {
    throw new Error('Both strings must be of the same length');
  }

  let result = '';

  // Perform the AND operation character by character
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] === '1' && str2[i] === '1') {
      result += '1';
    } else {
      result += '0';
    }
  }

  return result;
}

function bitShiftRight(str: string, positions: number): string {
  // Perform the right shift by adding '0's at the start and removing characters from the end
  if (positions >= str.length) {
    return '0'.repeat(str.length);
  }

  return '0'.repeat(positions) + str.slice(0, str.length - positions);
}

function binaryOr(str1: string, str2: string): string {
  // Ensure both strings are of the same length
  if (str1.length !== str2.length) {
    throw new Error('Both strings must be of the same length');
  }

  let result = '';

  // Perform the OR operation character by character
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] === '1' || str2[i] === '1') {
      result += '1';
    } else {
      result += '0';
    }
  }

  return result;
}

const Complement = () => {
  const [text, setText] = useState('ACTG');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const input: string = e.target.value.toUpperCase();
    if (/^[ACTG]*$/.test(input) && input.length <= 4) {
      setText(input);
    }
  };

  const mask: string = '00000110000001100000011000000110';
  const color1: string = 'ADD8E6';
  const color2: string = '90EE90';
  const color3: string = 'F08080';
  const color4: string = 'FFAAE0';
  const x1: string = binaryAnd(convertToBinary(text), mask);
  const x2: string = bitShiftRight(x1, 1);
  const x3: string = binaryOr(bitShiftRight(x2, 14), x2);
  const x4: string = binaryOr(bitShiftRight(x3, 4), x3);
  const codeString: string = `void dnaComplement(char *inputDNA, int length) {
        for (int i = 0; i < length; ++i) {
            switch (inputDNA[i]) {
            case 'A':
                inputDNA[i] = 'T';
                break;
            case 'T':
                inputDNA[i] = 'A';
                break;
            case 'C':
                inputDNA[i] = 'G';
                break;
            case 'G':
                inputDNA[i] = 'C';
                break;
            default:
                break;
            }
        }
    }`;
  const codeString2: string = `static const char *arr[256] = {
        "TTTT", /* omitted for brevity */ "CCCC"};
        
    uint8_t toIndex(uint32_t input) {
        const uint32_t MASK = 0x06060606;
        auto x1 = input & MASK;
        auto x2 = x1 >> 1;
        auto x3 = x2 | (x2 >> 14);
        auto x4 = x3 | (x3 >> 4);
        return x4;
    }
    
    __attribute__((noinline)) void dnaComplement(char *inputDNA, int length) {
        for (int i = 0; i < length; i += 4) {
            uint32_t input = *(uint32_t *)(inputDNA + i);
            uint8_t index = toIndex(input);
            const char *complement = arr[index];
            *(uint32_t *)(inputDNA + i) = *(uint32_t *)complement;
        }
    }`;

  return (
      <div style={{padding: '20px'}}>
          <h1>Fast DNA Complement Function</h1>
          <p>
              In the course of manipulating genomic data, it is often desirable to
              compute the &quot;complement&quot; of a given sequence.
          </p>
          <h3>Naive approach:</h3>
          <SyntaxHighlighter language='cpp' style={darcula}>
              {codeString}
          </SyntaxHighlighter>
          <h3>This approach:</h3>
          <SyntaxHighlighter language='cpp' style={darcula}>
              {codeString2}
          </SyntaxHighlighter>
          <p>And here&apos;s how the `toIndex` function works:</p>
          <input
              className={styles.input}
              type='text'
              value={text}
              onChange={handleChange}
              placeholder='Enter text here'
          />
          <span>  ← DNA sequence to complement (up to 4 characters, only ACTG allowed)</span>
          <div className={styles['digit-box']}>
              <div>
                  Input:
                  <HighlightBinaryDigits
                      binaryDigits={convertToBinary(text)}
                      colorMap={{
                          5: color1,
                          6: color1,
                          13: color2,
                          14: color2,
                          21: color3,
                          22: color3,
                          29: color4,
                          30: color4,
                      }}
                  />
              </div>
              <div>
                  Mask:
                  <HighlightBinaryDigits
                      binaryDigits={mask}
                      colorMap={{
                          5: color1,
                          6: color1,
                          13: color2,
                          14: color2,
                          21: color3,
                          22: color3,
                          29: color4,
                          30: color4,
                      }}
                  />
              </div>
              <div>
                  x1 = input & mask:
                  <HighlightBinaryDigits
                      binaryDigits={x1}
                      colorMap={{
                          5: color1,
                          6: color1,
                          13: color2,
                          14: color2,
                          21: color3,
                          22: color3,
                          29: color4,
                          30: color4,
                      }}
                  />
              </div>
              <div>
                  x2 = x1 {'>>'} 1:
                  <HighlightBinaryDigits
                      binaryDigits={x2}
                      colorMap={{
                          6: color1,
                          7: color1,
                          14: color2,
                          15: color2,
                          22: color3,
                          23: color3,
                          30: color4,
                          31: color4,
                      }}
                  />
              </div>
              <div>
                  x3 = x2 | (x2 {'>>'} 14):
                  <HighlightBinaryDigits
                      binaryDigits={x3}
                      colorMap={{
                          20: color1,
                          21: color1,
                          22: color2,
                          23: color2,
                          28: color3,
                          29: color3,
                          30: color4,
                          31: color4,
                      }}
                  />
              </div>
              <div>
                  x4 = x3 | (x3 {'>>'} 4):
                  <HighlightBinaryDigits
                      binaryDigits={x4}
                      colorMap={{
                          24: color1,
                          25: color1,
                          26: color2,
                          27: color2,
                          28: color3,
                          29: color3,
                          30: color4,
                          31: color4,
                      }}
                  />
              </div>
          </div>
      </div>
  );
};

export default Complement;
