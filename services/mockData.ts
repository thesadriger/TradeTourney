
import { Candle } from '../types';

export const generateHistoricalData = (count: number = 60, startPrice: number = 50000): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const volatility = 0.002; // 0.2%
    const change = currentPrice * volatility * (Math.random() - 0.5);
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (currentPrice * 0.001);
    const low = Math.min(open, close) - Math.random() * (currentPrice * 0.001);
    
    candles.push({
      time: now - (count - i) * 60,
      open,
      high,
      low,
      close,
      volume: Math.random() * 100
    });
    
    currentPrice = close;
  }
  
  return candles;
};

export const getNextTick = (lastCandle: Candle): Candle => {
  const volatility = 0.0015;
  const change = lastCandle.close * volatility * (Math.random() - 0.48); // Slight upward bias for fun
  const open = lastCandle.close;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * (open * 0.0005);
  const low = Math.min(open, close) - Math.random() * (open * 0.0005);
  
  return {
    time: lastCandle.time + 60,
    open,
    high,
    low,
    close,
    volume: Math.random() * 100
  };
};
