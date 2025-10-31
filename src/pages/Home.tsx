import { useState } from 'react';
import { ActivityBar } from '../components/ActivityBar';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { RightPanel } from '../components/RightPanel';
import { StatusBar } from '../components/StatusBar';
import { TabProvider } from '../contexts/TabContext';

export default function Home() {
  const [activeIcon, setActiveIcon] = useState('explorer');

  return (
    <TabProvider>
      <div className="h-full grid grid-rows-[1fr,auto] bg-white dark:bg-slate-950">
        {/* Main area */}
        <div className="min-h-0 flex">
          <ActivityBar activeIcon={activeIcon} onIconClick={setActiveIcon} />
          {activeIcon === 'explorer' && <Sidebar />}
          <Editor />
          <RightPanel />
        </div>

        {/* Status bar */}
        <StatusBar />
      </div>
    </TabProvider>
  );
}
