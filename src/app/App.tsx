import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import HomePage from '@/app/pages/HomePage';
import GigsPage from '@/app/pages/GigsPage';
import GigDetailsPage from '@/app/pages/GigDetailsPage';
import GigCheckout from '@/app/pages/GigCheckout';
import GigOrderSuccess from '@/app/pages/GigOrderSuccess';
import ProjectsPage from '@/app/pages/ProjectsPage';
import ProjectDetailsPage from '@/app/pages/ProjectDetailsPage';
import TalentPage from '@/app/pages/TalentPage';
import TalentProfilePage from '@/app/pages/TalentProfilePage';
import SignInPage from '@/app/pages/SignInPage';
import SignUpPage from '@/app/pages/SignUpPage';
import ForgotPasswordPage from '@/app/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/app/pages/ResetPasswordPage';
import FreelancerOnboarding from '@/app/pages/onboarding/FreelancerOnboarding';
import ClientOnboarding from '@/app/pages/onboarding/ClientOnboarding';
import NewDashboardPage from '@/app/pages/NewDashboardPage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQsPage from './pages/FAQsPage';
import StaticPageView from './pages/StaticPageView';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SubscriptionPlans from './pages/SubscriptionPlans';
import PaymentStatus from './pages/PaymentStatus';
import ExploreIdeasPage from './pages/ExploreIdeasPage';
import StartupIdeaPublicDetailPage from './pages/StartupIdeaPublicDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import InvestorDashboard from './pages/dashboard/investor/InvestorDashboard';
import StartupCreatorDashboard from './pages/dashboard/startup/StartupCreatorDashboard';
import SubscriptionPlansPricingPage from './pages/SubscriptionPlansPricingPage';
import FreelancerLandingPage from './pages/FreelancerLandingPage';
import { Toaster } from 'sonner';
import SiteSettingsProvider from './components/SiteSettingsLoader';

export default function App() {
  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <Toaster position="top-right" richColors />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/aboutus" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/plans" element={<SubscriptionPlansPricingPage />} />
            {/* <Route path="/gigs" element={<GigsPage />} />
            <Route path="/gigs/:id" element={<GigDetailsPage />} /> */}
            <Route path="/explore-ideas" element={<ExploreIdeasPage />} />
            <Route path="/explore-ideas/:id" element={<StartupIdeaPublicDetailPage />} />
            {/* <Route path="/gigs/:id/checkout" element={<GigCheckout />} />
            <Route path="/gigs/:id/success" element={<GigOrderSuccess />} /> */}
            <Route path="/categories" element={<AllCategoriesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/talent" element={<TalentPage />} />
            <Route path="/talent/:id" element={<TalentProfilePage />} />
            <Route path="/f/:id" element={<FreelancerLandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/onboarding/freelancer" element={<FreelancerOnboarding />} />
            <Route path="/onboarding/client" element={<ClientOnboarding />} />
            {/* Protected: requires auth + verified email */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <NewDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-investor/*"
              element={
                <ProtectedRoute>
                  <InvestorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-startup/*"
              element={
                <ProtectedRoute>
                  <StartupCreatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<StaticPageView />} />
            <Route path="/privacy" element={<StaticPageView />} />
            <Route path="/cookies" element={<StaticPageView />} />
            <Route path="/pages/:slug" element={<StaticPageView />} />
            <Route path="/subscription" element={<SubscriptionPlansPricingPage />} />
            <Route path="/payment/success" element={<PaymentStatus />} />
            <Route path="/payment/failure" element={<PaymentStatus />} />
          </Routes>
        </Router>
      </SiteSettingsProvider>
    </ThemeProvider>
  );
}