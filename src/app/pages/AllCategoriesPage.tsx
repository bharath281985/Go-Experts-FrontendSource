import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Clock, ChevronRight, Home } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { categories } from '@/data/categories';

type FilterType = 'all' | 'popular' | 'trending' | 'new';

export default function AllCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'popular') return matchesSearch && category.popular;
    if (activeFilter === 'trending') return matchesSearch && category.trending;
    if (activeFilter === 'new') return matchesSearch && category.new;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(242,76,32,0.15),transparent_50%)]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI0MiwgNzYsIDMyLCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-20" />
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
            <span className="text-white font-medium">Categories</span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4">
              <div className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/20">
                <span className="text-sm font-medium text-[#F24C20]">Browse All Categories</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
              Explore Every Skill Domain
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Find the perfect expert for your project across 16+ specialized categories
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20]/50 transition-all"
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'popular'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Popular
            </button>
            <button
              onClick={() => setActiveFilter('trending')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'trending'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setActiveFilter('new')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'new'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
                  : 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              New
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="relative py-16 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center"
          >
            <p className="text-neutral-400">
              Showing <span className="text-[#F24C20] font-semibold">{filteredCategories.length}</span> categories
            </p>
          </motion.div>

          {/* Bento-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => {
              const Icon = category.icon;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link to={`/categories/${category.slug}`}>
                    <div className="relative h-full overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 hover:border-[#F24C20]/50 transition-all duration-300">
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {category.trending && (
                            <div className="px-3 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Trending
                            </div>
                          )}
                          {category.new && (
                            <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              New
                            </div>
                          )}
                          {category.popular && !category.trending && (
                            <div className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Popular
                            </div>
                          )}
                        </div>

                        {/* Icon */}
                        <div className="absolute bottom-4 left-4">
                          <motion.div
                            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} shadow-lg`}
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-[#F24C20] transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-neutral-800/50">
                            <div className="text-xs text-neutral-500 mb-1">Available Talent</div>
                            <div className="text-lg font-bold text-white">{category.talentCount.toLocaleString()}+</div>
                          </div>
                          <div className="p-3 rounded-lg bg-neutral-800/50">
                            <div className="text-xs text-neutral-500 mb-1">Active Gigs</div>
                            <div className="text-lg font-bold text-white">{category.gigCount.toLocaleString()}+</div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                          <span className="text-sm font-medium text-[#F24C20]">View Category</span>
                          <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 5 }}
                          >
                            <ChevronRight className="w-5 h-5 text-[#F24C20]" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Glow Effect on Hover */}
                      <motion.div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${category.color} blur-3xl -z-10`}
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Search className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No categories found</h3>
              <p className="text-neutral-400">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(242,76,32,0.15),transparent_50%)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Can't Find Your Category?
            </h2>
            <p className="text-xl text-neutral-400 mb-8">
              We're constantly expanding. Let us know what you're looking for.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="px-8 py-4 bg-[#F24C20] hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#F24C20]/30"
              >
                Request a Category
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all"
              >
                Join as Expert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
