// @flow

const {Int, round, multiply_int} = require("./utilities.js");
const {KeyDownEvent, KeyUpEvent, TickEvent} = require("./ui_types");
import type {Event} from "./ui_types";

type CoordinateMaximum = {
    +x: number,
    +y: number,
}

class RowPosition {
    row: Int;
    x: number;
    constructor(row: Int, x: number): void {
        this.row = row;
        this.x = x;
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
class ColumnPosition {
    column: Int;
    y: number;
    constructor(column: Int, y: number): void {
        this.column = column;
        this.y = y;
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

class Player {
    position: RowPosition | ColumnPosition;
    step_count_since_turn: number;
    run_speed: number;
    constructor() {
        this.position = new RowPosition(new Int(0), 0);
        this.run_speed = .01;
        this.step_count_since_turn = 2;
    }
    draw(canvas: {width: number, height: number, context: any, resources: Map<string, HTMLElement>,...}, grid_scale: number): void {
        canvas.context.beginPath();
        canvas.context.fillStyle = "green";
        let x: number;
        let y: number;
        if (this.position instanceof RowPosition) {
            x = grid_scale * this.position.x + grid_scale * 1;
            y = grid_scale * this.position.row.number + grid_scale * 1;
        }
        else if (this.position instanceof ColumnPosition) {
            x = grid_scale * this.position.column.number + grid_scale * 1;
            y = grid_scale * this.position.y + grid_scale * 1;
        }
        canvas.context.fillRect(x, y, grid_scale, grid_scale);
    }
    update(event: Event, keys_pressed: Array<string>, coordinate_maximum: CoordinateMaximum): void {
        if (event instanceof TickEvent) {
            const keys = new Set(keys_pressed.filter(key => ["w", "a", "s", "d"].includes(key)));

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
            let position = this.position; // I do as Flow guides.
            // to-do. refactor
            if (position instanceof RowPosition) {
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
            else if (position instanceof ColumnPosition) {
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

module.exports = Player;
