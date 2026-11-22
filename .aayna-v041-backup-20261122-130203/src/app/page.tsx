"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import styles from "./home-hero.module.css";

const HEADLINES = [
  "Make time for what makes you feel good.",
  "A little care can change your day.",
  "Your style. Your moment. Your choice.",
  "Find the care that feels right for you.",
] as const;

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) {
        setPlaying(false);
        videoRef.current?.pause();
      }
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const interval = window.setInterval(() => setActive((value) => (value + 1) % HEADLINES.length), 6000);
    return () => window.clearInterval(interval);
  }, [playing, reducedMotion]);

  const toggleMotion = () => {
    if (playing) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      void videoRef.current?.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <section className={styles.hero} aria-label="Discover salon services">
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=80"
        aria-hidden="true"
      >
        <source src="/videos/aayna-hero.mp4" type="video/mp4" />
      </video>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.content}>
        <h1 className={styles.headline} key={active}>{HEADLINES[active]}</h1>
        <p className={styles.description}>
          Discover salon services, explore your options, and book your next appointment with confidence.
        </p>
        <Link className={styles.cta} href="/services">
          Explore Salon Services <ArrowUpRight size={19} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.controls} aria-label="Hero motion controls">
        <span className={styles.counter}>{String(active + 1).padStart(2, "0")} / {String(HEADLINES.length).padStart(2, "0")}</span>
        <div className={styles.progress} aria-label="Select a headline">
          {HEADLINES.map((headline, index) => (
            <button
              key={headline}
              type="button"
              className={`${styles.segment} ${index === active ? styles.selected : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Show headline ${index + 1}`}
              aria-current={index === active ? "step" : undefined}
            />
          ))}
        </div>
        <button className={styles.motionButton} type="button" onClick={toggleMotion} aria-label={playing ? "Pause background motion and headline rotation" : "Play background motion and headline rotation"}>
          {playing ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
