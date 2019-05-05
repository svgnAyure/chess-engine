/**
 * Hjelpemiddel for å generere brikker basert på tegn fra FEN-streng.
 */

// Importsetninger
const Pawn = require('../classes/Pawn')
const Rook = require('../classes/Rook')
const Knight = require('../classes/Knight')
const Bishop = require('../classes/Bishop')
const Queen = require('../classes/Queen')
const King = require('../classes/King')

const pieces = {
  p: square => new Pawn(square, 'b'),
  r: square => new Rook(square, 'b'),
  n: square => new Knight(square, 'b'),
  b: square => new Bishop(square, 'b'),
  q: square => new Queen(square, 'b'),
  k: square => new King(square, 'b'),
  P: square => new Pawn(square, 'w'),
  R: square => new Rook(square, 'w'),
  N: square => new Knight(square, 'w'),
  B: square => new Bishop(square, 'w'),
  Q: square => new Queen(square, 'w'),
  K: square => new King(square, 'w')
}

module.exports = (char, square) => {
  return pieces[char](square)
}
