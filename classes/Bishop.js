const Piece = require('./Piece')
const { diagonalIncrements } = require('../utils/increments')

class Bishop extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'B' : 'b'
  }

  *getMoves() {
    yield* this.generateMoves(diagonalIncrements, true)
  }
}

module.exports = Bishop
