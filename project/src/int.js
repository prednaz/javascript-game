// @flow

const {immerable} = require("immer");

class Int {
    +number: number;
    constructor(number: number): void {
        if (!Number.isInteger(number)) {
            throw new RangeError("The argument must be an integer between -2^53 and 2^53.");
        }
        this.number = number;
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Int[immerable] = true;

const equals = (int1: Int, int2: Int): boolean => int1.number === int2.number;
const less_or_equals = (int1: Int, int2: Int): boolean => int1.number <= int2.number;
const less = (int1: Int, int2: Int): boolean => int1.number < int2.number;

const floor = (number: number): Int => new Int(Math.floor(number));
const ceil = (number: number): Int => new Int(Math.ceil(number));
const round = (number: number): Int => new Int(Math.round(number));

const add =
    (summand1: Int, summand2: Int): Int => new Int(summand1.number + summand2.number);
const subtract =
    (minuend: Int, subtrahend: Int): Int => new Int(minuend.number - subtrahend.number);

const one = new Int(1);
const predecessor = (int: Int): Int => subtract(int, one);
const successor = (int: Int): Int => add(int, one);

const multiply =
    (factor1: Int, factor2: Int): Int => new Int(factor1.number * factor2.number);

const modulo =
    (dividend: Int, divisor: Int): Int => new Int(dividend.number % divisor.number);

const absolute = (int: Int): Int => new Int(Math.abs(int.number));
const even = (int: Int): boolean => int.number % 2 === 0;

module.exports = 
    {
        Int,
        equals,
        less_or_equals,
        less,
        floor,
        ceil,
        round,
        add,
        subtract,
        predecessor,
        successor,
        multiply,
        modulo,
        absolute,
        even
    };
