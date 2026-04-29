// src/components/CaseGallery.tsx
import { useState } from 'react';

type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos';

interface Case {
  id: string;
  title: string;
  difficulty: Difficulty; // deve vir do JSON
  // ... outras props
}

const CaseGallery = ({ cases }: { cases: Case[] }) => {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('Todos');

  const filteredCases = cases.filter(caso =>
    difficultyFilter === 'Todos' ? true : caso.difficulty === difficultyFilter
  );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-3 py-1 rounded ${difficultyFilter === 'Todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setDifficultyFilter('Todos')}
        >
          Todos
        </button>
        <button
          className={`px-3 py-1 rounded ${difficultyFilter === 'Iniciante' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setDifficultyFilter('Iniciante')}
        >
          Iniciante
        </button>
        <button
          className={`px-3 py-1 rounded ${difficultyFilter === 'Intermediário' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setDifficultyFilter('Intermediário')}
        >
          Intermediário
        </button>
        <button
          className={`px-3 py-1 rounded ${difficultyFilter === 'Avançado' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setDifficultyFilter('Avançado')}
        >
          Avançado
        </button>
      </div>
      <div className="grid gap-4">
        {filteredCases.map(caso => (
          <div key={caso.id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{caso.title}</h3>
            <p className="text-sm text-gray-500">Dificuldade: {caso.difficulty}</p>
            {/* ... outros detalhes e botão de iniciar */}
          </div>
        ))}
      </div>
    </div>
  );
};
