// Generated by purs version 0.13.6
"use strict";
var Data_Either = require("../Data.Either/index.js");
var Data_Lens_Internal_Wander = require("../Data.Lens.Internal.Wander/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Profunctor = require("../Data.Profunctor/index.js");
var Data_Profunctor_Choice = require("../Data.Profunctor.Choice/index.js");
var Data_Profunctor_Strong = require("../Data.Profunctor.Strong/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Indexed = function (x) {
    return x;
};
var profunctorIndexed = function (dictProfunctor) {
    return new Data_Profunctor.Profunctor(function (f) {
        return function (g) {
            return function (v) {
                return Data_Profunctor.dimap(dictProfunctor)(Data_Profunctor_Strong.second(Data_Profunctor_Strong.strongFn)(f))(g)(v);
            };
        };
    });
};
var strongIndexed = function (dictStrong) {
    return new Data_Profunctor_Strong.Strong(function () {
        return profunctorIndexed(dictStrong.Profunctor0());
    }, function (v) {
        return Indexed(Data_Profunctor.lcmap(dictStrong.Profunctor0())(function (v1) {
            return new Data_Tuple.Tuple(new Data_Tuple.Tuple(v1.value0, v1.value1.value0), v1.value1.value1);
        })(Data_Profunctor_Strong.first(dictStrong)(v)));
    }, function (v) {
        return Indexed(Data_Profunctor.lcmap(dictStrong.Profunctor0())(function (v1) {
            return new Data_Tuple.Tuple(v1.value1.value0, new Data_Tuple.Tuple(v1.value0, v1.value1.value1));
        })(Data_Profunctor_Strong.second(dictStrong)(v)));
    });
};
var newtypeIndexed = new Data_Newtype.Newtype(function (n) {
    return n;
}, Indexed);
var choiceIndexed = function (dictChoice) {
    return new Data_Profunctor_Choice.Choice(function () {
        return profunctorIndexed(dictChoice.Profunctor0());
    }, function (v) {
        return Indexed(Data_Profunctor.lcmap(dictChoice.Profunctor0())(function (v1) {
            return Data_Either.either((function () {
                var $47 = Data_Tuple.Tuple.create(v1.value0);
                return function ($48) {
                    return Data_Either.Left.create($47($48));
                };
            })())(Data_Either.Right.create)(v1.value1);
        })(Data_Profunctor_Choice.left(dictChoice)(v)));
    }, function (v) {
        return Indexed(Data_Profunctor.lcmap(dictChoice.Profunctor0())(function (v1) {
            return Data_Either.either(Data_Either.Left.create)((function () {
                var $49 = Data_Tuple.Tuple.create(v1.value0);
                return function ($50) {
                    return Data_Either.Right.create($49($50));
                };
            })())(v1.value1);
        })(Data_Profunctor_Choice.right(dictChoice)(v)));
    });
};
var wanderIndexed = function (dictWander) {
    return new Data_Lens_Internal_Wander.Wander(function () {
        return choiceIndexed(dictWander.Choice1());
    }, function () {
        return strongIndexed(dictWander.Strong0());
    }, function (trav) {
        return function (v) {
            return Indexed(Data_Lens_Internal_Wander.wander(dictWander)(function (dictApplicative) {
                return function (ia2fb) {
                    return function (v1) {
                        return trav(dictApplicative)((function () {
                            var $51 = Data_Tuple.Tuple.create(v1.value0);
                            return function ($52) {
                                return ia2fb($51($52));
                            };
                        })())(v1.value1);
                    };
                };
            })(v));
        };
    });
};
module.exports = {
    Indexed: Indexed,
    newtypeIndexed: newtypeIndexed,
    profunctorIndexed: profunctorIndexed,
    strongIndexed: strongIndexed,
    choiceIndexed: choiceIndexed,
    wanderIndexed: wanderIndexed
};