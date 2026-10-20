import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

function Stars({ value, onChange }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'star on' : 'star'}
          onClick={onChange ? () => onChange(n) : undefined}
          aria-label={`${n}점`}
          disabled={!onChange}
        >
          ★
        </button>
      ))}
    </span>
  )
}

export default function Reviews({ playerName }) {
  const [reviews, setReviews] = useState([])
  const [name, setName] = useState(playerName || '')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (playerName) setName(playerName)
  }, [playerName])

  const load = async () => {
    if (!supabaseReady) return
    const { data, error: err } = await supabase
      .from('reviews')
      .select('id, author_name, rating, content, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    if (err) setError(err.message)
    else setReviews(data)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const author = name.trim()
    const text = content.trim()
    if (!author) return setError('이름을 입력해 주세요.')
    if (!text) return setError('리뷰 내용을 입력해 주세요.')
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase
      .from('reviews')
      .insert({ author_name: author.slice(0, 20), rating, content: text.slice(0, 500) })
    setSubmitting(false)
    if (err) return setError(err.message)
    setContent('')
    setRating(5)
    load()
  }

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>💬 게임 리뷰</h2>
        {avg && <span className="muted">평균 ★ {avg} ({reviews.length}개)</span>}
      </div>

      {!supabaseReady ? (
        <p className="muted">Supabase 환경변수가 설정되지 않아 리뷰 기능을 사용할 수 없습니다.</p>
      ) : (
        <form className="review-form" onSubmit={submit}>
          <div className="row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              maxLength={20}
            />
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게임은 어떠셨나요? (최대 500자)"
            maxLength={500}
            rows={3}
          />
          <div className="row end">
            <span className="muted">{content.length}/500</span>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? '등록 중…' : '리뷰 등록'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      <ul className="review-list">
        {reviews.map((r) => (
          <li key={r.id}>
            <div className="review-head">
              <strong>{r.author_name}</strong>
              <Stars value={r.rating} />
              <span className="date">{new Date(r.created_at).toLocaleString('ko-KR')}</span>
            </div>
            <p>{r.content}</p>
          </li>
        ))}
        {supabaseReady && reviews.length === 0 && <li className="muted">첫 리뷰를 남겨주세요!</li>}
      </ul>
    </section>
  )
}
