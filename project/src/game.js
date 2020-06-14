// @flow

const {last} = require("./utilities.js");

// to-do. Move to main
const canvas = (document.getElementById("canvas"): any);
const context = canvas.getContext("2d"); // to-do. Is there a better type for this than any?
const hole = document.getElementById("hole");
const coordinate_scale = 30;

type Event =
    {type: "key_down", key: Key} |
    {type: "key_up", key: Key} |
    {type: "tick", time: number};
export type Key = string;

class Game {
    player: Array<Player>;
    constructor(): void {
        this.player = [new Player()];
    }
    update(event: Event, keys_pressed: Array<Key>): void {
        this.player.forEach(
            player_current => player_current.update(event, keys_pressed)
        );
    }
    draw(): void {
         // to-do. refactor
         // to-do. magic numbers
         // to-do. seperate background canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.player.forEach(player_current => player_current.draw());
        for (let i=2; i < 14; i += 2) {
            for (let j=2; j < 12; j += 2){
                context.drawImage(hole, i * coordinate_scale, j * coordinate_scale);
            }
        }
        for (let i = 0; i < 15; i++) {
            context.drawImage(hole, i * coordinate_scale, 0);
            context.drawImage(hole, i * coordinate_scale, 12 * coordinate_scale);
        for (let j = 1; j < 12; j++) {
            context.drawImage(hole, 0, j * coordinate_scale);
            context.drawImage(hole, 14 * coordinate_scale, j * coordinate_scale);
            }
        }
        
    }
}

let step_count = 0;

// type Row = 0 | 1 | 2 | 3 | 4 | 5;
// type RowPosition = {mode: "row", x: number, row: Row};
// type Column = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// type ColumnPosition = {mode: "column", column: 0 | 1 | 2 | 3 | 4 | 5 | 6, y: number};

class RowPosition {
    x: number;
    row: number;
    constructor(x: number, row: number): void {
        this.x = x;
        this.row = row; // to-do. validate
    }
    stepRow(difference: number): void {
        this.x += difference;
        if (this.x < 0) {
            this.x = 0;
        }
        else if (this.x > 12) { // to-do. magic number
            this.x = 12;
        }
    }
}
class ColumnPosition {
    column: number;
    y: number;
    constructor(column: number, y: number): void {
        this.column = column; // to-do. validate
        this.y = y;
    }
    stepColumn(difference: number): void {
        this.y += difference;
        if (this.y < 0) {
            this.y = 0;
        }
        else if (this.y > 10) { // to-do. magic number
            this.y = 10;
        }
    }
};

class Player {
    position: RowPosition | ColumnPosition;
    step_count_since_turn: number;
    run_speed: number;
    constructor() {
        this.position = new RowPosition(1.5, 0);
        this.run_speed = .01;
        this.step_count_since_turn = 2;
    }
    draw(): void {
        context.beginPath();
        context.fillStyle = "green";
        let x: number;
        let y: number;
        if (this.position instanceof RowPosition) {
            x = coordinate_scale * this.position.x + coordinate_scale * 1;
            y = coordinate_scale * this.position.row + coordinate_scale * 1;
        }
        else if (this.position instanceof ColumnPosition) {
            x = coordinate_scale * this.position.column + coordinate_scale * 1;
            y = coordinate_scale * this.position.y + coordinate_scale * 1;
        }
        context.fillRect(x, y, coordinate_scale, coordinate_scale);
    }
    update(event: Event, keys_pressed: Array<Key>): void {
        if (event.type === "tick") {
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
                    const column = Math.round(position.x / 2) * 2; // round to the nearest mutliple of 2
                    const column_difference = column - position.x;
                    const column_direction = Math.sign(column_difference);
                    const column_distance = Math.abs(column_difference);
                    if (column_distance < 1.5 * step_distance && this.step_count_since_turn >= 2) {
                        this.position = new ColumnPosition(column, position.row);
                        position = this.position;
                        position.stepColumn((keys.has("w") ? -1 : 1) * Math.max(0, step_distance - column_distance));
                        this.step_count_since_turn = -1;
                    }
                    else if (keys.has("a") || keys.has("d")) {
                        position.stepRow((keys.has("a") ? -1 : 1) * step_distance);
                    }
                    else {
                        position.stepRow(column_direction * step_distance);
                    }
                }
                else {
                    position.stepRow((keys.has("a") ? -1 : 1) * step_distance);
                }
            }
            else if (position instanceof ColumnPosition) {
                if (keys.has("a") || keys.has("d")) {
                    const row = Math.round(position.y / 2) * 2; // round to the nearest mutliple of 2
                    const row_difference = row - position.y;
                    const row_direction = Math.sign(row_difference);
                    const row_distance = Math.abs(row_difference);
                    if (row_distance < 1.5 * step_distance && this.step_count_since_turn >= 2) {
                        this.position = new RowPosition(position.column, row);
                        position = this.position;
                        position.stepRow((keys.has("a") ? -1 : 1) * Math.max(0, step_distance - row_distance));
                        this.step_count_since_turn = -1;
                    }
                    else if (keys.has("w") || keys.has("s")) {
                        position.stepColumn((keys.has("w") ? -1 : 1) * step_distance);
                    }
                    else {
                        position.stepColumn(row_direction * step_distance);
                    }
                }
                else {
                    position.stepColumn((keys.has("w") ? -1 : 1) * step_distance);
                }
            }
            ++this.step_count_since_turn;
        }
    }
}

module.exports = Game;
