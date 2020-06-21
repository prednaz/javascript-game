// @flow

const {Int} = require("./utilities");

class ColumnRowPosition {
    +column: Int;
    +row: Int;
    constructor(column: Int, row: Int): void {
        this.column = column;
        this.row = row;
    }
}

module.exports = {ColumnRowPosition};
