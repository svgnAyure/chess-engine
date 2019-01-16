const Board = require('./Board')

const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

class Game {
  constructor(fen = startingPosition) {
    const [board, toMove, castling, enPassant, halfMoves, fullMoves] = fen.split(' ')
    this.board = new Board(board)
    this.toMove = toMove
    this.castling = castling
    this.enPassant = enPassant
    this.halfMoves = halfMoves
    this.fullMoves = fullMoves
  }

  getFen() {
    return [
      this.board.getFen(),
      this.toMove,
      this.castling,
      this.enPassant,
      this.halfMoves,
      this.fullMoves
    ].join(' ')
  }

  getLegalMoves() {
    return []
  }
}

console.time('a')
const a = new Game('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2')
console.log('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2')
console.log(a.getFen())
console.timeEnd('a')

module.exports = Game
