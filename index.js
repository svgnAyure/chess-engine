const Game = require('./classes/Game')

class ChessGame {
  constructor(fen) {
    this.game = new Game(fen)
  }

  makeMove({ from, to, promoteTo }) {
    return this.game.makeMove({ from, to, promoteTo })
  }

  getFen() {
    return this.game.getFen()
  }

  getLegalMoves() {
    return this.game.getLegalMoves()
  }

  getGameStatus() {
    return {
      isFinished: this.game.isFinished,
      statusText: this.game.statusText
    }
  }

  getKeySquares() {
    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1]
    return {
      lastMove: lastMove ? [lastMove.from, lastMove.to] : [],
      checkSquare: this.game.inCheck ? this.game.board.keySquares.king[this.game.toMove].name : null
    }
  }

  getMoveHistory() {
    return this.game.moveHistory
  }
}

module.exports = ChessGame
