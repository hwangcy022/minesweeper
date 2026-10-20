import { useEffect, useState } from 'react'
import Board from './components/Board'
import ScoreBoard from './components/ScoreBoard'
import Reviews from './components/Reviews'
import { DIFFICULTIES } from './lib/minesweeper'
import { supabase, supabaseReady } from './lib/supabase'

export default function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ms_player') || '')
  const [refreshKey, setRefreshKey] = useState(0)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    localStorage.setItem('ms_player', playerName)
  }, [playerName])

  const handleGameEnd = async ({ won, seconds }) => {
    if (!supabaseReady) {
      setSaveMsg('Supabase 미설정: 점수가 저장되지 않았습니다.')
      return
    }
    const name = playerName.trim() || '익명'
    const { error } = await supabase
      .from('scores')
      .insert({ player_name: name.slice(0, 20), difficulty, won, time_seconds: seconds })
    if (error) setSaveMsg(`점수 저장 실패: ${error.message}`)
    else {
      setSaveMsg(`${name}님의 ${won ? '승리' : '패배'} 기록(${seconds}초)이 저장되었습니다.`)
      setRefreshKey((k) => k + 1)
    }
    setTimeout(() => setSaveMsg(''), 4000)
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="student">2022022004 천문우주학과 황채연</div>
        <h1>💣 지뢰찾기</h1>
      </header>

      <main className="layout">
        <section className="game panel">
          <div className="controls">
            <label>
              플레이어 이름
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="익명"
                maxLength={20}
              />
            </label>
            <div className="seg">
              {Object.entries(DIFFICULTIES).map(([key, d]) => (
                <button
                  key={key}
                  className={difficulty === key ? 'on' : ''}
                  onClick={() => setDifficulty(key)}
                  title={`${d.rows}×${d.cols}, 지뢰 ${d.mines}개`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <Board difficulty={difficulty} onGameEnd={handleGameEnd} />
          {saveMsg && <p className="save-msg">{saveMsg}</p>}
        </section>

        <aside className="side">
          <ScoreBoard refreshKey={refreshKey} />
          <Reviews playerName={playerName} />
        </aside>
      </main>

      <footer className="site-footer">Supabase · Vercel · GitHub 로 만든 지뢰찾기</footer>
    </div>
  )
}
