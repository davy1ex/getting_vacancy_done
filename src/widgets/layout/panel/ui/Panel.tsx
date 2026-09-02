import { useCallback, useState } from 'react';
import type { Resume } from '../../../../entities/resume';
import type { Vacancy } from '../../../../entities/vacancy';
import { fetchResumes } from '../../../../features/fetchResumes';
import { parseVacancy, isVacancyPage } from '../../../../features/parseVacancy';
import './Panel.css';

interface PanelProps {
  onClose: () => void;
}

export function Panel({ onClose }: PanelProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(false);
  const [vacancyLoading, setVacancyLoading] = useState(false);
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

  const handleScanVacancy = useCallback(() => {
    setError(null);
    if (!isVacancyPage()) {
      setError('Это не страница вакансии. Откройте вакансию на hh.ru');
      return;
    }
    setVacancyLoading(true);
    try {
      const parsed = parseVacancy(document);
      setVacancy(parsed);
      console.log('Parsed vacancy:', parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setVacancyLoading(false);
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
        <button className="panel__btn" onClick={handleScanVacancy} disabled={vacancyLoading}>
          {vacancyLoading ? 'Scanning...' : 'Просканировать вакансию'}
        </button>
        {error && <p className="panel__error">{error}</p>}
        {vacancy && (
          <article className="panel__vacancy">
            <h3 className="panel__resume-title">{vacancy.title}</h3>
            {vacancy.salary && <p className="panel__resume-exp">ЗП: {vacancy.salary}</p>}
            {vacancy.experience && <p className="panel__resume-exp">Опыт: {vacancy.experience}</p>}
            {vacancy.employment && <p className="panel__resume-exp">Занятость: {vacancy.employment}</p>}
            {vacancy.schedule && <p className="panel__resume-exp">График: {vacancy.schedule}</p>}
            {vacancy.workingHours && <p className="panel__resume-exp">Часы: {vacancy.workingHours}</p>}
            {vacancy.workFormat && <p className="panel__resume-exp">Формат: {vacancy.workFormat}</p>}
            {vacancy.description && (
              <details className="panel__vacancy-desc">
                <summary>Описание</summary>
                <p>{vacancy.description}</p>
              </details>
            )}
            {vacancy.skills.length > 0 && (
              <>
                <p className="panel__resume-exp">Скиллы:</p>
                <ul className="panel__worklist">
                  {vacancy.skills.map((skill) => (
                    <li key={skill} className="panel__work">
                      <strong>{skill}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        )}
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
