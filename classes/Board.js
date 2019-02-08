const Square = require('./Square')
const generatePiece = require('../utils/generatePiece')

class Board {
  constructor(fen) {
    this.board = this.createBoard(fen)
  }

  *[Symbol.iterator]() {
    for (const row of this.board) {
      for (const square of row) {
        yield square
      }
    }
  }

  createBoard(fen) {
    const rows = fen.split('/').reverse()
    return rows.map((row, y) => {
      let x = 0
      return row.split('').flatMap(char => {
        if (isNaN(char)) {
          const square = new Square(this, { x: x++, y })
          square.piece = generatePiece(char, square)
          return square
        } else {
          return [...Array(+char)].map((_, i) => new Square(this, { x: x++, y }))
        }
      })
    })
  }

  getSquare({ x, y }) {
    return this.board[y][x]
  }

  getFen() {
    const reversedBoard = [...this.board].reverse()
    const rows = reversedBoard.map(row =>
      row.reduce((acc, cur) => {
        const last = acc.slice(-1)
        const rest = acc.slice(0, -1)
        const pc = cur.piece
        return pc ? `${acc}${pc.letter}` : isNaN(last) ? `${acc}1` : `${rest}${Number(last) + 1}`
      }, '')
    )
    return rows.join('/')
  }

  getLegalMoves(colour) {
    for (const square of this) {
      const { piece } = square
      if (piece && piece.colour === colour) {
        for (const move of piece.getMoves()) {
          console.log({
            from: move.from.name,
            to: move.to.name,
            type: move.type
          })
        }
      }
    }
  }
}

const a = new Board('3k4/8/8/8/8/8/3P2p1/3K4')
a.getLegalMoves('b')
console.log(a.getFen())
console.log(a.getSquare({ x: 3, y: 5 }).isControlled('w'))

module.exports = Board
