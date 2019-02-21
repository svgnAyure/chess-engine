class Piece {
  constructor(square, colour) {
    this.square = square
    this.colour = colour
  }

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
              special: false
            }
          }
          break
        } else {
          yield {
            from: this.square,
            to: square,
            capture: false,
            special: false
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