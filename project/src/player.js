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
import type {Resources} from "./resources.js";
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
    step_row(difference: number, coordinate_maximum: CoordinateMaximum): void {
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
    step_column(difference: number, coordinate_maximum: CoordinateMaximum): void {
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
    +direction_move: {[Direction]: null};
    position: RowPosition | ColumnPosition;
    life_count: Int;
    run_speed: number;
    bomb_strength: Int;
    tick_count_since_turn: number;
    time_since_damage: number;
    +bombs: MapValueIndexed<ColumnRowPosition, Bomb>;
    bomb_capacity: Int;
    constructor(position: RowPosition | ColumnPosition) {
        this.direction_move = {};
        this.position = position;
         // to-do. magic number
        this.life_count = new Int(5);
        this.run_speed = .01;
        this.bomb_strength = new Int(3);
        this.time_since_damage = 3000;
        this.tick_count_since_turn = 2;
        this.bombs = new MapValueIndexed([]);
        this.bomb_capacity = new Int(1);
    }
    user_command(command: UserCommand): void {
        switch (command.type) {
            case "Accelerate": {
                this.direction_move[command.direction] = null;
                break;
            }
            case "Decelerate": {
                delete this.direction_move[command.direction];
                break;
            }
            case "PlantBomb": {
                const position = this.position; // I do as Flow guides.
                if (int.less(map_value_indexed.size(this.bombs), this.bomb_capacity)) {
                    map_value_indexed.insert(
                        position.type === "RowPosition"
                            ? new ColumnRowPosition(int.round(position.x), position.row)
                            : new ColumnRowPosition(position.column, int.round(position.y)),
                        new Bomb(),
                        this.bombs
                    );
                }
                break;
            }
        }
    }
    update(event: Event, coordinate_maximum: CoordinateMaximum, obstacles: SetValueIndexed<ColumnRowPosition>): void {
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

                if (R.length(Object.keys(direction_move)) === 0) {
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
                            position.step_column(
                                ("up" in direction_move ? -1 : 1) * Math.max(0, step_distance - column_distance),
                                coordinate_maximum
                            );
                            this.tick_count_since_turn = -1;
                        }
                        else if ("left" in direction_move || "right" in direction_move) {
                            position.step_row(
                                ("left" in direction_move ? -1 : 1) * step_distance,
                                coordinate_maximum
                            );
                        }
                        else {
                            position.step_row(
                                column_direction * step_distance,
                                coordinate_maximum
                            );
                        }
                    }
                    else {
                        position.step_row(
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
                            position.step_row(
                                ("left" in direction_move ? -1 : 1) * Math.max(0, step_distance - row_distance),
                                coordinate_maximum
                            );
                            this.tick_count_since_turn = -1;
                        }
                        else if ("up" in direction_move || "down" in direction_move) {
                            position.step_column(
                                ("up" in direction_move ? -1 : 1) * step_distance,
                                coordinate_maximum
                            );
                        }
                        else {
                            position.step_column(
                                row_direction * step_distance,
                                coordinate_maximum
                            );
                        }
                    }
                    else {
                        position.step_column(
                            ("up" in direction_move ? -1 : 1) * step_distance,
                            coordinate_maximum
                        );
                    }
                }
                const free_positions =
                    R.filter(
                        (touched_position: ColumnRowPosition) =>
                            !set_value_indexed.member(touched_position, obstacles),
                        this.touched_positions()
                    );
                if (R.length(free_positions) === 1) {
                    if (position.type === "RowPosition") {
                        position.x = free_positions[0].column.number;
                    }
                    else { // position.type === "ColumnPosition"
                        position.y = free_positions[0].row.number;
                    }
                }
                ++this.tick_count_since_turn;
                break;
            }
        }
    }
    take_damage(explosions: $ReadOnlyArray<Explosion>) {
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
                this.life_count = int.subtract(this.life_count, new Int(1));
                this.time_since_damage = 0;
                return;
            }
        }
    }
    touched_positions(): [ColumnRowPosition, ColumnRowPosition] {
        const position = this.position; // I do as Flow guides.
        return (
            position.type === "RowPosition"
                ?
                    [
                        new ColumnRowPosition(int.floor(position.x), position.row),
                        new ColumnRowPosition(int.ceil(position.x), position.row)
                    ]
                :
                    [
                        new ColumnRowPosition(position.column, int.floor(position.y)),
                        new ColumnRowPosition(position.column, int.ceil(position.y))
                    ]
        );
    }
    power_up_bomb_capacity(): void {
        this.bomb_capacity = int.successor(this.bomb_capacity);
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Player[immerable] = true;

const draw =
    (
        player: Player,
        canvas: {context: any, resources: Resources,...},
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
