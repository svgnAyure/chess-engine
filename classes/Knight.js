/**
 * Klasse som representerer sjakkbrikken "knight"/"springer".
 */

// Importsetninger
const Piece = require('./Piece')
const { knightIncrements } = require('../utils/increments')

class Knight extends Piece {
  // Konstruktørmetode
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'N' : 'n'
  }

  // Metode for generering av springerens trekk.
  // Benytter seg av *generateMoves() i superklassen.
  *getMoves() {
    yield* this.generateMoves(knightIncrements, false)
  }
}

module.exports = Knight
