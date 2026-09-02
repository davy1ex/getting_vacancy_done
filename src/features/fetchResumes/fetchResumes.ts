import type { Resume } from '../../entities/resume';
import { parseResume, parseResumeLinks } from '../../features/parseResumes';

export type { Resume };

const RESUMES_URL = 'https://hh.ru/applicant/my_resumes';

export async function fetchResumes(fetchImpl: typeof fetch = fetch): Promise<Resume[]> {
  const list = await fetchResumeLinks(fetchImpl);

  const resumes = await Promise.all(
    list.map((item) => fetchResume(item.id, item.href, fetchImpl)),
  );

  return resumes;
}

async function fetchResumeLinks(fetchImpl: typeof fetch): Promise<{ id: string; href: string }[]> {
  const res = await fetchImpl(RESUMES_URL, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch resume list: HTTP ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return parseResumeLinks(doc);
}

async function fetchResume(
  id: string,
  href: string,
  fetchImpl: typeof fetch,
): Promise<Resume> {
  const url = href.startsWith('http') ? href : `https://hh.ru${href}`;
  const res = await fetchImpl(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch resume ${id}: HTTP ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return parseResume(id, href, doc);
}
