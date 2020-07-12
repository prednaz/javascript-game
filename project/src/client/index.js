// @flow

const {Game, draw} = require("../game.js");
const {Accelerate, Decelerate, PlantBomb} = require("../game_types.js");
const {resources_get} = require("../utilities.js");
const R = require("ramda");
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);
const socket = require("socket.io-client")();

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
    resources: resources_get(["hole"]),
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

const lives_display = document.getElementById("lives"); // to-do. remove
if (lives_display === null) {
    throw new ReferenceError("Where is the lives display?");
}
const loop =
    (): void =>
    {
        draw(game_state, canvas);
        requestAnimationFrame(loop);
        let lives_display_text = "";
        R.forEachObjIndexed(
            (player, player_id) => {lives_display_text += player_id + ": " + player.lives.number + "\n"},
            game_state.player
        );
        lives_display.textContent = lives_display_text;
    };

socket.on("state", state => {
    game_state = state;
    requestAnimationFrame(loop);
});

socket.on("update", patches => {
    game_state = immer.applyPatches(game_state, patches);
});
