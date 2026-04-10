import { useSearchParams } from 'react-router-dom';
import ProjectResultsPage from '@/app/components/projects/ProjectResultsPage';
import type { ProjectAnswers } from '@/app/components/projects/ProjectFinderWizard';

export default function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const categoryParam = searchParams.get('category');

  const projectAnswers: ProjectAnswers = {
    projectType: searchParam || categoryParam || '',
    priceType: '',
    budget: '',
    timeline: '',
    experience: '',
    workPreference: '',
    skills: [],
    extraFilters: []
  };

  return <ProjectResultsPage answers={projectAnswers} />;
}
