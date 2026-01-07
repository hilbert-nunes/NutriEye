
import React, { useState } from 'react';
import { NutritionalAnalysis, DeepDiveIngredient, CuratedReplacement, PurchaseLink } from '../types';

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
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {data.ingredients_overview.clean_label && (
                <span className="text-[10px] font-black bg-green-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Clean Label</span>
              )}
              <h1 className="text-3xl font-black text-gray-900 leading-tight uppercase">{data.product_name}</h1>
            </div>
            <p className="text-gray-500 text-base leading-relaxed max-w-2xl">{data.summary}</p>
          </div>
          <ScoreBadge score={data.score} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Proteína / Caloria</div>
            <div className="font-bold text-xl text-gray-900">{data.macro_analysis.calories_protein_ratio}</div>
            <div className={`text-[10px] mt-2 font-black px-2 py-0.5 rounded-full inline-block ${data.macro_analysis.is_balanced ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {data.macro_analysis.is_balanced ? '✓ EQUILIBRADO' : '⚠ ALTO CALÓRICO'}
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Sódio (ANVISA)</div>
            <div className="font-bold text-xl text-gray-900 capitalize">{sodiumClass} ({data.macro_analysis.sodium_mg_per_100g}mg)</div>
            <div className={`text-[10px] mt-2 font-black px-2 py-0.5 rounded-full inline-block ${isExcellentSodium ? 'bg-green-100 text-green-700' : sodiumClass === 'moderado' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {isExcellentSodium ? '✓ NÍVEL EXCELENTE' : sodiumClass === 'moderado' ? '⚠ MODERADO' : '⚠ ALTO SÓDIO'}
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ingredientes</div>
            <div className="font-bold text-xl text-gray-900">{data.ingredients_overview.count} itens</div>
            <div className={`text-[10px] mt-2 font-black px-2 py-0.5 rounded-full inline-block ${data.ingredients_overview.is_ultraprocessed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {data.ingredients_overview.is_ultraprocessed ? '⚠ ULTRAPROCESSADO' : '✓ MÍN. PROCESSADO'}
            </div>
          </div>
        </div>
      </section>

      {/* Consumption Guide Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col border-l-4 border-l-green-500 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-2">Uso Ocasional</h3>
          <p className="text-sm text-gray-600 italic">"{data.consumption_guide.occasional}"</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col border-l-4 border-l-yellow-500 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-2">Uso Frequente</h3>
          <p className="text-sm text-gray-600 italic">"{data.consumption_guide.frequent}"</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col border-l-4 border-l-blue-500 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Uso Diário</h3>
          <p className="text-sm text-gray-600 italic">"{data.consumption_guide.daily}"</p>
        </div>
      </div>

      {/* The Good / The Bad */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section className="bg-green-50/30 rounded-3xl p-8 border border-green-100/50">
          <h3 className="text-green-800 font-black mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
            Benefícios Identificados
          </h3>
          <ul className="space-y-4">
            {data.the_good.map((item, i) => (
              <li key={i} className="text-sm text-green-700 flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-red-50/20 rounded-3xl p-8 border border-red-50">
          <h3 className="text-red-800 font-black mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
            Pontos de Atenção
          </h3>
          <ul className="space-y-4">
            {data.the_bad.length > 0 ? data.the_bad.map((item, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                {item}
              </li>
            )) : <li className="text-sm text-gray-400 italic">Nenhum ponto negativo relevante.</li>}
          </ul>
        </section>
      </div>

      {data.deep_dive.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-8 border-b-2 border-gray-100 pb-2">
            Análise Científica de Componentes
          </h3>
          {data.deep_dive.map((item, i) => (
            <DeepDiveItem key={i} item={item} />
          ))}
        </section>
      )}

      {/* Curated Replacement with Collapsible and Prices */}
      {data.curated_replacement && (
        <CuratedReplacementSection replacement={data.curated_replacement} />
      )}

      {/* AI Suggested Options */}
      <section className="mb-12">
        <h3 className="text-2xl font-black text-gray-900 mb-8">Outras Sugestões de Consumo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest border-b pb-2">Preparos Caseiros</h4>
            <div className="space-y-8">
              {data.replacements_food.map((recipe, i) => (
                <div key={i} className="flex gap-5">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-[10px] border border-green-100 shadow-sm">
                    {recipe.calories || '-'} kcal
                  </div>
                  <div>
                    <h5 className="font-black text-gray-900 text-base">{recipe.name}</h5>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed italic">{recipe.ingredients_brief || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest border-b pb-2">Outras Opções de Mercado</h4>
            <div className="space-y-4">
              {data.replacements_market.map((market, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                  <span className="font-black text-gray-700 text-sm">{market.name}</span>
                  {market.benefit && (
                    <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1 rounded-full border border-blue-50 uppercase tracking-tighter shadow-sm">
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
        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-[0.98] transition-all text-sm mb-10"
      >
        Realizar Nova Análise
      </button>
    </div>
  );
};

const CuratedReplacementSection: React.FC<{ replacement: CuratedReplacement }> = ({ replacement }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lowestPriceId = replacement.price_summary?.lowest_price.store_id;

  return (
    <section className="mb-12 animate-in slide-in-from-bottom-4 duration-700">
      {/* Featured Recommendation Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-48 h-48 bg-gray-50 rounded-3xl overflow-hidden shrink-0 shadow-inner border border-gray-100 p-4">
              <img src={replacement.image} className="w-full h-full object-contain" alt={replacement.name} />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-100">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Destaque NutriEye
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3 leading-tight">{replacement.name}</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-6 italic">
                "{replacement.reason}"
              </p>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                {isExpanded ? 'Ocultar detalhes' : 'Mais detalhes'}
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {isExpanded && (
            <div className="mt-8 pt-8 border-t border-gray-50 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Detailed Nutrition Facts */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>
                    Informação Nutricional ({replacement.portion?.description})
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Valor Energético', value: `${replacement.nutrition?.calories_kcal} kcal`, dv: `${replacement.daily_value_percentage?.calories}%` },
                      { label: 'Carboidratos', value: `${replacement.nutrition?.carbohydrates_g}g`, dv: `${replacement.daily_value_percentage?.carbohydrates}%` },
                      { label: 'Proteínas', value: `${replacement.nutrition?.proteins_g}g`, dv: `${replacement.daily_value_percentage?.proteins}%` },
                      { label: 'Fibra Alimentar', value: `${replacement.nutrition?.fiber_g}g`, dv: `${replacement.daily_value_percentage?.fiber}%` },
                      { label: 'Sódio', value: `${replacement.nutrition?.sodium_mg}mg`, dv: `${replacement.daily_value_percentage?.sodium}%` },
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">{row.label}</span>
                        <div className="flex gap-4 items-center">
                          <span className="text-sm font-black text-gray-900">{row.value}</span>
                          <span className="text-[10px] font-bold text-gray-400 min-w-[30px] text-right">{row.dv}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ingredientes Reais</h4>
                    <p className="text-sm text-gray-700 leading-relaxed font-bold">{replacement.ingredients}</p>
                  </div>

                  {replacement.dimensions && (
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Especificações</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                          {replacement.dimensions.weight_g}g (Líquido)
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                          {replacement.dimensions.width_cm}x{replacement.dimensions.height_cm}cm
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${replacement.allergens?.contains_gluten ? 'border-red-100 bg-red-50 text-red-600' : 'border-green-100 bg-green-50 text-green-600'}`}>
                          {replacement.allergens?.contains_gluten ? 'Contém Glúten' : 'Sem Glúten'}
                        </span>
                      </div>
                    </div>
                  )}

                  {replacement.asin && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-300 uppercase">ASIN: {replacement.asin}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-gray-900">
            Compare preços em {replacement.purchase_links?.length} lojas
          </h3>
          <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth={2} /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2} /></svg>
            <span className="text-xs font-bold text-gray-700">64000-010</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">Ordenar por</span>
          <button className="flex items-center gap-4 bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
            Padrão
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth={2} /></svg>
          </button>
        </div>
      </div>

      {/* Comparison List Items */}
      <div className="space-y-4">
        {replacement.purchase_links?.map((link) => {
          const isLowest = link.id === lowestPriceId;
          return (
            <div
              key={link.id}
              className={`bg-white rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all relative overflow-hidden ${isLowest
                ? 'border-2 border-green-500 shadow-xl shadow-green-500/5 ring-4 ring-green-50'
                : 'border border-gray-100 hover:border-gray-300'
                }`}
            >
              {isLowest && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] font-black px-4 py-1.5 rounded-br-xl uppercase tracking-widest shadow-lg z-10">
                  Menor preço
                </div>
              )}

              {/* Product Preview */}
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-2 shrink-0">
                  <img src={replacement.image} className="w-full h-full object-contain" alt="Preview" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900">
                      {link.price.currency} {link.price.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">à vista</span>
                  </div>
                  <div className="text-xs font-bold text-gray-400 mt-0.5">
                    ou 10x de {link.price.currency} {(link.price.amount / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-gray-300 mt-2 font-bold italic">Preço verificado em {link.last_checked}</p>
                </div>
              </div>

              {/* Store & Shipping info */}
              <div className="flex-1 flex flex-col items-center sm:items-end sm:px-12 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-black text-gray-800 tracking-tight">{link.store}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-[10px] font-black text-white uppercase">{link.id.substring(0, 2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-wider">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg>
                    Frete Grátis
                  </div>
                  <div className="h-1 w-1 rounded-full bg-gray-200"></div>
                  <div className="text-[10px] font-bold text-gray-400">Entrega em até 4 dias úteis</div>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 ${isLowest
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white border-2 border-gray-100 text-gray-900 hover:bg-gray-50'
                  }`}
              >
                Ir à loja
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AnalysisResults;
