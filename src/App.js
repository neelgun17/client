import React, { useState, useEffect, useRef } from 'react'
import './App.css';

import useAuth from './useAuth';

import './firebse-config';
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

function App() {
  const { currentUser, signUp, signIn, signOutUser } = useAuth();

  const [games, setGames] = useState([]);
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [matchingTeams, setMatchingTeams] = useState([]);
  // State for storing teams
  const [teams, setTeams] = useState([]);
  const inputRef = useRef(null);
  const favoriteTeamsRef = useRef([]);


  // get teams from different leagues
  useEffect(() => {
    //fetch teams from API
    const fetchTeamsFromAPI = () => {
      const leagueIds = [39, 40, 61, 62, 78, 79, 88, 94, 135, 136, 140, 141, 253, 254, 255, 262]

      Promise.all(
        leagueIds.map(leagueId => {
          return fetch(`https://v3.football.api-sports.io/teams?league=${leagueId}&season=2022`, {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "df304b83a6de65a52ade2732d0971667"
            }
          })
            .then(response => response.json())
            .then(data => {
              const teamNames = data.response.map(item => item.team.name);
              return teamNames;
            })
            // Return an empty array if an error occurs
            .catch(err => {
              console.log(err);
              return [];
            });
        })
      )
        .then(teamsArray => {
          const allTeams = teamsArray.flat();
          setTeams(allTeams);
          setMatchingTeams(allTeams);
          localStorage.setItem('teams', JSON.stringify(allTeams));
        })
        .catch(err => {
          console.log(err);
        });
    };

    //load teams into local storage
    const loadTeamsFromStorage = () => {
      const cachedTeams = JSON.parse(localStorage.getItem('teams'));
      if (cachedTeams) {
        setTeams(cachedTeams);
        setMatchingTeams(cachedTeams);
      }
    };

    const fetchTeamsIfRequired = () => {
      const lastFetchTime = localStorage.getItem('lastFetchTime');
      const currentTime = new Date().getTime();
      const sixAM = new Date().setHours(6, 0, 0, 0);

      if (!lastFetchTime || currentTime - lastFetchTime > 24 * 60 * 60 * 1000 || currentTime < sixAM) {
        fetchTeamsFromAPI();
        localStorage.setItem('lastFetchTime', currentTime);
      } else {
        loadTeamsFromStorage();
      }
    };

    fetchTeamsIfRequired();

  }, []);

  useEffect(() => {
    const inputField = document.getElementById('teaminput');

    const handleInput = (event) => {
      const input = event.target.value;
      const filteredTeams = teams.filter((team) =>
        team.toLowerCase().includes(input)
      );
      setMatchingTeams(filteredTeams);
      setNewTeam(input);
    };

    inputField.addEventListener('input', handleInput);

    return () => {
      inputField.removeEventListener('input', handleInput);
    };
  }, [matchingTeams]);

  useEffect(() => {
    const storedFavoriteTeams = JSON.parse(localStorage.getItem('favoriteTeams'));
    if (storedFavoriteTeams) {
      setFavoriteTeams(storedFavoriteTeams);
      favoriteTeamsRef.current = storedFavoriteTeams;
    }
  }, []);

  //get games from backend
  function getGames() {
    fetch('/games')
      .then(res => res.json())
      .then(data => {
        setGames(data);
      })
      .catch(error => console.error(error));
  };

  //adds team to favorite team
  function AddTeam() {
    if (newTeam.trim() === '') {
      return; // Don't add an empty team
    }
    const updatedTeams = [...favoriteTeams, newTeam];
    setFavoriteTeams(updatedTeams);
    favoriteTeamsRef.current = updatedTeams;
    //clears the input field
    setNewTeam('');
    sendFavoriteTeams(updatedTeams)
    getGames()
  }

  //deletes team from favorite team
  const handleDeleteTeam = (team) => {
    const updatedTeams = favoriteTeams.filter(t => t !== team);
    setFavoriteTeams(updatedTeams)
    favoriteTeamsRef.current = updatedTeams;
    sendFavoriteTeams(updatedTeams)
    getGames();
  };

  // send updated list of favorite team to backend using post
  function sendFavoriteTeams(updatedTeams) {
    fetch('/favorite_teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favoriteTeams: updatedTeams }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update favorite teams');
        }
        console.log('Favorite teams updated successfully');
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to update favorite teams');
      });
  }

  // add team when enter key is pressed
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      AddTeam();
    }
  };



  const handleTeamSelection = (team) => {
    //updates the text field to match the team that was clicked
    setNewTeam(team);

    //check if the team is already a favorite team
    const isFavorite = favoriteTeamsRef.current.includes(team);
    if (isFavorite) {
      //removes team from favorite list
      const updatedTeams = favoriteTeamsRef.current.filter((t) => t !== team);
      //updates favorite list and sends updated teams to back end
      setFavoriteTeams(updatedTeams);
      favoriteTeamsRef.current = updatedTeams;
      sendFavoriteTeams(updatedTeams);
      getGames();
    } else {
      //adds the newly clicked team to favorite team
      const updatedTeams = [...favoriteTeamsRef.current, team];
      setFavoriteTeams(updatedTeams);
      favoriteTeamsRef.current = updatedTeams;
      // Send updated list of favorite teams
      sendFavoriteTeams(updatedTeams);
      // Fetch games for updated list of favorite teams
      getGames();
    }
  };

  useEffect(() => {
    // Load favorite teams from localStorage on initial render
    const storedFavoriteTeams = JSON.parse(localStorage.getItem('favoriteTeams'));
    if (storedFavoriteTeams) {
      setFavoriteTeams(storedFavoriteTeams);
      favoriteTeamsRef.current = storedFavoriteTeams;
    }
  }, []);

  useEffect(() => {
    // Save favorite teams to localStorage whenever it changes
    localStorage.setItem('favoriteTeams', JSON.stringify(favoriteTeamsRef.current));
  }, [favoriteTeams]);

  return (
    <div>
      <div className="banner">
        <h1 className="banner-title">TeamTracker</h1>
        {!currentUser && (
          <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
        )}
        {currentUser && (
          <div>
            <span>Welcome, {currentUser.email}</span>
            <button onClick={() => signOutUser()}>Sign Out</button>
            </div>
        )}
      </div>
      <div className="team-input-container">
        <label htmlFor="teamInput">Add your favorite team: </label>
        <input
          type="text"
          id="teaminput"
          placeholder="Enter your favorite team"
          value={newTeam}
          onChange={e => setNewTeam(e.target.value)}
          onKeyPress={handleKeyPress}
          ref={inputRef}
        />
        <ul id="team-list">
          {matchingTeams.slice(0, 4).map((team, index) => {
            const isFavorite = favoriteTeams.includes(team);
            return (
              <li
                key={index}
                onClick={() => handleTeamSelection(team)}
              >
                {team} {isFavorite ? <span>&#9733;</span> : <span>&#9734;</span>}
              </li>
            );
          })}
        </ul>
        <button onClick={AddTeam}>Add</button>
      </div>
      <h1 className="title">Your Teams</h1>
      <ul>
        {favoriteTeams.map((team, index) => (
          <div key={index} className="team-oval">
            {team}
            <button
              className="delete-button"
              onClick={() => handleDeleteTeam(team)}>x</button>
          </div>
        ))}
      </ul>
      <h1>Todays Games</h1>
      {games.map((game, index) => (
        <div className="team-input-container" key={index}>{game}</div>
      ))}
    </div>
  )
}

export default App