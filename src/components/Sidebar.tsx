import React from 'react';
import { ChevronRight, FilePlus, FolderPlus, ChevronsDownUp, File } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';
import { useTabs } from '../contexts/TabContext';

interface TreeItem {
  id: string;
  name: string;
  isFolder?: boolean;
  children?: TreeItem[];
}

const initialTree: TreeItem[] = [
  {
    id: '01',
    name: '01 每日学习记录',
    isFolder: true,
    children: [
      { id: '20250917', name: '20250917', isFolder: false },
      { id: '20250918', name: '20250918', isFolder: false },
      { id: '20250919', name: '20250919', isFolder: false },
    ],
  },
  { id: '02', name: '02 核心概念', isFolder: true, children: [{ id: '概念A', name: '概念', isFolder: false }] },
  {
    id: '03',
    name: '03 实践项目',
    isFolder: true,
    children: [
      {
        id: '产品洞察',
        name: '产品洞察',
        isFolder: true,
        children: [
          { id: 'mulerun', name: 'MuleRun 颗粒快跑深度体验', isFolder: false },
          { id: '模型实践', name: '模型实践', isFolder: false },
        ],
      },
    ],
  },
  { id: '04', name: '04 资源收集', isFolder: true },
  {
    id: '05',
    name: '05 每周复盘',
    isFolder: true,
    children: [
      {
        id: '2025-10-30',
        name: '2025-10-30',
        isFolder: true,
        children: [
          { id: '未命名1', name: '未命名', isFolder: false },
          { id: '未命名2', name: '未命名', isFolder: false },
          { id: '指南手册', name: '指导手册', isFolder: false },
          { id: 'hi', name: 'hi', isFolder: false },
        ],
      },
    ],
  },
];

function collectIds(items: TreeItem[]): string[] {
  const ids: string[] = [];
  const walk = (nodes: TreeItem[]) => {
    for (const n of nodes) {
      ids.push(n.id);
      if (n.children) walk(n.children);
    }
  };
  walk(items);
  return ids;
}

function findItemById(items: TreeItem[], id: string): TreeItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getAllDescendantIds(item: TreeItem): string[] {
  const ids: string[] = [];
  const walk = (node: TreeItem) => {
    if (node.children) {
      for (const child of node.children) {
        ids.push(child.id);
        walk(child);
      }
    }
  };
  walk(item);
  return ids;
}

function removeItemById(items: TreeItem[], id: string): TreeItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children) {
        return { ...item, children: removeItemById(item.children, id) };
      }
      return item;
    });
}

function sortTreeItems(items: TreeItem[]): TreeItem[] {
  return [...items].sort((a, b) => {
    const aIsFolder = a.isFolder || (a.children && a.children.length > 0);
    const bIsFolder = b.isFolder || (b.children && b.children.length > 0);
    if (aIsFolder !== bIsFolder) {
      return aIsFolder ? -1 : 1;
    }
    return a.name.localeCompare(b.name, 'zh-CN', { numeric: true });
  });
}

function updateTree(
  items: TreeItem[],
  targetId: string | null,
  newItem: TreeItem | null,
  updateFn?: (item: TreeItem) => TreeItem
): TreeItem[] {
  const result: TreeItem[] = [];
  for (const item of items) {
    if (targetId === null && newItem) {
      result.push(item);
    } else if (item.id === targetId) {
      if (updateFn) {
        result.push(updateFn(item));
      } else if (newItem) {
        const updated = { ...item, children: [...(item.children || []), newItem] };
        updated.children = sortTreeItems(updated.children || []);
        result.push(updated);
      } else {
        result.push(item);
      }
    } else if (item.children) {
      const updated = updateTree(item.children, targetId, newItem, updateFn);
      result.push({ ...item, children: updated });
    } else {
      result.push(item);
    }
  }
  if (targetId === null && newItem) {
    result.push(newItem);
  }
  return sortTreeItems(result);
}

function moveItem(items: TreeItem[], draggedId: string, targetId: string): TreeItem[] {
  let draggedItem: TreeItem | null = null;
  
  const findAndRemove = (nodes: TreeItem[]): TreeItem[] => {
    const result: TreeItem[] = [];
    for (const node of nodes) {
      if (node.id === draggedId) {
        draggedItem = { ...node };
        continue;
      }
      if (node.children) {
        result.push({ ...node, children: findAndRemove(node.children) });
      } else {
        result.push(node);
      }
    }
    return result;
  };
  
  const cleaned = findAndRemove([...items]);
  if (!draggedItem) return items;
  
  return updateTree(cleaned, targetId, draggedItem);
}

function Row({
  item,
  depth = 0,
  expanded,
  editingId,
  dragOverId,
  draggedId,
  onToggle,
  onEdit,
  onRename,
  onCancelEdit,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onFileClick,
}: {
  item: TreeItem;
  depth?: number;
  expanded: Set<string>;
  editingId: string | null;
  dragOverId: string | null;
  draggedId: string | null;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCancelEdit: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string | null) => void;
  onDragEnd: () => void;
  onDrop: (draggedId: string, targetId: string) => void;
  onFileClick?: (id: string, name: string) => void;
}) {
  const isFolder = item.isFolder || (item.children && item.children.length > 0);
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = expanded.has(item.id);
  const isEditing = editingId === item.id;
  const isDragOver = dragOverId === item.id;
  const isDragging = draggedId === item.id;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newName = inputRef.current?.value.trim() || '未命名';
      onRename(item.id, newName);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelEdit();
    }
  };

  const handleBlur = () => {
    const newName = inputRef.current?.value.trim() || '未命名';
    onRename(item.id, newName);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    onDragStart(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isEditing || draggedId === item.id || !isFolder) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(item.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isEditing || !isFolder) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onDragOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isEditing || !isFolder || draggedId === item.id || !draggedId) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    onDrop(draggedId, item.id);
    onDragOver(null);
  };

  return (
    <div className="text-sm">
      <div
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group flex items-center gap-1 py-0.5 pr-2 pl-2 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-default',
          isEditing && 'bg-indigo-50 dark:bg-indigo-950/30',
          isDragOver && isFolder && 'bg-indigo-100 dark:bg-indigo-900/50',
          isDragging && 'opacity-50'
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={(e) => {
          if (isEditing) return;
          if (isFolder) {
            onToggle(item.id);
          } else if (onFileClick) {
            onFileClick(item.id, item.name);
          }
        }}
        onDoubleClick={(e) => {
          if (!isEditing) {
            e.stopPropagation();
            onEdit(item.id);
          }
        }}
      >
        {isFolder ? (
          <ChevronRight
            className={cn(
              'h-4 w-4 text-slate-500 transition-transform',
              isOpen && 'rotate-90'
            )}
          />
        ) : (
          <span className="inline-block w-4" />
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            defaultValue={item.name}
            className="flex-1 min-w-0 px-1 py-0.5 text-sm bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate text-slate-800 dark:text-slate-200">{item.name}</span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <Row
              key={child.id}
              item={child}
              depth={depth + 1}
              expanded={expanded}
              editingId={editingId}
              dragOverId={dragOverId}
              draggedId={draggedId}
              onToggle={onToggle}
              onEdit={onEdit}
              onRename={onRename}
              onCancelEdit={onCancelEdit}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}



export function Sidebar() {
  const { openFile } = useTabs();
  const [tree, setTree] = React.useState<TreeItem[]>(initialTree);
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(initialTree.map((t) => t.id))
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [dragPosition, setDragPosition] = React.useState<{ x: number; y: number } | null>(null);
  const nextIdRef = React.useRef(1000);

  const allIds = React.useMemo(() => collectIds(tree), [tree]);

  React.useEffect(() => {
    const handleDrag = (e: DragEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleDragEnd = () => {
      setDragPosition(null);
      setDragOverId(null);
    };

    if (draggedId) {
      document.addEventListener('dragover', handleDrag);
      document.addEventListener('dragend', handleDragEnd);
      return () => {
        document.removeEventListener('dragover', handleDrag);
        document.removeEventListener('dragend', handleDragEnd);
      };
    }
  }, [draggedId]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setExpanded((prev) => {
      if (prev.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  };

  const createFile = () => {
    const newId = `file-${nextIdRef.current++}`;
    const newFile: TreeItem = {
      id: newId,
      name: '未命名',
      isFolder: false,
    };
    setTree((prev) => updateTree(prev, null, newFile));
    setEditingId(newId);
  };

  const createFolder = () => {
    const newId = `folder-${nextIdRef.current++}`;
    const newFolder: TreeItem = {
      id: newId,
      name: '未命名',
      isFolder: true,
      children: [],
    };
    setTree((prev) => updateTree(prev, null, newFolder));
    setExpanded((prev) => new Set(prev).add(newId));
    setEditingId(newId);
  };

  const handleRename = (id: string, newName: string) => {
    if (newName) {
      setTree((prev) =>
        updateTree(prev, id, null, (item) => ({ ...item, name: newName }))
      );
    }
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (id: string | null) => {
    if (id && draggedId) {
      const draggedItem = findItemById(tree, draggedId);
      if (draggedItem) {
        const targetItem = findItemById(tree, id);
        if (targetItem && targetItem.isFolder) {
          const descendants = getAllDescendantIds(targetItem);
          if (!descendants.includes(draggedId) && draggedId !== id) {
            setDragOverId(id);
            return;
          }
        }
      }
    }
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    
    setTree((prev) => {
      const draggedItem = findItemById(prev, draggedId);
      const targetItem = findItemById(prev, targetId);
      
      if (!draggedItem || !targetItem || !targetItem.isFolder) return prev;
      
      const descendants = getAllDescendantIds(targetItem);
      if (descendants.includes(draggedId)) return prev;
      
      const moved = moveItem(prev, draggedId, targetId);
      setExpanded((current) => {
        if (!current.has(targetId)) {
          return new Set(current).add(targetId);
        }
        return current;
      });
      
      return moved;
    });
    
    setDraggedId(null);
    setDragOverId(null);
  };

  const draggedItem = draggedId ? findItemById(tree, draggedId) : null;

  return (
    <>
      <aside className="w-[260px] border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur flex flex-col">
        <div className="h-9 flex items-center justify-between px-3 text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
          <span className="uppercase">我的文库</span>
          <div className="flex items-center gap-1">
            <button
              title="新建文件"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              onClick={createFile}
              aria-label="create-file"
            >
              <FilePlus size={16} />
            </button>
            <button
              title="添加文件夹"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              onClick={createFolder}
              aria-label="add-folder"
            >
              <FolderPlus size={16} />
            </button>
            <button
              title="折叠/展开全部"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              onClick={toggleAll}
              aria-label="toggle-all"
            >
              <ChevronsDownUp size={16} />
            </button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-1 py-2">
            {tree.map((item) => (
              <Row
                key={item.id}
                item={item}
                expanded={expanded}
                editingId={editingId}
                dragOverId={dragOverId}
                draggedId={draggedId}
                onToggle={toggle}
                onEdit={handleEdit}
                onRename={handleRename}
                onCancelEdit={handleCancelEdit}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onFileClick={(fileId, fileName) => {
                  openFile(fileId, fileName);
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </aside>
      {draggedItem && dragOverId && dragPosition && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-800 text-white text-xs px-3 py-2 rounded shadow-lg flex items-center gap-2"
          style={{
            left: dragPosition.x + 10,
            top: dragPosition.y + 10,
          }}
        >
          <File size={14} />
          <span>{draggedItem.name}</span>
          <span className="text-slate-400">
            移动至 '{findItemById(tree, dragOverId)?.name || ''}'
          </span>
        </div>
      )}
    </>
  );
}
