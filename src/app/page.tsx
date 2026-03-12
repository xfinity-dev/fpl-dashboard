'use client';

import { useState, useEffect, useMemo } from 'react';
import { Player, Team, calculateValue, getPositionName, formatPrice, getTopValuePlayers } from '@/lib/fpl';

type SortField = 'web_name' | 'element_type' | 'now_cost' | 'total_points';
type SortDirection = 'asc' | 'desc';

interface FPLData {
  players: Player[];
  gameweeks: Array<{ id: number; name: string; is_current: boolean }>;
  teams: Team[];
}

export default function Dashboard() {
  const [data, setData] = useState<FPLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('total_points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/fpl');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const sortedPlayers = useMemo(() => {
    if (!data?.players) return [];
    return [...data.players].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      
      if (sortField === 'web_name') {
        aVal = a.web_name.toLowerCase();
        bVal = b.web_name.toLowerCase();
      } else if (sortField === 'element_type') {
        aVal = a.element_type;
        bVal = b.element_type;
      } else if (sortField === 'now_cost') {
        aVal = a.now_cost;
        bVal = b.now_cost;
      } else {
        aVal = a.total_points;
        bVal = b.total_points;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data?.players, sortField, sortDirection]);

  const topValuePlayers = useMemo(() => {
    if (!data?.players) return [];
    return getTopValuePlayers(data.players, 3);
  }, [data?.players]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading FPL data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ⚽ FPL Analytics Dashboard
        </h1>

        {/* Transfer Strategy Module */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">💎 Top Value Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topValuePlayers.map((player, index) => (
              <div
                key={player.id}
                className={`bg-slate-700 rounded-lg p-4 ${
                  index === 0 ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {calculateValue(player).toFixed(2)} pts/£m
                  </span>
                </div>
                <div className="text-xl font-bold">{player.web_name}</div>
                <div className="text-slate-400">
                  {getPositionName(player.element_type)} • {formatPrice(player.now_cost)}
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {player.total_points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Screener Table */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">👥 Player Screener</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th
                    className="text-left p-3 cursor-pointer hover:text-emerald-400 transition"
                    onClick={() => handleSort('web_name')}
                  >
                    Name <SortIcon field="web_name" />
                  </th>
                  <th
                    className="text-left p-3 cursor-pointer hover:text-emerald-400 transition"
                    onClick={() => handleSort('element_type')}
                  >
                    Position <SortIcon field="element_type" />
                  </th>
                  <th
                    className="text-right p-3 cursor-pointer hover:text-emerald-400 transition"
                    onClick={() => handleSort('now_cost')}
                  >
                    Price <SortIcon field="now_cost" />
                  </th>
                  <th
                    className="text-right p-3 cursor-pointer hover:text-emerald-400 transition"
                    onClick={() => handleSort('total_points')}
                  >
                    Total Points <SortIcon field="total_points" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.slice(0, 50).map((player) => (
                  <tr
                    key={player.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/50 transition"
                  >
                    <td className="p-3 font-medium">{player.web_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          player.element_type === 1
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : player.element_type === 2
                            ? 'bg-blue-500/20 text-blue-400'
                            : player.element_type === 3
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {getPositionName(player.element_type)}
                      </span>
                    </td>
                    <td className="p-3 text-right">{formatPrice(player.now_cost)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {player.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Showing top 50 players • Total: {data?.players.length} players
          </p>
        </div>
      </div>
    </div>
  );
}
