// @flow

const R = require("ramda");
const load_images = require("./load_images.js");
import type {PlayerId} from "./game_types.js";

const resources_grid_scale = 30;

const sources = {
    "hole": require("../resources/hole.png"),
    "obstacle": require("../resources/obstacle.png"),
    "bombs/frame0_top_left": require("../resources/bombs/frame0_top_left.png"),
    "bombs/frame1_top_left": require("../resources/bombs/frame1_top_left.png"),
    "bombs/exploding_top_left": require("../resources/bombs/exploding_top_left.png"),
    "bombs/frame0_bottom_right": require("../resources/bombs/frame0_bottom_right.png"),
    "bombs/frame1_bottom_right": require("../resources/bombs/frame1_bottom_right.png"),
    "bombs/exploding_bottom_right": require("../resources/bombs/exploding_bottom_right.png"),
    "bombs/frame0_top_right": require("../resources/bombs/frame0_top_right.png"),
    "bombs/frame1_top_right": require("../resources/bombs/frame1_top_right.png"),
    "bombs/exploding_top_right": require("../resources/bombs/exploding_top_right.png"),
    "bombs/frame0_bottom_left": require("../resources/bombs/frame0_bottom_left.png"),
    "bombs/frame1_bottom_left": require("../resources/bombs/frame1_bottom_left.png"),
    "bombs/exploding_bottom_left": require("../resources/bombs/exploding_bottom_left.png"),
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
    "explosion/center/bottom_right": require("../resources/explosion/center/bottom_right.png"),
    "explosion/center/top_left": require("../resources/explosion/center/top_left.png"),
    "explosion/center/top_right": require("../resources/explosion/center/top_right.png"),
    "explosion/center/bottom_left": require("../resources/explosion/center/bottom_left.png"),
    "power_ups/bomb_capacity": require("../resources/power_ups/bomb_capacity.png"),
    "power_ups/bomb_strength": require("../resources/power_ups/bomb_strength.png"),
    "power_ups/run_speed": require("../resources/power_ups/run_speed.png"),
    "power_ups/life_count": require("../resources/power_ups/life_count.png"),
    "player/up/frame0_top_left": require("../resources/player/up/frame0_top_left.png"),
    "player/up/frame0_bottom_right": require("../resources/player/up/frame0_bottom_right.png"),
    "player/up/frame0_bottom_left": require("../resources/player/up/frame0_bottom_left.png"),
    "player/up/frame0_top_right": require("../resources/player/up/frame0_top_right.png"),
    "player/up/frame1_top_left": require("../resources/player/up/frame1_top_left.png"),
    "player/up/frame1_bottom_right": require("../resources/player/up/frame1_bottom_right.png"),
    "player/up/frame1_bottom_left": require("../resources/player/up/frame1_bottom_left.png"),
    "player/up/frame1_top_right": require("../resources/player/up/frame1_top_right.png"),
    "player/up/frame2_top_left": require("../resources/player/up/frame2_top_left.png"),
    "player/up/frame2_bottom_right": require("../resources/player/up/frame2_bottom_right.png"),
    "player/up/frame2_bottom_left": require("../resources/player/up/frame2_bottom_left.png"),
    "player/up/frame2_top_right": require("../resources/player/up/frame2_top_right.png"),
    "player/left/frame0_top_left": require("../resources/player/left/frame0_top_left.png"),
    "player/left/frame0_bottom_right": require("../resources/player/left/frame0_bottom_right.png"),
    "player/left/frame0_bottom_left": require("../resources/player/left/frame0_bottom_left.png"),
    "player/left/frame0_top_right": require("../resources/player/left/frame0_top_right.png"),
    "player/left/frame1_top_left": require("../resources/player/left/frame1_top_left.png"),
    "player/left/frame1_bottom_right": require("../resources/player/left/frame1_bottom_right.png"),
    "player/left/frame1_bottom_left": require("../resources/player/left/frame1_bottom_left.png"),
    "player/left/frame1_top_right": require("../resources/player/left/frame1_top_right.png"),
    "player/left/frame2_top_left": require("../resources/player/left/frame2_top_left.png"),
    "player/left/frame2_bottom_right": require("../resources/player/left/frame2_bottom_right.png"),
    "player/left/frame2_bottom_left": require("../resources/player/left/frame2_bottom_left.png"),
    "player/left/frame2_top_right": require("../resources/player/left/frame2_top_right.png"),
    "player/down/frame0_top_left": require("../resources/player/down/frame0_top_left.png"),
    "player/down/frame0_bottom_right": require("../resources/player/down/frame0_bottom_right.png"),
    "player/down/frame0_bottom_left": require("../resources/player/down/frame0_bottom_left.png"),
    "player/down/frame0_top_right": require("../resources/player/down/frame0_top_right.png"),
    "player/down/frame1_top_left": require("../resources/player/down/frame1_top_left.png"),
    "player/down/frame1_bottom_right": require("../resources/player/down/frame1_bottom_right.png"),
    "player/down/frame1_bottom_left": require("../resources/player/down/frame1_bottom_left.png"),
    "player/down/frame1_top_right": require("../resources/player/down/frame1_top_right.png"),
    "player/down/frame2_top_left": require("../resources/player/down/frame2_top_left.png"),
    "player/down/frame2_bottom_right": require("../resources/player/down/frame2_bottom_right.png"),
    "player/down/frame2_bottom_left": require("../resources/player/down/frame2_bottom_left.png"),
    "player/down/frame2_top_right": require("../resources/player/down/frame2_top_right.png"),
    "player/right/frame0_top_left": require("../resources/player/right/frame0_top_left.png"),
    "player/right/frame0_bottom_right": require("../resources/player/right/frame0_bottom_right.png"),
    "player/right/frame0_bottom_left": require("../resources/player/right/frame0_bottom_left.png"),
    "player/right/frame0_top_right": require("../resources/player/right/frame0_top_right.png"),
    "player/right/frame1_top_left": require("../resources/player/right/frame1_top_left.png"),
    "player/right/frame1_bottom_right": require("../resources/player/right/frame1_bottom_right.png"),
    "player/right/frame1_bottom_left": require("../resources/player/right/frame1_bottom_left.png"),
    "player/right/frame1_top_right": require("../resources/player/right/frame1_top_right.png"),
    "player/right/frame2_top_left": require("../resources/player/right/frame2_top_left.png"),
    "player/right/frame2_bottom_right": require("../resources/player/right/frame2_bottom_right.png"),
    "player/right/frame2_bottom_left": require("../resources/player/right/frame2_bottom_left.png"),
    "player/right/frame2_top_right": require("../resources/player/right/frame2_top_right.png"),
    "background": require("../resources/background.png"),
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
        R.liftN(
            3,
            (direction: string, frame: number, player_id: PlayerId): string =>
                "player/" + direction + "/frame" + frame + "_" + player_id
        )
            (
                ["up", "left", "down", "right"],
                R.range(0, 3),
                ["top_left", "bottom_right", "bottom_left", "top_right"]
            ),
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
