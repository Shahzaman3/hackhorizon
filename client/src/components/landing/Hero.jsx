import { Link } from 'react-router-dom';
import Marquee from './Marquee';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-center pb-24 px-6 overflow-hidden">

      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-[#047857]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[500px] h-[500px] bg-[#047857]/4 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[1px] h-[40%] bg-gradient-to-b from-[#047857]/20 to-transparent" />
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'linear-gradient(#047857 1px, transparent 1px), linear-gradient(90deg, #047857 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center pt-24 md:pt-28 animate-fade-up">

        {/* Headline */}
        <h1
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-[#0A2518] mb-6"
          style={{ fontFamily: 'Montserrat' }}
        >
          Streamline Your{' '}
          <span className="gradient-text text-glow">Invoice</span>{' '}
          Workflow
        </h1>

        {/* Subheading */}
        <p className="text-[clamp(1rem,2vw,1.2rem)] text-[#4D6357] max-w-2xl mx-auto leading-relaxed mb-10">
          Sellers upload. Buyers verify. Everyone gets paid faster.{' '}
          <br className="hidden sm:block" />
          The smartest B2B invoicing platform built for Indian GST compliance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-6">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#065F46] text-[#FDFBF7] rounded-2xl px-8 py-4 font-bold text-sm transition-all duration-300 shadow-2xl shadow-[#047857]/25 hover:shadow-[#047857]/45 hover:scale-[1.02]"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <button className="flex items-center justify-center gap-2 border border-[#0A2518]/10 bg-[#0A2518]/5 hover:bg-[#0A2518]/10 text-[#0A2518] rounded-2xl px-8 py-4 font-semibold text-sm transition-all duration-300 backdrop-blur-sm">
            <span className="w-7 h-7 rounded-full bg-[#0A2518]/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#0A2518] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4l12 6-12 6V4z" />
              </svg>
            </span>
            Watch Demo
          </button>
        </div>

        {/* Trust note */}
        <p className="text-xs font-medium text-[#728279] tracking-wide">
          No credit card required &nbsp;·&nbsp; Free to start &nbsp;·&nbsp; GST-ready
        </p>

        <div className="mt-10 w-full">
          <Marquee />
        </div>

        <div className="mt-8 w-full">
          <DashboardPreview />
        </div>

      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FDFBF7] to-transparent pointer-events-none" />
    </section>
  );
}
