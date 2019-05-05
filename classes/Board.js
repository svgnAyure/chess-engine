/**
 * Klasse som representerer et sjakkbrett.
 * Inneholder metoder relatert til sjakkbrettet, som flytting av brikker,
 * vurdering av posisjon, generering av lovlige trekk, osv.
 */

// Importsetninger
const Square = require('./Square')
const generatePiece = require('../utils/generatePiece')

class Board {
  // Konstruktørmetode
  constructor(boardFen, options) {
    this.board = this.createBoard(boardFen) // Sjakkbrettet i form av et 2D-array.
    this.keySquares = this.getKeySquares() // Nøkkelfelter på brettet.
    this.updateLegalMoves(options) // Genererer lovlige trekk ved oppstart.
  }

  // Iterator for klassen. Returnerer hvert felt på brettet.
  *[Symbol.iterator]() {
    for (const row of this.board) {
      for (const square of row) {
        yield square
      }
    }
  }

  // Metode for oppretting av sjakkbrettet gitt en såkalt "fen-string",
  // en kort tekststreng som beskriver alle feltene og brikkene på brettet.
  // Oppretter feltobjekter og legger dem inn i et todimensjonalt array.
  createBoard(fen) {
    const rows = fen.split('/').reverse()
    return rows.map((row, y) => {
      let x = 0
      return row.split('').flatMap(char => {
        if (isNaN(char)) {
          const square = new Square(this, { x: x++, y })
          square.piece = generatePiece(char, square)
          return square
        } else {
          return [...Array(+char)].map(() => new Square(this, { x: x++, y }))
        }
      })
    })
  }

  // Henter et felt gitt x- og y-koordinat.
  getSquare({ x, y }) {
    return this.board[y][x]
  }

  // Finner et felt gitt x- og y-koordinat og setter
  // feltets brikkereferanse til valgt sjakkbrikke.
  setSquare({ x, y }, piece) {
    this.board[y][x].piece = piece
  }

  // Genererer nøkkelfelter på brettet.
  // Disse tilsvarer startposisjonen for begge spillernes konger,
  // samt felter som må sjekkes i forbindelse med trekket "rokade".
  getKeySquares() {
    return {
      king: { w: this.getSquare({ x: 4, y: 0 }), b: this.getSquare({ x: 4, y: 7 }) },
      castling: {
        K: [this.getSquare({ x: 5, y: 0 }), this.getSquare({ x: 6, y: 0 })],
        k: [this.getSquare({ x: 5, y: 7 }), this.getSquare({ x: 6, y: 7 })],
        Q: [
          this.getSquare({ x: 3, y: 0 }),
          this.getSquare({ x: 2, y: 0 }),
          this.getSquare({ x: 1, y: 0 })
        ],
        q: [
          this.getSquare({ x: 3, y: 7 }),
          this.getSquare({ x: 2, y: 7 }),
          this.getSquare({ x: 1, y: 7 })
        ]
      }
    }
  }

  // Metode som bygger en "fen-string" basert på brettets stilling.
  // Løper gjennom alle feltene og bygger strengen bit for bit.
  getFen() {
    const reversedBoard = [...this.board].reverse()
    const rows = reversedBoard.map(row =>
      row.reduce((acc, cur) => {
        const last = acc.slice(-1)
        const rest = acc.slice(0, -1)
        const pc = cur.piece
        return pc ? `${acc}${pc.letter}` : isNaN(last) ? `${acc}1` : `${rest}${Number(last) + 1}`
      }, '')
    )
    return rows.join('/')
  }

  // Metode som oppdaterer brettets liste over lovlige trekk.
  // Brukes hver gang spillerne gjør trekk for å få en ny liste.
  updateLegalMoves(options) {
    this.legalMoves = [...this.generateLegalMoves(options)]
  }

  // Metode som genererer lovlige trekk på brettet.
  // Metoden løper gjennom hvert felt på brettet og filtrerer ut de feltene som
  // har brikker tilhørende spilleren som er i trekket. Deretter spørres brikkene
  // om å oppgi hvor de kan flytte, gitt visse betingelser sendt med som parametre
  // i metodekallet. Til slutt simuleres trekkene for å avgjøre om de er lovlige.
  *generateLegalMoves({ toMove, enPassant, castling }) {
    for (const square of this) {
      const { piece } = square
      if (piece && piece.colour === toMove) {
        for (const move of piece.getMoves({ enPassant, castling })) {
          if (this.simulateMove(move, toMove)) {
            yield move
          }
        }
      }
    }
  }

  // Metode for å avgjøre om gitt spiller står i sjakk.
  // Finner spillerens konge og spør feltet om det er truet av motstanderens brikker.
  isInCheck(colour) {
    const square = this.keySquares.king[colour]
    const otherColour = colour === 'w' ? 'b' : 'w'
    return square.isControlled(otherColour)
  }

  // Metode for å simulere et trekk og vurdere om trekket er lovlig.
  simulateMove({ from, to, special }, colour) {
    // Informasjon om felter og brikker involvert i trekket.
    const fromPiece = this.getSquare(from).piece
    const toPiece = this.getSquare(to).piece
    const kingSquare = this.keySquares.king[colour]

    // Betingelser for det spesielle bondetrekket "en passant".
    const isEnPassant = special === 'enPassant'
    const epSquare = this.getSquare({ x: to.x, y: from.y })
    const epPiece = epSquare.piece

    // Gjør trekket på brettet.
    this.keySquares.king[colour] = from.piece.letter.toLowerCase() === 'k' ? to : kingSquare
    this.setSquare(from, null)
    this.setSquare(to, fromPiece)
    isEnPassant && this.setSquare(epSquare, null)

    // Avgjør om trekket fører til at spilleren står i sjakk.
    const isInCheck = this.isInCheck(colour)

    // Annulerer trekket slik at stillingen forblir uendret i selve spillet.
    this.keySquares.king[colour] = kingSquare
    this.setSquare(from, fromPiece)
    this.setSquare(to, toPiece)
    isEnPassant && this.setSquare(epSquare, epPiece)

    // Dersom spilleren står i sjakk etter trekket, er trekket ulovlig.
    return !isInCheck
  }

  // Metode for å gjøre et trekk på brettet.
  // Flytter en brikke fra et gitt felt til et annet gitt felt, og
  // forfremmer dersom betingelsene for bondeforfremmelse er oppfylt.
  makeMove({ from, to, promoteTo = 'Q' }) {
    // Undersøker om trekket finnes i listen over lovlige trekk.
    const move = this.legalMoves.find(m => m.from.name === from && m.to.name === to)
    if (!move || !['Q', 'R', 'B', 'N'].includes(promoteTo.toUpperCase())) {
      return null
    }

    // Henter informasjon om forfremmelse og notasjon fra egne metoder.
    const promotion = this.resolvePromotion(move, promoteTo)
    const notation = `${this.resolveNotation(move)}${promotion ? promotion.notation : ''}`

    // Utfører trekket
    const fromPiece = move.from.piece
    this.setSquare(move.from, null)
    this.setSquare(move.to, promotion ? promotion.piece : fromPiece)
    fromPiece.square = move.to

    // Oppdater nøkkelfelter dersom trekket var et kongetrekk.
    if (fromPiece.letter.toLowerCase() === 'k') {
      this.keySquares.king[fromPiece.colour] = move.to
    }

    // Behandler det spesielle kongetrekket "rokade".
    if (move.special === 'ksCastle' || move.special === 'qsCastle') {
      const kingside = move.special === 'ksCastle'
      const originSquare = this.getSquare({ x: move.to.x + (kingside ? 1 : -2), y: move.to.y })
      const targetSquare = this.getSquare({ x: move.to.x + (kingside ? -1 : 1), y: move.to.y })
      const rookPiece = originSquare.piece
      this.setSquare(targetSquare, rookPiece)
      this.setSquare(originSquare, null)
      rookPiece.square = targetSquare
    }

    // Behandler det spesielle bondetrekket "en passant".
    if (move.special === 'enPassant') {
      const x = move.to.x
      const y = move.from.y
      this.setSquare({ x, y }, null)
    }

    // Returnerer trekket med notasjon.
    return { ...move, notation }
  }

  // Metode for behandling av bondeforfremmelse.
  // Returnerer den nye brikken som bonden ble forfremmet til,
  // samt den spesielle notasjonen som brukes ved bondeforfremmelse.
  resolvePromotion(move, promoteTo) {
    if (move.special !== 'promotion') {
      return false
    }
    const isWhite = move.from.piece.colour === 'w'
    const letter = isWhite ? promoteTo.toUpperCase() : promoteTo.toLowerCase()
    return {
      piece: generatePiece(letter, move.to),
      notation: `=${promoteTo.toUpperCase()}`
    }
  }

  // Metode for generering av notasjon for et trekk.
  resolveNotation(move) {
    const pieceNotation = move.from.piece.letter.toUpperCase()

    // Lang rokade har egen notasjon.
    if (move.special === 'qsCastle') {
      return 'O-O-O'
    }

    // Kort rokade har egen notasjon.
    if (move.special === 'ksCastle') {
      return 'O-O'
    }

    // Bondeslag har egen notasjon.
    if (move.capture && pieceNotation === 'P') {
      return `${move.from.name[0]}x${move.to.name}`
    }

    // Bondetrekk har egen notasjon.
    if (pieceNotation === 'P') {
      return move.to.name
    }

    // Bygger en liste over eventuelle notasjonskonflikter.
    // Oppstår når flere brikker av samme type kan flytte til det samme feltet.
    // I slike tilfeller må det legges til flere detaljer i trekknotasjonen.
    const conflicts = this.legalMoves.filter(
      m => m !== move && m.to === move.to && m.from.piece.letter === move.from.piece.letter
    )

    // Dersom det finnes konflikter må det avgjøres hvordan trekkene kan skilles.
    // Dette gjøres ved å legge til enten rad- eller kolonnenavn for trekkets "fra-felt",
    // eller begge deler i noen spesielle tilfeller.
    if (conflicts.length) {
      const colSeparable = !conflicts.some(c => c.from.name[0] === move.from.name[0])
      if (colSeparable) {
        return `${pieceNotation}${move.from.name[0]}${move.capture ? 'x' : ''}${move.to.name}`
      }
      const rowSeparable = !conflicts.some(c => c.from.name[1] === move.from.name[1])
      if (rowSeparable) {
        return `${pieceNotation}${move.from.name[1]}${move.capture ? 'x' : ''}${move.to.name}`
      }
      return `${pieceNotation}${move.from.name}${move.capture ? 'x' : ''}${move.to.name}`
    }

    // Returnerer standardnotasjon for normale trekk.
    return `${pieceNotation}${move.capture ? 'x' : ''}${move.to.name}`
  }

  // Metode for å undersøke om spillerne har nok brikker til å kunne sette motstanderen sjakk matt.
  resolveMatingMaterial() {
    const fenArray = this.getFen().split('')
    const { whitePieces, blackPieces } = fenArray
      .filter(c => c !== '/' && isNaN(c))
      .sort()
      .reduce(
        (acc, cur) => ({
          whitePieces: cur === cur.toUpperCase() ? acc.whitePieces + cur : acc.whitePieces,
          blackPieces: cur === cur.toLowerCase() ? acc.blackPieces + cur : acc.blackPieces
        }),
        { whitePieces: '', blackPieces: '' }
      )

    // Returnerer true dersom spilleren har brikker til å oppnå sjakk matt.
    return {
      whiteCanMate: !['K', 'KN', 'BK'].includes(whitePieces),
      blackCanMate: !['k', 'kn', 'bk'].includes(blackPieces)
    }
  }
}

module.exports = Board
