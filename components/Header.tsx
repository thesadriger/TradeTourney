
import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  balance: number;
  onlineCount?: number;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, onlineCount = 142, onLogout }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-50 bg-[#0f0f12]">
      <div className="flex items-center gap-10">
        <Link to="/lobby" className="flex items-center gap-3">
          <div className="neo-convex w-10 h-10 rounded-xl flex items-center justify-center font-black text-green-500 italic text-xl">T</div>
          <span className="font-black text-2xl tracking-tighter hidden sm:block">TRADE<span className="text-green-500">TOURNEY</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
          <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{onlineCount} LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/wallet" className="neo-btn neo-concave flex items-center gap-4 pl-5 pr-2 py-2 rounded-full border border-white/5 group">
          <span className="mono font-black text-sm text-zinc-300">{balance.toLocaleString()} USDT</span>
          <div className="neo-btn-green w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>
        
        <div className="relative group">
          <button className="neo-btn neo-convex w-12 h-12 rounded-full p-1 border border-white/5">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Trader1`} alt="avatar" className="rounded-full" />
          </button>
          <div className="absolute right-0 top-full mt-4 w-56 neo-convex rounded-[2rem] shadow-2xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
            <div className="px-6 py-4 mb-2">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Trader Profile</p>
              <p className="text-sm font-black text-white">CryptoKing_99</p>
            </div>
            <Link to="/wallet" className="block px-6 py-3 text-xs font-black uppercase text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Wallet & History</Link>
            <button className="w-full text-left px-6 py-3 text-xs font-black uppercase text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-colors" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
