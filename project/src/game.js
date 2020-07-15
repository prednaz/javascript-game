// @flow

const player = require("./player.js");
const Player = player.Player;
const bomb = require("./bomb.js");
const Bomb = bomb.Bomb;
const explosion = require("./explosion.js");
const Explosion = explosion.Explosion;
const {Int, round} = require("./int.js");
const {ColumnRowPosition} = require("./game_types.js");
import type {Event, PlayerId} from "./game_types.js";
const map_value_indexed = require("./map_value_indexed.js");
const MapValueIndexed = map_value_indexed.MapValueIndexed;
const set_value_indexed = require("./set_value_indexed.js");
import type {SetValueIndexed} from "./set_value_indexed.js";
const int = require("./int.js");
const R = require("ramda");
const {immerable} = require("immer");

class Game {
    +players: {[PlayerId]: Player};
    +explosions: Array<Explosion>;
    +obstacles: SetValueIndexed<ColumnRowPosition>;
    +coordinate_maximum: {
        +x: Int,
        +y: Int,
    };
    constructor(): void {
        this.players = {};
        this.explosions = [];
        this.obstacles = set_value_indexed.create();
        this.coordinate_maximum = {x: new Int(12), y: new Int(10)}; // to-do. magic numbers
    }
    update(event: Event): void {
        if (event.type === "UserCommandEvent") {
            this.players[event.player_id].user_command(event.command);
        }
        else {
            // update players forwarding event to them
            R.forEachObjIndexed(
                (player_current: Player) =>
                    player_current.update(event, this.coordinate_maximum),
                this.players
            );
            // have the players take damage from bombs
            R.forEachObjIndexed(
                (player_current: Player) => player_current.take_damage(this.explosions),
                this.players
            );
            // remove faded explosions
            const faded_explosions: Array<number> = [];
            this.explosions.forEach(
                (explosion_current: Explosion, index: number) => {
                    if (explosion_current.update(event) === "faded") {
                        faded_explosions.push(index);
                    }
                }
            );
            R.forEach(
                (index: number) => {this.explosions.splice(index, 1);},
                faded_explosions
            );
            // turn exploding bombs into explosions
            R.forEachObjIndexed(
                (player_current: Player) => {
                    const exploding_bombs: Array<ColumnRowPosition> = [];
                    // collect exploding bombs
                    map_value_indexed.traverse_(
                        (bomb: Bomb, position: ColumnRowPosition) => {
                            if (bomb.update(event) === "exploding") {
                                exploding_bombs.push(position);
                                this.explosions.push(
                                    explosion.create(
                                        position,
                                        player_current.bomb_strength,
                                        this.valid_position.bind(this),
                                        this.obstacles
                                    )
                                );
                            }
                        },
                        player_current.bombs
                    );
                    // remove exploding bombs
                    R.forEach(
                        (position: ColumnRowPosition) =>
                            map_value_indexed.remove(position, player_current.bombs),
                        exploding_bombs
                    );
                },
                this.players
            );
        }
    }
    addPlayer(): PlayerId | null {
        const player_id_range: $ReadOnlyArray<PlayerId> =
            ["top_left", "bottom_right", "bottom_left", "top_right"];
        const player_id_new =
            player_id_range.find(player_id => !(player_id in this.players));
        if (player_id_new === undefined) {
            return null;
        }
        const [y_word, x_word] = player_id_new.split("_");
        const y = y_word === "top" ? new Int(0) : this.coordinate_maximum.y;
        const x = x_word === "left" ? 0 : this.coordinate_maximum.x.number;
        this.players[player_id_new] = new Player(new player.RowPosition(y, x));
        return player_id_new;
    }
    deletePlayer(player_id: PlayerId) {
        delete this.players[player_id];
    }
    valid_position(position: ColumnRowPosition): boolean {
        return (
            int.less_or_equals(zero, position.column) &&
            int.less_or_equals(position.column, this.coordinate_maximum.x) &&
            int.less_or_equals(zero, position.row) &&
            int.less_or_equals(position.row, this.coordinate_maximum.y)
        );
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Game[immerable] = true;

const zero = new Int(0);

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
        x: game.coordinate_maximum.x.number + 3, // two walls + one zero index
        y: game.coordinate_maximum.y.number + 3, // two walls + one zero index
    };
    const grid_scale = canvas.width / grid_length.x;
    if (grid_scale !== canvas.height / grid_length.y) {
        throw new RangeError(
            "The canvas has not got the required aspect ratio of " + grid_length.x + ":" + grid_length.y + "."
        );
    }
    // inner holes
    for (let x = 2; x < grid_length.x-2; x += 2) {
        for (let y = 2; y < grid_length.y-2; y += 2) {
            canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * x, grid_scale * y);
        }
    }
    // outer holes
    for (let x = 0; x < grid_length.x; ++x) {
        canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * x, 0);
        canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * x, grid_scale * (grid_length.y-1));
    for (let y = 1; y < grid_length.y-1; ++y) {
        canvas.context.drawImage(canvas.resources.get("hole"), 0, grid_scale * y);
        canvas.context.drawImage(canvas.resources.get("hole"), grid_scale * (grid_length.x-1), grid_scale * y);
        }
    }
    // explosions
    R.forEach(
        (explosion_current: Explosion) => {
            explosion.draw(explosion_current, canvas, grid_scale);
        },
        game.explosions
    );
    // bombs
    R.forEachObjIndexed(
        (player_current: Player) => {
            map_value_indexed.itraverse_(
                bomb_current => bomb.draw(bomb_current, canvas, grid_scale),
                player_current.bombs
            );
        },
        game.players
    );
    // players
    R.forEachObjIndexed(
        (player_current: Player) => {player.draw(player_current, canvas, grid_scale)},
        game.players
    );
};

module.exports = {Game, draw};
