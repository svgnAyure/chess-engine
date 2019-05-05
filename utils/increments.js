/**
 * Inneholder inkrementdefinisjoner.
 * Brukes av klassene for å beskrive hvordan brikkene flyttes.
 * Et inkrement består av en x-komponent og en y-komponent, og
 * beskriver retningen brikkene flytter for hvert steg.
 */

module.exports = {
  diagonalIncrements: [{ x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }],
  orthogonalIncrements: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }],
  knightIncrements: [
    { x: 2, y: 1 },
    { x: 2, y: -1 },
    { x: 1, y: 2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: -1, y: -2 },
    { x: -2, y: 1 },
    { x: -2, y: -1 }
  ]
}
