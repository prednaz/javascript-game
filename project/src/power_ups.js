// @flow

const {ColumnRowPosition} = require("./game_types.js");
import type {Resources} from "./resources.js";

class BombCapacityPowerUp {
    +type: "BombCapacityPowerUp";
    constructor() {
        this.type = "BombCapacityPowerUp";
    }
}

class RunSpeedPowerUp {
    +type: "RunSpeedPowerUp";
    constructor() {
        this.type = "RunSpeedPowerUp";
    }
}

export type PowerUp = BombCapacityPowerUp | RunSpeedPowerUp;

const draw =
    (
        [position, power_up]: [ColumnRowPosition, PowerUp],
        canvas: {context: any, resources: Resources,...},
        grid_scale: number
    ): void =>
    {
        canvas.context.beginPath();
        switch (power_up.type) {
            case "BombCapacityPowerUp": {
                canvas.context.fillStyle = "cyan";
                canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
                canvas.context.drawImage(
                    canvas.resources["power_ups/bomb_capacity"],
                    0,
                    0,
                    25,
                    20,
                    grid_scale * position.column.number + grid_scale * 1 + Math.floor((30-25)/2),
                    grid_scale * position.row.number + grid_scale * 1 + Math.floor((30-20)/2),
                    grid_scale * 25 / 30,
                    grid_scale * 20 / 30
                );
                break;
            }
            case "RunSpeedPowerUp": {
                canvas.context.fillStyle = "cyan";
                canvas.context.fillRect(grid_scale * position.column.number + grid_scale * 1, grid_scale * position.row.number + grid_scale * 1, grid_scale, grid_scale);
                break;
            }
        }
    };

module.exports = {BombCapacityPowerUp, RunSpeedPowerUp, draw};
