'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { stat } from 'fs';

/*
 * ORM
 */

interface Player {
  PlayerID: number;
  Name: string;
  PhoneNumber: string;
  Email: string;
  Profit: number;
  Amount: number;
}

interface Game {
  GameID: number;
  Time: string;
  Location: string;
  PlayerWon: string;
  WinningAmount: number;
}

interface Stats {
  AvgWinnings: number,
  CountPlayers: number
}

export default function Home() {
  /*
   * CONSTANTS FOR PLAYERS
   */

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<Player>({
    PlayerID: 0,
    Name: '',
    PhoneNumber: '',
    Email: '',
    Profit: 0,
    Amount: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [editPlayerId, setEditPlayerId] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  /*
   * CONSTANTS FOR GAMES
   */

  const [games, setGames] = useState<Game[]>([]);
  const [buyIns, setBuyIns] = useState<any>({});
  const [gameId, setGameId] = useState<number | null>(null);

  const [showGameForm, setShowGameForm] = useState(false);
  const [gameLocation, setGameLocation] = useState('');
  const [gameDateTime, setGameDateTime] = useState<Date>(new Date());
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [showOutcomes, setShowOutcomes] = useState(false);
  const [outcomes, setOutcomes] = useState<{ [key: string]: number }>({});

  /*
   * CONSTANTS FOR FILTERS
   */

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [winningPlayer, setWinningPlayer] = useState<string>('');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);

  useEffect(() => {
    fetchPlayers();
    fetchGames();
    fetchUniqueLocations();
  }, []);

  /*
   * PLAYER STUFF
   */

  const fetchPlayers = async () => {
    try {
      const response = await axios.get<Player[]>('http://localhost:3001/api/players');
      console.log(response.data);
      const mappedPlayers: Player[] = response.data.map((playerData: any) => ({
        PlayerID: playerData[0],
        Name: playerData[1],
        PhoneNumber: playerData[2],
        Email: playerData[3],
        Profit: playerData[4],
        Amount: playerData[5]
    }));

    setPlayers(mappedPlayers);
    console.log(mappedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'Amount') {
      newValue = newValue.replace(/[^\d.]/g, '');
      newValue = newValue.replace(/^-/, ''); 
      newValue = newValue.replace(/(\.\d\d)\d+$/, '$1');
    }

    setNewPlayer(prevState => ({
      ...prevState,
      [name]: newValue
    }));
  }

  // Function to handle submitting the player form (both add and edit)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (newPlayer.Amount < 0) {
        setAmountError('Amount must be non-negative');
      } else {
        setAmountError(null);
      }
      if (editMode && editPlayerId) {
        // If edit mode is enabled, send a PUT request to update the player
        await axios.put(`http://localhost:3001/api/players/${editPlayerId}`, newPlayer);
      } else {
        // If edit mode is not enabled, send a POST request to add a new player
        await axios.post('http://localhost:3001/api/addPlayer', newPlayer);
      }
      // Refresh the players and games list after adding or editing a player
      fetchPlayers();
      fetchGames();
      // Reset the form fields and edit mode
      cancelEdit();
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleEditPlayer = (player: Player) => {
    // Set the form fields with the player data being edited
    setNewPlayer({
      PlayerID: player.PlayerID,
      Name: player.Name,
      PhoneNumber: player.PhoneNumber,
      Email: player.Email,
      Profit: player.Profit,
      Amount: player.Amount
    });
    setEditMode(true); // Set edit mode to true
    setEditPlayerId(player.PlayerID); // Set the ID of the player being edited
  }
  // Function to handle canceling edit mode
  const cancelEdit = () => {
    setEditMode(false); // Reset edit mode
    setEditPlayerId(null); // Reset player ID
    setNewPlayer({ // Reset form fields
      PlayerID: 0,
      Name: '',
      PhoneNumber: '',
      Email: '',
      Profit: 0,
      Amount: 0
    });
  }
  const handleDeletePlayer = async (playerID: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await axios.delete(`http://localhost:3001/api/players/${playerID}`);
        // Refresh the players list after deleting the player
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  }

  // Check if the player being edited exists in the player list
  const editedPlayer = players.find(player => player.PlayerID === editPlayerId);

  // Reset form fields if the player being edited does not exist
  if (editMode && !editedPlayer) {
    cancelEdit();
  }

  /*
   * GAME STUFF
   */

  // Fetches games from server
  const fetchGames = async () => {
    try {
      const response = await axios.get<Game[]>('http://localhost:3001/api/games');
      console.log(response.data);
      const mappedGames: Game[] = response.data.map((gameData: any) => ({
        GameID: gameData[0],
        Time: gameData[1],
        Location: gameData[2],
        PlayerWon: gameData[3],
        WinningAmount: gameData[4]
    }));

    setGames(mappedGames);
    console.log(mappedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }

  // Checks which players are in the current game
  const handlePlayerSelect = (playerID: number) => {
    if (selectedPlayers.includes(playerID)) {
        setSelectedPlayers(prevState => prevState.filter(id => id !== playerID));
    } else {
        setSelectedPlayers(prevState => [...prevState, playerID]);
    }
};

  // Handles the buy ins for the players
  const handleBuyInChange = (playerID: number, amount: number) => {
      setBuyIns(prevState => ({ ...prevState, [playerID]: amount }));
  };

  // Starts the game and server checks if the buy in amount is good
  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlayers.length <= 1) {
      alert("Two players required to start game!")
      return;
    }

    // Prepare game data
    const gameData = {
        timestamp: gameDateTime?.toISOString(),
        location: gameLocation,
        buyIns: Object.entries(buyIns).map(([playerID, buyIn]) => ({ playerID, buyIn })),
    };

    try {
        // Send game data to the server
        const status = await axios.post('http://localhost:3001/api/startGame', gameData);

        console.log("STATUS: ", status)
        setShowGameForm(false);
        setShowOutcomes(true);

        setGameId(status.data.GameID)
        setBuyIns(status.data.PlayerBuyIns);
    } catch (error: any) {
      if (error.response.status == 404) {
        alert("One of the players has a buy in higher than current amount!")
      } else {
        console.error('Error starting game:', error);
      }
    }
  };

  // Finishes the game, updates the tables necessary and app
  const handleOutcomeChange = (playerID: string, outcome: number) => {
    setOutcomes(prevState => ({ ...prevState, [playerID]: outcome }));
  };
  const handleUpdateOutcomes = async () => {
      // Prepare game data
      const outcomeData = {
        game_id: gameId,
        outcomes: outcomes,
        buyIns: buyIns
      };
      try {
        // Send outcomes data to the server
        await axios.post('http://localhost:3001/api/updateOutcomes', outcomeData);

        // Close outcomes popup
        setShowOutcomes(false);
        fetchGames();
        fetchPlayers();
        fetchUniqueLocations();
      } catch (error: any) {
        if (error.response.status = 404) {
          alert("Not zero sum!")
        } else {
          console.error('Error updating outcomes:', error);
        }
        // Handle error, e.g., show error message to the user
      }
  };

  /*
   * FILTERING
   */

  const fetchUniqueLocations = async () => {
    try {
        const response = await axios.get('http://localhost:3001/api/unique_locations');
        setUniqueLocations(response.data);
    } catch (error) {
        console.error("Error fetching unique locations:", error);
    }
  };

  const applyFilters = async () => {
    // Prepare filter data
    const filterData = {
      startDate: startDate,
      endDate: endDate,
      location: selectedLocation,
      winningPlayer: winningPlayer
    };

    try {
      const response = await axios.post('http://localhost:3001/api/filter', filterData);

      console.log(response.data);

      const mappedGames: Game[] = response.data.games.map((gameData: any) => ({
        GameID: gameData[0],
        Time: gameData[1],
        Location: gameData[2],
        PlayerWon: gameData[3],
        WinningAmount: gameData[4]
      }));

      const mappedStats: Stats[] = response.data.stats.map((statsData: any) => ({
        AvgWinnings: statsData[0],
        CountPlayers: statsData[1]
      }))

      setFilteredGames(mappedGames);
      setStats(mappedStats);

      console.log("stats: " + stats);

    } catch (error: any) {
      console.log(error);
    }


    setShowFilterModal(false);
  };

  const handleFilterClose = () => {
    setFilteredGames([]);
    setStats([]);
    setShowFilterModal(false);
  }

  /*
   * FORMATTING
   */
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatPrice = (amount: number) => {
    const num = amount;
    if (num < 0) {
      return "-$" + -num;
    } else {
      return "$" + num;
    }
  };

  const handleGameDateTimeChange = (date: Date | null) => {
    if (date) {
        setGameDateTime(date);
    }
  };

  
  /*
   * React HTML Return Statement
   */
  return (
    <div className="flex flex-col h-full">
      <div className='mx-auto text-white p-4 w-full'>
        <h1 className='text-center text-3xl pt-4'>🃏 Poker Database 🎲</h1>
        <div className='mt-8'>
          {/* Players View */}
          <h2 className='text-2xl font-semibold mb-4'>Players</h2>
          <div className='overflow-x-auto rounded-md'>
            <table className='table-auto w-full'>
            <thead>
              <tr className='bg-green-800'>
                <th className='px-4 py-2'>Name</th>
                {/* <th className='px-4 py-2'>ID</th> */}
                <th className='px-4 py-2'>Phone</th>
                <th className='px-4 py-2'>Email</th>
                <th className='px-4 py-2'>Profit</th>
                <th className='px-4 py-2'>Amount</th>
                <th className='px-4 py-2'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-green-800'>
              {players.map(player => (
                <tr key={player.PlayerID}>
                  <td className='px-4 py-2 text-center'>{player.Name}</td>
                  {/* <td className='px-4 py-2 text-center'>{player.PlayerID}</td> */}
                  <td className='px-4 py-2 text-center'>{player.PhoneNumber}</td>
                  <td className='px-4 py-2 text-center'>{player.Email}</td>
                  <td className='px-4 py-2 text-center'>{formatPrice(player.Profit)}</td>
                  <td className='px-4 py-2 text-center'>{formatPrice(player.Amount)}</td>
                  <td className='px-4 py-2 flex justify-center'>
                    <button className='mr-2 px-2 py-1 bg-green-600 text-white rounded-md' onClick={() => handleEditPlayer(player)}>Edit</button>
                    <button className='px-2 py-1 bg-red-600 text-white rounded-md' onClick={() => handleDeletePlayer(player.PlayerID)}>Delete</button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className='mx-auto text-white p-4 flex flex-wrap w-full'>
      <div className='w-full lg:w-1/2 lg:pr'>
        {/* Player Insertion Form */}
        <h2 className='text-xl font-semibold mb-4 text-white'>{editMode ? 'Edit Player' : 'Add New Player'}</h2>
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='name' className='text-white'>Full Name:</label>
            <input type='text' id='name' name='Name' value={newPlayer.Name} onChange={handleInputChange} required className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <div className='mb-4'>
            <label htmlFor='phoneNumber' className='text-white'>Phone Number (Format: xxx-xxx-xxxx):</label>
            <input type='tel' id='phoneNumber' name='PhoneNumber' pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value={newPlayer.PhoneNumber} onChange={handleInputChange} required className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <div className='mb-4'>
            <label htmlFor='email' className='text-white'>Email:</label>
            <input type='email' id='email' name='Email' value={newPlayer.Email} onChange={handleInputChange} required className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <div className='mb-4'>
            <label htmlFor='amount' className='text-white'>Amount (USD):</label>
            <input type='number' id='amount' name='Amount' value={newPlayer.Amount} onChange={handleInputChange} required className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-900 focus:border-green-900' />
          </div>
          <button type='submit' className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline'>{editMode ? 'Edit Player' : 'Add New Player'}</button>
        </form>
      </div>
      <div className='w-full lg:w-1/2 lg:pl-10'>
          <h2 className='text-2xl font-semibold mb-4'>Games</h2>
          <div className='overflow-x-auto rounded-md'>
            <table className='table-auto w-full'>
              <thead>
                <tr className='bg-green-800'>
                  <th className='px-4 py-2'>Time</th>
                  <th className='px-4 py-2'>Location</th>
                  <th className='px-4 py-2'>Winning Player</th>
                  <th className='px-4 py-2'>Winning Amount</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-green-800'>
                {games.map(game => (
                  <tr key={game.GameID}>
                    <td className='px-4 py-2 text-center'>{formatDateTime(game.Time)}</td>
                    <td className='px-4 py-2 text-center'>{game.Location}</td>
                    <td className='px-4 py-2 text-center'>{game.PlayerWon}</td>
                    <td className='px-4 py-2 text-center'>{formatPrice(game.WinningAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mb-4'></div>
          <div>
            <button 
              onClick={() => setShowGameForm(true)} 
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mr-4'>
              Start Game
            </button>
            <button 
              onClick={() => setShowFilterModal(true)} 
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ml-4'>
              Filter Games
            </button>
          </div>
        </div>

    {showGameForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-900 text-white p-8 rounded-md w-full max-w-md">
                <h3 className='text-2xl font-semibold mb-4'>Start a Game</h3>
                <form onSubmit={handleGameSubmit}>
                    <div className='mb-4'>
                      <label>Date and Time:</label>
                        <DatePicker
                            selected={gameDateTime}
                            onChange={handleGameDateTimeChange}
                            showTimeSelect
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-700 focus:border-green-700'
                      />
                    </div>
                    <div className='mb-4'>
                        <label htmlFor='gameLocation'>Location:</label>
                        <input 
                            type='text' 
                            id='gameLocation' 
                            value={gameLocation} 
                            onChange={(e) => setGameLocation(e.target.value)} 
                            required 
                            className='block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-700 focus:border-green-700' 
                        />
                    </div>
                    <div className='mb-4'>
                        <label>Players:</label>
                        {players.map((player: any) => (
                            <div key={player.PlayerID} className='mb-2 flex items-center'>
                                <input 
                                    type='checkbox' 
                                    id={`player-${player.PlayerID}`} 
                                    value={player.PlayerID} 
                                    checked={selectedPlayers.includes(player.PlayerID)} 
                                    onChange={() => handlePlayerSelect(player.PlayerID)} 
                                    className='mr-2'
                                />
                                <label htmlFor={`player-${player.PlayerID}`} className='text-white'>{player.Name}</label>
                                {selectedPlayers.includes(player.PlayerID) && (
                                    <input 
                                        type='number' 
                                        value={buyIns[player.PlayerID] || ''} 
                                        onChange={(e) => handleBuyInChange(player.PlayerID, parseFloat(e.target.value))} 
                                        placeholder='Buy In' 
                                        className='ml-4 px-2 py-1 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-700 focus:border-green-700' 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-between'>
                        <button 
                            type='submit' 
                            className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline'
                        >
                            Finish Buy Ins
                        </button>
                        <button 
                            onClick={() => setShowGameForm(false)} 
                            className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline'
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {showOutcomes && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-900 text-white p-8 rounded-md w-full max-w-md">
                <h3 className='text-2xl font-semibold mb-4'>Enter Outcomes</h3>
                {players
                  .filter(player => selectedPlayers.includes(player.PlayerID))
                  .map((player: any) => (
                    <div key={player.PlayerID} className='mb-4 flex items-center'>
                        <label className='text-white'>{player.Name} Outcome:</label>
                        <input 
                            type='number' 
                            value={outcomes[player.PlayerID] || ''} 
                            onChange={(e) => handleOutcomeChange(player.PlayerID, parseFloat(e.target.value))} 
                            placeholder='Outcome' 
                            className='ml-4 px-2 py-1 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-700 focus:border-green-700' 
                        />
                    </div>
                ))}
                <div className='flex justify-end'>
                    <button 
                        onClick={handleUpdateOutcomes} 
                        className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md mr-2 focus:outline-none focus:shadow-outline'
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    )}

    {filteredGames.length > 0 && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-green-900 p-8 rounded-md w-full max-w-xl shadow-lg">
          <h3 className='text-2xl font-semibold mb-4 text-white'>Filtered Games</h3>
          
          {/* Filtered Games Table */}
          <div className='mb-4 overflow-x-auto rounded-md'>
            <table className='table-auto w-full'>
              <thead>
                <tr className='bg-green-800 text-white'>
                  <th className='px-4 py-2'>Time</th>
                  <th className='px-4 py-2'>Location</th>
                  <th className='px-4 py-2'>Winning Player</th>
                  <th className='px-4 py-2'>Winning Amount</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-green-800'>
                {filteredGames.map(game => (
                  <tr key={game.GameID} className='text-center'>
                    <td className='px-4 py-2'>{formatDateTime(game.Time)}</td>
                    <td className='px-4 py-2'>{game.Location}</td>
                    <td className='px-4 py-2'>{game.PlayerWon}</td>
                    <td className='px-4 py-2'>{formatPrice(game.WinningAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats */}
          {stats && (
            <div className='mb-4 text-white'>
              <h4 className='text-lg font-semibold mb-2'>Stats</h4>
              <p>Average Winnings: {formatPrice(stats[0].AvgWinnings)}</p>
              <p>Number of Games: {stats[0].CountPlayers}</p>
            </div>
          )}

          <div className='flex justify-end'>
            <button 
              onClick={handleFilterClose} 
              className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}


    {showFilterModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-900 text-white p-8 rounded-md w-full max-w-md">
                <h3 className='text-xl font-semibold mb-4'>Filter Games</h3>
                <div className='mb-4'>
                    <label className='text-white'>Date Range:</label>
                    <div className='flex'>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className='mr-2 bg-green-800 text-white px-4 py-2 rounded-md focus:outline-none focus:bg-green-700 focus:border-green-700' 
                        />
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className='bg-green-800 text-white px-4 py-2 rounded-md focus:outline-none focus:bg-green-700 focus:border-green-700' 
                        />
                    </div>
                </div>
                <div className='mb-4'>
                  <label className="text-white">Location:</label>
                  <select 
                      value={selectedLocation} 
                      onChange={(e) => setSelectedLocation(e.target.value)} 
                      className='mr-2 block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-700 focus:border-green-700'
                  >
                      <option value="">All Locations</option>
                      {uniqueLocations.map((location, index) => (
                          <option key={index} value={location}>{location}</option>
                      ))}
                  </select>
                </div>
                <div className='mb-4'>
                    <label className='text-white'>Winning Player:</label>
                    <input 
                        type="text" 
                        value={winningPlayer} 
                        onChange={(e) => setWinningPlayer(e.target.value)} 
                        className='mr-2 block w-full px-4 py-2 rounded-md bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:bg-green-700 focus:border-green-700'
                    />
                </div>
                <div className='flex justify-end'>
                    <button 
                        onClick={applyFilters} 
                        className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mr-2 focus:outline-none focus:shadow-outline'
                    >
                        Apply Filters
                    </button>
                    <button 
                        onClick={() => setShowFilterModal(false)} 
                        className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}

    </div>
      <footer className="bg-gray-700 text-white text-center py-4 mt-auto">
        Developed by Manas Bommakanti
      </footer>
    </div>
  );
}
