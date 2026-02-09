
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Candle, Position, PositionType } from '../types';

interface TradingChartProps {
  candles: Candle[];
  position: Position | null;
  currentPnL: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ candles, position, currentPnL }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(40); // Number of candles visible at once
  const [rightOffset, setRightOffset] = useState(0); // Offset from the most recent candle
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; offset: number } | null>(null);

  const width = 800;
  const height = 400;
  const padding = 40;
  const LEVERAGE = 20; // Consistent with TerminalPage

  // Auto-follow logic
  const prevCandlesLength = useRef(candles.length);
  useEffect(() => {
    if (candles.length > prevCandlesLength.current) {
      if (rightOffset === 0) {
        // Stay pinned
      } else {
        setRightOffset(prev => prev + (candles.length - prevCandlesLength.current));
      }
    }
    prevCandlesLength.current = candles.length;
  }, [candles.length, rightOffset]);

  const { displayedCandles, min, max, scaleY, scaleX, candleWidth } = useMemo(() => {
    if (candles.length === 0) {
      return { 
        displayedCandles: [], min: 0, max: 0, 
        scaleY: (v: number) => 0, scaleX: (i: number) => 0, 
        candleWidth: 0 
      };
    }

    const total = candles.length;
    const count = Math.min(visibleCount, total);
    const end = Math.max(count, total - rightOffset);
    const start = Math.max(0, end - count);
    
    const subset = candles.slice(start, end);
    const prices = subset.flatMap(c => [c.high, c.low]);
    if (position) prices.push(position.entryPrice);

    const dataMin = Math.min(...prices);
    const dataMax = Math.max(...prices);
    
    const min = dataMin * 0.9995;
    const max = dataMax * 1.0005;
    
    const range = max - min;
    const scaleY = (val: number) => height - padding - ((val - min) / (range || 1)) * (height - 2 * padding);
    const scaleX = (idx: number) => padding + (idx / (count - 1)) * (width - 2 * padding);
    const candleWidth = ((width - 2 * padding) / count) * 0.8;
    
    return { displayedCandles: subset, min, max, scaleY, scaleX, candleWidth };
  }, [candles, visibleCount, rightOffset, position]);

  const maxOffset = Math.max(0, candles.length - visibleCount);

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const zoomSpeed = 0.05;
      const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      const newCount = Math.max(10, Math.min(candles.length, Math.round(visibleCount * zoomFactor)));
      setVisibleCount(newCount);
    } 
    else {
      const panSpeed = 0.2;
      const move = Math.round(e.deltaX * panSpeed);
      setRightOffset(prev => Math.max(0, Math.min(maxOffset, prev + move)));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, offset: rightOffset };
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const pixelsPerCandle = (width - 2 * padding) / visibleCount;
    const move = Math.round(deltaX / pixelsPerCandle);
    setRightOffset(Math.max(0, Math.min(maxOffset, dragStartRef.current.offset + move)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full bg-zinc-950 rounded-2xl overflow-hidden cursor-crosshair select-none touch-none ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Grid */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = padding + (i / 4) * (height - 2 * padding);
          const price = max - (i / 4) * (max - min);
          return (
            <React.Fragment key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#18181b" strokeWidth="1" />
              <text x={width - 5} y={y + 4} fill="#52525b" fontSize="10" textAnchor="end" className="mono">
                {price.toFixed(2)}
              </text>
            </React.Fragment>
          );
        })}

        {/* Candles */}
        {displayedCandles.map((candle, i) => {
          const isUp = candle.close >= candle.open;
          const color = isUp ? '#22c55e' : '#ef4444';
          const x = scaleX(i);
          const yOpen = scaleY(candle.open);
          const yClose = scaleY(candle.close);
          const yHigh = scaleY(candle.high);
          const yLow = scaleY(candle.low);
          return (
            <g key={candle.time}>
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth={candleWidth > 4 ? "1.5" : "1"} />
              {candleWidth > 1 && (
                <rect x={x - candleWidth / 2} y={Math.min(yOpen, yClose)} width={candleWidth} height={Math.max(1, Math.abs(yOpen - yClose))} fill={color} />
              )}
            </g>
          );
        })}

        {/* Entry Position - Unified Badge */}
        {position && scaleY(position.entryPrice) >= padding && scaleY(position.entryPrice) <= height - padding && (
          <g>
            <line x1={padding} y1={scaleY(position.entryPrice)} x2={width - padding} y2={scaleY(position.entryPrice)} stroke={position.type === PositionType.LONG ? '#22c55e' : '#ef4444'} strokeWidth="1.5" strokeDasharray="4 2" />
            <g transform={`translate(${padding}, ${scaleY(position.entryPrice) - 11})`}>
              <rect x={0} y={0} width={245} height={22} fill="#000" stroke={position.type === PositionType.LONG ? '#22c55e' : '#ef4444'} strokeWidth="1" rx="4" />
              <text x={8} y={15} fontSize="10" fontWeight="bold" className="mono">
                <tspan fill={currentPnL >= 0 ? '#22c55e' : '#ef4444'}>P&L {currentPnL >= 0 ? '+' : ''}{currentPnL.toFixed(2)} | {((position.amount * LEVERAGE) / position.entryPrice).toFixed(4)} VOL</tspan>
                <tspan fill="#52525b" dx="8">|</tspan>
                <tspan fill="#fff" dx="8">{position.entryPrice.toFixed(2)}</tspan>
              </text>
            </g>
          </g>
        )}

        {/* Price Line */}
        {candles.length > 0 && rightOffset < visibleCount && (
          <g>
            <line x1={padding} y1={scaleY(candles[candles.length - 1].close)} x2={width - padding} y2={scaleY(candles[candles.length - 1].close)} stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" />
            <rect x={width - padding - 55} y={scaleY(candles[candles.length - 1].close) - 10} width={60} height={20} fill="#22c55e" rx="2" />
            <text x={width - padding - 25} y={scaleY(candles[candles.length - 1].close) + 4} fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle" className="mono">{candles[candles.length - 1].close.toFixed(2)}</text>
          </g>
        )}
      </svg>
      
      <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Asset</span>
          <span className="font-bold text-sm text-green-400">HIDDEN ASSET</span>
        </div>
        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">View</span>
          <span className="font-bold text-sm">1m / {visibleCount} candles</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
