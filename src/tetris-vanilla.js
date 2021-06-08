import { KEY, ROWS, COLS } from './constants'
import { delegate } from './utils'
import { Tetris } from './tetris'
import './styles.css'

// grid setup
document.documentElement.style.setProperty('--number-of-rows', ROWS)
document.documentElement.style.setProperty('--number-of-columns', COLS)

const game = new Tetris(ROWS, COLS)
const root = document.querySelector('#root')

let requestId = 0
let startTime = performance.now()

const tetrisTemplate = (state) => {
    const { score, grid, currentPiece, nextPiece, gameState } = state
    let playBtnLabel = 'Play'
    if (gameState === 'in-progress') {
        playBtnLabel = 'Pause'
    }
    if (gameState === 'paused') {
        playBtnLabel = 'Resume'
    }
    if (gameState === 'over') {
        playBtnLabel = 'Reset'
    }

    return `
        <div class='tetris'>
            <div class='board'>
                <div class='grid'>
                ${grid.map((rows, rowIndex) => {
        return rows
            .map((v, colIndex) => {

                // does piece exist and it is in the viewport?
                if (currentPiece && currentPiece.y >= 0) {

                    const innerX = colIndex - currentPiece.x
                    const innerY = rowIndex - currentPiece.y

                    // limits
                    if (innerX >= 0 && innerY >= 0 && innerX < currentPiece.shape.length && innerY < currentPiece.shape.length) {
                        if (currentPiece.shape[innerY][innerX] > 0) {
                            v = currentPiece.shape[innerY][innerX]
                        }
                    }
                }

                // return `<span class='cell cell-${v}'></span>`
                return `<span class='cell cell-${v} row-${rowIndex} col-${colIndex}'></span>`
            })
            .join('')
    })
            .join('')
        }
                </div>
            </div>
            <div class='board-info'>
                <p class='score'>Score: <span class='score-value'>${score}</span></p>
                <div class='controls'>
                    <button class='play'>${playBtnLabel}</button>
                </div>
                <div class='nextPiece'>
                    <div class='grid-${nextPiece.shape.length}'>${nextPiece.shape
            .map((rows, rowIndex) => {
                return rows
                    .map((v, colIndex) => {
                        return `<span class='cell cell-${v} row-${rowIndex} col-${colIndex}'></span>`
                    })
                    .join('')
            })
            .join('')}
                    </div>
                </div>
            </div>
        </div>
    `
}

const gameLoop = (now = 0) => {
    if (now - startTime > 1000) {
        const nextPosition = game.getNextPosition(KEY.DOWN)
        if (game.isValidPosition(nextPosition)) {
            game.movePiece(nextPosition)
        } else {
            game.setCurrentPiece()

            game.updateScore()

            if (game.isGameOver()) {
                cancelAnimationFrame(requestId)
                requestId = null
            } else {

                // update current and next piece
                game.updatePieces()
            }
        }

        renderGame(root, game)
        startTime = now
    }

    requestId = requestAnimationFrame(gameLoop)
}

const renderGame = (_root, _game) => {
    const initialGameState = _game.getState()
    _root.innerHTML = tetrisTemplate(initialGameState)
}

if (root) {

    // initial render
    renderGame(root, game)

    // setup event handlers
    delegate('keydown', 'body', function (event) {
        const { isGameOver, gameState } = game.getState()
        if (gameState === 'over' || isGameOver) {
            return console.log('game is already over')
        }
        if (event.keyCode === KEY.P) {
            if (!requestId) {
                game.resume()
                gameLoop()
            } else {
                cancelAnimationFrame(requestId)
                requestId = null
                game.pause()
            }

            return renderGame(root, game)
        }
        if (event.keyCode === KEY.ESC) {
            game.reset()
            // game.over()
            cancelAnimationFrame(requestId)
            requestId = null

            return renderGame(root, game)
        }

        if (gameState === 'paused') {
            return console.log('game is paused')
        }

        let nextPosition = game.getNextPosition(event.keyCode)
        if (event.keyCode === KEY.SPACE || game.isValidPosition(nextPosition)) {
            game.movePiece(nextPosition)
            return renderGame(root, game)
        }
    })
    delegate('click', '.play', function () {
        const { gameState } = game.getState()
        console.log('current state ', gameState)

        if (gameState === 'over') {
            game.reset()
            game.start()
            gameLoop()
        }
        if (gameState === 'ready') {
            game.start()
            gameLoop()
        }
        if (gameState === 'in-progress') {
            game.pause()
            cancelAnimationFrame(requestId)
            requestId = null
        }
        if (gameState === 'paused') {
            game.resume()
            gameLoop()
        }
    })
}
