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
  search_placeholder: { en: "Search food, health, or businesses...", fr: "Chercher des restaurants, santé ou commerces..." },
  list_enterprise: { en: "Add Business", fr: "Ajouter" },
  my_profile: { en: "Profile", fr: "Mon Profil" },
  enterprise_dashboard: { en: "Modify Info", fr: "Modifier" },
  logout: { en: "Log Out", fr: "Quitter" },
  discover_best: { en: "Find Businesses", fr: "Trouver des entreprises" },
  view_all: { en: "See All", fr: "Tout Voir" },
  footer_text: { en: "© 2026 Cameroon Zoom • Professional Directory", fr: "© 2026 Cameroon Zoom." },
  login: { en: "Log In", fr: "Connexion" },
  signup: { en: "Sign Up", fr: "S'inscrire" },
  search: { en: "Find", fr: "Chercher" },
  admin_center: { en: "Admin Page", fr: "Admin" },
  featured_businesses: { en: "Top Choices", fr: "Meilleurs" },
  browse_categories: { en: "Work Type", fr: "Travail" },
  enterprise_listings: { en: "Businesses", fr: "Commerces" },
  fetching_directory: { en: "Searching...", fr: "Chargement..." },
  no_enterprises_match: { en: "Nothing found", fr: "Rien trouvé" },
  write_review: { en: "Write Review", fr: "Donner un avis" },
  share: { en: "Share", fr: "Partager" },
  about: { en: "About", fr: "À propos" },
  call_enterprise: { en: "Call Now", fr: "Appeler" },
  visit_enterprise: { en: "Website", fr: "Site Web" },
  reviews: { en: "Reviews", fr: "Avis" },
  post_review: { en: "Post Review", fr: "Publier" },
  list_your_enterprise: { en: "Add Business", fr: "Ajouter" },
  step: { en: "Part", fr: "Étape" },
  enterprise_identity: { en: "Name & Info", fr: "Identité" },
  location_operations: { en: "Place & Times", fr: "Lieu" },
  publish_listing: { en: "Finish!", fr: "Publier" },
  deploy_changes: { en: "Save All", fr: "Sauvegarder" },
  edit_profile: { en: "Modify Info", fr: "Modifier" },
  my_enterprises: { en: "My Businesses", fr: "Mes Entreprises" },
  my_reviews: { en: "My Reviews", fr: "Mes Avis" },
  manage: { en: "Modify Info", fr: "Modifier" },
  send_enquiry: { en: "Ask the Boss", fr: "Demander" },
  featured_listings: { en: "Top Choices", fr: "Choix Vedettes" },
  recent_reviews: { en: "Latest Reviews", fr: "Derniers Avis" },
  hub_store: { en: "Market", fr: "Marché" },
  browse_services: { en: "Buy Things", fr: "Services" },
  visit_hub: { en: "Visit Business", fr: "Visiter" }
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