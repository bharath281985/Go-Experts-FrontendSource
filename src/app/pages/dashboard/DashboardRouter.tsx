import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PremiumDashboardLayout from '@/app/components/dashboard/PremiumDashboardLayout';
import RoleSwitcher from '@/app/components/dashboard/RoleSwitcher';
import QuickActionMenu from '@/app/components/dashboard/QuickActionMenu';

// Client Pages
import ClientDashboardHome from '@/app/pages/dashboard/client/ClientDashboardHome';
import ExploreProjects from '@/app/pages/dashboard/client/ExploreProjects';
import CreateProject from '@/app/pages/dashboard/client/CreateProject';
import FindTalent from '@/app/pages/dashboard/client/FindTalent';

// Freelancer Pages
import FreelancerDashboardHome from '@/app/pages/dashboard/freelancer/FreelancerDashboardHome';
import FindClients from '@/app/pages/dashboard/freelancer/FindClients';
import MyGigs from '@/app/pages/dashboard/freelancer/MyGigs';
import WalletWithdraw from '@/app/pages/dashboard/freelancer/WalletWithdraw';

// Shared Pages
import MyProjects from '@/app/pages/dashboard/shared/MyProjects';
import GigOrders from '@/app/pages/dashboard/shared/GigOrders';
import FindGigs from '@/app/pages/dashboard/shared/FindGigs';
import StartupIdeas from '@/app/pages/dashboard/shared/StartupIdeas';
import Disputes from '@/app/pages/dashboard/shared/Disputes';
import Invoices from '@/app/pages/dashboard/shared/Invoices';
import SavedItems from '@/app/pages/dashboard/shared/SavedItems';
import Messages from '@/app/pages/dashboard/shared/Messages';
import AccountBalance from '@/app/pages/dashboard/shared/AccountBalance';
import SubscriptionCredits from '@/app/pages/dashboard/shared/SubscriptionCredits';
import Settings from '@/app/pages/dashboard/shared/Settings';
import ProjectDetails from '@/app/pages/ProjectDetails';
import GigDetails from '@/app/pages/GigDetails';
import TalentProfile from '@/app/pages/TalentProfile';
import CreateGig from '@/app/pages/dashboard/freelancer/CreateGig';
import EditGig from '@/app/pages/dashboard/freelancer/EditGig';

export default function DashboardRouter() {
  const [userType, setUserType] = useState<'client' | 'freelancer'>('client');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType') as 'client' | 'freelancer' | null;
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  const handleRoleSwitch = (role: 'client' | 'freelancer') => {
    setUserType(role);
    localStorage.setItem('userType', role);
    // Navigate to dashboard home when switching roles
    navigate('/dashboard');
  };

  return (
    <>
      <PremiumDashboardLayout userType={userType}>
        <Routes>
          {/* Dashboard Home */}
          <Route
            index
            element={
              userType === 'client' ? <ClientDashboardHome /> : <FreelancerDashboardHome />
            }
          />

          {/* Projects */}
          <Route path="projects/explore" element={<ExploreProjects />} />
          <Route path="projects/my-projects" element={<MyProjects />} />
          
          {/* Create Project (Client Only) */}
          <Route 
            path="projects/create" 
            element={userType === 'client' ? <CreateProject /> : <Navigate to="/dashboard" />} 
          />

          {/* Gigs */}
          <Route path="gigs/orders" element={<GigOrders />} />
          <Route path="gigs/find" element={<FindGigs />} />
          
          {/* My Gigs (Freelancer Only) */}
          <Route 
            path="gigs/my-gigs" 
            element={userType === 'freelancer' ? <MyGigs /> : <Navigate to="/dashboard" />} 
          />

          {/* Talent/Clients */}
          <Route
            path="talent"
            element={userType === 'client' ? <FindTalent /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="clients"
            element={userType === 'freelancer' ? <FindClients /> : <Navigate to="/dashboard" />}
          />

          {/* Wallet & Withdraw (Freelancer Only) */}
          <Route 
            path="wallet" 
            element={userType === 'freelancer' ? <WalletWithdraw /> : <Navigate to="/dashboard/balance" />} 
          />

          {/* Startup Ideas */}
          <Route path="startup-ideas" element={<StartupIdeas />} />

          {/* Shared Pages */}

          <Route path="disputes" element={<Disputes />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="saved" element={<SavedItems />} />
          <Route path="messages" element={<Messages />} />
          <Route path="balance" element={<AccountBalance />} />
          <Route path="subscription" element={<SubscriptionCredits />} />
          <Route path="settings" element={<Settings />} />

          {/* Details Pages */}
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="gigs/create" element={<CreateGig />} />
          <Route path="gigs/edit/:id" element={<EditGig />} />
          <Route path="gigs/:id" element={<GigDetails />} />
          <Route path="talent/:id" element={<TalentProfile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </PremiumDashboardLayout>
      
      {/* Quick Action Menu (Left Bottom) */}
      <QuickActionMenu userType={userType} />
      
      {/* Role Switcher for Demo (Right Bottom) */}
      <RoleSwitcher currentRole={userType} onSwitch={handleRoleSwitch} />
    </>
  );
}