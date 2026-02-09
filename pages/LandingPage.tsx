
import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black italic text-xl">T</div>
          <span className="font-bold text-2xl tracking-tighter">TRADE<span className="text-green-500">TOURNEY</span></span>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-lg font-medium hover:bg-zinc-900 transition-colors" onClick={onLogin}>Sign In</button>
          <button className="px-6 py-2 rounded-lg font-bold bg-white text-black hover:bg-zinc-200 transition-colors" onClick={onLogin}>Get Started</button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto py-20">
        <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold mb-8 animate-pulse">
          NEW: 50,000 USDT PRIZE POOL LIVE
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
          Trade. Compete. <br /><span className="text-green-500">Win Real Crypto.</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl">
          The first tournament-based trading platform. Master the markets on random historical data and claim the prize pool. No bots, just skill.
        </p>
        <button 
          onClick={onLogin}
          className="px-10 py-5 bg-green-500 text-black text-xl font-bold rounded-2xl hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)]"
        >
          JOIN THE TOURNAMENT
        </button>

        {/* Dynamic Graphic Mockup */}
        <div className="mt-20 w-full max-w-4xl bg-zinc-900/50 rounded-3xl border border-zinc-800 p-4 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          <div className="h-64 flex items-end gap-2 px-8 py-4 opacity-50 group-hover:opacity-100 transition-opacity">
            {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55, 100, 80, 45, 90, 60, 110, 85, 70, 95, 65].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-lg ${i % 3 === 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>
      </main>

      {/* How it works */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-green-500/50 transition-colors">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 text-2xl font-bold mb-6">1</div>
            <h3 className="text-2xl font-bold mb-4">Pay Buy-In</h3>
            <p className="text-zinc-400">Choose a tournament from the lobby that fits your bankroll. Low stakes to High rollers.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-green-500/50 transition-colors">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 text-2xl font-bold mb-6">2</div>
            <h3 className="text-2xl font-bold mb-4">Master History</h3>
            <p className="text-zinc-400">Trade on a random 10-minute slice of history. Everyone gets the same chart. Your skill is the only variable.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-green-500/50 transition-colors">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 text-2xl font-bold mb-6">3</div>
            <h3 className="text-2xl font-bold mb-4">Win the Pot</h3>
            <p className="text-zinc-400">The trader with the highest PnL at the end of the round takes the entire prize pool minus a small fee.</p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-zinc-900 text-zinc-600 text-center text-sm">
        <p>© 2024 TradeTourney Platform. Play responsibly.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
