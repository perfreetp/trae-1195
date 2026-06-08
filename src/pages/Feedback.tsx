import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, ChevronDown, ChevronUp, HelpCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useFeedbackStore, useUIStore } from '@/store';
import type { FeedbackRecord } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'quality', label: '质量问题', desc: '药品外观、包装异常等' },
  { value: 'safety', label: '安全问题', desc: '用药后不适、不良反应等' },
  { value: 'service', label: '服务问题', desc: '查询体验、建议反馈等' },
  { value: 'other', label: '其他问题', desc: '其他需要反馈的内容' },
];

const FAQS = [
  {
    q: '如何正确识别药品追溯码？',
    a: '药品追溯码通常印刷在药品包装盒侧面或底部，为20位数字编码，以"81"开头。部分药品采用电子监管码，也可扫码识别。',
  },
  {
    q: '查询不到药品信息是什么原因？',
    a: '可能原因包括：1) 追溯码输入错误；2) 该药品未纳入追溯系统；3) 数据尚未同步。请确认追溯码是否正确，或联系药店工作人员协助。',
  },
  {
    q: '追溯码被多次查询有风险吗？',
    a: '同一追溯码被多次查询可能意味着药品包装被重复使用，建议谨慎购买并联系购买渠道确认。您可以在风险核验页查看详细查询记录。',
  },
  {
    q: '发现药品质量问题如何处理？',
    a: '请立即停止使用，保留好购买凭证和药品包装，通过上方反馈表单提交问题，或直接联系购买药店/生产企业处理。',
  },
];

const STATUS_STYLE: Record<FeedbackRecord['status'], { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  submitted: {
    icon: <Clock className="w-4 h-4" />,
    label: '已提交',
    color: 'text-sky-600',
    bg: 'bg-sky-100',
  },
  processing: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: '处理中',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  resolved: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: '已解决',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [traceCode, setTraceCode] = useState('');
  const [productName, setProductName] = useState('');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tab, setTab] = useState<'form' | 'history'>('form');

  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);
  const feedbackList = useFeedbackStore((s) => s.feedbackList);
  const showToast = useUIStore((s) => s.showToast);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!category) newErrors.category = '请选择问题类型';
    if (!content.trim()) newErrors.content = '请描述问题内容';
    if (content.trim().length < 10) newErrors.content = '问题描述至少10个字';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const cat = CATEGORY_OPTIONS.find((c) => c.value === category)!;
    submitFeedback({
      traceCode: traceCode.trim(),
      productName: productName.trim() || '未填写',
      category: category as FeedbackRecord['category'],
      categoryLabel: cat.label,
      content: content.trim(),
      contact: contact.trim(),
    });

    showToast('反馈提交成功，我们会尽快处理', 'success');
    setCategory('');
    setTraceCode('');
    setProductName('');
    setContent('');
    setContact('');
    setTab('history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">反馈与帮助</h1>
            <p className="text-slate-500 text-sm mt-1">提交问题反馈，查看常见问题解答</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setTab('form')}
              className={`flex-1 px-8 py-5 font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === 'form'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              提交反馈
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex-1 px-8 py-5 font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === 'history'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-5 h-5" />
              历史记录
              {feedbackList.length > 0 && (
                <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded-full">
                  {feedbackList.length}
                </span>
              )}
            </button>
          </div>

          {tab === 'form' ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-slate-700 font-medium mb-3">
                  问题类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setCategory(opt.value);
                        if (errors.category) setErrors({ ...errors, category: '' });
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        category === opt.value
                          ? 'border-sky-500 bg-sky-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`font-semibold mb-1 ${category === opt.value ? 'text-sky-700' : 'text-slate-700'}`}>
                        {opt.label}
                      </div>
                      <div className="text-sm text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">追溯码（可选）</label>
                  <input
                    type="text"
                    value={traceCode}
                    onChange={(e) => setTraceCode(e.target.value.replace(/\D/g, '').slice(0, 20))}
                    placeholder="20位追溯码"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">药品名称（可选）</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="如：布洛芬缓释胶囊"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  问题描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: '' });
                  }}
                  placeholder="请详细描述您遇到的问题或建议..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors resize-none"
                />
                <div className="flex justify-between mt-2">
                  {errors.content ? (
                    <p className="text-red-500 text-sm">{errors.content}</p>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-sm text-slate-400">{content.length} / 500</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">联系方式（可选）</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="手机号或邮箱，方便我们联系您"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                提交反馈
              </button>
            </form>
          ) : (
            <div className="p-8">
              {feedbackList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquare className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">暂无反馈记录</p>
                  <button
                    onClick={() => setTab('form')}
                    className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                  >
                    去提交反馈 →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackList.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 border-2 border-slate-100 rounded-2xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600`}>
                              {item.categoryLabel}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${STATUS_STYLE[item.status].bg} ${STATUS_STYLE[item.status].color}`}
                            >
                              {STATUS_STYLE[item.status].icon}
                              {STATUS_STYLE[item.status].label}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">{item.createTime}</div>
                        </div>
                      </div>
                      {item.productName && (
                        <div className="text-sm text-slate-500 mb-2">
                          药品：<span className="font-medium text-slate-700">{item.productName}</span>
                          {item.traceCode && (
                            <span className="ml-3 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {item.traceCode}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-slate-700 leading-relaxed">{item.content}</p>
                      {item.reply && (
                        <div className="mt-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                          <div className="text-xs text-sky-600 font-medium mb-1">官方回复</div>
                          <p className="text-sky-800 text-sm">{item.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <HelpCircle className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl font-semibold text-slate-700">常见问题 FAQ</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border-2 border-slate-100 rounded-2xl overflow-hidden transition-all hover:border-slate-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-700 pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-slate-600 leading-relaxed pl-0">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
