/**
 * Klasse som representerer sjakkbrikken "rook"/"tårn".
 */

// Importsetninger
const Piece = require('./Piece')
const { orthogonalIncrements } = require('../utils/increments')

class Rook extends Piece {
  // Konstruktørmetode
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'R' : 'r'
  }

  // Metode for generering av tårnets trekk.
  // Benytter seg av *generateMoves() i superklassen.
  *getMoves() {
    yield* this.generateMoves(orthogonalIncrements, true)
  }
}

module.exports = Rook
