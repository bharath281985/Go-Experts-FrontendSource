import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  Briefcase,
  Users,
  Package,
  Star,
  Clock,
  MapPin,
  IndianRupee,
  Filter,
  Search,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getCategoryBySlug } from '@/data/categories';

type TabType = 'projects' | 'talent' | 'gigs';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : null;
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  if (!category) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <Link to="/categories" className="text-[#F24C20] hover:underline">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;

  // Dummy data for projects
  const projects = [
    {
      id: 1,
      title: `${category.name} Expert Needed for Startup`,
      budget: '₹25,000 - ₹50,000',
      type: 'Fixed Price',
      duration: '2-4 weeks',
      skills: ['Expert Level', 'Remote', 'Immediate Start'],
      postedTime: '3 hours ago',
      proposals: 18,
      image: category.image,
      description: `Looking for experienced ${category.name} professional...`
    },
    {
      id: 2,
      title: `Ongoing ${category.name} Support Required`,
      budget: '₹800 - ₹1,500/hr',
      type: 'Hourly',
      duration: '3-6 months',
      skills: ['Senior Level', 'Flexible', 'Part-time'],
      postedTime: '1 day ago',
      proposals: 34,
      image: category.image,
      description: `Seeking reliable ${category.name} expert for long-term...`
    },
    {
      id: 3,
      title: `${category.name} Project for Enterprise Client`,
      budget: '₹75,000 - ₹1,50,000',
      type: 'Fixed Price',
      duration: '2-3 months',
      skills: ['Expert Level', 'On-site', 'Full-time'],
      postedTime: '2 days ago',
      proposals: 56,
      image: category.image,
      description: `Major project requiring top-tier ${category.name} skills...`
    }
  ];

  // Dummy data for talent
  const talents = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      title: `Senior ${category.name} Specialist`,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      rating: 4.9,
      reviews: 127,
      hourlyRate: 1200,
      completed: 84,
      skills: [`${category.name}`, 'Project Management', 'Consulting'],
      location: 'Mumbai, India',
      availability: 'Available Now'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      title: `Expert ${category.name} Consultant`,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      rating: 5.0,
      reviews: 89,
      hourlyRate: 1500,
      completed: 67,
      skills: [`${category.name}`, 'Strategy', 'Training'],
      location: 'Bangalore, India',
      availability: 'Available in 2 weeks'
    },
    {
      id: 3,
      name: 'Arjun Patel',
      title: `${category.name} Freelancer`,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      rating: 4.8,
      reviews: 156,
      hourlyRate: 900,
      completed: 112,
      skills: [`${category.name}`, 'Agile', 'Team Lead'],
      location: 'Delhi, India',
      availability: 'Available Now'
    }
  ];

  // Dummy data for gigs
  const gigs = [
    {
      id: 1,
      title: `I will provide professional ${category.name} services`,
      seller: 'Neha Gupta',
      sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      image: category.image,
      startingPrice: 2999,
      rating: 4.9,
      reviews: 234,
      delivery: '3 days',
      level: 'Top Rated Seller'
    },
    {
      id: 2,
      title: `Professional ${category.name} package for your business`,
      seller: 'Vikram Singh',
      sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      image: category.image,
      startingPrice: 4999,
      rating: 5.0,
      reviews: 178,
      delivery: '5 days',
      level: 'Top Rated Seller'
    },
    {
      id: 3,
      title: `Get expert ${category.name} solutions delivered fast`,
      seller: 'Anjali Mehta',
      sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      image: category.image,
      startingPrice: 1999,
      rating: 4.8,
      reviews: 145,
      delivery: '2 days',
      level: 'Level 2 Seller'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950" />
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-10"
          />
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 blur-3xl`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm mb-8"
          >
            <Link to="/" className="text-neutral-400 hover:text-[#F24C20] transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
            <Link to="/categories" className="text-neutral-400 hover:text-[#F24C20] transition-colors">
              Categories
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
            <span className="text-white font-medium">{category.name}</span>
          </motion.div>

          {/* Category Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${category.color} shadow-2xl`}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {category.name}
                </h1>
                {category.trending && (
                  <div className="px-3 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}
              </div>
              <p className="text-xl text-neutral-400 mb-6">
                {category.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Available Talent</div>
                  <div className="text-2xl font-bold text-white">{category.talentCount.toLocaleString()}+</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Active Projects</div>
                  <div className="text-2xl font-bold text-white">{category.projectCount.toLocaleString()}+</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Available Gigs</div>
                  <div className="text-2xl font-bold text-white">{category.gigCount.toLocaleString()}+</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 mb-8 p-2 bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800"
          >
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'projects'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
            >
              <Briefcase className="w-5 h-5" />
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('talent')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'talent'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
            >
              <Users className="w-5 h-5" />
              Talent ({talents.length})
            </button>
            <button
              onClick={() => setActiveTab('gigs')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'gigs'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
            >
              <Package className="w-5 h-5" />
              Gigs ({gigs.length})
            </button>
          </motion.div>

          {/* Search & Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20]/50 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-xl text-white hover:border-[#F24C20]/50 transition-all flex items-center gap-2 justify-center"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </motion.div>

          {/* Content Grid with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="p-6 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-4">Filters</h3>

                  {/* Budget/Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      {activeTab === 'talent' ? 'Hourly Rate' : 'Budget Range'}
                    </label>
                    <div className="space-y-2">
                      {['₹0 - ₹10K', '₹10K - ₹30K', '₹30K - ₹60K', '₹60K+'].map((range) => (
                        <label key={range} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded accent-[#F24C20]" />
                          <span className="text-sm text-neutral-400">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Experience Level
                    </label>
                    <div className="space-y-2">
                      {['Entry Level', 'Intermediate', 'Expert'].map((level) => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded accent-[#F24C20]" />
                          <span className="text-sm text-neutral-400">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating (for talent/gigs) */}
                  {(activeTab === 'talent' || activeTab === 'gigs') && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Rating
                      </label>
                      <div className="space-y-2">
                        {['4.5+ ⭐', '4.0+ ⭐', '3.5+ ⭐'].map((rating) => (
                          <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded accent-[#F24C20]" />
                            <span className="text-sm text-neutral-400">{rating}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Time (for gigs) */}
                  {activeTab === 'gigs' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Delivery Time
                      </label>
                      <div className="space-y-2">
                        {['24 Hours', '3 Days', '7 Days', 'Anytime'].map((time) => (
                          <label key={time} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded accent-[#F24C20]" />
                            <span className="text-sm text-neutral-400">{time}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="w-full px-4 py-2 bg-[#F24C20] hover:bg-orange-600 text-white rounded-lg font-medium transition-all">
                    Apply Filters
                  </button>
                </div>
              </motion.aside>
            )}

            {/* Main Content */}
            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 rounded-2xl transition-all group"
                    >
                      <div className="flex gap-6">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#F24C20] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-neutral-400 text-sm mb-4">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                              <span className="flex items-center gap-1">
                                <IndianRupee className="w-4 h-4" />
                                {project.budget}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {project.duration}
                              </span>
                              <span>{project.proposals} proposals</span>
                            </div>
                            <button className="px-6 py-2 bg-[#F24C20] hover:bg-orange-600 text-white rounded-lg font-medium transition-all">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Talent Tab */}
              {activeTab === 'talent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {talents.map((talent, index) => (
                    <motion.div
                      key={talent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 rounded-2xl transition-all group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={talent.avatar}
                          alt={talent.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#F24C20] transition-colors">
                            {talent.name}
                          </h3>
                          <p className="text-sm text-neutral-400 mb-2">{talent.title}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                              <span className="text-sm font-bold text-white">{talent.rating}</span>
                            </div>
                            <span className="text-sm text-neutral-500">({talent.reviews} reviews)</span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                          <Bookmark className="w-5 h-5 text-neutral-400" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {talent.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                        <div>
                          <div className="text-sm text-neutral-500">Starting at</div>
                          <div className="text-lg font-bold text-white">₹{talent.hourlyRate}/hr</div>
                        </div>
                        <button className="px-6 py-2 bg-[#044071] hover:bg-[#055a99] text-white rounded-lg font-medium transition-all">
                          Hire Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Gigs Tab */}
              {activeTab === 'gigs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gigs.map((gig, index) => (
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 rounded-2xl overflow-hidden transition-all group"
                    >
                      <div className="relative h-48">
                        <img
                          src={gig.image}
                          alt={gig.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <div className="px-3 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full">
                            {gig.level}
                          </div>
                        </div>
                        <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors">
                          <Bookmark className="w-4 h-4 text-neutral-900" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={gig.sellerAvatar}
                            alt={gig.seller}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-white">{gig.seller}</div>
                            <div className="text-xs text-neutral-400">{gig.level}</div>
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold text-white mb-3 line-clamp-2 group-hover:text-[#F24C20] transition-colors">
                          {gig.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          <span className="font-bold text-white">{gig.rating}</span>
                          <span className="text-sm text-neutral-400">({gig.reviews})</span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Clock className="w-4 h-4" />
                            <span>{gig.delivery}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-neutral-500">Starting at</div>
                            <div className="text-lg font-bold text-white">₹{gig.startingPrice.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/20 rounded-2xl text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your {category.name} Project?
            </h3>
            <p className="text-neutral-400 mb-6">
              Connect with top {category.name} experts and bring your vision to life
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-[#F24C20] hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#F24C20]/30">
                Post a Project
              </button>
              <button className="px-8 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all">
                Browse More Talent
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
