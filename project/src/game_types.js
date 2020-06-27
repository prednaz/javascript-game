// @flow

const utilities = require("./utilities");
const Int = utilities.Int;
const {immerable} = require("immer");

class ColumnRowPosition {
    +column: Int;
    +row: Int;
    +id: number;
    constructor(column: Int, row: Int): void {
        this.column = column;
        this.row = row;
        this.id = utilities.pairing_function(this.column.number, this.row.number); // make id a function if you make the fields writable
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

export type UserCommand = Accelerate | PlantBomb;

class Tick {
    +time: number;
    +type: "Tick";
    constructor(time: number): void {this.time = time; this.type = "Tick";}
}

class UserCommandEvent {
    +user: number;
    +command: UserCommand;
    +type: "UserCommandEvent";
    constructor(user: number, command: UserCommand) {
        this.user = user;
        this.command = command;
        this.type = "UserCommandEvent";
    }
}
    
export type Event = Tick | UserCommandEvent;

module.exports = {ColumnRowPosition, Accelerate, Decelerate, PlantBomb, Tick, UserCommandEvent};
