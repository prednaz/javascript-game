// @flow

const {ColumnRowPosition} = require("./game_types.js");

const draw =
    (
        position: ColumnRowPosition,
        canvas: {context: any, resources: Map<string, HTMLElement>,...},
        grid_scale: number
    ): void =>
    {
        canvas.context.beginPath();
        canvas.context.fillStyle = "brown";
        canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
    };

module.exports = {draw};
