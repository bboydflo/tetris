import React, { useEffect, useRef, useState } from 'react'
import { render } from 'react-dom'

import { KEY, ROWS, COLS } from './constants'
import { Tetris } from './tetris'
import useEventListener from './use-event-listener'
import './styles.css'

const TetrisApp = () => {
    const [count, setCount] = useState(0)
    const gameRef = useRef()

    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef()
    const previousTimeRef = useRef(performance.now())

    let tetrisState
    if (gameRef.current && typeof gameRef.current.getState === 'function') {
        tetrisState = gameRef.current.getState()
    }
    const { score, grid, currentPiece, nextPiece, gameState } = tetrisState || {}

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
                        cancelAnimationFrame(requestId)
                        requestId = null
                    } else {

                        // update current and next piece
                        game.updatePieces()
                    }
                }
            }

            forceUpdate()
        }

        // requestRef.current = requestAnimationFrame(animate)
        const requestId = requestAnimationFrame(animate)

        return requestId
    }

    const forceUpdate = () => {
        setCount(prevCount => (prevCount + 1) % 100)
    }

    const onClickHandler = () => {
        const game = gameRef.current
        const { gameState } = game.getState()
        // const { gameState } = gameRef.current.getState()

        if (gameState === 'over') {
            game.reset()
            game.start()
        }
        if (gameState === 'ready') {
            game.start()
        }
        if (gameState === 'in-progress') {
            game.pause()
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null
        }
        if (gameState === 'paused') {
            game.resume()
            requestRef.current = animate(0)
        }

        // gameRef.current = game
        // force

        // setGameState(game.getState().gameState)
    }

    // grid setup (only once)
    useEffect(function setupGrid() {
        document.documentElement.style.setProperty('--number-of-rows', ROWS)
        document.documentElement.style.setProperty('--number-of-columns', COLS)
    }, [])

    useEffect(function gameLoop() {
        gameRef.current = new Tetris(ROWS, COLS)

        // requestRef.current = requestAnimationFrame(animate)
        requestRef.current = animate(0)

        // initial update
        forceUpdate()

        return () => cancelAnimationFrame(requestRef.current)
    }, []) // Make sure the effect runs only once

    useEventListener('keydown', function handleKeyDownEvents(event) {
        const game = gameRef.current
        const { isGameOver, gameState } = game.getState()

        if (gameState === 'over' || isGameOver) {
            return console.log('game is already over')
        }
        if (event.keyCode === KEY.P) {
            if (!requestRef.current) {
                game.resume()
                requestRef.current = animate(0)
            } else {
                cancelAnimationFrame(requestRef.current)
                requestRef.current = null
                game.pause()
            }

            return forceUpdate()
        }
        if (event.keyCode === KEY.ESC) {
            game.reset()
            // game.over()
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null

            return forceUpdate()
        }

        if (gameState === 'paused') {
            return console.log('game is paused')
        }

        let nextPosition = game.getNextPosition(event.keyCode)
        if (event.keyCode === KEY.SPACE || game.isValidPosition(nextPosition)) {
            game.movePiece(nextPosition)
            return forceUpdate()
        }
    }, document.body)

    if (!tetrisState) {
        return null
    }

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

    return (
        <div className='tetris'>
            <div className='board'>
                <div className='grid'>
                    {
                        grid.map((rows, rowIndex) => {
                            return (
                                rows
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

                                        return <span className={`cell cell-${v} row-${rowIndex} col-${colIndex}`} key={`row-${rowIndex} - col-${colIndex}`}></span>
                                    })
                            )
                        })
                    }
                </div>
            </div>
            <div className='board-info'>
                <p className='score'>Score: <span className='score-value'>{score}</span></p>
                <div className='controls'>
                    <button className='play' onClick={onClickHandler}>{playBtnLabel}</button>
                </div>
                {nextPiece && <div className='nextPiece'>
                    <div className={`grid-${nextPiece.shape.length}`}>
                        {
                            nextPiece.shape
                                .map((rows, rowIndex) => {
                                    return rows
                                        .map((v, colIndex) => {
                                            return <span className={`cell cell-${v} row-${rowIndex} col-${colIndex}`} key={`row-${rowIndex} - col-${colIndex}`}></span>
                                        })
                                })
                        }
                    </div>
                </div>}

            </div>
        </div >
    )
}

render(<TetrisApp />, document.querySelector('#root'))
