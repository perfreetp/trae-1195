import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Clock,
  Star,
  Award,
  User,
  Send,
  Video,
  X,
  Mic,
  MicOff,
  Volume2,
  Speaker,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

type CallStatus = 'idle' | 'calling' | 'connecting' | 'connected' | 'ended' | 'failed';
type CallMode = 'voice' | 'text' | 'video';

interface Pharmacist {
  id: string;
  name: string;
  avatar: string;
  licenseNo: string;
  specialty: string;
  rating: number;
  experienceYears: number;
  isOnline: boolean;
  serviceHours: string;
  intro: string;
}

interface MessageRecord {
  id: string;
  name: string;
  phone: string;
  content: string;
  createTime: string;
  status: '已提交' | '处理中' | '已回复';
  replyEstimate: string;
  pharmacist: string;
  replyContent?: string;
  replyTime?: string;
  replyPharmacist?: string;
}

interface ChatMessage {
  id: string;
  sender: 'pharmacist' | 'user';
  content: string;
  time: string;
}

const pharmacists: Pharmacist[] = [
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

const FALLBACK_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY0NzQ4YiIgZm9udC1zaXplPSIzMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuWbvuownzwvdGV4dD48L3N2Zz4=';

const STORAGE_KEY = 'pharmacist_messages';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatDateTime(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}`;
}

function formatEstimateReply(createTime: string): string {
  const d = new Date(createTime);
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} 18:00前`;
}

export default function PharmacistPage() {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callMode, setCallMode] = useState<CallMode>('voice');
  const [currentPharmacist, setCurrentPharmacist] = useState<Pharmacist | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const callTimerRef = useRef<number | null>(null);
  const statusTimerRef = useRef<number | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', content: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; content?: string }>({});
  const [messageRecords, setMessageRecords] = useState<MessageRecord[]>([]);
  const replyTimersRef = useRef<Map<string, { t1: number; t2: number }>>(new Map());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: MessageRecord[] = JSON.parse(saved);
        setMessageRecords(parsed.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()));
      } catch {
        setMessageRecords([]);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) window.clearInterval(callTimerRef.current);
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
      replyTimersRef.current.forEach(({ t1, t2 }) => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      });
      replyTimersRef.current.clear();
    };
  }, []);

  const clearAllTimers = () => {
    if (callTimerRef.current) {
      window.clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (statusTimerRef.current) {
      window.clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  };

  const startCall = (pharmacist: Pharmacist, mode: CallMode) => {
    if (!pharmacist.isOnline) return;
    clearAllTimers();
    setCurrentPharmacist(pharmacist);
    setCallMode(mode);
    setCallStatus('calling');
    setCallSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setRating(0);
    setChatMessages([]);

    statusTimerRef.current = window.setTimeout(() => {
      setCallStatus('connecting');
      statusTimerRef.current = window.setTimeout(() => {
        setCallStatus('connected');
        callTimerRef.current = window.setInterval(() => {
          setCallSeconds((s) => s + 1);
        }, 1000);
        if (mode === 'text') {
          const now = new Date();
          const msgs: ChatMessage[] = [
            { id: '1', sender: 'pharmacist', content: '您好~请问有什么用药疑问？', time: formatDateTime(now) },
            {
              id: '2',
              sender: 'pharmacist',
              content: '请您告知一下症状和过往病史？',
              time: formatDateTime(new Date(now.getTime() + 3000)),
            },
            {
              id: '3',
              sender: 'pharmacist',
              content: '好的，我来帮您分析...',
              time: formatDateTime(new Date(now.getTime() + 6000)),
            },
          ];
          setChatMessages(msgs);
        }
      }, 1500);
    }, 3000);
  };

  const hangUp = () => {
    clearAllTimers();
    setCallStatus('ended');
  };

  const closeModal = () => {
    clearAllTimers();
    setCallStatus('idle');
    setCurrentPharmacist(null);
    setChatMessages([]);
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; phone?: string; content?: string } = {};
    if (formData.name.trim().length < 2) errors.name = '姓名至少2个字符';
    if (!/^\d{11,}$/.test(formData.phone.trim())) errors.phone = '请输入至少11位纯数字的手机号';
    if (formData.content.trim().length < 10) errors.content = '问题描述至少10个字符';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('请检查表单填写是否正确', 'warning');
      return;
    }

    const now = new Date();
    const record: MessageRecord = {
      id: `msg_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      content: formData.content.trim(),
      createTime: now.toISOString(),
      status: '已提交',
      replyEstimate: formatEstimateReply(now.toISOString()),
      pharmacist: '待分配',
    };

    const newRecords = [record, ...messageRecords];
    setMessageRecords(newRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    showToast('✅ 留言已提交，药师会尽快回复您', 'success');
    setFormData({ name: '', phone: '', content: '' });
    setFormErrors({});

    if (Math.random() < 0.1) {
      const pharmacistNames = ['王雅琴', '李明华', '张秀英'];
      const pharmacist = pharmacistNames[Math.floor(Math.random() * pharmacistNames.length)];
      const sampleReplies = [
        '感谢您的咨询！根据您描述的症状，建议您先测量血压，如果持续偏高请及时就医。用药方面建议您按医嘱服用，避免自行调整剂量。',
        '您好，您提到的症状可能与季节性过敏有关。建议保持室内通风，避免接触过敏源。如需用药，推荐使用第二代抗组胺药，请按说明书服用。',
        '您好！关于您的用药疑问，建议饭后30分钟服用，可减少胃肠道刺激。服药期间避免饮酒，如有不适请及时停药并就医。',
      ];
      const replyContent = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

      const t1 = window.setTimeout(() => {
        setMessageRecords((prev) => {
          const updated = prev.map((r) =>
            r.id === record.id ? { ...r, status: '处理中' as const, pharmacist: `${pharmacist}药师负责中` } : r
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }, 5000);

      const t2 = window.setTimeout(() => {
        const replyTime = new Date();
        setMessageRecords((prev) => {
          const updated = prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  status: '已回复' as const,
                  pharmacist: `${pharmacist}药师负责中`,
                  replyContent,
                  replyTime: replyTime.toISOString(),
                  replyPharmacist: pharmacist,
                }
              : r
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        replyTimersRef.current.delete(record.id);
      }, 10000);

      replyTimersRef.current.set(record.id, { t1, t2 });
    }
  };

  const getStatusBadgeClass = (status: MessageRecord['status']) => {
    switch (status) {
      case '已提交':
        return 'bg-sky-100 text-sky-700';
      case '处理中':
        return 'bg-amber-100 text-amber-700';
      case '已回复':
        return 'bg-emerald-100 text-emerald-700';
    }
  };

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
              <div className="flex gap-4 text-sm flex-wrap">
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
                        (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
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

                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={!ph.isOnline}
                    onClick={() => startCall(ph, 'voice')}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-400"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">语音</span>
                  </button>
                  <button
                    disabled={!ph.isOnline}
                    onClick={() => startCall(ph, 'text')}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-400"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">图文</span>
                  </button>
                  <button
                    disabled={!ph.isOnline}
                    onClick={() => startCall(ph, 'video')}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-400"
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-xs">视频</span>
                  </button>
                </div>
                {!ph.isOnline && (
                  <div className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                    <span>💤</span>
                    <span>药师休息中，可留言预约</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-sky-500" />
            快速留言
          </h3>
          <form onSubmit={handleSubmitMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">您的姓名</label>
              <input
                type="text"
                placeholder="请输入姓名"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.name
                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-sky-500'
                }`}
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
              <input
                type="tel"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.phone
                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-sky-500'
                }`}
              />
              {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">问题描述</label>
              <textarea
                rows={4}
                placeholder="请描述您的用药疑问，药师会尽快电话回复您..."
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  if (formErrors.content) setFormErrors({ ...formErrors, content: undefined });
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
                  formErrors.content
                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-sky-500'
                }`}
              />
              {formErrors.content && <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              提交留言，等待药师回电
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            留言记录
          </h3>
          {messageRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">暂无留言记录，有疑问可以在上方提交</p>
            </div>
          ) : (
            <div className="space-y-5">
              {messageRecords.map((record) => (
                <div key={record.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">{formatDateTime(new Date(record.createTime))}</span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeClass(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-1">药师分配：</div>
                    <div className="text-sm font-medium text-slate-700">{record.pharmacist}</div>
                  </div>
                  <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>预计回复：{record.replyEstimate}</span>
                    </div>
                  </div>
                  <div className="mb-3 p-4 bg-slate-100 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1.5">用户留言</div>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{record.content}</div>
                  </div>
                  {record.status === '已回复' && record.replyContent && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-xs text-emerald-600 mb-1.5 flex items-center justify-between">
                        <span className="font-medium">{record.replyPharmacist}药师 回复</span>
                        <span>{record.replyTime ? formatDateTime(new Date(record.replyTime)) : ''}</span>
                      </div>
                      <div className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                        {record.replyContent}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {callStatus !== 'idle' && currentPharmacist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="relative bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500 p-6 pt-8 pb-10 text-white">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                <div className="relative mb-5">
                  {callStatus === 'calling' && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                      <div
                        className="absolute inset-0 rounded-full bg-white/20 animate-ping"
                        style={{ animationDelay: '0.5s' }}
                      />
                    </>
                  )}
                  <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white/10">
                    <img
                      src={currentPharmacist.avatar}
                      alt={currentPharmacist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                      }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">{currentPharmacist.name} 药师</h3>
                  <p className="text-sm opacity-80">{currentPharmacist.specialty}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {callStatus === 'calling' && (
                <div className="text-center py-6">
                  <p className="text-slate-700 font-medium mb-3">正在呼叫 {currentPharmacist.name} 药师...</p>
                  <p className="text-slate-400 text-sm tracking-widest mb-8">嘟... 嘟...</p>
                  <button
                    onClick={hangUp}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all mx-auto"
                  >
                    <Phone className="w-7 h-7 rotate-[135deg]" />
                  </button>
                  <p className="text-xs text-slate-400 mt-3">点击挂断</p>
                </div>
              )}

              {callStatus === 'connecting' && (
                <div className="text-center py-6">
                  <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-700 font-medium mb-2">药师正在接入，请稍候...</p>
                  <p className="text-slate-400 text-sm">正在建立安全连接</p>
                  <button
                    onClick={hangUp}
                    className="mt-8 w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all mx-auto"
                  >
                    <Phone className="w-7 h-7 rotate-[135deg]" />
                  </button>
                </div>
              )}

              {callStatus === 'connected' && (
                <div>
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      ✅ 已接入，与药师{currentPharmacist.name}通话中
                    </div>
                  </div>

                  {callMode !== 'text' && (
                    <div className="text-center mb-6">
                      <div className="text-4xl font-mono font-bold text-slate-800 tracking-wider mb-6">
                        {formatDuration(callSeconds)}
                      </div>
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                            isMuted ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                        <button
                          onClick={hangUp}
                          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
                        >
                          <Phone className="w-7 h-7 rotate-[135deg]" />
                        </button>
                        <button
                          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                            isSpeakerOn
                              ? 'bg-sky-500 text-white hover:bg-sky-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSpeakerOn ? <Speaker className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-14 mt-3 text-xs text-slate-400">
                        <span>{isMuted ? '已静音' : '静音'}</span>
                        <span>挂断</span>
                        <span>{isSpeakerOn ? '免提' : '听筒'}</span>
                      </div>
                    </div>
                  )}

                  {callMode === 'text' && (
                    <div>
                      <div className="h-56 overflow-y-auto space-y-3 mb-4 pr-1">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                                msg.sender === 'user'
                                  ? 'bg-sky-500 text-white rounded-br-sm'
                                  : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                              }`}
                            >
                              <div className="text-sm leading-relaxed">{msg.content}</div>
                              <div
                                className={`text-[10px] mt-1 ${
                                  msg.sender === 'user' ? 'text-sky-100' : 'text-slate-400'
                                }`}
                              >
                                {msg.time.split(' ')[1]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-400">当前为演示消息</div>
                        <button
                          onClick={hangUp}
                          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow transition-all flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4 rotate-[135deg]" />
                          结束咨询
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {callStatus === 'ended' && (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm mb-1">本次通话时长</p>
                  <p className="text-3xl font-mono font-bold text-slate-800 mb-6">{formatDuration(callSeconds)}</p>
                  <div className="mb-6">
                    <p className="text-slate-600 font-medium mb-3">本次服务满意吗？</p>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(n)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-9 h-9 transition-colors ${
                              (hoverRating || rating) >= n
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-sky-500 mt-3">
                        感谢您的{rating === 5 ? '五星' : rating + '星'}好评！
                      </p>
                    )}
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    返回
                  </button>
                </div>
              )}

              {callStatus === 'failed' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Phone className="w-8 h-8 text-red-500 rotate-[135deg]" />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">未能接通</p>
                  <p className="text-slate-400 text-sm mb-6">药师暂时无法接听，请稍后再试或留言</p>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                    >
                      关闭
                    </button>
                    <button
                      onClick={() => startCall(currentPharmacist, callMode)}
                      className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-all"
                    >
                      重新呼叫
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
