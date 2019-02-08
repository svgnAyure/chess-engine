const Piece = require('./Piece')

class Pawn extends Piece {
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'P' : 'p'
  }

  *getMoves(enPassant) {
    const { x, y } = this.square
    const d = this.colour === 'w' ? 1 : -1

    let square = this.square.board.getSquare({ x, y: y + d })
    if (square && !square.piece) {
      yield { from: this.square, to: square, type: 'move' }
      if (y - d === 0 || y - d === 7) {
        square = this.square.board.getSquare({ x, y: y + 2 * d })
        if (square && !square.piece) {
          yield { from: this.square, to: square, type: 'move' }
        }
      }
    }

    square = this.square.board.getSquare({ x: x - 1, y: y + d })
    if (square) {
      if (square.name === enPassant) {
        yield { from: this.square, to: square, type: 'enPassant' }
      }
      if (square.piece && square.piece.colour !== this.colour) {
        yield { from: this.square, to: square, type: 'capture' }
      }
    }

    square = this.square.board.getSquare({ x: x + 1, y: y + d })
    if (square) {
      if (square.name === enPassant) {
        yield { from: this.square, to: square, type: 'enPassant' }
      }
      if (square.piece && square.piece.colour !== this.colour) {
        yield { from: this.square, to: square, type: 'capture' }
      }
    }
  }
}

module.exports = Pawn
