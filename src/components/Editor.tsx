import { X, Plus } from 'lucide-react';
import { useTabs } from '../contexts/TabContext';
import { MarkdownEditor } from './MarkdownEditor';
import { cn } from '../lib/utils';

export function Editor() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab, updateTabContent } = useTabs();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleAddTab = () => {
    addTab({
      label: '新标签页',
      type: 'new',
    });
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeTab(id);
  };

  return (
    <section className="flex-1 flex flex-col min-w-0">
      <div className="h-9 flex items-stretch bg-[#fcfcfc] dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-stretch min-w-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group relative flex items-center gap-2 px-4 text-sm cursor-pointer min-w-0 flex-shrink-0 transition-all duration-150',
                  isActive
                    ? 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-950 rounded-tl-lg rounded-tr-lg text-slate-900 dark:text-slate-100'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                style={{
                  marginTop: isActive ? 0 : '2px',
                  height: isActive ? '36px' : '35px',
                }}
              >
                <span className="truncate max-w-[200px]">{tab.label}</span>
                {isActive && (
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="opacity-100 transition-opacity rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="关闭标签页"
                  >
                    <X size={14} className="text-slate-500 dark:text-slate-400" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center px-2 bg-[#fcfcfc] dark:bg-slate-900/50 flex-shrink-0">
          <button
            onClick={handleAddTab}
            className="inline-flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="新建标签页"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab?.type === 'new' ? (
          <div className="h-full grid place-items-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 relative overflow-hidden">
            {/* 装饰性背景元素 */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10">
              <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-slate-900 dark:text-white text-xl font-semibold">新标签页</h2>
              <div className="mt-4 space-y-2 text-sm">
                <a className="block text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                  创建新文件 (⌘ N)
                </a>
                <a className="block text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                  打开文件 (⌘ O)
                </a>
                <a className="block text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                  查看近期文件 (⌘ O)
                </a>
                <a className="block text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                  关闭标签页
                </a>
              </div>
            </div>
          </div>
        ) : (
          <MarkdownEditor
            content={activeTab?.content || ''}
            onChange={(content) => {
              if (activeTabId) {
                updateTabContent(activeTabId, content);
              }
            }}
          />
        )}
      </div>
    </section>
  );
}
