import { List, Wand2, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AIChat } from './AIChat';
import { useTabs } from '../contexts/TabContext';
import { useEffect, useState, useRef } from 'react';
import { cn } from '../lib/utils';

interface Heading {
  id: string;
  level: number;
  text: string;
  elementIndex: number;
}

interface HeadingNode extends Heading {
  children: HeadingNode[];
}

function extractHeadings(html: string): Heading[] {
  if (!html) return [];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings: Heading[] = [];
  
  // 查找所有 h1-h6 标题，保持顺序
  const allHeadings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  allHeadings.forEach((el, index) => {
    const text = el.textContent?.trim() || '';
    if (text) {
      const level = parseInt(el.tagName.charAt(1));
      headings.push({
        id: `heading-${level}-${index}`,
        level,
        text,
        elementIndex: index,
      });
    }
  });
  
  return headings;
}

function buildHierarchy(headings: Heading[]): HeadingNode[] {
  const hierarchy: HeadingNode[] = [];
  const stack: HeadingNode[] = [];

  headings.forEach((heading) => {
    const node: HeadingNode = { ...heading, children: [] };
    
    // 移除栈中级别大于等于当前级别的项
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      hierarchy.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    // 只有一级和二级标题可以展开
    if (heading.level === 1 || heading.level === 2) {
      stack.push(node);
    }
  });

  return hierarchy;
}

export function RightPanel() {
  const { tabs, activeTabId } = useTabs();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<'outline' | 'ai'>('outline');
  const [selectedHeadingId, setSelectedHeadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab?.content && activeTab.type === 'file') {
      const extractedHeadings = extractHeadings(activeTab.content);
      setHeadings(extractedHeadings);
      // 默认展开所有一级标题
      const level1Ids = extractedHeadings
        .filter((h) => h.level === 1)
        .map((h) => h.id);
      setExpandedNodes(new Set(level1Ids));
    } else {
      setHeadings([]);
      setExpandedNodes(new Set());
    }
    setSelectedHeadingId(null);
    setSearchQuery('');
  }, [activeTab?.content, activeTab?.type]);

  const handleHeadingClick = (heading: Heading) => {
    setSelectedHeadingId(heading.id);
    
    // 在编辑器中查找对应的标题元素
    const editorElement = document.querySelector('.ProseMirror');
    if (!editorElement) return;

    const headingElements = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const targetElement = headingElements[heading.elementIndex];
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 高亮一下
      targetElement.classList.add('bg-yellow-200', 'dark:bg-yellow-900');
      setTimeout(() => {
        targetElement.classList.remove('bg-yellow-200', 'dark:bg-yellow-900');
      }, 1000);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const filteredHeadings = searchQuery
    ? headings.filter((h) => h.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : headings;

  const hierarchy = buildHierarchy(filteredHeadings);

  const renderHeading = (node: HeadingNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedHeadingId === node.id;
    const isLevel1 = node.level === 1;
    const isLevel2 = node.level === 2;

    return (
      <div key={node.id}>
        <button
          onClick={() => handleHeadingClick(node)}
          className={cn(
            'w-full text-left px-2 py-1.5 rounded transition-colors flex items-center gap-1',
            isSelected
              ? 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50',
            isLevel1 && 'text-sm font-medium',
            isLevel2 && 'text-sm'
          )}
          style={{ paddingLeft: depth === 0 ? '8px' : depth === 1 ? '24px' : '32px' }}
          title={node.text}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="flex-shrink-0 w-4 h-4 flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={12} className="text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronUp size={12} className="text-slate-500 dark:text-slate-400 rotate-[-90deg]" />
              )}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          <span className="truncate flex-1">{node.text}</span>
        </button>
        {hasChildren && isExpanded && (
          <div className={cn(
            'ml-4',
            depth === 0 && 'border-l border-slate-200 dark:border-slate-700'
          )}>
            {node.children.map((child) => renderHeading(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[300px] border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col">
      <div className="h-9 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedIcon('outline')}
            className={cn(
              'inline-flex items-center justify-center rounded-md transition-colors p-1.5',
              selectedIcon === 'outline'
                ? 'bg-slate-200/80 dark:bg-slate-700/80'
                : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
            )}
            aria-label="大纲"
            title="大纲"
          >
            <List size={16} className={cn(
              'text-slate-700 dark:text-slate-300',
              selectedIcon === 'outline' && 'text-slate-900 dark:text-slate-100'
            )} />
          </button>
          <button
            onClick={() => setSelectedIcon('ai')}
            className={cn(
              'inline-flex items-center justify-center rounded-md transition-colors p-1.5',
              selectedIcon === 'ai'
                ? 'bg-slate-200/80 dark:bg-slate-700/80'
                : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
            )}
            aria-label="AI"
            title="AI"
          >
            <Wand2 size={16} className={cn(
              'text-slate-700 dark:text-slate-300',
              selectedIcon === 'ai' && 'text-slate-900 dark:text-slate-100'
            )} />
          </button>
        </div>
        {selectedIcon === 'outline' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  searchInputRef.current?.focus();
                }
              }}
              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="搜索"
            >
              <Search size={14} className="text-slate-500 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? '展开' : '折叠'}
            >
              {isCollapsed ? (
                <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronUp size={14} className="text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>
        )}
      </div>
      {selectedIcon === 'outline' && !isCollapsed && (
        <>
          {searchQuery !== '' && (
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Search size={14} className="text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索大纲..."
                className="flex-1 text-sm bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <X size={12} className="text-slate-400" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-auto p-2">
            {hierarchy.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 px-2 py-4">
                未发现小标题。
              </div>
            ) : (
              <div className="space-y-0.5">
                {hierarchy.map((node) => renderHeading(node))}
              </div>
            )}
          </div>
        </>
      )}
      {selectedIcon === 'ai' && <AIChat />}
    </aside>
  );
}
