import { ROTATION, COLORS, SHAPES, KEY } from './constants'

export class Piece {
    constructor({ x, y }) {
        this.x = x || 0
        this.y = y || 0

        // this.color = COLORS[this.randomizeTetrominoType()]
        this.shape = SHAPES[this.randomizeTetrominoType()]
    }

    randomizeTetrominoType() {
        return Math.floor(Math.random() * COLORS.length);
    }

    move(key) {
        switch (key) {
            case KEY.DOWN:
                this.y += 1
                break
        }
    }

    setPosition(x, y) {
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
export const rotatePiece = (p, direction) => {
    console.log(direction)

    // Transpose matrix
    for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]]
        }
    }

    // Reverse the order of the columns.
    if (direction === ROTATION.RIGHT) {
        p.shape.forEach(row => row.reverse())
    } else if (direction === ROTATION.LEFT) {
        p.shape.reverse()
    }

    return p
}
