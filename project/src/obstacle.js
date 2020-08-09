// @flow

import type {ColumnRowPosition} from "./game_types.js";
import type {Resources} from "./resources.js";

const map1: $ReadOnlyArray<[number, number]> = [
    [3,0], [6,0], [7,0], [8,0], [9,0],
    [2,1], [4,1], [6,1], [8,1], [10,1],
    [1,2], [3,2], [6,2], [7,2], [9,2], [10,2],
    [2,3], [4,3], [6,3], [8,3], [10,3], [12,3],
    [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [11,4], [12,4],
    [0,5], [2,5], [4,5], [6,5], [10,5], [12,5],
    [0,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [10,6], [11,6], [12,6],
    [0,7], [2,7], [4,7], [8,7], [10,7], [12,7],
    [1,8], [3,8], [4,8], [6,8], [7,8], [10,8], [11,8],
    [2,9], [8,9], [10,9],
    [3,10], [4,10], [5,10], [6,10], [8,10], [9,10]
];

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

module.exports = {draw, map1};
