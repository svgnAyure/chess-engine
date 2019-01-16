const Piece = require('./Piece')

class Pawn extends Piece {
  constructor(colour) {
    super(colour)
    this.letter = colour === 'w' ? 'P' : 'p'
  }
}

module.exports = Pawn
