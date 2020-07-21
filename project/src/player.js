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
    +discrete_coordinate: Int;
    continuous_coordinate: number;
    +type: "RowPosition";
    constructor(row: Int, x: number): void {
        this.discrete_coordinate = row;
        this.continuous_coordinate = x;
        this.type = "RowPosition";
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
RowPosition[immerable] = true;
const x_get = (position: RowPosition): number => position.continuous_coordinate;
const x_set = (x: number, position: RowPosition): void => {position.continuous_coordinate = x;};
const row_get = (position: RowPosition): Int => position.discrete_coordinate;

class ColumnPosition {
    +discrete_coordinate: Int;
    continuous_coordinate: number;
    +type: "ColumnPosition";
    constructor(column: Int, y: number): void {
        this.discrete_coordinate = column;
        this.continuous_coordinate = y;
        this.type = "ColumnPosition";
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
ColumnPosition[immerable] = true;
const column_get = (position: ColumnPosition): Int => position.discrete_coordinate;
const y_get = (position: ColumnPosition): number => position.continuous_coordinate;
const y_set = (y: number, position: ColumnPosition): void => {position.continuous_coordinate = y;};

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
                            ? new ColumnRowPosition(int.round(x_get(position)), row_get(position))
                            : new ColumnRowPosition(column_get(position), int.round(y_get(position))),
                        new Bomb(),
                        this.bombs
                    );
                }
                break;
            }
        }
    }
    update(
        event: Event,
        free_position: ColumnRowPosition => boolean
    ): void {
        switch (event.type) {
            case "Tick": {
                this.time_since_damage += event.time;

                // opposed directions cancel each other out
                const direction_move: {[Direction]: null} = Object.assign({}, this.direction_move);
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

                this.step(direction_move, this.run_speed * event.time, free_position);

                // handle a collision with an obstacle or the map edge
                const free_positions =
                    R.filter(
                        free_position,
                        this.touched_positions()
                    );
                if (R.length(free_positions) === 1) {
                    if (this.position.type === "RowPosition") {
                        x_set(free_positions[0].column.number, this.position);
                    }
                    else { // this.position.type === "ColumnPosition"
                        y_set(free_positions[0].row.number, this.position);
                    }
                }
                ++this.tick_count_since_turn;
                break;
            }
        }
    }
    step(
        direction_move: {[Direction]: null},
        step_distance: number,
        free_position: ColumnRowPosition => boolean
    ): void {
        // abstract some information away from RowPosition, ColumnPosition for later
        let parallel_negative: Direction;
        let parallel_positive: Direction;
        let orthogonal_negative: Direction;
        let orthogonal_positive: Direction;
        let position_after_turn:
            ((new_discrete: Int, new_continuous: number) => RowPosition) |
            (new_discrete: Int, new_continuous: number) => ColumnPosition;
        if (this.position.type === "RowPosition") {
            parallel_negative = "left";
            parallel_positive = "right";
            orthogonal_negative = "up";
            orthogonal_positive = "down";
            position_after_turn =
                (new_discrete: Int, new_continuous: number): ColumnPosition =>
                new ColumnPosition(new_discrete, new_continuous);
        }
        else { // this.position.type === "ColumnPosition"
            parallel_negative = "up";
            parallel_positive = "down";
            orthogonal_negative = "left";
            orthogonal_positive = "right";
            position_after_turn =
                (new_discrete: Int, new_continuous: number): RowPosition =>
                new RowPosition(new_discrete, new_continuous);
        }

        // adjust this.position
        if (!(orthogonal_negative in direction_move || orthogonal_positive in direction_move)) {
            // move along the row or column
            this.position.continuous_coordinate +=
                (parallel_negative in direction_move ? -1 : 1) * step_distance;
        }
        else {
            const new_discrete = int.multiply(int.round(this.position.continuous_coordinate / 2), new Int(2)) // round to the nearest multiple of 2
            const new_discrete_difference = new_discrete.number - this.position.continuous_coordinate;
            const new_discrete_direction = Math.sign(new_discrete_difference);
            const new_discrete_distance = Math.abs(new_discrete_difference);
            const target_coordinate_of_discrete_coordinate =
                orthogonal_negative in direction_move ? int.predecessor : int.successor;
            const target_position =
                new ColumnRowPosition(
                    this.position.type === "RowPosition"
                        ? new_discrete
                        : target_coordinate_of_discrete_coordinate(column_get(this.position)),
                    this.position.type === "RowPosition"
                        ? target_coordinate_of_discrete_coordinate(row_get(this.position))
                        : new_discrete
                );
            const target_free = free_position(target_position);
            if (target_free && new_discrete_distance < 1.5 * step_distance && this.tick_count_since_turn >= 2) {
                // turn at the intersection
                this.position = position_after_turn(new_discrete, this.position.discrete_coordinate.number);
                this.position.continuous_coordinate +=
                    (orthogonal_negative in direction_move ? -1 : 1) * Math.max(0, step_distance - new_discrete_distance);
                this.tick_count_since_turn = -1;
            }
            else if (parallel_negative in direction_move || parallel_positive in direction_move) {
                // ignore the orthogonal command because there is a parallel one too
                this.position.continuous_coordinate +=
                    (parallel_negative in direction_move ? -1 : 1) * step_distance;
            }
            else if (target_free && new_discrete_distance < 1) {
                // glide towards the intersection
                this.position.continuous_coordinate += new_discrete_direction * step_distance;
            }
        }
    }
    take_damage(explosions: $ReadOnlyArray<Explosion>) {
        if (this.time_since_damage <= 3000) { // to-do. magic number
            return;
        }
        const position = new ColumnRowPosition(
            this.position.type === "RowPosition"
                ? int.round(x_get(this.position))
                : column_get(this.position),
            this.position.type === "RowPosition"
                ? row_get(this.position)
                : int.round(y_get(this.position))
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
                        new ColumnRowPosition(int.floor(x_get(position)), row_get(position)),
                        new ColumnRowPosition(int.ceil(x_get(position)), row_get(position))
                    ]
                :
                    [
                        new ColumnRowPosition(column_get(position), int.floor(y_get(position))),
                        new ColumnRowPosition(column_get(position), int.ceil(y_get(position)))
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
                ? grid_scale * x_get(player.position) + grid_scale * 1
                : grid_scale * column_get(player.position).number + grid_scale * 1,
            player.position.type === "RowPosition"
                ? grid_scale * row_get(player.position).number + grid_scale * 1
                : grid_scale * y_get(player.position) + grid_scale * 1,
            grid_scale,
            grid_scale
        );
    };


module.exports = {Player, draw, RowPosition, ColumnPosition};
