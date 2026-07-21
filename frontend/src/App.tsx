import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

// Placeholder views for Phase 0
const LoginPlaceholder = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900 p-8 border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">NextGen ERP + CRM</h2>
        <p className="mt-2 text-sm text-slate-400">Please sign in to access your dashboard</p>
      </div>
      <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
        Mock Sign In
      </button>
    </div>
  </div>
);

const DashboardPlaceholder = () => {
  const auth = useSelector((state: RootState) => state.auth);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NextGen Operations Control</h1>
            <p className="text-sm text-slate-400">Phase 0: Project Setup Sandbox Mode</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold uppercase text-indigo-400">
              {auth.user?.role || 'GUEST'}
            </span>
          </div>
        </header>
        <main className="grid gap-6 md:grid-cols-2">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 shadow-sm">
            <h3 className="font-semibold text-white">Prisma DB Link Status</h3>
            <p className="text-sm text-emerald-400">Initialized and ready to sync schema models</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 shadow-sm">
            <h3 className="font-semibold text-white">Tailwind CSS Engine</h3>
            <p className="text-sm text-indigo-400">Successfully imported styles and resets</p>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPlaceholder /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPlaceholder /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
