export interface Resume {
  id: string;
  href: string;
  title: string;
  experience: string;
  workPlaces: WorkPlace[];
  skills: string[]
}

export interface WorkPlace {
  company: string;
  description: string;
}