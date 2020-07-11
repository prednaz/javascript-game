// @flow

const {ColumnRowPosition, Tick} = require("./game_types.js");
const {immerable} = require("immer");

type IsExploding = "exploding" | "not exploding";

class Bomb {
    fuse: number;
    constructor(): void {
        this.fuse = 2600;
    }
    update(event: Tick): IsExploding {
        this.fuse -= event.time;
        return this.fuse <= 0 ? "exploding" : "not exploding";
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Bomb[immerable] = true;

const draw =
    (
        canvas: {context: any, resources: Map<string, HTMLElement>,...},
        grid_scale: number, position: ColumnRowPosition
    ): void =>
    {
        canvas.context.beginPath();
        canvas.context.fillStyle = "red";
        canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
        // canvas.context.drawImage(canvas.resources.get("bomb"), grid_scale * this.position.row.number, grid_scale * this.position.row.number);
    };

module.exports = {Bomb, draw};
