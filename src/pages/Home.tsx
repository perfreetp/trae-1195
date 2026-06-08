import { useNavigate } from 'react-router-dom';
import { QrCode, Search, UserCircle2, FileQuestion, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">药品追溯查询系统</h1>
          <p className="text-lg text-slate-500">药品全链路追溯 · 安全用药可信赖</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-10 mb-10 border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center mb-6 relative">
              <QrCode className="w-24 h-24 text-sky-600" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-full border-4 border-sky-400 border-dashed animate-spin" style={{ animationDuration: '8s' }}></div>
            </div>
            <h2 className="text-2xl font-semibold text-slate-700">扫描药品追溯码</h2>
            <p className="text-slate-500 mt-2">请将药品包装上的20位追溯码对准扫描框</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/manual')}
              className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Search className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xl font-semibold">手动输入查询</div>
                <div className="text-sm text-sky-100">手动输入20位追溯码</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/pharmacist')}
              className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <UserCircle2 className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xl font-semibold">药师协助</div>
                <div className="text-sm text-teal-100">在线咨询执业药师</div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/feedback')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-100 text-left"
          >
            <FileQuestion className="w-10 h-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">问题反馈</h3>
            <p className="text-sm text-slate-500">查询异常？提交反馈给我们</p>
          </button>

          <button
            onClick={() => navigate('/privacy')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-100 text-left"
          >
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">隐私说明</h3>
            <p className="text-sm text-slate-500">了解我们的数据保护政策</p>
          </button>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">💊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">正品保障</h3>
            <p className="text-sm text-slate-500">国家药监局追溯平台验证</p>
          </div>
        </div>
      </div>
    </div>
  );
}
