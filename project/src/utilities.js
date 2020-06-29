// @flow

const R = require("ramda");

// argument must not be empty
const last = <T>(array: Array<T>): T => array[array.length - 1];

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

module.exports = {
    last,
    map_of_pairs,
    resources_get
};
