// @flow

const {Game, draw} = require("../game.js");
const {Accelerate, Decelerate, PlantBomb} = require("../game_types.js");
const {resources_get} = require("../utilities.js");
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

let step_count: number = 0; // to-do. remove
const loop =
    (): void =>
    {
        draw(game_state, canvas);
        // if (step_count < 300)
        requestAnimationFrame(loop);
        // if (step_count % 100 === 0)
        //     console.log(keys_pressed);
        ++step_count;
    };

socket.on("state", state => {
    game_state = state;
    requestAnimationFrame(loop);
});

socket.on("update", patches => {
    game_state = immer.applyPatches(game_state, patches);
});
