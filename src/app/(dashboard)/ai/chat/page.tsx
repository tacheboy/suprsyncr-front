'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  useGetChatSessionsQuery,
  useCreateChatSessionMutation,
  useGetChatHistoryQuery,
  useSendChatMessageMutation
} from '@/store/services/aiApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus, Send, User, Bot, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Queries & Mutations
  const { data: sessionsData, isLoading: sessionsLoading } = useGetChatSessionsQuery();
  const [createSession, { isLoading: isCreatingSession }] = useCreateChatSessionMutation();
  
  const { data: historyData, isLoading: historyLoading } = useGetChatHistoryQuery(
    activeSessionId!,
    { skip: !activeSessionId }
  );
  
  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [historyData]);

  // Handle new session creation
  const handleCreateSession = async () => {
    try {
      const response = await createSession({}).unwrap();
      setActiveSessionId(response.data.sessionId);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create new chat session', variant: 'destructive' });
    }
  };

  // Handle message sending
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !activeSessionId || isSending) return;

    const textPayload = message;
    setMessage('');

    try {
      await sendMessage({ sessionId: activeSessionId, message: textPayload }).unwrap();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      setMessage(textPayload); // Restore message
    }
  };

  // Set default active session when sessions load
  useEffect(() => {
    if (!activeSessionId && sessionsData?.data && sessionsData.data.length > 0) {
      setActiveSessionId(sessionsData.data[0].sessionId);
    }
  }, [sessionsData, activeSessionId]);

  const sessions = sessionsData?.data || [];
  const messages = historyData?.data || [];

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] gap-4 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Sidebar: Session List */}
      <Card className="w-1/3 max-w-[300px] flex flex-col hidden md:flex border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <Button 
            onClick={handleCreateSession} 
            disabled={isCreatingSession}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessionsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))
            ) : sessions.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No previous chats.</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.sessionId}
                  onClick={() => setActiveSessionId(session.sessionId)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-start gap-3 ${
                    activeSessionId === session.sessionId
                      ? 'bg-orange-50 text-orange-700 outline outline-1 outline-orange-200 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${
                    activeSessionId === session.sessionId ? 'text-orange-500' : 'text-slate-400'
                  }`} />
                  <div className="overflow-hidden">
                    <p className="truncate">{session.sessionName || 'New Chat'}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col border-slate-200 bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">AI Business Assistant</h2>
            <p className="text-xs text-slate-500">Powered by real-time store data</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p>Select a chat or start a new one.</p>
            </div>
          ) : historyLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-3/4 rounded-2xl rounded-tl-sm" />
              <Skeleton className="h-16 w-2/3 ml-auto rounded-2xl rounded-tr-sm" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
              <Bot className="w-12 h-12 opacity-20" />
              <p>How can I help you today?</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-lg">
                <BadgeItem text="Why are my sales down?" onClick={() => setMessage("Why are my sales down?")} />
                <BadgeItem text="What should I restock next?" onClick={() => setMessage("What should I restock next?")} />
                <BadgeItem text="Summarize my weekly performance" onClick={() => setMessage("Summarize my weekly performance")} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.messageId} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser ? 'bg-slate-900 text-white' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                    </div>
                    {/* Message Bubble */}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      isUser 
                        ? 'bg-slate-900 text-white rounded-tr-sm' 
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm whitespace-pre-wrap leading-relaxed'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {isSending && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-orange-100 text-orange-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-75" />
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form 
            onSubmit={handleSendMessage} 
            className="flex gap-2 max-w-4xl mx-auto items-end"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              disabled={!activeSessionId || isSending}
              className="flex-1 bg-white border-slate-200 shadow-sm rounded-full px-5 py-6"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!activeSessionId || isSending || !message.trim()}
              className="h-12 w-12 rounded-full shrink-0 bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            AI can make mistakes. Verify important business decisions.
          </p>
        </div>
      </Card>
    </div>
  );
}

function BadgeItem({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium transition-colors border border-slate-200"
    >
      {text}
    </button>
  );
}
