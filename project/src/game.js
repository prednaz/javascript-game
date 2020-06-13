// @flow

const {last} = require("./utilities.js");

const canvas = (document.getElementById("canvas"): any);
const context = canvas.getContext("2d");

type Event =
    {type: "key_down", key: Key} |
    {type: "key_up", key: Key} |
    {type: "tick", time: number};
export type Key = string;

class Game {
    player: Array<Player>;
    constructor(): void {
        this.player = [new Player()];
    }
    update(event: Event, keys_pressed: Array<Key>): void {
        this.player.forEach(
            player_current => player_current.update(event, keys_pressed)
        );
    }
    draw(): void {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.player.forEach(player_current => player_current.draw());
    }
}

class Player {
    position: {x: number, y: number};
    run_speed: number;
    constructor() {
        this.position = {x: 100, y: 100};
        this.run_speed = .5;
    }
    draw(): void {
        context.beginPath();
        context.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
        context.stroke();
    }
    update(event: Event, keys_pressed: Array<Key>): void {
        if (event.type === "tick") {
            const keys_pressed_move =
                  keys_pressed.filter(key => ["w", "a", "s", "d"].includes(key));
            if (keys_pressed_move.length === 0)
                return;
            const key_pressed = last(keys_pressed_move);
            const direction = (key_pressed === "w" || key_pressed === "a") ? -1 : 1;
            const dimension = (key_pressed === "w" || key_pressed === "s") ? "y" : "x";
            const distance = this.run_speed * event.time;
            this.position[dimension] += direction * distance;
        }
    }
}

module.exports = Game;
