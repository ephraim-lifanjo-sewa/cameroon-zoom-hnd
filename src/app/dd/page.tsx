/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {  Pause, Play, Search } from "lucide-react";

const slides = [
  {
    title: "Go ahead and plant roots",
    cta: "Find landscapers",
    href: "/search?cflt=landscaping",
    business: "Douala garden.",
    photoBy: "Alice Wandji J.",
    img: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
  },
  {
    title: "Find a tune up titan",
    cta: "Find mechanics",
    href: "/search?cflt=autorepair",
    business: "ShowPere Garage",
    photoBy: "kamga A.",
    img: "/img1.png",
  },
  {
    title: "Dimanche Ndole ",
    cta: "Find best bamileke food",
    href: "/search?cflt=restoservices",
    business: "MamaTaro",
    photoBy: "Charly K.",
    img: "./image.png",
  },
  {
    title: "The perfect finger food",
    cta: "Find catering",
    href: "/search?cflt=catering",
    business: "My Catering",
    photoBy: "Atangana T.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  },
];





 {/* setInterval and clearINterval: interval topics for execusions and stop*/}

export default function HeroSlideshow() {
        {/* setInterval and clearINterval: interval topics for execusions and stop*/}

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);{/* % slides.length makes it loop back when reaching the end. */}
    }, 5000);

    return () => clearInterval(interval);
  }, [paused]);



  return (
    <section className="relative w-screen h-[46.1rem] overflow-hidden">


      {/* Slides */}
      <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
           style={{ transform: `translateX(-${active * 100}%)` }}>
        {slides.map((slide, i) => (
          <div key={i} className="shrink-0 w-full h-full relative">
            <img src={slide.img} alt={slide.title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
      </div>

      {/* Header
       */}
   
      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6 text-white">
        <button
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          className="absolute top-24 left-4 p-2 rounded-full bg-white text-black shadow hover:bg-gray-200"
        >
          {paused ? <Play className="w-5 h-5"/> : <Pause className="w-5 h-5"/>}
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">{slides[active].title}</h1>

        <a href={slides[active].href} className="inline-flex items-center gap-2 bg-sky-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-sky700 shadow-lg">
          <Search className="w-5 h-5" />{slides[active].cta}
        </a>

        <div className="absolute bottom-4 right-4 text-sm text-gray-200 bg-black/40 px-3 py-1 rounded">
          <p className="font-semibold">{slides[active].business}</p>
          <p>Photo by <strong>{slides[active].photoBy}</strong></p>
        </div>
      </div>

      {/* Slide Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-3 h-3 rounded-full ${active === i ? "bg-sky-600" : "bg-white/60"}`}
            aria-label={`Select slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
