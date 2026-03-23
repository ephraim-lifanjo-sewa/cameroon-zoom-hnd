export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export type EnterpriseCategory = 'Food & Hospitality' | 'Health & Wellness' | 'Technology & IT' | 'Business & Professional' | 'Home & Lifestyle' | 'Creative & Media' | 'Education & Training' | 'Events & Entertainment';

export type Enterprise = {
  id: string;
  name: string;
  businessName: string;
  tagline?: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  hours: string;
  priceRange?: PriceRange | string;
  logo: string;
  coverPhoto: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  totalReviews: number;
  createdDate: string;
  isVerified: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  ownerId: string;
  galleryImages?: string[];
  ceoName?: string;
  employeeCount?: string;
  quarter?: string;
};

export type Review = {
  id: string;
  businessId: string;
  businessName?: string;
  reviewerId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  reviewText: string;
  photos: string[];
  createdDate: string;
  modifiedDate?: string;
  isHelpfulCount: number;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  profilePhoto: string;
  bio: string;
  city: string;
  joinDate: string;
  reviewCount: number;
  averageRatingGiven: number;
  isBusinessOwner: boolean;
  isAdmin?: boolean;
  nickname?: string;
  tagline?: string;
  hometown?: string;
};
