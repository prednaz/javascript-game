// Generated by purs version 0.13.6
"use strict";
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Min = function (x) {
    return x;
};
var showMin = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Min " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupMin = function (dictOrd) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Ord.min(dictOrd)(v)(v1);
        };
    });
};
var newtypeMin = new Data_Newtype.Newtype(function (n) {
    return n;
}, Min);
var monoidMin = function (dictBounded) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMin(dictBounded.Ord0());
    }, Data_Bounded.top(dictBounded));
};
var eqMin = function (dictEq) {
    return dictEq;
};
var ordMin = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqMin(dictOrd.Eq0());
    }, function (v) {
        return function (v1) {
            return Data_Ord.compare(dictOrd)(v)(v1);
        };
    });
};
module.exports = {
    Min: Min,
    newtypeMin: newtypeMin,
    eqMin: eqMin,
    ordMin: ordMin,
    semigroupMin: semigroupMin,
    monoidMin: monoidMin,
    showMin: showMin
};
