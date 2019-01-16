const Piece = require('./Piece')

class Rook extends Piece {
  constructor(colour) {
    super(colour)
    this.letter = colour === 'w' ? 'R' : 'r'
  }
}

module.exports = Rook
