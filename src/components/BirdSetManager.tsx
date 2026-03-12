import { useState, useEffect } from 'preact/hooks';
// @ts-ignore
import allBirds from '../data/birds.json';

const STORAGE_KEY = 'nasiptaci-bird-set';

interface Bird {
  slug: string;
  czechName: string;
  latinName: string;
  image: string | null;
  sound: string | null;
}

export default function BirdSetManager() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [useAll, setUseAll] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const slugs = JSON.parse(stored) as string[];
        setSelected(new Set(slugs));
        setUseAll(false);
      } catch {}
    }
  }, []);

  function save(newSet: Set<string>, all: boolean) {
    if (all) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newSet]));
    }
  }

  function toggle(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
    setUseAll(false);
    save(next, false);
  }

  function selectAll() {
    const all = new Set((allBirds as Bird[]).map(b => b.slug));
    setSelected(all);
    setUseAll(false);
    save(all, false);
  }

  function deselectAll() {
    setSelected(new Set());
    setUseAll(false);
    save(new Set(), false);
  }

  function resetToAll() {
    setUseAll(true);
    setSelected(new Set());
    save(new Set(), true);
  }

  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const birds = allBirds as Bird[];
  const q = norm(filter);
  const filtered = q
    ? birds.filter(b => norm(b.czechName).includes(q) || norm(b.latinName).includes(q))
    : birds;

  return (
    <div class="bird-set-manager">
      <div class="controls">
        <button onClick={resetToAll} style={useAll ? { fontWeight: 'bold' } : {}}>
          Všichni ptáci
        </button>
        <button onClick={selectAll}>Vybrat vše</button>
        <button onClick={deselectAll}>Zrušit vše</button>
        <span style={{ fontSize: '0.85rem', color: '#8b7355' }}>
          {useAll ? 'Používá se celý atlas' : `Vybráno: ${selected.size}`}
        </span>
      </div>
      <input
        type="text"
        placeholder="Filtrovat..."
        value={filter}
        onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.3rem 0.5rem', fontFamily: 'Annie Use Your Telescope, cursive', border: '1px solid #8b7355', borderRadius: '3px' }}
      />
      <div class="bird-set-list">
        {filtered.map(b => (
          <label key={b.slug}>
            <input
              type="checkbox"
              checked={useAll || selected.has(b.slug)}
              onChange={() => toggle(b.slug)}
              disabled={useAll}
            />
            {b.czechName} <em style={{ color: '#8b7355', fontSize: '0.85rem' }}>({b.latinName})</em>
          </label>
        ))}
      </div>
    </div>
  );
}
