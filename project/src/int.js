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

const predecessor = (int: Int): Int => new Int(int.number - 1);
const successor = (int: Int): Int => new Int(int.number + 1);

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
        predecessor,
        successor,
        multiply,
        modulo,
        absolute,
        even
    };
