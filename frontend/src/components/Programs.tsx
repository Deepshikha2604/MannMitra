import React, { useEffect, useMemo, useState } from 'react';
import './Programs.css';

type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  type: 'video' | 'reading' | 'exercise';
};

type Program = {
  id: string;
  name: string;
  description: string;
  weeks: number;
  goals: string[];
  tags: string[];
  lessons: Lesson[];
};

const PROGRAMS: Program[] = [
  {
    id: 'cbt-anxiety',
    name: 'CBT for Anxiety (2 weeks)',
    description: 'Core cognitive-behavioral tools to manage worry and rumination.',
    weeks: 2,
    goals: ['Reduce anxious thoughts', 'Build coping skills', 'Increase calm time'],
    tags: ['Anxiety', 'CBT', 'Beginner'],
    lessons: [
      { id: 'l1', title: 'Psychoeducation: Anxiety cycle', durationMin: 12, type: 'reading' },
      { id: 'l2', title: 'Breathing: 4-7-8 guided', durationMin: 5, type: 'video' },
      { id: 'l3', title: 'Thought record practice', durationMin: 10, type: 'exercise' },
      { id: 'l4', title: 'Exposure ladder basics', durationMin: 12, type: 'reading' }
    ]
  },
  {
    id: 'sleep-hygiene',
    name: 'Better Sleep (1 week)',
    description: 'Reset your sleep schedule with small, consistent habits.',
    weeks: 1,
    goals: ['Fall asleep faster', 'Reduce night awakenings'],
    tags: ['Sleep', 'Habits'],
    lessons: [
      { id: 's1', title: 'Sleep fundamentals', durationMin: 8, type: 'reading' },
      { id: 's2', title: 'Wind-down routine', durationMin: 10, type: 'exercise' },
      { id: 's3', title: 'Caffeine & light exposure', durationMin: 6, type: 'reading' }
    ]
  },
  {
    id: 'stress-act',
    name: 'ACT for Stress (2 weeks)',
    description: 'Acceptance and Commitment Therapy skills for daily stress.',
    weeks: 2,
    goals: ['Increase acceptance', 'Clarify values', 'Commit to actions'],
    tags: ['Stress', 'ACT'],
    lessons: [
      { id: 'a1', title: 'Noticing and naming', durationMin: 7, type: 'exercise' },
      { id: 'a2', title: 'Values card sort', durationMin: 12, type: 'exercise' },
      { id: 'a3', title: 'Tiny actions planner', durationMin: 10, type: 'reading' }
    ]
  }
];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

const Programs: React.FC = () => {
  const [query, setQuery] = useState('');
  const [enrolled, setEnrolled] = useLocalStorage<Record<string, boolean>>('mm_programs_enrolled', {});
  const [progress, setProgress] = useLocalStorage<Record<string, Record<string, boolean>>>('mm_programs_progress', {});
  const [activeProgramId, setActiveProgramId] = useLocalStorage<string | null>('mm_programs_active', null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROGRAMS;
    return PROGRAMS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.join(' ').toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleEnroll = (id: string) => {
    setEnrolled(prev => ({ ...prev, [id]: !prev[id] }));
    if (!enrolled[id]) {
      setActiveProgramId(id);
    }
  };

  const toggleLesson = (programId: string, lessonId: string) => {
    setProgress(prev => ({
      ...prev,
      [programId]: { ...prev[programId], [lessonId]: !prev[programId]?.[lessonId] }
    }));
  };

  const getCompletion = (p: Program) => {
    const prog = progress[p.id] || {};
    const done = p.lessons.filter(l => prog[l.id]).length;
    return Math.round((done / p.lessons.length) * 100);
  };

  const active = PROGRAMS.find(p => p.id === activeProgramId) || filtered[0] || PROGRAMS[0];

  return (
    <div className="programs-page">
      <header className="programs-header">
        <h1>Programs</h1>
        <input
          className="programs-search"
          placeholder="Search programs or tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <div className="programs-layout">
        <aside className="programs-list">
          {filtered.map(p => (
            <button
              key={p.id}
              className={`program-item ${active?.id === p.id ? 'active' : ''}`}
              onClick={() => setActiveProgramId(p.id)}
            >
              <div className="program-name">{p.name}</div>
              <div className="program-tags">{p.tags.join(' • ')}</div>
              <div className="program-progress">
                <div className="bar"><span style={{ width: `${getCompletion(p)}%` }} /></div>
                <span className="pct">{getCompletion(p)}%</span>
              </div>
            </button>
          ))}
        </aside>

        {active && (
          <section className="program-detail">
            <div className="program-head">
              <h2>{active.name}</h2>
              <button className={`enroll-btn ${enrolled[active.id] ? 'enrolled' : ''}`} onClick={() => toggleEnroll(active.id)}>
                {enrolled[active.id] ? 'Enrolled' : 'Enroll'}
              </button>
            </div>
            <p className="program-desc">{active.description}</p>
            <ul className="program-goals">
              {active.goals.map((g, i) => <li key={i}>✓ {g}</li>)}
            </ul>

            <h3>Lessons</h3>
            <ul className="lessons">
              {active.lessons.map(lesson => (
                <li key={lesson.id} className={`lesson ${progress[active.id]?.[lesson.id] ? 'done' : ''}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!progress[active.id]?.[lesson.id]}
                      onChange={() => toggleLesson(active.id, lesson.id)}
                    />
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-meta">• {lesson.type} • {lesson.durationMin} min</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default Programs;
