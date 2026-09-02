export interface SkillComparison {
  matched: string[];
  missing: string[];
  score: number;
}

export function compareSkills(resumeSkills: string[], vacancySkills: string[]): SkillComparison {
  const uniqueVacancy = [...new Set(vacancySkills)];
  const resumeSet = new Set(resumeSkills);

  const matched = uniqueVacancy.filter((s) => resumeSet.has(s));
  const missing = uniqueVacancy.filter((s) => !resumeSet.has(s));
  const score = uniqueVacancy.length === 0 ? 0 : Math.round((matched.length / uniqueVacancy.length) * 100);

  return { matched, missing, score };
}
