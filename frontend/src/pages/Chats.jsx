import { useState, useEffect, useRef } from 'react';
import { chatsApi } from '../services/api';
import socket from '../services/socket';

export default function Chats() {
  const [convos, setConvos] = useState([]);
  const [phone, setPhone] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    loadConvos();
    socket.on('new_message', (msg) => {
      loadConvos();
      if (phone && msg.phone === phone) setMsgs(p => [...p, msg]);
    });
    return () => socket.off('new_message');
  }, [phone]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function loadConvos() {
    try { const r = await chatsApi.getConversations(); setConvos(r.data); } catch (e) {}
  }

  async function selectChat(p) {
    setPhone(p);
    try { const r = await chatsApi.getHistory(p); setMsgs(r.data); } catch (e) {}
  }

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !phone) return;
    try {
      await chatsApi.send(phone, text);
      setMsgs(p => [...p, { phone, message: text, direction: 'outgoing', timestamp: new Date() }]);
      setText('');
    } catch (err) { alert('Send failed. WhatsApp connected aano?'); }
  }

  const time = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">💬 Chats</h2>
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow border overflow-y-auto">
          {convos.map(c => (
            <div key={c._id} onClick={() => selectChat(c._id)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${phone === c._id ? 'bg-[#DCF8C6]' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(c.contactName || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{c.contactName || c._id}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
          {convos.length === 0 && <p className="p-4 text-center text-sm text-gray-400">No chats yet</p>}
        </div>

        {/* Chat */}
        <div className="flex-1 bg-white rounded-lg shadow border flex flex-col">
          {phone ? (
            <>
              <div className="p-3 border-b bg-[#075E54] text-white rounded-t-lg text-sm font-medium">{phone}</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#ECE5DD]">
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm shadow ${m.direction === 'outgoing' ? 'bg-[#DCF8C6]' : 'bg-white'}`}>
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                      <span className="text-xs text-gray-400 block text-right">{time(m.timestamp)}</span>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="p-2 border-t flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder="Message..." className="flex-1 p-2 border rounded-full text-sm px-4" />
                <button className="bg-[#25D366] text-white w-10 h-10 rounded-full">➤</button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Chat select cheyyuka
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
