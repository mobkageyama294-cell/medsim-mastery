import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/hooks/useSimulation';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const roleConfig: Record<string, { align: string; bg: string; label: string }> = {
    user: { align: 'justify-end', bg: 'bg-primary text-primary-foreground rounded-tr-none', label: 'Médico' },
    patient: { align: 'justify-start', bg: 'bg-muted/50 border border-border/50 rounded-tl-none', label: 'Paciente' },
    system: { align: 'justify-center', bg: 'bg-primary/10 border border-primary/20 text-xs', label: 'Sistema' },
    assistant: { align: 'justify-start', bg: 'bg-muted/50 border border-border/50 rounded-tl-none', label: 'Paciente' },
  };

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Prontuário Digital — Interação
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((m, i) => {
          const config = roleConfig[m.role] || roleConfig.system;
          return (
            <div key={i} className={`flex ${config.align}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl ${config.bg}`}>
                {m.role !== 'user' && (
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">{config.label}</p>
                )}
                <div className="text-sm prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-none p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">Paciente</p>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pergunte ao paciente..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
