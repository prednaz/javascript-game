// @flow

const player = require("./player.js");
const Player = player.Player;
import type {Event} from "./ui_types";
const {immerable} = require("immer");

class Game {
    +player: Array<Player>;
    +coordinate_maximum: {
        +x: number,
        +y: number,
    };
    constructor(json: any): void {
        if (json === undefined) {
            this.player = [new Player()];
            this.coordinate_maximum = {x: 12, y: 10};
        }
        else { // unmarshalling
            this.player = [];
            for (const player of json.player) {
                this.player.push(new Player(player));
            }
            this.coordinate_maximum = json.coordinate_maximum;
        }
    }
    update(event: Event): void {
        this.player.forEach(
            player_current => player_current.update(event, this.coordinate_maximum)
        );
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Game[immerable] = true;

const draw = (game: Game, canvas: {width: number, height: number, context: any, resources: Map<string, HTMLElement>,...}): void => {
     // to-do. refactor
     // to-do. seperate background canvas
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    // to-do. cache these
    const grid_length = {
        x: game.coordinate_maximum.x + 3, // two walls + one zero index
        y: game.coordinate_maximum.y + 3, // two walls + one zero index
    };
    const grid_scale = canvas.width / grid_length.x;
    if (grid_scale !== canvas.height / grid_length.y) {
        throw new RangeError(
            "The canvas has not got the required aspect ratio of " + grid_length.x + ":" + grid_length.y + "."
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
    game.player.forEach(player_current => player.draw(player_current, canvas, grid_scale));
};

module.exports = {Game, draw};
