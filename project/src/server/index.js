// @flow

const {Game} = require("../game.js");
const {UserCommandEvent, Tick} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {performance} = require('perf_hooks');
const R = require("ramda");
const immer = require("immer");
immer.enablePatches();
immer.enableMapSet();
immer.setAutoFreeze(true);
import type {Patch} from "../../node_modules/immer/dist/index.js";
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {serveClient: false, perMessageDeflate: false});

let game_state: Game = new Game();
let timestamp_previous: number = performance.now();

let step_count: number = 0; // to-do. remove
const loop =
    (): void =>
    {
        const timestamp = performance.now();
        game_state = update_and_synchronize(game_state, draft => {
            draft.update(new Tick(timestamp - timestamp_previous));
        })[0];
        if (step_count % 1000 === 0) {
            console.log(timestamp - timestamp_previous);
        }
        timestamp_previous = timestamp;
        
        // if (step_count % 100 === 0)
        //     console.log(keys_pressed);
        ++step_count;
    };

setInterval(loop, 20);

io.on("connect", socket => {socket.on("ready", () => {
    const result = update_and_synchronize(game_state, draft => draft.addPlayer());
    game_state = result[0];
    const player_id = result[1];
    socket.emit("state", [game_state, player_id]);
    if (player_id === null) {
        return; // to-do. Notify the client of the game being full.
    }
    socket.on("user command", command => {
        game_state = update_and_synchronize(game_state, draft => {
            draft.update(new UserCommandEvent(player_id, command));
        })[0];
    });
    socket.on("disconnect", () => {
        game_state = update_and_synchronize(game_state, draft => {
            draft.deleteAlivePlayer(player_id);
        })[0];
    });
});});

app.use(express.static("dist"));

http.listen(1234, () => {
    console.log("listening on *:1234");
});

const update_and_synchronize =
    <T>(game_state_parameter: Game, update: (draft: Game) => T): [Game, T] =>
    {
        let result: T;
        let [game_state_new, patches]: [Game, $ReadOnlyArray<Patch>] =
            // $FlowFixMe https://github.com/immerjs/immer/pull/632
            immer.produceWithPatches(game_state_parameter, (draft: Game) => {result = update(draft);});
        patches = R.filter(
            (patch: Patch) =>
                !path_match([[0, "players"], [2, "time_since_damage"]], patch) &&
                !path_match([[0, "players"], [2, "bombs"], [3, "content"], [6, "fuse"]], patch) &&
                !path_match([[0, "explosions"], [2, "progress"]], patch) &&
                !path_match([[0, "players"], [2, "run_speed"]], patch) &&
                !path_match([[0, "players"], [2, "bomb_strength"]], patch) &&
                !path_match([[0, "players"], [2, "bomb_capacity"]], patch),
            patches
        );
        if (patches.length !== 0) {
            io.emit("update", patches);
        }
        return [game_state_new, ((result: any): T)];
    };

const path_match =
    (pattern: $ReadOnlyArray<[number, string | number]>, patch: Patch) =>
    R.all(segment => patch.path[segment[0]] === segment[1], pattern);
