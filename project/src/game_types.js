// @flow

const {Int} = require("./utilities.js");
const {pairing_function_integer} = require("./map_value_indexed.js");
import type {HasId} from "./map_value_indexed.js";
const {immerable} = require("immer");

class ColumnRowPosition implements HasId {
    +column: Int;
    +row: Int;
    +id: number;
    constructor(column: Int, row: Int): void {
        this.column = column;
        this.row = row;
        this.id = pairing_function_integer(this.column.number, this.row.number); // make id a function if you make the fields writable
    }
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
    +player: PlayerId;
    +command: UserCommand;
    +type: "UserCommandEvent";
    constructor(player: PlayerId, command: UserCommand) {
        this.player = player;
        this.command = command;
        this.type = "UserCommandEvent";
    }
}

export type Event = Tick | UserCommandEvent;

export type PlayerId = "top left" | "bottom right" | "bottom left" | "top right";

const player_id_range: Array<PlayerId> = ["top left", "bottom right", "bottom left", "top right"];

module.exports = {ColumnRowPosition, Accelerate, Decelerate, PlantBomb, Tick, UserCommandEvent, player_id_range};
