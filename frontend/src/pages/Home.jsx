import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Wrench, Sparkles, Cpu, Palette, Layers, 
  Activity, ShieldCheck, Paperclip, Send, Terminal, X,
  Type, UploadCloud, Maximize2, Box, ArrowLeft, Image as ImageIcon
} from 'lucide-react';

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Holographic projection initialized. I am ready to receive your queries through the neural link.' }
  ]);

  // Modal & Config States
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', msg: '' });
  
  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- BACKEND HANDLER ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsLoading(true);

    try {
      // Temporary loading state
      setMessages(prev => [...prev, { role: 'bot', text: 'Analyzing...', isTemp: true }]);

      const response = await fetch(`http://127.0.0.1:8000/chat?user_input=${encodeURIComponent(userText)}`);
      if (!response.ok) throw new Error("Connection Refused");
      const data = await response.json();

      setMessages(prev => {
        const history = prev.filter(msg => !msg.isTemp);
        return [...history, { role: 'bot', text: data.response }];
      });
    } catch (error) {
      setMessages(prev => {
        const history = prev.filter(msg => !msg.isTemp);
        return [...history, { role: 'bot', text: `ERROR: ${error.message}. Ensure backend is active.` }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3D WIREFRAME GLOBE EFFECT (Matches Screenshot) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let animationFrameId;

    // Sphere Config
    const GLOBE_RADIUS = 250;
    const DOT_COUNT = 400;
    const DOTS = [];
    let rotation = 0;

    // Initialize 3D points on a sphere
    for (let i = 0; i < DOT_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
      const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;
      DOTS.push({
        x: GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi),
        y: GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi),
        z: GLOBE_RADIUS * Math.cos(phi)
      });
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.fillStyle = '#020408'; // Deep Black Background
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Background Stars (Square particles from screenshot)
      ctx.fillStyle = '#0e7490'; // Dark Cyan
      for(let i=0; i<30; i++) {
         const x = (Math.sin(rotation * 0.5 + i) * width/2) + width/2;
         const y = (Math.cos(rotation * 0.3 + i * 2) * height/2) + height/2;
         const size = (Math.sin(rotation + i) + 2) * 2;
         ctx.globalAlpha = 0.2;
         ctx.fillRect(x, y, size, size); // Draw squares not circles
      }

      // 2. Draw Rotating Sphere
      ctx.save();
      ctx.translate(width / 2 + 100, height / 2); // Offset slightly right like screenshot
      
      rotation += 0.002;
      
      // Rotate and Project Points
      DOTS.forEach(dot => {
        // Rotation Math (Y-axis)
        const x = dot.x * Math.cos(rotation) - dot.z * Math.sin(rotation);
        const z = dot.x * Math.sin(rotation) + dot.z * Math.cos(rotation);
        
        // Perspective Projection
        const scale = 400 / (400 + z); 
        const px = x * scale;
        const py = dot.y * scale;

        // Draw Nodes
        const opacity = (z + GLOBE_RADIUS) / (2 * GLOBE_RADIUS); // Fade back nodes
        if (opacity > 0) {
           ctx.globalAlpha = opacity * 0.8;
           ctx.fillStyle = '#06b6d4'; // Cyan
           ctx.beginPath();
           ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
           ctx.fill();
           
           // Draw Connections (Wireframe effect)
           // Only connect to nearby dots to simulate mesh
           DOTS.forEach(otherDot => {
             const dx = dot.x - otherDot.x;
             const dy = dot.y - otherDot.y;
             const dz = dot.z - otherDot.z;
             const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
             
             if (dist < 40) {
                // Rotate other dot
                const ox = otherDot.x * Math.cos(rotation) - otherDot.z * Math.sin(rotation);
                const oz = otherDot.x * Math.sin(rotation) + otherDot.z * Math.cos(rotation);
                const oScale = 400 / (400 + oz);
                const opx = ox * oScale;
                const opy = otherDot.y * oScale;

                ctx.beginPath();
                ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(px, py);
                ctx.lineTo(opx, opy);
                ctx.stroke();
             }
           });
        }
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    // ROOT CONTAINER
    <div className="relative h-screen w-screen bg-[#020408] font-sans overflow-hidden text-slate-300 selection:bg-cyan-500/30">
      
      {/* --- CSS OVERRIDES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');
        
        :root { --cyan-glow: 0 0 10px rgba(6, 182, 212, 0.5); }
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #155e75; border-radius: 2px; }

        .nav-item.active {
            background: linear-gradient(90deg, rgba(6,182,212,0.1) 0%, transparent 100%);
            border-left: 3px solid #06b6d4;
            color: #22d3ee;
        }
        .nav-item { border-left: 3px solid transparent; }
        .nav-item:hover:not(.active) { color: #fff; }

        .glass-panel {
            background: rgba(5, 10, 20, 0.7);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(34, 211, 238, 0.1);
            box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* --- LAYER 1: BACKGROUND (Absolute) --- */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />

      {/* --- LAYER 2: FIXED SIDEBAR --- */}
      {/* 'fixed' takes it out of the flow so it cannot be pushed down */}
      <aside className="fixed top-0 left-0 h-full w-64 z-30 border-r border-cyan-900/20 flex flex-col bg-black/40 backdrop-blur-md">
          <div className="p-6">
            <h1 className="text-2xl font-black tracking-tighter text-cyan-500">AUTOMAT</h1>
            <p className="text-[10px] text-cyan-800 font-mono tracking-[0.2em] mt-1">SYSTEM V2.4.1</p>
          </div>

          <nav className="flex-1 space-y-1 mt-4 overflow-y-auto">
            {[
              { id: 'chat', label: 'Neural Chat', icon: MessageSquare },
              { id: 'options', label: 'System Options', icon: Wrench },
              { id: 'creative', label: 'Creative Mode', icon: Sparkles },
              { id: 'engine', label: 'Engine Config', icon: Cpu },
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'management', label: 'Bot Management', icon: Layers },
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all nav-item ${activeTab === item.id ? 'active' : 'text-slate-500'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 mt-auto">
             <div className="text-[10px] font-mono text-cyan-900 leading-relaxed">
                ID: A-387-CYB <br/>
                STATUS: <span className="text-green-500">ONLINE</span>
             </div>
          </div>
      </aside>

      {/* --- LAYER 3: MAIN CONTENT (With Margin) --- */}
      {/* ml-64 creates space for the fixed sidebar */}
      <main className="relative z-10 ml-64 h-full flex flex-col items-center justify-center p-8 overflow-hidden">
          
          {/* Active Tab Content */}
          {activeTab === 'chat' && (
              <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-300">
                  <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[60vh] min-h-[500px]">
                      {/* Chat Header */}
                      <div className="h-16 border-b border-cyan-900/30 flex items-center justify-between px-6 bg-black/20">
                          <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                              <div>
                                  <h2 className="text-sm font-bold text-white tracking-wide">CYBEL CORE</h2>
                                  <p className="text-[10px] text-cyan-600 font-mono tracking-widest uppercase">Holographic Link Active</p>
                              </div>
                          </div>
                          <div className="flex gap-4 text-cyan-800">
                              <Activity className="w-4 h-4" />
                              <ShieldCheck className="w-4 h-4" />
                          </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {messages.map((msg, i) => (
                              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                  {msg.role === 'bot' && (
                                      <div className="w-8 h-8 rounded-full bg-cyan-900/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                          <Cpu className="w-4 h-4 text-cyan-400" />
                                      </div>
                                  )}
                                  <div className={`max-w-[80%] p-4 text-sm rounded-lg ${
                                      msg.role === 'bot' 
                                      ? 'bg-transparent border border-cyan-900/30 text-slate-300' 
                                      : 'bg-cyan-900/20 border border-cyan-500/20 text-cyan-50'
                                  }`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          <div ref={chatEndRef} />
                      </div>

                      {/* Input Footer */}
                      <div className="p-4 bg-black/20 border-t border-cyan-900/30">
                          <div className="relative flex items-center">
                              <input type="file" ref={fileInputRef} className="hidden" />
                              <button onClick={() => fileInputRef.current?.click()} className="absolute left-4 text-cyan-700 hover:text-cyan-400 transition-colors">
                                  <Paperclip className="w-4 h-4" />
                              </button>
                              <form onSubmit={handleChatSubmit} className="w-full">
                                  <input 
                                      type="text" 
                                      value={chatInput}
                                      onChange={(e) => setChatInput(e.target.value)}
                                      placeholder="Enter command..."
                                      className="w-full bg-[#050a10] border border-cyan-900/40 rounded-lg py-3.5 pl-12 pr-12 text-sm text-cyan-100 placeholder-cyan-900/50 focus:outline-none focus:border-cyan-500/50 font-mono transition-all"
                                  />
                                  <button type="submit" className="absolute right-3 top-2.5 p-1 text-cyan-600 hover:text-cyan-400 transition-colors">
                                      <Send className="w-4 h-4" />
                                  </button>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab !== 'chat' && (
               <div className="glass-panel p-12 rounded-xl text-center">
                  <Wrench className="w-12 h-12 text-cyan-800 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-cyan-500 mb-2">MODULE OFFLINE</h2>
                  <p className="text-cyan-900 font-mono text-xs">MAINTENANCE REQUIRED FOR {activeTab.toUpperCase()}</p>
               </div>
          )}
      </main>

      {/* --- MODAL --- */}
      {modalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="glass-panel p-8 max-w-sm w-full rounded-xl text-center border-amber-500/30">
                <h3 className="text-lg font-bold text-white mb-2">{modalData.title}</h3>
                <p className="text-sm text-slate-400 mb-6">{modalData.msg}</p>
                <button 
                    onClick={() => setModalData({ ...modalData, isOpen: false })}
                    className="w-full py-2 bg-amber-600/20 border border-amber-600/50 text-amber-500 rounded font-bold hover:bg-amber-600/30 transition-all"
                >
                    ACKNOWLEDGE
                </button>
            </div>
        </div>
      )}

    </div>
  );
}