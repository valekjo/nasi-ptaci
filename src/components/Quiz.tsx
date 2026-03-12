import { useState, useEffect, useRef } from 'preact/hooks';

interface Bird {
  slug: string;
  czechName: string;
  latinName: string;
  image: string | null;
  sound: string | null;
}

interface Question {
  correct: Bird;
  options: Bird[];
}

interface Props {
  birds: Bird[];
}

const STORAGE_KEY = 'nasiptaci-bird-set';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(birds: Bird[], mode: string, count: number): Question[] {
  // Filter to birds that have the required media
  const eligible = birds.filter(b => mode === 'image' ? b.image : b.sound);
  // Also need at least 4 for distractors
  if (eligible.length < 4) return [];

  const selected = shuffle(eligible).slice(0, count);
  return selected.map(correct => {
    const distractors = shuffle(eligible.filter(b => b.slug !== correct.slug)).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    return { correct, options };
  });
}

export default function Quiz({ birds }: Props) {
  const [mode, setMode] = useState<string>('image');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [results, setResults] = useState<{ correct: Bird; chosen: Bird; ok: boolean }[]>([]);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode') || 'image';
    const count = parseInt(params.get('count') || '10', 10);
    setMode(m);

    // Check for custom bird set
    let pool = birds;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const slugs = new Set(JSON.parse(stored) as string[]);
        if (slugs.size > 0) {
          pool = birds.filter(b => slugs.has(b.slug));
        }
      } catch {}
    }

    setQuestions(generateQuestions(pool, m, count));
  }, []);

  function answer(bird: Bird) {
    if (answered) return;
    const q = questions[current];
    const ok = bird.slug === q.correct.slug;
    setAnswered(bird.slug);
    setResults(prev => [...prev, { correct: q.correct, chosen: bird, ok }]);

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setPhase('done');
      } else {
        setCurrent(prev => prev + 1);
        setAnswered(null);
      }
    }, 1200);
  }

  function playSound(src: string) {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(src);
    audioRef.current.play();
  }

  if (questions.length === 0) {
    return (
      <div class="quiz-game">
        <h2>Kvíz</h2>
        <p>Načítání...</p>
      </div>
    );
  }

  if (phase === 'done') {
    const score = results.filter(r => r.ok).length;
    return (
      <div class="quiz-results">
        <h2>Výsledky</h2>
        <div class="quiz-score">{score} / {results.length}</div>
        <ul class="quiz-review">
          {results.map((r, i) => (
            <li key={i}>
              <span class={`mark ${r.ok ? 'ok' : 'fail'}`}>{r.ok ? '✓' : '✗'}</span>
              {r.correct.image && <img src={r.correct.image} alt={r.correct.czechName} />}
              <span>
                {r.correct.czechName}
                {!r.ok && <span style={{ color: 'var(--wrong)' }}> (vaše odpověď: {r.chosen.czechName})</span>}
              </span>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/kviz/" class="start-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>Nový kvíz</a>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div class="quiz-game">
      <div class="quiz-progress">
        Otázka {current + 1} / {questions.length}
      </div>

      {mode === 'image' && q.correct.image && (
        <img class="quiz-question-img" src={q.correct.image} alt="Který je to pták?" />
      )}

      {mode === 'sound' && q.correct.sound && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            class="start-btn"
            onClick={() => playSound(q.correct.sound!)}
            style={{ fontSize: '1.3rem', padding: '0.5rem 2rem' }}
          >
            ▶ Přehrát hlas
          </button>
        </div>
      )}

      <div class="quiz-options">
        {q.options.map(bird => {
          let cls = 'quiz-option';
          if (answered) {
            cls += ' answered';
            if (bird.slug === q.correct.slug) cls += ' correct';
            else if (bird.slug === answered) cls += ' wrong';
          }

          if (mode === 'sound') {
            return (
              <div key={bird.slug} class={cls} onClick={() => answer(bird)}>
                {bird.image && <img src={bird.image} alt={bird.czechName} />}
                {bird.czechName}
              </div>
            );
          }

          return (
            <div key={bird.slug} class={cls} onClick={() => answer(bird)}>
              {bird.czechName}
            </div>
          );
        })}
      </div>
    </div>
  );
}
