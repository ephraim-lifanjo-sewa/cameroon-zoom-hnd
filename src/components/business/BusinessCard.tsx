"use client";

import { Enterprise } from '@/app/lib/types';
import { EnterpriseCard } from '@/components/enterprise/EnterpriseCard';

/**
 * Fallback BusinessCard that redirects to the standard EnterpriseCard
 * Following requested nomenclature change.
 */
interface BusinessCardProps {
  business: Enterprise;
  isHighlighted?: boolean;
}

export function BusinessCard({ business, isHighlighted }: BusinessCardProps) {
  return <EnterpriseCard enterprise={business} isHighlighted={isHighlighted} />;
}
