// @flow

const {Game} = require("../game.js");
const {UserCommandEvent, Tick} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {performance} = require('perf_hooks');
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {serveClient: false});

let game_state: Game = new Game();
let timestamp_previous: number = -1;

let step_count: number = 0; // to-do. remove
const loop =
    (): void => {
        const timestamp = performance.now();
        if (timestamp_previous !== -1) {
            let patches;
            // $FlowFixMe https://github.com/immerjs/immer/pull/632
            [game_state, patches] = immer.produceWithPatches(game_state, draft => {
                draft.update(new Tick(timestamp - timestamp_previous));
            });
            io.emit("update", patches);
            if (step_count % 100 === 0) {
                console.log(timestamp - timestamp_previous);
                console.log(JSON.stringify(patches));
            }
        }
        timestamp_previous = timestamp;
        // if (step_count % 100 === 0)
        //     console.log(keys_pressed);
        ++step_count;
    };

setInterval(loop, 50);

io.on("connection", socket => {
    socket.emit("state", game_state);
    let player_id_new: PlayerId | null = null;
    let patches; // to-do. type signature
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
        let patches;
        // $FlowFixMe https://github.com/immerjs/immer/pull/632
        [game_state, patches] = immer.produceWithPatches(game_state, draft => {
            draft.update(new UserCommandEvent(player_id_new_copy, command));
        });
        io.emit("update", patches);
    });
    socket.on('disconnect', () => {
        let patches;
        // $FlowFixMe https://github.com/immerjs/immer/pull/632
        [game_state, patches] = immer.produceWithPatches(game_state, draft => {
            draft.deletePlayer(player_id_new_copy);
        });
        io.emit("update", patches);
    });
});

app.use(express.static("dist"));

http.listen(1234, () => {
    console.log("listening on *:1234");
});
