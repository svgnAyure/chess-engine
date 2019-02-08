const Piece = require('./Piece')
const { orthogonalIncrements, diagonalIncrements } = require('../utils/increments')

class King extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'K' : 'k'
  }

  *getMoves() {
    yield* this.generateMoves([...orthogonalIncrements, ...diagonalIncrements], false)
  }
}

module.exports = King
