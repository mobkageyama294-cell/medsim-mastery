import { useState, useRef, useEffect } from 'react';
import { Send, User, Stethoscope, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/hooks/useSimulation';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}

export default function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="glass-card flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Anamnese</h2>
          <span className="ml-auto text-[10px] text-muted-foreground">{messages.length} mensagens</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'patient' ? 'bg-accent/20' : 'bg-primary/20'
                }`}>
                  {msg.role === 'patient' ? (
                    <User className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : msg.role === 'patient'
                  ? 'bg-muted/50 border border-border/50 rounded-bl-md'
                  : 'bg-primary/5 border border-primary/20 rounded-bl-md'
              }`}>
                <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>p]:text-inherit">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <p className="text-[10px] mt-1.5 opacity-50">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Faça uma pergunta ao paciente..."
            className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
