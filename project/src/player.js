// @flow

const bomb = require("./bomb");
const Bomb = bomb.Bomb;
const {KeyDownEvent, KeyUpEvent, TickEvent} = require("./ui_types");
const {ColumnRowPosition} = require("./game_types");
const {Int, round, multiply_int} = require("./utilities");
const map_value_indexed = require("./map_value_indexed");
const MapValueIndexed = map_value_indexed.MapValueIndexed;

import type {Event} from "./ui_types";
const {immerable} = require("immer");

type CoordinateMaximum = {
    +x: number,
    +y: number,
}

class RowPosition {
    +row: Int;
    x: number;
    +type: "RowPosition";
    constructor(row: Int, x: number): void {
        this.row = row;
        this.x = x;
        this.type = "RowPosition";
    }
    stepRow(difference: number, coordinate_maximum: CoordinateMaximum): void {
        this.x += difference;
        if (this.x < 0) {
            this.x = 0;
        }
        else if (this.x > coordinate_maximum.x) {
            this.x = coordinate_maximum.x;
        }
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
RowPosition[immerable] = true;
class ColumnPosition {
    +column: Int;
    y: number;
    +type: "ColumnPosition";
    constructor(column: Int, y: number): void {
        this.column = column;
        this.y = y;
        this.type = "ColumnPosition";
    }
    stepColumn(difference: number, coordinate_maximum: CoordinateMaximum): void {
        this.y += difference;
        if (this.y < 0) {
            this.y = 0;
        }
        else if (this.y > coordinate_maximum.y) {
            this.y = coordinate_maximum.y;
        }
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
ColumnPosition[immerable] = true;

class Player {
    keys_pressed: Array<string>;
    position: RowPosition | ColumnPosition;
    step_count_since_turn: number;
    run_speed: number;
    bombs: MapValueIndexed<ColumnRowPosition, Bomb>;
    constructor() {
        this.keys_pressed = [];
        this.position = new RowPosition(new Int(0), 0);
        this.run_speed = .01;
        this.step_count_since_turn = 2;
        this.bombs = new MapValueIndexed();
    }
    update(event: Event, coordinate_maximum: CoordinateMaximum): void {
        let position = this.position; // I do as Flow guides.
        if (event.type === "KeyDownEvent" && event.key === " ") {
            map_value_indexed.insert(
                position.type === "RowPosition"
                    ? new ColumnRowPosition(round(position.x), position.row)
                    : new ColumnRowPosition(position.column, round(position.y)),
                new Bomb(),
                this.bombs
            );
        }
        else if (event.type === "TickEvent") {
            map_value_indexed.traverse_(bomb => bomb.update(event), this.bombs);

            const keys = new Set(this.keys_pressed.filter(key => ["w", "a", "s", "d"].includes(key)));

            // opposed keys cancel each other out
            if (keys.has("w") && keys.has("s")) {
                keys.delete("w");
                keys.delete("s");
            }
            if (keys.has("a") && keys.has("d")) {
                keys.delete("a");
                keys.delete("d");
            }

            if (keys.size === 0) {
                return;
            }

            const step_distance = this.run_speed * event.time;
            // to-do. refactor
            if (position.type === "RowPosition") {
                if (keys.has("w") || keys.has("s")) {
                    const column = multiply_int(round(position.x / 2), new Int(2)); // round to the nearest mutliple of 2
                    const column_difference = column.number - position.x;
                    const column_direction = Math.sign(column_difference);
                    const column_distance = Math.abs(column_difference);
                    if (column_distance < 1.5 * step_distance && this.step_count_since_turn >= 2) {
                        this.position = new ColumnPosition(column, position.row.number);
                        position = this.position;
                        position.stepColumn(
                            (keys.has("w") ? -1 : 1) * Math.max(0, step_distance - column_distance),
                            coordinate_maximum
                        );
                        this.step_count_since_turn = -1;
                    }
                    else if (keys.has("a") || keys.has("d")) {
                        position.stepRow(
                            (keys.has("a") ? -1 : 1) * step_distance,
                            coordinate_maximum
                        );
                    }
                    else {
                        position.stepRow(
                            column_direction * step_distance,
                            coordinate_maximum
                        );
                    }
                }
                else {
                    position.stepRow(
                        (keys.has("a") ? -1 : 1) * step_distance,
                        coordinate_maximum
                    );
                }
            }
            else { // position.type === "ColumnPosition"
                if (keys.has("a") || keys.has("d")) {
                    const row = multiply_int(round(position.y / 2), new Int(2)); // round to the nearest mutliple of 2
                    const row_difference = row.number - position.y;
                    const row_direction = Math.sign(row_difference);
                    const row_distance = Math.abs(row_difference);
                    if (row_distance < 1.5 * step_distance && this.step_count_since_turn >= 2) {
                        this.position = new RowPosition(row, position.column.number);
                        position = this.position;
                        position.stepRow(
                            (keys.has("a") ? -1 : 1) * Math.max(0, step_distance - row_distance),
                            coordinate_maximum
                        );
                        this.step_count_since_turn = -1;
                    }
                    else if (keys.has("w") || keys.has("s")) {
                        position.stepColumn(
                            (keys.has("w") ? -1 : 1) * step_distance,
                            coordinate_maximum
                        );
                    }
                    else {
                        position.stepColumn(
                            row_direction * step_distance,
                            coordinate_maximum
                        );
                    }
                }
                else {
                    position.stepColumn(
                        (keys.has("w") ? -1 : 1) * step_distance,
                        coordinate_maximum
                    );
                }
            }
            ++this.step_count_since_turn;
        }
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Player[immerable] = true;

const draw = (player: Player, canvas: {context: any, resources: Map<string, HTMLElement>,...}, grid_scale: number): void => {
    map_value_indexed.traverse_(
        (bomb_current, position) => bomb.draw(canvas, grid_scale, position),
        player.bombs
    );
    canvas.context.beginPath();
    canvas.context.fillStyle = "green";
    canvas.context.fillRect(
        player.position.type === "RowPosition"
            ? grid_scale * player.position.x + grid_scale * 1
            : grid_scale * player.position.column.number + grid_scale * 1,
        player.position.type === "RowPosition"
            ? grid_scale * player.position.row.number + grid_scale * 1
            : grid_scale * player.position.y + grid_scale * 1,
        grid_scale,
        grid_scale
    );
}


module.exports = {Player, draw};
