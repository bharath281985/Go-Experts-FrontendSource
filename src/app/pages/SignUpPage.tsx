import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationWizard from '@/app/components/onboarding/RegistrationWizard';

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <RegistrationWizard onClose={() => navigate('/')} />
  );
}
