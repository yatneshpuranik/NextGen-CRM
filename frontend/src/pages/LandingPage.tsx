import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Users,
  Package,
  FileText,
  BarChart3,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Menu,
  X,
  Database,
  Activity,
  Check,
  TrendingUp,
  LayoutDashboard,
  Layers
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'crm' | 'inventory' | 'challans' | 'analytics'>('crm');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [roiTeamSize, setRoiTeamSize] = useState<number>(15);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const tabsContent = {
    crm: {
      title: '360° Customer Relationship Management',
      subtitle: 'Track leads, organize customer accounts, and build long-term relationships with end-to-end audit trails.',
      features: [
        'Centralized customer database with instant search & filter',
        'Lifecycle tracking from lead to high-value enterprise account',
        'Role-scoped access control (Sales, Admin, Accounts)',
        'Comprehensive engagement history and billing profiles'
      ],
      badge: 'CRM Core Module',
      metric: '35% Boost in Conversion Rate'
    },
    inventory: {
      title: 'Real-Time Multi-Warehouse Inventory',
      subtitle: 'Prevent stockouts, track item movements across locations, and receive automated low-stock warnings.',
      features: [
        'Multi-location warehouse stock balancing & transfers',
        'Automated low-stock alerts & threshold indicators',
        'Batch tracking, SKU pricing & valuation summaries',
        'Direct synchronization with Sales Challan dispatch'
      ],
      badge: 'Inventory & Supply Chain',
      metric: '99.4% Inventory Accuracy'
    },
    challans: {
      title: 'Automated Sales Challans & Invoicing',
      subtitle: 'Create, manage, and dispatch official delivery challans with instant status tracking and PDF generation.',
      features: [
        'One-click delivery challan creation & edit workflow',
        'Draft, Confirmed, Completed, and Cancelled status states',
        'Automatic stock deduction upon challan confirmation',
        'Full customer bill history and dispatch documentation'
      ],
      badge: 'Sales & Logistics',
      metric: '4x Faster Order Fulfillment'
    },
    analytics: {
      title: 'Intelligent Enterprise Analytics & Audit Logs',
      subtitle: 'Gain actionable insights into business performance with interactive charts, audit logs, and email monitoring.',
      features: [
        'Interactive financial metrics and revenue distribution charts',
        'Granular system audit logs capturing every user activity',
        'Intelligent email logs & notification delivery tracking',
        'Automated database backups & zero-downtime recovery'
      ],
      badge: 'Analytics & Compliance',
      metric: '100% Audit Compliance'
    }
  };

  const faqs = [
    {
      q: 'What makes NextGen ERP/CRM different from traditional software?',
      a: 'NextGen combines CRM, multi-warehouse inventory, delivery challans, and system auditability into one seamless modern web application. Built for speed, clarity, and security, it eliminates clunky legacy interfaces.'
    },
    {
      q: 'Can I manage user permissions for different departments?',
      a: 'Yes! NextGen features granular Role-Based Access Control (RBAC) with pre-configured roles like ADMIN, SALES, WAREHOUSE, and ACCOUNTS. Users only see data relevant to their exact operational responsibilities.'
    },
    {
      q: 'How does inventory update when a sales challan is confirmed?',
      a: 'Our smart inventory engine automatically checks warehouse stock upon challan confirmation, updates available item balances in real time, and logs the movement in history.'
    },
    {
      q: 'Is my enterprise data secure and backed up?',
      a: 'Absolutely. NextGen provides full audit logging, enterprise backup & restore utilities, intelligent email delivery tracking, and encrypted credential handling.'
    },
    {
      q: 'Can I test NextGen ERP/CRM before upgrading?',
      a: 'Yes, you can register for a free account instantly to explore the entire interface and test our modules without commitment.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#1a1a18] selection:bg-[#085041] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#085041] to-[#5DCAA5] flex items-center justify-center text-white shadow-md shadow-[#085041]/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-[#1a1a18] leading-tight">
                NextGen <span className="text-[#085041]">ERP & CRM</span>
              </span>
              <span className="text-[10px] tracking-wider font-medium text-[#5f5e5a] uppercase">Enterprise Suite</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5f5e5a]">
            <a href="#features" className="hover:text-[#085041] transition-colors">Features</a>
            <a href="#modules" className="hover:text-[#085041] transition-colors">Modules</a>
            <a href="#calculator" className="hover:text-[#085041] transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-[#085041] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#085041] transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-[#085041] hover:bg-[#04342C] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-[#085041]/15 transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1a1a18] hover:text-[#085041] px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-[#085041] hover:bg-[#04342C] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-[#085041]/15 transition-all hover:scale-[1.02]"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#5f5e5a] hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-black/5 px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              Features
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              Modules
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              ROI Calculator
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              FAQ
            </a>
            <div className="pt-4 border-t border-black/5 flex flex-col gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center bg-[#085041] text-white px-5 py-3 rounded-xl font-medium text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center border border-black/10 text-[#1a1a18] px-5 py-2.5 rounded-xl font-medium text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center bg-[#085041] text-white px-5 py-2.5 rounded-xl font-medium text-sm"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle Decorative Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E1F5EE] via-[#EEEDFE] to-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none opacity-80"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#5DCAA5]/10 rounded-full blur-2xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1F5EE] border border-[#5DCAA5]/40 text-[#085041] text-xs font-semibold tracking-wide mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#0F6E56]" />
            <span>NextGen v2.0 Enterprise Cloud Release</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]"></span>
            <span className="text-[#04342C] underline cursor-pointer">Explore What's New</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1a1a18] max-w-4xl mx-auto leading-[1.15]">
            Unified ERP & CRM built for modern enterprise efficiency.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#5f5e5a] max-w-2xl mx-auto font-normal leading-relaxed">
            Manage customer accounts, multi-warehouse inventory, sales challans, and real-time audit compliance in one beautifully fast workspace.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#085041] hover:bg-[#04342C] text-white px-8 py-4 rounded-xl font-medium text-base shadow-lg shadow-[#085041]/20 transition-all hover:scale-[1.02]"
            >
              {isAuthenticated ? 'Open Enterprise Dashboard' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#modules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-black/10 hover:bg-[#f1f0ea] text-[#1a1a18] px-7 py-4 rounded-xl font-medium text-base transition-colors shadow-sm"
            >
              Explore Live Modules
            </a>
          </div>

          {/* Trust Badges under CTA */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#888780] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" /> Instant Setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" /> Role-Based Security
            </span>
          </div>

          {/* Hero Interactive Dashboard Preview Window */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="rounded-2xl border border-black/10 bg-white shadow-2xl p-3 sm:p-4 transition-all overflow-hidden">
              {/* Fake Window Header Bar */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span className="ml-2 text-xs font-mono text-[#888780]">app.nextgen-crm.com/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#085041] bg-[#E1F5EE] px-2.5 py-0.5 rounded-full">
                    LIVE SYSTEM DEMO
                  </span>
                </div>
              </div>

              {/* Mock Dashboard Body Grid */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                {/* Stat 1 */}
                <div className="p-4 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5]/40 text-[#04342C]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#085041]">Active Accounts</span>
                    <Users className="w-4 h-4 text-[#0F6E56]" />
                  </div>
                  <div className="text-2xl font-medium mt-2">1,482</div>
                  <div className="text-[11px] text-[#085041] mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#0F6E56]" /> +18% this month
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-4 rounded-xl bg-[#EEEDFE] border border-indigo-200 text-[#26215C]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#3C3489]">Active Inventory</span>
                    <Package className="w-4 h-4 text-[#534AB7]" />
                  </div>
                  <div className="text-2xl font-medium mt-2">24,930</div>
                  <div className="text-[11px] text-[#3C3489] mt-1">3 Warehouses Synced</div>
                </div>

                {/* Stat 3 */}
                <div className="p-4 rounded-xl bg-[#FAEEDA] border border-amber-200 text-[#412402]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#633806]">Sales Challans</span>
                    <FileText className="w-4 h-4 text-[#854F0B]" />
                  </div>
                  <div className="text-2xl font-medium mt-2">384</div>
                  <div className="text-[11px] text-[#633806] mt-1">98.5% Delivered</div>
                </div>

                {/* Stat 4 */}
                <div className="p-4 rounded-xl bg-[#FCEBEB] border border-rose-200 text-[#501313]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#791F1F]">System Uptime</span>
                    <Activity className="w-4 h-4 text-[#A32D2D]" />
                  </div>
                  <div className="text-2xl font-medium mt-2">99.99%</div>
                  <div className="text-[11px] text-[#791F1F] mt-1">Zero Downtime</div>
                </div>
              </div>

              {/* Mock Table Preview */}
              <div className="mt-4 border border-black/5 rounded-xl bg-[#f5f4ef]/50 p-4 text-left hidden sm:block">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#1a1a18] uppercase tracking-wider">
                    Recent Enterprise Activity Log
                  </span>
                  <span className="text-xs text-[#5f5e5a]">Updated just now</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-black/5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-medium text-[#1a1a18]">Sales Challan #CH-8942 Confirmed</span>
                      <span className="text-[#888780]">Warehouse North (Mumbai)</span>
                    </div>
                    <span className="font-mono text-[#085041] font-medium">₹1,45,000</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-black/5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="font-medium text-[#1a1a18]">New Enterprise Account Created</span>
                      <span className="text-[#888780]">Acme Logistics Pvt Ltd</span>
                    </div>
                    <span className="text-xs text-[#5f5e5a]">Assigned to Sales Team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <section className="bg-white border-y border-black/5 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-medium text-[#085041]">10,000+</div>
              <div className="text-xs sm:text-sm font-medium text-[#5f5e5a] mt-1">Transactions Processed Daily</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-medium text-[#085041]">5x</div>
              <div className="text-xs sm:text-sm font-medium text-[#5f5e5a] mt-1">Faster Order Fulfillment</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-medium text-[#085041]">99.99%</div>
              <div className="text-xs sm:text-sm font-medium text-[#5f5e5a] mt-1">Guaranteed Cloud Uptime</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-medium text-[#085041]">100%</div>
              <div className="text-xs sm:text-sm font-medium text-[#5f5e5a] mt-1">Audit Trail Visibility</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tabbed Showcase */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
            Core Enterprise Capability
          </span>
          <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18] mt-4">
            Everything your operations team needs in one single platform.
          </h2>
          <p className="text-[#5f5e5a] text-base sm:text-lg mt-3">
            Designed to replace fragmented spreadsheets and legacy ERP systems with a modern, unified experience.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'crm'
                ? 'bg-[#085041] text-white shadow-md shadow-[#085041]/20'
                : 'bg-white text-[#5f5e5a] hover:bg-[#f1f0ea] border border-black/5'
            }`}
          >
            <Users className="w-4 h-4" />
            CRM Accounts
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-[#085041] text-white shadow-md shadow-[#085041]/20'
                : 'bg-white text-[#5f5e5a] hover:bg-[#f1f0ea] border border-black/5'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory & Warehouses
          </button>
          <button
            onClick={() => setActiveTab('challans')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'challans'
                ? 'bg-[#085041] text-white shadow-md shadow-[#085041]/20'
                : 'bg-white text-[#5f5e5a] hover:bg-[#f1f0ea] border border-black/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            Sales Challans
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#085041] text-white shadow-md shadow-[#085041]/20'
                : 'bg-white text-[#5f5e5a] hover:bg-[#f1f0ea] border border-black/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics & Audit
          </button>
        </div>

        {/* Tab Content Display Card */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold text-[#085041] bg-[#E1F5EE] px-3 py-1 rounded-md">
              {tabsContent[activeTab].badge}
            </span>
            <h3 className="text-2xl sm:text-3xl font-medium text-[#1a1a18]">
              {tabsContent[activeTab].title}
            </h3>
            <p className="text-[#5f5e5a] text-base leading-relaxed">
              {tabsContent[activeTab].subtitle}
            </p>

            <ul className="space-y-3 pt-2">
              {tabsContent[activeTab].features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#1a1a18]">
                  <CheckCircle2 className="w-5 h-5 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 bg-[#085041] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#04342C] transition-colors"
              >
                Explore Module <ChevronRight className="w-4 h-4" />
              </Link>
              <span className="text-xs font-medium text-[#085041] bg-[#E1F5EE] px-3 py-2 rounded-lg border border-[#5DCAA5]/30">
                ⚡ Impact: {tabsContent[activeTab].metric}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#f5f4ef] rounded-xl p-6 border border-black/5">
            <div className="bg-white rounded-lg p-5 border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#085041]"></div>
                  <span className="font-medium text-sm text-[#1a1a18]">Live View Preview</span>
                </div>
                <span className="text-xs font-mono text-[#888780]">SYSTEM STATUS: OK</span>
              </div>
              <div className="p-4 rounded-lg bg-[#E1F5EE]/60 border border-[#5DCAA5]/30">
                <span className="text-xs font-semibold text-[#085041]">Active Module Selected</span>
                <p className="text-xs text-[#04342C] mt-1 font-mono">
                  {activeTab.toUpperCase()} ENGINE v2.0 - FAST QUERY COMPLIANT
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Modules Grid */}
      <section id="modules" className="bg-white border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#3C3489] uppercase tracking-widest bg-[#EEEDFE] px-3 py-1 rounded-full">
              Full Suite Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18] mt-4">
              Built for every layer of your business enterprise.
            </h2>
            <p className="text-[#5f5e5a] text-base sm:text-lg mt-3">
              Role-based tools designed specifically for administrators, sales representatives, warehouse managers, and accountants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-black/5 hover:border-[#5DCAA5] transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] text-[#085041] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-[#1a1a18]">Customer CRM</h3>
              <p className="text-sm text-[#5f5e5a] mt-2 leading-relaxed">
                Store, edit, and track customer contact details, tax numbers, billing addresses, and historical sales volume.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-black/5 hover:border-[#5DCAA5] transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-[#EEEDFE] text-[#3C3489] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-[#1a1a18]">Multi-Warehouse Stock</h3>
              <p className="text-sm text-[#5f5e5a] mt-2 leading-relaxed">
                Manage stock across multiple physical warehouses with automated low-stock warnings and minimum threshold triggers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-black/5 hover:border-[#5DCAA5] transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-[#FAEEDA] text-[#633806] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-[#1a1a18]">Sales Delivery Challans</h3>
              <p className="text-sm text-[#5f5e5a] mt-2 leading-relaxed">
                Generate official sales delivery challans with line items, tax calculations, status badges, and dispatch records.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-black/5 hover:border-[#5DCAA5] transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-[#FCEBEB] text-[#791F1F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-[#1a1a18]">Granular RBAC Security</h3>
              <p className="text-sm text-[#5f5e5a] mt-2 leading-relaxed">
                Role-based access guards (ADMIN, SALES, WAREHOUSE, ACCOUNTS) protecting sensitive financial and client records.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-black/5 hover:border-[#5DCAA5] transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-[#EEEDFE] text-[#3C3489] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-[#1a1a18]">Intelligent Email Logs</h3>
              <p className="text-sm text-[#5f5e5a] mt-2 leading-relaxed">
                Monitor system emails, dispatch notifications, and transactional delivery statuses with complete audit logs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-black/5 hover:border-[#5DCAA5] transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-[#1a1a18]">Backup & Recovery</h3>
              <p className="text-sm text-[#5f5e5a] mt-2 leading-relaxed">
                One-click database backups and automated point-in-time snapshot restore utilities to guarantee zero data loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#085041] to-[#04342C] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle orb background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5DCAA5]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold text-[#5DCAA5] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                Interactive Savings Estimator
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium text-white">
                Calculate how much time & money NextGen ERP saves your team.
              </h2>
              <p className="text-white/80 text-base">
                Adjust your team size to estimate monthly operational efficiency gains.
              </p>

              {/* Slider Input */}
              <div className="pt-6 space-y-3">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Number of Operations & Sales Staff:</span>
                  <span className="text-xl font-semibold text-[#5DCAA5]">{roiTeamSize} members</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={roiTeamSize}
                  onChange={(e) => setRoiTeamSize(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#5DCAA5]"
                />
                <div className="flex justify-between text-xs text-white/50">
                  <span>5 Staff</span>
                  <span>50 Staff</span>
                  <span>100 Staff</span>
                </div>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-6">
              <div>
                <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">Estimated Monthly Time Saved</span>
                <div className="text-4xl font-medium text-[#5DCAA5] mt-1">
                  {roiTeamSize * 18} hours/mo
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">Estimated Cost Savings</span>
                <div className="text-3xl font-medium text-white mt-1">
                  ₹{(roiTeamSize * 14500).toLocaleString('en-IN')} / month
                </div>
              </div>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#5DCAA5] hover:bg-[#4ab894] text-[#04342C] font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
              >
                Claim Enterprise Productivity Boost
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
              Simple & Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18] mt-4">
              Flexible plans that scale with your business growth.
            </h2>
            <p className="text-[#5f5e5a] text-base mt-3">
              No hidden fees. Upgrade or downgrade at any time.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-[#1a1a18]' : 'text-[#888780]'}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-8 rounded-full bg-[#085041] p-1 transition-colors relative"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-[#1a1a18]' : 'text-[#888780]'}`}>
                Annual Billing <span className="text-xs font-semibold text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-full ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="p-8 rounded-2xl bg-[#f5f4ef] border border-black/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#1a1a18]">Starter Plan</h3>
                <p className="text-xs text-[#5f5e5a] mt-1">Ideal for small growing teams and startups.</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-medium text-[#1a1a18]">
                    ₹{billingCycle === 'yearly' ? '1,999' : '2,499'}
                  </span>
                  <span className="text-xs text-[#5f5e5a]"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-[#1a1a18]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Up to 5 User Accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Single Warehouse Management
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Unlimited CRM Customers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Standard Sales Challans
                  </li>
                </ul>
              </div>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="mt-8 w-full text-center bg-white border border-black/10 hover:bg-[#f1f0ea] text-[#1a1a18] py-3 rounded-xl font-medium text-sm transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan (Popular) */}
            <div className="p-8 rounded-2xl bg-white border-2 border-[#085041] shadow-xl flex flex-col justify-between relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#085041] text-white text-xs font-semibold uppercase tracking-wider px-4 py-1 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-xl font-medium text-[#1a1a18]">Professional ERP</h3>
                <p className="text-xs text-[#5f5e5a] mt-1">Perfect for growing enterprise operations.</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-medium text-[#085041]">
                    ₹{billingCycle === 'yearly' ? '4,999' : '5,999'}
                  </span>
                  <span className="text-xs text-[#5f5e5a]"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-[#1a1a18]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Up to 25 User Accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Multi-Warehouse Stock Sync
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Advanced Audit & Email Logs
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Low-Stock Automated Alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Role-Based Access Control (RBAC)
                  </li>
                </ul>
              </div>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="mt-8 w-full text-center bg-[#085041] hover:bg-[#04342C] text-white py-3 rounded-xl font-medium text-sm transition-colors shadow-md shadow-[#085041]/20"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-[#f5f4ef] border border-black/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#1a1a18]">Enterprise Suite</h3>
                <p className="text-xs text-[#5f5e5a] mt-1">For high-volume multi-location corporations.</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-medium text-[#1a1a18]">Custom</span>
                </div>
                <ul className="space-y-3 text-sm text-[#1a1a18]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Unlimited Staff Users
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Unlimited Warehouses & SKUs
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Custom Backup & Restore Schedules
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F6E56]" /> Dedicated 24/7 Account Manager
                  </li>
                </ul>
              </div>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="mt-8 w-full text-center bg-white border border-black/10 hover:bg-[#f1f0ea] text-[#1a1a18] py-3 rounded-xl font-medium text-sm transition-colors"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18] mt-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-black/5 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 font-medium text-base text-[#1a1a18] flex items-center justify-between gap-4 hover:bg-[#f5f4ef]/50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="w-6 h-6 rounded-full bg-[#f5f4ef] flex items-center justify-center shrink-0 font-bold text-xs">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-[#5f5e5a] leading-relaxed border-t border-black/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-[#085041] text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-medium">
            Ready to upgrade your enterprise operational efficiency?
          </h2>
          <p className="text-white/80 text-base max-w-2xl mx-auto">
            Join thousands of teams who rely on NextGen ERP & CRM to drive order fulfillment and sales growth.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto bg-white text-[#085041] hover:bg-gray-100 font-semibold px-8 py-3.5 rounded-xl text-base shadow-lg transition-all"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Enterprise Trial'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a18] text-[#888780] py-12 text-sm border-t border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-medium text-lg mb-3">
              <Layers className="w-5 h-5 text-[#5DCAA5]" />
              <span>NextGen ERP/CRM</span>
            </div>
            <p className="text-xs text-[#888780] leading-relaxed">
              Unified enterprise cloud software for inventory management, sales challans, customer relationships, and real-time audit control.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-3">Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">CRM Accounts</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Multi-Warehouse Inventory</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Sales Delivery Challans</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Audit & Email Logs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-3">Security & Platform</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#5DCAA5]" /> RBAC Protected</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#5DCAA5]" /> Encrypted Database</li>
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#5DCAA5]" /> One-Click Backups</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2 text-xs">
              {isAuthenticated ? (
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Enterprise Dashboard</Link></li>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-white transition-colors">Sign In to Workspace</Link></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Register New Account</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-white/10 text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} NextGen ERP & CRM. All rights reserved.</span>
          <div className="flex gap-6 text-xs">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
