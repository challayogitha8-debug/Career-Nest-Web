export type ThemeMode = 'light' | 'dark' | 'system';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type JobType = 'Full-time' | 'Contract' | 'Part-time';
export type ExperienceLevel = '0-1 years' | '1-2 years' | '2-4 years' | '4+ years';
export type CareerStage = 'Freshers' | 'Early Career' | 'Mid Career';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  college: string;
  degree: string;
  graduationYear: string;
  skills: string;
  experience: string;
  resume: string;
}

export interface Company {
  name: string;
  logo: string;
  industry: string;
  size: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  experience: ExperienceLevel;
  salary: string;
  skills: string[];
  postedDate: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  companyInfo: Company;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: WorkMode;
  duration: string;
  stipend: string;
  skills: string[];
  postedDate: string;
  domain: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  companyInfo: Company;
}

export interface SavedItem {
  id: string;
  type: 'job' | 'internship';
}

export interface Application {
  id: string;
  opportunityId: string;
  type: 'job' | 'internship';
  title: string;
  company: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Rejected';
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export type OpportunityCategory = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

export interface Opportunity {
  id: string;
  type: 'job' | 'internship';
  title: string;
  company: string;
  location: string;
  meta: string;
  salary?: string;
  stipend?: string;
  skills: string[];
  postedDate: string;
}

export type OpportunityHubKind = 'competitions' | 'hackathons' | 'courses' | 'mentorship';

export interface ExploreOpportunity {
  id: string;
  title: string;
  organizer: string;
  category: string;
  description: string;
  about: string;
  skills: string[];
  mode?: string;
  eligibility?: string;
  deadline?: string;
  date?: string;
  duration?: string;
  location?: string;
  teamSize?: string;
  prize?: string;
  level?: string;
  format?: string;
  rating?: number;
  experience?: string;
  expertise?: string[];
  availability?: string;
  bio?: string;
  challenge?: string;
  rules?: string[];
  timeline?: string[];
  prizes?: string[];
  curriculum?: string[];
  outcomes?: string[];
  topics?: string[];
  testimonials?: string[];
}

export type ExploreOpportunityCatalog = Record<OpportunityHubKind, ExploreOpportunity[]>;
