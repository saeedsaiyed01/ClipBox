"use client";

import { Circle, Download, ExternalLink, Eye, Github, Monitor, Palette, Play, ZoomIn } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
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

  const techStack = [
    { name: "Next.js", description: "Frontend Framework" },
    { name: "React", description: "UI Library" },
    { name: "TypeScript", description: "Type Safety" },
    { name: "Node.js", description: "Backend Runtime" },
    { name: "FFmpeg", description: "Video Processing" },
    { name: "Redis", description: "Job Management" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-zinc-900 font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">ClipBox</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-zinc-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-zinc-300 hover:text-white transition-colors">How it Works</a>
              <a href="#technology" className="text-zinc-300 hover:text-white transition-colors">Technology</a>
              <a href="https://github.com" className="text-zinc-300 hover:text-white transition-colors flex items-center space-x-1">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </nav>

            <Link 
              href="/studio"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-900 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try ClipBox Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Transform Your Videos with<br />
            <span className="text-amber-400">Professional Effects</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
            ClipBox makes professional video processing simple. Upload your video, customize backgrounds and styling, 
            and export stunning results - all from your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/studio"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
            >
              <span>Start Creating Now</span>
              <ExternalLink className="w-5 h-5" />
            </Link>
            
            <button className="border border-zinc-700 hover:border-zinc-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto text-sm">
            {[
              "✨ Custom backgrounds and gradients",
              "📐 Perfect aspect ratios for any platform", 
              "🔍 Precise zoom and positioning controls",
              "🎭 Modern border radius effects",
              "⚡ Real-time preview and instant export"
            ].map((feature, index) => (
              <div key={index} className="text-zinc-400 flex items-center space-x-2">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Create</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Powerful video processing tools that deliver professional results without the complexity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 hover:bg-zinc-800/70 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-zinc-400">Three simple steps to professional video transformation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-zinc-900">{step.step}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built with Modern Tools</h2>
            <p className="text-xl text-zinc-400">Enterprise-grade technology stack for reliable performance</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center hover:bg-zinc-800/70 transition-colors">
                <h3 className="font-semibold text-amber-400 mb-1">{tech.name}</h3>
                <p className="text-xs text-zinc-400">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Videos?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join thousands of content creators who trust ClipBox for their video processing needs
          </p>
          
          <Link 
            href="/studio"
            className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            <span>Upload Your First Video</span>
            <ExternalLink className="w-5 h-5" />
          </Link>
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
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="/studio" className="hover:text-white transition-colors">Studio</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="https://github.com" className="hover:text-white transition-colors flex items-center space-x-1">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800/50 mt-8 pt-8 text-center text-zinc-400">
            <p>&copy; 2024 ClipBox. All rights reserved. Built with ❤️ for content creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}