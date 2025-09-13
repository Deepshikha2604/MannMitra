import React, { useEffect, useMemo, useState } from 'react';
import './Assessments.css';

type Question = { id: string; text: string };

type AssessmentDef = {
  id: 'phq9' | 'gad7';
  title: string;
  questions: Question[];
  scaleLabels: string[]; // 0..3
  interpret: (score: number) => string;
};

const PHQ9: AssessmentDef = {
  id: 'phq9',
  title: 'PHQ-9 (Depression)',
  questions: [
    { id: 'q1', text: 'Little interest or pleasure in doing things' },
    { id: 'q2', text: 'Feeling down, depressed, or hopeless' },
    { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much' },
    { id: 'q4', text: 'Feeling tired or having little energy' },
    { id: 'q5', text: 'Poor appetite or overeating' },
    { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
    { id: 'q7', text: 'Trouble concentrating on things, such as reading or watching television' },
    { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless' },
    { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself' }
  ],
  scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  interpret: (s) => s < 5 ? 'Minimal' : s < 10 ? 'Mild' : s < 15 ? 'Moderate' : s < 20 ? 'Moderately severe' : 'Severe'
};

const GAD7: AssessmentDef = {
  id: 'gad7',
  title: 'GAD-7 (Anxiety)',
  questions: [
    { id: 'q1', text: 'Feeling nervous, anxious, or on edge' },
    { id: 'q2', text: 'Not being able to stop or control worrying' },
    { id: 'q3', text: 'Worrying too much about different things' },
    { id: 'q4', text: 'Trouble relaxing' },
    { id: 'q5', text: 'Being so restless that it is hard to sit still' },
    { id: 'q6', text: 'Becoming easily annoyed or irritable' },
    { id: 'q7', text: 'Feeling afraid, as if something awful might happen' }
  ],
  scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  interpret: (s) => s < 5 ? 'Minimal' : s < 10 ? 'Mild' : s < 15 ? 'Moderate' : 'Severe'
};

function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV] as const;
}

const Assessments: React.FC = () => {
  const defs = useMemo(() => [PHQ9, GAD7], []);
  const [activeId, setActiveId] = useLocal<'phq9' | 'gad7'>('mm_assess_active', 'phq9');
  const [answers, setAnswers] = useLocal<Record<string, number>>('mm_assess_answers_' + activeId, {});
  const [history, setHistory] = useLocal<Array<{ id: string; date: string; score: number }>>('mm_assess_history_' + activeId, []);

  const active = defs.find(d => d.id === activeId)!;

  useEffect(() => {
    // ensure answers/histories persist per tool
    // switch storage keys when activeId changes
    // noop here; keys in hooks include activeId
  }, [activeId]);

  const score = useMemo(() => active.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0), [answers, active]);
  const interpretation = active.interpret(score);
  const completion = Math.round(100 * (Object.keys(answers).length / active.questions.length));

  const setAnswer = (qid: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const submit = () => {
    if (Object.keys(answers).length !== active.questions.length) return;
    setHistory(prev => ([{ id: crypto.randomUUID?.() || String(Date.now()), date: new Date().toISOString(), score }, ...prev].slice(0, 20)));
    // reset for next run
    setAnswers({});
  };

  return (
    <div className="assess-page">
      <aside className="assess-sidebar">
        {defs.map(d => (
          <button key={d.id} className={`assess-tab ${activeId === d.id ? 'active' : ''}`} onClick={() => setActiveId(d.id)}>
            {d.title}
          </button>
        ))}

        <div className="assess-history">
          <h4>History</h4>
          {history.length === 0 && <div className="muted">No attempts yet.</div>}
          {history.map(h => (
            <div key={h.id} className="history-item">
              <div>{new Date(h.date).toLocaleString()}</div>
              <div className="score">Score: {h.score}</div>
            </div>
          ))}
        </div>
      </aside>

      <section className="assess-main">
        <header className="assess-head">
          <h1>{active.title}</h1>
          <div className="assess-meta">
            <div>Completion: {completion}%</div>
            <div>Score: {score} — <strong>{interpretation}</strong></div>
          </div>
        </header>

        <ol className="assess-questions">
          {active.questions.map(q => (
            <li key={q.id} className="assess-q">
              <div className="q-text">{q.text}</div>
              <div className="q-options">
                {[0,1,2,3].map(v => (
                  <label key={v} className={`opt ${answers[q.id] === v ? 'sel' : ''}`}>
                    <input type="radio" name={q.id} value={v} checked={answers[q.id] === v} onChange={() => setAnswer(q.id, v)} />
                    <span>{active.scaleLabels[v]}</span>
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <div className="assess-actions">
          <button className="btn" disabled={Object.keys(answers).length !== active.questions.length} onClick={submit}>Submit & Save</button>
        </div>
        <div className="assess-note">Results are informational only and not a diagnosis.</div>
      </section>
    </div>
  );
};

export default Assessments;
