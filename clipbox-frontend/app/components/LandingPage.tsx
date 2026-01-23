"use client";
import { useEffect, useState } from "react";

import Arrowright from "@/components/icons/arrow-right";
import { Circle, Download, ExternalLink, Eye, Monitor, Palette, Play, ZoomIn } from "lucide-react";
import Link from "next/link";
import { useAuthUser } from "../../lib/useAuthUser";
import UserBadge from "./UserBadge";

export default function LandingPage() {
  const { user, loading, signOut } = useAuthUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = () => {
    window.location.href = "/signup";
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  const primaryCtaHref = user ? "/studio" : "/signup";

  const features = [
    {
      icon: Palette,
      title: "Custom Backgrounds",
      description: "Choose from solid colors, gradients, or upload your own images as video backgrounds"
    },
    {
      icon: Monitor,
      title: "Aspect Ratio Control",
      description: "Perfect formatting for any platform - Instagram, TikTok, YouTube, and more"
    },
    {
      icon: ZoomIn,
      title: "Zoom & Positioning",
      description: "Fine-tune your video placement and scale from 50% to 200% for optimal composition"
    },
    {
      icon: Circle,
      title: "Border Radius Effects",
      description: "Add modern rounded corners and smooth edges for contemporary video aesthetics"
    },
    {
      icon: Eye,
      title: "Real-time Preview",
      description: "See all your changes instantly with our live preview technology"
    },
    {
      icon: Download,
      title: "One-Click Export",
      description: "Download your processed videos in high quality with just one click"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Upload",
      description: "Drag and drop your video file or click to browse"
    },
    {
      step: "02", 
      title: "Customize",
      description: "Adjust backgrounds, aspect ratio, zoom, and border radius"
    },
    {
      step: "03",
      title: "Export",
      description: "Download your professionally transformed video"
    }
  ];





  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 overflow-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      {/* Floating Animated Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-in-out ${scrolled ? "pt-4" : "pt-0 md:pt-6"}`}>
        <header 
          className={`
            relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            flex items-center justify-between
            ${scrolled 
              ? "w-[90%] md:w-[600px] bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" 
              : "w-full max-w-7xl bg-black/20 backdrop-blur-sm border-b border-white/[0.05] py-4 px-4 sm:px-6 lg:px-8"
            }
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
             <img 
               src="/logo-clipbox.png" 
               alt="ClipBox" 
               className="transition-all duration-500 rounded-xl h-10 w-auto"
             />
             <span className={`font-bold tracking-tight text-white transition-all duration-500 ${scrolled ? "text-lg opacity-0 w-0 overflow-hidden" : "text-xl opacity-100"}`}>
               ClipBox
             </span>
          </div>

          {/* Desktop Nav - Centered & Collapsible */}
          <nav className={`hidden md:flex items-center gap-4 transition-all duration-500 ${scrolled ? "rotate-0 opacity-100 translate-x-0" : "translate-y-0"}`}>
              {/* On scroll, we simplify the nav or keep it? The prompt implies a "pill" look. 
                  Let's keep the links simple text in the scrolled state for a clean look. 
              */}
              {[
                { name: 'Features', href: '#features' },
                { name: 'How it Works', href: '#how-it-works' },
                { name: 'Pricing', href: '/pricing' }
              ].map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className={`text-sm font-medium transition-colors hover:text-white ${scrolled ? "text-zinc-400" : "text-zinc-300"}`}
                >
                  {item.name}
                </a>
              ))}
          </nav>

          {/* Auth / Login */}
          <div className="flex items-center gap-2 shrink-0">
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
                className={`
                  group relative inline-flex items-center justify-center overflow-hidden rounded-full 
                  transition-all duration-500 font-medium 
                  bg-[#f5c249] text-black h-10 px-7 text-sm hover:bg-[#eeb12d] shadow-[0_0_20px_-5px_rgba(245,194,73,0.3)]
                  hover:shadow-[0_0_35px_-5px_rgba(245,194,73,0.5)] hover:scale-105 active:scale-95
                `}
              >
                 <span className={`${scrolled ? "mr-0" : "mr-2"} tracking-wide font-bold`}>
                   {scrolled ? "Try now" : "Try now"}
                 </span>
                 <Arrowright className={`transition-transform duration-300 ${scrolled ? "hidden" : "w-3.5 h-3.5 group-hover:translate-x-1"}`} />
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
      

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium mb-8 tracking-tight text-white serif-text mt-20">
            Transform Your Videos with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
              Professional Effects
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            ClipBox makes professional video processing simple. Upload your video, customize backgrounds and styling, and export stunning results - all from your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
            <Link
              href={primaryCtaHref}
              className="group relative inline-flex items-center justify-center gap-2 bg-[#f5c249] text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(245,194,73,0.4)]"
            >
              <span>Start Creating Free</span>
              <ExternalLink className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </Link>

            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-zinc-300 transition-all hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10">
              <Play className="w-5 h-5 fill-current" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Dashboard Mockup Container */}
          <div className="max-w-6xl mx-auto relative group">
            {/* Glow effect behind the dashboard */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl -z-10" />
            
            <div className="relative rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl backdrop-blur-sm overflow-hidden">
               {/* Mock Browser Header */}
               <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                 <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-white/10" />
                   <div className="w-3 h-3 rounded-full bg-white/10" />
                   <div className="w-3 h-3 rounded-full bg-white/10" />
                 </div>
                 <div className="ml-4 px-3 py-1 rounded bg-black/40 text-[10px] text-zinc-500 font-mono w-48 text-center border border-white/5">
                   clipbox.app/studio
                 </div>
               </div>

               {/* Video Content */}
               <div className="aspect-[16/9] w-full bg-zinc-900 relative">
                  <video
                    controls
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/demo-part-2-clipbox.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Overlay gradient for depth */}
                  <div className="absolute inset-0 rounded-b-2xl shadow-inner pointer-events-none border border-white/5" />
               </div>
            </div>

            {/* Reflection/Floor Glow */}
            <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-amber-500/10 via-amber-500/5 to-transparent blur-3xl -z-10 opacity-60" />
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-medium mb-6 serif-text text-white">Power at your fingertips</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Professional-grade tools distilled into a simple, intuitive interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-amber-500/10">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-medium mb-6 serif-text text-white">From raw to polished in steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connecting line for desktop */}
            <div className="absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

            {howItWorks.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#09090b] border border-white/10 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-b from-white/5 to-transparent rounded-full flex items-center justify-center border border-white/5">
                     <span className="text-3xl font-bold text-amber-500 serif-text">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-white">{step.title}</h3>
                <p className="text-zinc-500 max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#050505] relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#050505] to-[#050505]" />
         
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-medium mb-8 serif-text text-white">Ready to create?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of creators who are leveling up their content with ClipBox.
          </p>
          
          <Link 
            href="/studio"
            className="inline-flex items-center gap-2 bg-[#f5c249] text-black px-10 py-5 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_50px_-10px_rgba(245,194,73,0.3)] hover:shadow-[0_0_70px_-10px_rgba(245,194,73,0.5)]"
          >
            <span>Upload Your First Video</span>
            <ExternalLink className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-4 sm:px-6 lg:px-8 bg-[#020202] relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6 group cursor-default">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-black font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">ClipBox</span>
            </div>
            
            {/* Tagline */}
            <p className="text-zinc-500 text-base max-w-md mb-10 leading-relaxed font-light">
              The modern toolkit for digital creators. <br/>
              Design, edit, and export with style.
            </p>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-600 text-sm">
            <p className="font-medium">&copy; {new Date().getFullYear()} ClipBox. All rights reserved.</p>
            <div className="flex items-center gap-6">
               <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
               <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
               <p className="text-zinc-700">Crafted in the dark.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

