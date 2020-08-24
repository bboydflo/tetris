import { KEY, ROWS, COLS, POINTS } from './constants'
import { createFragment, delegate } from './utils'
import { Tetris } from './tetris'
import './styles.css'

// setup
document.documentElement.style.setProperty('--number-of-rows', ROWS)
document.documentElement.style.setProperty('--number-of-columns', COLS)

// let gameOver = false
// let gameScore = 0
const root = document.getElementById('root')
let requestId = 0
let startTime = performance.now()

// create new board
const game = new Tetris()

const tetrisTemplate = (gameState) => {
    const { score, grid, currentPiece, nextPiece } = gameState;

    return `
        <div class="tetris">
            <div class="board">
                <div class="grid">
                ${
                    grid
                        .map((rows, rowIndex) => {
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

                                    // return `<span class="cell cell-${v}"></span>`
                                    return `<span class="cell cell-${v} row-${rowIndex} col-${colIndex}"></span>`
                                })
                                .join('')
                        })
                        .join('')
                }
                </div>
            </div>
            <div class="board-info">
                <p class="score">Score: <span class="score-value">${score}</span></p>
                <div class="controls">
                    <button class="play">play</button>
                </div>
                <div class="nextPiece">
                    <div class="grid-${nextPiece.shape.length}">${
                        nextPiece.shape
                            .map((rows, rowIndex) => {
                                return rows
                                    .map((v, colIndex) => {
                                        return `<span class="cell cell-${v} row-${rowIndex} col-${colIndex}"></span>`
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
            game.updateCurrentPiece()

            // update score
            game.updateScore()

            // check if game is over
            if (game.isGameOver()) {
                gameOver = true
                cancelAnimationFrame(requestId)

                gameScore = 0
                // game = new Game()
                game.reset()
                document.getElementsByClassName('play')[0].innerHTML = 'Reset'

                return console.log('game is over. total score = ', gameScore)
            }

            // update current and next piece
            game.updatePieces()

            /* // get next piece and draw it on the side
            const nextPieceHTML = game.drawNextPiece()
            root.getElementsByClassName('nextPiece')[0].innerHTML = nextPieceHTML */
        }

        /* // refresh board
        const b = game.drawBoard()
        root.getElementsByClassName('grid')[0].outerHTML = b
        // refresh score
        root.getElementsByClassName('score-value')[0].innerHTML = gameScore */

        render(root, game)

        startTime = now
    }

    requestId = requestAnimationFrame(gameLoop)
}

const run = (rootEl, htmlFragment) => {
    rootEl.appendChild(htmlFragment)

    // get play button
    const playBtn = document.getElementsByClassName('play')[0]
    if (playBtn) {
        playBtn.addEventListener('click', function onPlayClicked() {
            if (gameOver) {
                game.reset()
                this.innerHTML = 'Play'

                gameScore = 0
                const b = game.drawBoard()
                root.getElementsByClassName('grid')[0].outerHTML = b
                // refresh score
                root.getElementsByClassName('score-value')[0].innerHTML = gameScore

                gameOver = !gameOver

                return
            }

            // update current and next piece
            game.updatePieces()

            // refresh board
            const b = game.drawBoard()
            root.getElementsByClassName('grid')[0].outerHTML = b

            // get next piece and draw it on the side
            const nextPieceHTML = game.drawNextPiece()
            root.getElementsByClassName('nextPiece')[0].innerHTML = nextPieceHTML

            // dely game loop with 1 second
            setTimeout(gameLoop, 1000)
        })
    }


}

const render = (_root, _game) => {
    const initialGameState = _game.getState()
    // const pageFragment = createFragment(tetrisTemplate(initialGameState))
    // _root.replaceChild(pageFragment, root.parentNode)
    _root.innerHTML = tetrisTemplate(initialGameState)
}

if (root) {
    /* const initialGameState = game.getState()
    const pageFragment = createFragment(tetrisTemplate(initialGameState))
    // run(root, pageFragment)
    root.appendChild(pageFragment) */

    // initial render
    render(root, game)

    delegate('keydown', 'body', function(event) {
        const { isGameOver } = game.getState()
        if (isGameOver) {
            return console.log('game is already over')
        }
        if (event.keyCode === KEY.P) {
            if (!requestId) {
                gameLoop()
                return console.log('game restarted')
            }
            cancelAnimationFrame(requestId)
            requestId = null
            return console.log('game paused')
        }
        if (event.keyCode === KEY.ESC) {
            game.exitGame()
            cancelAnimationFrame(requestId)
            return console.log('game over')
        }

        let nextPosition = game.getNextPosition(event.keyCode)
        if (event.keyCode === KEY.SPACE || game.isValidPosition(nextPosition)) {
            game.movePiece(nextPosition)
            return render(root, game)
        }
        return console.log('invalid position', nextPosition)
    })

    delegate('click', '.play', function(event) {
        const { gameState } = game.getState()

        if (gameState === 0) {
            // reset
        }
        if (gameState === 1) {
            game.start()
            gameLoop()
        }
        if (gameState === 2) {
            // pause
        }
        if (gameState === 3) {
            // resume
        }
    })

    // attach event listeners
    // document.addEventListener('keydown', event => )

    // document.addEventListener('click', event => {
    //     console.log(event.target);
    // })

    /* // get play button
    const playBtn = document.getElementsByClassName('play')[0]
    if (playBtn) {
        playBtn.addEventListener('click', function onPlayClicked() {
            if (gameOver) {
                game.reset()
                this.innerHTML = 'Play'

                gameScore = 0
                const b = game.drawBoard()
                root.getElementsByClassName('grid')[0].outerHTML = b
                // refresh score
                root.getElementsByClassName('score-value')[0].innerHTML = gameScore

                gameOver = !gameOver

                return
            }

            // update current and next piece
            game.updatePieces()

            // refresh board
            const b = game.drawBoard()
            root.getElementsByClassName('grid')[0].outerHTML = b

            // get next piece and draw it on the side
            const nextPieceHTML = game.drawNextPiece()
            root.getElementsByClassName('nextPiece')[0].innerHTML = nextPieceHTML

            // dely game loop with 1 second
            setTimeout(gameLoop, 1000)
        })
    } */
}
