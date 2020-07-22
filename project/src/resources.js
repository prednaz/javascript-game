// @flow

const R = require("ramda");
const load_images = require("./load_images.js");
import type {PlayerId} from "./game_types.js";

const resources_grid_scale = 30;

const sources = {
    "hole": require("../resources/hole.png"),
    "bombs/frame0_top_left": require("../resources/bombs/frame0_top_left.png"),
    "bombs/frame1_top_left": require("../resources/bombs/frame1_top_left.png"),
    "explosion/line/up_top_left": require("../resources/explosion/line/up_top_left.png"),
    "explosion/line/up_bottom_right": require("../resources/explosion/line/up_bottom_right.png"),
    "explosion/line/up_bottom_left": require("../resources/explosion/line/up_bottom_left.png"),
    "explosion/line/up_top_right": require("../resources/explosion/line/up_top_right.png"),
    "explosion/line/left_top_left": require("../resources/explosion/line/left_top_left.png"),
    "explosion/line/left_bottom_right": require("../resources/explosion/line/left_bottom_right.png"),
    "explosion/line/left_bottom_left": require("../resources/explosion/line/left_bottom_left.png"),
    "explosion/line/left_top_right": require("../resources/explosion/line/left_top_right.png"),
    "explosion/line/down_top_left": require("../resources/explosion/line/down_top_left.png"),
    "explosion/line/down_bottom_right": require("../resources/explosion/line/down_bottom_right.png"),
    "explosion/line/down_bottom_left": require("../resources/explosion/line/down_bottom_left.png"),
    "explosion/line/down_top_right": require("../resources/explosion/line/down_top_right.png"),
    "explosion/line/right_top_left": require("../resources/explosion/line/right_top_left.png"),
    "explosion/line/right_bottom_right": require("../resources/explosion/line/right_bottom_right.png"),
    "explosion/line/right_bottom_left": require("../resources/explosion/line/right_bottom_left.png"),
    "explosion/line/right_top_right": require("../resources/explosion/line/right_top_right.png"),
    "explosion/end/up_top_left": require("../resources/explosion/end/up_top_left.png"),
    "explosion/end/up_bottom_right": require("../resources/explosion/end/up_bottom_right.png"),
    "explosion/end/up_bottom_left": require("../resources/explosion/end/up_bottom_left.png"),
    "explosion/end/up_top_right": require("../resources/explosion/end/up_top_right.png"),
    "explosion/end/left_top_left": require("../resources/explosion/end/left_top_left.png"),
    "explosion/end/left_bottom_right": require("../resources/explosion/end/left_bottom_right.png"),
    "explosion/end/left_bottom_left": require("../resources/explosion/end/left_bottom_left.png"),
    "explosion/end/left_top_right": require("../resources/explosion/end/left_top_right.png"),
    "explosion/end/down_top_left": require("../resources/explosion/end/down_top_left.png"),
    "explosion/end/down_bottom_right": require("../resources/explosion/end/down_bottom_right.png"),
    "explosion/end/down_bottom_left": require("../resources/explosion/end/down_bottom_left.png"),
    "explosion/end/down_top_right": require("../resources/explosion/end/down_top_right.png"),
    "explosion/end/right_top_left": require("../resources/explosion/end/right_top_left.png"),
    "explosion/end/right_bottom_right": require("../resources/explosion/end/right_bottom_right.png"),
    "explosion/end/right_bottom_left": require("../resources/explosion/end/right_bottom_left.png"),
    "explosion/end/right_top_right": require("../resources/explosion/end/right_top_right.png"),
    "power_ups/bomb_capacity": require("../resources/power_ups/bomb_capacity.png"),
    "power_ups/bomb_strength": require("../resources/power_ups/bomb_strength.png"),
    "power_ups/run_speed": require("../resources/power_ups/run_speed.png"),
};

type ConstImage = () => Image;
type ReturnType = <R>(() => R) => R;
export type Resources = $ObjMap<typeof sources,ConstImage>;

const with_resources =
    (action: Resources => mixed): void =>
    {load_images(sources).then(action);};

const generate_sources_fields =
    (): string =>
    generate_fields_from_filenames(R.unnest([
        ["hole"],
        ["bombs/frame0_top_left", "bombs/frame1_top_left"],
        R.liftN(
            3,
            (part: string, direction: string, player_id: PlayerId): string =>
                "explosion/" + part + "/" + direction + "_" + player_id
        )
            (
                ["line", "end"],
                ["up", "left", "down", "right"],
                ["top_left", "bottom_right", "bottom_left", "top_right"]
            ),
        R.liftN(
            1,
            (power_up: string): string => "power_ups/" + power_up
        )
            (["bomb_capacity", "bomb_strength", "run_speed"]),
    ]));

const generate_fields_from_filenames: $ReadOnlyArray<string> => string =
    R.compose(
        R.join(""),
        R.map(
            identifier =>
                R.join("", R.repeat(" ", 4*3)) +
                "\"" + identifier +
                "\": require(\"../resources/" +
                identifier + ".png\"),\n"
        )
    );

module.exports = {with_resources, resources_grid_scale, generate_sources_fields};
