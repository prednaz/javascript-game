// Generated by purs version 0.13.6
"use strict";
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Data_EuclideanRing = require("../Data.EuclideanRing/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Lens_Internal_Indexed = require("../Data.Lens.Internal.Indexed/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Ring = require("../Data.Ring/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var over = function (l) {
    return l;
};
var set = function (l) {
    return function (b) {
        return over(l)(Data_Function["const"](b));
    };
};
var setJust = function (p) {
    var $24 = set(p);
    return function ($25) {
        return $24(Data_Maybe.Just.create($25));
    };
};
var subOver = function (dictRing) {
    return function (p) {
        var $26 = over(p);
        var $27 = Data_Function.flip(Data_Ring.sub(dictRing));
        return function ($28) {
            return $26($27($28));
        };
    };
};
var mulOver = function (dictSemiring) {
    return function (p) {
        var $29 = over(p);
        var $30 = Data_Function.flip(Data_Semiring.mul(dictSemiring));
        return function ($31) {
            return $29($30($31));
        };
    };
};
var modifying = function (dictMonadState) {
    return function (p) {
        return function (f) {
            return Data_Functor["void"]((((dictMonadState.Monad0()).Bind1()).Apply0()).Functor0())(Control_Monad_State_Class.modify(dictMonadState)(over(p)(f)));
        };
    };
};
var mulModifying = function (dictMonadState) {
    return function (dictSemiring) {
        return function (p) {
            var $32 = modifying(dictMonadState)(p);
            var $33 = Data_Function.flip(Data_Semiring.mul(dictSemiring));
            return function ($34) {
                return $32($33($34));
            };
        };
    };
};
var subModifying = function (dictMonadState) {
    return function (dictRing) {
        return function (p) {
            var $35 = modifying(dictMonadState)(p);
            var $36 = Data_Function.flip(Data_Ring.sub(dictRing));
            return function ($37) {
                return $35($36($37));
            };
        };
    };
};
var iover = function (l) {
    return function (f) {
        return l(Data_Lens_Internal_Indexed.Indexed(Data_Tuple.uncurry(f)));
    };
};
var divOver = function (dictEuclideanRing) {
    return function (p) {
        var $38 = over(p);
        var $39 = Data_Function.flip(Data_EuclideanRing.div(dictEuclideanRing));
        return function ($40) {
            return $38($39($40));
        };
    };
};
var divModifying = function (dictMonadState) {
    return function (dictEuclideanRing) {
        return function (p) {
            var $41 = modifying(dictMonadState)(p);
            var $42 = Data_Function.flip(Data_EuclideanRing.div(dictEuclideanRing));
            return function ($43) {
                return $41($42($43));
            };
        };
    };
};
var disjOver = function (dictHeytingAlgebra) {
    return function (p) {
        var $44 = over(p);
        var $45 = Data_Function.flip(Data_HeytingAlgebra.disj(dictHeytingAlgebra));
        return function ($46) {
            return $44($45($46));
        };
    };
};
var disjModifying = function (dictMonadState) {
    return function (dictHeytingAlgebra) {
        return function (p) {
            var $47 = modifying(dictMonadState)(p);
            var $48 = Data_Function.flip(Data_HeytingAlgebra.disj(dictHeytingAlgebra));
            return function ($49) {
                return $47($48($49));
            };
        };
    };
};
var conjOver = function (dictHeytingAlgebra) {
    return function (p) {
        var $50 = over(p);
        var $51 = Data_Function.flip(Data_HeytingAlgebra.conj(dictHeytingAlgebra));
        return function ($52) {
            return $50($51($52));
        };
    };
};
var conjModifying = function (dictMonadState) {
    return function (dictHeytingAlgebra) {
        return function (p) {
            var $53 = modifying(dictMonadState)(p);
            var $54 = Data_Function.flip(Data_HeytingAlgebra.conj(dictHeytingAlgebra));
            return function ($55) {
                return $53($54($55));
            };
        };
    };
};
var assign = function (dictMonadState) {
    return function (p) {
        return function (b) {
            return Data_Functor["void"]((((dictMonadState.Monad0()).Bind1()).Apply0()).Functor0())(Control_Monad_State_Class.modify(dictMonadState)(set(p)(b)));
        };
    };
};
var assignJust = function (dictMonadState) {
    return function (p) {
        var $56 = assign(dictMonadState)(p);
        return function ($57) {
            return $56(Data_Maybe.Just.create($57));
        };
    };
};
var appendOver = function (dictSemigroup) {
    return function (p) {
        var $58 = over(p);
        var $59 = Data_Function.flip(Data_Semigroup.append(dictSemigroup));
        return function ($60) {
            return $58($59($60));
        };
    };
};
var appendModifying = function (dictMonadState) {
    return function (dictSemigroup) {
        return function (p) {
            var $61 = modifying(dictMonadState)(p);
            var $62 = Data_Function.flip(Data_Semigroup.append(dictSemigroup));
            return function ($63) {
                return $61($62($63));
            };
        };
    };
};
var addOver = function (dictSemiring) {
    return function (p) {
        var $64 = over(p);
        var $65 = Data_Semiring.add(dictSemiring);
        return function ($66) {
            return $64($65($66));
        };
    };
};
var addModifying = function (dictMonadState) {
    return function (dictSemiring) {
        return function (p) {
            var $67 = modifying(dictMonadState)(p);
            var $68 = Data_Semiring.add(dictSemiring);
            return function ($69) {
                return $67($68($69));
            };
        };
    };
};
module.exports = {
    over: over,
    iover: iover,
    set: set,
    addOver: addOver,
    subOver: subOver,
    mulOver: mulOver,
    divOver: divOver,
    disjOver: disjOver,
    conjOver: conjOver,
    appendOver: appendOver,
    setJust: setJust,
    assign: assign,
    modifying: modifying,
    addModifying: addModifying,
    mulModifying: mulModifying,
    subModifying: subModifying,
    divModifying: divModifying,
    disjModifying: disjModifying,
    conjModifying: conjModifying,
    appendModifying: appendModifying,
    assignJust: assignJust
};