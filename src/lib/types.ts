// src/app/lib/types.ts
export interface BusinessService {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  link?: string;
}

export interface Business {
  id: string;
  name: string;
  category?: string;
  city?: string;
  averageRating?: number;
  totalReviews?: number;
  coverPhoto?: string;
  logo?: string;
  bookingLink?: string;
  website?: string;
  whatsapp?: string;
  services?: BusinessService[];
}




// ✅ No extra export type needed, already exported above