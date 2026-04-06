import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectFinderWizard, { ProjectAnswers } from '@/app/components/projects/ProjectFinderWizard';
import ProjectResultsPage from '@/app/components/projects/ProjectResultsPage';

export default function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const categoryParam = searchParams.get('category');

  const [showWizard, setShowWizard] = useState(!searchParam && !categoryParam);
  const [projectAnswers, setProjectAnswers] = useState<ProjectAnswers | null>(
    (searchParam || categoryParam) ? {
      projectType: searchParam || categoryParam || '',
      priceType: '',
      budget: '',
      timeline: '',
      experience: '',
      workPreference: '',
      skills: [],
      extraFilters: []
    } : null
  );

  const handleWizardComplete = (answers: ProjectAnswers) => {
    setProjectAnswers(answers);
    setShowWizard(false);
  };

  const handleWizardClose = () => {
    // If user closes wizard without completing, redirect to home
    window.location.href = '/';
  };

  if (showWizard) {
    return (
      <ProjectFinderWizard
        onClose={handleWizardClose}
        onComplete={handleWizardComplete}
      />
    );
  }

  if (projectAnswers) {
    return <ProjectResultsPage answers={projectAnswers} />;
  }

  return null;
}
