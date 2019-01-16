const Piece = require('./Piece')

class King extends Piece {
  constructor(colour) {
    super(colour)
    this.letter = colour === 'w' ? 'K' : 'k'
  }
}

module.exports = King
