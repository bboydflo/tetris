import { Key, Directions } from './constants'
import { Piece, rotatePiece } from './piece'

export enum GameState {
    READY = 'ready',
    IN_PROGRESS = 'in-progress',
    PAUSED = 'paused',
    RESET = 'reset',
    GAME_OVER = 'over'
}

export class Tetris {
    private grid: number[][] = []
    private score: number = 0
    private piece: Piece | null = null
    private nextPiece: Piece = new Piece({ x: 0, y: 0 })
    private gameState: GameState = GameState.READY

    constructor(public rows: number, public columns: number) {
        // this.rows = rows
        // this.columns = columns
        this.reset()
    }

    getEmptyBoard() {
        return Array.from({ length: this.rows }, () => Array(this.columns).fill(0) as number[])
    }

    reset() {
        this.piece = null
        this.nextPiece = new Piece({
            x: this.columns / 2 - 1,
            y: -1
        })
        this.grid = this.getEmptyBoard()
        this.score = 0
        this.gameState = GameState.READY
    }

    start() {
        this.piece = this.nextPiece
        this.nextPiece = new Piece({
            x: this.columns / 2 - 1,
            y: -1
        })
        this.gameState = GameState.IN_PROGRESS
    }

    pause() {
        this.gameState = GameState.PAUSED
    }

    resume() {
        this.gameState = GameState.IN_PROGRESS
    }

    over() {
        this.gameState = GameState.GAME_OVER
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
                x: this.columns / 2 - 1,
                y: 0
            })
        } else {
            this.piece = new Piece({
                x: this.columns / 2 - 1,
                y: 0
            })
            this.nextPiece = new Piece({
                x: this.columns / 2 - 1,
                y: 0
            })
        }
    }

    getNextPosition(key: Key) {
        let p = this.piece!.clone()
        switch (key) {
            case Key.UP:
                p = rotatePiece(p, Directions.RIGHT)
                break
            case Key.Q:
                p = rotatePiece(p, Directions.LEFT)
                break
            case Key.DOWN:
                p.y += 1
                break
            case Key.RIGHT:
                p.x = p.x + 1
                break
            case Key.LEFT:
                p.x = p.x - 1
                break
            case Key.SPACE:
                let isValidState = true
                while ((this.isValidPosition(p))) {
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

    isValidPosition(p: Piece) {

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
                if (value > 0 && (x < 0 || x >= this.columns)) {

                    // PRODUCTION is globally defined by webpack at build time
                    if (!PRODUCTION) {
                        console.warn(`(${y}, ${x}) is not within the walls`)
                    }
                    return false
                }

                // non empty shape value needs to be above the floor
                if (value > 0 && y >= this.rows) {
                    // PRODUCTION is globally defined by webpack at build time
                    if (!PRODUCTION) {
                        console.warn(`(${y}, ${x}) not above the floor`)
                    }
                    return false
                }

                // non empty shape value needs to fill in an empty spot in the grid
                if (value > 0 && this.grid[y] && this.grid[y][x] > 0) {
                    // PRODUCTION is globally defined by webpack at build time
                    if (!PRODUCTION) {
                        console.warn(`point (${y}, ${x}) is already filed with value ${this.grid[y][x]}`)
                    }
                    return false
                }

                return true
            })
        })
    }

    movePiece(p: Piece) {
        this.piece!.x = p.x
        this.piece!.y = p.y
        this.piece!.shape = p.shape
    }

    setCurrentPiece() {
        this.piece!.shape.map((row, rowIndex) => {
            row.map((value, colIndex) => {
                if (value >= 0) {
                    this.grid[this.piece!.y + rowIndex][this.piece!.x + colIndex] = value
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
                this.grid.unshift(Array.from({ length: this.columns }).fill(0) as number[])
            }
        })

        return lines
    }

    isGameOver() {
        return this.piece!.y === 0
    }

    exitGame() {
        this.reset()
        this.gameState = GameState.RESET
    }
}

const POINTS = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
}

const getPoints = (numberOfLines: number, level = 1) => {
    let points = 0
    switch (numberOfLines) {
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
