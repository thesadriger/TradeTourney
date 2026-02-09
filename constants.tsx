
import React from 'react';

export const INITIAL_VIRTUAL_BALANCE = 10000;
export const PLATFORM_FEE = 0.05;

export const MOCK_TOURNAMENTS = [
  { id: '1', title: 'Fast Game #322', buyIn: 10, currentPlayers: 4, maxPlayers: 6, status: 'WAITING', prizePool: 57 },
  { id: '2', title: 'Whale Battle', buyIn: 100, currentPlayers: 2, maxPlayers: 2, status: 'IN_PROGRESS', prizePool: 190 },
  { id: '3', title: 'Micro Grind', buyIn: 1, currentPlayers: 1, maxPlayers: 10, status: 'WAITING', prizePool: 9.5 },
  { id: '4', title: 'Sunday Major', buyIn: 50, currentPlayers: 12, maxPlayers: 20, status: 'WAITING', prizePool: 950 },
];

export const ICONS = {
  USDT: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#26A17B" />
      <path d="M12.5 7V9.5H16V11.5H12.5V14.5C12.5 15.5 12 16.5 10.5 16.5H9V14.5H10.5V11.5H7V9.5H10.5V7H12.5Z" fill="white" />
    </svg>
  ),
};
