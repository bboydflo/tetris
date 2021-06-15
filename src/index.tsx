import React from 'react'
import { render } from 'react-dom'

import { GameState } from './tetris'
import { useTetris } from './use-tetris'
import { browserKeyCodeMap } from './constants'
import useEventListener from './use-event-listener'

import './styles.css'

const TetrisApp: React.FC = () => {
    const {
        tetrisState,
        handlePlay,
        handleKey
    } = useTetris()

    useEventListener('keydown', function(event) {
        const keycode = (event as KeyboardEvent).keyCode as keyof typeof browserKeyCodeMap
        const key = browserKeyCodeMap[keycode]

        handleKey(key)
    })

    const { score, grid, piece, nextPiece, gameState } = tetrisState

    let playBtnLabel = 'Play'
    if (gameState === GameState.IN_PROGRESS) {
        playBtnLabel = 'Pause'
    }
    if (gameState === GameState.PAUSED) {
        playBtnLabel = 'Resume'
    }
    if (gameState === GameState.GAME_OVER) {
        playBtnLabel = 'Restart'
    }

    return (
        <div className='tetris'>
            <div className='board'>
                <div className='grid'>
                    {
                        grid.map((rows, rowIndex) => {
                            return (
                                rows
                                    .map((column, colIndex) => {

                                        // does piece exist and it is in the viewport?
                                        if (piece && piece.y >= 0) {

                                            const innerX = colIndex - piece.x
                                            const innerY = rowIndex - piece.y

                                            // limits
                                            if (innerX >= 0 && innerY >= 0 && innerX < piece.shape.length && innerY < piece.shape.length) {
                                                if (piece.shape[innerY][innerX] > 0) {
                                                    column = piece.shape[innerY][innerX]
                                                }
                                            }
                                        }

                                        return <span className={`cell cell-${column} row-${rowIndex} col-${colIndex}`} key={`row-${rowIndex} - col-${colIndex}`}></span>
                                    })
                            )
                        })
                    }
                </div>
            </div>
            <div className='board-info'>
                <p className='score'>Score: <span className='score-value'>{score}</span></p>
                <div className='controls'>
                    <button className='play' onClick={handlePlay}>{playBtnLabel}</button>
                </div>
                <div className='nextPiece'>
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
                </div>
            </div>
        </div >
    )
}

render(<TetrisApp />, document.querySelector('#root'))
