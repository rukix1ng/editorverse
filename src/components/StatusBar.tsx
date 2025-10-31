import { Settings } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="h-7 border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 flex items-center justify-between px-3 text-xs">
      <div className="text-slate-700 dark:text-slate-300">AI learning</div>
      <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
        <Settings size={14} />
        设置
      </button>
    </div>
  );
}
