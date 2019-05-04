const Board = require('./Board')

const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

class Game {
  constructor(fen = defaultFen) {
    const [board, toMove, castling, enPassant, halfMoves, fullMoves] = fen.split(' ')
    this.board = new Board(board, { toMove, castling, enPassant })
    this.toMove = toMove
    this.castling = castling
    this.enPassant = enPassant
    this.halfMoves = Number(halfMoves)
    this.fullMoves = Number(fullMoves)

    this.positionCounts = { [board]: 1 }
    this.moveHistory = []

    this.inCheck = false
    this.inCheckmate = false
    this.isDraw = false
    this.isFinished = false
    this.statusText = 'The game is in progress.'
  }

  getFen() {
    const { board, toMove, castling, enPassant, halfMoves, fullMoves } = this
    return `${board.getFen()} ${toMove} ${castling} ${enPassant} ${halfMoves} ${fullMoves}`
  }

  getLegalMoves() {
    return this.board.legalMoves.map(m => ({
      from: m.from.name,
      to: m.to.name,
      capture: m.capture,
      special: m.special,
      notation: m.notation
    }))
  }

  makeMove({ from, to, promoteTo }) {
    if (this.isFinished) {
      return false
    }

    const move = this.board.makeMove({ from, to, promoteTo })
    if (!move) {
      return false
    }

    const pieceMoved = move.to.piece.letter.toLowerCase()
    if (pieceMoved === 'k' || pieceMoved === 'r') {
      this.resolveCastling(move)
    }

    if (pieceMoved === 'p' || move.capture || move.special === 'promotion') {
      this.halfMoves = 0
      this.positionCounts = {}
    } else {
      this.halfMoves++
    }

    if (this.toMove === 'b') {
      this.fullMoves++
    }

    if (move.special === 'doublePawnMove') {
      const y = (move.from.y + move.to.y) / 2
      this.enPassant = this.board.getSquare({ x: move.from.x, y }).name
    } else {
      this.enPassant = '-'
    }

    this.toMove = this.toMove === 'w' ? 'b' : 'w'

    this.updateLegalMoves()
    this.updatePositionCounts()
    this.updateGameStatus()

    this.moveHistory = [
      ...this.moveHistory,
      {
        from: move.from.name,
        to: move.to.name,
        notation: `${move.notation}${this.inCheckmate ? '#' : this.inCheck ? '+' : ''}`
      }
    ]

    return true
  }

  resolveCastling(move) {
    if (this.castling === '-') {
      return
    }

    const pieceMoved = move.to.piece.letter.toLowerCase()
    const isWhite = this.toMove === 'w'

    if (pieceMoved === 'k') {
      this.castling = this.castling.replace(isWhite ? 'K' : 'k', '')
      this.castling = this.castling.replace(isWhite ? 'Q' : 'q', '')
    } else if (pieceMoved === 'r' && move.from.x === 0) {
      this.castling = this.castling.replace(isWhite ? 'Q' : 'q', '')
    } else if (pieceMoved === 'r' && move.from.x === 7) {
      this.castling = this.castling.replace(isWhite ? 'K' : 'k', '')
    }

    if (!this.castling) {
      this.castling = '-'
    }
  }

  updateLegalMoves() {
    this.board.updateLegalMoves({
      toMove: this.toMove,
      enPassant: this.enPassant,
      castling: this.castling
    })
  }

  updatePositionCounts() {
    const fen = this.board.getFen()
    const count = this.positionCounts[fen]
    this.positionCounts[fen] = count ? count + 1 : 1
  }

  updateGameStatus() {
    this.inCheck = this.board.isInCheck(this.toMove)
    this.inCheckmate = this.resolveCheckmate()
    this.isDraw = this.resolveDraw()
    this.isFinished = this.inCheckmate || this.isDraw
  }

  resolveCheckmate() {
    if (this.inCheck && !this.board.legalMoves.length) {
      this.statusText = `${this.toMove === 'w' ? 'Black' : 'White'} won the game by checkmate.`
      return true
    }
    return false
  }

  resolveDraw() {
    if (this.halfMoves >= 100) {
      this.statusText = 'The game ended in a draw due to the fifty-move rule.'
      return true
    }

    if (Object.values(this.positionCounts).some(p => p >= 3)) {
      this.statusText = 'The game ended in a draw due to threefold repetition.'
      return true
    }

    if (!this.inCheck && !this.board.legalMoves.length) {
      this.statusText = 'The game ended in a draw due to stalemate.'
      return true
    }

    const { whiteCanMate, blackCanMate } = this.board.resolveMatingMaterial()
    if (!whiteCanMate && !blackCanMate) {
      this.statusText = 'The game ended in a draw due to insufficient material.'
      return true
    }

    return false
  }

  playerResign(colour) {
    const [winner, loser] = colour === 'b' ? ['White', 'Black'] : ['Black', 'White']
    this.statusText = `${loser} resigned. ${winner} won.`
    this.isFinished = true
  }

  playerDraw() {
    this.statusText = 'The game ended in a draw by agreement.'
    this.isDraw = true
    this.isFinished = true
  }

  playerTimeout(colour) {
    const { whiteCanMate, blackCanMate } = this.board.resolveMatingMaterial()
    if (colour === 'w') {
      if (blackCanMate) {
        this.statusText = 'Black won on time.'
      } else {
        this.statusText = 'The game was drawn on time.'
        this.isDraw = true
      }
    } else {
      if (whiteCanMate) {
        this.statusText = 'White won on time.'
      } else {
        this.statusText = 'The game was drawn on time.'
        this.isDraw = true
      }
    }
    this.isFinished = true
  }
}

module.exports = Game
