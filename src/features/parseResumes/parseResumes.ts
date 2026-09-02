import type { Resume } from "../../entities/resume"

const CARD_LINK_SELECTOR = '[data-qa^="resume-card-link-"]';
const TITLE_SELECTOR = '[data-qa="resume-block-title-position"]';
const TITLE_CONTAINER_SELECTOR = '[data-qa="title-container"]';
const EXPERIENCE_CONTAINER_SELECTOR = '[data-qa="resume-list-card-experience"]';
const EXPERIENCE_TITLE_SELECTOR = '[data-qa="title-container"]';
const COMPANY_CARD_SELECTOR = '[data-qa="profile-experience-company-card"]';
const COMPANY_NAME_SELECTOR = '[data-qa="cell-text-content"]';
const DESCRIPTION_SELECTOR = 'div[class*="magritte-text_max-lines"]';
const SKILLS_SELECTOR = 'div[class*=magritte-tag__label__]'

const clean = (text: string): string => text.replace(/\s+/g, ' ').trim();

export function parseResume(id: string, href: string, doc: Document): Resume {
  const title = parseTitle(doc);
  const experience = parseExperience(doc);
  const skills = parseSkills(doc);

  const workPlaces = Array.from(doc.querySelectorAll<HTMLElement>(COMPANY_CARD_SELECTOR)).map(
    (card) => ({
      company: clean(card.querySelector(COMPANY_NAME_SELECTOR)?.textContent ?? ''),
      description: clean(card.querySelector(DESCRIPTION_SELECTOR)?.textContent ?? ''),
    }),
  );

  return { id, href, title, experience, workPlaces, skills };
}

function parseTitle(doc: Document): string {
  const exact = doc.querySelector<HTMLElement>(TITLE_SELECTOR)?.textContent;
  if (exact) return clean(exact);

  const container = doc.querySelector<HTMLElement>(TITLE_CONTAINER_SELECTOR);
  if (!container) return '';

  for (const node of container.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      return clean(node.textContent);
    }
  }
  return clean(container.textContent ?? '');
}

function parseExperience(doc: Document): string {
  const container = doc.querySelector<HTMLElement>(EXPERIENCE_CONTAINER_SELECTOR);
  const titleEl = container?.querySelector<HTMLElement>(EXPERIENCE_TITLE_SELECTOR);
  const text = titleEl?.querySelector('h4')?.textContent ?? '';
  return clean(text);
}

export function parseResumeLinks(doc: Document): { id: string; href: string }[] {
  const links = Array.from(doc.querySelectorAll<HTMLElement>(CARD_LINK_SELECTOR));

  return links
    .map((el) => {
      const href = el.getAttribute('href');
      if (!href) return null;
      const id = href.split('/resume/')[1]?.split('?')[0] ?? '';
      return { id, href };
    })
    .filter((r): r is { id: string; href: string } => r !== null);
}

function parseSkills(doc: Document): string[] {
  const skills = Array.from(doc.querySelectorAll<HTMLElement>(SKILLS_SELECTOR))

   return skills.map((skill) => (
    clean(skill.textContent)
   ))
}