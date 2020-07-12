// @flow

const player = require("./player.js");
const Player = player.Player;
const bomb = require("./bomb.js");
const Bomb = bomb.Bomb;
const {Int, round} = require("./int.js");
const map_value_indexed = require("./map_value_indexed.js");
const {ColumnRowPosition} = require("./game_types.js");
import type {Event, PlayerId} from "./game_types.js";
const R = require("ramda");
const {immerable} = require("immer");

class Game {
    +player: {[PlayerId]: Player};
    +coordinate_maximum: {
        +x: number,
        +y: number,
    };
    constructor(): void {
        this.player = {};
        this.coordinate_maximum = {x: 12, y: 10};
    }
    update(event: Event): void {
        if (event.type === "UserCommandEvent") {
            this.player[event.player_id].user_command(event.command);
        }
        else {
            R.forEachObjIndexed(
                player_current => player_current.update(event, this.coordinate_maximum),
                this.player
            );
            R.forEachObjIndexed(
                player_current => {
                    const exploding_bombs: Array<ColumnRowPosition> = [];
                    map_value_indexed.traverse_(
                        (bomb: Bomb, position: ColumnRowPosition) => {
                            if (bomb.update(event) === "exploding") {
                                exploding_bombs.push(position);
                            }
                        },
                        player_current.bombs
                    );
                    R.forEach(
                        position => map_value_indexed.remove(position, player_current.bombs),
                        exploding_bombs
                    );
                },
                this.player
            );
        }
    }
    addPlayer(): PlayerId | null {
        const player_id_range: Array<PlayerId> =
            ["top_left", "bottom_right", "bottom_left", "top_right"];
        const player_id_new =
            player_id_range.find(player_id => !(player_id in this.player));
        if (player_id_new === undefined) {
            return null;
        }
        const [y_word, x_word] = player_id_new.split(" ");
        const y = y_word === "top" ? new Int(0) : round(this.coordinate_maximum.y);
        const x = x_word === "left" ? 0 : this.coordinate_maximum.x;
        this.player[player_id_new] = new Player(new player.RowPosition(y, x));
        return player_id_new;
    }
    deletePlayer(player_id: PlayerId) {
        delete this.player[player_id];
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Game[immerable] = true;

const draw =
    (
        game: Game,
        canvas: {width: number, height: number, context: any, resources: Map<string, HTMLElement>,...}
    ): void =>
    {
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
    R.forEachObjIndexed(
        player_current => {
            map_value_indexed.traverse_(
                (bomb_current, position) => bomb.draw(canvas, grid_scale, position),
                player_current.bombs
            );
        },
        game.player
    );
    R.forEachObjIndexed(
        player_current => {player.draw(player_current, canvas, grid_scale)},
        game.player
    );
};

module.exports = {Game, draw};
