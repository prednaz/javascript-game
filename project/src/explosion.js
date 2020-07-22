// @flow

const {ColumnRowPosition} = require("./game_types.js");
import type {Tick} from "./game_types.js";
const set_value_indexed = require("./set_value_indexed.js");
import type {SetValueIndexed} from "./set_value_indexed.js";
const int = require("./int.js");
import type {Int} from "./int.js";
import type {Resources} from "./resources.js";
const R = require("ramda");
const {immerable} = require("immer");

class RowRectangle {
    +row: Int;
    +column_lower: Int;
    +column_upper: Int;
    constructor(row: Int, column_lower: Int, column_upper: Int): void {
        this.row = row;
        this.column_lower = column_lower;
        this.column_upper = column_upper;
    }
    scorched_positions(): SetValueIndexed<ColumnRowPosition> {
        const result = set_value_indexed.create([]);
        for (
            let column = this.column_lower;
            int.less_or_equals(column, this.column_upper);
            column = int.successor(column)
        ) {
            set_value_indexed.insert(new ColumnRowPosition(column, this.row), result);
        }
        return result;
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
RowRectangle[immerable] = true;
class ColumnRectangle {
    +column: Int;
    +row_lower: Int;
    +row_upper: Int;
    constructor(column: Int, row_lower: Int, row_upper: Int): void {
        this.column = column;
        this.row_lower = row_lower;
        this.row_upper = row_upper;
    }
    scorched_positions(): SetValueIndexed<ColumnRowPosition> {
        const result = set_value_indexed.create([]);
        for (
            let row = this.row_lower;
            int.less_or_equals(row, this.row_upper);
            row = int.successor(row)
        ) {
            set_value_indexed.insert(new ColumnRowPosition(this.column, row), result);
        }
        return result;
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
ColumnRectangle[immerable] = true;

class Explosion {
    +center: ColumnRowPosition;
    +row_rectangle: RowRectangle | null;
    +column_rectangle: ColumnRectangle | null;
    progress: number;
    constructor(
        center: ColumnRowPosition,
        radius: Int,
        on_map: ColumnRowPosition => boolean,
        clear_of_obstacles: ColumnRowPosition => boolean
    ): void {
        this.center = center;
        this.progress = 1000; // explosion duration in ms

        const determine_explosion_limit_partially_applied =
            determine_explosion_limit(center, radius, on_map, clear_of_obstacles);
        this.row_rectangle =
            !int.even(center.row)
                ? null
                : new RowRectangle(
                    center.row,
                    determine_explosion_limit_partially_applied(
                        position =>
                            new ColumnRowPosition(
                                int.predecessor(position.column),
                                position.row
                            )
                    ).column,
                    determine_explosion_limit_partially_applied(
                        position =>
                            new ColumnRowPosition(
                                int.successor(position.column),
                                position.row
                            )
                    ).column
                );
        this.column_rectangle =
            !int.even(center.column)
                ? null
                : new ColumnRectangle(
                    center.column,
                    determine_explosion_limit_partially_applied(
                        position =>
                            new ColumnRowPosition(
                                position.column,
                                int.predecessor(position.row)
                            )
                    ).row,
                    determine_explosion_limit_partially_applied(
                        position =>
                            new ColumnRowPosition(
                                position.column,
                                int.successor(position.row)
                            )
                    ).row
                );
    }
    update(event: Tick): "faded" | "present" {
        this.progress -= event.time;
        return this.progress <= 0 ? "faded" : "present";
    }
    scorched_positions(): SetValueIndexed<ColumnRowPosition> {
        const result = set_value_indexed.create([]);
        if (this.row_rectangle !== null) {
            set_value_indexed.insert_all(this.row_rectangle.scorched_positions(), result);
        }
        if (this.column_rectangle !== null) {
            set_value_indexed.insert_all(this.column_rectangle.scorched_positions(), result);
        }
        return result;
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Explosion[immerable] = true;

// determine the explosions limit by walking (next_position parameter)
// away from the explosion center (center parameter)
// until either exceeding the radius (radius parameter)
// or falling off the map (valid_position parameter)
// or hitting an obstacle (obstacles parameter)
const determine_explosion_limit =
    (
        center: ColumnRowPosition,
        radius: Int,
        on_map: ColumnRowPosition => boolean,
        clear_of_obstacles: ColumnRowPosition => boolean
    ) =>
    (next_position: ColumnRowPosition => ColumnRowPosition): ColumnRowPosition =>
    {
        let position_test = center;
        let position_result = position_test;
        for (let count = 0; count < radius.number; ++count) {
            position_test = next_position(position_test);
            if (!on_map(position_test)) {
                break;
            }
            // map has not ended yet, so advance position_result
            position_result = position_test;
            if (!clear_of_obstacles(position_result)) {
                break;
            }
            // no obtacle yet, so loop
        }
        return position_result;
    };

const draw =
    (
        explosion: Explosion,
        canvas: {context: any, resources: Resources,...},
        grid_scale: number
    ): void =>
    {
        canvas.context.fillStyle = "blue";
        const row_rectangle = explosion.row_rectangle;
        if (row_rectangle !== null) {
            R.forEach(
                n => {
                    canvas.context.beginPath();
                    canvas.context.fillRect(
                        grid_scale * n + grid_scale * 1,
                        grid_scale * row_rectangle.row.number + grid_scale * 1,
                        grid_scale,
                        grid_scale
                    );
                },
                R.range(
                    row_rectangle.column_lower.number,
                    row_rectangle.column_upper.number + 1 // include the upper limit
                )
            );
        }
        const column_rectangle = explosion.column_rectangle;
        if (column_rectangle !== null) {
            R.forEach(
                n => {
                    canvas.context.beginPath();
                    canvas.context.fillRect(
                        grid_scale * column_rectangle.column.number + grid_scale * 1,
                        grid_scale * n + grid_scale * 1,
                        grid_scale,
                        grid_scale
                    );
                },
                R.range(
                    column_rectangle.row_lower.number,
                    column_rectangle.row_upper.number + 1 // include the upper limit
                )
            );
        }
    };

module.exports = {Explosion, draw};
