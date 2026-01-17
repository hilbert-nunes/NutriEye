
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import AnalysisResults from './components/AnalysisResults';
import { analyzeLabels } from './services/geminiService';
import { AnalysisState } from './types';
import { LOADING_TIPS } from './constants/tips';


const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    images: [],
    isAnalyzing: false,
    result: null,
    error: null
  });

  const [activeTips, setActiveTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (state.isAnalyzing) {
      const shuffled = [...LOADING_TIPS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setActiveTips(selected);
      setCurrentTipIndex(0);

      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % selected.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [state.isAnalyzing]);

  const handleImagesReady = async (images: string[]) => {
    setState(prev => ({
      ...prev,
      images,
      isAnalyzing: true,
      error: null
    }));

    try {
      const result = await analyzeLabels(images);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        result
      }));
    } catch (err) {
      console.error("Analysis failed:", err);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: "Ocorreu um erro ao analisar o rótulo. Verifique sua conexão ou tente novamente com fotos mais nítidas."
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-8 pb-20">
        {!state.result && !state.isAnalyzing && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                Comer Bem é uma <span className="text-green-600 underline decoration-green-200 decoration-8 underline-offset-4">Ciência</span>.
              </h1>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Use o NutriEye para revelar o que os rótulos tentam esconder. Detectamos aditivos perigosos e sugerimos trocas inteligentes.
              </p>
            </div>

            <ImageUpload onImagesReady={handleImagesReady} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Alertas Químicos</h3>
                <p className="text-xs text-gray-500">Baseado nos mais recentes estudos da IARC e EFSA sobre carcinógenos.</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Macro-Equilíbrio</h3>
                <p className="text-xs text-gray-500">Analisamos a densidade proteica para garantir que você não coma calorias vazias.</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Trocas Inteligentes</h3>
                <p className="text-xs text-gray-500">Sugerimos produtos melhores com a mesma conveniência.</p>
              </div>
            </div>
          </div>
        )}

        {state.isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-green-100 rounded-full"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Processando Rótulos...</h2>

            <div className="mt-6 max-w-sm w-full bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Você sabia?</p>
              <p
                key={currentTipIndex}
                className="text-gray-600 text-sm font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                "{activeTips[currentTipIndex] || "Carregando dicas..."}"
              </p>
            </div>
          </div>
        )}

        {state.error && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-8">
            <div className="flex items-center gap-3 text-red-700 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold">Oops! Algo deu errado</h3>
            </div>
            <p className="text-sm text-red-600 mb-4">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null, isAnalyzing: false }))}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {state.result && <AnalysisResults data={state.result} />}
      </main>

      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest text-center">
            NutriEye © 2026 - Decisões Saudáveis Através da Ciência
          </p>
          <p className="text-[8px] text-gray-300 text-center max-w-xs">
            Esta análise é gerada por inteligência artificial e deve ser usada apenas como guia informativo. Consulte sempre um nutricionista.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
