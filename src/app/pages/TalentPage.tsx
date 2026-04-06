import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TalentFinderWizard, { QuestionaryAnswers } from '@/app/components/talent/TalentFinderWizard';
import TalentResultsPage from '@/app/components/talent/TalentResultsPage';

export default function TalentPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const categoryParam = searchParams.get('category');

  const [showWizard, setShowWizard] = useState(!searchParam && !categoryParam);
  const [questionaryAnswers, setQuestionaryAnswers] = useState<QuestionaryAnswers | null>(
    (searchParam || categoryParam) ? {
      role: categoryParam || '',
      workType: '',
      budget: '',
      experience: '',
      location: '',
      availability: '',
      skills: [],
      preferences: [],
      searchTerm: searchParam || ''
    } : null
  );

  const handleWizardComplete = (answers: QuestionaryAnswers) => {
    setQuestionaryAnswers(answers);
    setShowWizard(false);
  };

  const handleWizardClose = () => {
    window.location.href = '/';
  };

  if (showWizard) {
    return (
      <TalentFinderWizard
        onClose={handleWizardClose}
        onComplete={handleWizardComplete}
      />
    );
  }

  if (questionaryAnswers) {
    return <TalentResultsPage answers={questionaryAnswers} />;
  }

  return null;
}
