import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Bot, User, ChevronDown, Loader2, Clock, MoreVertical, AtSign, Globe, Image as ImageIcon, Mic, Infinity, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';

export type ChatMode = 'chat' | 'agent';
export type ComposerType = 'composer-1' | 'composer-2' | 'composer-3';
export type Model = 'gpt-4' | 'gpt-3.5' | 'claude-3-opus' | 'claude-3-sonnet';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  composer: ComposerType;
  model: Model;
  createdAt: number;
  updatedAt: number;
}

interface AIChatProps {
  width?: number;
}

export function AIChat({ width = 300 }: AIChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>('agent');
  const [composer, setComposer] = useState<ComposerType>('composer-1');
  const [model, setModel] = useState<Model>('gpt-4');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showComposerMenu, setShowComposerMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextIdRef = useRef(1000);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    // 初始化示例对话数据
    if (conversations.length === 0) {
      const newConv = createNewConversation();
      const oldConv: Conversation = {
        id: 'conv-1',
        title: '初始化react项目并设置home路由',
        messages: [],
        mode: 'agent',
        composer: 'composer-1',
        model: 'gpt-4',
        createdAt: Date.now() - 1000 * 60 * 60 * 17, // 17小时前
        updatedAt: Date.now() - 1000 * 60 * 60 * 17,
      };
      setConversations([newConv, oldConv]);
      setActiveConversationId(newConv.id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  useEffect(() => {
    // 更新活动对话的模式和模型
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, mode, composer, model }
            : conv
        )
      );
    }
  }, [mode, composer, model, activeConversationId]);

  const createNewConversation = (): Conversation => {
    const id = `conv-${nextIdRef.current++}`;
    return {
      id,
      title: 'New Chat',
      messages: [],
      mode,
      composer,
      model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

  const handleNewConversation = () => {
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    // 更新对话
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title: conv.messages.length === 0 ? input.trim().slice(0, 30) : conv.title,
              updatedAt: Date.now(),
            }
          : conv
      )
    );

    setInput('');
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `这是一个模拟的AI回复。您的问题是：${userMessage.content}\n\n在完整实现中，这里会调用实际的AI API来生成回复。`,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : conv
        )
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 60000) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 显示最近的对话（最多显示前2个）
  const recentConversations = conversations.slice(0, 2);

  return (
    <div className="h-full flex flex-col bg-[#f5f5f5]">
      {/* Top Header with Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white">
        {/* Tabs */}
        <div ref={tabsContainerRef} className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
          {recentConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                activeConversationId === conv.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {conv.title.length > 20 ? `${conv.title.slice(0, 20)}...` : conv.title}
            </button>
          ))}
        </div>
        
        {/* Right Icons */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={handleNewConversation}
            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 transition-colors"
            title="新建对话"
          >
            <Plus size={16} className="text-slate-600" />
          </button>
          <button
            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 transition-colors"
            title="历史记录"
          >
            <Clock size={16} className="text-slate-600" />
          </button>
          <button
            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 transition-colors"
            title="更多选项"
          >
            <MoreVertical size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-3 border-b border-slate-200">
        {/* Main Input Container - White Background */}
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          {/* Input Field */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Plan, @ for context, / for commands"
            rows={1}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
            style={{
              minHeight: '24px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />

          {/* Controls Row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
            {/* Left Side - Agent & Composer */}
            <div className="flex items-center gap-3">
              {/* Agent Button */}
              <div className="relative">
                <button
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Infinity size={12} className="text-slate-600" />
                  <span>Agent</span>
                  <ChevronDown size={12} className="text-slate-500" />
                </button>
                {showModeMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowModeMenu(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                      <button
                        onClick={() => {
                          setMode('agent');
                          setShowModeMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition-colors flex items-center gap-2',
                          mode === 'agent' && 'bg-slate-50'
                        )}
                      >
                        <Infinity size={12} />
                        Agent
                      </button>
                      <button
                        onClick={() => {
                          setMode('chat');
                          setShowModeMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition-colors',
                          mode === 'chat' && 'bg-slate-50'
                        )}
                      >
                        Chat
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Composer Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowComposerMenu(!showComposerMenu)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <span>Composer 1</span>
                  <ChevronDown size={12} className="text-slate-500" />
                </button>
                {showComposerMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowComposerMenu(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                      {(['composer-1', 'composer-2', 'composer-3'] as ComposerType[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setComposer(c);
                            setShowComposerMenu(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition-colors',
                            composer === c && 'bg-slate-50'
                          )}
                        >
                          {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-1">
              <button
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                title="@ 提及"
              >
                <AtSign size={14} className="text-slate-600" />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                title="网络搜索"
              >
                <Globe size={14} className="text-slate-600" />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                title="上传图片"
              >
                <ImageIcon size={14} className="text-slate-600" />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                title="语音输入"
              >
                <Mic size={14} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Empty when no messages */}
      <div className="flex-1 overflow-auto bg-white">
        {activeConversation?.messages.length === 0 ? (
          <div className="h-full w-full" />
        ) : (
          <div className="px-4 py-4 space-y-4">
            {activeConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center mt-0.5">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center mt-0.5">
                    <User size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center mt-0.5">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-slate-100 rounded-lg px-3 py-2">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Past Chats - Bottom Left */}
      <div className="border-t border-slate-200 bg-white">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-medium text-slate-900">Past Chats</span>
          <ChevronDown
            size={16}
            className={cn(
              'text-slate-500 transition-transform',
              showHistory && 'rotate-180'
            )}
          />
        </button>
        {showHistory && (
          <div className="max-h-64 overflow-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between',
                  activeConversationId === conv.id && 'bg-slate-50'
                )}
              >
                <span className="truncate text-slate-900">{conv.title}</span>
                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                  {formatTimeAgo(conv.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
