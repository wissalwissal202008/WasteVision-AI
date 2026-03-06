import { Outlet, Link, useLocation } from 'react-router';
import { Camera, BarChart3, Leaf } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WasteVision AI</h1>
            <p className="text-xs text-gray-500">Triez intelligent, vivez mieux</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center py-3 px-6 transition-colors ${
                isActive('/')
                  ? 'text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs mt-1">Scanner</span>
            </Link>
            
            <Link
              to="/dashboard"
              className={`flex flex-col items-center py-3 px-6 transition-colors ${
                isActive('/dashboard')
                  ? 'text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs mt-1">Tableau de bord</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
