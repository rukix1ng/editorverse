import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect } from 'react';
import { Toolbar } from './Toolbar';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-slate-100 dark:bg-slate-800 rounded-md p-3 font-mono text-sm my-4',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4',
          },
        },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0 my-4',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-2',
        },
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for command menu',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300',
        },
      }),
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-ul:text-slate-700 dark:prose-ul:text-slate-300 prose-ol:text-slate-700 dark:prose-ol:text-slate-300 max-w-none focus:outline-none px-8 py-6 min-h-full relative',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    
    const currentContent = editor.getHTML();
    const newContent = content || '<p></p>';
    
    if (currentContent !== newContent) {
      editor.commands.setContent(newContent);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        editor.setEditable(true);
      }, 0);
    }
  }, [editor]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-slate-400 dark:text-slate-500">加载编辑器...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-slate-950">
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
