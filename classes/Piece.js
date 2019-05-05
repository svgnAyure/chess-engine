/**
 * Klasse som representerer en sjakkbrikke.
 * Inneholder generelle metoder for sjakkbrikker og kan
 * sees på som en abstrakt superklasse for andre brikker.
 */

class Piece {
  // Konstruktørmetode for brikker, kalles gjennom super() i underklasser.
  constructor(square, colour) {
    this.square = square // Feltet brikken står på
    this.colour = colour // Fargen på brikken, hvilken spiller brikken tilhører
  }

  // Metode for generering av brikkens lovlige trekk.
  // Basert på "inkrementer" definert i underklassene, som tilsvarer hvilke
  // retninger en brikke kan flyttes, og om den kan flyttes flere felter.
  *generateMoves(increments, repeating) {
    for (const inc of increments) {
      for (
        let y = this.square.y + inc.y, x = this.square.x + inc.x;
        y < 8 && x < 8 && y >= 0 && x >= 0;
        y += inc.y, x += inc.x
      ) {
        const square = this.square.board.getSquare({ x, y })
        if (square.piece) {
          if (square.piece.colour !== this.colour) {
            yield {
              from: this.square,
              to: square,
              capture: true,
              special: null
            }
          }
          break
        } else {
          yield {
            from: this.square,
            to: square,
            capture: false,
            special: null
          }
        }
        if (!repeating) {
          break
        }
      }
    }
  }
}

module.exports = Piece
