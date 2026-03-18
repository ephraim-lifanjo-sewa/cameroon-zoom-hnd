
import { EnterpriseCategory, Enterprise } from './types';

export const CATEGORIES: { id: string; name: EnterpriseCategory; icon: string }[] = [
  { id: 'food', name: 'Food & Hospitality', icon: 'Utensils' },
  { id: 'health', name: 'Health & Wellness', icon: 'HeartPulse' },
  { id: 'tech', name: 'Technology & IT', icon: 'Cpu' },
  { id: 'business', name: 'Business & Professional', icon: 'Briefcase' },
  { id: 'home', name: 'Home & Lifestyle', icon: 'Home' },
  { id: 'creative', name: 'Creative & Media', icon: 'Palette' },
  { id: 'education', name: 'Education & Training', icon: 'GraduationCap' },
  { id: 'events', name: 'Events & Entertainment', icon: 'PartyPopper' },
];

/**
 * SAMPLE BUSINESSES
 * 2 verified records for Douala and Ngaoundéré.
 */
export const MOCK_BUSINESSES: Enterprise[] = [
  {
    id: "douala-sample-1",
    name: "The Douala Trade Center",
    businessName: "The Douala Trade Center",
    tagline: "Professional Work Spaces",
    description: "Located in the heart of Akwa, we provide high-fidelity office spaces and professional consulting services for trade in Cameroon.",
    category: "Business & Professional",
    address: "Boulevard de la Liberté, Akwa",
    city: "Douala",
    state: "Littoral",
    phoneNumber: "+237 600 000 001",
    whatsapp: "237600000001",
    email: "trade@douala.cm",
    hours: "Monday - Friday: 08:00 AM - 06:00 PM",
    priceRange: "$$",
    logo: "https://picsum.photos/seed/dla-logo/200/200",
    coverPhoto: "https://images.unsplash.com/photo-1588334488081-06fca9a234f9?q=80&w=1200",
    latitude: 4.0511,
    longitude: 9.7679,
    averageRating: 5.0,
    totalReviews: 1,
    createdDate: new Date().toISOString(),
    isVerified: true,
    isActive: true,
    ownerId: "admin-system",
    ceoName: "Director Douala",
    employeeCount: "11-50",
    quarter: "Akwa"
  },
  {
    id: "ngr-sample-1",
    name: "Ngaoundéré Plateau Lodge",
    businessName: "Ngaoundéré Plateau Lodge",
    tagline: "Quality Stay in the North",
    description: "Experience the beauty of the Adamawa Plateau. Our lodge offers the best hospitality and comfort for visitors to Ngaoundéré.",
    category: "Food & Hospitality",
    address: "Plateau District, near the Palace",
    city: "Ngaoundéré",
    state: "Adamawa",
    phoneNumber: "+237 600 000 002",
    whatsapp: "237600000002",
    email: "stay@ngr-lodge.cm",
    hours: "Monday - Sunday: Open 24 Hours",
    priceRange: "$$$",
    logo: "https://picsum.photos/seed/ngr-logo/200/200",
    coverPhoto: "https://images.unsplash.com/photo-1602685234860-3d38ee425ae8?q=80&w=1200",
    latitude: 7.3277,
    longitude: 13.5847,
    averageRating: 4.8,
    totalReviews: 1,
    createdDate: new Date().toISOString(),
    isVerified: true,
    isActive: true,
    ownerId: "admin-system",
    ceoName: "Manager Adamawa",
    employeeCount: "1-10",
    quarter: "Plateau"
  }
];

export const MOCK_REVIEWS = (bizId: string, bizName: string): any[] => [
  {
    id: `rev-${bizId}-1`,
    businessId: bizId,
    businessName: bizName,
    reviewerId: "sample-user-1",
    userName: "Ephraim",
    userPhoto: "https://i.pravatar.cc/150?u=ephraim",
    rating: 5,
    reviewText: "Very professional place. Highly recommended for work.",
    photos: [],
    createdDate: new Date().toISOString(),
    isHelpfulCount: 0
  }
];
