// @flow

const {update_animation, draw} = require("../game.js");
import type {Game} from "../game.js";
import type {Player} from "../player.js";
const {Accelerate, Decelerate, PlantBomb} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {with_resources, resources_grid_scale, generate_sources_fields} =
    require("../resources.js");
import type {Resources} from "../resources.js";
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
    let player_id: PlayerId;
    const canvas_foreground_dom = (document.getElementById("canvas_foreground"): any);
    const canvas_background_dom = (document.getElementById("canvas_background"): any);
    const canvas = {
        foreground : {
            width: canvas_foreground_dom.width,
            height: canvas_foreground_dom.height,
            context: canvas_foreground_dom.getContext("2d"), // to-do. Is there a better type for this than any?
        },
        background : {
            width: canvas_background_dom.width,
            height: canvas_background_dom.height,
            context: canvas_background_dom.getContext("2d"), // to-do. Is there a better type for this than any?
        },
        resources: resources,
        resources_grid_scale: resources_grid_scale
    };
  
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
            draw_user_interface(game_state, player_id, canvas);
            draw(game_state, canvas);
            requestAnimationFrame(loop);
            timestamp_previous = timestamp;
        };

    socket.on("state", ([state, player_id_new]: [Game, PlayerId]) => {
        game_state = state;
        player_id = player_id_new;
        requestAnimationFrame((timestamp: number) => {
            timestamp_previous = timestamp;
            requestAnimationFrame(loop);
        });
        socket.on("update", patches => {
            game_state = immer.applyPatches(game_state, patches);
        });
    });
    socket.emit("ready"); // ensure, the state event is not triggered before its listener is added

    document.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === key_pressed_last) {
                return;
            }
            key_pressed_last = key;
            if (key in controls.down) {
                socket.emit("user command", controls.down[key]);
            }
        }
    );
    document.addEventListener(
        "keyup",
        (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            key_pressed_last = null;
            if (key in controls.up) {
                socket.emit("user command", controls.up[key]);
            }
        }
    );
});

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

const draw_user_interface =
    (game: Game, player_id: PlayerId, canvas: Canvas): void =>
    {
        // background image
        canvas.background.context.drawImage(
            canvas.resources["background"],
            0,
            0,
            canvas.background.width,
            canvas.background.height
        );
        

        const ctx = canvas.background.context;
        
        // Rahmen
        if (player_id === "top_left") {
            ctx.strokeStyle = "#2E9AFE";
            ctx.strokeRect(
                8,
                70,
                76,
                64
            )
        }
        else if (player_id === "bottom_right") {
            ctx.strokeStyle = "#DF0101";
            ctx.strokeRect(
                8,
                133,
                76,
                64
            )
        }
        else if (player_id === "bottom_left") {
            ctx.strokeStyle = "#9A2EFE";
            ctx.strokeRect(
                8,
                197,
                76,
                64
            )
        }
        else if (player_id === "top_right") {
            ctx.strokeStyle = "#58FA58";
            ctx.strokeRect(
                8,
                261,
                76,
                64
            )
        }

        // life count
        R.forEachObjIndexed(
            (player_current: Player, player_id_current: PlayerId) => {
                ctx.font = "10px serif";
                ctx.fillStyle = "white";
                if (player_id_current === "top_left"){
                    ctx.fillText(player_current.life_count.number.toString(), 63, 126, 20);
                }
                else if (player_id_current === "bottom_right") {
                    ctx.fillText(player_current.life_count.number.toString(), 63, 190, 20);
                }
                else if (player_id_current === "bottom_left") {
                    ctx.fillText(player_current.life_count.number.toString(), 63, 254, 20);
                }
                else if (player_id_current === "top_right") {
                    ctx.fillText(player_current.life_count.number.toString(), 63, 318, 20);
                }
            },
            game.players
        );
    };

const to_list =
    <Key, Value>(object: {[Key]: Value}): Array<[Key, Value]> =>
    (Object.entries(object): any);
