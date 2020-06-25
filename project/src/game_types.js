// @flow

const utilities = require("./utilities");
const Int = utilities.Int;
const {immerable} = require("immer");

class ColumnRowPosition {
    +column: Int;
    +row: Int;
    +id: number;
    constructor(column: Int, row: Int): void {
        this.column = column;
        this.row = row;
        this.id = utilities.pairing_function(this.column.number, this.row.number); // make id a function if you make the fields writable
    }
}
// $FlowFixMe https://github.com/facebook/flow/issues/3258
ColumnRowPosition[immerable] = true;

module.exports = {ColumnRowPosition};
