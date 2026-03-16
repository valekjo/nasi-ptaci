import { useState } from 'preact/hooks';
import BirdSetManager from './BirdSetManager.tsx';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function QuizSetup() {
  const [mode, setMode] = useState<'image' | 'sound'>('image');
  const [count, setCount] = useState(10);
  const [showSets, setShowSets] = useState(false);

  const canStart = true;

  function start() {
    if (!canStart) return;
    window.location.href = `${BASE}/kviz/hra?mode=${mode}&count=${count}`;
  }

  return (
    <div class="quiz-setup">
      <h2>Poznáš ptáka?</h2>

      <div class="mode-cards">
        <div
          class={`mode-card ${mode === 'image' ? 'selected' : ''}`}
          onClick={() => setMode('image')}
        >
          📷<br />Poznej podle fotky
        </div>
        <div
          class={`mode-card ${mode === 'sound' ? 'selected' : ''}`}
          onClick={() => setMode('sound')}
        >
          🔊<br />Poznej podle hlasu
        </div>
      </div>

      <h3>Počet otázek</h3>
      <div class="count-selector">
        {[10, 20, 30].map(n => (
          <button
            class={`count-btn ${count === n ? 'selected' : ''}`}
            onClick={() => setCount(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div style={{ margin: '1rem 0' }}>
        <button
          class="count-btn"
          onClick={() => setShowSets(!showSets)}
        >
          {showSets ? 'Skrýt výběr ptáků' : 'Vlastní sada ptáků'}
        </button>
      </div>

      {showSets && <BirdSetManager />}

      <button class="start-btn" disabled={!canStart} onClick={start}>
        Začít kvíz
      </button>
    </div>
  );
}
