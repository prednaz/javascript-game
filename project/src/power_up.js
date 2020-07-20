// @flow

const {ColumnRowPosition} = require("./game_types.js");
import type {Resources} from "./resources.js";

export type PowerUp = "bomb_capacity" | "run_speed";

const draw =
    (
        [position, power_up]: [ColumnRowPosition, PowerUp],
        canvas: {context: any, resources: Resources,...},
        grid_scale: number
    ): void =>
    {
        canvas.context.beginPath();
        switch (power_up) {
            case "bomb_capacity": {
                canvas.context.fillStyle = "cyan";
                canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
                canvas.context.drawImage(
                    canvas.resources["power_ups/bomb_capacity"],
                    grid_scale * position.column.number + grid_scale * 1,
                    grid_scale * position.row.number + grid_scale * 1,
                    grid_scale,
                    grid_scale
                );
                break;
            }
            case "run_speed": {
                canvas.context.fillStyle = "cyan";
                canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
                break;
            }
        }
    };

module.exports = {draw};
