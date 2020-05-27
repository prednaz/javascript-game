module Game where

import Prelude

import Effect (Effect)
import Graphics.Canvas as C
import Math (round)
import Math as Math
import Ui as U
import Ui (State (State), Event (Tick))
import Data.HashSet as HashSet
import Data.Newtype (class Newtype)
import Data.Lens as L
import Data.Lens.Record.Newtype (field, (%), _f, l, L)

-- import Effect.Console (log)

newtype Position = Position {x :: Number, y :: Number}
derive instance newtypePosition :: Newtype Position _

newtype Player = Player {position :: Position, runSpeed :: Number}
derive instance newtypePlayer :: Newtype Player _

newtype GameState = GameState {player :: Player}
derive instance newtypeGameState :: Newtype GameState _

initialGameState :: GameState
initialGameState =
  GameState
    {
      player:
        Player
          {
            runSpeed: 1.0,
            position:
              Position
               {
                 x: 100.0,
                 y: 101.0}}}

updateGame :: State GameState -> Event -> GameState
updateGame (State gameState keys) (Tick time)
  | keys == HashSet.singleton "w" =
    L.over _y (_ - time * runSpeedGet gameState) gameState
  | keys == HashSet.singleton "a" =
    L.over _x (_ - time * runSpeedGet gameState) gameState
  | keys == HashSet.singleton "s" =
    L.over _y (_ + time * runSpeedGet gameState) gameState
  | keys == HashSet.singleton "d" =
    L.over _x (_ + time * runSpeedGet gameState) gameState
updateGame (State gameState _keys) _event = gameState

drawGame :: GameState -> C.Context2D -> Effect Unit
drawGame (GameState {player: player}) = drawPlayer player

drawPlayer :: Player -> C.Context2D -> Effect Unit
drawPlayer (Player {position: Position {x: x, y: y}}) context =
  C.setStrokeStyle context "#000"
  *>
  C.strokePath
    context
    (
      C.arc
        context
        {x: round x, y: round y, radius: 5.0, start: 0.0, end: Math.tau})


initialState :: State GameState
initialState = U.initialState initialGameState

update :: State GameState -> Event -> State GameState
update = U.update updateGame
  
draw :: State GameState -> C.Context2D -> Effect Unit
draw (State gameState _) = drawGame gameState

_x :: L.Lens' GameState Number
_x =
  field (l::L "player") %
  field (l::L "position") %
  field (l::L "x")

_y :: L.Lens' GameState Number
_y =
  field (l::L "player") %
  field (l::L "position") %
  field (l::L "y")

runSpeedGet :: GameState -> Number
runSpeedGet =
  L.view (_f(l::L "player") % _f(l::L "runSpeed") :: L.Lens' GameState Number)

