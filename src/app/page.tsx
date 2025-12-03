import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Workflow,
} from 'lucide-react';

const featureCards = [
  {
    title: 'Neon Evidence Hub',
    description: 'Cloud-synced gallery with realtime updates and zero-loss optimization.',
    icon: Camera,
    accent: 'glow-cyan',
  },
  {
    title: 'Adaptive Filters',
    description: 'Layer store, date, ISO-week, and tag logic to surface proof instantly.',
    icon: LayoutGrid,
    accent: 'glow-magenta',
  },
  {
    title: 'Admin Flightdeck',
    description: 'Protected dashboard with drag & drop uploads, metadata, and bulk actions.',
    icon: ShieldCheck,
    accent: 'glow-purple',
  },
];

const timeline = [
  {
    label: 'Phase 4',
    title: 'Admin & Auth',
    detail: 'NextAuth-powered access gates every control room in the stack.',
  },
  {
    label: 'Phase 5',
    title: 'Image Intelligence',
    detail: 'Vercel Blob uploads + JSON metadata keep assets versioned and fast.',
  },
  {
    label: 'Phase 6',
    title: 'Polish & Motion',
    detail: 'Filter stress-tests, animations, and final walkthrough documentation.',
  },
] as const;

const asciiArt = [
  ' /\\__/\\    PROOF KEEPER',
  '(  0.0 )   STATUS: ONLINE',
  ' > ^  <    LOGGING: TRUE',
] as const;

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-16 md:px-8 site-grid pixel-hero">
      <div className="max-w-6xl mx-auto space-y-16">
        <section className="grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="pixel-chip">
              <Sparkles size={14} />
              PROJECT PROOFY v4.2
            </span>
            <div>
              <h1 className="text-4xl md:text-5xl pixel-heading text-glow-cyan leading-relaxed">
                Retro Pixel
                <span className="text-glow-magenta block mt-2">
                  Cyberpunk Photo Ops
                </span>
              </h1>
              <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed">
                A cloud-native gallery for visual proofing. Upload from the admin flightdeck,
                enrich with metadata, and let the neon interface guide teams through every
                store, date, and week.
              </p>
              <div className="pixel-divider" />
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--text-muted)]">
                PIXEL ENGINE // ALWAYS RECORDING
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="pixel-card glow-cyan py-6">
                <p className="text-3xl font-['Press_Start_2P']">500+</p>
                <p className="text-xs tracking-[0.2em]">IMAGES</p>
              </div>
              <div className="pixel-card glow-magenta py-6">
                <p className="text-3xl font-['Press_Start_2P']">12</p>
                <p className="text-xs tracking-[0.2em]">STORES</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/gallery" className="pixel-btn pixel-btn-cyan flex items-center justify-center gap-3 text-sm">
                BROWSE GALLERY
                <ArrowRight size={16} />
              </Link>
              <Link href="/admin" className="pixel-btn pixel-btn-magenta flex items-center justify-center gap-3 text-sm">
                ADMIN ACCESS
                <ShieldCheck size={16} />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="pixel-ascii">
              {asciiArt.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
            <div className="section-card space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[var(--text-muted)] font-['VT323'] text-lg">LIVE STATUS</p>
                <span className="text-[var(--neon-green)] font-['Press_Start_2P'] text-xs">ONLINE</span>
              </div>
              <div className="timeline-line">
                {timeline.map((step) => (
                  <div key={step.label} className="timeline-step">
                    <p className="text-[var(--neon-magenta)] font-['Press_Start_2P'] text-xs">{step.label}</p>
                    <h3 className="text-xl mt-1 text-glow-magenta">{step.title}</h3>
                    <p className="text-[var(--text-secondary)] text-base mt-2">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon, accent }) => (
            <div key={title} className={`pixel-card ${accent} p-6 space-y-4`}>
              <Icon size={32} className="text-[var(--neon-cyan)]" />
              <h3 className="text-lg font-['Press_Start_2P']">{title}</h3>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">{description}</p>
            </div>
          ))}
        </section>

        <section className="pixel-card glow-green p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[var(--text-muted)] font-['VT323'] text-xl">
                SYNCHRONIZE YOUR EVIDENCE
              </p>
              <h2 className="text-3xl text-glow-green font-['Press_Start_2P'] leading-relaxed mt-3">
                Launch the Neon Workflow
              </h2>
              <p className="text-[var(--text-secondary)] mt-4">
                Upload proof, tag it, and watch the system calculate ISO weeks, tag overlays,
                and store indexes automatically. Proofy keeps teams aligned.
              </p>
            </div>
            <Link href="/gallery" className="pixel-btn pixel-btn-green flex items-center justify-center gap-3 text-sm">
              ENTER ARCHIVE
              <Workflow size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
