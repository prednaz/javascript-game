// @flow

const Player = require("./player.js");
const R = require("ramda");
import type {Event} from "./ui_types";

class Game {
    +player: Array<Player>;
    +coordinate_maximum: {
        +x: number,
        +y: number,
    };
    constructor(): void {
        this.player = [new Player()];
        this.coordinate_maximum = {x: 12, y: 10};
    }
    update(event: Event, keys_pressed: Array<string>): void {
        R.forEach(
            player_current => player_current.update(event, keys_pressed, this.coordinate_maximum),
            this.player
        );
    }
    draw(canvas: {width: number, height: number, context: any, resources: Map<string, HTMLElement>,...}): void {
         // to-do. refactor
         // to-do. seperate background canvas
        canvas.context.clearRect(0, 0, canvas.width, canvas.height);
        // to-do. cache these
        const grid_length = {
            x: this.coordinate_maximum.x + 3, // two walls + one zero index
            y: this.coordinate_maximum.y + 3, // two walls + one zero index
        };
        const grid_scale = canvas.width / grid_length.x;
        if (grid_scale !== canvas.height / grid_length.y) {
            throw new RangeError(
                "The canvas has got the required aspect ratio of " + grid_length.x + ":" + grid_length.y + "."
            );
        }
        for (let x = 2; x < grid_length.x-2; x += 2) {
            for (let y = 2; y < grid_length.y-2; y += 2) {
                canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * x, grid_scale * y);
            }
        }
        for (let x = 0; x < grid_length.x; ++x) {
            canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * x, 0);
            canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * x, grid_scale * (grid_length.y-1));
        for (let y = 1; y < grid_length.y-1; ++y) {
            canvas.context.drawImage(canvas.resources.get("hole"), 0, grid_scale * y);
            canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * (grid_length.x-1), grid_scale * y);
            }
        }
        R.forEach(player_current => player_current.draw(canvas, grid_scale), this.player);
    }
}

module.exports = Game;
