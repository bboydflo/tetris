import { ROWS, COLS, KEY, ROTATION, POINTS } from './constants'
import { Piece, rotatePiece } from './piece'

export class Tetris {
    constructor() {
        this.reset()
    }

    getEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    }

    reset() {
        this.piece = null
        this.nextPiece = new Piece({
            x: COLS / 2 - 1,
            y: -1
        })
        this.grid = this.getEmptyBoard()
        this.score = 0
        // ready | in-progress | paused | over
        this.gameState = 'ready'
    }

    start() {
        this.piece = this.nextPiece
        this.nextPiece = new Piece({
            x: COLS / 2 - 1,
            y: -1
        })
        this.gameState = 'in-progress'
    }

    pause() {
        this.gameState = 'paused'
    }

    resume() {
        this.gameState = 'in-progress'
    }

    over() {
        this.gameState = 'over'
    }

    getState() {
        return {
            grid: this.grid,
            score: this.score,
            gameState: this.gameState,
            currentPiece: this.piece,
            nextPiece: this.nextPiece
        }
    }

    updatePieces() {
        if (this.nextPiece) {
            this.piece = this.nextPiece
            this.nextPiece = new Piece({
                x: COLS / 2 - 1,
                y: 0
            })
        } else {
            this.piece = new Piece({
                x: COLS / 2 - 1,
                y: 0
            })
            this.nextPiece = new Piece({
                x: COLS / 2 - 1,
                y: 0
            })
        }
    }

    getNextPosition(key) {
        let p = this.piece.clone()
        switch (key) {
            case KEY.UP:
                p = rotatePiece(p, ROTATION.RIGHT)
                break
            case KEY.Q:
                p = rotatePiece(p, ROTATION.LEFT)
                break
            case KEY.DOWN:
                p.y += 1
                break
            case KEY.RIGHT:
                p.x = p.x + 1
                break
            case KEY.LEFT:
                p.x = p.x - 1
                break
            case KEY.SPACE:
                let isValidState = true
                while((this.isValidPosition(p))) {
                    this.score += POINTS.HARD_DROP
                    p.y += 1
                    isValidState = false
                }
                if (!isValidState) {
                    p.y -= 1
                }
                break
        }
        return p
    }

    isValidPosition(p) {

        /**
         * every point of the shape needs to within the walls
         * of the board, needs to be above the floor
         * and also needs to fill an empty spot on the board
         */
        return p.shape.every((row, rowIndex) => {
            return row.every((value, colIndex) => {

                const x = p.x + colIndex
                const y = p.y + rowIndex

                // non empty shape value needs to be within the walls
                if (value > 0 && (x < 0 || x >= COLS)) {
                    console.warn(`(${y}, ${x}) is not within the walls`)
                    return false
                }

                // non empty shape value needs to be above the floor
                if (value > 0 && y >= ROWS) {
                    console.warn(`(${y}, ${x}) not above the floor`)
                    return false
                }

                // non empty shape value needs to fill in an empty spot in the grid
                if (value > 0 && this.grid[y] && this.grid[y][x] > 0) {
                    console.warn(`point (${y}, ${x}) is already filed with value ${this.grid[y][x]}`)
                    return false
                }

                return true
            })
        })
    }

    movePiece(p) {
        this.piece.x = p.x
        this.piece.y = p.y
        this.piece.shape = p.shape
    }

    setCurrentPiece() {
        this.piece.shape.map((row, rowIndex) => {
            row.map((value, colIndex) => {
                if (value >= 0) {
                    this.grid[this.piece.y + rowIndex][this.piece.x + colIndex] = value
                }
            })
        })
    }

    updateScore() {
        const clearedLines = this.clearLines()
        this.score += getPoints(clearedLines)
    }

    clearLines() {
        let lines = 0

        /**
         * clear all lines that have all values > 0
         */
        this.grid.forEach((row, rowIndex) => {
            if (row.every(value => value > 0)) {
                lines += 1

                // clear the line
                this.grid.splice(rowIndex, 1)

                // add new empty line at the beginning
                this.grid.unshift(Array.from({ length: COLS }).fill(0))
            }
        })

        return lines
    }

    isGameOver() {
        return this.piece.y === 0
    }

    exitGame() {
        this.reset()
        this.gameState = 'reset'
    }
}

const getPoints = (numberOfLines, level = 1)  => {
    let points = 0
    switch(numberOfLines) {
        case 1:
            points = POINTS.SINGLE
            break
        case 2:
            points = POINTS.DOUBLE
            break
        case 3:
            points = POINTS.TRIPLE
            break
        case 4:
            points = POINTS.TETRIS
            break
        default:
            points = 0
            break
    }

    return level * points
}
