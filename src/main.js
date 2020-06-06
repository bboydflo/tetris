import { ROWS, COLS, KEY } from './constants'
import { createFragment } from './utils'
import { Board } from './board'
import './styles.css'

// setup
document.documentElement.style.setProperty('--number-of-rows', ROWS)
document.documentElement.style.setProperty('--number-of-columns', COLS)

// request animation frame setup
let gameOver = false
let requestId = 0
let startTime = performance.now()

// get root element
const root = document.getElementById('root')

// create new board
const board = new Board()

const tetrisTemplate = (boardTemplate) => {
    return `
        <div class="tetris">
            <div class="board">
                ${boardTemplate}
            </div>
            <div class="controls">
                <button class="play">play</button>
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
            console.log('update board -> clearLines -> draw a new random piece')

            board.updateBoard()
            board.clearLines()
            // check if game is over
            /* if (this.piece.y === 0) {
                // Game over
                return false;
            } */
            // start a new piece
            board.updatePieces()
        }

        // refresh board
        const b = board.drawBoard()
        root.getElementsByClassName('grid')[0].outerHTML = b

        startTime = now
    }

    requestId = requestAnimationFrame(gameLoop)

    /* return () => {
        cancelAnimationFrame(requestId)
    } */
}

const run = (rootEl, htmlFragment) => {
    rootEl.appendChild(htmlFragment)

    // get play button
    const playBtn = document.getElementsByClassName('play')[0]
    if (playBtn) {
        playBtn.addEventListener('click', function onPlayClicked(event) {

            // set active piece and next piece
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
        const nextPosition = board.getNextPosition(event.keyCode)

        if (board.isValidPosition(nextPosition)) {
            board.movePiece(nextPosition)

            // refresh board
            const b = board.drawBoard()
            root.getElementsByClassName('grid')[0].outerHTML = b
        } else {
            console.log('invalid position', nextPosition)
        }

        /* if (MOVES[event.keyCode]) {
            event.preventDefault()
            // Get new state
            let p = MOVES[event.keyCode](board.piece)
            if (event.keyCode === KEY.SPACE) {
                // Hard drop
                while (board.valid(p)) {
                    account.score += POINTS.HARD_DROP
                    board.piece.move(p)
                    p = MOVES[KEY.DOWN](board.piece)
                }
                board.piece.hardDrop()
            } else if (board.valid(p)) {
                board.piece.move(p)
                if (event.keyCode === KEY.DOWN) {
                    account.score += POINTS.SOFT_DROP
                }
            }
        } */
    })
}

// build page fragment
const pageFragment = createFragment(tetrisTemplate(board.drawBoard()))

if (root) {
    run(root, pageFragment)
}
