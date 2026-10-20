export const DIFFICULTIES = {
  easy: { label: '초급', rows: 9, cols: 9, mines: 10 },
  medium: { label: '중급', rows: 16, cols: 16, mines: 40 },
  hard: { label: '고급', rows: 16, cols: 30, mines: 99 },
}

export function createEmptyBoard(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r,
      c,
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  )
}

function neighbors(board, r, c) {
  const out = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (board[nr] && board[nr][nc]) out.push(board[nr][nc])
    }
  }
  return out
}

// 첫 클릭 칸과 그 주변에는 지뢰를 두지 않는다.
export function placeMines(board, mines, safeR, safeC) {
  const rows = board.length
  const cols = board[0].length
  const safe = new Set([`${safeR},${safeC}`])
  neighbors(board, safeR, safeC).forEach((n) => safe.add(`${n.r},${n.c}`))

  const candidates = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safe.has(`${r},${c}`)) candidates.push([r, c])
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  candidates.slice(0, mines).forEach(([r, c]) => {
    next[r][c].mine = true
  })
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      next[r][c].adjacent = neighbors(next, r, c).filter((n) => n.mine).length
    }
  }
  return next
}

export function revealCell(board, r, c) {
  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  const stack = [[r, c]]
  while (stack.length) {
    const [cr, cc] = stack.pop()
    const cell = next[cr][cc]
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.adjacent === 0 && !cell.mine) {
      neighbors(next, cr, cc).forEach((n) => {
        if (!n.revealed && !n.flagged) stack.push([n.r, n.c])
      })
    }
  }
  return next
}

// 숫자 칸을 클릭했을 때, 주변 깃발 수가 숫자와 같으면 나머지를 한번에 연다 (chord).
export function chordCell(board, r, c) {
  const cell = board[r][c]
  if (!cell.revealed || cell.adjacent === 0) return board
  const ns = neighbors(board, r, c)
  const flags = ns.filter((n) => n.flagged).length
  if (flags !== cell.adjacent) return board
  let next = board
  ns.forEach((n) => {
    if (!n.revealed && !n.flagged) next = revealCell(next, n.r, n.c)
  })
  return next
}

export function toggleFlag(board, r, c) {
  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  const cell = next[r][c]
  if (!cell.revealed) cell.flagged = !cell.flagged
  return next
}

export function hitMine(board) {
  return board.some((row) => row.some((cell) => cell.revealed && cell.mine))
}

export function isWon(board, mines) {
  const total = board.length * board[0].length
  const revealed = board.flat().filter((cell) => cell.revealed).length
  return revealed === total - mines
}

export function revealAllMines(board) {
  return board.map((row) =>
    row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)),
  )
}

export function countFlags(board) {
  return board.flat().filter((cell) => cell.flagged).length
}
