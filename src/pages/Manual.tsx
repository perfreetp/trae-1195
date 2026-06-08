import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Clock, Trash2, X, FileDown } from 'lucide-react';
import { useHistoryStore, useQueryStore, useUIStore } from '@/store';

function isValidTraceCode(code: string): { valid: boolean; message?: string } {
  if (!code) return { valid: false, message: '请输入追溯码' };
  if (!/^\d+$/.test(code)) return { valid: false, message: '追溯码必须为纯数字' };
  if (code.length !== 20) return { valid: false, message: '追溯码必须为20位数字' };
  if (!code.startsWith('81')) return { valid: false, message: '追溯码必须以81开头' };
  return { valid: true };
}

function escapeCSV(v: string | number): string {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function triggerCSVDownload(filename: string, rows: (string | number)[][], headers: string[]) {
  const bom = '\uFEFF';
  const lines = [headers, ...rows].map((row) => row.map(escapeCSV).join(','));
  const csv = bom + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function ManualPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const addHistory = useHistoryStore((s) => s.addHistoryItem);
  const historyList = useHistoryStore((s) => s.historyList);
  const removeHistory = useHistoryStore((s) => s.removeHistory);
  const clearAllHistory = useHistoryStore((s) => s.clearAllHistory);
  const queryDrug = useQueryStore((s) => s.queryDrug);
  const getAllQueryRecords = useQueryStore((s) => s.getAllQueryRecords);
  const getRiskLevelForRecord = useQueryStore((s) => s.getRiskLevelForRecord);
  const loading = useQueryStore((s) => s.loading);
  const currentDrug = useQueryStore((s) => s.currentDrug);
  const showToast = useUIStore((s) => s.showToast);

  const handleExportAll = () => {
    const records = getAllQueryRecords();
    const levelMap = { safe: '安全', warning: '注意', danger: '风险' };
    const headers = [
      '序号', '追溯码', '药品名称', '累计查询次数', '首次查询时间',
      '最近查询时间', '当前风险等级', '最近5次入口来源', '导出时间',
    ];
    const rows: (string | number)[][] = records.map((r, i) => {
      const level = getRiskLevelForRecord(r);
      const sources = r.queryLogs.slice(0, 5).map((l) => l.sourceLabel).join(' → ') || '-';
      return [
        i + 1, r.traceCode, r.productName,
        String(r.queryCount), r.firstQueryTime, r.lastQueryTime,
        levelMap[level], sources, new Date().toLocaleString('zh-CN'),
      ];
    });
    if (!rows.length) {
      showToast('暂无查询记录可导出', 'error');
      return;
    }
    triggerCSVDownload(
      `药品追溯查询记录汇总_${Date.now()}.csv`,
      rows,
      headers
    );
    showToast(`已导出 ${rows.length} 条查询记录`, 'success');
  };

  const handleQuery = async () => {
    const validation = isValidTraceCode(code.trim());
    if (!validation.valid) {
      setError(validation.message || '');
      return;
    }
    setError('');
    await queryDrug(code.trim(), 'manual_input');
    if (currentDrug || !useQueryStore.getState().error) {
      const drug = useQueryStore.getState().currentDrug;
      if (drug) {
        addHistory(drug.traceCode, drug.productName);
        showToast('查询成功', 'success');
        navigate(`/drug/${drug.traceCode}`);
      } else {
        setError(useQueryStore.getState().error || '查询失败');
      }
    } else {
      setError(useQueryStore.getState().error || '查询失败');
    }
  };

  const handleUseHistory = (traceCode: string) => {
    setCode(traceCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">手动输入追溯码</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-100">
          <label className="block text-slate-700 font-medium mb-3">
            请输入20位药品追溯码
          </label>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 20));
                if (error) setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="8100 0010 0001 0000 0017"
              className="flex-1 px-5 py-4 text-xl tracking-widest border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:outline-none transition-colors font-mono"
              maxLength={20}
            />
            <button
              onClick={handleQuery}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm px-2">{error}</div>
          )}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-slate-500 space-y-1">
            <p className="font-medium text-slate-600 mb-2">📌 追溯码格式说明：</p>
            <p>• 必须为20位纯数字</p>
            <p>• 以"81"开头（国家药品编码标准前缀）</p>
            <p>• 格式示例：<span className="font-mono text-sky-600">81000010000100000017</span></p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-700">历史查询</h2>
            </div>
            <div className="flex items-center gap-3">
              {historyList.length > 0 && (
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl border border-sky-200 text-sm font-medium transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  导出全部记录
                </button>
              )}
              {historyList.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  清空全部
                </button>
              )}
            </div>
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p>暂无查询历史</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((item) => (
                <div
                  key={item.traceCode}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <Link
                    to={`/drug/${item.traceCode}`}
                    state={{ source: 'history' }}
                    onClick={() => handleUseHistory(item.traceCode)}
                    className="flex-1"
                  >
                    <div className="font-medium text-slate-700">{item.productName}</div>
                    <div className="text-sm text-slate-500 font-mono mt-1">
                      {item.traceCode}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{item.queryTime}</div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeHistory(item.traceCode);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
