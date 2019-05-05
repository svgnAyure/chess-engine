/**
 * Klasse som representerer sjakkbrikken "queen"/"dronning".
 */

// Importsetninger
const Piece = require('./Piece')
const { orthogonalIncrements, diagonalIncrements } = require('../utils/increments')

class Queen extends Piece {
  // Konstruktørmetode
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'Q' : 'q'
  }

  // Metode for generering av dronningens trekk.
  // Benytter seg av *generateMoves() i superklassen.
  *getMoves() {
    yield* this.generateMoves([...orthogonalIncrements, ...diagonalIncrements], true)
  }
}

module.exports = Queen
