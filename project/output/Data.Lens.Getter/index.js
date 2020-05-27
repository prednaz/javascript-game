// Generated by purs version 0.13.6
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Data_Lens_Internal_Forget = require("../Data.Lens.Internal.Forget/index.js");
var Data_Lens_Internal_Indexed = require("../Data.Lens.Internal.Indexed/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Profunctor_Strong = require("../Data.Profunctor.Strong/index.js");
var view = function (l) {
    return Data_Newtype.unwrap(Data_Lens_Internal_Forget.newtypeForget)(l(Control_Category.identity(Control_Category.categoryFn)));
};
var viewOn = function (s) {
    return function (l) {
        return view(l)(s);
    };
};
var use = function (dictMonadState) {
    return function (p) {
        return Control_Monad_State_Class.gets(dictMonadState)(function (v) {
            return viewOn(v)(p);
        });
    };
};
var to = function (f) {
    return function (p) {
        var $3 = Data_Newtype.unwrap(Data_Lens_Internal_Forget.newtypeForget)(p);
        return function ($4) {
            return $3(f($4));
        };
    };
};
var takeBoth = function (l) {
    return function (r) {
        return to(Data_Profunctor_Strong.fanout(Control_Category.categoryFn)(Data_Profunctor_Strong.strongFn)(view(l))(view(r)));
    };
};
var iview = function (l) {
    return Data_Newtype.unwrap(Data_Lens_Internal_Forget.newtypeForget)(l(Data_Lens_Internal_Indexed.Indexed(Control_Category.identity(Control_Category.categoryFn))));
};
var iuse = function (dictMonadState) {
    return function (p) {
        return Control_Monad_State_Class.gets(dictMonadState)(iview(p));
    };
};
var cloneGetter = function (g) {
    return to(view(g));
};
module.exports = {
    viewOn: viewOn,
    view: view,
    to: to,
    takeBoth: takeBoth,
    use: use,
    iview: iview,
    iuse: iuse,
    cloneGetter: cloneGetter
};
