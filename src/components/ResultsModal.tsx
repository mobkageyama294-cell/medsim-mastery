// src/components/ResultsModal.tsx
import React, { useEffect } from 'react';
import { ScoringInput, calculateScore } from '../utils/scoring';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoringInput: ScoringInput;
  caseTitle: string;
}

/**
 * Componente de Barra de Progresso Interno
 * Agora fora do componente principal para melhor performance.
 */
const ProgressBar: React.FC<{ value: number; max?: number; label: string }> = ({ 
  value, 
  max = 25, 
  label 
}) => {
  const percentage = (value / max) * 100;
  
  // Define a cor baseada na performance
  const getColor = () => {
    if (percentage < 40) return 'bg-red-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 font-mono">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${getColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ResultsModal: React.FC<ResultsModalProps> = ({ isOpen, onClose, scoringInput, caseTitle }) => {
  
  // Efeito para fechar o modal com a tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  // Chamada da nossa função utilitária otimizada
  const { total, breakdown, feedback } = calculateScore(scoringInput);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={onClose} // Fecha ao clicar fora
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro do modal
      >
        {/* Cabeçalho */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Resultado da Simulação</h2>
            <p className="text-blue-600 font-medium">{caseTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6">
          {/* Pontuação Principal */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
            <span className="text-sm uppercase tracking-widest text-gray-500 font-semibold">Nota Final</span>
            <div className={`text-6xl font-black mt-2 ${total >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
              {total}
            </div>
            <span className="text-gray-400">de 100 pontos</span>
          </div>

          {/* Barras de Detalhamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <ProgressBar value={breakdown.humanized} label="🧠 Tratamento" />
            <ProgressBar value={breakdown.accuracy} label="🎯 Diagnóstico" />
            <ProgressBar value={breakdown.technical} label="📚 Linguagem" />
            <ProgressBar value={breakdown.efficiency} label="⚡ Eficiência" />
          </div>

          {/* Secção de Comparação */}
          <div className="mt-8 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                🔍 Análise Clínica
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong className="text-gray-600">Seu diagnóstico:</strong> <span className="text-gray-800">{scoringInput.userDiagnosis || "Não fornecido"}</span></p>
                <p><strong className="text-gray-600">Correto:</strong> <span className="text-green-700 font-medium">{scoringInput.correctDiagnosis}</span></p>
              </div>
            </div>

            {/* Exames Desnecessários */}
            {scoringInput.unnecessaryExamsRequested.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-bold text-red-700 mb-1">⚠️ Alerta de Eficiência</h3>
                <p className="text-sm text-red-600 mb-2">Foram solicitados exames sem justificativa clínica:</p>
                <div className="flex flex-wrap gap-2">
                  {scoringInput.unnecessaryExamsRequested.map((exam, idx) => (
                    <span key={idx} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback e Melhoria */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="font-bold text-blue-800 mb-1">💡 Feedback Pedagógico</h3>
              <p className="text-blue-900 leading-relaxed">{feedback}</p>
            </div>
          </div>

          {/* Botão de Fechar */}
          <button
            onClick={onClose}
            className="mt-8 w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg"
          >
            Concluir Revisão
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
