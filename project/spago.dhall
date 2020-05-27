{-
Welcome to a Spago project!
You can edit this file as you like.
-}
{ name = "playing_with_fire"
, dependencies =
    [ "canvas"
    , "console"
    , "effect"
    , "integers"
    , "math"
    , "partial"
    , "profunctor-lenses"
    , "psci-support"
    , "transformers"
    , "unordered-collections"
    ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
