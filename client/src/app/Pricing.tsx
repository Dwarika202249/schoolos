import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Zap, Globe, MessageSquare } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';

const pricingTiers = [
  {
    name: "Standard Orbit",
    monthly: 0,
    yearly: 0,
    desc: "Perfect for single-branch schools starting their digital journey.",
    features: [
      "Single Branch License",
      "Up to 1,000 Students",
      "Basic Analytics",
      "Community Support",
      "Standard Security",
    ],
    cta: "Join the Orbit",
    popular: false,
    color: "primary"
  },
  {
    name: "Enterprise Nexus",
    monthly: 199,
    yearly: 169,
    desc: "Infinite scalability for school groups and global institutions.",
    features: [
      "Infinite Branch Support",
      "Infinite Student Growth",
      "Custom Whitelabeling",
      "Priority Engineering Support",
      "Advanced API Access",
      "Multi-region data isolation",
    ],
    cta: "Contact Sales",
    popular: true,
    color: "purple"
  }
];

export const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-24 pb-12 text-center px-4 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Radically simple pricing.</h1>
          <p className="mt-4 text-lg text-slate-400 font-medium">No hidden fees, no per-user tax. Just pure, powerful scaling.</p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 pt-8">
          <span className={`text-sm font-bold ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
          <button
            title='toggle'
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-slate-800 rounded-full p-1 relative transition-colors"
          >
            <motion.div
              animate={{ x: isYearly ? 28 : 0 }}
              className="w-5 h-5 bg-primary rounded-full shadow-lg"
            />
          </button>
          <span className={`text-sm font-bold ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly <span className="text-primary text-xs ml-1">(Save 15%)</span></span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {pricingTiers.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`
              relative rounded-3xl p-8 border backdrop-blur-sm transition-all duration-500
              ${tier.popular ? 'bg-gradient-to-b from-primary/10 via-card to-card border-primary/30' : 'bg-card border-white/5'}
            `}
          >
            {tier.popular && (
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-xl">
                Most Popular for Large Schools
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-slate-400 text-sm font-medium">{tier.desc}</p>
            </div>

            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-4xl md:text-6xl font-black tracking-tighter">
                ${isYearly ? tier.yearly : tier.monthly}
              </span>
              <span className="text-slate-500 font-bold">/month</span>
            </div>

            <ul className="space-y-4 mb-10 min-h-[250px]">
              {tier.features.map((f, fi) => (
                <li key={fi} className="flex gap-3 text-sm font-semibold text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary stroke-[4]" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Button size="lg" className={`w-full py-7 rounded-2xl text-lg ${tier.popular ? 'shadow-2xl shadow-primary/20' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-none'}`}>
              {tier.cta}
            </Button>
          </motion.div>
        ))}
      </section>

      {/* FAQ Visual Section */}
      <section className="py-32 bg-black/20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-6 text-left">
            {[
              { q: "Is registration really instant?", a: "Yes. Your institution account and primary branch are created the moment you hit 'Register'. No manual approval required." },
              { q: "Can I upgrade from Orbit to Nexus later?", a: "Seamlessly. Your data never moves; we just lift the institutional constraints on your workspace." },
              { q: "Do you offer NGO/Non-Profit discounts?", a: "Please reach out to our sales team with your proof of non-profit status. We often offer up to 50% discount for community schools." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card/50 border border-white/5">
                <p className="font-bold text-foreground mb-2">{item.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
