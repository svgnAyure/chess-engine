/**
 * Hovedklasse for sjakkmotoren.
 * Eksponerer den funksjonaliteten som er nødvendig for
 * å kunne bruke sjakkmotoren som et bibliotek utenfra.
 * Metodene i denne klassen kaller metoder i underliggende
 * klasser mer eller mindre direkte, og returnerer data.
 */

// Importsetninger
const Game = require('./classes/Game')

class ChessGame {
  constructor(fen) {
    this.game = new Game(fen)
  }

  makeMove({ from, to, promoteTo }) {
    return this.game.makeMove({ from, to, promoteTo })
  }

  playerDraw() {
    this.game.playerDraw()
  }

  playerResign(colour) {
    this.game.playerResign(colour)
  }

  playerTimeout(colour) {
    this.game.playerTimeout(colour)
  }

  get fen() {
    return this.game.getFen()
  }

  get legalMoves() {
    return this.game.getLegalMoves()
  }

  get gameStatus() {
    return {
      isFinished: this.game.isFinished,
      statusText: this.game.statusText
    }
  }

  get keySquares() {
    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1]
    return {
      lastMove: lastMove ? [lastMove.from, lastMove.to] : [],
      checkSquare: this.game.inCheck ? this.game.board.keySquares.king[this.game.toMove].name : null
    }
  }

  get moveHistory() {
    return this.game.moveHistory.map(m => m.notation)
  }
}

module.exports = ChessGame
