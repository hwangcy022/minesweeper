import { useEffect, useRef, useState } from 'react'
import {
  DIFFICULTIES,
  chordCell,
  countFlags,
  createEmptyBoard,
  hitMine,
  isWon,
  placeMines,
  revealAllMines,
  revealCell,
  toggleFlag,
} from '../lib/minesweeper'

const NUMBER_COLORS = ['', '#1d4ed8', '#15803d', '#dc2626', '#6d28d9', '#9a3412', '#0f766e', '#111827', '#6b7280']

export default function Board({ difficulty, onGameEnd }) {
  const cfg = DIFFICULTIES[difficulty]
  const [board, setBoard] = useState(() => createEmptyBoard(cfg.rows, cfg.cols))
  const [status, setStatus] = useState('ready') // ready | playing | won | lost
  const [seconds, setSeconds] = useState(0)
  const [flagMode, setFlagMode] = useState(false)
  const timerRef = useRef(null)
  const longPressRef = useRef(null)

  const reset = () => {
    clearInterval(timerRef.current)
    setBoard(createEmptyBoard(cfg.rows, cfg.cols))
    setStatus('ready')
    setSeconds(0)
  }

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  const finish = (nextBoard, result) => {
    setStatus(result)
    setBoard(result === 'lost' ? revealAllMines(nextBoard) : nextBoard)
    onGameEnd?.({ won: result === 'won', seconds, difficulty })
  }

  const handleReveal = (r, c) => {
    if (status === 'won' || status === 'lost') return
    let next = board
    if (status === 'ready') {
      next = placeMines(board, cfg.mines, r, c)
      setStatus('playing')
    }
    const cell = next[r][c]
    if (cell.flagged) return
    next = cell.revealed ? chordCell(next, r, c) : revealCell(next, r, c)
    if (hitMine(next)) return finish(next, 'lost')
    if (isWon(next, cfg.mines)) return finish(next, 'won')
    setBoard(next)
  }

  const handleFlag = (r, c) => {
    if (status === 'won' || status === 'lost' || status === 'ready') return
    setBoard(toggleFlag(board, r, c))
  }

  const onCellClick = (r, c) => {
    if (flagMode) handleFlag(r, c)
    else handleReveal(r, c)
  }

  const onContextMenu = (e, r, c) => {
    e.preventDefault()
    handleFlag(r, c)
  }

  // 모바일: 길게 누르면 깃발
  const onTouchStart = (r, c) => {
    longPressRef.current = setTimeout(() => {
      handleFlag(r, c)
      longPressRef.current = 'fired'
    }, 450)
  }
  const onTouchEnd = (e) => {
    if (longPressRef.current === 'fired') {
      e.preventDefault()
      longPressRef.current = null
      return
    }
    clearTimeout(longPressRef.current)
    longPressRef.current = null
  }

  const face = status === 'won' ? '😎' : status === 'lost' ? '😵' : '🙂'
  const remaining = cfg.mines - countFlags(board)

  return (
    <div className="board-wrap">
      <div className="hud">
        <div className="counter" title="남은 지뢰">💣 {String(remaining).padStart(3, '0')}</div>
        <button className="face" onClick={reset} aria-label="새 게임">{face}</button>
        <div className="counter" title="경과 시간">⏱ {String(Math.min(seconds, 999)).padStart(3, '0')}</div>
      </div>

      <div className="toolbar">
        <button
          className={`chip ${flagMode ? 'chip-on' : ''}`}
          onClick={() => setFlagMode((v) => !v)}
        >
          🚩 깃발 모드 {flagMode ? 'ON' : 'OFF'}
        </button>
        <span className="hint">좌클릭: 열기 · 우클릭(길게 누르기): 깃발 · 숫자 클릭: 주변 열기</span>
      </div>

      <div
        className={`grid ${status}`}
        style={{ gridTemplateColumns: `repeat(${cfg.cols}, var(--cell))` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {board.flat().map((cell) => {
          let content = ''
          let cls = 'cell'
          if (cell.revealed) {
            cls += ' open'
            if (cell.mine) {
              cls += ' mine'
              content = '💣'
            } else if (cell.adjacent > 0) {
              content = cell.adjacent
            }
          } else if (cell.flagged) {
            content = '🚩'
            if (status === 'lost' && !cell.mine) cls += ' wrong'
          }
          return (
            <button
              key={`${cell.r}-${cell.c}`}
              className={cls}
              style={cell.revealed && !cell.mine ? { color: NUMBER_COLORS[cell.adjacent] } : undefined}
              onClick={() => onCellClick(cell.r, cell.c)}
              onContextMenu={(e) => onContextMenu(e, cell.r, cell.c)}
              onTouchStart={() => onTouchStart(cell.r, cell.c)}
              onTouchEnd={onTouchEnd}
              onTouchMove={() => clearTimeout(longPressRef.current)}
              aria-label={`${cell.r + 1}행 ${cell.c + 1}열`}
            >
              {content}
            </button>
          )
        })}
      </div>

      {status === 'won' && <p className="result win">🎉 승리! {seconds}초 만에 클리어했습니다.</p>}
      {status === 'lost' && <p className="result lose">💥 지뢰를 밟았습니다. 다시 도전해 보세요!</p>}
    </div>
  )
}
