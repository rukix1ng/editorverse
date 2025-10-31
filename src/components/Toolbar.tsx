import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  Undo,
  Redo,
  ChevronDown,
  Type,
  FunctionSquare,
  ListChecks,
  Plus,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  const setHeading = (level: number) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
    setShowHeadingMenu(false);
  };

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    if (editor.isActive('heading', { level: 4 })) return 'H4';
    if (editor.isActive('heading', { level: 5 })) return 'H5';
    if (editor.isActive('heading', { level: 6 })) return 'H6';
    return 'T';
  };

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-slate-200 bg-white">
      {/* Heading/Text Style */}
      <div className="relative">
        <button
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
            editor.isActive('heading') && 'bg-slate-50'
          )}
        >
          <Type size={16} className="text-slate-400" />
          <span className="text-xs text-slate-400">{getCurrentHeading()}</span>
          <ChevronDown size={12} className="text-slate-400" />
        </button>
        {showHeadingMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowHeadingMenu(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[120px]">
              <button
                onClick={() => setHeading(0)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
              >
                文本
              </button>
              <button
                onClick={() => setHeading(1)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
              >
                标题 1
              </button>
              <button
                onClick={() => setHeading(2)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
              >
                标题 2
              </button>
              <button
                onClick={() => setHeading(3)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
              >
                标题 3
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('bold') && 'bg-slate-50'
        )}
      >
        <Bold size={16} className="text-slate-400" />
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('italic') && 'bg-slate-50'
        )}
      >
        <Italic size={16} className="text-slate-400" />
      </button>

      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('underline') && 'bg-slate-50'
        )}
      >
        <Underline size={16} className="text-slate-400" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('strike') && 'bg-slate-50'
        )}
      >
        <Strikethrough size={16} className="text-slate-400" />
      </button>

      {/* Code */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('code') && 'bg-slate-50'
        )}
      >
        <Code size={16} className="text-slate-400" />
      </button>

      {/* Code Block */}
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('codeBlock') && 'bg-slate-50'
        )}
      >
        <code className="text-xs text-slate-400 font-mono">&lt;/&gt;</code>
      </button>

      {/* Formula (placeholder - could be extended later) */}
      <button
        className="px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
        title="公式"
      >
        <FunctionSquare size={16} className="text-slate-400" />
      </button>

      {/* Link */}
      <button
        onClick={() => {
          const url = window.prompt('输入链接地址:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('link') && 'bg-slate-50'
        )}
      >
        <Link size={16} className="text-slate-400" />
      </button>

      {/* Image */}
      <button
        onClick={() => {
          const url = window.prompt('输入图片地址:');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
      >
        <Image size={16} className="text-slate-400" />
      </button>

      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('bulletList') && 'bg-slate-50'
        )}
      >
        <List size={16} className="text-slate-400" />
      </button>

      {/* Ordered List */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('orderedList') && 'bg-slate-50'
        )}
      >
        <ListOrdered size={16} className="text-slate-400" />
      </button>

      {/* Task List */}
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(
          'px-2 py-1.5 rounded hover:bg-slate-50 transition-colors',
          editor.isActive('taskList') && 'bg-slate-50'
        )}
      >
        <ListChecks size={16} className="text-slate-400" />
      </button>

      {/* Undo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1.5 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Undo size={16} className="text-slate-400" />
      </button>

      {/* Redo */}
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1.5 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Redo size={16} className="text-slate-400" />
      </button>

      {/* Insert Block (I+) */}
      <button
        className="px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
        title="插入块"
      >
        <div className="flex items-center gap-0.5">
          <Type size={14} className="text-slate-400" />
          <Plus size={12} className="text-slate-400" />
        </div>
      </button>
    </div>
  );
}

