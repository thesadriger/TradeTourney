
import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { MOCK_TOURNAMENTS, PLATFORM_FEE } from '../constants';
import { useNavigate } from 'react-router-dom';

interface LobbyPageProps {
  balance: number;
  onLogout: () => void;
  onUpdateBalance: (amount: number) => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ balance, onLogout, onUpdateBalance }) => {
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [createBuyIn, setCreateBuyIn] = useState<number>(10);
  const [createPlayers, setCreatePlayers] = useState<number>(4);

  const filteredTournaments = useMemo(() => {
    switch (filter) {
      case 'MICRO': return MOCK_TOURNAMENTS.filter(t => t.buyIn < 10);
      case 'LOW': return MOCK_TOURNAMENTS.filter(t => t.buyIn >= 10 && t.buyIn < 100);
      case 'HIGHROLLERS': return MOCK_TOURNAMENTS.filter(t => t.buyIn >= 100);
      default: return MOCK_TOURNAMENTS;
    }
  }, [filter]);

  const handleCreateTournament = () => {
    if (createBuyIn > balance) return;
    onUpdateBalance(-createBuyIn);
    setIsModalOpen(false);
    navigate(`/terminal/${Math.floor(Math.random() * 10000)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header balance={balance} onLogout={onLogout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-14">
          <div>
            <h1 className="text-5xl font-black mb-3 tracking-tighter">Tournament Lobby</h1>
            <p className="text-zinc-500 font-medium">Join a competitive table and trade history.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="neo-btn neo-btn-green px-10 py-5 rounded-2xl font-black flex items-center gap-3 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
            </svg>
            NEW TABLE
          </button>
        </div>

        {/* Filters */}
        <div className="neo-concave rounded-2xl p-2 flex gap-2 w-fit mb-12">
          {['ALL', 'MICRO', 'LOW', 'HIGHROLLERS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'neo-convex text-green-500' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((t) => (
            <div key={t.id} className="neo-convex rounded-[2.5rem] p-8 flex flex-col group transition-all hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black group-hover:text-green-500 transition-colors tracking-tight">{t.title}</h3>
                <div className="neo-concave px-3 py-1 rounded-lg text-[10px] font-black mono text-zinc-600">ID:{t.id}</div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Buy-in</span>
                  <span className="font-black text-lg text-zinc-200">{t.buyIn} USDT</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-500">
                    <span>PARTICIPANTS</span>
                    <span>{t.currentPlayers}/{t.maxPlayers}</span>
                  </div>
                  <div className="h-2 w-full neo-concave rounded-full p-[1px]">
                    <div className="h-full bg-zinc-700 rounded-full" style={{ width: `${(t.currentPlayers / t.maxPlayers) * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Current Pot</span>
                  <span className="font-black text-2xl text-green-500">{t.prizePool} USDT</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/terminal/${t.id}`)}
                className="neo-btn neo-convex w-full py-5 rounded-2xl font-black text-lg text-zinc-400 group-hover:text-white group-hover:neo-btn-green"
              >
                JOIN TOURNAMENT
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* CREATE TOURNAMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="neo-convex rounded-[3rem] p-10 max-w-md w-full relative border border-white/5">
            <h2 className="text-3xl font-black mb-2 tracking-tighter text-center">Open Table</h2>
            <p className="text-zinc-500 text-center text-sm mb-10">Set buy-in and invite players.</p>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-4">Entry Amount</label>
                <div className="neo-concave rounded-2xl p-5 flex items-center justify-between">
                  <input type="number" value={createBuyIn} onChange={(e) => setCreateBuyIn(Number(e.target.value))} className="bg-transparent font-black mono text-2xl outline-none w-full" />
                  <span className="font-black text-zinc-600">USDT</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Slots</label>
                  <span className="text-xs font-black text-green-500">{createPlayers} Players</span>
                </div>
                <input type="range" min="2" max="6" step="1" value={createPlayers} onChange={(e) => setCreatePlayers(Number(e.target.value))} className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-green-500 neo-concave" />
              </div>

              <div className="neo-concave rounded-3xl p-6 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-500">Estimated Pot</span>
                  <span className="text-green-500">{(createBuyIn * createPlayers * 0.95).toFixed(2)} USDT</span>
                </div>
              </div>

              <button onClick={handleCreateTournament} className="neo-btn neo-btn-green w-full py-5 rounded-2xl font-black text-xl">
                START ROOM
              </button>
              <button onClick={() => setIsModalOpen(false)} className="w-full text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
