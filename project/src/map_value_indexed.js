// @flow

const R = require("ramda");
const {immerable} = require("immer");
const int = require("./int.js");
const Int = int.Int;

export interface HasId {
    id(): string;
}

const pairing_function_integer =
    (n1: number, n2: number): number =>
        n1 < n2
            ? n2 * n2 + n1
            : n1 * n1 + n1 + n2 ;

class MapValueIndexed<Key: HasId, Value> {
    +content: {[string]: [Key, Value]}; // to-do. read only
    constructor() {
        this.content = {};
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
MapValueIndexed[immerable] = true;

// warning. mutates the second argument
const insert =
    <Key: HasId, Value>(key: Key, value: Value, map: MapValueIndexed<Key, Value>): void =>
    {map.content[key.id()] = [key, value];};

// warning. mutates the second argument
const remove =
    <Key: HasId, Value>(key: Key, map: MapValueIndexed<Key, Value>): void =>
    {delete map.content[key.id()];};

const member =
    <Key: HasId, Value>(key: Key, map: MapValueIndexed<Key, Value>): boolean =>
    key.id() in map.content;

const size =
    <Key: HasId, Value>(map: MapValueIndexed<Key, Value>): Int =>
    int.round(Object.keys(map.content).length);

const lookup =
    <Key: HasId, Value>(key: Key, map: MapValueIndexed<Key, Value>): Value | null =>
    member(key, map) ? map.content[key.id()][1] : null;

// warning. mutates the second argument
const insert_all =
    <Key: HasId, Value>(
        map1: MapValueIndexed<Key, Value>,
        map2: MapValueIndexed<Key, Value>
    ): void =>
    {Object.assign(map2.content, map1.content);};

// warning. mutates the second argument
const remove_all =
    <Key: HasId, Value>(
        map1: MapValueIndexed<Key, Value>,
        map2: MapValueIndexed<Key, Value>
    ): void =>
    {itraverse_(([key, value]: [Key, Value]) => remove(key, map2), map1);};

const traverse_ =
    <Key: HasId, Value>(f: (Value, Key) => mixed, map: MapValueIndexed<Key, Value>): void =>
    {R.forEachObjIndexed(([key, value]: [Key, Value]) => f(value, key), map.content);};

const itraverse_ =
    <Key: HasId, Value>(f: ([Key, Value]) => mixed, map: MapValueIndexed<Key, Value>): void =>
    {R.forEachObjIndexed((tuple: [Key, Value]) => f(tuple), map.content);};

module.exports =
    {
        pairing_function_integer,
        MapValueIndexed,
        insert,
        remove,
        member,
        size,
        lookup,
        insert_all,
        remove_all,
        traverse_,
        itraverse_
    };
