/**
 * Klasse som representerer sjakkbrikken "bishop"/"løper".
 */

// Importsetninger
const Piece = require('./Piece')
const { diagonalIncrements } = require('../utils/increments')

class Bishop extends Piece {
  // Konstruktørmetode
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'B' : 'b'
  }

  // Metode for generering av løperens trekk.
  // Benytter seg av *generateMoves() i superklassen.
  *getMoves() {
    yield* this.generateMoves(diagonalIncrements, true)
  }
}

module.exports = Bishop
