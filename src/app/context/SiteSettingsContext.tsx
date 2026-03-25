import { createContext, useContext } from 'react';

export interface SiteSettings {
    site_name: string;
    site_tagline: string;
    site_logo: string;
    site_favicon: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    social_facebook: string;
    social_twitter: string;
    social_linkedin: string;
    social_instagram: string;
    social_github: string;
    social_youtube: string;
    footer_copyright: string;
    commission_rate: number;
    currency: string;
    timezone: string;
    maintenance_mode: boolean;
    points_per_rupee: number;
    points_signup_bonus: number;
    home_stats: { label: string; value: number; suffix: string; icon: string }[];
    trust_badges: string[];
    startup_nda_template: string;
    subscription_title: string;
    subscription_subtitle: string;
    subscription_description: string;
    subscription_button_text: string;
    subscription_highlights: { label: string; enabled: boolean }[];
}

export const defaultSiteSettings: SiteSettings = {
    site_name: 'Go Experts',
    site_tagline: 'Find verified experts. Get work done faster.',
    site_logo: '',
    site_favicon: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    meta_title: 'Go Experts – Freelancer Platform',
    meta_description: 'Find verified experts and get work done faster on Go Experts.',
    meta_keywords: 'freelance, hire, experts, gigs, projects',
    social_facebook: '',
    social_twitter: '',
    social_linkedin: '',
    social_instagram: '',
    social_github: '',
    social_youtube: '',
    footer_copyright: '© 2026 Go Experts. All rights reserved.',
    commission_rate: 10,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenance_mode: false,
    points_per_rupee: 1,
    points_signup_bonus: 100,
    home_stats: [],
    trust_badges: [],
    startup_nda_template: '',
    subscription_title: '',
    subscription_subtitle: '',
    subscription_description: '',
    subscription_button_text: '',
    subscription_highlights: [],
};

export const SiteSettingsContext = createContext<SiteSettings>(defaultSiteSettings);

export function useSiteSettings() {
    return useContext(SiteSettingsContext);
}
