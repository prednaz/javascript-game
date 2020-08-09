// @flow

import type {Game} from "./game.js";
import type {PlayerId, UserCommand} from "./game_types.js";
import type {Patch} from "immer";

const state = "state";
export type StatePayload = [Game, PlayerId | null];

const update = "update";
export type UpdatePayload = Array<Patch>;

const ready = "ready";

const user_command = "user command";
export type UserCommandPayload = UserCommand;

module.exports = {state, update, ready, user_command};