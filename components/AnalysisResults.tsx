
import React from 'react';
import { NutritionalAnalysis, DeepDiveIngredient } from '../types';

interface AnalysisResultsProps {
  data: NutritionalAnalysis;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 85) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
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
      case 'safe': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const isSafe = item.warning_level === 'safe';

  return (
    <div className={`bg-white border rounded-xl p-5 mb-4 shadow-sm ${isSafe ? 'border-gray-100' : 'border-red-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
          {item.technological_function && (
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Função: {item.technological_function}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-gray-50 border ${getWarningColor(item.warning_level)}`}>
          {isSafe ? '✓ SEGURO' : `⚠️ ${item.warning_level}`}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300 italic">
        "{item.short_summary}"
      </p>
      <div className="space-y-3">
        {!isSafe && item.scientific_evidence?.cancer_risk && (
          <div className="flex gap-3">
            <span className="text-[10px] font-bold w-20 shrink-0 text-gray-400">CÂNCER:</span>
            <span className="text-sm text-gray-600">{item.scientific_evidence.cancer_risk}</span>
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-gray-50">
          <span className="text-[10px] font-bold w-20 shrink-0 text-gray-400">CIÊNCIA:</span>
          <span className="text-sm font-medium text-gray-800">{item.scientific_evidence?.general_consensus}</span>
        </div>
      </div>
    </div>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const sodiumClass = data.macro_analysis.sodium_classification;
  const isExcellentSodium = sodiumClass === "muito baixo" || sodiumClass === "baixo";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {data.ingredients_overview.clean_label && (
                <span className="text-[9px] font-black bg-green-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">Clean Label</span>
              )}
              <h1 className="text-2xl font-black text-gray-900 leading-tight uppercase">{data.product_name}</h1>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{data.summary}</p>
          </div>
          <ScoreBadge score={data.score} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Densidade Proteica</div>
            <div className="font-bold text-gray-900">{data.macro_analysis.calories_protein_ratio}</div>
            <div className={`text-[10px] mt-1 font-bold ${data.macro_analysis.is_balanced ? 'text-green-600' : 'text-orange-600'}`}>
              {data.macro_analysis.is_balanced ? '✓ EQUILIBRADO' : '⚠ ALTO CALÓRICO'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Sódio (ANVISA)</div>
            <div className="font-bold text-gray-900 capitalize">{sodiumClass} ({data.macro_analysis.sodium_mg_per_100g}mg)</div>
            <div className={`text-[10px] mt-1 font-bold ${isExcellentSodium ? 'text-green-600' : sodiumClass === 'moderado' ? 'text-yellow-600' : 'text-red-600'}`}>
              {isExcellentSodium ? '✓ NÍVEL EXCELENTE' : sodiumClass === 'moderado' ? '⚠ MODERADO' : '⚠ ALTO SÓDIO'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ingredientes</div>
            <div className="font-bold text-gray-900">{data.ingredients_overview.count} itens</div>
            <div className={`text-[10px] mt-1 font-bold ${data.ingredients_overview.is_ultraprocessed ? 'text-red-600' : 'text-green-600'}`}>
              {data.ingredients_overview.is_ultraprocessed ? '⚠ ULTRAPROCESSADO' : '✓ MÍN. PROCESSADO'}
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
          <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
            Benefícios Identificados
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

        <section className="bg-red-50/30 rounded-2xl p-6 border border-red-50">
          <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
            Pontos de Atenção
          </h3>
          <ul className="space-y-3">
            {data.the_bad.length > 0 ? data.the_bad.map((item, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                {item}
              </li>
            )) : <li className="text-sm text-gray-400 italic">Nenhum ponto negativo relevante.</li>}
          </ul>
        </section>
      </div>

      {data.deep_dive.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            Análise Científica de Componentes
          </h3>
          {data.deep_dive.map((item, i) => (
            <DeepDiveItem key={i} item={item} />
          ))}
        </section>
      )}

      <section className="mb-10">
        <h3 className="text-xl font-black text-gray-900 mb-6">Sugestões de Consumo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Preparos Caseiros</h4>
            <div className="space-y-6">
              {data.replacements_food.map((recipe, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px]">
                    {recipe.calories || '-'} kcal
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{recipe.name}</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">{recipe.ingredients_brief || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Opções Prontas Superiores</h4>
            <div className="space-y-3">
              {data.replacements_market.map((market, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700 text-xs">{market.name}</span>
                  {market.benefit && (
                    <span className="text-[9px] font-bold text-green-600 bg-white px-2 py-1 rounded border border-green-50 uppercase tracking-tighter">
                      {market.benefit}
                    </span>
                  )}
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
