const Piece = require('./Piece')

class Queen extends Piece {
  constructor(colour) {
    super(colour)
    this.letter = colour === 'w' ? 'Q' : 'q'
  }
}

module.exports = Queen
