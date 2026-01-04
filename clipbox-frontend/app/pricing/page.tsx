"use client";

import Arrowright from "@/components/icons/arrow-right";
import { Check, ChevronDown, Github, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuthUser } from "../../lib/useAuthUser";
import UserBadge from "../components/UserBadge";

export default function PricingPage() {
  const { user, loading, signOut } = useAuthUser();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

 const handleSignIn = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
};


  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out ClipBox",
      features: [
        "3 video uploads per month",
        "720p export quality",
        "Watermark on exports",
        "Basic effects",
        "Community support"
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "For content creators and professionals",
      features: [
        "Unlimited uploads",
        "HD (1080p) exports",
        "No watermark",
        "Basic effects",
        "Custom backgrounds",
        "Real-time preview",
        "Email support"
      ],
      cta: "Start Pro Trial",
      href: "/signup?plan=pro",
      popular: true
    },
    {
      name: "Premium",
      price: "$49",
      period: "/6 months",
      description: "Advanced features for power users",
      features: [
        "Everything in Pro",
        "4K export quality",
        "API access",
        "Custom branding",
        "Priority support",
        "Advanced analytics",
        "Batch processing"
      ],
      cta: "Go Premium",
      href: "/signup?plan=premium",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "What are the free plan limitations?",
      answer: "The free plan includes 3 video uploads per month, 720p export quality, and a watermark on all exports."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
    },
    {
      question: "Do you offer refunds?",
      answer: "No, we do not offer refunds on any plans. Please choose carefully."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-zinc-900 font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">ClipBox</span>
            </Link>

            <div className="flex items-center space-x-4">
              {loading ? (
                <UserBadge user={null} loading variant="compact" />
              ) : user ? (
                <UserBadge
                  user={user}
                  onSignOut={handleSignOut}
                  variant="compact"
                  className="border-amber-400/40"
                />
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <span>Login</span>
                  <Arrowright className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>

          <p className="text-xl text-zinc-400 mb-12 max-w-3xl mx-auto">
            Unlock the full potential of ClipBox with our flexible pricing options.
            Start free and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-zinc-900/50 border rounded-xl p-8 hover:bg-zinc-900/70 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? "border-amber-500/50 ring-2 ring-amber-500/20 shadow-2xl shadow-amber-500/10"
                    : "border-zinc-700/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-500 text-zinc-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-amber-400">{plan.price}</span>
                    <span className="text-zinc-400 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-zinc-400">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-zinc-900 shadow-lg"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 hover:border-zinc-500"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400">Everything you need to know about ClipBox pricing</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-800/70 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 transition-transform duration-200 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-zinc-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-zinc-900 font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold">ClipBox</span>
              </div>
              <p className="text-zinc-400">
                Professional video processing made simple.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                <li><Link href="/studio" className="hover:text-white transition-colors">Studio</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="https://github.com" className="hover:text-white transition-colors flex items-center space-x-1">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 mt-8 pt-8 text-center text-zinc-400">
            <p>&copy; 2024 ClipBox. All rights reserved. Crafted for content creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
