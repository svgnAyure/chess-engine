const Piece = require('./Piece')
const { orthogonalIncrements, diagonalIncrements } = require('../utils/increments')

class Queen extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'Q' : 'q'
  }

  *getMoves() {
    yield* this.generateMoves([...orthogonalIncrements, ...diagonalIncrements], true)
  }
}

module.exports = Queen
