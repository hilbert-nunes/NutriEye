
import React from 'react';
import { NutritionalAnalysis, DeepDiveIngredient } from '../types';

interface AnalysisResultsProps {
  data: NutritionalAnalysis;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className={`px-4 py-2 rounded-full border text-2xl font-black ${getColor()}`}>
      {score}/100
    </div>
  );
};

const DeepDiveItem: React.FC<{ item: DeepDiveIngredient }> = ({ item }) => {
  const getWarningColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
        <span className={`text-xs font-bold uppercase tracking-wider ${getWarningColor(item.warning_level)}`}>
          ⚠️ {item.warning_level}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300 italic">
        "{item.short_summary}"
      </p>
      <div className="space-y-3">
        {item.scientific_evidence.cancer_risk && (
          <div className="flex gap-3">
            <span className="text-xs font-bold w-20 shrink-0 text-gray-400">CÂNCER:</span>
            <span className="text-sm text-gray-600">{item.scientific_evidence.cancer_risk}</span>
          </div>
        )}
        {item.scientific_evidence.hormones && (
          <div className="flex gap-3">
            <span className="text-xs font-bold w-20 shrink-0 text-gray-400">HORMÔNIOS:</span>
            <span className="text-sm text-gray-600">{item.scientific_evidence.hormones}</span>
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-gray-50">
          <span className="text-xs font-bold w-20 shrink-0 text-green-600">CONSENSO:</span>
          <span className="text-sm font-medium text-gray-800">{item.scientific_evidence.general_consensus}</span>
        </div>
      </div>
    </div>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const fiberSodiumFeedback = data.macro_analysis.fiber_sodium_feedback || "Equilibrado";
  const isHighSodium = fiberSodiumFeedback.toLowerCase().includes("sódio") || fiberSodiumFeedback.toLowerCase().includes("sal");
  const isHighFiber = fiberSodiumFeedback.toLowerCase().includes("fibra");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Resumo Principal */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase">{data.product_name}</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{data.summary}</p>
          </div>
          <ScoreBadge score={data.score} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              Proteína/Caloria
            </div>
            <div className="font-bold text-gray-900 truncate">{data.macro_analysis.calories_protein_ratio}</div>
            <div className={`text-[10px] mt-1 font-bold ${data.macro_analysis.is_balanced ? 'text-green-600' : 'text-orange-600'}`}>
              {data.macro_analysis.is_balanced ? '✓ EQUILIBRADO' : '⚠ ALTO CALÓRICO'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 102.828 2.828l3.475-3.475a2 2 0 01.547-1.022l.477-2.387a6 6 0 01.517-3.86l.158-.318a6 6 0 00.517-3.86L10.21 6.05a2 2 0 00-.547-1.022l-2.387-2.387a2 2 0 10-2.828-2.828l3.475 3.475a2 2 0 011.022.547l2.387.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l2.387.477a2 2 0 001.022-.547l2.387-2.387a2 2 0 10-2.828-2.828l-3.475 3.475a2 2 0 01-.547 1.022l-.477 2.387a6 6 0 01-.517 3.86l-.158.318a6 6 0 00-.517 3.86l.477 2.387a2 2 0 00.547 1.022l2.387 2.387a2 2 0 102.828 2.828l-3.475-3.475z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              Sódio & Fibras
            </div>
            <div className="font-bold text-gray-900 truncate">{fiberSodiumFeedback}</div>
            <div className={`text-[10px] mt-1 font-bold ${isHighSodium ? 'text-red-600' : isHighFiber ? 'text-green-600' : 'text-blue-600'}`}>
              {isHighSodium ? '⚠ ALTO SÓDIO' : isHighFiber ? '✓ FONTE DE FIBRAS' : '✓ NÍVEIS OK'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 102.828 2.828l3.475-3.475a2 2 0 01.547-1.022l.477-2.387a6 6 0 01.517-3.86l.158-.318a6 6 0 00.517-3.86L10.21 6.05a2 2 0 00-.547-1.022l-2.387-2.387a2 2 0 10-2.828-2.828l3.475 3.475a2 2 0 011.022.547l2.387.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l2.387.477a2 2 0 001.022-.547l2.387-2.387a2 2 0 10-2.828-2.828l-3.475 3.475a2 2 0 01-.547 1.022l-.477 2.387a6 6 0 01-.517 3.86l-.158.318a6 6 0 00-.517 3.86l.477 2.387a2 2 0 00.547 1.022l2.387 2.387a2 2 0 102.828 2.828l-3.475-3.475z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              Processamento
            </div>
            <div className="font-bold text-gray-900 truncate">{data.ingredients_overview.count} itens</div>
            <div className={`text-[10px] mt-1 font-bold ${data.ingredients_overview.is_ultraprocessed ? 'text-red-600' : 'text-green-600'}`}>
              {data.ingredients_overview.is_ultraprocessed ? '⚠ ULTRAPROCESSADO' : '✓ MIN. PROCESSADO'}
            </div>
          </div>
        </div>
      </section>

      {/* The Good & The Bad */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pontos Positivos
          </h3>
          <ul className="space-y-3">
            {data.the_good.map((item, i) => (
              <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Pontos de Atenção
          </h3>
          <ul className="space-y-3">
            {data.the_bad.map((item, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Deep Dive Científico */}
      {data.deep_dive.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">!</span>
            Dossiê de Ingredientes
          </h3>
          {data.deep_dive.map((item, i) => (
            <DeepDiveItem key={i} item={item} />
          ))}
        </section>
      )}

      {/* Substituições Saudáveis */}
      <section className="mb-10">
        <h3 className="text-xl font-black text-gray-900 mb-6">Substituições Sugeridas</h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Alternativas Naturais</h4>
            <div className="space-y-6">
              {data.replacements_food.map((recipe, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs">
                    {recipe.calories}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{recipe.name}</h5>
                    <p className="text-xs text-gray-500 italic mt-1">{recipe.ingredients_brief}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Melhores Opções de Mercado</h4>
            <div className="space-y-4">
              {data.replacements_market.map((market, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-700 text-sm">{market.name}</span>
                  <span className="text-[9px] font-bold text-green-600 bg-white px-2 py-1 rounded-full shadow-sm border border-green-50 uppercase">
                    {market.benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={() => window.location.reload()}
        className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-sm"
      >
        Nova Análise
      </button>
    </div>
  );
};

export default AnalysisResults;
