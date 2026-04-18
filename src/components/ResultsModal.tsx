// src/components/ResultsModal.tsx
import React from 'react';
import { ScoringInput, calculateScore } from '../utils/scoring';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoringInput: ScoringInput;
  caseTitle: string;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ isOpen, onClose, scoringInput, caseTitle }) => {
  if (!isOpen) return null;

  const { total, humanized, accuracy, technical, efficiency, feedback } = calculateScore(scoringInput);

  const ProgressBar = ({ value, max = 25, label }: { value: number; max?: number; label: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">📋 Resultado da Simulação</h2>
        <p className="text-gray-600 mb-4">Caso: {caseTitle}</p>

        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-blue-700">{total}</div>
          <div className="text-gray-500 mt-1">Pontuação total (0-100)</div>
        </div>

        <div className="border-t pt-4">
          <ProgressBar value={humanized} label="🧠 Tratamento Humanitário" />
          <ProgressBar value={accuracy} label="🎯 Acurácia Diagnóstica" />
          <ProgressBar value={technical} label="📚 Linguagem Técnica" />
          <ProgressBar value={efficiency} label="⚡ Eficiência na Investigação" />
        </div>

        <div className="bg-gray-50 p-4 rounded mt-4">
          <h3 className="font-semibold">🔍 Comparação de Diagnóstico</h3>
          <p><span className="font-medium">Seu diagnóstico:</span> {scoringInput.userDiagnosis || "(não informado)"}</p>
          <p><span className="font-medium">Diagnóstico correto:</span> {scoringInput.correctDiagnosis}</p>
        </div>

        {scoringInput.unnecessaryExamsRequested.length > 0 && (
          <div className="bg-red-50 p-4 rounded mt-4">
            <h3 className="font-semibold text-red-700">⚠️ Exames desnecessários solicitados</h3>
            <ul className="list-disc ml-5">
              {scoringInput.unnecessaryExamsRequested.map((exam, idx) => (
                <li key={idx}>{exam}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Estes exames geram custos e desconforto sem benefício clínico.
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded mt-4">
          <h3 className="font-semibold">💡 Observações de Melhoria</h3>
          <p>{feedback}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
