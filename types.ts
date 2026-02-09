
export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum PositionType {
  LONG = 'LONG',
  SHORT = 'SHORT',
  NONE = 'NONE'
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  virtualBalance: number;
  pnl: number;
  isInsideTrade: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  buyIn: number;
  currentPlayers: number;
  maxPlayers: number;
  status: GameStatus;
  prizePool: number;
  startTime?: string;
}

export interface Position {
  type: PositionType;
  entryPrice: number;
  amount: number; // total margin committed (position size in USD)
  liquidationPrice: number;
}

export interface UserState {
  balance: number; // real USDT
  name: string;
  history: any[];
}
