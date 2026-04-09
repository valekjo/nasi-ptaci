import { useState, useEffect } from 'preact/hooks';
import {
  predefinedCollections,
  ACTIVE_COLLECTION_KEY,
  CUSTOM_COLLECTIONS_KEY,
  type ActiveCollection,
  type CustomCollection,
} from '../data/collections';
import BirdSetManager from './BirdSetManager.tsx';

const BIRD_SET_KEY = 'nasiptaci-bird-set';

export default function CollectionPicker() {
  const [active, setActive] = useState<ActiveCollection>({ type: 'all' });
  const [customCollections, setCustomCollections] = useState<CustomCollection[]>([]);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_COLLECTION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveCollection;
        setActive(parsed);
        if (parsed.type === 'manual') setShowManual(true);
      }
    } catch {}
    try {
      const stored = localStorage.getItem(CUSTOM_COLLECTIONS_KEY);
      if (stored) setCustomCollections(JSON.parse(stored) as CustomCollection[]);
    } catch {}
  }, []);

  function selectAll() {
    localStorage.removeItem(BIRD_SET_KEY);
    const ac: ActiveCollection = { type: 'all' };
    localStorage.setItem(ACTIVE_COLLECTION_KEY, JSON.stringify(ac));
    setActive(ac);
    setShowManual(false);
  }

  function selectPredefined(id: string) {
    const col = predefinedCollections.find(c => c.id === id);
    if (!col) return;
    localStorage.setItem(BIRD_SET_KEY, JSON.stringify(col.slugs));
    const ac: ActiveCollection = { type: 'predefined', id };
    localStorage.setItem(ACTIVE_COLLECTION_KEY, JSON.stringify(ac));
    setActive(ac);
    setShowManual(false);
  }

  function selectCustom(id: string) {
    const col = customCollections.find(c => c.id === id);
    if (!col) return;
    localStorage.setItem(BIRD_SET_KEY, JSON.stringify(col.slugs));
    const ac: ActiveCollection = { type: 'custom', id };
    localStorage.setItem(ACTIVE_COLLECTION_KEY, JSON.stringify(ac));
    setActive(ac);
    setShowManual(false);
  }

  function selectManual() {
    const ac: ActiveCollection = { type: 'manual' };
    localStorage.setItem(ACTIVE_COLLECTION_KEY, JSON.stringify(ac));
    setActive(ac);
    setShowManual(true);
  }

  function deleteCustom(id: string) {
    const next = customCollections.filter(c => c.id !== id);
    setCustomCollections(next);
    localStorage.setItem(CUSTOM_COLLECTIONS_KEY, JSON.stringify(next));
    if (active.type === 'custom' && active.id === id) {
      selectAll();
    }
  }

  function handleSaveAndSelect(slugs: string[]) {
    const name = prompt('Název kolekce:');
    if (!name || !name.trim()) return;
    const col: CustomCollection = {
      id: Date.now().toString(36),
      name: name.trim(),
      slugs,
    };
    const next = [...customCollections, col];
    setCustomCollections(next);
    localStorage.setItem(CUSTOM_COLLECTIONS_KEY, JSON.stringify(next));
    localStorage.setItem(BIRD_SET_KEY, JSON.stringify(col.slugs));
    const ac: ActiveCollection = { type: 'custom', id: col.id };
    localStorage.setItem(ACTIVE_COLLECTION_KEY, JSON.stringify(ac));
    setActive(ac);
    setShowManual(false);
  }

  const isActive = (type: ActiveCollection['type'], id?: string) => {
    if (active.type !== type) return false;
    if (id && 'id' in active) return active.id === id;
    return true;
  };

  return (
    <div class="collection-picker">
      <h3>Sada ptáků</h3>

      <div class="collection-grid">
        <div
          class={`collection-card ${isActive('all') ? 'selected' : ''}`}
          onClick={selectAll}
        >
          <span class="collection-icon">🌍</span>
          <span class="collection-name">Všichni ptáci</span>
          <span class="collection-desc">Celý atlas (184 ptáků)</span>
        </div>

        {predefinedCollections.map(col => (
          <div
            key={col.id}
            class={`collection-card ${isActive('predefined', col.id) ? 'selected' : ''}`}
            onClick={() => selectPredefined(col.id)}
          >
            <span class="collection-icon">{col.icon}</span>
            <span class="collection-name">{col.name}</span>
            <span class="collection-desc">{col.description} ({col.slugs.length})</span>
          </div>
        ))}
      </div>

      {customCollections.length > 0 && (
        <div class="custom-collections">
          <h4>Moje kolekce</h4>
          <div class="collection-grid">
            {customCollections.map(col => (
              <div
                key={col.id}
                class={`collection-card ${isActive('custom', col.id) ? 'selected' : ''}`}
                onClick={() => selectCustom(col.id)}
              >
                <span class="collection-icon">📋</span>
                <span class="collection-name">{col.name}</span>
                <span class="collection-desc">{col.slugs.length} ptáků</span>
                <button
                  class="delete-collection"
                  onClick={(e) => { e.stopPropagation(); deleteCustom(col.id); }}
                  title="Smazat kolekci"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button
          class={`count-btn ${isActive('manual') ? 'selected' : ''}`}
          onClick={() => showManual ? setShowManual(false) : selectManual()}
        >
          {showManual ? 'Skrýt vlastní výběr' : 'Vlastní výběr'}
        </button>
      </div>

      {showManual && (
        <BirdSetManager onSave={handleSaveAndSelect} />
      )}
    </div>
  );
}
