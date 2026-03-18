
export type City = 'Douala' | 'Yaoundé' | 'Ngaoundéré';

export type Business = {
  id: string;
  name: string;
  category: string;
  city: string;
  description: string;
  address: string;
  phone_numbers: string[];
  email: string;
  website: string;
  logo_url: string;
  cover_image_url: string;
  gallery_images: string[];
  latitude: number;
  longitude: number;
  rating: number;
  
  // Metadata for internal systems
  ownerId?: string;
  averageRating?: number;
  totalReviews?: number;
  photos?: string[];
  logo?: string;
  coverPhoto?: string;
  location?: { lat: number; lng: number };
  whatsapp?: string;
  hours?: string;
  bookingLink?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type Review = {
  id: string;
  businessId: string;
  reviewerId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  reviewText: string;
  photos: string[];
  date: string;
  ownerResponse?: string | null;
  responseDate?: string | null;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  profilePhoto: string;
  city: string;
  isBusinessOwner: boolean;
  bio?: string;
  savedBusinessIds: string[];
  reviewCount: number;
  coverPhoto?: string;
};
