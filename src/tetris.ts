import { Key, Directions } from './constants'
import { Piece, rotatePiece } from './piece'

export enum GameState {
    READY = 'ready',
    IN_PROGRESS = 'in-progress',
    PAUSED = 'paused',
    GAME_OVER = 'game-over'
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

const getEmptyBoard = (rows: number, columns: number) => {
    return Array.from({ length: rows }, () => Array(columns).fill(0) as number[])
}

export interface TetrisState {
    grid: number[][],
    score: number,
    piece: Piece | null
    nextPiece: Piece,
    gameState: GameState
}

export class Tetris {
    private state: TetrisState = {
        grid: [],
        score: 0,
        piece: null,
        nextPiece: new Piece(),
        gameState: GameState.READY
    }

    constructor(public rows: number, public columns: number) {
        this.reset()
    }

    reset() {
        this.state = {
            grid: getEmptyBoard(this.rows, this.columns),
            score: 0,
            piece: null,

            // TODO: better intialize x position of the next piece
            nextPiece: new Piece({
                x: this.columns / 2 - 1,
                y: -1
            }),
            gameState: GameState.READY,
        }
    }

    start() {
        const { nextPiece } = this.state

        this.state = {
            ...this.state,
            piece: nextPiece,

            // TODO: better intialize x position of the next piece
            nextPiece: new Piece({
                x: this.columns / 2 - 1,
                y: -1
            }),
            gameState: GameState.IN_PROGRESS
        }
    }

    pause() {
        this.state.gameState = GameState.PAUSED
    }

    resume() {
        this.state.gameState = GameState.IN_PROGRESS
    }

    over() {
        this.state.gameState = GameState.GAME_OVER
    }

    getState() {
        return this.state
    }

    updatePieces() {
        if (this.state.nextPiece) {
            this.state.piece = this.state.nextPiece
            this.state.nextPiece = new Piece({
                x: this.columns / 2 - 1,
                y: 0
            })
        } else {
            this.state.piece = new Piece({
                x: this.columns / 2 - 1,
                y: 0
            })
            this.state.nextPiece = new Piece({
                x: this.columns / 2 - 1,
                y: 0
            })
        }
    }

    getNextPosition(key: Key) {
        let p = this.state.piece!.clone()
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
                    this.state.score += POINTS.HARD_DROP
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
                if (value > 0 && this.state.grid[y] && this.state.grid[y][x] > 0) {
                    // PRODUCTION is globally defined by webpack at build time
                    if (!PRODUCTION) {
                        console.warn(`point (${y}, ${x}) is already filed with value ${this.state.grid[y][x]}`)
                    }
                    return false
                }

                return true
            })
        })
    }

    movePiece(p: Piece) {
        this.state.piece!.x = p.x
        this.state.piece!.y = p.y
        this.state.piece!.shape = p.shape
    }

    tick(onGameOver: () => void) {
        if (this.state.gameState === GameState.IN_PROGRESS) {
            const nextPosition = this.getNextPosition(Key.DOWN)
            if (this.isValidPosition(nextPosition)) {
                this.movePiece(nextPosition)
            } else {
                this.setCurrentPiece()

                this.updateScore()

                if (this.isGameOver()) {
                    this.over()
                    onGameOver()
                } else {

                    // update current and next piece
                    this.updatePieces()
                }
            }
        }
    }

    setCurrentPiece() {
        this.state.piece!.shape.map((row, rowIndex) => {
            row.map((value, colIndex) => {
                if (value >= 0) {
                    this.state.grid[this.state.piece!.y + rowIndex][this.state.piece!.x + colIndex] = value
                }
            })
        })
    }

    updateScore() {
        const clearedLines = this.clearLines()
        this.state.score += getPoints(clearedLines)
    }

    clearLines() {
        let lines = 0

        /**
         * clear all lines that have all values > 0
         */
        this.state.grid.forEach((row, rowIndex) => {
            if (row.every(value => value > 0)) {
                lines += 1

                // clear the line
                this.state.grid.splice(rowIndex, 1)

                // add new empty line at the beginning
                this.state.grid.unshift(Array.from({ length: this.columns }).fill(0) as number[])
            }
        })

        return lines
    }

    isGameOver() {
        return this.state.piece!.y === 0
    }
}
