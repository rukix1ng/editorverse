import { cn } from '../lib/utils';
import { Files, Search, GitBranch, Play, Puzzle, Settings } from 'lucide-react';

const icons = [
  { id: 'explorer', Icon: Files },
  { id: 'search', Icon: Search },
  { id: 'scm', Icon: GitBranch },
  { id: 'run', Icon: Play },
  { id: 'extensions', Icon: Puzzle },
];

export function ActivityBar() {
  return (
    <aside className="h-full w-[52px] border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex flex-col items-center py-2 gap-2">
      {icons.map(({ id, Icon }) => (
        <button
          key={id}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
          )}
          aria-label={id}
        >
          <Icon size={20} />
        </button>
      ))}
      <div className="mt-auto" />
      <button
        className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="settings"
      >
        <Settings size={20} />
      </button>
    </aside>
  );
}
