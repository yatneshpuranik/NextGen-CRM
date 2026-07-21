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
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  LayoutDashboard,
  Layers,
  Building2
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#1a1a18] selection:bg-[#085041] selection:text-white font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#085041] to-[#5DCAA5] flex items-center justify-center text-white shadow-md shadow-[#085041]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-[#1a1a18] leading-tight">
                NextGen <span className="text-[#085041]">ERP & CRM</span>
              </span>
              <span className="text-[10px] tracking-wider font-medium text-[#5f5e5a] uppercase">Enterprise Platform</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5f5e5a]">
            <a href="#about" className="hover:text-[#085041] transition-colors">About Us</a>
            <a href="#features" className="hover:text-[#085041] transition-colors">Features</a>
            <a href="#modules" className="hover:text-[#085041] transition-colors">Modules</a>
            <a href="#security" className="hover:text-[#085041] transition-colors">Security</a>
          </nav>

          {/* Login & Sign Up Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-[#085041] hover:bg-[#04342C] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1a1a18] hover:text-[#085041] border border-black/10 px-4 py-2 rounded-xl hover:bg-black/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-[#085041] hover:bg-[#04342C] text-white px-5 py-2 rounded-xl font-medium text-sm shadow-md transition-all"
                >
                  Sign Up
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

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-black/5 px-4 pt-2 pb-6 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              About Us
            </a>
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
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#1a1a18] hover:bg-[#f5f4ef]"
            >
              Security
            </a>
            <div className="pt-4 border-t border-black/5 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center bg-[#085041] text-white px-5 py-2.5 rounded-xl font-medium text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center border border-black/10 text-[#1a1a18] px-5 py-2.5 rounded-xl font-medium text-sm"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center bg-[#085041] text-white px-5 py-2.5 rounded-xl font-medium text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Company Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1F5EE] border border-[#5DCAA5]/40 text-[#085041] text-xs font-semibold tracking-wide mb-6">
            <Building2 className="w-3.5 h-3.5 text-[#0F6E56]" />
            <span>NextGen Enterprise Operating System</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1a1a18] max-w-4xl mx-auto leading-tight">
            Streamline your customer management & inventory operations.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#5f5e5a] max-w-2xl mx-auto font-normal leading-relaxed">
            Welcome to NextGen ERP & CRM. A powerful, modern platform designed to unify customer relationships, sales delivery challans, stock tracking, and system audit logs.
          </p>

          {/* CTAs: Log In & Sign Up */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#085041] hover:bg-[#04342C] text-white px-8 py-3.5 rounded-xl font-medium text-base shadow-lg transition-all"
              >
                Open Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#085041] hover:bg-[#04342C] text-white px-8 py-3.5 rounded-xl font-medium text-base shadow-lg transition-all"
                >
                  Create Account (Sign Up)
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-black/10 hover:bg-[#f1f0ea] text-[#1a1a18] px-8 py-3.5 rounded-xl font-medium text-base transition-colors"
                >
                  Sign In (Log In)
                </Link>
              </>
            )}
          </div>

          {/* UI Dashboard Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-black/10 bg-white shadow-2xl p-4 sm:p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="ml-2 text-xs font-mono text-[#888780]">NextGen Enterprise Portal</span>
              </div>
              <span className="text-xs font-medium text-[#085041] bg-[#E1F5EE] px-3 py-1 rounded-full">
                System Active
              </span>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5]/40 text-[#04342C]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#085041]">CRM Customers</span>
                  <Users className="w-4 h-4 text-[#0F6E56]" />
                </div>
                <div className="text-2xl font-medium mt-2">Accounts</div>
                <div className="text-xs text-[#085041] mt-1">Full Contact Directory</div>
              </div>

              <div className="p-4 rounded-xl bg-[#EEEDFE] border border-indigo-200 text-[#26215C]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#3C3489]">Warehouses</span>
                  <Package className="w-4 h-4 text-[#534AB7]" />
                </div>
                <div className="text-2xl font-medium mt-2">Inventory</div>
                <div className="text-xs text-[#3C3489] mt-1">Multi-location Stock</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAEEDA] border border-amber-200 text-[#412402]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#633806]">Sales Challans</span>
                  <FileText className="w-4 h-4 text-[#854F0B]" />
                </div>
                <div className="text-2xl font-medium mt-2">Logistics</div>
                <div className="text-xs text-[#633806] mt-1">Dispatch & Invoicing</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCEBEB] border border-rose-200 text-[#501313]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#791F1F]">System Security</span>
                  <ShieldCheck className="w-4 h-4 text-[#A32D2D]" />
                </div>
                <div className="text-2xl font-medium mt-2">RBAC Audit</div>
                <div className="text-xs text-[#791F1F] mt-1">Role-Based Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Company Section */}
      <section id="about" className="bg-white border-y border-black/5 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
              About Our Company
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18]">
              Empowering enterprises with clear operational control.
            </h2>
            <p className="text-[#5f5e5a] text-base sm:text-lg leading-relaxed">
              At NextGen, we build structured enterprise tools designed for reliability and speed. Our ERP & CRM suite replaces disjointed spreadsheets with a single secure environment for your sales, warehouse, and accounting teams.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
            Key System Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18] mt-4">
            Designed for modern business operations.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] text-[#085041] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-[#1a1a18]">Customer Directory</h3>
            <p className="text-xs text-[#5f5e5a] leading-relaxed">
              Organize customer accounts, track lead statuses, billing history, and contact details seamlessly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEEDFE] text-[#3C3489] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-[#1a1a18]">Inventory & Stock</h3>
            <p className="text-xs text-[#5f5e5a] leading-relaxed">
              Track stock across multiple warehouses, set low-stock alerts, and manage product catalogs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAEEDA] text-[#633806] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-[#1a1a18]">Sales Challans</h3>
            <p className="text-xs text-[#5f5e5a] leading-relaxed">
              Generate delivery challans, update status states, and automatically adjust warehouse stock.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCEBEB] text-[#791F1F] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-[#1a1a18]">Reports & Audit</h3>
            <p className="text-xs text-[#5f5e5a] leading-relaxed">
              View interactive financial reports, system audit logs, email logs, and database backup tools.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section id="modules" className="bg-white border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
                System Modules
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18]">
                Integrated modules for your whole team.
              </h2>
              <p className="text-[#5f5e5a] text-base leading-relaxed">
                Whether you work in Sales, Warehouse Management, Accounts, or Administration, NextGen provides dedicated interfaces tailored to your role.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-[#1a1a18]">
                  <CheckCircle2 className="w-5 h-5 text-[#0F6E56]" />
                  <span><strong>Sales Team:</strong> Manage customer accounts and issue delivery challans</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#1a1a18]">
                  <CheckCircle2 className="w-5 h-5 text-[#0F6E56]" />
                  <span><strong>Warehouse Team:</strong> Monitor item stock, product catalogs, and low-stock alerts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#1a1a18]">
                  <CheckCircle2 className="w-5 h-5 text-[#0F6E56]" />
                  <span><strong>Admin & Security:</strong> Access audit logs, email delivery history, and backups</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#f5f4ef] rounded-2xl p-6 border border-black/5">
              <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <span className="text-xs font-semibold text-[#1a1a18] uppercase tracking-wider">
                    Role-Based Access Control
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#0F6E56]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#E1F5EE] p-3 rounded-lg text-xs font-medium text-[#04342C]">
                    <span>Role: ADMIN</span>
                    <span className="bg-[#085041] text-white px-2 py-0.5 rounded">Full System Access</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#EEEDFE] p-3 rounded-lg text-xs font-medium text-[#26215C]">
                    <span>Role: SALES</span>
                    <span className="bg-[#3C3489] text-white px-2 py-0.5 rounded">Customers & Challans</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FAEEDA] p-3 rounded-lg text-xs font-medium text-[#412402]">
                    <span>Role: WAREHOUSE</span>
                    <span className="bg-[#854F0B] text-white px-2 py-0.5 rounded">Products & Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section id="security" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold text-[#085041] uppercase tracking-widest bg-[#E1F5EE] px-3 py-1 rounded-full">
            Enterprise Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-medium text-[#1a1a18]">
            Built with security & compliance at the core.
          </h2>
          <p className="text-[#5f5e5a] text-base leading-relaxed">
            Your data is protected with JWT token authentication, bcrypt password hashing, granular role guards, and audit trail logs.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-[#085041] hover:bg-[#04342C] text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-all shadow-md"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-[#085041] hover:bg-[#04342C] text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-all shadow-md"
              >
                Sign Up Now
              </Link>
              <Link
                to="/login"
                className="bg-white border border-black/10 hover:bg-[#f1f0ea] text-[#1a1a18] font-medium px-8 py-3.5 rounded-xl text-sm transition-colors"
              >
                Log In to Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a18] text-[#888780] py-10 text-xs border-t border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-medium text-base">
            <Layers className="w-4 h-4 text-[#5DCAA5]" />
            <span>NextGen ERP & CRM</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            )}
          </div>
          <span>© {new Date().getFullYear()} NextGen Enterprise. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
