
import React, { useState } from 'react';
import Header from '../components/Header';

interface WalletPageProps {
  balance: number;
}

const WalletPage: React.FC<WalletPageProps> = ({ balance }) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header balance={balance} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">My Wallet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex gap-2 mb-8 bg-black/50 p-1.5 rounded-xl border border-zinc-800 w-fit">
              <button 
                onClick={() => setActiveTab('DEPOSIT')}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'DEPOSIT' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                Deposit
              </button>
              <button 
                onClick={() => setActiveTab('WITHDRAW')}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'WITHDRAW' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                Withdraw
              </button>
            </div>

            {activeTab === 'DEPOSIT' ? (
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Select Network</label>
                  <select className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-green-500 transition-colors">
                    <option>USDT (TRC20)</option>
                    <option>USDT (ERC20)</option>
                    <option>USDT (BEP20)</option>
                  </select>
                </div>

                <div className="bg-black border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
                  <div className="w-48 h-48 bg-white p-4 rounded-xl mb-6">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TGC1234567890QRCODE" alt="QR Code" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-zinc-500 font-bold uppercase mb-2">Deposit Address</p>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value="TGC1234567890ASDFGHJKLQWERTYUIOP"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm mono text-zinc-400 outline-none" 
                      />
                      <button className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-all">Copy</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                   <div className="text-green-500">ℹ️</div>
                   <p className="text-xs text-zinc-400">Funds will be credited automatically after 3 network confirmations. Usually takes 2-5 minutes.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Recipient Wallet Address</label>
                  <input placeholder="Enter USDT TRC20 address" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Withdraw Amount</label>
                  <div className="relative">
                    <input type="number" placeholder="Min. 10 USDT" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-green-500 transition-colors" />
                    <button className="absolute right-3 top-3 text-green-500 font-bold text-sm">MAX</button>
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase">Transaction fee: 1.00 USDT</p>
                </div>
                <button className="w-full py-4 bg-zinc-100 text-black font-black rounded-2xl hover:bg-white transition-all active:scale-95">REQUEST WITHDRAWAL</button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Total Balance</p>
              <h2 className="text-3xl font-black mono mb-1">{balance.toLocaleString()} USDT</h2>
              <p className="text-xs text-green-500 font-bold">≈ ${(balance * 1.001).toFixed(2)} USD</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h4 className="text-sm font-bold uppercase text-zinc-400 mb-4 tracking-widest">Recent Activity</h4>
              <div className="space-y-4">
                {[
                  { label: 'Tournament Prize', amount: '+57.00', date: '2h ago', status: 'SUCCESS' },
                  { label: 'Buy-In #322', amount: '-10.00', date: '3h ago', status: 'SUCCESS' },
                  { label: 'Deposit USDT', amount: '+100.00', date: '1d ago', status: 'SUCCESS' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{item.date}</p>
                    </div>
                    <p className={`mono font-bold ${item.amount.startsWith('+') ? 'text-green-500' : 'text-zinc-400'}`}>
                      {item.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletPage;
