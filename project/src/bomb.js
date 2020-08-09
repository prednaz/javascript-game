// @flow

import type {ColumnRowPosition} from "./game_types.js";
import type {Event, PlayerId} from "./game_types.js";
const int = require("./int.js");
const Int = int.Int;
import type {Resources} from "./resources.js";
const {immerable} = require("immer");

const animation_frame_duration = 130;
const animation_frame_count = new Int(2);
const animation_frame_width = 25;
const animation_frame_height = 20;

class Bomb {
    fuse: number;
    animation_frame: Int;
    time_since_animation_frame: number;
    constructor(): void {
        this.fuse = 2600;
        this.animation_frame = new Int(0);
        this.time_since_animation_frame = 0;
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

const update_animation =
    (
        bomb: Bomb,
        time: number
    ): void =>
    {
        bomb.time_since_animation_frame += time;
        while (bomb.time_since_animation_frame >= animation_frame_duration) {
            bomb.animation_frame =
                int.modulo(int.successor(bomb.animation_frame), animation_frame_count);
            bomb.time_since_animation_frame -= animation_frame_duration;
        }
    };

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
        [position, bomb]: [ColumnRowPosition, Bomb],
        color: PlayerId,
        canvas: Canvas,
        grid_scale: number
    ): void =>
    {
        canvas.foreground.context.drawImage(
            canvas.resources["bomb/frame" + bomb.animation_frame.number + "_" + color],
            grid_scale * position.column.number + grid_scale * 1 + (canvas.resources_grid_scale - animation_frame_width) / 2,
            grid_scale * position.row.number + grid_scale * 1 + (canvas.resources_grid_scale - animation_frame_height) / 2,
            grid_scale * animation_frame_width / canvas.resources_grid_scale,
            grid_scale * animation_frame_height / canvas.resources_grid_scale
        );
    };

module.exports = {Bomb, update_animation, draw};
