
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Loader2, Sparkles } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatPanelProps {
  context: string; // The current algorithm description/step
  pendingQuestion?: string | null;
  onQuestionHandled: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ context, pendingQuestion, onQuestionHandled }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是你的 AI 学习助手。点击左侧的**关键概念**，或者直接向我提问，我可以为你深入解释任何细节。', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle triggered questions from external components (like clicking a Key Term)
  useEffect(() => {
    if (pendingQuestion && !isLoading) {
        handleSend(pendingQuestion);
        onQuestionHandled();
    }
  }, [pendingQuestion]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const responseText = await chatWithAI(context, textToSend, history);
      
      const aiMsg: ChatMessage = { role: 'model', text: responseText || "无法生成回复。", timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: '抱歉，连接 AI 时出现错误，请稍后再试。', timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const content = messages.map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI学习记录.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <Bot size={18} className="text-blue-400" />
            AI 导师
        </h3>
        <button onClick={handleDownload} className="text-slate-400 hover:text-white transition" title="保存对话">
            <Download size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                ${msg.role === 'model' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}
            `}>
                {msg.role === 'model' ? <Sparkles size={14} /> : <User size={16} />}
            </div>
            <div className={`
                p-3.5 rounded-2xl text-sm leading-relaxed max-w-[90%] shadow-sm
                ${msg.role === 'model' 
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none'}
            `}>
                {msg.role === 'model' ? (
                     <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                        </ReactMarkdown>
                     </div>
                ) : (
                    msg.text
                )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                 <Bot size={16} className="text-slate-500" />
             </div>
             <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span className="text-xs text-slate-500">正在思考...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="对当前步骤提问..."
                className="w-full bg-slate-800 text-slate-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 placeholder:text-slate-500 transition-all"
            />
            <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 transition shadow-lg shadow-blue-900/20"
            >
                <Send size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;