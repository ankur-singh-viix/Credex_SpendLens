import { SpendForm } from "@/components/SpendForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(13,184,150,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(13,184,150,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] z-0">
        <div className="w-full h-full bg-brand-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-surface-3/50 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-brand-400 text-xl">◈</span>
              <span className="font-bold text-lg tracking-tight">
                SpendLens
              </span>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-brand-400 transition-colors"
            >
              Powered by Credex →
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-xs text-brand-400 font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Free audit · No login required · 2 minutes
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5">
            Are you{" "}
            <span className="text-brand-400">overpaying</span>
            <br />
            for AI tools?
          </h1>

          <p className="text-lg text-[#8aada6] max-w-2xl mx-auto mb-10">
            Most teams pay retail for AI subscriptions they barely use. Enter
            what you pay, and we'll show you exactly where the waste is —
            with defensible numbers, not guesswork.
          </p>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] mb-12">
            <span>✦ Average audit finds $380/mo in savings</span>
            <span className="hidden sm:block w-px h-4 bg-surface-4" />
            <span>✦ Used by 1,200+ engineering teams</span>
            <span className="hidden sm:block w-px h-4 bg-surface-4" />
            <span>✦ Pricing verified weekly</span>
          </div>
        </section>

        {/* The form */}
        <section className="max-w-3xl mx-auto px-4 pb-24">
          <SpendForm />
        </section>
      </div>
    </main>
  );
}
