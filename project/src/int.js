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

const round = (number: number): Int => new Int(Math.round(number));

const multiply_int =
    (factor1: Int, factor2: Int): Int => new Int(factor1.number * factor2.number);

module.exports = {
    Int,
    round,
    multiply_int
};
