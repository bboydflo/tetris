import { ROTATION, ROWS, COLS, KEY } from './constants'
import { Piece } from './piece'

export class Board {
    constructor() {
        this.reset()
    }

    getEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    }

    reset() {
        this.grid = this.getEmptyBoard()
    }

    drawBoard() {
        const cells = this.grid
            .map((rows, rowIndex) => {
                return rows
                    .map((v, colIndex) => {

                        // does piece exist and it is in the viewport?
                        if (this.piece && this.piece.y >= 0) {

                            const innerX = colIndex - this.piece.x
                            const innerY = rowIndex - this.piece.y

                            // limits
                            if (innerX >= 0 && innerY >= 0 && innerX < this.piece.shape.length && innerY < this.piece.shape.length) {
                                if (this.piece.shape[innerY][innerX] > 0) {
                                    v = this.piece.shape[innerY][innerX]
                                }
                            }
                        }

                        // return `<span class="cell cell-${v}"></span>`
                        return `<span class="cell cell-${v} row-${rowIndex} col-${colIndex}"></span>`
                    })
                    .join('')
            })
            .join('')

        return `
            <div class="grid">${cells}</div>
        `
    }

    start() {
        this.piece = new Piece({
            grid: this.grid,
            x: COLS / 2 - 1,
            y: -1
        })
    }

    advanceFrame() {
        this.piece.move(KEY.DOWN)
    }

    getNextPosition(key) {
        let p = this.piece.clone()
        switch (key) {
            case KEY.UP:
                p = this.piece.rotate(p, ROTATION.RIGHT)
                break
            case KEY.Q:
                p = this.piece.rotate(p, ROTATION.LEFT)
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
        }
        return p
    }

    isValidPosition(p) {

        /* return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return (
                    value === 0 ||
                    (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
                );
            });
        }) */

        // is inside the walls
        if (p.x < 0 || p.x + p.shape.length > COLS) {
            console.log('is not inside walls', p)
            return false
        }

        // is above the floor
        if (p.y < 0) {
            console.log('is not above floor', p)
            return false
        }

        // not occupied
        const isOccupied = p.shape.reduce((acc, curr, rowIndex) => {
            if (!acc) {
                acc = curr.reduce((acc1, curr1, colIndex) => {
                    if (!acc1 && curr1) {
                        acc1 = /* p.shape[rowIndex][colIndex] > 0 &&  */ this.grid[p.x + rowIndex - 1][p.y + colIndex - 1] !== 0
                        if (acc1) {
                            console.warn({
                                x: p.x,
                                y: p.y,
                                rowIndex, colIndex,
                                cell: this.grid[p.x + rowIndex][p.y + colIndex]})
                        }
                    }
                    return acc1
                }, false)
            }
            return acc
        }, false)

        if (isOccupied) {
            console.log('is occupied', p)
            return false
        }

        return true
    }

    insideWalls(x) {
        return x >= 0 && x < COLS;
    }

    aboveFloor(y) {
        return y <= ROWS;
    }

    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }

    movePiece(p) {
        this.piece.x = p.x
        this.piece.y = p.y
        this.piece.shape = p.shape
    }
}
