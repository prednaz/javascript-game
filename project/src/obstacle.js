// @flow

import type {ColumnRowPosition} from "./game_types.js";
import type {Resources} from "./resources.js";

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
    (position: ColumnRowPosition, canvas: Canvas, grid_scale: number): void =>
    {
        canvas.foreground.context.drawImage(
                canvas.resources["obstacle"],
                grid_scale * position.column.number + grid_scale * 1,
                grid_scale * position.row.number + grid_scale * 1,
                grid_scale,
                grid_scale
            );
    };

module.exports = {draw};
