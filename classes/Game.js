/**
 * Klasse som representerer et sjakkspill.
 * Kan betraktes som hovedklassen i sjakkmotoren.
 * Styrer partiet gjennom "kontakt" med brett og brikker.
 */

// Importsetninger
const Board = require('./Board')

// FEN-streng for standardoppsett av brikker ved begynnelsen av partiet.
const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

class Game {
  // Konstruktørmetode bygger partiet på bakgrunn av en FEN-string.
  constructor(fen = defaultFen) {
    const [board, toMove, castling, enPassant, halfMoves, fullMoves] = fen.split(' ')
    this.board = new Board(board, { toMove, castling, enPassant }) // Brettobjektet
    this.toMove = toMove // Hvilken spiller sin tur det er
    this.castling = castling // Hvilke spillere som kan rokere
    this.enPassant = enPassant // Markerer felt der bondetrekket "en passant" kan gjøres
    this.halfMoves = Number(halfMoves) // Halvtrekk siden en bonde flyttet eller en brikke ble tatt
    this.fullMoves = Number(fullMoves) // Nåværende trekknummer

    this.positionCounts = { [board]: 1 } // Teller opp hvor mange ganger en bestemt posisjon har oppstått
    this.moveHistory = [] // En liste med trekkene som er gjort så langt i partiet

    this.inCheck = false // Om spilleren i trekket står i sjakk
    this.inCheckmate = false // Om spilleren i trekket står i sjakk matt
    this.isDraw = false // Om partiet endte i uavgjort
    this.isFinished = false // Om partiet er ferdig
    this.statusText = 'The game is in progress.' // Tekstlig status for partiet
  }

  // Metode for å bygge en FEN-string basert på partiets tilstand.
  getFen() {
    const { board, toMove, castling, enPassant, halfMoves, fullMoves } = this
    return `${board.getFen()} ${toMove} ${castling} ${enPassant} ${halfMoves} ${fullMoves}`
  }

  // Metode for å hente en liste over lovlige trekk i partiet.
  // Formateres på en måte som er nyttig for brukeren av sjakkmotoren.
  getLegalMoves() {
    return this.board.legalMoves.map(m => ({
      from: m.from.name,
      to: m.to.name,
      capture: m.capture,
      special: m.special,
      notation: m.notation
    }))
  }

  // Metode for å gjøre et trekk fra et gitt felt til et annet felt.
  // Tar også imot parameter for bondeforfremmelse dersom dette er aktuelt.
  makeMove({ from, to, promoteTo }) {
    // Returnerer dersom spillet allerede er ferdig.
    if (this.isFinished) {
      return false
    }

    // Forsøker å gjøre trekket i brettklassen.
    const move = this.board.makeMove({ from, to, promoteTo })
    if (!move) {
      return false
    }

    // Henter ut informasjon om brikken som ble flyttet.
    // Dersom en konge ble flyttet, oppdater status for rokademuligheter.
    const pieceMoved = move.to.piece.letter.toLowerCase()
    if (pieceMoved === 'k' || pieceMoved === 'r') {
      this.resolveCastling(move)
    }

    // Hvis brikken som ble flyttet var en bonde eller hvis en
    // brikke ble slått ut, nullstill halvttrekk- og posisjonstellerne.
    if (pieceMoved === 'p' || move.capture || move.special === 'promotion') {
      this.halfMoves = 0
      this.positionCounts = {}
    } else {
      this.halfMoves++
    }

    // Hvis det var svart som flyttet, øker trekktelleren for å indikere neste heltrekk.
    if (this.toMove === 'b') {
      this.fullMoves++
    }

    // Hvis en bonde ble flyttet to felter framover, marker feltet for spesialtrekket "en passant".
    if (move.special === 'doublePawnMove') {
      const y = (move.from.y + move.to.y) / 2
      this.enPassant = this.board.getSquare({ x: move.from.x, y }).name
    } else {
      this.enPassant = '-'
    }

    // Motstanderens tur i neste trekk.
    this.toMove = this.toMove === 'w' ? 'b' : 'w'

    // Kaller metoder for å oppdatere status ytterligere.
    this.updateLegalMoves()
    this.updatePositionCounts()
    this.updateGameStatus()

    // Fører inn trekket i trekkhistorikken.
    this.moveHistory = [
      ...this.moveHistory,
      {
        from: move.from.name,
        to: move.to.name,
        notation: `${move.notation}${this.inCheckmate ? '#' : this.inCheck ? '+' : ''}`
      }
    ]

    // Returnerer true for å indikere at trekket var vellykket.
    return true
  }

  // Metode for å oppdatere rokadevariablene.
  resolveCastling(move) {
    // Dersom rokade allerede ikke var mulig, returner tidlig.
    if (this.castling === '-') {
      return
    }

    // Informasjon om brikken som ble flyttet og dens farge.
    const pieceMoved = move.to.piece.letter.toLowerCase()
    const isWhite = this.toMove === 'w'

    // Fjerner rokademuligheter permanent dersom en konge ble flyttet.
    // Fjerner rokademuligheter for tilsvarende fløy dersom en av tårnene ble flyttet.
    if (pieceMoved === 'k') {
      this.castling = this.castling.replace(isWhite ? 'K' : 'k', '')
      this.castling = this.castling.replace(isWhite ? 'Q' : 'q', '')
    } else if (pieceMoved === 'r' && move.from.x === 0) {
      this.castling = this.castling.replace(isWhite ? 'Q' : 'q', '')
    } else if (pieceMoved === 'r' && move.from.x === 7) {
      this.castling = this.castling.replace(isWhite ? 'K' : 'k', '')
    }

    // Setter rokademulighetene til "-" i FEN-strengen dersom ingen lenger kan rokere.
    if (!this.castling) {
      this.castling = '-'
    }
  }

  // Metode for å oppdatere de lovlige trekkene via kall på metoden
  // i brettobjektet ved hjelp av informasjon om partiet fra partiklassen.
  updateLegalMoves() {
    this.board.updateLegalMoves({
      toMove: this.toMove,
      enPassant: this.enPassant,
      castling: this.castling
    })
  }

  // Fører opp stillingen i stillingstelleren for å se hvor mange ganger samme stilling har oppstått.
  updatePositionCounts() {
    const fen = this.board.getFen()
    const count = this.positionCounts[fen]
    this.positionCounts[fen] = count ? count + 1 : 1
  }

  // Oppdaterer statusvariablene i partiobjektet ved å sjekke en rekke ulike kriterier.
  updateGameStatus() {
    this.inCheck = this.board.isInCheck(this.toMove)
    this.inCheckmate = this.resolveCheckmate()
    this.isDraw = this.resolveDraw()
    this.isFinished = this.inCheckmate || this.isDraw
  }

  // Metode for å sjekke om partiet har endt i sjakk matt.
  resolveCheckmate() {
    if (this.inCheck && !this.board.legalMoves.length) {
      this.statusText = `${this.toMove === 'w' ? 'Black' : 'White'} won by checkmate.`
      return true
    }
    return false
  }

  // Metode for å sjekke om partiet har endt i remis (uavgjort).
  resolveDraw() {
    // 50 trekk uten at en bonde flyttes eller en brikke er tatt.
    if (this.halfMoves >= 100) {
      this.statusText = 'Draw due to the fifty-move rule.'
      return true
    }

    // Samme stilling har oppstått 3 ganger.
    if (Object.values(this.positionCounts).some(p => p >= 3)) {
      this.statusText = 'Draw due to threefold repetition.'
      return true
    }

    // Ingen lovlige trekk og ikke i sjakk.
    if (!this.inCheck && !this.board.legalMoves.length) {
      this.statusText = 'Draw due to stalemate.'
      return true
    }

    // Ingen av spillerne har nok brikker til å sette sjakk matt.
    const { whiteCanMate, blackCanMate } = this.board.resolveMatingMaterial()
    if (!whiteCanMate && !blackCanMate) {
      this.statusText = 'Draw due to insufficient material.'
      return true
    }

    return false
  }

  // Metode som kalles utenfra når en av spillerne gir opp.
  playerResign(colour) {
    const [winner, loser] = colour === 'b' ? ['White', 'Black'] : ['Black', 'White']
    this.statusText = `${loser} resigned. ${winner} won.`
    this.isFinished = true
  }

  // Metode som kalles utenfra når spillerne er enige om remis.
  playerDraw() {
    this.statusText = 'Draw by agreement.'
    this.isDraw = true
    this.isFinished = true
  }

  // Metode som kalles utenfra når en spiller ikke har med tid igjen.
  // Dersom motstanderen ikke har nok brikker til å sette sjakk matt,
  // er det ikke mulig å tape partiet på tid, og partiet ender i remis.
  playerTimeout(colour) {
    const { whiteCanMate, blackCanMate } = this.board.resolveMatingMaterial()
    if (colour === 'w') {
      if (blackCanMate) {
        this.statusText = 'Black won on time.'
      } else {
        this.statusText = 'Draw due to timeout.'
        this.isDraw = true
      }
    } else {
      if (whiteCanMate) {
        this.statusText = 'White won on time.'
      } else {
        this.statusText = 'Draw due to timeout.'
        this.isDraw = true
      }
    }
    this.isFinished = true
  }
}

module.exports = Game
