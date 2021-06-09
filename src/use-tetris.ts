import { useEffect, useRef, useState } from 'react'

import { Key, ROWS, COLS } from './constants'
import { GameState, Tetris } from './tetris'
import useEventListener from './use-event-listener'

export function useTetris() {
    const [_, setCount] = useState(0)
    const gameRef = useRef(new Tetris(ROWS, COLS))
    const requestRef = useRef(0)
    const previousTimeRef = useRef(performance.now())

    const forceUpdate = () => {
        setCount(prevCount => (prevCount + 1) % 100)
    }

    const startGame = () => {
        gameRef.current.start()
    }
    const pauseGame = () => {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = 0
        gameRef.current.pause()
    }
    const resumeGame = () => {
        gameRef.current.resume()
        requestRef.current = animate(0)
    }
    const resetGame = () => {
        gameRef.current.reset()
    }
    const restartGame = () => {
        resetGame()
        startGame()
    }

    const animate = (time: number) => {
        if (time - previousTimeRef.current >= 1000) {
            const game = gameRef.current
            const { gameState } = game.getState()

            previousTimeRef.current = time

            if (gameState === GameState.IN_PROGRESS) {
                const nextPosition = game.getNextPosition(Key.DOWN)
                if (game.isValidPosition(nextPosition)) {
                    game.movePiece(nextPosition)
                } else {
                    game.setCurrentPiece()

                    game.updateScore()

                    if (game.isGameOver()) {
                        game.over()
                        cancelAnimationFrame(requestRef.current)
                        requestRef.current = 0
                    } else {

                        // update current and next piece
                        game.updatePieces()
                    }
                }
            }

            forceUpdate()
        }

        return requestAnimationFrame(animate)
    }

    const handlePlay = () => {
        const { gameState } = gameRef.current.getState()

        if (gameState === GameState.GAME_OVER) {
            restartGame()
        }
        if (gameState === GameState.READY) {
            startGame()
        }
        if (gameState === GameState.IN_PROGRESS) {
            pauseGame()
        }
        if (gameState === GameState.PAUSED) {
            resumeGame()
        }
    }

    useEffect(function gameLoop() {
        // start game loop
        requestRef.current = animate(0)

        // initial update
        forceUpdate()

        return () => {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = 0

            gameRef.current.reset()
            gameRef.current = new Tetris(ROWS, COLS)

            previousTimeRef.current = 0
        }
    }, [])

    useEventListener('keydown', function handleKeyDownEvents(event) {
        const game = gameRef.current
        const { gameState } = game.getState()

        if (gameState === GameState.GAME_OVER) {

            // TODO: add better warning
            return console.log('game is already over')
        }
        if (event.keyCode === Key.P) {
            if (gameState === GameState.READY) {
                startGame()
            }
            if (gameState === GameState.PAUSED) {
                resumeGame()
            }
            if (gameState === GameState.IN_PROGRESS) {
                pauseGame()
            }

            return forceUpdate()
        }
        if (event.keyCode === Key.ESC) {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = 0

            resetGame()
            // game.over()

            return forceUpdate()
        }

        if (gameState === GameState.PAUSED) {
            // TODO: add better warning
            return console.log('game is paused')
        }

        if (gameState === GameState.IN_PROGRESS) {
            const nextPosition = game.getNextPosition(event.keyCode)
            if (event.keyCode === Key.SPACE || game.isValidPosition(nextPosition)) {
                game.movePiece(nextPosition)
                return forceUpdate()
            }
        }
    }, document.body)

    const tetrisState = gameRef.current.getState()

    return {
        tetrisState,
        startGame,
        pauseGame,
        resumeGame,
        resetGame,
        restartGame,
        handlePlay
    }
}
