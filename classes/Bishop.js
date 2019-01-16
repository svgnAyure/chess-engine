const Piece = require('./Piece')

class Bishop extends Piece {
  constructor(colour) {
    super(colour)
    this.letter = colour === 'w' ? 'B' : 'b'
  }
}

module.exports = Bishop
