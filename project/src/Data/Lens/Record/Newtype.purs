module Data.Lens.Record.Newtype  where

import Prelude ((<<<))
import Data.Newtype (class Newtype)
import Data.Symbol (SProxy (SProxy), class IsSymbol)
import Prim.Row (class Cons)
import Data.Lens.Types (Lens)
import Data.Lens.Iso.Newtype as Lens.Iso.Newtype
import Data.Lens.Record as Lens.Record
import Control.Semigroupoid as Semigroupoid

infixr 9 Semigroupoid.compose as %

field ::
  forall label s t rowU rowV a b tail.
  IsSymbol label =>
  Newtype s (Record rowU) =>
  Newtype t (Record rowV) =>
  Cons label a tail rowU =>
  Cons label b tail rowV =>
  SProxy label ->
  Lens s t a b
field label = Lens.Iso.Newtype._Newtype <<< Lens.Record.prop label

_f ::
  forall label s t rowU rowV a b tail.
  IsSymbol label =>
  Newtype s (Record rowU) =>
  Newtype t (Record rowV) =>
  Cons label a tail rowU =>
  Cons label b tail rowV =>
  SProxy label ->
  Lens s t a b
_f = field

type L = SProxy
l :: forall symbol. L symbol
l = SProxy
