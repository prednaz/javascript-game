// @flow

const map_value_indexed = require("./map_value_indexed.js");
const MapValueIndexed = map_value_indexed.MapValueIndexed;
import type {HasId} from "./map_value_indexed.js";
const {Int} = require("./int.js");

export opaque type SetValueIndexed<Value: HasId> = MapValueIndexed<Value, null>;

const create = <Value: HasId>(): SetValueIndexed<Value> => new MapValueIndexed();

// warning. mutates the second argument
const insert =
    <Value: HasId>(value: Value, set: SetValueIndexed<Value>): void =>
    map_value_indexed.insert(value, null, set);

// warning. mutates the second argument
const remove =
    <Value: HasId>(value: Value, set: SetValueIndexed<Value>): void =>
    map_value_indexed.remove(value, set);

const member =
    <Value: HasId>(value: Value, set: SetValueIndexed<Value>): boolean =>
    map_value_indexed.member(value, set);

const size =
    <Value: HasId>(set: SetValueIndexed<Value>): Int =>
    map_value_indexed.size(set);

// warning. mutates the second argument
const insert_all =
    <Value: HasId>(
        set1: SetValueIndexed<Value>,
        set2: SetValueIndexed<Value>
    ): void =>
    {map_value_indexed.insert_all(set1, set2)};

// warning. mutates the second argument
const remove_all =
    <Value: HasId>(
        set1: SetValueIndexed<Value>,
        set2: SetValueIndexed<Value>
    ): void =>
    {map_value_indexed.remove_all(set1, set2)};

const forEach =
    <Value: HasId>(f: Value => mixed, set: SetValueIndexed<Value>): void =>
    map_value_indexed.forEachIndexed(([value, null_]: [Value, null]) => f(value), set);

module.exports = {create, insert, remove, member, size, insert_all, remove_all, forEach};
