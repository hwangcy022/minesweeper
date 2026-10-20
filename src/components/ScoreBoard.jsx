import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { DIFFICULTIES } from '../lib/minesweeper'

export default function ScoreBoard({ refreshKey }) {
  const [difficulty, setDifficulty] = useState('easy')
  const [best, setBest] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!supabaseReady) return
    setLoading(true)
    setError('')
    const [bestRes, recentRes] = await Promise.all([
      supabase
        .from('scores')
        .select('id, player_name, time_seconds, created_at')
        .eq('difficulty', difficulty)
        .eq('won', true)
        .order('time_seconds', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(10),
      supabase
        .from('scores')
        .select('id, player_name, difficulty, won, time_seconds, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ])
    if (bestRes.error || recentRes.error) {
      setError((bestRes.error || recentRes.error).message)
    } else {
      setBest(bestRes.data)
      setRecent(recentRes.data)
    }
    setLoading(false)
  }, [difficulty])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  if (!supabaseReady) {
    return (
      <section className="panel">
        <h2>🏆 순위표</h2>
        <p className="muted">Supabase 환경변수가 설정되지 않아 점수를 불러올 수 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>🏆 순위표</h2>
        <div className="seg">
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <button
              key={key}
              className={difficulty === key ? 'on' : ''}
              onClick={() => setDifficulty(key)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="error">불러오기 실패: {error}</p>}
      {loading && <p className="muted">불러오는 중…</p>}

      <h3>최고 기록 TOP 10 ({DIFFICULTIES[difficulty].label})</h3>
      {best.length === 0 && !loading ? (
        <p className="muted">아직 기록이 없습니다. 첫 승리의 주인공이 되어보세요!</p>
      ) : (
        <ol className="ranking">
          {best.map((s, i) => (
            <li key={s.id}>
              <span className="rank">{i + 1}</span>
              <span className="name">{s.player_name}</span>
              <span className="time">{s.time_seconds}초</span>
              <span className="date">{new Date(s.created_at).toLocaleDateString('ko-KR')}</span>
            </li>
          ))}
        </ol>
      )}

      <h3>최근 플레이</h3>
      <ul className="recent">
        {recent.map((s) => (
          <li key={s.id}>
            <span className={`badge ${s.won ? 'badge-win' : 'badge-lose'}`}>{s.won ? '승리' : '패배'}</span>
            <span className="name">{s.player_name}</span>
            <span className="muted">{DIFFICULTIES[s.difficulty]?.label}</span>
            <span className="time">{s.time_seconds}초</span>
          </li>
        ))}
        {recent.length === 0 && !loading && <li className="muted">기록 없음</li>}
      </ul>
    </section>
  )
}
