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
  const [newPlayer, setNewPlayer] = useState<Player>({
    PlayerID: 0,
    Name: '',
    PhoneNumber: '',
    Email: '',
    WinLossRatio: 0,
    Amount: 0
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPlayer(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/addPlayer', newPlayer);
      setNewPlayer({
        PlayerID: 0,
        Name: '',
        PhoneNumber: '',
        Email: '',
        WinLossRatio: 0,
        Amount: 0
      });
      fetchPlayers(); // Refresh player list after adding new player
      alert('Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('An error occurred while adding the player.');
    }
  }

  return (
    <div className='bg-green-900'>
      <div className='mx-auto text-white p-4'>
        <h1 className='text-center text-3xl pt-4'>🃏 Poker Database 🎲</h1>
        <div className='mt-8'>
          {/* Players View */}
          <h2 className='text-2xl font-semibold mb-4'>Players</h2>
          <div className='overflow-x-auto rounded-md'>
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
        </div>
      </div>
      <div className='mx-auto text-white p-4 flex flex-wrap'>
      <div className='w-full lg:w-1/2 lg:pr-40'>
        {/* Player Insertion Form */}
        <h2 className='text-xl font-semibold mb-4 text-white'>Add New Player</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='name' className='text-white'>Full Name:</label>
            <input type='text' id='name' name='Name' value={newPlayer.Name} onChange={handleInputChange} required className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <div className='mb-4'>
            <label htmlFor='phoneNumber' className='text-white'>Phone Number (Format: xxx-xxx-xxxx):</label>
            <input type='tel' id='phoneNumber' name='PhoneNumber' pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value={newPlayer.PhoneNumber} onChange={handleInputChange} className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <div className='mb-4'>
            <label htmlFor='email' className='text-white'>Email:</label>
            <input type='email' id='email' name='Email' value={newPlayer.Email} onChange={handleInputChange} className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <div className='mb-4'>
            <label htmlFor='amount' className='text-white'>Amount (USD):</label>
            <input type='number' id='amount' name='Amount' value={newPlayer.Amount} onChange={handleInputChange} className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <button type='submit' className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline'>Add Player</button>
        </form>
      </div>
      <div className='w-full lg:w-1/2 lg:pl-3'>
          {/* Games View */}
          <h2 className='text-2xl font-semibold mb-4'>Games</h2>
          <div className='overflow-x-auto rounded-md'>
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
    </div>
  );
}
