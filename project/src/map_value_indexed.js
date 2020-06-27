// @flow

const R = require("ramda");
const {immerable} = require("immer");

export interface HasId {
    +id: number;
}

class MapValueIndexed<Key: HasId, Value> {
    content: {[number]: [Key, Value]};
    constructor() {
        this.content = {};
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
MapValueIndexed[immerable] = true;

const insert =
    <Key: HasId, Value>(key: Key, value: Value, map: MapValueIndexed<Key, Value>): void =>
    {map.content[key.id] = [key, value];}

const traverse_ =
    <Key: HasId, Value>(f: (Value, Key) => mixed, map: MapValueIndexed<Key, Value>): void =>
    {R.forEachObjIndexed(([key, value]) => f(value, key), map.content);}

module.exports = {MapValueIndexed, insert, traverse_};
