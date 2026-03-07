"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Globe,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Loader2,
  ChevronRight,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === "admin" ? "/admin/users" : "/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-strong border-b border-white/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden glass p-1">
              <Image
                src="/logo.png"
                alt="SMM Panel"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-slate-900">
              SMM Panel
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-green-600 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-green-600 transition-colors font-medium">
              How It Works
            </a>
            <a href="#platforms" className="text-slate-600 hover:text-green-600 transition-colors font-medium">
              Platforms
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl text-slate-700 font-semibold glass hover:bg-white/70 transition-all duration-200"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-300/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full">
                <Zap size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-slate-700">
                  #1 SMM Reseller Platform
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Grow Your{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-700">
                  Social Media
                </span>{" "}
                Presence
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                The most affordable and reliable SMM panel for resellers.
                Boost your social media services with instant delivery,
                real engagement, and 24/7 support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-green-500 to-green-600 text-white font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
                >
                  Start Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-slate-700 glass hover:bg-white/70 transition-all duration-200"
                >
                  Learn More
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4">
                {[
                  { value: "10K+", label: "Orders" },
                  { value: "500+", label: "Clients" },
                  { value: "99.9%", label: "Uptime" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="glass-strong rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl overflow-hidden glass-subtle p-2">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Dashboard Preview</p>
                    <p className="text-sm text-green-600 font-medium">Live Panel</p>
                  </div>
                </div>

                {[
                  { icon: TrendingUp, label: "Orders Today", value: "1,247", color: "text-green-600" },
                  { icon: Users, label: "Active Users", value: "583", color: "text-blue-600" },
                  { icon: BarChart3, label: "Success Rate", value: "99.8%", color: "text-green-600" },
                ].map((item) => (
                  <div key={item.label} className="glass-subtle rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="glass p-2.5 rounded-xl">
                        <item.icon size={20} className={item.color} />
                      </div>
                      <span className="font-medium text-slate-700">{item.label}</span>
                    </div>
                    <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                  </div>
                ))}

                <div className="glass-subtle rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-slate-600">Weekly Growth</span>
                    <span className="text-sm font-bold text-green-600">+24%</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 55, 35, 65, 50, 80, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-linear-to-t from-green-500 to-green-400 transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
              <ShieldCheck size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-slate-700">Why Choose Us</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-700">
                Succeed
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform offers the most comprehensive set of tools for SMM resellers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Delivery",
                desc: "Orders start processing within seconds. Get real-time status updates and fast turnaround times.",
              },
              {
                icon: ShieldCheck,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security with 99.9% uptime guarantee. Your data and orders are always protected.",
              },
              {
                icon: TrendingUp,
                title: "Best Prices",
                desc: "Competitive wholesale pricing with volume discounts. Maximize your profit margins on every order.",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                desc: "Support for all major social media platforms worldwide. Reach audiences across every region.",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                desc: "Track your orders, spending, and growth with comprehensive reports and CSV exports.",
              },
              {
                icon: Users,
                title: "Reseller Friendly",
                desc: "Built specifically for resellers with bulk ordering, API access, and dedicated support.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-strong rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300 group">
                <div className="glass-subtle w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:glass transition-all duration-300">
                  <feature.icon size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Get Started in{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-700">
                3 Easy Steps
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our streamlined process makes it easy to start growing right away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up in seconds and get access to your personal dashboard with all available services.",
              },
              {
                step: "02",
                title: "Add Funds",
                desc: "Top up your coin balance using our secure payment system. Flexible amounts for any budget.",
              },
              {
                step: "03",
                title: "Place Orders",
                desc: "Choose your service, enter the details, and watch your social media presence grow instantly.",
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="glass-strong rounded-3xl p-8 text-center relative z-10">
                  <div className="glass-subtle w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-700">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-20">
                    <ChevronRight size={32} className="text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Supported{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-700">
                Platforms
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We support all major social media platforms with a wide range of services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Instagram, name: "Instagram", color: "text-pink-600" },
              { icon: Youtube, name: "YouTube", color: "text-red-600" },
              { icon: Twitter, name: "Twitter / X", color: "text-slate-800" },
              { icon: Facebook, name: "Facebook", color: "text-blue-600" },
            ].map((platform) => (
              <div
                key={platform.name}
                className="glass-strong rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300"
              >
                <div className="glass-subtle w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <platform.icon size={32} className={platform.color} />
                </div>
                <p className="font-bold text-slate-900">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-900 to-slate-950 p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-green-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white">
                Ready to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-green-500">
                  Get Started?
                </span>
              </h2>
              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                Join hundreds of resellers already growing their business with our platform.
                Start placing orders in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-green-500 to-green-600 text-white font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
                >
                  Create Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-700 text-white font-bold text-lg hover:border-green-500/50 hover:bg-slate-800 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-slate-900">
                Built for{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-700">
                  Resellers
                </span>
              </h2>
              <p className="text-lg text-slate-600">
                Everything you need to run a successful SMM reselling business, all in one dashboard.
              </p>
              {[
                "Real-time order tracking and status updates",
                "Detailed financial reports with CSV export",
                "Automatic order processing and delivery",
                "Coin-based balance system for easy accounting",
                "Multi-platform support with competitive pricing",
                "Dedicated admin panel for full control",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="glass p-1.5 rounded-lg shrink-0">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="glass-strong rounded-3xl p-8 space-y-4">
              {[
                { label: "Instagram Followers", price: "Starting at $0.50" },
                { label: "YouTube Views", price: "Starting at $0.30" },
                { label: "Twitter Likes", price: "Starting at $0.20" },
                { label: "Facebook Page Likes", price: "Starting at $0.40" },
                { label: "TikTok Followers", price: "Starting at $0.35" },
              ].map((service) => (
                <div key={service.label} className="glass-subtle rounded-2xl p-4 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{service.label}</span>
                  <span className="text-green-600 font-bold text-sm">{service.price}</span>
                </div>
              ))}
              <Link
                href="/login"
                className="block text-center py-3 rounded-xl bg-linear-to-r from-green-500 to-green-600 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200"
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/50 py-12 px-6 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="SMM Panel"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-slate-900">SMM Panel</span>
              <span className="text-slate-400">|</span>
              <span className="text-sm text-slate-500">Reseller Platform</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 hover:text-green-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-green-600 transition-colors">
                How It Works
              </a>
              <a href="#platforms" className="text-sm text-slate-600 hover:text-green-600 transition-colors">
                Platforms
              </a>
              <Link href="/login" className="text-sm text-slate-600 hover:text-green-600 transition-colors">
                Login
              </Link>
            </div>

            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} SMM Panel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
