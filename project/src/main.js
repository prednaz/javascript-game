// @flow

import type {Key} from "./game";
const Game = require("./game");
const {last} = require("./utilities.js");

let step_count: number = 0;
const game_state: Game = new Game();
let timestamp_previous: number = -1;
let keys_pressed: Array<Key> = []; // to-do. Set?

document.addEventListener(
    "keydown",
    (event: KeyboardEvent): void => {
        if (last(keys_pressed) === event.key)
            return;
        game_state.update({type: "key_down", key: event.key}, keys_pressed);
        keys_pressed.push(event.key);
    }
);
document.addEventListener(
    "keyup",
    (event: KeyboardEvent): void => {
        game_state.update({type: "key_up", key: event.key}, keys_pressed);
        keys_pressed = keys_pressed.filter(key => key !== event.key);
    }
);

const main =
    (timestamp: number): void => {
        ++step_count;
        if (timestamp_previous !== -1) {
            game_state.update(
                {type: "tick", time: timestamp - timestamp_previous},
                keys_pressed
            );
        }
        game_state.draw();
        timestamp_previous = timestamp;
        // if (step_count < 300)
        requestAnimationFrame(main);
    };

module.exports = (): AnimationFrameID => requestAnimationFrame(main);
