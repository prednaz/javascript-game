// @flow

const R = require("ramda");

// argument must not be empty
const last = <T>(array: Array<T>): T => array[array.length - 1];

class Int {
    +number: number;
    constructor(number: number): void {
        if (!Number.isInteger(number)) {
            throw new RangeError("The argument must be an integer between -2^53 and 2^53.");
        }
        this.number = number;
    }
}

const round = (number: number): Int => new Int(Math.round(number));

const multiply_int = (factor1: Int, factor2: Int): Int => new Int(factor1.number * factor2.number);

const map_of_pairs = <K, V>(entries: Array<[K,V]>): Map<K, V> => new Map(entries);

const resources_get: Array<string> => Map<string, HTMLElement> =
    R.compose(
        map_of_pairs,
        R.map((identifier: string): [string, HTMLElement] => {
            const dom = document.getElementById(identifier);
            if (dom === null) {
                throw new ReferenceError("Resource with id \"" + identifier + "\" is not in the HTML document");
            }
            return [identifier, dom];
        })
    );

const pairing_function =
    (n1: number, n2: number): number =>
        n1 < n2
            ? n2 * n2 + n1
            : n1 * n1 + n1 + n2 ;

module.exports = {
    last,
    Int,
    round,
    multiply_int,
    map_of_pairs,
    resources_get,
    pairing_function
};
