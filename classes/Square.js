/**
 * Klasse som representerer et felt på sjakkbrettet.
 * Inneholder metoder relatert til et felt på brettet det tilhører.
 */

// Importsetninger
const {
  diagonalIncrements,
  orthogonalIncrements,
  knightIncrements
} = require('../utils/increments')

class Square {
  // Konstruktørmetode
  constructor(board, { x, y }) {
    this.board = board // Brettet feltet hører til
    this.x = x // x-koordinat for feltet (array-indeks)
    this.y = y // y-koordinat for feltet (array-indeks)
    this.name = this.constructor.getSquareName({ x, y }) // Feltets navn hentet fra statisk metode.
    this.piece = null // Brikken som står på feltet
  }

  // Metode for å regne ut feltets navn gitt feltets koordinater.
  // Kolonnene navngis fra A til H, og radene navngis fra 1 til 8.
  static getSquareName({ x, y }) {
    const colIdx = String.fromCharCode(x + 97)
    const rowIdx = y + 1
    return `${colIdx}${rowIdx}`
  }

  // Metode for å avgjøre om feltet er kontrollert av noen av gitt spillers brikker.
  // Brukes for å avgjøre om en spiller står i sjakk, eller for å avgjøre lovligheten til enkelte trekk.
  isControlled(colour) {
    // Undersøker felter diagonalt.
    const diagonally = this.checkIncrements(colour, diagonalIncrements, true, (piece, i) => {
      const offset = this.y - piece.square.y
      const pieces = {
        q: true,
        b: true,
        k: i === 1,
        p: (colour === 'w' && offset === 1) || (colour === 'b' && offset === -1)
      }
      return pieces[piece.letter.toLowerCase()]
    })

    // Undersøker felter ortogonalt (radvis eller kolonnevis).
    const orthogonally = this.checkIncrements(colour, orthogonalIncrements, true, (piece, i) => {
      const pieces = {
        r: true,
        q: true,
        k: i === 1
      }
      return pieces[piece.letter.toLowerCase()]
    })

    // Undersøker felter der feltet kan nås av en springer.
    const byKnight = this.checkIncrements(colour, knightIncrements, false, piece => {
      return piece.letter.toLowerCase() === 'n'
    })

    return diagonally || orthogonally || byKnight
  }

  // Hjelpemetode for isControlled-metoden.
  // Løper gjennom gitte inkrementer og returnerer true dersom
  // den finner en brikke som truer feltet, false ellers.
  checkIncrements(colour, increments, repeating, testFunc) {
    for (const inc of increments) {
      for (
        let y = this.y + inc.y, x = this.x + inc.x, i = 1;
        y < 8 && x < 8 && y >= 0 && x >= 0;
        y += inc.y, x += inc.x, i++
      ) {
        const piece = this.board.getSquare({ x, y }).piece
        if (piece && piece.colour === colour) {
          if (testFunc(piece, i)) {
            return true
          }
        }
        if (piece || !repeating) {
          break
        }
      }
    }
    return false
  }
}

module.exports = Square
