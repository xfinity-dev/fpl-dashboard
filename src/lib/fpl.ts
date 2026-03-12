export interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  element_type: number;
  now_cost: number;
  total_points: number;
  team: number;
}

export interface Team {
  id: number;
  name: string;
  short_name: string;
}

export interface Position {
  id: number;
  singular_name: string;
}

export function calculateValue(player: Player): number {
  if (player.now_cost === 0) return 0;
  return player.total_points / (player.now_cost / 10);
}

export function getTopValuePlayers(players: Player[], count: number = 3): Player[] {
  return [...players]
    .filter(p => p.total_points > 0)
    .sort((a, b) => calculateValue(b) - calculateValue(a))
    .slice(0, count);
}

export function getPositionName(elementType: number): string {
  const positions: Record<number, string> = {
    1: 'GKP',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  };
  return positions[elementType] || 'Unknown';
}

export function formatPrice(cost: number): string {
  return `£${(cost / 10).toFixed(1)}m`;
}
