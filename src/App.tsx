import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/store';
import Toast from '@/components/common/Toast';

export default function App() {
  const showLoadingOverlay = useUIStore((s) => s.showLoadingOverlay);

  return (
    <div className="min-h-screen">
      <Outlet />
      <Toast />

      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-700 font-medium">加载中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
