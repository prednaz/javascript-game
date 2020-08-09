// @flow

const player = require("./player.js");
const AlivePlayer = player.AlivePlayer;
const DeadPlayer = player.DeadPlayer;
import type {Player} from "./player.js";
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
        this.obstacles = set_value_indexed.create([]);
        for (let i = 2; i < 12; i += 2)
            for (let j = 2; j < 10; j += 2)
                set_value_indexed.insert(
                    new ColumnRowPosition(new Int(i), new Int(j)), this.obstacles);
        this.power_ups = new MapValueIndexed([]);
        this.coordinate_maximum = {x: new Int(12), y: new Int(10)};
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
                    if (player_current.type === "DeadPlayer") {
                        return;
                    }

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
                                        player_current.power_up_run_speed();
                                        break;
                                    }
                                    case "bomb_strength": {
                                        player_current.power_up_bomb_strength();
                                        break;
                                    }
                                    case "life_count": {
                                        player_current.power_up_life_count();
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
            // kill players having no lives left
            R.forEach(
                (player_id: PlayerId) => {
                    if (int.less_or_equals(this.players[player_id].life_count, zero)) {
                        this.players[player_id] = new DeadPlayer();
                    }
                },
                Object.keys(this.players)
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
                (player_current: Player, player_id: PlayerId) => {
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
                                        this.clear_of_obstacles.bind(this),
                                        player_id
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
        this.players[player_id_new] = new AlivePlayer(new player.RowPosition(y, x));
        return player_id_new;
    }
    deleteAlivePlayer(player_id: PlayerId) {
        if (this.players[player_id].type === "AlivePlayer") {
            delete this.players[player_id];
        }
    }
    explode_obstacles(explosion_new: Explosion): void {
        set_value_indexed.forEach(
            (scorched_position: ColumnRowPosition) => {
                if (set_value_indexed.member(scorched_position, this.obstacles)) {
                    set_value_indexed.remove(
                        scorched_position,
                        this.obstacles
                    );
                    const random = Math.random();
                    const power_up = Math.random() * 4;
                    if (random <= 0.75) {
                        if (power_up < 1.4) {
                            map_value_indexed.insert(
                            scorched_position, "bomb_capacity", this.power_ups);
                        }
                        else if (power_up < 2) {
                            map_value_indexed.insert(
                            scorched_position, "run_speed", this.power_ups);
                        }
                        else if (power_up < 3.4) {
                            map_value_indexed.insert(
                            scorched_position, "bomb_strength", this.power_ups);
                        }
                        else if (power_up < 4) {
                            map_value_indexed.insert(
                            scorched_position, "life_count", this.power_ups);
                        }
                    }
                }
            },
            explosion_new.scorched_positions()
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

const update_animation =
    (
        game: Game,
        time: number
    ): void =>
    {
        // bombs
        R.forEachObjIndexed(
            (player_current: Player) => {
                map_value_indexed.forEach(
                    bomb_current => bomb.update_animation(bomb_current, time),
                    player_current.bombs
                );
            },
            game.players
        );
        // player
        R.forEachObjIndexed(
            (player_current: Player) => player.update_animation(player_current, time),
            game.players
        );
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
    (game: Game, canvas: Canvas): void =>
    {
        // to-do. refactor
        // to-do. seperate background canvas
        canvas.foreground.context.clearRect(0, 0, canvas.foreground.width, canvas.foreground.height);
        // to-do. cache these
        const grid_length = {
            x: game.coordinate_maximum.x.number + 3, // two walls + one zero index
            y: game.coordinate_maximum.y.number + 3, // two walls + one zero index
        };
        const grid_scale = canvas.foreground.width / grid_length.x;
        if (grid_scale !== canvas.foreground.height / grid_length.y) {
            throw new RangeError(
                "The canvas has not got the required aspect ratio of " + grid_length.x + ":" + grid_length.y + "."
            );
        }
        
        // inner holes
        for (let x = 2; x < grid_length.x-2; x += 2) {
            for (let y = 2; y < grid_length.y-2; y += 2) {
                canvas.foreground.context.drawImage(
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
            canvas.foreground.context.drawImage(
                canvas.resources["hole"],
                grid_scale * x,
                0,
                grid_scale,
                grid_scale
            );
            canvas.foreground.context.drawImage(
                canvas.resources["hole"],
                grid_scale * x,
                grid_scale * (grid_length.y-1),
                grid_scale,
                grid_scale
            );
        for (let y = 1; y < grid_length.y-1; ++y) {
            canvas.foreground.context.drawImage(
                canvas.resources["hole"],
                0,
                grid_scale * y,
                grid_scale,
                grid_scale
            );
            canvas.foreground.context.drawImage(
                canvas.resources["hole"],
                grid_scale * (grid_length.x-1),
                grid_scale * y,
                grid_scale,
                grid_scale
            );
            }
        }
        // power_ups
        map_value_indexed.forEachIndexed(
            power_up_current => power_up.draw(power_up_current, canvas, grid_scale),
            game.power_ups
        );

        // obstacles
        set_value_indexed.forEach(
            position => obstacle.draw(position, canvas, grid_scale),
            game.obstacles
        );
        
        // explosions
        R.forEach(
            (explosion_current: Explosion) =>
                explosion.draw(explosion_current, canvas, grid_scale),
            game.explosions
        );
        // bombs
        R.forEachObjIndexed(
            (player_current: Player, player_id: PlayerId) => {
                map_value_indexed.forEachIndexed(
                    bomb_current => bomb.draw(bomb_current, player_id, canvas, grid_scale),
                    player_current.bombs
                );
            },
            game.players
        );
        // players
        R.forEachObjIndexed(
            (player_current: Player, player_id: PlayerId) =>
                player.draw(player_current, player_id, canvas, grid_scale),
            game.players
        );
    };

module.exports = {Game, update_animation, draw};
