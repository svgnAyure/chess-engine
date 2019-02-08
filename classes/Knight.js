const Piece = require('./Piece')
const { knightIncrements } = require('../utils/increments')

class Knight extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'N' : 'n'
  }

  *getMoves() {
    yield* this.generateMoves(knightIncrements, false)
  }
}

module.exports = Knight
