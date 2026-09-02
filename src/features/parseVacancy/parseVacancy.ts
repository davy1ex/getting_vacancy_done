import type { Vacancy } from "../../entities/vacancy"

const TITLE_SELECTOR = '[data-qa="vacancy-title"]';
const SALARY_SELECTOR = '[data-qa="vacancy-salary-compensation-type-net"]';
const EXPERIENCE_SELECTOR = '[data-qa="vacancy-experience"]';
const EMPLOYMENT_SELECTOR = '[data-qa="common-employment-text"]';
const SCHEDULE_SELECTOR = '[data-qa="work-schedule-by-days-text"]';
const WORKING_HOURS_SELECTOR = '[data-qa="working-hours-text"]';
const WORK_FORMAT_SELECTOR = '[data-qa="work-formats-text"]';
const DESCRIPTION_SELECTOR = '.vacancy-description';
const SKILLS_SELECTOR = '[class^="vacancy-skill-list-"] div';

const VACANCY_URL_PATTERN = /\/vacancy\/\d+/;

const clean = (text: string): string => text.replace(/\s+/g, ' ').trim();

export function isVacancyPage(): boolean {
  return VACANCY_URL_PATTERN.test(window.location.href);
}

export function parseVacancy(doc: Document): Vacancy {
  return {
    title: parseTitle(doc),
    salary: extractText(doc, SALARY_SELECTOR),
    experience: extractText(doc, EXPERIENCE_SELECTOR),
    employment: extractText(doc, EMPLOYMENT_SELECTOR),
    schedule: extractText(doc, SCHEDULE_SELECTOR),
    workingHours: extractText(doc, WORKING_HOURS_SELECTOR),
    workFormat: extractText(doc, WORK_FORMAT_SELECTOR),
    description: extractText(doc, DESCRIPTION_SELECTOR) ?? '',
    skills: parseSkills(doc),
  };
}

function parseTitle(doc: Document): string {
  return clean(doc.querySelector<HTMLElement>(TITLE_SELECTOR)?.textContent ?? '');
}

function extractText(doc: Document, selector: string): string | null {
  const el = doc.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const text = clean(el.textContent ?? '');
  return text || null;
}

function parseSkills(doc: Document): string[] {
  const skills = Array.from(doc.querySelectorAll<HTMLElement>(SKILLS_SELECTOR));
  return skills.map((skill) => clean(skill.textContent)).filter(Boolean);
}
