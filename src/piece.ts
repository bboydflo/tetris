import { Directions, COLORS, SHAPES } from './constants'

interface PieceProperties {
    x: number
    y: number
}

export class Piece {
    public x: number = 0
    public y: number = 0
    public shape: Array<number[]> = []

    constructor({ x, y }: PieceProperties) {
        this.x = x || 0
        this.y = y || 0

        // this.color = COLORS[this.randomizeTetrominoType()]
        this.shape = SHAPES[this.randomizeTetrominoType()]
    }

    randomizeTetrominoType() {
        return Math.floor(Math.random() * COLORS.length)
    }

    setPosition(x: number, y: number) {
        this.x = x
        this.y = y
    }

    clone() {
        return JSON.parse(JSON.stringify(this))
    }
}


/**
 * to rotate a matrix first we need to build its transpose
 * then if we rotate it to the left we need to reverse the rows
 * otherwise for each row we need to reverse columns
 */
export const rotatePiece = (p: Piece, direction: Directions) => {

    // transpose matrix
    for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]]
        }
    }

    // reverse the order of the columns.
    if (direction === Directions.RIGHT) {
        p.shape.forEach(row => row.reverse())
    } else if (direction === Directions.LEFT) {
        p.shape.reverse()
    }

    return p
}

