// @flow

const {Int} = require("./int.js");
const {pairing_function_integer} = require("./map_value_indexed.js");
import type {HasId} from "./map_value_indexed.js";
const {immerable} = require("immer");

class ColumnRowPosition implements HasId {
    +column: Int;
    +row: Int;
    +id_cache: string;
    constructor(column: Int, row: Int): void {
        this.column = column;
        this.row = row;
        this.id_cache = pairing_function_integer(this.column.number, this.row.number).toString(); // caching the idea is possible as long as the others fields are read-only too
    }
    id(): string {return this.id_cache;}
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
ColumnRowPosition[immerable] = true;

export type Direction = "up" | "left" | "down" | "right";

class Accelerate {
    +direction: Direction;
    +type: "Accelerate";
    constructor(direction: Direction) {
        this.direction = direction;
        this.type = "Accelerate";
    }
}

class Decelerate {
    +direction: Direction;
    +type: "Decelerate";
    constructor(direction: Direction) {
        this.direction = direction;
        this.type = "Decelerate";
    }
}

class PlantBomb {
    +type: "PlantBomb";
    constructor() {
        this.type = "PlantBomb";
    }
}

export type UserCommand = Accelerate | Decelerate | PlantBomb;

class Tick {
    +time: number;
    +type: "Tick";
    constructor(time: number): void {this.time = time; this.type = "Tick";}
}

class UserCommandEvent {
    +player_id: PlayerId;
    +command: UserCommand;
    +type: "UserCommandEvent";
    constructor(player_id: PlayerId, command: UserCommand) {
        this.player_id = player_id;
        this.command = command;
        this.type = "UserCommandEvent";
    }
}

export type Event = Tick | UserCommandEvent;

export type PlayerId = "top_left" | "bottom_right" | "bottom_left" | "top_right";

module.exports = {ColumnRowPosition, Accelerate, Decelerate, PlantBomb, Tick, UserCommandEvent};
