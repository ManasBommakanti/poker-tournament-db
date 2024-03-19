'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Player {
  PlayerID: number;
  Name: string;
  PhoneNumber: string;
  Email: string;
  WinLossRatio: number;
  Amount: number;
}

interface Game {
  GameID: number;
  Time: string;
  Location: string;
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetchPlayers();
    fetchGames();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get<Player[]>('http://localhost:3001/api/players');
      console.log(response.data);
      const mappedPlayers: Player[] = response.data.map((playerData: any) => ({
        PlayerID: playerData[0],
        Name: playerData[1],
        PhoneNumber: playerData[2],
        Email: playerData[3],
        WinLossRatio: playerData[4],
        Amount: playerData[5]
    }));

    setPlayers(mappedPlayers);
    console.log(mappedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }

  const fetchGames = async () => {
    try {
      const response = await axios.get<Game[]>('http://localhost:3001/api/games');
      console.log(response.data);
      const mappedGames: Game[] = response.data.map((gameData: any) => ({
        GameID: gameData[0],
        Time: gameData[1],
        Location: gameData[2]
    }));

    setGames(mappedGames);
    console.log(mappedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }

  return (
    <>
      <div className='container mx-auto bg-green-900 text-white p-4'>
        <h1 className='text-center text-3xl pt-4'>🃏 Poker Database 🎲</h1>
        <div className='mt-8'>
          <h2 className='text-2xl font-semibold mb-4'>Players</h2>
          <div className='overflow-x-auto rounded-lg'>
            <table className='table-auto w-full'>
              <thead>
                <tr className='bg-green-800'>
                  <th className='px-4 py-2'>Name</th>
                  <th className='px-4 py-2'>ID</th>
                  <th className='px-4 py-2'>Phone</th>
                  <th className='px-4 py-2'>Email</th>
                  <th className='px-4 py-2'>Win/Loss Ratio</th>
                  <th className='px-4 py-2'>Amount</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-green-800'>
                {players.map(player => (
                  <tr key={player.PlayerID}>
                    <td className='px-4 py-2 text-center'>{player.Name}</td>
                    <td className='px-4 py-2 text-center'>{player.PlayerID}</td>
                    <td className='px-4 py-2 text-center'>{player.PhoneNumber}</td>
                    <td className='px-4 py-2 text-center'>{player.Email}</td>
                    <td className='px-4 py-2 text-center'>{player.WinLossRatio}</td>
                    <td className='px-4 py-2 text-center'>${player.Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mb-4'></div>
          <h2 className='text-2xl font-semibold mb-4'>Games</h2>
          <div className='overflow-x-auto rounded-lg'>
            <table className='table-auto w-full'>
              <thead>
                <tr className='bg-green-800'>
                  <th className='px-4 py-2'>ID</th>
                  <th className='px-4 py-2'>Time</th>
                  <th className='px-4 py-2'>Location</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-green-800'>
                {games.map(game => (
                  <tr key={game.GameID}>
                    <td className='px-4 py-2 text-center'>{game.GameID}</td>
                    <td className='px-4 py-2 text-center'>{game.Time}</td>
                    <td className='px-4 py-2 text-center'>{game.Location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
