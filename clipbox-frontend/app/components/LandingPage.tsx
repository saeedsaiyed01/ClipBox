"use client";

import Arrowright from "@/components/icons/arrow-right";
import { Circle, Download, ExternalLink, Eye, Monitor, Palette, Play, ZoomIn } from "lucide-react";
import Link from "next/link";
import { useAuthUser } from "../../lib/useAuthUser";
import UserBadge from "./UserBadge";

export default function LandingPage() {
  const { user, loading, signOut } = useAuthUser();

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
      <header className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-black font-bold text-lg font-mono">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">ClipBox</span>
            </div>

            {/* Desktop Nav - "Inspiration" style pill nav */}
            <nav className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                <a href="#features" className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">Features</a>
                <a href="#how-it-works" className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">How it Works</a>
                <a href="/pricing" className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">Pricing</a>
            </nav>

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
                  className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-zinc-900 px-6 font-medium text-zinc-300 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 border border-zinc-800"
                >
                   <span className="mr-2">Login</span>
                   <Arrowright className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-8 hover:bg-amber-500/20 transition-colors cursor-default">
             <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
             v2.0 Now Available
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium mb-8 tracking-tight text-white serif-text">
            Shape your canvas, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
              export polish.
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            ClipBox is the modern studio for content creators. Process videos, apply cinematic styling, and export for any platform in seconds.
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
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/finalll.mp4" type="video/mp4" />
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
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold tracking-tight">ClipBox</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                The modern toolkit for digital creators. Design, edit, and export with style.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><a href="#features" className="hover:text-amber-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">How it Works</a></li>
                <li><a href="/studio" className="hover:text-amber-400 transition-colors">Studio</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6">Resources</h4>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">API Reference</a></li>
                <li><a href="https://github.com" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                  <span>GitHub</span>
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-sm">
            <p>&copy; 2024 ClipBox. All rights reserved.</p>
            <p>Crafted in the dark.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

