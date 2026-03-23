import { useState } from 'react';
import TalentFinderWizard, { QuestionaryAnswers } from '@/app/components/talent/TalentFinderWizard';
import TalentResultsPage from '@/app/components/talent/TalentResultsPage';

export default function TalentPage() {
  const [showWizard, setShowWizard] = useState(true);
  const [questionaryAnswers, setQuestionaryAnswers] = useState<QuestionaryAnswers | null>(null);

  const handleWizardComplete = (answers: QuestionaryAnswers) => {
    setQuestionaryAnswers(answers);
    setShowWizard(false);
  };

  const handleWizardClose = () => {
    // If user closes wizard without completing, redirect to home or show a message
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
