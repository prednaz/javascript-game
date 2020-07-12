// @flow

const {Game} = require("../game.js");
const {UserCommandEvent, Tick} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {performance} = require('perf_hooks');
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);
import type {Patch} from "../../node_modules/immer/dist/index.js";
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {serveClient: false});

let game_state: Game = new Game();
let timestamp_previous: number = -1;

let step_count: number = 0; // to-do. remove
const loop =
    (): void =>
    {
        const timestamp = performance.now();
        if (timestamp_previous !== -1) {
            game_state = update_and_synchronize(game_state, draft => {
                draft.update(new Tick(timestamp - timestamp_previous));
            });
            if (step_count % 1000 === 0) {
                console.log(timestamp - timestamp_previous);
            }
        }
        timestamp_previous = timestamp;
        // if (step_count % 100 === 0)
        //     console.log(keys_pressed);
        ++step_count;
    };

setInterval(loop, 13);

io.on("connection", socket => {
    socket.emit("state", game_state);
    let player_id_new: PlayerId | null = null;
    let patches: Array<Patch>;
    // $FlowFixMe https://github.com/immerjs/immer/pull/632
    [game_state, patches] = immer.produceWithPatches(game_state, draft => {
        player_id_new = draft.addPlayer();
    });
    const player_id_new_copy = player_id_new; // I do as Flow guides.
    if (player_id_new_copy === null) {
        return; // to-do. Notify the client of the game being full.
    }
    io.emit("update", patches);
    socket.on("user command", command => {
        game_state = update_and_synchronize(game_state, draft => {
            draft.update(new UserCommandEvent(player_id_new_copy, command));
        });
    });
    socket.on('disconnect', () => {
        game_state = update_and_synchronize(game_state, draft => {
            draft.deletePlayer(player_id_new_copy);
        });
    });
});

app.use(express.static("dist"));

http.listen(1234, () => {
    console.log("listening on *:1234");
});

const update_and_synchronize =
    (game_state_parameter: Game, update: (draft: Game) => void): Game =>
    {
        const [game_state_new: Game, patches: Array<Patch>] =
            // $FlowFixMe https://github.com/immerjs/immer/pull/632
            immer.produceWithPatches(game_state_parameter, update);
        io.emit("update", patches);
        return game_state_new;
    };
