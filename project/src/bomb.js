// @flow

const {TickEvent} = require("./ui_types");
const {ColumnRowPosition} = require("./game_types");

class Bomb {
    fuse: number;
    constructor(): void {
        this.fuse = 2600;
    }
    update(event: TickEvent): void {
        this.fuse -= event.time;
    }
    draw(canvas: {context: any, resources: Map<string, HTMLElement>,...}, grid_scale: number, position: ColumnRowPosition): void {
        canvas.context.beginPath();
        canvas.context.fillStyle = "red";
        canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
        // canvas.context.drawImage(canvas.resources.get("bomb"), grid_scale * this.position.row.number, grid_scale * this.position.row.number);
    }
}

module.exports = Bomb;
