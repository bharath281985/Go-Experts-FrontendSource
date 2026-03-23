import {
  Palette,
  Code,
  Smartphone,
  TrendingUp,
  PenTool,
  Video,
  Shield,
  Brain,
  Camera,
  Music,
  Database,
  Globe,
  Megaphone,
  Lightbulb,
  Package,
  Users
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: any;
  image: string;
  color: string;
  bgGlow: string;
  serviceCount: number;
  projectCount: number;
  talentCount: number;
  gigCount: number;
  trending?: boolean;
  popular?: boolean;
  new?: boolean;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'Create stunning user experiences and interfaces that users love',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1547027072-332f09bd6bb3?w=800&q=80',
    color: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/20',
    serviceCount: 2450,
    projectCount: 1240,
    talentCount: 2450,
    gigCount: 892,
    popular: true,
    trending: true
  },
  {
    id: '2',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Build modern, responsive websites with cutting-edge technologies',
    icon: Code,
    image: 'https://images.unsplash.com/photo-1565229284535-2cbbe3049123?w=800&q=80',
    color: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/20',
    serviceCount: 3200,
    projectCount: 1850,
    talentCount: 3200,
    gigCount: 1245,
    popular: true,
    trending: true
  },
  {
    id: '3',
    name: 'App Development',
    slug: 'app-development',
    description: 'Develop native and cross-platform mobile applications',
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1633250391894-397930e3f5f2?w=800&q=80',
    color: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-500/20',
    serviceCount: 1800,
    projectCount: 980,
    talentCount: 1800,
    gigCount: 654,
    popular: true
  },
  {
    id: '4',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Grow your brand with strategic digital marketing campaigns',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&q=80',
    color: 'from-orange-500 to-red-500',
    bgGlow: 'bg-orange-500/20',
    serviceCount: 2100,
    projectCount: 1120,
    talentCount: 2100,
    gigCount: 768,
    trending: true
  },
  {
    id: '5',
    name: 'Content Writing',
    slug: 'content-writing',
    description: 'Craft compelling content that engages and converts',
    icon: PenTool,
    image: 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=800&q=80',
    color: 'from-yellow-500 to-orange-500',
    bgGlow: 'bg-yellow-500/20',
    serviceCount: 1650,
    projectCount: 890,
    talentCount: 1650,
    gigCount: 543,
    popular: true
  },
  {
    id: '6',
    name: 'Video Editing',
    slug: 'video-editing',
    description: 'Professional video editing and post-production services',
    icon: Video,
    image: 'https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=800&q=80',
    color: 'from-red-500 to-pink-500',
    bgGlow: 'bg-red-500/20',
    serviceCount: 980,
    projectCount: 520,
    talentCount: 980,
    gigCount: 387,
    trending: true
  },
  {
    id: '7',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Protect your digital assets with expert security solutions',
    icon: Shield,
    image: 'https://images.unsplash.com/photo-1768224656445-33d078c250b7?w=800&q=80',
    color: 'from-indigo-500 to-purple-500',
    bgGlow: 'bg-indigo-500/20',
    serviceCount: 720,
    projectCount: 380,
    talentCount: 720,
    gigCount: 245,
    new: true
  },
  {
    id: '8',
    name: 'AI/ML Engineering',
    slug: 'ai-ml-engineering',
    description: 'Harness the power of AI and machine learning',
    icon: Brain,
    image: 'https://images.unsplash.com/photo-1618758992242-2d4bc63a1be7?w=800&q=80',
    color: 'from-cyan-500 to-blue-500',
    bgGlow: 'bg-cyan-500/20',
    serviceCount: 1320,
    projectCount: 680,
    talentCount: 1320,
    gigCount: 456,
    trending: true,
    new: true
  },
  {
    id: '9',
    name: 'Photography',
    slug: 'photography',
    description: 'Capture moments with professional photography services',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
    color: 'from-pink-500 to-rose-500',
    bgGlow: 'bg-pink-500/20',
    serviceCount: 1540,
    projectCount: 820,
    talentCount: 1540,
    gigCount: 612,
    popular: true
  },
  {
    id: '10',
    name: 'Music Production',
    slug: 'music-production',
    description: 'Create, mix, and master professional audio content',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
    color: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-500/20',
    serviceCount: 680,
    projectCount: 340,
    talentCount: 680,
    gigCount: 278,
  },
  {
    id: '11',
    name: 'Data Science',
    slug: 'data-science',
    description: 'Turn data into actionable insights and predictions',
    icon: Database,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    color: 'from-emerald-500 to-green-500',
    bgGlow: 'bg-emerald-500/20',
    serviceCount: 890,
    projectCount: 450,
    talentCount: 890,
    gigCount: 324,
    trending: true
  },
  {
    id: '12',
    name: 'SEO Services',
    slug: 'seo-services',
    description: 'Boost your search engine rankings and visibility',
    icon: Globe,
    image: 'https://images.unsplash.com/photo-1571677208715-e5c7aed3380b?w=800&q=80',
    color: 'from-teal-500 to-cyan-500',
    bgGlow: 'bg-teal-500/20',
    serviceCount: 1450,
    projectCount: 780,
    talentCount: 1450,
    gigCount: 589,
    popular: true
  },
  {
    id: '13',
    name: 'Social Media Marketing',
    slug: 'social-media-marketing',
    description: 'Grow your social presence and engage your audience',
    icon: Megaphone,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    color: 'from-rose-500 to-pink-500',
    bgGlow: 'bg-rose-500/20',
    serviceCount: 1890,
    projectCount: 1020,
    talentCount: 1890,
    gigCount: 742,
    trending: true,
    popular: true
  },
  {
    id: '14',
    name: 'Brand Strategy',
    slug: 'brand-strategy',
    description: 'Build a strong brand identity and positioning',
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80',
    color: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/20',
    serviceCount: 1120,
    projectCount: 590,
    talentCount: 1120,
    gigCount: 423,
  },
  {
    id: '15',
    name: 'Product Design',
    slug: 'product-design',
    description: 'Design innovative products from concept to reality',
    icon: Package,
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
    color: 'from-lime-500 to-green-500',
    bgGlow: 'bg-lime-500/20',
    serviceCount: 950,
    projectCount: 480,
    talentCount: 950,
    gigCount: 356,
    new: true
  },
  {
    id: '16',
    name: 'HR Consulting',
    slug: 'hr-consulting',
    description: 'Expert HR solutions for modern businesses',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    color: 'from-sky-500 to-blue-500',
    bgGlow: 'bg-sky-500/20',
    serviceCount: 560,
    projectCount: 280,
    talentCount: 560,
    gigCount: 198,
  }
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};

export const getPopularCategories = (): Category[] => {
  return categories.filter(cat => cat.popular);
};

export const getTrendingCategories = (): Category[] => {
  return categories.filter(cat => cat.trending);
};

export const getNewCategories = (): Category[] => {
  return categories.filter(cat => cat.new);
};
