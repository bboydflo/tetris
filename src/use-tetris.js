import { useEffect, useRef, useState } from 'react'

import { KEY, ROWS, COLS } from './constants'
import { Tetris } from './tetris'
import useEventListener from './use-event-listener'

export function useTetris() {
    const [_, setCount] = useState(0)
    const gameRef = useRef()
    const requestRef = useRef()
    const previousTimeRef = useRef(performance.now())

    let tetrisState
    if (gameRef.current && typeof gameRef.current.getState === 'function') {
        tetrisState = gameRef.current.getState()
    }

    const forceUpdate = () => {
        setCount(prevCount => (prevCount + 1) % 100)
    }

    const startGame = () => {
        const game = gameRef.current
        if (game) {
            game.start()
        }
    }
    const pauseGame = () => {
        const game = gameRef.current
        if (game) {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null
            game.pause()
        }
    }
    const resumeGame = () => {
        const game = gameRef.current
        if (game) {
            game.resume()
            requestRef.current = animate(0)
        }
    }
    const resetGame = () => {
        const game = gameRef.current
        if (game) {
            game.reset()
        }
    }
    const restartGame = () => {
        const game = gameRef.current
        if (game) {
            resetGame()
            startGame()
        }
    }

    const animate = time => {
        if (time - previousTimeRef.current >= 1000) {
            const game = gameRef.current
            const { gameState } = game.getState()

            previousTimeRef.current = time

            if (gameState === 'in-progress') {
                const nextPosition = game.getNextPosition(KEY.DOWN)
                if (game.isValidPosition(nextPosition)) {
                    game.movePiece(nextPosition)
                } else {
                    game.setCurrentPiece()

                    game.updateScore()

                    if (game.isGameOver()) {
                        game.over()
                        cancelAnimationFrame(requestRef.current)
                        requestRef.current = null
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
        const game = gameRef.current
        const { gameState } = game.getState()

        if (gameState === 'over') {
            restartGame()
        }
        if (gameState === 'ready') {
            startGame()
        }
        if (gameState === 'in-progress') {
            pauseGame()
        }
        if (gameState === 'paused') {
            resumeGame()
        }
    }

    useEffect(function gameLoop() {
        gameRef.current = new Tetris(ROWS, COLS)
        requestRef.current = animate(0)

        // initial update
        forceUpdate()

        return () => {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null

            gameRef.current.reset()
            gameRef.current = null

            previousTimeRef.current = null
        }
    }, [])

    useEventListener('keydown', function handleKeyDownEvents(event) {
        const game = gameRef.current
        const { isGameOver, gameState } = game.getState()

        if (gameState === 'over' || isGameOver) {
            return console.log('game is already over')
        }
        if (event.keyCode === KEY.P) {
            if (gameState === 'ready') {
                startGame()
            }
            if (gameState === 'paused') {
                resumeGame()
            }
            if (gameState === 'in-progress') {
                pauseGame()
            }

            return forceUpdate()
        }
        if (event.keyCode === KEY.ESC) {
            resetGame()
            // game.over()
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null

            return forceUpdate()
        }

        if (gameState === 'paused') {
            return console.log('game is paused')
        }

        if (gameState === 'in-progress') {
            const nextPosition = game.getNextPosition(event.keyCode)
            if (event.keyCode === KEY.SPACE || game.isValidPosition(nextPosition)) {
                game.movePiece(nextPosition)
                return forceUpdate()
            }
        }
    }, document.body)

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
