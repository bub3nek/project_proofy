"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  DatabaseZap,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Workflow,
} from 'lucide-react';

const signalPills = ['Auto Tagging Online', 'Blob Sync Stable', 'ISO Weeks Locked', 'Admin Shield'];

const neonTicker = [
  'Neon bus connected',
  'Responsive gallery calibrated',
  'Metadata grid refreshed',
  'AI tagging pass complete',
  'Blob replication nominal',
  'NextAuth shield armed',
] as const;

const dataHighlights = [
  { label: 'Assets synced', value: '872', detail: '+42 this week', accent: 'text-glow-cyan' },
  { label: 'Stores patrolled', value: '19', detail: 'Global coverage', accent: 'text-glow-magenta' },
  { label: 'Avg upload', value: '2.4 s', detail: 'Blob ➜ Gallery', accent: 'text-glow-green' },
  { label: 'AI tags issued', value: '14k', detail: 'Context-aware', accent: 'text-glow-purple' },
] as const;

const systems = [
  {
    title: 'Hyper Upload Bay',
    description: 'Drag & drop queue with metadata enforcement, ISO-week math, previews, and multi-file orchestration.',
    icon: UploadCloud,
    accent: 'glow-cyan',
  },
  {
    title: 'Holo Archive',
    description: 'Responsive masonry gallery backed by `ResponsiveImage`, lightbox views, and adaptive filtering chips.',
    icon: LayoutGrid,
    accent: 'glow-purple',
  },
  {
    title: 'Sentinel Admin',
    description: 'NextAuth credentials, middleware-guarded routes, and dashboards for uploads, edits, and bulk ops.',
    icon: ShieldCheck,
    accent: 'glow-magenta',
  },
  {
    title: 'Signal Intelligence',
    description: 'Auto-tagging heuristics, ISO-week calculations, and vitest-backed utilities for reliable metadata.',
    icon: Sparkles,
    accent: 'glow-green',
  },
  {
    title: 'Ops Telemetry',
    description: 'Vercel Blob uploads, JSON/Postgres storage adapters, and cleanup hooks keep storage deterministic.',
    icon: DatabaseZap,
    accent: 'glow-cyan',
  },
  {
    title: 'Workflow API',
    description: 'REST endpoints for uploads, CRUD metadata, and store registries – ready for automation hooks.',
    icon: Activity,
    accent: 'glow-pink',
  },
] as const;

const missionPhases = [
  {
    label: 'Phase 4',
    title: 'Admin & Auth',
    detail: 'Credentialed pilots enter the flightdeck through NextAuth with JWT sessions and middleware shields.',
  },
  {
    label: 'Phase 5',
    title: 'Image Intelligence',
    detail: 'Blob uploads, JSON/Postgres storage, and smart tagging keep every asset contextual and queryable.',
  },
  {
    label: 'Phase 6',
    title: 'Polish & Motion',
    detail: 'Filters, tests, micro-animations, and walkthrough docs finalize the neon experience.',
  },
] as const;

const asciiArt = [
  ' /==\\\\    PROOFY CORE',
  '|  o )   STATUS: STABLE',
  ' \\__/    LOGGING: TRUE',
] as const;

export default function Home() {
  return (
    <main className="immersive-bg min-h-screen px-4 py-16 md:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <section className="relative hero-grid">
          <div className="orb -top-8 left-6" />
          <div className="orb bottom-0 right-12" />

          <motion.div
            className="holo-card p-8 space-y-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="interactive-pill text-[var(--neon-cyan)]">
              <Sparkles size={14} />
              PROJECT PROOFY v5
            </span>
            <div className="space-y-4">
              <motion.h1
                className="text-4xl md:text-5xl pixel-heading text-glow-cyan leading-tight"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Proofy Control Nexus
                <span className="block text-glow-magenta text-2xl mt-3">
                  Retro Pixel Intelligence Grid
                </span>
              </motion.h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Capture, annotate, and broadcast proof. The neon console routes uploads into Vercel Blob, enriches
                metadata automatically, and renders it in a responsive cyberpunk archive.
              </p>
            </div>

            <div className="signal-rail">
              {signalPills.map((signal) => (
                <motion.span key={signal} whileHover={{ scale: 1.05 }} className="interactive-pill text-[var(--text-muted)]">
                  {signal}
                </motion.span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/gallery"
                className="pixel-btn pixel-btn-cyan flex items-center justify-center gap-3 text-sm hover:scale-105 transition"
              >
                Browse Gallery
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/admin"
                className="pixel-btn pixel-btn-magenta flex items-center justify-center gap-3 text-sm hover:scale-105 transition"
              >
                Admin Access
                <ShieldCheck size={16} />
              </Link>
            </div>

            <div className="data-grid">
              {dataHighlights.map(({ label, value, detail, accent }) => (
                <motion.div key={label} className="pixel-card p-4 space-y-2" whileHover={{ scale: 1.02 }}>
                  <p className={`text-3xl ${accent}`}>{value}</p>
                  <p className="text-xs tracking-[0.4em] text-[var(--text-muted)] uppercase">{label}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="holo-card p-6 space-y-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[var(--text-muted)] font-['VT323'] text-xl">Live Telemetry</p>
              <span className="text-[var(--neon-green)] font-['VT323'] text-lg">ONLINE</span>
            </div>
            <div className="pixel-ascii">
              {asciiArt.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <div className="neon-marquee rounded-sm">
              <div className="neon-marquee__track">
                {[...neonTicker, ...neonTicker].map((message, index) => (
                  <span key={`${message}-${index}`} className="interactive-pill text-[var(--neon-yellow)]">
                    {message}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {missionPhases.map((phase) => (
                <div key={phase.label} className="flex gap-4">
                  <div className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)]">{phase.label}</div>
                  <div>
                    <h3 className="text-lg text-glow-magenta">{phase.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-1 leading-relaxed">{phase.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {systems.map(({ title, description, icon: Icon, accent }) => (
            <motion.div
              key={title}
              className={`holo-card pixel-card ${accent} p-6 space-y-4`}
              whileHover={{ y: -6, rotate: -0.5 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Icon size={32} className="text-[var(--neon-cyan)]" />
              <h3 className="text-xl">{title}</h3>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </section>

        <motion.section
          className="holo-card pixel-card glow-green p-8 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <p className="text-[var(--text-muted)] font-['VT323'] text-xl">Synchronize Your Evidence</p>
              <h2 className="text-3xl text-glow-green leading-relaxed">
                Launch the Neon Workflow
              </h2>
              <p className="text-[var(--text-secondary)]">
                Upload proof, enrich metadata, and let Proofy auto-calculate ISO weeks, store indexes, and AI tags before your team even opens the gallery.
              </p>
            </div>
            <Link href="/gallery" className="pixel-btn pixel-btn-green flex items-center justify-center gap-3 text-sm">
              Enter Archive
              <Workflow size={16} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
