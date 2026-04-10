import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Marquee from '../components/landing/Marquee';
import DashboardPreview from '../components/landing/DashboardPreview';
import Features from '../components/landing/Features';
import WhyUs from '../components/landing/WhyUs';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';

export default function Landing() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <Marquee />
            <DashboardPreview />
            <Features />
            <WhyUs />
            <Pricing />
            <Testimonials />
            <Footer />
        </div>
    );
}
