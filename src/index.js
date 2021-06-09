import React from 'react'
import { render } from 'react-dom'

import { useTetris } from './use-tetris'

import './styles.css'

const TetrisApp = () => {
    const {
        tetrisState,
        handlePlay
    } = useTetris()

    if (!tetrisState) {
        return null
    }

    const { score, grid, currentPiece, nextPiece, gameState } = tetrisState || {}

    let playBtnLabel = 'Play'
    if (gameState === 'in-progress') {
        playBtnLabel = 'Pause'
    }
    if (gameState === 'paused') {
        playBtnLabel = 'Resume'
    }
    if (gameState === 'over') {
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
                    <button className='play' onClick={handlePlay}>{playBtnLabel}</button>
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