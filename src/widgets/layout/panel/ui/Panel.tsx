import { useCallback, useState } from 'react';
import type { Resume } from '../../../../entities/resume';
import { fetchResumes } from '../../../../features/fetchResumes';
import './Panel.css';

interface PanelProps {
  onClose: () => void;
}

export function Panel({ onClose }: PanelProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchResumes();
      setResumes(list);
      console.log(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <aside className="panel">
      <header className="panel__header">
        <h2 className="panel__title">HH GVD</h2>
        <button className="panel__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      </header>
      <div className="panel__body">
        <button className="panel__btn" onClick={handleFetch} disabled={loading}>
          {loading ? 'Loading...' : 'Get all resumes'}
        </button>
        {error && <p className="panel__error">{error}</p>}
        {resumes.map((resume) => (
          <article key={resume.id} className="panel__resume">
            <h3 className="panel__resume-title">{resume.title || resume.id}</h3>
            {resume.experience && <p className="panel__resume-exp">Опыт: {resume.experience}</p>}
            {resume.workPlaces.length > 0 && (
              <ul className="panel__worklist">
                {resume.workPlaces.map((workPlace) => (
                  <li key={workPlace.company} className="panel__work">
                    <strong>{workPlace.company}</strong>
                    {workPlace.description && <p>{workPlace.description}</p>}
                  </li>
                ))}
              </ul>
            )}
            <a href={resume.href} target="_blank" rel="noreferrer" className="panel__link">
              Open
            </a>

            Skills:
            <ul className="panel__worklist">
                {resume.skills.map((skill) => (
                  <li key={skill} className="panel__work">
                    <strong>{skill}</strong>
                  </li>
                ))}
              </ul>
          </article>
        ))}
      </div>
    </aside>
  );
}
