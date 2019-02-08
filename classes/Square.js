const {
  diagonalIncrements,
  orthogonalIncrements,
  knightIncrements
} = require('../utils/increments')

class Square {
  constructor(board, { x, y }) {
    this.board = board
    this.x = x
    this.y = y
    this.name = this.constructor.getSquareName({ x, y })
    this.piece = null
  }

  static getSquareName({ x, y }) {
    const colIdx = String.fromCharCode(x + 97)
    const rowIdx = y + 1
    return `${colIdx}${rowIdx}`
  }

  isControlled(colour) {
    const diagonally = this.checkIncrements(colour, diagonalIncrements, true, (piece, i) => {
      const offset = this.y - piece.square.y
      const pieces = {
        q: true,
        b: true,
        k: i === 1,
        p: (colour === 'w' && offset === 1) || (colour === 'b' && offset === -1)
      }
      return pieces[piece.letter.toLowerCase()]
    })

    const orthogonally = this.checkIncrements(colour, orthogonalIncrements, true, (piece, i) => {
      const pieces = {
        r: true,
        q: true,
        k: i === 1
      }
      return pieces[piece.letter.toLowerCase()]
    })

    const byKnight = this.checkIncrements(colour, knightIncrements, false, piece => {
      return piece.letter.toLowerCase() === 'n'
    })

    return diagonally || orthogonally || byKnight
  }

  checkIncrements(colour, increments, repeating, testFunc) {
    for (const inc of increments) {
      for (
        let y = this.y + inc.y, x = this.x + inc.x, i = 1;
        y < 8 && x < 8 && y >= 0 && x >= 0;
        y += inc.y, x += inc.x, i++
      ) {
        const piece = this.board.getSquare({ x, y }).piece
        if (piece && piece.colour === colour) {
          if (testFunc(piece, i)) {
            return true
          }
        }
        if (piece || !repeating) {
          break
        }
      }
    }
    return false
  }
}

module.exports = Square
