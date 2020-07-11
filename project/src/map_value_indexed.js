// @flow

const R = require("ramda");
const {immerable} = require("immer");

export interface HasId {
    id(): string;
}

const pairing_function_integer =
    (n1: number, n2: number): number =>
        n1 < n2
            ? n2 * n2 + n1
            : n1 * n1 + n1 + n2 ;

class MapValueIndexed<Key: HasId, Value> {
    content: {[string]: [Key, Value]};
    constructor() {
        this.content = {};
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
MapValueIndexed[immerable] = true;

const insert =
    <Key: HasId, Value>(key: Key, value: Value, map: MapValueIndexed<Key, Value>): void =>
    {map.content[key.id()] = [key, value];};

const remove =
    <Key: HasId, Value>(key: Key, map: MapValueIndexed<Key, Value>): void =>
    {delete map.content[key.id()];};

const traverse_ =
    <Key: HasId, Value>(f: (Value, Key) => mixed, map: MapValueIndexed<Key, Value>): void =>
    {R.forEachObjIndexed(([key, value]: [Key, Value]) => f(value, key), map.content);};

module.exports = {pairing_function_integer, MapValueIndexed, insert, remove, traverse_};
