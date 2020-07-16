// @flow

const R = require("ramda");

const map_of_pairs = <K, V>(entries: $ReadOnlyArray<[K,V]>): Map<K, V> => new Map(entries);

const identifier_of_resource:
    $ReadOnlyArray<string | [string, $ReadOnlyArray<string>]> => Array<string>
    = R.chain(
        (resource: string | [string, $ReadOnlyArray<string>]): Array<string> =>
        typeof resource === "string"
            ? [resource]
            : R.map(R.concat(resource[0]), resource[1])
    );

const html_of_resources:
    $ReadOnlyArray<string | [string, $ReadOnlyArray<string>]> => string
    = R.compose(
        R.join("\n"),
        R.chain(
            (resource: string | [string, $ReadOnlyArray<string>]): Array<string> =>
            R.map(
                (identifier: {file_name: string, suffix: string, rotate_count: number}) =>
                (
                    "<img class=\"resource\" id=\"" +
                    identifier.file_name + identifier.suffix +
                    "\" src=\"../../resources/" + identifier.file_name +
                    ".png\" style=\"transform:rotateZ(" +
                    identifier.rotate_count * (-90) +
                    "deg)\">"
                ),
                typeof resource === "string"
                    ? [{file_name: resource, suffix: "", rotate_count: 0}]
                    : R.map(
                        ([suffix, rotate_count]: [string, number]) => ({
                            file_name: resource[0],
                            suffix: suffix,
                            rotate_count: rotate_count
                        }),
                        R.zip(resource[1], R.range(0, resource[1].length))
                    )
            )
        )
    ); 

const log_html_of_resources:
    $ReadOnlyArray<string | [string, $ReadOnlyArray<string>]> => void
    = R.compose(console.log, html_of_resources);

const map_fst = R.over(R.lensIndex(0));

const resources_get:
    $ReadOnlyArray<string | [string, $ReadOnlyArray<string>]> => Map<string, HTMLElement>
    = R.compose(
        map_of_pairs,
        R.map((identifier: string): [string, HTMLElement] => {
            const dom = document.getElementById(identifier);
            if (dom === null) {
                throw new ReferenceError(
                    "Resource with id \"" + identifier + "\" is not in the HTML document"
                );
            }
            return [identifier, dom];
        }),
        identifier_of_resource
    );

module.exports = {
    map_of_pairs,
    log_html_of_resources,
    resources_get,
};
