const testimonialsData = [
  { name: "Arjun Mehta",     role: "CFO",               company: "Mehta Textiles",  text: "We used to spend 3 days every month reconciling invoices. With InvoiceSync, buyers confirm the same day. Our DSO dropped by 40%.", rating: 5, initials: "AM" },
  { name: "Priya Nair",      role: "Accounts Head",      company: "Nair Pharma",     text: "The GST breakdown dashboard alone saved us 8 hours per month. CGST and SGST are auto-calculated and always accurate.", rating: 5, initials: "PN" },
  { name: "Rohit Sharma",    role: "Founder",            company: "RS Traders",      text: "Chasing buyers for invoice confirmation was a nightmare. Now they get notified, they click accept, we get paid. Simple.", rating: 5, initials: "RS" },
  { name: "Sneha Kulkarni",  role: "Operations Lead",    company: "SKL Exports",     text: "The status tracking feature is incredible. Every team member can see exactly where an invoice stands without asking anyone.", rating: 4, initials: "SK" },
  { name: "Vikram Joshi",    role: "Director",           company: "Joshi Industrial",text: "We handle 500+ invoices a month. InvoiceSync's buyer dashboard makes validation 10x faster. Worth every rupee.", rating: 5, initials: "VJ" },
  { name: "Meera Patel",     role: "Finance Manager",    company: "Patel Goods",     text: "The missing invoice request feature is a gem. No more emails. Buyer clicks request, we upload, done.", rating: 5, initials: "MP" }
];

const mobileTestimonials = [...testimonialsData, ...testimonialsData];

const avatarColors = ['#166534', '#14532d', '#15803d', '#16a34a', '#047857', '#065F46'];

export default function Testimonials() {
  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < rating ? 'text-[#047857]' : 'text-[#E5E2D9]'}`}>★</span>
      ))}
    </div>
  );

  const TestimonialCard = ({ t, idx, isMobile }) => (
    <div className={`break-inside-avoid bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 hover:border-[#D1CFC2] transition-all duration-300 group ${
      isMobile ? 'inline-block w-[300px] whitespace-normal flex-shrink-0' : 'mb-5 w-full'
    }`}>
      {/* Stars */}
      <div className="mb-4">{renderStars(t.rating)}</div>

      {/* Quote */}
      <p className="text-[#4D6357] text-sm leading-relaxed group-hover:text-[#0A2518] transition-colors duration-300 mb-6">
        "{t.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#E5E2D9]">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#0A2518]"
          style={{ backgroundColor: avatarColors[idx % avatarColors.length], fontFamily: 'Plus Jakarta Sans' }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{t.name}</div>
          <div className="text-[11px] text-[#728279] font-medium">{t.role}, {t.company}</div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="testimonials" className="bg-[#FDFBF7] py-28 px-0 md:px-10 overflow-hidden relative">
      {/* bg glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#047857]/4 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16 px-6 max-w-2xl mx-auto flex flex-col items-center relative">
        <h2
          className="text-[clamp(1.8rem,4vw,2.75rem)] font-extrabold text-[#0A2518] leading-tight mb-4"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          Real businesses. Real results.
        </h2>
        <p className="text-[#4D6357] text-base leading-relaxed">
          Thousands of Indian businesses use InvoiceSync to close their invoice cycles faster.
        </p>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Desktop masonry */}
        <div className="hidden md:block w-full px-6">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
            {testimonialsData.map((t, i) => (
              <TestimonialCard key={`desktop-${i}`} t={t} idx={i} isMobile={false} />
            ))}
          </div>
        </div>

        {/* Mobile horizontal scroll */}
        <div className="block md:hidden relative w-full overflow-hidden group px-4">
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10" />
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10" />
          <div
            className="flex w-max gap-4 group-hover:[animation-play-state:paused]"
            style={{ animation: 'scrollLeftMobile 30s linear infinite' }}
          >
            {mobileTestimonials.map((t, i) => (
              <TestimonialCard key={`mobile-${i}`} t={t} idx={i} isMobile={true} />
            ))}
          </div>
        </div>
      </div>

      {/* Rating footer */}
      <div className="mt-20 text-center flex flex-col items-center px-6 relative">
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-[#047857] text-2xl">★</span>
          ))}
        </div>
        <div className="text-2xl font-bold text-[#0A2518] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          4.9/5 average rating
        </div>
        <div className="text-sm text-[#4D6357]">From 2,000+ verified Indian businesses</div>
      </div>

      <style>{`
        @keyframes scrollLeftMobile {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
