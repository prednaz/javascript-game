module Ui where

import Data.HashSet (HashSet, insert, delete, empty)

data State gameState = State gameState (HashSet String)

data Event =
  KeyDown String |
  KeyUp String |
  Tick Number

initialState :: forall gameState. gameState -> State gameState
initialState gameState = State gameState empty

update ::
  forall gameState.
  (State gameState -> Event -> gameState) ->
  State gameState -> Event -> State gameState
update updateGame state@(State gameState keys) event =
  case event of
    KeyDown key -> State gameStateNew (insert key keys)
    KeyUp key -> State gameStateNew (delete key keys)
    Tick time -> State gameStateNew keys
  where
    gameStateNew = updateGame state event
