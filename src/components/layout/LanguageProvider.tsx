
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  search_placeholder: { en: "Search for work & trade...", fr: "Rechercher des entreprises..." },
  list_enterprise: { en: "Add Business", fr: "Ajouter" },
  my_profile: { en: "My Profile", fr: "Mon Profil" },
  enterprise_dashboard: { en: "Edit Enterprise", fr: "Modifier" },
  logout: { en: "Sign Out", fr: "Quitter" },
  discover_best: { en: "Find Great Businesses", fr: "Trouver des entreprises" },
  view_all: { en: "Show All", fr: "Tout Voir" },
  footer_text: { en: "© 2026 Cameroon Zoom • All Rights Reserved", fr: "© 2026 Cameroon Zoom." },
  login: { en: "Sign In", fr: "Connexion" },
  signup: { en: "Join Us", fr: "S'inscrire" },
  search: { en: "Search", fr: "Chercher" },
  admin_center: { en: "Admin Page", fr: "Admin" },
  featured_businesses: { en: "Best Enterprises", fr: "Meilleurs" },
  browse_categories: { en: "Trade Type", fr: "Secteur" },
  enterprise_listings: { en: "Enterprises", fr: "Entreprises" },
  fetching_directory: { en: "Loading Directory...", fr: "Chargement..." },
  no_enterprises_match: { en: "No enterprises found", fr: "Rien trouvé" },
  write_review: { en: "Add Review", fr: "Donner un avis" },
  share: { en: "Share", fr: "Partager" },
  about: { en: "About Business", fr: "À propos" },
  call_enterprise: { en: "Call Now", fr: "Appeler" },
  visit_enterprise: { en: "Visit Website", fr: "Site Web" },
  reviews: { en: "Reviews", fr: "Avis" },
  post_review: { en: "Post Review", fr: "Publier" },
  list_your_enterprise: { en: "Register Enterprise", fr: "Ajouter" },
  step: { en: "Step", fr: "Étape" },
  enterprise_identity: { en: "Business Identity", fr: "Identité" },
  location_operations: { en: "Location & Times", fr: "Lieu" },
  publish_listing: { en: "Post Listing", fr: "Publier" },
  deploy_changes: { en: "Save Changes", fr: "Sauvegarder" },
  edit_profile: { en: "Update Profile", fr: "Modifier" },
  my_enterprises: { en: "My Enterprises", fr: "Mes Entreprises" },
  my_reviews: { en: "My Reviews", fr: "Mes Avis" },
  manage: { en: "Manage", fr: "Gérer" },
  send_enquiry: { en: "Send Message", fr: "Envoyer" },
  featured_listings: { en: "Top Choices", fr: "Choix Vedettes" },
  recent_reviews: { en: "Recent Experiences", fr: "Derniers Avis" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
