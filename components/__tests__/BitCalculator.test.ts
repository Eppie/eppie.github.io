import {operate, precedence, toBinaryString, tokenize, infixToPostfix, evaluatePostfix} from '../BitCalculator';

describe('Bitwise Calculator Functions', () => {
    describe('operate', () => {
        it('should perform bitwise AND correctly', () => {
            expect(operate(5, 3, '&')).toBe(1);
        });

        it('should perform bitwise OR correctly', () => {
            expect(operate(5, 3, '|')).toBe(7);
        });

        it('should perform bitwise XOR correctly', () => {
            expect(operate(5, 3, '^')).toBe(6);
        });

        it('should perform bitwise NOT correctly', () => {
            expect(operate(5, 0, '~')).toBe(-6);
        });

        it('should perform left shift correctly', () => {
            expect(operate(5, 2, '<<')).toBe(20);
        });

        it('should perform right shift correctly', () => {
            expect(operate(5, 2, '>>')).toBe(1);
        });

        it('should throw an error for unsupported operators', () => {
            expect(() => operate(5, 3, '+')).toThrowError('Unsupported operator: +');
        });
    });

    describe('precedence', () => {
        it('should return the correct precedence for OR', () => {
            expect(precedence('|')).toBe(1);
        });

        it('should return the correct precedence for XOR', () => {
            expect(precedence('^')).toBe(2);
        });

        it('should return the correct precedence for AND', () => {
            expect(precedence('&')).toBe(3);
        });

        it('should return the correct precedence for left/right shift', () => {
            expect(precedence('<<')).toBe(4);
            expect(precedence('>>')).toBe(4);
        });

        it('should return the correct precedence for NOT', () => {
            expect(precedence('~')).toBe(5);
        });

        it('should return 0 for unknown operators', () => {
            expect(precedence('+')).toBe(0);
        });
    });

    describe('toBinaryString', () => {
        it('should convert a number to a binary string with padding', () => {
            expect(toBinaryString(5)).toBe('00000101');
            expect(toBinaryString(15)).toBe('00001111');
            expect(toBinaryString(255)).toBe('11111111');
            expect(toBinaryString(256)).toBe('0000000100000000');
        });
    });

    describe('tokenize', () => {
        it('should tokenize a simple expression', () => {
            expect(tokenize('5 & 3')).toEqual(['5', '&', '3']);
        });

        it('should handle parentheses', () => {
            expect(tokenize('(5 & 3) | 2')).toEqual(['(', '5', '&', '3', ')', '|', '2']);
        });

        it('should handle complex expressions', () => {
            expect(tokenize('5 << 2 | 3 ^ ~1')).toEqual(['5', '<<', '2', '|', '3', '^', '~', '1']);
        });

        it('should handle hexadecimal and binary numbers', () => {
            expect(tokenize('0x7b & 0b1101')).toEqual(['123', '&', '13']);
        });

        it('should handle single character variables as ASCII codes', () => {
            expect(tokenize('A | B')).toEqual(['65', '|', '66']);
        });
    });

    describe('infixToPostfix', () => {
        it('should convert a simple infix expression to postfix', () => {
            expect(infixToPostfix(['5', '&', '3'])).toEqual(['5', '3', '&']);
        });

        it('should handle parentheses correctly', () => {
            expect(infixToPostfix(['(', '5', '&', '3', ')', '|', '2'])).toEqual(['5', '3', '&', '2', '|']);
        });

        it('should handle operator precedence correctly', () => {
            expect(infixToPostfix(['5', '<<', '2', '|', '3', '^', '~', '1'])).toEqual(['5', '2', '<<', '3', '1', '~', '^', '|']);
        });
    });

    describe('evaluatePostfix', () => {
        it('should evaluate a simple postfix expression', () => {
            expect(evaluatePostfix(['5', '3', '&'])).toEqual([
                {operator: "", value: 5, binary: "00000101"},
                {operator: "&", value: 3, binary: "00000011"},
                {operator: "=", value: 1, binary: "00000001"}
            ]);
        });

        it('should handle complex expressions', () => {
            const result = evaluatePostfix(['5', '2', '<<', '3', '1', '~', '^', '|']);
            expect(result[result.length - 1]).toEqual({operator: '=', value: 23, binary: '00010111'});
        });

        it('should throw an error for invalid expressions', () => {
            expect(() => evaluatePostfix(['5', '&'])).toThrowError("Invalid expression: missing operands for '&' operator");
            expect(() => evaluatePostfix(['~'])).toThrowError("Invalid expression: missing operand for '~' operator");
        });
    });
});