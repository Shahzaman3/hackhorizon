import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';

const plans = [
    {
        name: 'Starter',
        price: { monthly: '₹999', yearly: '₹799' },
        desc: 'Perfect for freelancers and small teams getting started.',
        features: ['Up to 50 invoices/month', '2 team members', 'GST computation', 'PDF export', 'Email support'],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Growth',
        price: { monthly: '₹2,499', yearly: '₹1,999' },
        desc: 'For growing businesses that need collaboration tools.',
        features: ['Unlimited invoices', '10 team members', 'Buyer collaboration portal', 'Payment integrations', 'Analytics dashboard', 'Priority support'],
        cta: 'Start Free Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: { monthly: 'Custom', yearly: 'Custom' },
        desc: 'Tailored solutions for large companies and enterprises.',
        features: ['Unlimited everything', 'Custom roles & permissions', 'Tally / SAP integration', 'Dedicated account manager', 'SLA guarantee', 'SSO & audit logs'],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function Pricing() {
    const [yearly, setYearly] = useState(false);
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-24 bg-bg">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                        Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Simple, transparent pricing
                    </h2>
                    <p className="text-secondary text-lg max-w-md mx-auto mb-8">
                        No hidden fees. Pay as you grow.
                    </p>
                    {/* Toggle */}
                    <div className="inline-flex items-center gap-3 bg-white/60 border border-card rounded-xl p-1">
                        <button onClick={() => setYearly(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!yearly ? 'bg-dark text-white shadow-md' : 'text-secondary hover:text-dark'}`}>
                            Monthly
                        </button>
                        <button onClick={() => setYearly(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${yearly ? 'bg-dark text-white shadow-md' : 'text-secondary hover:text-dark'}`}>
                            Yearly
                            <span className="ml-1.5 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">−20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${plan.popular
                                    ? 'bg-dark text-white border-2 border-primary shadow-2xl shadow-primary/20 scale-105'
                                    : 'bg-white/70 border border-card/60 text-dark hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{plan.name}</h3>
                                <p className={`text-sm mb-4 ${plan.popular ? 'text-white/50' : 'text-secondary'}`}>{plan.desc}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                                        {yearly ? plan.price.yearly : plan.price.monthly}
                                    </span>
                                    {plan.price.monthly !== 'Custom' && (
                                        <span className={`text-sm ${plan.popular ? 'text-white/40' : 'text-secondary'}`}>/mo</span>
                                    )}
                                </div>
                            </div>

                            <ul className="flex-1 flex flex-col gap-3 mb-7">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`mt-0.5 flex-shrink-0 ${plan.popular ? 'text-card' : 'text-primary'}`}>
                                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-secondary'}`}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.popular ? 'primary' : 'outline'}
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
