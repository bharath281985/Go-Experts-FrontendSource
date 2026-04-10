import { useSearchParams } from 'react-router-dom';
import TalentResultsPage from '@/app/components/talent/TalentResultsPage';

export default function TalentPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const categoryParam = searchParams.get('category');

  // Immediately load the results list with any parsed initial filters, 
  // explicitly skipping the previous wizard interaction flow based on your request.
  const initialAnswers = {
    role: categoryParam || '',
    workType: '',
    budget: '',
    experience: '',
    location: '',
    availability: '',
    skills: [],
    preferences: [],
    searchTerm: searchParam || ''
  };

  return <TalentResultsPage answers={initialAnswers} />;
}
