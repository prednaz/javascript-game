// Generated by purs version 0.13.6
"use strict";
var $foreign = require("./foreign.js");
var Data_Functor = require("../Data.Functor/index.js");
var Effect = require("../Effect/index.js");
var modify = function (f) {
    return $foreign["modify'"](function (s) {
        var s$prime = f(s);
        return {
            state: s$prime,
            value: s$prime
        };
    });
};
var modify_ = function (f) {
    return function (s) {
        return Data_Functor["void"](Effect.functorEffect)(modify(f)(s));
    };
};
module.exports = {
    modify: modify,
    modify_: modify_,
    "new": $foreign["new"],
    read: $foreign.read,
    "modify'": $foreign["modify'"],
    write: $foreign.write
};
