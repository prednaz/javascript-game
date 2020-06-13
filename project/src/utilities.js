// @flow

// argument must not be empty
const last = <T>(array: Array<T>): T => array[array.length - 1];

module.exports = {last};
