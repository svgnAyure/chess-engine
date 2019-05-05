/**
 * Klasse som representerer sjakkbrikken "pawn"/"bonde".
 */

// Importsetninger
const Piece = require('./Piece')

class Pawn extends Piece {
  // Konstruktørmetode
  constructor(square, colour) {
    super(square, colour)
    this.letter = colour === 'w' ? 'P' : 'p'
  }

  // Metode for generering av bondens trekk.
  // Genererer først "vanlige" trekk, og deretter særegne bondetrekk.
  *getMoves({ enPassant }) {
    // Generell informasjon om felt og hvilken retning bonden kan flytte i.
    const { x, y } = this.square
    const isWhite = this.colour === 'w'
    const d = isWhite ? 1 : -1

    // Sjekker feltene foran bonden og avgjør om de er ledige.
    // Lar bonden flytte to felter dersom den ikke tidligere har flyttet,
    // og markerer trekket som en forfremmelse dersom bonden når siste rad.
    let square = this.square.board.getSquare({ x, y: y + d })
    if (square && !square.piece) {
      const special = (isWhite && y === 6) || (!isWhite && y === 1) ? 'promotion' : null
      yield { from: this.square, to: square, capture: false, special }
      if ((isWhite && y === 1) || (!isWhite && y === 6)) {
        square = this.square.board.getSquare({ x, y: y + 2 * d })
        if (square && !square.piece) {
          yield { from: this.square, to: square, capture: false, special: 'doublePawnMove' }
        }
      }
    }

    // Sjekker feltet diagonalt til venstre foran bonden og avgjør om det
    // finnes en motstanderbrikke der. Dersom det gjør det kan brikken tas.
    // Sjekker også om trekket når siste rad slik and bonden forfremmes.
    square = this.square.board.getSquare({ x: x - 1, y: y + d })
    if (square) {
      if (square.name === enPassant) {
        yield { from: this.square, to: square, capture: true, special: 'enPassant' }
      }
      if (square.piece && square.piece.colour !== this.colour) {
        const special = (isWhite && y === 6) || (!isWhite && y === 1) ? 'promotion' : null
        yield { from: this.square, to: square, capture: true, special }
      }
    }

    // Sjekker feltet diagonalt til høyre foran bonden og avgjør om det
    // finnes en motstanderbrikke der. Dersom det gjør det kan brikken tas.
    // Sjekker også om trekket når siste rad slik and bonden forfremmes.
    square = this.square.board.getSquare({ x: x + 1, y: y + d })
    if (square) {
      if (square.name === enPassant) {
        yield { from: this.square, to: square, capture: true, special: 'enPassant' }
      }
      if (square.piece && square.piece.colour !== this.colour) {
        const special = (isWhite && y === 6) || (!isWhite && y === 1) ? 'promotion' : false
        yield { from: this.square, to: square, capture: true, special }
      }
    }
  }
}

module.exports = Pawn
