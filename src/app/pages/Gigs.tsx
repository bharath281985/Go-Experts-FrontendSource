import { useState } from 'react';
import GigFinderWizard, { GigPreferences } from '@/app/components/gigs/GigFinderWizard';
import GigResultsPage from '@/app/components/gigs/GigResultsPage';

export default function Gigs() {
  const [showWizard, setShowWizard] = useState(true);
  const [preferences, setPreferences] = useState<GigPreferences | null>(null);

  const handleWizardComplete = (prefs: GigPreferences) => {
    setPreferences(prefs);
    setShowWizard(false);
  };

  const handleReset = () => {
    setPreferences(null);
    setShowWizard(true);
  };

  if (showWizard) {
    return <GigFinderWizard onClose={handleReset} onComplete={handleWizardComplete} />;
  }

  if (preferences) {
    return <GigResultsPage preferences={preferences} onReset={handleReset} />;
  }

  return null;
}
