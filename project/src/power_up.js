// @flow

import type {ColumnRowPosition} from "./game_types.js";
import type {Resources} from "./resources.js";

export type PowerUp = "bomb_capacity" | "run_speed" | "bomb_strength" | "life_count";

type Canvas =
    {
        foreground: {
            width: number,
            height: number,
            context: any,
        },
        background: {
            width: number,
            height: number,
            context: any,
        },
        resources: Resources,
        resources_grid_scale: number,
        ...
    };

const draw =
    (
        [position, power_up]: [ColumnRowPosition, PowerUp],
        canvas: Canvas,
        grid_scale: number
    ): void =>
    {
        canvas.foreground.context.beginPath();
        switch (power_up) {
            case "bomb_capacity": {
                canvas.foreground.context.drawImage(
                    canvas.resources["power_ups/bomb_capacity"],
                    grid_scale * position.column.number + grid_scale * 1,
                    grid_scale * position.row.number + grid_scale * 1,
                    grid_scale,
                    grid_scale
                );
                break;
            }
            case "run_speed": {
                canvas.foreground.context.drawImage(
                    canvas.resources["power_ups/run_speed"],
                    grid_scale * position.column.number + grid_scale * 1,
                    grid_scale * position.row.number + grid_scale * 1,
                    grid_scale,
                    grid_scale
                );
                break;
            }
            
            case "bomb_strength":{
                canvas.foreground.context.drawImage(
                    canvas.resources["power_ups/bomb_strength"],
                    grid_scale * position.column.number + grid_scale * 1,
                    grid_scale * position.row.number + grid_scale * 1,
                    grid_scale,
                    grid_scale
                );
                break;
            }

            case "life_count":{
                canvas.foreground.context.drawImage(
                    canvas.resources["power_ups/life_count"],
                    grid_scale * position.column.number + grid_scale * 1,
                    grid_scale * position.row.number + grid_scale * 1,
                    grid_scale,
                    grid_scale
                );
                break;
            }
        }
    };

module.exports = {draw};
