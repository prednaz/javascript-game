// @flow

const {Game, draw} = require("../game.js");
const {Player} = require("../player.js");
const {Accelerate, Decelerate, PlantBomb} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {with_resources} = require("../resources.js");
const R = require("ramda");
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);
const socket = require("socket.io-client")();

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
    const canvas = {
        width: canvas_dom.width,
        height: canvas_dom.height,
        context: canvas_dom.getContext("2d"), // to-do. Is there a better type for this than any?
        resources: resources,
    };

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

    const life_count_display = document.getElementById("life_count"); // to-do. remove
    if (life_count_display === null) {
        throw new ReferenceError("Where is the life count display?");
    }
    const loop =
        (): void =>
        {
            draw(game_state, canvas);
            requestAnimationFrame(loop);
            let life_count_display_text = "";
            R.forEachObjIndexed(
                (player: Player, player_id: PlayerId) => {life_count_display_text += player_id + ": " + player.life_count.number + "\n"},
                game_state.players
            );
            life_count_display.textContent = life_count_display_text;
        };

    socket.on("state", state => {
        game_state = state;
        requestAnimationFrame(loop);
    });

    socket.on("update", patches => {
        game_state = immer.applyPatches(game_state, patches);
    });
});