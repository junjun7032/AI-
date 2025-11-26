
import React, { useState, useEffect } from 'react';
import { CATEGORIES, SUGGESTED_ALGORITHMS } from './constants';
import { AlgorithmExplanation, AlgorithmCategory } from './types';
import { generateAlgorithmExplanation } from './services/geminiService';
import { getStoredAlgorithm, storeAlgorithm } from './data/cacheRepository';
import AlgorithmPlayer from './components/AlgorithmPlayer';
import ChatPanel from './components/ChatPanel';
import { Search, Brain, Sparkles, ChevronRight, AlertCircle, Menu, X, Lightbulb, Database, Info, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AlgorithmCategory>('监督学习');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<AlgorithmExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // Helper to get current context for chat
  const getChatContext = () => {
      if (!currentAlgorithm) return "用户正在浏览仪表板。";
      const step = currentAlgorithm.steps[currentStepIndex];
      return `
        算法名称: ${currentAlgorithm.name}
        分类: ${currentAlgorithm.category}
        数据集演示: ${currentAlgorithm.datasetInfo?.name} - ${currentAlgorithm.datasetInfo?.description}
        简介: ${currentAlgorithm.summary}
        当前步骤 (${step.stepNumber}/${currentAlgorithm.steps.length}): ${step.title}
        步骤描述: ${step.description}
      `;
  };

  const handleSearch = async (term: string, forceRefresh = false) => {
    if (!term.trim()) return;
    setSearchQuery(term);
    setIsLoading(true);
    setError(null);
    setShowDatasetModal(false);
    setPendingQuestion(null);
    
    try {
      // 1. Try Cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = getStoredAlgorithm(term);
        if (cached) {
            setCurrentAlgorithm(cached);
            setCurrentStepIndex(0);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
            return;
        }
      }

      // 2. Fetch from API
      const explanation = await generateAlgorithmExplanation(term);
      
      // 3. Save to Cache
      storeAlgorithm(term, explanation);

      setCurrentAlgorithm(explanation);
      setCurrentStepIndex(0);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      setError("解释生成失败。请检查网络或尝试更简单的术语。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
      if (searchQuery) {
          handleSearch(searchQuery, true);
      } else if (currentAlgorithm) {
          handleSearch(currentAlgorithm.name, true);
      }
  };

  const handleTermClick = (term: string) => {
      const question = `请解释一下"${term}"在这个算法步骤中具体代表什么？能否用通俗的语言举个例子？`;
      setPendingQuestion(question);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Dataset Info Modal */}
      {showDatasetModal && currentAlgorithm && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowDatasetModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                   <Database className="text-blue-500" size={18}/>
                   数据集详情
                </h3>
                <button 
                    onClick={() => setShowDatasetModal(false)} 
                    className="p-1 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
             </div>
             <div className="p-6 space-y-6">
                <div>
                   <h4 className="text-lg font-semibold text-blue-400 mb-1">{currentAlgorithm.datasetInfo.name}</h4>
                   <p className="text-slate-300 leading-relaxed text-sm">{currentAlgorithm.datasetInfo.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                         <label className="text-xs text-slate-500 uppercase font-bold block mb-2">样本规模</label>
                         <div className="text-slate-200 font-mono text-sm">{currentAlgorithm.datasetInfo.sampleCount}</div>
                     </div>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                         <label className="text-xs text-slate-500 uppercase font-bold block mb-2">特征字段</label>
                         <div className="flex flex-wrap gap-1.5">
                            {currentAlgorithm.datasetInfo.fields?.map((f, i) => (
                                <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 font-medium">{f}</span>
                            ))}
                         </div>
                     </div>
                </div>

                <div>
                     <label className="text-xs text-slate-500 uppercase font-bold block mb-2">数据分布特征</label>
                     <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-sm text-slate-300">
                        {currentAlgorithm.datasetInfo.distribution}
                     </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">AI 算法大师</h1>
        </div>

        <div className="p-4">
            <div className="relative mb-6">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    placeholder="搜索算法..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition outline-none placeholder:text-slate-500"
                />
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            </div>

            <div className="space-y-6 overflow-y-auto h-[calc(100vh-200px)] pr-2">
                {CATEGORIES.map(cat => (
                    <div key={cat}>
                        <button 
                            onClick={() => setSelectedCategory(cat)}
                            className={`w-full flex items-center justify-between text-sm font-medium mb-2 hover:text-blue-400 transition ${selectedCategory === cat ? 'text-blue-400' : 'text-slate-400'}`}
                        >
                            {cat}
                            {selectedCategory === cat && <ChevronRight size={14} />}
                        </button>
                        
                        {selectedCategory === cat && (
                            <div className="space-y-1 ml-2 border-l border-slate-800 pl-3">
                                {SUGGESTED_ALGORITHMS[cat].map(algo => (
                                    <button
                                        key={algo}
                                        onClick={() => handleSearch(algo)}
                                        className="block w-full text-left text-sm text-slate-500 hover:text-slate-200 py-1 transition-colors"
                                    >
                                        {algo}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            Powered by Google Gemini
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Center Visualizer */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {!currentAlgorithm && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl shadow-blue-900/20">
                        <Sparkles className="text-blue-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">可视化掌握 AI 算法</h2>
                    <p className="text-slate-400 max-w-md mb-8">
                        请从侧边栏选择一个分类，或搜索任意机器学习算法（例如 "BERT", "随机森林"），即可生成分步可视化指南。
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['Transformer', 'K-Means', 'CNN', 'Linear Regression'].map(tag => (
                            <button 
                                key={tag}
                                onClick={() => handleSearch(tag)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm text-slate-300 transition"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="h-full flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-slate-400 animate-pulse">正在生成专家级可视化解释...</p>
                    <p className="text-xs text-slate-600 mt-2">正在分析算法深度机制...</p>
                </div>
            )}

            {error && (
                 <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="text-red-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">出错了</h3>
                    <p className="text-slate-400 max-w-md">{error}</p>
                    <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">重试</button>
                 </div>
            )}

            {currentAlgorithm && !isLoading && (
                <div className="flex flex-col h-full">
                    <header className="bg-slate-900/50 border-b border-slate-800 p-4 md:p-6 backdrop-blur z-10">
                        <div className="flex justify-between items-start">
                             <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] uppercase tracking-wider text-slate-400">
                                        {currentAlgorithm.category}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentAlgorithm.name}</h1>
                                <p className="text-slate-400 text-sm mt-1 line-clamp-2 md:line-clamp-none">{currentAlgorithm.summary}</p>
                             </div>
                             
                             <div className="flex gap-3 items-center">
                                 {/* Dataset Info Card */}
                                 {currentAlgorithm.datasetInfo && (
                                     <div 
                                        onClick={() => setShowDatasetModal(true)}
                                        className="hidden lg:block bg-slate-800/50 border border-slate-700 rounded-lg p-3 max-w-xs cursor-pointer hover:bg-slate-800 transition group relative"
                                        role="button"
                                        title="点击查看数据集详情"
                                     >
                                         <div className="flex items-center justify-between gap-4 text-blue-400 text-xs font-bold mb-1">
                                             <span className="flex items-center gap-2"><Database size={12} /> 演示数据集</span>
                                             <Info size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                         </div>
                                         <div className="text-slate-200 text-sm font-semibold group-hover:text-white transition-colors">{currentAlgorithm.datasetInfo.name}</div>
                                         <div className="text-slate-500 text-xs mt-1 truncate">{currentAlgorithm.datasetInfo.description}</div>
                                     </div>
                                 )}

                                 {/* Refresh Button */}
                                 <button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition shadow-lg"
                                    title="重新生成算法解释 (Refresh)"
                                 >
                                    <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                                 </button>
                             </div>
                        </div>
                        
                        {/* Usage Scenarios Section */}
                        {currentAlgorithm.useCases && currentAlgorithm.useCases.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 items-center">
                                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mr-1">
                                    <Lightbulb size={12} /> 使用场景:
                                </span>
                                {currentAlgorithm.useCases.map((scenario, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded bg-blue-900/30 border border-blue-800/50 text-blue-300 text-xs">
                                        {scenario}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>
                    <div className="flex-1 overflow-hidden">
                        <AlgorithmPlayer 
                            data={currentAlgorithm} 
                            onStepChange={setCurrentStepIndex}
                            onTermClick={handleTermClick}
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Right Chat Panel (Visible on Desktop if algo selected) */}
        <div className={`
            fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 transform transition-transform duration-300 z-30
            md:relative md:translate-x-0 md:w-80
            ${(currentAlgorithm) ? 'translate-x-0' : 'translate-x-full hidden md:flex'}
        `}>
             <ChatPanel 
                context={getChatContext()} 
                pendingQuestion={pendingQuestion}
                onQuestionHandled={() => setPendingQuestion(null)}
             />
        </div>

      </main>
    </div>
  );
};

export default App;
