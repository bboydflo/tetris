import { KEY, ROWS, COLS, POINTS } from './constants'
import { createFragment } from './utils'
import { Board, getPoints } from './board'
import './styles.css'

// setup
document.documentElement.style.setProperty('--number-of-rows', ROWS)
document.documentElement.style.setProperty('--number-of-columns', COLS)

let gameOver = false
let gameScore = 0
let requestId = 0
let startTime = performance.now()

// create new board
const board = new Board()

const tetrisTemplate = (boardTemplate, score = 0) => {
    return `
        <div class="tetris">
            <div class="board">
                ${boardTemplate}
            </div>
            <div class="board-info">
                <p class="score">Score: <span class="score-value">${score}</span></p>
                <div class="controls">
                    <button class="play">play</button>
                </div>
            </div>
        </div>
    `
}

const gameLoop = (now = 0) => {
    if (now - startTime > 1000) {
        const nextPosition = board.getNextPosition(KEY.DOWN)
        if (board.isValidPosition(nextPosition)) {
            board.movePiece(nextPosition)
        } else {
            board.updateBoard()

            // update score
            const clearedLines = board.clearLines()
            gameScore += getPoints(clearedLines)

            // check if game is over
            if (board.isGameOver()) {
                gameOver = true
                cancelAnimationFrame(requestId)

                return console.log('game is over. total score = ', gameScore)
            }

            // update current and next piece
            board.updatePieces()
        }

        // refresh board
        const b = board.drawBoard()
        root.getElementsByClassName('grid')[0].outerHTML = b

        // refresh score
        const scoreValue$ = root.getElementsByClassName('score-value')[0]
        scoreValue$.innerHTML = gameScore

        startTime = now
    }

    requestId = requestAnimationFrame(gameLoop)
}

const run = (rootEl, htmlFragment) => {
    rootEl.appendChild(htmlFragment)

    // get play button
    const playBtn = document.getElementsByClassName('play')[0]
    if (playBtn) {
        playBtn.addEventListener('click', function onPlayClicked(event) {

            // update current and next piece
            board.updatePieces()

            // refresh board
            const b = board.drawBoard()
            root.getElementsByClassName('grid')[0].outerHTML = b

            // dely game loop with 1 second
            setTimeout(gameLoop, 1000);
        })
    }

    // attach event listeners
    document.addEventListener('keydown', event => {
        if (gameOver) {
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
            gameOver = true
            cancelAnimationFrame(requestId)
            return console.log('game over')
        }
        let nextPosition = board.getNextPosition(event.keyCode)
        if (event.keyCode === KEY.SPACE) {
            while((board.isValidPosition(nextPosition))) {
                gameScore += POINTS.HARD_DROP;
                board.movePiece(nextPosition)
                nextPosition = board.getNextPosition(KEY.DOWN)
            }

            // refresh board
            const b = board.drawBoard()
            return root.getElementsByClassName('grid')[0].outerHTML = b
        }

        if (board.isValidPosition(nextPosition)) {
            board.movePiece(nextPosition)

            // refresh board
            const b = board.drawBoard()
            root.getElementsByClassName('grid')[0].outerHTML = b
        } else {
            return console.log('invalid position', nextPosition)
        }
    })
}

const root = document.getElementById('root')
if (root) {
    const pageFragment = createFragment(tetrisTemplate(board.drawBoard()))
    run(root, pageFragment)
}
