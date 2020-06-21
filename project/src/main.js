// @flow

const Game = require("./game");
const {last, resources_get} = require("./utilities.js");
const {KeyDownEvent, KeyUpEvent, TickEvent} = require("./ui_types");

const game_state: Game = new Game();
let timestamp_previous: number = -1;
let keys_pressed: Array<string> = []; // to-do. Set?
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
        game_state.update(new KeyDownEvent(event.key), keys_pressed);
    }
);
document.addEventListener(
    "keyup",
    (event: KeyboardEvent) => {
        keys_pressed = keys_pressed.filter(key => key !== event.key);
        game_state.update(new KeyUpEvent(event.key), keys_pressed);
    }
);

let step_count: number = 0;
const main =
    (timestamp: number): void => {
        if (timestamp_previous !== -1) {
            game_state.update(new TickEvent(timestamp - timestamp_previous), keys_pressed);
        }
        game_state.draw(canvas);
        timestamp_previous = timestamp;
        // if (step_count < 300)
        requestAnimationFrame(main);
        // if (step_count % 100 === 0)
        //     console.log(keys_pressed);
        ++step_count;
    };

module.exports = (): AnimationFrameID => requestAnimationFrame(main);
