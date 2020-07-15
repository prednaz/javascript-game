// @flow

const map_value_indexed = require("./map_value_indexed.js");
const MapValueIndexed = map_value_indexed.MapValueIndexed;
import type {HasId} from "./map_value_indexed.js";

export opaque type SetValueIndexed<Value: HasId> = MapValueIndexed<Value, null>;

const create = <Value: HasId>(): SetValueIndexed<Value> => new MapValueIndexed();

const insert =
    <Value: HasId>(value: Value, set: SetValueIndexed<Value>): void =>
    map_value_indexed.insert(value, null, set);

const remove =
    <Value: HasId>(value: Value, set: SetValueIndexed<Value>): void =>
    map_value_indexed.remove(value, set);

const member =
    <Value: HasId>(value: Value, set: SetValueIndexed<Value>): boolean =>
    map_value_indexed.member(value, set);

const union =
    <Value: HasId>(
        set1: SetValueIndexed<Value>,
        set2: SetValueIndexed<Value>
    ): void =>
    {map_value_indexed.union(set1, set2)};

const traverse_ =
    <Value: HasId>(f: Value => mixed, set: SetValueIndexed<Value>): void =>
    map_value_indexed.itraverse_(([value, null_]: [Value, null]) => f(value), set);

module.exports = {create, insert, remove, member, union, traverse_};
