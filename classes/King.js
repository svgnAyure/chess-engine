const Piece = require('./Piece')
const { orthogonalIncrements, diagonalIncrements } = require('../utils/increments')

class King extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'K' : 'k'
  }

  *getMoves({ castling }) {
    yield* this.generateMoves([...orthogonalIncrements, ...diagonalIncrements], false)

    const isWhite = this.colour === 'w'
    const otherColour = isWhite ? 'b' : 'w'
    const kingSide = isWhite ? 'K' : 'k'
    const queenSide = isWhite ? 'Q' : 'q'

    let canKsCastle = castling.includes(kingSide)
    let canQsCastle = castling.includes(queenSide)

    if ((canKsCastle || canQsCastle) && this.square.isControlled(otherColour)) {
      canKsCastle = canQsCastle = false
    }

    if (canKsCastle) {
      const [bSquare, tSquare] = this.square.board.keySquares.castling[kingSide]
      const bSquareOk = !bSquare.piece && !bSquare.isControlled(otherColour)
      const tSquareOk = !tSquare.piece && !tSquare.isControlled(otherColour)
      if (bSquareOk && tSquareOk) {
        yield { from: this.square, to: tSquare, capture: false, special: 'ksCastle' }
      }
    }

    if (canQsCastle) {
      const [bSquare, tSquare, aSquare] = this.square.board.keySquares.castling[queenSide]
      const bSquareOk = !bSquare.piece && !bSquare.isControlled(otherColour)
      const tSquareOk = !tSquare.piece && !tSquare.isControlled(otherColour)
      const aSquareOk = !aSquare.piece
      if (bSquareOk && tSquareOk && aSquareOk) {
        yield { from: this.square, to: tSquare, capture: false, special: 'qsCastle' }
      }
    }
  }
}

module.exports = King
