const Square = require('./Square')
const generatePiece = require('../utils/generatePiece')

class Board {
  constructor(boardFen, options) {
    this.board = this.createBoard(boardFen)
    this.keySquares = this.getKeySquares()
    this.updateLegalMoves(options)
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
          return [...Array(+char)].map(() => new Square(this, { x: x++, y }))
        }
      })
    })
  }

  getSquare({ x, y }) {
    return this.board[y][x]
  }

  setSquare({ x, y }, piece) {
    this.board[y][x].piece = piece
  }

  getKeySquares() {
    return {
      king: { w: this.getSquare({ x: 4, y: 0 }), b: this.getSquare({ x: 4, y: 7 }) },
      castling: {
        K: [this.getSquare({ x: 5, y: 0 }), this.getSquare({ x: 6, y: 0 })],
        k: [this.getSquare({ x: 5, y: 7 }), this.getSquare({ x: 6, y: 7 })],
        Q: [
          this.getSquare({ x: 3, y: 0 }),
          this.getSquare({ x: 2, y: 0 }),
          this.getSquare({ x: 1, y: 0 })
        ],
        q: [
          this.getSquare({ x: 3, y: 7 }),
          this.getSquare({ x: 2, y: 7 }),
          this.getSquare({ x: 1, y: 7 })
        ]
      }
    }
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

  updateLegalMoves(options) {
    this.legalMoves = [...this.generateLegalMoves(options)]
  }

  *generateLegalMoves({ toMove, enPassant, castling }) {
    for (const square of this) {
      const { piece } = square
      if (piece && piece.colour === toMove) {
        for (const move of piece.getMoves({ enPassant, castling })) {
          if (this.simulateMove(move, toMove)) {
            yield move
          }
        }
      }
    }
  }

  isInCheck(colour) {
    const square = this.keySquares.king[colour]
    const otherColour = colour === 'w' ? 'b' : 'w'
    return square.isControlled(otherColour)
  }

  simulateMove({ from, to, special }, colour) {
    const fromPiece = this.getSquare(from).piece
    const toPiece = this.getSquare(to).piece
    const kingSquare = this.keySquares.king[colour]

    const isEnPassant = special === 'enPassant'
    const epSquare = this.getSquare({ x: to.x, y: from.y })
    const epPiece = epSquare.piece

    this.keySquares.king[colour] = from.piece.letter.toLowerCase() === 'k' ? to : kingSquare
    this.setSquare(from, null)
    this.setSquare(to, fromPiece)
    isEnPassant && this.setSquare(epSquare, null)

    const isInCheck = this.isInCheck(colour)

    this.keySquares.king[colour] = kingSquare
    this.setSquare(from, fromPiece)
    this.setSquare(to, toPiece)
    isEnPassant && this.setSquare(epSquare, epPiece)

    return !isInCheck
  }

  makeMove({ from, to, promoteTo = 'Q' }) {
    const move = this.legalMoves.find(m => m.from.name === from && m.to.name === to)
    if (!move || !['Q', 'R', 'B', 'N'].includes(promoteTo.toUpperCase())) {
      return null
    }

    const promotion = this.resolvePromotion(move, promoteTo)
    const notation = `${this.resolveNotation(move)}${promotion ? promotion.notation : ''}`

    const fromPiece = move.from.piece
    this.setSquare(move.from, null)
    this.setSquare(move.to, promotion ? promotion.piece : fromPiece)
    fromPiece.square = move.to

    if (fromPiece.letter.toLowerCase() === 'k') {
      this.keySquares.king[fromPiece.colour] = move.to
    }

    if (move.special === 'ksCastle' || move.special === 'qsCastle') {
      const kingside = move.special === 'ksCastle'
      const originSquare = this.getSquare({ x: move.to.x + (kingside ? 1 : -2), y: move.to.y })
      const targetSquare = this.getSquare({ x: move.to.x + (kingside ? -1 : 1), y: move.to.y })
      const rookPiece = originSquare.piece
      this.setSquare(targetSquare, rookPiece)
      this.setSquare(originSquare, null)
      rookPiece.square = targetSquare
    }

    if (move.special === 'enPassant') {
      const x = move.to.x
      const y = move.from.y
      this.setSquare({ x, y }, null)
    }

    return { ...move, notation }
  }

  resolvePromotion(move, promoteTo) {
    if (move.special !== 'promotion') {
      return false
    }
    const isWhite = move.from.piece.colour === 'w'
    const letter = isWhite ? promoteTo.toUpperCase() : promoteTo.toLowerCase()
    return {
      piece: generatePiece(letter, move.to),
      notation: `=${promoteTo.toUpperCase()}`
    }
  }

  resolveNotation(move) {
    const pieceNotation = move.from.piece.letter.toUpperCase()

    if (move.special === 'qsCastle') {
      return 'O-O-O'
    }

    if (move.special === 'ksCastle') {
      return 'O-O'
    }

    if (move.capture && pieceNotation === 'P') {
      return `${move.from.name[0]}x${move.to.name}`
    }

    if (pieceNotation === 'P') {
      return move.to.name
    }

    const conflicts = this.legalMoves.filter(
      m => m !== move && m.to === move.to && m.from.piece.letter === move.from.piece.letter
    )

    if (conflicts.length) {
      const colSeparable = !conflicts.some(c => c.from.name[0] === move.from.name[0])
      if (colSeparable) {
        return `${pieceNotation}${move.from.name[0]}${move.capture ? 'x' : ''}${move.to.name}`
      }
      const rowSeparable = !conflicts.some(c => c.from.name[1] === move.from.name[1])
      if (rowSeparable) {
        return `${pieceNotation}${move.from.name[1]}${move.capture ? 'x' : ''}${move.to.name}`
      }
      return `${pieceNotation}${move.from.name}${move.capture ? 'x' : ''}${move.to.name}`
    }

    return `${pieceNotation}${move.capture ? 'x' : ''}${move.to.name}`
  }

  resolveMatingMaterial() {
    const fenArray = this.board.getFen().split('')
    const { whitePieces, blackPieces } = fenArray
      .filter(c => c !== '/' && isNaN(c))
      .sort()
      .reduce(
        (acc, cur) => ({
          whitePieces: cur === cur.toUpperCase() ? acc.whitePieces + cur : acc.whitePieces,
          blackPieces: cur === cur.toLowerCase() ? acc.blackPieces + cur : acc.blackPieces
        }),
        { whitePieces: '', blackPieces: '' }
      )

    return {
      whiteCanMate: !['K', 'KN', 'BK'].includes(whitePieces),
      blackCanMate: !['k', 'kn', 'bk'].includes(blackPieces)
    }
  }
}

module.exports = Board
