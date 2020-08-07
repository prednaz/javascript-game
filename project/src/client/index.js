// @flow

const {update_animation, draw} = require("../game.js");
import type {Game} from "../game.js";
import type {Player} from "../player.js";
const {Accelerate, Decelerate, PlantBomb} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {with_resources, resources_grid_scale, generate_sources_fields} =
    require("../resources.js");
const R = require("ramda");
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);
const socket = require("socket.io-client")({transports: ['websocket']});

// `copy(resources)` in the browser's console
// will copy the fields for `sources` in resources.js
// to-do. remove
window.resources = generate_sources_fields();
 
with_resources(resources => {
    const controls = {
        down: {
            "w": new Accelerate("up"),
            "a": new Accelerate("left"),
            "s": new Accelerate("down"),
            "d": new Accelerate("right"),
            " ": new PlantBomb()
        },
        up: {
            "w": new Decelerate("up"),
            "a": new Decelerate("left"),
            "s": new Decelerate("down"),
            "d": new Decelerate("right")
        }
    };
    let key_pressed_last: string | null = null;
    let game_state: Game;
    const canvas_dom = (document.getElementById("canvas"): any);
    const canvas_background_dom = (document.getElementById("canvas_background"): any);
    const canvas = {
        foreground : {
            width: canvas_dom.width,
            height: canvas_dom.height,
            context: canvas_dom.getContext("2d"), // to-do. Is there a better type for this than any?
        },
        background : {
            width: canvas_background_dom.width,
            height: canvas_background_dom.height,
            context: canvas_background_dom.getContext("2d"), // to-do. Is there a better type for this than any?
        },
        resources: resources,
        resources_grid_scale: resources_grid_scale
    };
  
    const life_count_display = document.getElementById("life_count"); // to-do. remove
    if (life_count_display === null) {
        throw new ReferenceError("Where is the life count display?");
    }
    let timestamp_previous: number;
    const loop =
        (timestamp: number): void =>
        {
            game_state =
                immer.produce(
                    game_state,
                    (draft: Game) =>
                        update_animation(draft, timestamp - timestamp_previous)
                );
            draw(game_state, canvas);
            life_count_display.textContent =
                R.join(
                    "",
                    R.map(
                        ([player_id, player]: [PlayerId, Player]): string =>
                            player_id + ": " + player.life_count.number + "\n",
                        to_list(game_state.players)
                    )
                );
            requestAnimationFrame(loop);
            timestamp_previous = timestamp;
        };

    socket.on("state", state => {
        game_state = state;
        requestAnimationFrame((timestamp: number) => {
            timestamp_previous = timestamp;
            requestAnimationFrame(loop);
        });
        socket.on("update", patches => {
            game_state = immer.applyPatches(game_state, patches);
        });
    });
    socket.emit("ready");

    document.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
            if (event.key === key_pressed_last)
                return;
            key_pressed_last = event.key;
            if (event.key in controls.down) {
                socket.emit("user command", controls.down[event.key]);
            }
        }
    );
    document.addEventListener(
        "keyup",
        (event: KeyboardEvent) => {
            key_pressed_last = null;
            if (event.key in controls.up) {
                socket.emit("user command", controls.up[event.key]);
            }
        }
    );
});

const to_list =
    <Key, Value>(object: {[Key]: Value}): Array<[Key, Value]> =>
    (Object.entries(object): any);
