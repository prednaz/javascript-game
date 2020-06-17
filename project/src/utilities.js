// @flow

// argument must not be empty
const last = <T>(array: Array<T>): T => array[array.length - 1];

class Int {
    number: number;
    constructor(number: number): void {
        if (!Number.isInteger(number)) {
            throw new RangeError("The argument must be an integer between -2^53 and 2^53.");
        }
        this.number = number;
    }
}

const round = (number: number): Int => new Int(Math.round(number));

const multiply_int = (factor1: Int, factor2: Int): Int => new Int(factor1.number * factor2.number);

module.exports = {last, Int, round, multiply_int};
