// Generated by purs version 0.13.6
"use strict";
var Control_Monad_State_Trans = require("../Control.Monad.State.Trans/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Lens_Internal_Focusing = require("../Data.Lens.Internal.Focusing/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Profunctor_Star = require("../Data.Profunctor.Star/index.js");
var zoom = function (p) {
    var $0 = Data_Newtype.underF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Lens_Internal_Focusing.newtypeFocusing)(Data_Lens_Internal_Focusing.newtypeFocusing)(Data_Lens_Internal_Focusing.Focusing)(Data_Newtype.under(Data_Profunctor_Star.newtypeStar)(Data_Profunctor_Star.newtypeStar)(Data_Profunctor_Star.Star)(p));
    return function ($1) {
        return Control_Monad_State_Trans.StateT($0(Control_Monad_State_Trans.runStateT($1)));
    };
};
module.exports = {
    zoom: zoom
};
