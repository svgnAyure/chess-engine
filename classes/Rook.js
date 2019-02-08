const Piece = require('./Piece')
const { orthogonalIncrements } = require('../utils/increments')

class Rook extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'R' : 'r'
  }

  *getMoves() {
    yield* this.generateMoves(orthogonalIncrements, true)
  }
}

module.exports = Rook
