import React, { useState } from 'react';

export const operate = (
  left: number,
  right: number,
  operator: string
): number => {
  switch (operator) {
    case '&':
      return left & right;
    case '|':
      return left | right;
    case '^':
      return left ^ right;
    case '~':
      return ~left;
    case '<<':
      return left << right;
    case '>>':
      return left >> right;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
};

export const precedence = (operator: string): number => {
  switch (operator) {
    case '|':
      return 1;
    case '^':
      return 2;
    case '&':
      return 3;
    case '<<':
    case '>>':
      return 4;
    case '~':
      return 5;
    default:
      return 0;
  }
};

export const toBinaryString = (value: number): string => {
  let binaryString = value.toString(2);
  const length = binaryString.length;
  const bits = Math.max(8, Math.pow(2, Math.ceil(Math.log2(length))));
  return binaryString.padStart(bits, '0');
};

export const tokenize = (expr: string): string[] => {
  let tokens: string[] = [];
  let currentToken = '';
  expr = expr.replace(/0x[0-9a-fA-F]+|0b[01]+/g, (match) => {
    if (match.startsWith('0x')) {
      return parseInt(match, 16).toString(10);
    } else if (match.startsWith('0b')) {
      return parseInt(match.substring(2), 2).toString(10);
    }
    return match;
  });

  const addToken = () => {
    if (currentToken) {
      tokens.push(currentToken);
      currentToken = '';
    }
  };

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (/\d/.test(char)) {
      currentToken += char;
    } else if (/[a-zA-Z]/.test(char)) {
      addToken();
      tokens.push(char.charCodeAt(0).toString());
    } else if ('&|^~<>()>>'.includes(char)) {
      addToken();
      if (char === '>' && expr[i + 1] === '>') {
        tokens.push('>>');
        i++; // Skip next character
      } else if (char === '<' && expr[i + 1] === '<') {
        tokens.push('<<');
        i++; // Skip next character
      } else {
        tokens.push(char);
      }
    } else if (/\s/.test(char)) {
      addToken();
    } else {
      addToken();
      tokens.push(char);
    }
  }
  addToken();

  return tokens;
};
export const infixToPostfix = (tokens: string[]): string[] => {
  const output: string[] = [];
  const operators: string[] = [];
  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      output.push(token);
    } else if (/^[&|^~<<>>]+$/.test(token)) {
      while (
        operators.length &&
        precedence(operators[operators.length - 1]) >= precedence(token)
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop();
    }
  }
  while (operators.length) {
    output.push(operators.pop()!);
  }
  return output;
};

export const evaluatePostfix = (
  postfix: string[]
): Array<{ operator: string; value: number; binary: string }> => {
  const stack: number[] = [];
  const results: Array<{ operator: string; value: number; binary: string }> =
    [];

  for (const token of postfix) {
    if (/^\d+$/.test(token)) {
      stack.push(parseInt(token, 10));
    } else if (/^[&|^~<<>>]+$/.test(token)) {
      if (token === '~') {
        const a = stack.pop();
        if (a === undefined) {
          throw new Error(
            "Invalid expression: missing operand for '~' operator"
          );
        }
        const result = operate(a, 0, token);
        results.push({
          operator: token,
          value: result,
          binary: toBinaryString(result),
        });
        stack.push(result);
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) {
          throw new Error(
            `Invalid expression: missing operands for '${token}' operator`
          );
        }
        results.push({ operator: '', value: a, binary: toBinaryString(a) });
        results.push({ operator: token, value: b, binary: toBinaryString(b) });
        const result = operate(a, b, token);
        results.push({
          operator: '=',
          value: result,
          binary: toBinaryString(result),
        });
        stack.push(result);
      }
    }
  }
  if (stack.length === 1) {
    const finalValue = stack.pop()!;
    results.push({
      operator: '=',
      value: finalValue,
      binary: toBinaryString(finalValue),
    });
  }
  return results;
};

const BitCalculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [results, setResults] = useState<
    Array<{ operator: string; value: number; binary: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpression(value);
    setError(null);
    try {
      const tokens = tokenize(value);
      const postfix = infixToPostfix(tokens);
      setResults(evaluatePostfix(postfix));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults([]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bit Calculator</h1>
      <input
        type='text'
        value={expression}
        onChange={handleInputChange}
        placeholder='Enter an expression (e.g., 23|(23|45), 0x7b&0b1101, A|B)'
        style={{ padding: '10px', fontSize: '16px', width: '100%' }}
      />
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div style={{ marginTop: '20px', fontSize: '18px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ width: '20px', padding: '5px' }}>
                  {result.operator}
                </td>
                <td
                  style={{
                    width: '50px',
                    padding: '5px',
                    textAlign: 'right',
                  }}
                >
                  {!isNaN(result.value) ? result.value : ''}
                </td>
                <td style={{ padding: '5px' }}>{result.binary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BitCalculator;
