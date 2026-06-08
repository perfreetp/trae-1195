import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Eye, Lock, FileText, Database, UserCheck, AlertTriangle, Mail } from 'lucide-react';

const sections = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: '1. 我们收集哪些信息',
    content: [
      '追溯码信息：当您使用药品追溯查询功能时，系统会记录您输入的20位药品追溯码，用于查询药品流向和验证真伪。',
      '查询历史：为方便您快速复用追溯码，系统会在本地设备（LocalStorage）保存最近20条查询历史记录。',
      '反馈信息：当您提交问题反馈时，会收集您填写的问题描述、追溯码、药品名称和联系方式（选填）。',
      '设备信息：系统会自动收集基本的浏览器信息（如浏览器类型、屏幕分辨率）用于优化触屏终端的用户体验。',
    ],
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: '2. 信息存储方式',
    content: [
      '本地存储：查询历史、反馈记录等数据仅保存在您当前使用的设备浏览器中，不会上传至云端服务器。',
      '数据隔离：不同设备之间的数据相互独立，清除浏览器数据即可删除所有本地存储的个人信息。',
      '数据加密：所有涉及用户输入的内容均通过HTTPS安全协议传输，防止中途被窃听或篡改。',
      '保留期限：本地存储数据无固定保留期限，您可随时通过页面"清空"按钮或浏览器清除数据功能删除。',
    ],
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: '3. 信息使用范围',
    content: [
      '查询服务：追溯码仅用于执行药品信息检索，验证完成后不用于其他商业目的。',
      '服务改进：匿名的查询统计数据（如查询频次、热门药品）可用于优化平台服务，但不会关联到任何可识别个人身份的信息。',
      '反馈处理：您提交的反馈内容仅用于问题排查和客户服务，未经您同意不会分享给第三方。',
      '合规要求：仅在法律要求、司法程序或政府主管部门强制性要求时，我们才会依法提供相关数据。',
    ],
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: '4. 信息安全保障',
    content: [
      '前端加密：所有页面均通过HTTPS访问，数据传输过程使用TLS1.2+加密协议。',
      '本地保护：浏览器LocalStorage受同源策略保护，其他网站无法读取本系统存储的数据。',
      '无账号系统：本系统不要求用户注册账号，不收集手机号、身份证等敏感个人信息。',
      '打印安全：查询凭证打印时包含随机验证编号和时间戳，防止伪造篡改。',
    ],
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: '5. 您的用户权利',
    content: [
      '知情权：您有权了解系统收集了哪些数据以及如何使用这些数据。',
      '删除权：您随时可以通过页面功能按钮清除查询历史、反馈记录等本地数据。',
      '拒绝权：您可以拒绝使用需要提交联系方式的反馈功能，基础查询服务不受影响。',
      '导出权：如需导出本地数据，可通过浏览器开发者工具或联系技术支持协助处理。',
    ],
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: '6. 第三方服务说明',
    content: [
      '药品数据源：药品追溯数据来自国家药品追溯协同服务平台及合作药企官方授权。',
      '二维码：凭证打印页面的二维码仅包含追溯验证页面的URL，不包含任何个人信息。',
      '图片资源：页面展示的药品图片及药师头像来自Unsplash免版权图库。',
      '图标系统：使用Lucide开源图标库，所有图标代码本地加载，无额外数据请求。',
    ],
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();

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
            <h1 className="text-2xl font-bold text-slate-800">隐私政策与数据说明</h1>
            <p className="text-slate-500 text-sm mt-1">
              最近更新：{new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-3xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">我们重视您的数据隐私</h2>
              <p className="opacity-95 leading-relaxed">
                药品追溯查询系统严格遵守《中华人民共和国个人信息保护法》及相关法律法规要求。<br />
                本系统采用纯前端架构，核心数据均保存在您本地设备中，<strong>不上传任何个人信息至云端服务器</strong>。
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
                </div>
              </div>
              <ul className="p-6 space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mt-8 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-500" />
            联系我们
          </h3>
          <p className="text-slate-600 leading-relaxed">
            如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的数据权利，<br />
            可通过以下方式与我们联系，我们将在15个工作日内回复您的请求：
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
              <div className="text-xs text-sky-600 mb-1">📧 数据保护邮箱</div>
              <div className="font-semibold text-sky-800">privacy@drugtrace.example.com</div>
            </div>
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div className="text-xs text-teal-600 mb-1">📞 客服热线</div>
              <div className="font-semibold text-teal-800">400-800-1234（工作日 09:00-18:00）</div>
            </div>
          </div>
        </div>

        <div className="text-center py-10 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} 药品追溯查询系统 · 本政策依据《个人信息保护法》制定</p>
        </div>
      </div>
    </div>
  );
}
