// @flow

const R = require("ramda");

type ConstImage = () => Image;

const load_images:
    <Sources: {[string]: string}>(Sources) =>
    Promise<$ObjMap<Sources,ConstImage>>
    = R.compose(
        promise =>
            promise
                .then(R.fromPairs)
                .catch(() => {throw new Error("Not all images could be loaded.");}),
        Promise.all.bind(Promise),
        R.map(
            ([identifier, source]: [string, string]) =>
                new Promise(resolve => {
                    const image = new Image();
                    image.src = source;
                    image.addEventListener("load", () => resolve([identifier, image]));
                })
        ),
        R.toPairs
    );

module.exports = load_images;