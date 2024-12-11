const RAPIDAPI_KEY = '88eefc5240mshbf31c46ef44a36cp13f30ejsne7a353f4c274';

// Helper function for fetch calls
function fetchData(url, params = {}) {
    const headers = {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
    };
    let fullUrl = new URL(url);
    Object.keys(params).forEach(key => fullUrl.searchParams.append(key, params[key]));

    return fetch(fullUrl, { headers })
        .then(res => res.json())
        .catch(err => console.error(err));
}

// Fetch and display seasons
function fetchSeasons() {
    const url = 'https://api-nba-v1.p.rapidapi.com/seasons';
    fetchData(url).then(data => {
        console.log('Seasons data:', data);
        const seasonsList = document.getElementById('seasons-list');
        seasonsList.innerHTML = '';
        const seasons = data.api && data.api.seasons ? data.api.seasons : [];
        if (seasons.length === 0) {
            seasonsList.innerHTML = '<li>No seasons found.</li>';
        } else {
            seasons.forEach(season => {
                const li = document.createElement('li');
                li.textContent = season;
                seasonsList.appendChild(li);
            });
        }
    });
}

// Fetch and display leagues
function fetchLeagues() {
    const url = 'https://api-nba-v1.p.rapidapi.com/leagues';
    fetchData(url).then(data => {
        console.log('Leagues data:', data);
        const leaguesList = document.getElementById('leagues-list');
        leaguesList.innerHTML = '';
        const leagues = data.api && data.api.leagues ? data.api.leagues : [];
        if (leagues.length === 0) {
            leaguesList.innerHTML = '<li>No leagues found.</li>';
        } else {
            leagues.forEach(league => {
                const li = document.createElement('li');
                li.textContent = league.name || league;
                leaguesList.appendChild(li);
            });
        }
    });
}

// Fetch and display games by date
function fetchGamesByDate() {
    const dateInput = document.getElementById('dateInput').value.trim();
    if (!dateInput) {
        alert('Please enter a date.');
        return;
    }

    const url = 'https://api-nba-v1.p.rapidapi.com/games';
    fetchData(url, { date: dateInput }).then(data => {
        console.log('Games by date data:', data);
        const gamesList = document.getElementById('games-list');
        gamesList.innerHTML = '';
        const games = data.api && data.api.games ? data.api.games : [];
        if (games.length === 0) {
            gamesList.innerHTML = '<li>No games found for this date.</li>';
        } else {
            games.forEach(game => {
                const li = document.createElement('li');
                const homeTeam = (game.hTeam && game.hTeam.fullName) || 'Home Team';
                const awayTeam = (game.vTeam && game.vTeam.fullName) || 'Away Team';
                li.textContent = `${awayTeam} at ${homeTeam} - Start Time: ${game.startTimeUTC}`;
                gamesList.appendChild(li);
            });
        }
    });
}

// Search players by name with fallback logic
function searchPlayers() {
    let playerName = document.getElementById('playerSearchInput').value.trim();
    if (!playerName) {
        alert('Please enter a player name.');
        return;
    }

    const url = 'https://api-nba-v1.p.rapidapi.com/players';

    // First attempt: full player name
    fetchData(url, { search: playerName })
        .then(data => {
            const players = (data.api && data.api.players) || [];
            if (players.length > 0) {
                displayPlayers(players);
                return null; // Stop here if results were found
            } else {
                // If no results, try just the last name
                const parts = playerName.split(' ');
                if (parts.length > 1) {
                    const lastName = parts[parts.length - 1];
                    return fetchData(url, { search: lastName });
                } else {
                    return { api: { players: [] } }; 
                }
            }
        })
        .then(data => {
            if (data === null) return; // Means we already found players
            if (data && data.api && data.api.players && data.api.players.length > 0) {
                displayPlayers(data.api.players);
            } else {
                document.getElementById('players-list').innerHTML = '<li>No players found.</li>';
            }
        })
        .catch(err => console.error(err));
}

function displayPlayers(players) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        const firstName = player.firstName || '';
        const lastName = player.lastName || '';
        const fullName = (firstName + ' ' + lastName).trim() || 'Unknown Player';
        const teamName = player.teamName ||
            (player.team && (player.team.fullName || player.team.name)) ||
            'N/A';
        li.textContent = `${fullName} - Team: ${teamName}`;
        playersList.appendChild(li);
    });
}
