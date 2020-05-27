"use strict";

const Game = require("../output/Game");
const Ui = require("../output/Ui");

let step_count = 0;
let game_state = Game.initialState;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let timestamp_previous = -1;

document.addEventListener(
  "keydown",
  event => {game_state = Game.update(game_state)(Ui.KeyDown.create(event.key));}
);
document.addEventListener(
  "keyup",
  event => {game_state = Game.update(game_state)(Ui.KeyUp.create(event.key));}
);

const main =
  timestamp => {
    ++step_count;
    if (timestamp_previous !== -1)
      game_state = Game.update(game_state)(Ui.Tick.create(timestamp - timestamp_previous));
    context.clearRect(0, 0, canvas.width, canvas.height);
    Game.draw(game_state)(context)();
    timestamp_previous = timestamp;
    // if (step_count < 300)
    requestAnimationFrame(main);
  };

module.exports = () => requestAnimationFrame(main);
