# **App Name**: Cameroon Zoom

## Core Features:

- User Authentication: Secure sign-up and login with email/password, supporting user profiles and business owner distinctions using Firebase Auth.
- Business Listings Management: Allow business owners to add, edit, and manage their business details, including photos, descriptions, location, and contact information, linking to Firestore database entries.
- Smart Search and Filtering: Enable users to search for businesses by name, category, or keywords, with filtering options based on rating and distance; display results on an interactive map.
- Detailed Business Pages: Showcase comprehensive business information including cover photo, logo, descriptions, and reviews, complete with maps and contact options.
- Review and Rating System: Allow users to submit reviews with ratings and photos, with automatic updates to business averages and review counts.
- AI-Driven Location Understanding: Uses a tool to help ensure the listing address is precise. The tool reviews a textual description of an address in Cameroon (e.g., neighborhood, nearby landmarks) and decides whether the GPS coordinates associated with it should be adjusted for greater precision.  The location is stored to the Firestore database
- Favorites and Business Dashboard: Allow users to save favorite businesses and provide a dashboard for business owners to manage their listings and respond to reviews.

## Style Guidelines:

- Primary color: Red (#FF0000), chosen to align with the client's inspiration from Yelp, is for main branding elements. Its use helps ensure immediate brand recognition.
- Background color: Light gray (#F0F0F0), a subtle variation of red, supports readability and minimizes distraction. This ensures the red accents pop without overwhelming the user.
- Accent color: Orange-red (#FF4500). As a warmer, contrasting color to the primary, it directs user attention to interactive elements.
- Body and headline font: 'PT Sans' (sans-serif), used for a clean and accessible design, for both desktop and mobile.
- Consistent and intuitive icons for categories and actions.
- Mobile-first responsive design with clear information hierarchy.
- Subtle animations for user feedback and engagement.