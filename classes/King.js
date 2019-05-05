/**
 * Klasse som representerer sjakkbrikken "king"/"konge".
 */

// Importsetninger
const Piece = require('./Piece')
const { orthogonalIncrements, diagonalIncrements } = require('../utils/increments')

class King extends Piece {
  // Konstruktørmetode
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'K' : 'k'
  }

  // Metode for generering av kongens trekk.
  // Benytter seg av *generateMoves() i superklassen.
  // Genererer først "vanlige" trekk, og deretter særegne kongetrekk.
  *getMoves({ castling }) {
    yield* this.generateMoves([...orthogonalIncrements, ...diagonalIncrements], false)

    // Generell informasjon om brikken.
    const isWhite = this.colour === 'w'
    const otherColour = isWhite ? 'b' : 'w'
    const kingSide = isWhite ? 'K' : 'k'
    const queenSide = isWhite ? 'Q' : 'q'

    // Avgjør om rokade (castling) er lovlig.
    let canKsCastle = castling.includes(kingSide)
    let canQsCastle = castling.includes(queenSide)

    // Kan ikke rokere dersom kongen står i sjakk.
    if ((canKsCastle || canQsCastle) && this.square.isControlled(otherColour)) {
      canKsCastle = canQsCastle = false
    }

    // Kan ikke rokere dersom feltene kongen beveger seg gjennom mens
    // rokaden utføres er truet av motspillerens brikker (på kongefløyen).
    if (canKsCastle) {
      const [bSquare, tSquare] = this.square.board.keySquares.castling[kingSide]
      const bSquareOk = !bSquare.piece && !bSquare.isControlled(otherColour)
      const tSquareOk = !tSquare.piece && !tSquare.isControlled(otherColour)
      if (bSquareOk && tSquareOk) {
        yield { from: this.square, to: tSquare, capture: false, special: 'ksCastle' }
      }
    }

    // Kan ikke rokere dersom feltene kongen beveger seg gjennom mens
    // rokaden utføres er truet av motspillerens brikker (på dronningfløyen).
    if (canQsCastle) {
      const [bSquare, tSquare, aSquare] = this.square.board.keySquares.castling[queenSide]
      const bSquareOk = !bSquare.piece && !bSquare.isControlled(otherColour)
      const tSquareOk = !tSquare.piece && !tSquare.isControlled(otherColour)
      const aSquareOk = !aSquare.piece
      if (bSquareOk && tSquareOk && aSquareOk) {
        yield { from: this.square, to: tSquare, capture: false, special: 'qsCastle' }
      }
    }
  }
}

module.exports = King
