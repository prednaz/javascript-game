// @flow

const {Bomb} = require("./bomb.js");
const explosion = require("./explosion.js");
const Explosion = explosion.Explosion;
const {ColumnRowPosition} = require("./game_types.js");
import type {Direction, UserCommand, Event} from "./game_types.js";
const map_value_indexed = require("./map_value_indexed.js");
const MapValueIndexed = map_value_indexed.MapValueIndexed;
const set_value_indexed = require("./set_value_indexed.js");
import type {SetValueIndexed} from "./set_value_indexed.js";
const int = require("./int.js");
const Int = int.Int;
const R = require("ramda");
const {immerable} = require("immer");

type CoordinateMaximum = {
    +x: Int,
    +y: Int,
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
        else if (this.x > coordinate_maximum.x.number) {
            this.x = coordinate_maximum.x.number;
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
        else if (this.y > coordinate_maximum.y.number) {
            this.y = coordinate_maximum.y.number;
        }
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
ColumnPosition[immerable] = true;

class Player {
    +direction_move: {[Direction]: true};
    position: RowPosition | ColumnPosition;
    lives: Int;
    run_speed: number;
    bomb_strength: Int;
    time_since_damage: number;
    tick_count_since_turn: number;
    +bombs: MapValueIndexed<ColumnRowPosition, Bomb>;
    constructor(position: RowPosition | ColumnPosition) {
        this.direction_move = {};
        this.position = position;
         // to-do. magic number
        this.lives = new Int(5);
        this.run_speed = .01;
        this.bomb_strength = new Int(3);
        this.time_since_damage = 3000;
        this.tick_count_since_turn = 2;
        this.bombs = new MapValueIndexed();
    }
    user_command(command: UserCommand): void {
        switch (command.type) {
            case "Accelerate": {
                this.direction_move[command.direction] = true;
                break;
            }
            case "Decelerate": {
                delete this.direction_move[command.direction];
                break;
            }
            case "PlantBomb": {
                let position = this.position; // I do as Flow guides.
                map_value_indexed.insert(
                    position.type === "RowPosition"
                        ? new ColumnRowPosition(int.round(position.x), position.row)
                        : new ColumnRowPosition(position.column, int.round(position.y)),
                    new Bomb(),
                    this.bombs
                );
                break;
            }
        }
    }
    update(event: Event, coordinate_maximum: CoordinateMaximum): void {
        let position = this.position; // I do as Flow guides.
        switch (event.type) {
            case "Tick": {
                this.time_since_damage += event.time;

                // opposed directions cancel each other out
                const direction_move = Object.assign({}, this.direction_move);
                if ("up" in direction_move && "down" in direction_move) {
                    delete direction_move["up"];
                    delete direction_move["down"];
                }
                if ("left" in direction_move && "right" in direction_move) {
                    delete direction_move["left"];
                    delete direction_move["right"];
                }

                if (Object.keys(direction_move).length === 0) {
                    return;
                }

                const step_distance = this.run_speed * event.time;
                // to-do. refactor
                if (position.type === "RowPosition") {
                    if ("up" in direction_move || "down" in direction_move) {
                        const column = int.multiply(int.round(position.x / 2), new Int(2)); // round to the nearest mutliple of 2
                        const column_difference = column.number - position.x;
                        const column_direction = Math.sign(column_difference);
                        const column_distance = Math.abs(column_difference);
                        if (column_distance < 1.5 * step_distance && this.tick_count_since_turn >= 2) {
                            this.position = new ColumnPosition(column, position.row.number);
                            position = this.position;
                            position.stepColumn(
                                ("up" in direction_move ? -1 : 1) * Math.max(0, step_distance - column_distance),
                                coordinate_maximum
                            );
                            this.tick_count_since_turn = -1;
                        }
                        else if ("left" in direction_move || "right" in direction_move) {
                            position.stepRow(
                                ("left" in direction_move ? -1 : 1) * step_distance,
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
                            ("left" in direction_move ? -1 : 1) * step_distance,
                            coordinate_maximum
                        );
                    }
                }
                else { // position.type === "ColumnPosition"
                    if ("left" in direction_move || "right" in direction_move) {
                        const row = int.multiply(int.round(position.y / 2), new Int(2)); // round to the nearest mutliple of 2
                        const row_difference = row.number - position.y;
                        const row_direction = Math.sign(row_difference);
                        const row_distance = Math.abs(row_difference);
                        if (row_distance < 1.5 * step_distance && this.tick_count_since_turn >= 2) {
                            this.position = new RowPosition(row, position.column.number);
                            position = this.position;
                            position.stepRow(
                                ("left" in direction_move ? -1 : 1) * Math.max(0, step_distance - row_distance),
                                coordinate_maximum
                            );
                            this.tick_count_since_turn = -1;
                        }
                        else if ("up" in direction_move || "down" in direction_move) {
                            position.stepColumn(
                                ("up" in direction_move ? -1 : 1) * step_distance,
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
                            ("up" in direction_move ? -1 : 1) * step_distance,
                            coordinate_maximum
                        );
                    }
                }
                ++this.tick_count_since_turn;
                break;
            }
        }
    }
    take_damage(explosions: Array<Explosion>) {
        if (this.time_since_damage <= 3000) { // to-do. magic number
            return;
        }
        const position = new ColumnRowPosition(
            this.position.type === "RowPosition"
                ? int.round(this.position.x)
                : this.position.column,
            this.position.type === "RowPosition"
                ? this.position.row
                : int.round(this.position.y)
        );
        for (const explosion_current of explosions) {
            if (set_value_indexed.member(position, explosion_current.scorched_positions())) {
                this.lives = int.subtract(this.lives, new Int(1));
                this.time_since_damage = 0;
                return;
            }
        }
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Player[immerable] = true;

const draw =
    (
        player: Player,
        canvas: {context: any, resources: Map<string, HTMLElement>,...},
        grid_scale: number
    ): void =>
    {
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
    };


module.exports = {Player, draw, RowPosition, ColumnPosition};
