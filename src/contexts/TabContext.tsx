import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Tab {
  id: string;
  label: string;
  type: 'new' | 'file';
  fileId?: string;
  content?: string;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'>) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  openFile: (fileId: string, fileName: string, content?: string) => string;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const NEW_TAB_ID = 'new-tab';

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: NEW_TAB_ID,
      label: '新标签页',
      type: 'new',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(NEW_TAB_ID);
  const nextIdRef = React.useRef(1000);

  const addTab = useCallback((tab: Omit<Tab, 'id'>) => {
    const id = tab.type === 'new' ? `new-tab-${nextIdRef.current++}` : `file-${nextIdRef.current++}`;
    setTabs((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [...prev, { ...tab, id }];
    });
    setActiveTabId(id);
    return id;
  }, []);

  const closeTab = useCallback((id: string) => {
    const tabToClose = tabs.find((t) => t.id === id);
    if (!tabToClose) return;
    
    const remaining = tabs.filter((t) => t.id !== id);
    
    // 只有当关闭后没有任何标签页时，才创建新标签页
    let finalTabs = remaining;
    let newActiveTabId: string | null = null;
    
    if (remaining.length === 0) {
      const newTabId = `new-tab-${nextIdRef.current++}`;
      finalTabs = [{ id: newTabId, label: '新标签页', type: 'new' }];
      newActiveTabId = newTabId;
    }
    
    setTabs(finalTabs);
    
    if (activeTabId === id) {
      if (newActiveTabId) {
        setActiveTabId(newActiveTabId);
      } else if (remaining.length > 0) {
        const index = tabs.findIndex((t) => t.id === id);
        if (index > 0) {
          setActiveTabId(remaining[index - 1].id);
        } else {
          setActiveTabId(remaining[0].id);
        }
      }
    }
  }, [tabs, activeTabId]);

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const updateTabContent = useCallback((id: string, content: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, content } : tab))
    );
  }, []);

  const openFile = useCallback((fileId: string, fileName: string, content = '') => {
    const existingTab = tabs.find((t) => t.fileId === fileId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return existingTab.id;
    }
    
    // 如果当前标签是新标签页或文件类型，则替换它
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab && (currentTab.type === 'new' || currentTab.type === 'file')) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                label: fileName,
                type: 'file',
                fileId,
                content,
              }
            : tab
        )
      );
      return activeTabId;
    }
    
    // 否则创建新标签页
    return addTab({
      label: fileName,
      type: 'file',
      fileId,
      content,
    });
  }, [tabs, addTab, activeTabId]);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab,
        setActiveTab,
        updateTabContent,
        openFile,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
}
