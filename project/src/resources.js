// @flow

const R = require("ramda");
const load_images = require("./load_images.js");

const sources = {
    "hole": require("../resources/hole.png"),
    "power_ups/bomb_capacity": require("../resources/power_ups/bomb_capacity.png"),
};

type ConstImage = () => Image;
export type Resources = $ObjMap<typeof sources,ConstImage>;

const with_resources =
    (action: Resources => mixed): void =>
    {load_images(sources).then(action);};

const generate_fields: $ReadOnlyArray<string> => string =
    R.compose(
        R.join("\n"),
        R.map(
            identifier =>
            "\t\"" + identifier + "\": require(\"../../resources/" + identifier + ".png\"),"
        )
    );

module.exports = {with_resources, generate_fields};
