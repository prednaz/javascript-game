// @flow

const {Game} = require("../game.js");
const {UserCommandEvent, Tick} = require("../game_types.js");
import type {PlayerId} from "../game_types.js";
const {performance} = require('perf_hooks');
const socket_events = require("../socket_events.js");
import type {StatePayload, UpdatePayload, UserCommandPayload} from "../socket_events.js";
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

const frame_period = 16;

let game_state: Game = new Game();
let timestamp_previous: number = performance.now();

let step_count: number = 0; // to-do. just for logging
const loop =
    (): void =>
    {
        const timestamp = performance.now();
        game_state = update_and_synchronize(game_state, draft => {
            draft.update(new Tick(timestamp - timestamp_previous));
        })[0];
        if (Math.abs(timestamp - timestamp_previous - frame_period) > 5) {
            console.log("outlier. " + (timestamp - timestamp_previous));
        }
        else if (step_count % 1000 === 0) {
            console.log(timestamp - timestamp_previous);
        }
        ++step_count;
        timestamp_previous = timestamp;
    };

setInterval(loop, frame_period);

io.on("connect", socket => {socket.on(socket_events.ready, () => {  // ensure, the state event is not triggered before its listener is added
    const result = update_and_synchronize(game_state, draft => draft.addPlayer());
    game_state = result[0];
    const player_id = result[1];
    socket.emit(socket_events.state, ([game_state, player_id]: StatePayload));
    if (player_id === null) {
        return; // to-do. Notify the client of the game being full.
    }
    socket.on(socket_events.user_command, (command: UserCommandPayload) => {
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
        let [game_state_new, patches]: [Game, Array<Patch>] =
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
            if (R.all((patch: Patch) => path_match([[0, "players"], [2, "position"], [3, "continuous_coordinate"]], patch), patches)) {
                // $FlowFixMe
                io.volatile.emit(socket_events.update, (patches: UpdatePayload));
            }
            else {
                io.emit(socket_events.update, (patches: UpdatePayload));
            }
        }
        return [game_state_new, ((result: any): T)];
    };

const path_match =
    (pattern: $ReadOnlyArray<[number, string | number]>, patch: Patch): boolean =>
    R.all(segment => patch.path[segment[0]] === segment[1], pattern);
