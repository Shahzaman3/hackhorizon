import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const CheckIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );

  const plans = [
    {
      name: 'Starter',
      desc: 'Perfect for small businesses trying out B2B invoicing',
      monthlyPrice: '₹0',
      yearlyPrice: '₹0',
      cta: 'Get Started Free',
      ctaLink: '/register',
      featured: false,
      features: ['Up to 50 invoices/month', '1 seller account', '1 buyer account', 'Basic GST summary', 'Email support']
    },
    {
      name: 'Growth',
      desc: 'For growing businesses with regular B2B transactions',
      monthlyPrice: '₹1,499',
      yearlyPrice: '₹1,199',
      cta: 'Start Free Trial',
      ctaLink: '/register',
      featured: true,
      features: ['Unlimited invoices', '5 seller accounts', 'Unlimited buyer accounts', 'Full GST dashboard & charts', 'Invoice request feature', 'Payment tracking', 'Priority support']
    },
    {
      name: 'Enterprise',
      desc: 'For large organizations with complex invoice workflows',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      cta: 'Contact Sales',
      ctaLink: '/register',
      featured: false,
      features: ['Everything in Growth', 'Dedicated account manager', 'Custom GSTIN configurations', 'API access', 'SSO and team management', 'SLA guarantee']
    }
  ];

  return (
    <section id="pricing" className="bg-[#FDFBF7] py-28 px-6 md:px-10 relative overflow-hidden">
      {/* top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#047857]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <h2
            className="text-[clamp(1.8rem,4vw,2.75rem)] font-extrabold text-[#0A2518] leading-tight mb-4"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Pay for what you use
          </h2>
          <p className="text-[#4D6357] text-base max-w-md mx-auto leading-relaxed mb-10">
            No hidden fees. No setup costs. Start free and scale as your business grows.
          </p>

          {/* Toggle */}
          <div className="inline-flex bg-[#FFFFFF] rounded-full p-1 border border-[#E5E2D9]">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                !isYearly
                  ? 'bg-[#047857] text-[#FDFBF7] shadow-lg shadow-[#047857]/25'
                  : 'text-[#4D6357] hover:text-[#0A2518]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                isYearly
                  ? 'bg-[#047857] text-[#FDFBF7] shadow-lg shadow-[#047857]/25'
                  : 'text-[#4D6357] hover:text-[#0A2518]'
              }`}
            >
              Yearly
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border leading-none transition-colors duration-300 ${
                isYearly 
                  ? 'bg-[#FDFBF7]/20 text-[#FDFBF7] border-[#FDFBF7]/30' 
                  : 'bg-[#047857]/10 text-[#047857] border-[#047857]/20'
              }`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 border transition-all duration-300 ${
                plan.featured
                  ? 'bg-[#FFFFFF] border-[#047857]/40 shadow-2xl shadow-[#047857]/10 md:scale-[1.04] z-10'
                  : 'bg-[#FFFFFF] border-[#E5E2D9] hover:border-[#D1CFC2]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#047857] text-[#FDFBF7] text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-[#047857]/30 whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <h3 className="font-bold text-xl text-[#0A2518] mb-1 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {plan.name}
              </h3>
              <p className="text-xs text-[#4D6357] leading-relaxed min-h-[36px] mb-6 text-center">{plan.desc}</p>

              <div className="flex items-end justify-center gap-1 mb-8">
                <span
                  className="text-[2.75rem] font-extrabold text-[#0A2518] leading-none tracking-tight"
                  style={{ fontFamily: 'Plus Jakarta Sans' }}
                >
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {plan.monthlyPrice !== 'Custom' && (
                  <span className="text-sm text-[#4D6357] mb-1">/month</span>
                )}
              </div>

              <Link
                to={plan.ctaLink}
                className={`w-full text-center block rounded-xl py-3.5 text-sm font-bold transition-all duration-300 mb-8 ${
                  plan.featured
                    ? 'bg-[#047857] text-[#FDFBF7] hover:bg-[#065F46] shadow-lg shadow-[#047857]/25 hover:shadow-[#047857]/40'
                    : 'bg-[#F4F1EA] text-[#0A2518] border border-[#D1CFC2] hover:border-[#047857]/30 hover:bg-[#E5E2D9]'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                {plan.cta}
              </Link>

              <div className="flex flex-col items-center gap-3.5">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex gap-2 text-sm items-center text-center">
                    <CheckIcon />
                    <span className={plan.featured ? 'text-[#0A2518]' : 'text-[#4D6357]'}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-[#728279] font-semibold tracking-wide">
          All plans include a 14-day free trial. No credit card required.
        </div>
      </div>
    </section>
  );
}
