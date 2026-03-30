/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { CategoryScroll } from "@/components/business/CategoryScroll";
import { TownScroll } from "@/components/business/TownScroll";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Enterprise } from "./lib/types";
import { EnterpriseCard } from "@/components/enterprise/EnterpriseCard";
import { EnterpriseCardSkeleton } from "@/components/enterprise/EnterpriseCardSkeleton";
import SearchInput from "@/components/search/SearchInput";

export default function Home() {
  const { t } = useLanguage();
  const db = useFirestore();

  const [isMounted, setIsMounted] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => setIsMounted(true), []);

  // firestore query
  const featuredQuery = useMemoFirebase(
    () => (db ? query(collection(db, "businesses"), limit(100)) : null),
    [db]
  );

  const { data: allRawEnterprises, loading } =
    useCollection<Enterprise>(featuredQuery);

  // ranking
  const topEnterprises = useMemo(() => {
    if (!allRawEnterprises) return [];

    return [...allRawEnterprises]
      .sort((a, b) => {
        const scoreA =
          (a.averageRating || 0) * (a.totalReviews || 0) +
          (a.isVerified ? 10 : 0);

        const scoreB =
          (b.averageRating || 0) * (b.totalReviews || 0) +
          (b.isVerified ? 10 : 0);

        return scoreB - scoreA;
      })
      .slice(0, 20);
  }, [allRawEnterprises]);

  // hero images
  const heroImages = [
    "hero-douala-port",
    "hero-yaounde-admin",
    "hero-douala-business",
    "hero-ngaoundere-plateau",
    "hero-reunification",
  ]
    .map(
      (id) =>
        PlaceHolderImages.find((img) => img.id === id)?.imageUrl || ""
    )
    .filter(Boolean);

  // hero animation
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [heroImages.length, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative h-[520px] sm:h-[650px] overflow-hidden shrink-0">
        <div className="absolute inset-0">
          {heroImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute inset-0 transition-all ease-in-out",
                idx === currentImgIndex
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100"
              )}
              style={{ transitionDuration: "2000ms" }}
            >
              <img
                src={imgUrl}
                className="w-full h-full object-cover"
                alt="Cameroon businesses"
                loading="eager"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center">
          <div className="text-center px-4 w-full max-w-4xl">
            <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter mb-8 drop-shadow-2xl">
              {t("discover_best")}
            </h1>

            <SearchInput />
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="grow container mx-auto px-4 py-16 space-y-24 max-w-7xl">
        <CategoryScroll />

        {/* TOP ENTERPRISES */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-6">
            <h2 className="sm:text-2xl font-black uppercase tracking-tighter leading-none">
              Best Places to Go
            </h2>

            <Link
              href="/search"
              className="text-xs font-black uppercase text-primary hover:underline flex items-center gap-2"
            >
              Show Everything
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <EnterpriseCardSkeleton key={i} />
              ))}

            {!loading &&
              topEnterprises.map((ent) => (
                <EnterpriseCard key={ent.id} enterprise={ent} />
              ))}
          </div>
        </section>

        {/* TOWN SCROLL DESKTOP ONLY */}
        <div className="hidden lg:block">
          <TownScroll />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-secondary py-16 border-t border-[#E5E5E1]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">
            {t("footer_text")}
          </p>
        </div>
      </footer>
    </div>
  );
}