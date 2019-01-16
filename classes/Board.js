const generatePiece = require('../utils/generatePiece')

class Board {
  constructor(fen) {
    const mapCharToSquare = char => (isNaN(char) ? generatePiece[char]() : Array(+char).fill(null))
    const mapRowToSquares = row => row.split('').flatMap(mapCharToSquare)
    const board = fen.split('/').map(mapRowToSquares)
    this.board = board.reverse()
  }

  getSquare(square) {
    const [col, row] = square.split('')
    const colIdx = col.charCodeAt(0) - 97
    const rowIdx = row - 1
    return this.board[rowIdx][colIdx]
  }

  getFen() {
    const reversedBoard = [...this.board].reverse()
    const rows = reversedBoard.map(row =>
      row.reduce((acc, cur) => {
        const last = acc.slice(-1)
        const rest = acc.slice(0, -1)
        return cur ? `${acc}${cur.letter}` : isNaN(last) ? `${acc}1` : `${rest}${Number(last) + 1}`
      }, '')
    )
    return rows.join('/')
  }
}

module.exports = Board
