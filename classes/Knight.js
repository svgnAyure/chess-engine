const Piece = require('./Piece')

class Knight extends Piece {
  constructor(colour) {
    super(colour)
    this.letter = colour === 'w' ? 'N' : 'n'
  }
}

module.exports = Knight
