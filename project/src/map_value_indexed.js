// @flow

const {immerable} = require("immer");

export interface HasId {
    +id: number;
}

class MapValueIndexed<Key: HasId, Value> {
        +map: Map<number, [Key, Value]>;
    constructor() {
        this.map = new Map();
    }
    set(key: Key, value: Value): this {
        this.map.set(key.id, [key, value]);
        return this;
    }
    forEach(callback: (Value, Key) => mixed): void {
        return this.map.forEach(([key, value], id) => callback(value, key));
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
MapValueIndexed[immerable] = true;

module.exports = MapValueIndexed;
