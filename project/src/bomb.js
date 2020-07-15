// @flow

const {ColumnRowPosition} = require("./game_types.js");
import type {Event} from "./game_types.js";
const {immerable} = require("immer");

class Bomb {
    fuse: number;
    constructor(): void {
        this.fuse = 2600;
    }
    update(event: Event): "exploding" | "not exploding" {
        switch (event.type) {
            case "Tick": {
                this.fuse -= event.time;
            }
        }
        return this.fuse <= 0 ? "exploding" : "not exploding";
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Bomb[immerable] = true;

const draw =
    (
        [position, bomb]: [ColumnRowPosition, Bomb],
        canvas: {context: any, resources: Map<string, HTMLElement>,...},
        grid_scale: number
    ): void =>
    {
        canvas.context.beginPath();
        canvas.context.fillStyle = "red";
        canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
        // canvas.context.drawImage(canvas.resources.get("bomb"), grid_scale * this.position.row.number, grid_scale * this.position.row.number);
    };

module.exports = {Bomb, draw};
