const Pawn = require('../classes/Pawn')
const Rook = require('../classes/Rook')
const Knight = require('../classes/Knight')
const Bishop = require('../classes/Bishop')
const Queen = require('../classes/Queen')
const King = require('../classes/King')

module.exports = {
  p: () => new Pawn('b'),
  r: () => new Rook('b'),
  n: () => new Knight('b'),
  b: () => new Bishop('b'),
  q: () => new Queen('b'),
  k: () => new King('b'),
  P: () => new Pawn('w'),
  R: () => new Rook('w'),
  N: () => new Knight('w'),
  B: () => new Bishop('w'),
  Q: () => new Queen('w'),
  K: () => new King('w')
}
