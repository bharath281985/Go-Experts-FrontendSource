import { useState } from 'react';
import ProjectFinderWizard, { ProjectAnswers } from '@/app/components/projects/ProjectFinderWizard';
import ProjectResultsPage from '@/app/components/projects/ProjectResultsPage';

export default function ProjectsPage() {
  const [showWizard, setShowWizard] = useState(true);
  const [projectAnswers, setProjectAnswers] = useState<ProjectAnswers | null>(null);

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
