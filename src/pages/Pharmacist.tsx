import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Clock, Star, Award, User, Send, Video } from 'lucide-react';

const pharmacists = [
  {
    id: '1',
    name: '王雅琴',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    licenseNo: '1101234567',
    specialty: '心血管内科、慢病管理',
    rating: 4.9,
    experienceYears: 15,
    isOnline: true,
    serviceHours: '08:00 - 22:00',
    intro: '三甲医院心内科工作10年，擅长高血压、冠心病等慢病用药指导',
  },
  {
    id: '2',
    name: '李明华',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
    licenseNo: '1107654321',
    specialty: '呼吸科、抗感染',
    rating: 4.8,
    experienceYears: 12,
    isOnline: true,
    serviceHours: '09:00 - 21:00',
    intro: '资深临床药师，擅长呼吸系统疾病用药指导及抗菌药物合理使用',
  },
  {
    id: '3',
    name: '张秀英',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
    licenseNo: '1109876543',
    specialty: '妇产科、儿科',
    rating: 4.9,
    experienceYears: 18,
    isOnline: false,
    serviceHours: '08:30 - 20:30',
    intro: '专注妇产及儿科用药安全，孕期哺乳期用药咨询经验丰富',
  },
];

export default function PharmacistPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">执业药师协助</h1>
            <p className="text-slate-500 text-sm mt-1">专业药师在线为您解答用药疑问</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 rounded-3xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">专业药师一对一服务</h2>
              <p className="opacity-90 mb-4 leading-relaxed">
                所有咨询药师均持有国家《执业药师资格证书》，<br />
                为您提供专业、权威、私密的用药指导
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Award className="w-4 h-4" />
                  持证上岗
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  平均5分钟内响应
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4" />
                  4.9用户好评
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-700 mb-5">在岗药师</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {pharmacists.map((ph) => (
            <div
              key={ph.id}
              className={`bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all hover:shadow-xl ${
                ph.isOnline ? 'border-emerald-200' : 'border-slate-100 opacity-80'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={ph.avatar}
                      alt={ph.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY0NzQ4YiIgZm9udC1zaXplPSIzMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuWbvuownzwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <div
                      className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                        ph.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-bold text-slate-800">{ph.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          ph.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ph.isOnline ? '在线' : '离线'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mb-1">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                        执业证：{ph.licenseNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{ph.rating}</span>
                      <span className="text-slate-400 text-xs ml-1">· {ph.experienceYears}年经验</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-1">擅长领域</div>
                  <div className="text-sm font-medium text-slate-700">{ph.specialty}</div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl">
                  {ph.intro}
                </p>

                <div className="text-xs text-slate-400 mb-5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  服务时间：{ph.serviceHours}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={!ph.isOnline}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow"
                  >
                    <Phone className="w-4 h-4" />
                    语音
                  </button>
                  <button
                    disabled={!ph.isOnline}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    图文
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-sky-500" />
            快速留言
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">您的姓名</label>
              <input
                type="text"
                placeholder="请输入姓名"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
              <input
                type="tel"
                placeholder="请输入手机号"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">问题描述</label>
              <textarea
                rows={4}
                placeholder="请描述您的用药疑问，药师会尽快电话回复您..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors resize-none"
              />
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              提交留言，等待药师回电
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
