// @flow

const socket = require("socket.io-client")();

const {last, resources_get} = require("../utilities.js");
const {KeyDownEvent, KeyUpEvent} = require("../ui_types");
const {Game, draw} = require("../game");
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);

let keys_pressed: Array<string> = []; // to-do. Set
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
        if (last(keys_pressed) === event.key)
            return;
        keys_pressed.push(event.key);
        socket.emit("input", new KeyDownEvent(event.key));
    }
);
document.addEventListener(
    "keyup",
    (event: KeyboardEvent) => {
        keys_pressed = keys_pressed.filter(key => key !== event.key);
        socket.emit("input", new KeyUpEvent(event.key));
    }
);

let step_count: number = 0; // to-do. remove
const loop =
    (): void => {
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
