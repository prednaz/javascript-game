// @flow

const {ColumnRowPosition, Tick} = require("./game_types.js");
const {Int} = require("./int.js");
const R = require("ramda");
const {immerable} = require("immer");

type HasFaded = "faded" | "present";

class Explosion {
    +radius: Int;
    progress: number;
    constructor(radius: Int): void {
        this.radius = radius;
        this.progress = 1000;
    }
    update(event: Tick): HasFaded {
        this.progress -= event.time;
        return this.progress <= 0 ? "faded" : "present";
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Explosion[immerable] = true;

const draw =
    (
        [position, explosion]: [ColumnRowPosition, Explosion],
        canvas: {context: any, resources: Map<string, HTMLElement>,...},
        grid_scale: number
    ): void =>
    {
        canvas.context.fillStyle = "blue";
        canvas.context.beginPath();
        canvas.context.fillRect(
            grid_scale * position.column.number + grid_scale * 1,
            grid_scale * position.row.number + grid_scale * 1,
            grid_scale,
            grid_scale
        );
        if (position.column.number % 2 === 0) {
            R.forEach(
                (radius: number) => {
                    ++radius;
                    canvas.context.beginPath();
                    canvas.context.fillRect(
                        grid_scale * position.column.number + grid_scale * 1,
                        grid_scale * (position.row.number + radius) + grid_scale * 1,
                        grid_scale,
                        grid_scale
                    );
                    canvas.context.beginPath();
                    canvas.context.fillRect(
                        grid_scale * position.column.number + grid_scale * 1,
                        grid_scale * (position.row.number - radius) + grid_scale * 1,
                        grid_scale,
                        grid_scale
                    );
                },
                R.range(0, explosion.radius.number)
            );
        }
        if (position.row.number % 2 === 0) {
            R.forEach(
                (radius: number) => {
                    ++radius;
                    canvas.context.beginPath();
                    canvas.context.fillRect(
                        grid_scale * (position.column.number + radius) + grid_scale * 1,
                        grid_scale * position.row.number + grid_scale * 1,
                        grid_scale,
                        grid_scale
                    );
                    canvas.context.beginPath();
                    canvas.context.fillRect(
                        grid_scale * (position.column.number - radius) + grid_scale * 1,
                        grid_scale * position.row.number + grid_scale * 1,
                        grid_scale,
                        grid_scale
                    );
                },
                R.range(0, explosion.radius.number)
            );
        }
    };

module.exports = {Explosion, draw};
