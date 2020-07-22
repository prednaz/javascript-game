// @flow

const player = require("./player.js");
const Player = player.Player;
const bomb = require("./bomb.js");
import type {Bomb} from "./bomb.js";
const explosion = require("./explosion.js");
const Explosion = explosion.Explosion;
const obstacle = require("./obstacle.js");
const power_up = require("./power_up.js");
import type {PowerUp} from "./power_up.js";
const {Int} = require("./int.js");
const {ColumnRowPosition} = require("./game_types.js");
import type {Event, PlayerId} from "./game_types.js";
const map_value_indexed = require("./map_value_indexed.js");
const MapValueIndexed = map_value_indexed.MapValueIndexed;
const set_value_indexed = require("./set_value_indexed.js");
import type {SetValueIndexed} from "./set_value_indexed.js";
const int = require("./int.js");
import type {Resources} from "./resources.js";
const R = require("ramda");
const {immerable} = require("immer");

class Game {
    +players: {[PlayerId]: Player};
    +explosions: Array<Explosion>;
    +obstacles: SetValueIndexed<ColumnRowPosition>;
    +power_ups: MapValueIndexed<ColumnRowPosition, PowerUp>
    +coordinate_maximum: {
        +x: Int,
        +y: Int,
    };
    constructor(): void {
        this.players = {};
        this.explosions = [];
        this.obstacles = set_value_indexed.create([
            new ColumnRowPosition(new Int(3), new Int(0)),
            new ColumnRowPosition(new Int(2), new Int(1)),
            new ColumnRowPosition(new Int(4), new Int(1)),
            new ColumnRowPosition(new Int(1), new Int(2)),
            new ColumnRowPosition(new Int(3), new Int(2)),
            new ColumnRowPosition(new Int(6), new Int(2)),
            new ColumnRowPosition(new Int(2), new Int(3)),
            new ColumnRowPosition(new Int(4), new Int(3)),
            new ColumnRowPosition(new Int(1), new Int(4)),
            new ColumnRowPosition(new Int(2), new Int(4)),
            new ColumnRowPosition(new Int(0), new Int(5)),
            new ColumnRowPosition(new Int(2), new Int(5)),
            new ColumnRowPosition(new Int(0), new Int(6)),
            new ColumnRowPosition(new Int(2), new Int(6)),
            new ColumnRowPosition(new Int(0), new Int(7)),
            new ColumnRowPosition(new Int(2), new Int(7)),
            new ColumnRowPosition(new Int(1), new Int(8)),
        ]);
        this.power_ups = new MapValueIndexed([
            [new ColumnRowPosition(new Int(4), new Int(2)), "bomb_capacity"],
            [new ColumnRowPosition(new Int(7), new Int(2)), "run_speed"],
        ]);
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
                    player_current.update(
                        event,
                        this.free_position.bind(this)
                    ),
                this.players
            );
            // power up players
            R.forEachObjIndexed(
                (player_current: Player) => {
                    R.forEach(
                        (position: ColumnRowPosition) => {
                            const power_up_maybe =
                                map_value_indexed.lookup(position, this.power_ups);
                            if (power_up_maybe !== null) {
                                switch (power_up_maybe) {
                                    case "bomb_capacity": {
                                        player_current.power_up_bomb_capacity();
                                        break;
                                    }
                                    case "run_speed": {
                                        break;
                                    }
                                }
                                map_value_indexed.remove(position, this.power_ups);
                            }
                        },
                        player_current.touched_positions()
                    );
                },
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
                    map_value_indexed.forEachIndexed(
                        ([position, bomb]: [ColumnRowPosition, Bomb]) => {
                            if (bomb.update(event) === "exploding") {
                                exploding_bombs.push(position);
                                const explosion_new =
                                    new Explosion(
                                        position,
                                        player_current.bomb_strength,
                                        this.on_map.bind(this),
                                        this.clear_of_obstacles.bind(this)
                                    );
                                this.explosions.push(explosion_new);
                                this.explode_obstacles(explosion_new);
                            }
                        },
                        player_current.bombs
                    );
                    // remove exploding bombs
                    R.forEach(
                        R.flip(map_value_indexed.remove)(player_current.bombs),
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
            R.find(player_id => !(player_id in this.players), player_id_range);
        if (player_id_new === null || player_id_new === undefined) {
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
    explode_obstacles(explosion_new: Explosion): void {
        set_value_indexed.remove_all(
            explosion_new.scorched_positions(),
            this.obstacles
        );
    }
    clear_of_obstacles(position: ColumnRowPosition): boolean {
        return !set_value_indexed.member(position, this.obstacles);
    }
    on_map(position: ColumnRowPosition): boolean {
        return (
            int.less_or_equals(zero, position.column) &&
            int.less_or_equals(position.column, this.coordinate_maximum.x) &&
            int.less_or_equals(zero, position.row) &&
            int.less_or_equals(position.row, this.coordinate_maximum.y)
        );
    }
    free_position(position: ColumnRowPosition): boolean {
        return this.clear_of_obstacles(position) && this.on_map(position);
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
Game[immerable] = true;

const zero = new Int(0);

const draw =
    (
        game: Game,
        canvas: {width: number, height: number, context: any, resources: Resources,...}
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
            canvas.context.drawImage(
                canvas.resources["hole"],
                grid_scale * x,
                grid_scale * y,
                grid_scale,
                grid_scale
            );
        }
    }
    // outer holes
    for (let x = 0; x < grid_length.x; ++x) {
        canvas.context.drawImage(
            canvas.resources["hole"],
            grid_scale * x,
            0,
            grid_scale,
            grid_scale
        );
        canvas.context.drawImage(
            canvas.resources["hole"],
            grid_scale * x,
            grid_scale * (grid_length.y-1),
            grid_scale,
            grid_scale
        );
    for (let y = 1; y < grid_length.y-1; ++y) {
        canvas.context.drawImage(
            canvas.resources["hole"],
            0,
            grid_scale * y,
            grid_scale,
            grid_scale
        );
        canvas.context.drawImage(
            canvas.resources["hole"],
            grid_scale * (grid_length.x-1),
            grid_scale * y,
            grid_scale,
            grid_scale
        );
        }
    }
    // obstacles
    set_value_indexed.forEach(
        position => obstacle.draw(position, canvas, grid_scale),
        game.obstacles
    );
    // power_ups
    map_value_indexed.forEachIndexed(
        power_up_current => power_up.draw(power_up_current, canvas, grid_scale),
        game.power_ups
    );
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
            map_value_indexed.forEachIndexed(
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
