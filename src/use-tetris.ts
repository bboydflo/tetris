import { useRef, useState, useCallback } from 'react'
import raf from 'raf'

import { Key, ROWS, COLS } from './constants'
import { GameState, Tetris } from './tetris'

export function useTetris() {
    const [_, setTick] = useState(0)
    const gameRef = useRef(new Tetris(ROWS, COLS))
    const requestRef = useRef(0)
    const previousTimeRef = useRef(performance.now())

    const forceUpdate = () => {
        setTick(prevCount => (prevCount + 1) % 100)
    }

    const startGame = useCallback(() => {
        gameRef.current.start()
        requestRef.current = animate(0)
    }, [])
    const pauseGame = useCallback(() => {
        raf.cancel(requestRef.current)
        requestRef.current = 0
        gameRef.current.pause()
    }, [])
    const resumeGame = useCallback(() => {
        gameRef.current.resume()
        requestRef.current = animate(0)
    }, [])
    const resetGame = useCallback(() => {
        raf.cancel(requestRef.current)
        requestRef.current = 0
        gameRef.current.reset()
    }, [])
    const restartGame = useCallback(() => {
        resetGame()
        startGame()
    }, [resetGame, startGame])

    const animate = (time: number) => {
        if (time - previousTimeRef.current >= 1000) {
            previousTimeRef.current = time

            // TODO: investigate when to update previousTimeRef (before or after the tick?)
            const game = gameRef.current
            game.tick(() => {
                raf.cancel(requestRef.current)
                requestRef.current = 0
            })

            forceUpdate()
        }

        return raf(animate)
    }

    const handlePlay = useCallback(() => {
        const { gameState } = gameRef.current.getState()
        switch(gameState) {
            case GameState.GAME_OVER:
                restartGame()
            break
            case GameState.READY:
                startGame()
            break
            case GameState.IN_PROGRESS:
                pauseGame()
            break
            case GameState.PAUSED:
                resumeGame()
            break
        }
    }, [])

    const handleKey = useCallback((key: Key) => {
        const game = gameRef.current
        const { gameState } = game.getState()

        if (gameState === GameState.GAME_OVER) {

            // TODO: add better warning
            return console.log('game is already over')
        }

        // handle Escape key
        if (key === Key.ESC) {
            raf.cancel(requestRef.current)
            requestRef.current = 0

            resetGame()
            // game.over()

            return forceUpdate()
        }

        // handle P key
        if (key === Key.P) {
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

        // TODO: add better warning or resume game whenever another directions key is pressed
        if (gameState === GameState.PAUSED) {
            return console.log('game is paused')
        }

        if (gameState === GameState.IN_PROGRESS) {
            const nextPosition = game.getNextPosition(key)
            if (game.isValidPosition(nextPosition)) {
                game.movePiece(nextPosition)
                return forceUpdate()
            }
        }

    }, [])

    const tetrisState = gameRef.current.getState()

    return {
        tetrisState,
        startGame,
        pauseGame,
        resumeGame,
        resetGame,
        restartGame,
        handlePlay,
        handleKey
    }
}
