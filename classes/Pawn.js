const Piece = require('./Piece')

class Pawn extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'P' : 'p'
  }

  *getMoves({ enPassant }) {
    const { x, y } = this.square
    const isWhite = this.colour === 'w'
    const d = isWhite ? 1 : -1

    let square = this.square.board.getSquare({ x, y: y + d })
    if (square && !square.piece) {
      const special = (isWhite && y === 6) || (!isWhite && y === 1) ? 'promotion' : false
      yield { from: this.square, to: square, capture: false, special }
      if ((isWhite && y === 1) || (!isWhite && y === 6)) {
        square = this.square.board.getSquare({ x, y: y + 2 * d })
        if (square && !square.piece) {
          yield { from: this.square, to: square, capture: false, special: 'doublePawnMove' }
        }
      }
    }

    square = this.square.board.getSquare({ x: x - 1, y: y + d })
    if (square) {
      if (square.name === enPassant) {
        yield { from: this.square, to: square, capture: true, special: 'enPassant' }
      }
      if (square.piece && square.piece.colour !== this.colour) {
        const special = (isWhite && y === 6) || (!isWhite && y === 1) ? 'promotion' : false
        yield { from: this.square, to: square, capture: true, special }
      }
    }

    square = this.square.board.getSquare({ x: x + 1, y: y + d })
    if (square) {
      if (square.name === enPassant) {
        yield { from: this.square, to: square, capture: true, special: 'enPassant' }
      }
      if (square.piece && square.piece.colour !== this.colour) {
        const special = (isWhite && y === 6) || (!isWhite && y === 1) ? 'promotion' : false
        yield { from: this.square, to: square, capture: true, special }
      }
    }
  }
}

module.exports = Pawn
