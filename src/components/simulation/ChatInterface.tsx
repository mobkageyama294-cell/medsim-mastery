import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInterface({ messages, onSendMessage }: { messages: any[], onSendMessage: (msg: string) => void }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white dark:bg-slate-900 border rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-blue-600 text-white font-bold italic">
        PRONTUÁRIO DIGITAL - INTERAÇÃO
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white border rounded-tl-none'
            }`}>
              <p className="text-sm">{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-white dark:bg-slate-900">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua conduta ou pergunta..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
