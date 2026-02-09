
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TradingChart from '../components/TradingChart';
import { Candle, PositionType, Position, Player } from '../types';
import { generateHistoricalData, getNextTick } from '../services/mockData';
import { INITIAL_VIRTUAL_BALANCE } from '../constants';

interface TerminalPageProps {
  balance: number;
}

const MM_RATE = 0.05; // 5% Maintenance Margin Rate
const LEVERAGE = 20;  // 20x Leverage for simulation realism

const TerminalPage: React.FC<TerminalPageProps> = ({ balance }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timer, setTimer] = useState(600); // 10 minutes (600 seconds)
  const TOTAL_TIME = 600;
  
  const [virtualBalance, setVirtualBalance] = useState(INITIAL_VIRTUAL_BALANCE);
  const [realizedPnL, setRealizedPnL] = useState(0); 
  const [position, setPosition] = useState<Position | null>(null);
  const [volumeInput, setVolumeInput] = useState<string>("1000");
  const [showResults, setShowResults] = useState(false);
  const [isLiquidated, setIsLiquidated] = useState(false);
  
  const [rivals, setRivals] = useState<Player[]>([
    { id: '1', name: 'CryptoWhale', avatar: '1', virtualBalance: 10000, pnl: 0, isInsideTrade: false },
    { id: '2', name: 'BearTrap_88', avatar: '2', virtualBalance: 10000, pnl: 0, isInsideTrade: true },
    { id: '3', name: 'MoonShot', avatar: '3', virtualBalance: 10000, pnl: 0, isInsideTrade: false },
  ]);

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateLiquidationPrice = (type: PositionType, entryPrice: number, margin: number, walletBalance: number) => {
    if (margin <= 0) return 0;
    const positionSize = margin * LEVERAGE;
    const maintenanceMargin = positionSize * MM_RATE;
    if (type === PositionType.LONG) {
      return Math.max(0, ((maintenanceMargin - walletBalance - margin + positionSize) * entryPrice) / positionSize);
    } else {
      return Math.max(0, entryPrice * (1 - (maintenanceMargin - walletBalance - margin) / positionSize));
    }
  };

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, []);

  useEffect(() => {
    setCandles(generateHistoricalData(40));
    tickIntervalRef.current = setInterval(() => {
      setCandles(prev => {
        if (prev.length === 0) return prev;
        return [...prev, getNextTick(prev[prev.length - 1])];
      });
      setRivals(prev => prev.map(r => ({
        ...r,
        virtualBalance: r.virtualBalance + (Math.random() - 0.48) * 10,
        pnl: r.virtualBalance - 10000,
        isInsideTrade: Math.random() > 0.7 ? !r.isInsideTrade : r.isInsideTrade
      })).sort((a, b) => b.virtualBalance - a.virtualBalance));
    }, 1500);
    return () => { if (tickIntervalRef.current) clearInterval(tickIntervalRef.current); };
  }, []);

  useEffect(() => {
    if (!position || isLiquidated || candles.length === 0) return;
    const lastPrice = candles[candles.length - 1].close;
    if ((position.type === PositionType.LONG && lastPrice <= position.liquidationPrice) || 
        (position.type === PositionType.SHORT && lastPrice >= position.liquidationPrice)) {
      setIsLiquidated(true);
      setRealizedPnL(-INITIAL_VIRTUAL_BALANCE);
      setPosition(null);
      setVirtualBalance(0);
    }
  }, [candles, position, isLiquidated]);

  const handleTrade = (type: PositionType) => {
    if (isLiquidated) return;
    const marginAmount = parseFloat(volumeInput);
    if (isNaN(marginAmount) || marginAmount <= 0) return;
    const currentPrice = candles[candles.length - 1].close;
    if (position) {
      if (position.type === type) {
        if (marginAmount > virtualBalance) return;
        const newTotalMargin = position.amount + marginAmount;
        const newEntryPrice = (position.entryPrice * position.amount + currentPrice * marginAmount) / newTotalMargin;
        const newWalletBalance = virtualBalance - marginAmount;
        setPosition({ type, amount: newTotalMargin, entryPrice: newEntryPrice, liquidationPrice: calculateLiquidationPrice(type, newEntryPrice, newTotalMargin, newWalletBalance) });
        setVirtualBalance(newWalletBalance);
      } else {
        const pnl = ((currentPrice - position.entryPrice) / position.entryPrice) * (position.amount * LEVERAGE) * (position.type === PositionType.LONG ? 1 : -1);
        const ratio = marginAmount / position.amount;
        if (ratio >= 1) {
          const excess = marginAmount - position.amount;
          const afterClose = virtualBalance + position.amount + pnl;
          setRealizedPnL(prev => prev + pnl);
          setPosition(null);
          if (excess > 0 && afterClose >= excess) {
            setVirtualBalance(afterClose - excess);
            setPosition({ type, entryPrice: currentPrice, amount: excess, liquidationPrice: calculateLiquidationPrice(type, currentPrice, excess, afterClose - excess) });
          } else { setVirtualBalance(afterClose); }
        } else {
          const realized = pnl * ratio;
          const nextBal = virtualBalance + marginAmount + realized;
          const nextMargin = position.amount - marginAmount;
          setRealizedPnL(prev => prev + realized);
          setPosition({ ...position, amount: nextMargin, liquidationPrice: calculateLiquidationPrice(position.type, position.entryPrice, nextMargin, nextBal) });
          setVirtualBalance(nextBal);
        }
      }
    } else {
      if (marginAmount > virtualBalance) return;
      setVirtualBalance(virtualBalance - marginAmount);
      setPosition({ type, entryPrice: currentPrice, amount: marginAmount, liquidationPrice: calculateLiquidationPrice(type, currentPrice, marginAmount, virtualBalance - marginAmount) });
    }
  };

  const closeTrade = () => {
    if (!position) return;
    const profit = ((candles[candles.length - 1].close - position.entryPrice) / position.entryPrice) * (position.amount * LEVERAGE) * (position.type === PositionType.LONG ? 1 : -1);
    setRealizedPnL(prev => prev + profit);
    setVirtualBalance(prev => prev + position.amount + profit);
    setPosition(null);
  };

  const currentUnrealizedPnL = position && candles.length > 0
    ? ((candles[candles.length - 1].close - position.entryPrice) / position.entryPrice) * (position.amount * LEVERAGE) * (position.type === PositionType.LONG ? 1 : -1)
    : 0;
  const totalRoundPnL = realizedPnL + currentUnrealizedPnL;
  const currentEquity = virtualBalance + (position ? position.amount : 0) + currentUnrealizedPnL;
  const mmRatePercent = position ? ((position.amount * LEVERAGE * MM_RATE) / (currentEquity || 1)) * 100 : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const elapsedSeconds = TOTAL_TIME - timer;
  const timeProgress = (elapsedSeconds / TOTAL_TIME) * 100;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-black">
      <Header balance={balance} />
      
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden relative">
        {isLiquidated && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="neo-convex p-12 rounded-[2.5rem] text-center">
              <h2 className="text-5xl font-black text-red-500 mb-6">LIQUIDATED</h2>
              <button onClick={() => navigate('/lobby')} className="neo-btn neo-convex px-8 py-4 rounded-2xl font-black text-zinc-400 uppercase">Lobby</button>
            </div>
          </div>
        )}

        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Status */}
          <div className="neo-convex rounded-2xl px-8 py-4 flex justify-between items-center">
            <div className="flex gap-10">
              <div><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Room</p><h2 className="font-black text-zinc-200">#FST-{id}</h2></div>
              <div><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Time</p><h2 className={`font-black mono text-lg ${timer < 60 ? 'text-red-500 animate-pulse' : 'text-zinc-200'}`}>{formatTime(timer)}</h2></div>
            </div>
            <div className="flex gap-10">
              <div className="text-right"><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Margin</p><h2 className="font-black mono text-green-400 text-lg">${virtualBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2></div>
              <div className="text-right"><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Live PnL</p><h2 className={`font-black mono text-lg ${currentUnrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>{currentUnrealizedPnL >= 0 ? '+' : ''}{currentUnrealizedPnL.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2></div>
            </div>
          </div>

          {/* Combined Chart & History Section - This stretches to match Leaderboard */}
          <div className="flex-1 min-h-0 neo-convex rounded-[2.5rem] p-4 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 min-h-0 relative">
              <TradingChart candles={candles} position={position} currentPnL={currentUnrealizedPnL} />
            </div>
            {/* Timeline */}
            <div className="px-2 pb-4">
              <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-2"><span>0:00</span><span>History Progression</span><span>10:00</span></div>
              <div className="h-6 w-full neo-concave rounded-xl relative p-1">
                <div className="h-full bg-green-500 rounded-lg transition-all duration-1000 shadow-[0_0_15px_rgba(34,197,94,0.4)] relative" style={{ width: `${timeProgress}%` }}>
                  <div className="absolute -top-8 right-0 translate-x-1/2">
                    <div className="neo-convex px-3 py-1 rounded-lg border border-green-500/30">
                      <span className="mono font-black text-[11px] text-green-500 whitespace-nowrap">{formatTime(elapsedSeconds)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Controls */}
          <div className="neo-convex rounded-[2.5rem] p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-4">
                <div className="neo-concave rounded-2xl p-4"><input type="number" value={volumeInput} onChange={(e) => setVolumeInput(e.target.value)} className="w-full bg-transparent font-black mono text-xl outline-none text-white text-center" /></div>
                <div className="flex gap-2">{[25, 50, 75, 100].map(p => (<button key={p} onClick={() => setVolumeInput((virtualBalance * (p / 100)).toFixed(0))} className="neo-btn neo-convex-sm flex-1 py-2 rounded-xl text-[10px] font-black">{p}%</button>))}</div>
              </div>
              <div className="md:col-span-3 flex gap-6 h-full">
                <button onClick={() => handleTrade(PositionType.LONG)} className="neo-btn neo-btn-green flex-1 rounded-2xl font-black text-xl flex flex-col items-center justify-center"><span>BUY</span><span>LONG</span></button>
                <button onClick={() => handleTrade(PositionType.SHORT)} className="neo-btn neo-btn-red flex-1 rounded-2xl font-black text-xl flex flex-col items-center justify-center"><span>SELL</span><span>SHORT</span></button>
                {position && <button onClick={closeTrade} className="neo-btn neo-convex px-10 rounded-2xl font-black text-lg">EXIT</button>}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between text-[10px] font-black text-zinc-500 mb-2 uppercase">
                <span>Risk Liquidation</span>
                <span className={mmRatePercent > 80 ? 'text-red-500 animate-pulse' : mmRatePercent > 50 ? 'text-yellow-500' : 'text-zinc-500'}>
                  {mmRatePercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full neo-concave rounded-full p-[1px]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${mmRatePercent > 80 ? 'bg-red-500' : mmRatePercent > 50 ? 'bg-yellow-500' : 'bg-zinc-600'}`} 
                  style={{ width: `${Math.min(100, mmRatePercent)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="flex-1 flex flex-col neo-convex rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center"><h3 className="font-black text-xs text-zinc-500 uppercase tracking-widest">Leaderboard</h3><div className="neo-concave text-green-500 text-[10px] font-black px-3 py-1 rounded-full">LIVE</div></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="neo-concave rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full neo-convex p-0.5"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Trader1" alt="" className="rounded-full" /></div>
                    <div><span className="text-xs font-black text-white block">YOU</span></div>
                  </div>
                  <div className="text-right"><p className={`text-sm font-black mono ${totalRoundPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>{totalRoundPnL.toFixed(2)}</p></div>
                </div>
                {rivals.map((rival) => (
                  <div key={rival.id} className="p-4 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-all">
                    <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full neo-convex p-0.5 opacity-60"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rival.name}`} alt="" className="rounded-full" /></div><span className="text-xs font-bold text-zinc-400 block">{rival.name}</span></div>
                    <div className="text-right"><p className={`text-sm font-bold mono ${rival.pnl >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>{rival.pnl.toFixed(2)}</p></div>
                  </div>
                ))}
            </div>
          </div>
          <div className="neo-convex rounded-3xl p-6">
             <div className="flex justify-between mb-3"><span className="text-[10px] text-zinc-500 font-black uppercase">Total Pot</span><span className="text-sm text-green-500 font-black">57 USDT</span></div>
             <div className="h-2 bg-zinc-900 rounded-full neo-concave p-[1px]"><div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
