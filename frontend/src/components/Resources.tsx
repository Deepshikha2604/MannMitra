import React, { useMemo, useState } from 'react';
import './Resources.css';

type Resource = {
  id: string;
  title: string;
  type: 'article' | 'video' | 'worksheet' | 'service';
  tags: string[];
  url?: string;
  locale?: string;
};

const DATA: Resource[] = [
  { id: 'r1', title: 'Breathing Basics (5 min)', type: 'video', tags: ['anxiety','breathing'], url: 'https://example.com/breathe' },
  { id: 'r2', title: 'Grounding 5-4-3-2-1', type: 'worksheet', tags: ['stress','panic'] },
  { id: 'r3', title: 'Sleep Hygiene Guide', type: 'article', tags: ['sleep','habits'] },
  { id: 'r4', title: 'Local NGO: Free Counseling', type: 'service', tags: ['free','local','ngo'] },
  { id: 'r5', title: 'CBT Thought Record', type: 'worksheet', tags: ['cbt','thinking'] },
  { id: 'r6', title: 'Mindfulness Body Scan', type: 'video', tags: ['mindfulness'] }
];

function useSaved() {
  const [saved, setSaved] = useState<Record<string, boolean>>(() => {
    try { const raw = localStorage.getItem('mm_resources_saved'); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });
  const toggle = (id: string) => {
    setSaved(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem('mm_resources_saved', JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return { saved, toggle };
}

const Resources: React.FC = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | Resource['type']>('all');
  const { saved, toggle } = useSaved();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.filter(r => (type === 'all' || r.type === type))
      .filter(r => !q || r.title.toLowerCase().includes(q) || r.tags.join(' ').toLowerCase().includes(q));
  }, [query, type]);

  const savedList = useMemo(() => DATA.filter(r => saved[r.id]), [saved]);

  return (
    <div className="resources-page">
      <header className="resources-header">
        <h1>Resources</h1>
        <div className="controls">
          <input className="search" placeholder="Search topics or tags…" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select className="filter" value={type} onChange={(e)=>setType(e.target.value as any)}>
            <option value="all">All types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="worksheet">Worksheets</option>
            <option value="service">Local Services</option>
          </select>
        </div>
      </header>

      <div className="resources-layout">
        <section className="resources-list">
          {filtered.map(r => (
            <article key={r.id} className="resource-card">
              <div className="r-type">{r.type}</div>
              <h3>{r.title}</h3>
              <div className="r-tags">{r.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              <div className="r-actions">
                {r.url ? <a className="btn" href={r.url} target="_blank" rel="noreferrer">Open</a> : <span className="muted">No link</span>}
                <button className={`btn ${saved[r.id] ? 'saved' : ''}`} onClick={() => toggle(r.id)}>{saved[r.id] ? 'Saved' : 'Save'}</button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="muted">No resources match your filters.</div>}
        </section>

        <aside className="saved-panel">
          <h4>Saved</h4>
          {savedList.length === 0 && <div className="muted">Nothing saved yet.</div>}
          <ul>
            {savedList.map(r => <li key={r.id}>{r.title}</li>)}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Resources;
