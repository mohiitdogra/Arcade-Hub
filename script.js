const authModal = document.getElementById('authModal');
const authSubmit = document.getElementById('authSubmit');
const errorMsg = document.getElementById('errorMsg');
let isSignupMode = false;
let currentUser = null;
let currentGameType = '';
let activeGridId = 'retroGrid'; // Default to retro grid

// --- New Data Management System ---

// Helper functions for a unified data structure in localStorage
function getArcadeData() {
    const defaultData = {
        users: {},
        settings: { music: true, sfx: true },
        rememberedUser: null,
        lastUser: null
    };
    try {
        const data = JSON.parse(localStorage.getItem('arcadeData'));
        return data || defaultData;
    } catch (e) {
        console.error("Could not parse arcadeData, resetting to default.", e);
        return defaultData;
    }
}

function saveArcadeData(data) {
    localStorage.setItem('arcadeData', JSON.stringify(data));
}

// IMPORTANT: This is NOT a secure hashing function. 
// It's a placeholder to demonstrate the concept of not storing plaintext passwords.
// In a real application, use a library like bcrypt.
function hashPassword(password) {
    return btoa(password); // Base64 encoding as a mock hash.
}

// --- End of Data Management ---
const pixelAvatars = [
    // Robot
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#475569" d="M2 2h6v6H2z"/><path fill="#38bdf8" d="M3 3h1v1H3zm3 0h1v1H6z"/><path fill="#ef4444" d="M1 4h1v2H1zm8 0h1v2H9z"/><path fill="#94a3b8" d="M3 6h4v1H3z"/></svg>',
    // Alien
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#22c55e" d="M2 2h6v6H2z"/><path fill="#000" d="M3 3h1v1H3zm4 0h1v1H7z"/><path fill="#000" d="M4 6h2v1H4z"/><path fill="#166534" d="M1 3h1v2H1zm8 3h1v2H9z"/></svg>',
    // Wizard
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#a855f7" d="M3 4h4v4H3z"/><path fill="#fbbf24" d="M2 3h6v1H2zM3 1h4v2H3z"/><path fill="#fff" d="M4 5h1v1H4zm2 0h1v1H6z"/><path fill="#e2e8f0" d="M4 7h2v1H4z"/></svg>',
    // Knight
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#94a3b8" d="M3 1h4v7H3z"/><path fill="#cbd5e1" d="M4 3h2v1H4z"/><path fill="#000" d="M4 3h1v1H4zm1 0h1v1H5z"/><path fill="#64748b" d="M2 4h1v4H2zm7 0h1v4H9z"/></svg>',
    // Cat
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#fbbf24" d="M2 2h1v2H2zm5 0h1v2H7zM3 3h4v5H3z"/><path fill="#000" d="M4 4h1v1H4zm2 0h1v1H6z"/><path fill="#f472b6" d="M5 6h1v1H5z"/></svg>',
    // Skull
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#e2e8f0" d="M3 2h4v5H3zM4 7h2v1H4z"/><path fill="#000" d="M4 3h1v1H4zm2 0h1v1H6zM5 5h1v1H5z"/></svg>',
    // Ninja
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#1e293b" d="M3 2h4v6H3z"/><path fill="#fca5a5" d="M4 3h3v1H4z"/><path fill="#000" d="M4 3h1v1H4zm2 0h1v1H6z"/><path fill="#ef4444" d="M2 3h1v2H2zm7 0h1v2H9z"/></svg>',
    // Slime
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#4ade80" d="M3 4h4v4H3zM2 6h1v2H2zm7 0h1v2H9z"/><path fill="#000" d="M4 5h1v1H4zm2 0h1v1H6z"/><path fill="#fff" d="M3 4h1v1H3z"/></svg>',
    // Pumpkin
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#f97316" d="M2 3h6v5H2z"/><path fill="#166534" d="M5 1h1v2H5z"/><path fill="#000" d="M3 4h1v1H3zm4 0h1v1H7zM4 6h3v1H4z"/></svg>',
    // Ghost
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#22d3ee" d="M3 2h4v6H3zM2 4h1v4H2zm7 0h1v4H9z"/><path fill="#000" d="M4 3h1v1H4zm2 0h1v1H6z"/></svg>',
    // Bear
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#78350f" d="M2 2h2v2H2zm4 0h2v2H6zM3 3h4v5H3z"/><path fill="#000" d="M4 4h1v1H4zm2 0h1v1H6z"/><path fill="#fcd34d" d="M4 6h2v1H4z"/></svg>',
    // Duck
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#facc15" d="M3 3h4v4H3zM2 4h1v2H2z"/><path fill="#000" d="M5 4h1v1H5z"/><path fill="#f97316" d="M6 5h2v1H6z"/></svg>'

];

// Open Modal
document.getElementById('openLogin').onclick = () => showModal(false);
document.getElementById('openSignup').onclick = () => showModal(true);
document.getElementById('closeModal').onclick = () => authModal.classList.remove('show');

function showModal(signup) {
    isSignupMode = signup;
    authModal.classList.add('show');
    document.getElementById('modalTitle').innerText = signup ? "Create Account" : "Welcome Back";
    errorMsg.innerText = "";
    
    if (!signup) {
        const data = getArcadeData();
        if (data.rememberedUser) {
            const u = document.getElementById('username');
            const c = document.getElementById('rememberMeCheck');
            if (u) u.value = data.rememberedUser;
            if (c) c.checked = true;
        }
    }
}

authSubmit.onclick = () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const data = getArcadeData();

    if (isSignupMode) {
        if (data.users[user]) {
            errorMsg.innerText = "User already exists!";
        } else {
            data.users[user] = {
                passwordHash: hashPassword(pass),
                avatar: Math.floor(Math.random() * pixelAvatars.length),
                scores: {},
                playCounts: {}
            };
            saveArcadeData(data);
            alert("Signup Successful! Please Login.");
            showModal(false);
        }
    } else {
        if (data.users[user] && data.users[user].passwordHash === hashPassword(pass)) {
            data.lastUser = user;
            const remember = document.getElementById('rememberMeCheck') && document.getElementById('rememberMeCheck').checked;
            if (remember) {
                data.rememberedUser = user;
            } else {
                data.rememberedUser = null;
            }
            saveArcadeData(data);
            loginUser(user);
        } else {
            errorMsg.innerText = "Invalid username or password!";
        }
    }
};

function loginUser(name) {
    currentUser = name;
    const bg = document.getElementById('homeBgCanvas');
    if(bg) { bg.style.opacity = 0; setTimeout(() => bg.remove(), 1000); }

    const ufo = document.querySelector('.ufo-container');
    if (ufo) ufo.style.display = 'none';

    authModal.classList.remove('show');
    document.getElementById('openLogin').classList.add('hidden');
    document.getElementById('openSignup').classList.add('hidden');
    updateUserDisplay(name);
    document.getElementById('mainMenu').classList.remove('hidden');
    document.querySelector('.hero').style.display = 'none';
    document.getElementById('gamesSection').classList.remove('hidden');

    // Redesign Side Panel
    const menu = document.getElementById('dropdownMenu');
    menu.innerHTML = ''; // Clear existing items

    const btnStyle = 'display: block; width: 90%; margin: 0.5rem auto; padding: 0.5rem; background: #334155; color: white; border: none; border-radius: 0.5rem; cursor: pointer; text-align: center; font-size: 0.9rem; transition: all 0.3s ease;';

    // 1. Profile Button
    const profileBtn = document.createElement('button');
    profileBtn.innerText = 'Profile';
    profileBtn.style.cssText = btnStyle;
    profileBtn.onmouseover = () => { profileBtn.style.background = '#475569'; profileBtn.style.boxShadow = '0 0 15px #38bdf8'; profileBtn.style.transform = 'scale(1.05)'; };
    profileBtn.onmouseout = () => { profileBtn.style.background = '#334155'; profileBtn.style.boxShadow = 'none'; profileBtn.style.transform = 'scale(1)'; };
    profileBtn.onclick = openProfileModal;
    menu.appendChild(profileBtn);

    // 2. Scoreboard Button
    const scoreBtn = document.createElement('button');
    scoreBtn.innerText = 'Scoreboard';
    scoreBtn.style.cssText = btnStyle;
    scoreBtn.onmouseover = () => { scoreBtn.style.background = '#475569'; scoreBtn.style.boxShadow = '0 0 15px #38bdf8'; scoreBtn.style.transform = 'scale(1.05)'; };
    scoreBtn.onmouseout = () => { scoreBtn.style.background = '#334155'; scoreBtn.style.boxShadow = 'none'; scoreBtn.style.transform = 'scale(1)'; };
    scoreBtn.onclick = openScoreboardModal;
    menu.appendChild(scoreBtn);

    // 3. Settings Button
    const settingsBtn = document.createElement('button');
    settingsBtn.innerText = 'Settings';
    settingsBtn.style.cssText = btnStyle;
    settingsBtn.onmouseover = () => { settingsBtn.style.background = '#475569'; settingsBtn.style.boxShadow = '0 0 15px #38bdf8'; settingsBtn.style.transform = 'scale(1.05)'; };
    settingsBtn.onmouseout = () => { settingsBtn.style.background = '#334155'; settingsBtn.style.boxShadow = 'none'; settingsBtn.style.transform = 'scale(1)'; };
    settingsBtn.onclick = openSettingsModal;
    menu.appendChild(settingsBtn);

    // 4. Logout Button
    const logoutBtn = document.createElement('button');
    logoutBtn.innerText = 'Logout';
    logoutBtn.style.cssText = btnStyle;
    logoutBtn.style.marginTop = '2rem';
    logoutBtn.style.background = '#ef4444';
    logoutBtn.onmouseover = () => { logoutBtn.style.background = '#dc2626'; logoutBtn.style.boxShadow = '0 0 15px #ef4444'; logoutBtn.style.transform = 'scale(1.05)'; };
    logoutBtn.onmouseout = () => { logoutBtn.style.background = '#ef4444'; logoutBtn.style.boxShadow = 'none'; logoutBtn.style.transform = 'scale(1)'; };
    logoutBtn.onclick = () => {
        const data = getArcadeData();
        data.lastUser = null;
        saveArcadeData(data);
        location.reload();
    };
    menu.appendChild(logoutBtn);

    // Attempt to play music on login (checks settings internally)
    playMusic();
}

document.getElementById('menuLogoutBtn').onclick = () => {
    const data = getArcadeData();
    data.lastUser = null;
    saveArcadeData(data);
    location.reload();
};

function updateUserDisplay(name) {
    const data = getArcadeData();
    const avatarIdx = data.users[name]?.avatar || 0;
    const svg = pixelAvatars[avatarIdx];
    const greeting = document.getElementById('userGreeting');
    greeting.innerHTML = `
        <div class="avatar-box">${svg}</div>
        <span class="username-text">${name}</span>
    `;
    greeting.classList.remove('hidden');
    greeting.onclick = openProfileModal;
}

function createProfileModal() {
    if (document.getElementById('profileModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: none; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px);`;
    
    modal.innerHTML = `
        <div style="background: #1e293b; padding: 2rem; border-radius: 1rem; width: 90%; max-width: 400px; border: 1px solid #334155; color: white;">
            <h2 style="margin-top:0; color: #38bdf8; text-align: center;">Profile</h2>
            
            <div id="profileStats" style="background: #0f172a; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; text-align: center; border: 1px solid #334155;">
                <div style="color: #94a3b8; font-size: 0.9rem;">Most Played Game</div>
                <div id="mostPlayedDisplay" style="color: #fbbf24; font-size: 1.2rem; font-weight: bold;">-</div>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display:block; margin-bottom: 0.5rem; color: #94a3b8;">Username</label>
                <input type="text" id="profileUsername" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 0.5rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
                <label style="display:block; margin-bottom: 0.5rem; color: #94a3b8;">Choose Avatar</label>
                <div id="avatarGrid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    ${pixelAvatars.map((svg, i) => `<div class="avatar-option" data-idx="${i}" style="cursor: pointer; border: 2px solid transparent; border-radius: 0.5rem; padding: 5px; background: #0f172a;">${svg}</div>`).join('')}
                </div>
            </div>
            <div id="profileError" style="color: #ef4444; margin-bottom: 1rem; font-size: 0.9rem; min-height: 1.2em;"></div>
            <div style="display: flex; gap: 1rem;">
                <button id="closeProfileBtn" style="flex: 1; padding: 0.5rem; background: #334155; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Cancel</button>
                <button id="saveProfileBtn" style="flex: 1; padding: 0.5rem; background: #38bdf8; color: #0f172a; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('closeProfileBtn').onclick = () => { modal.style.display = 'none'; };
    
    const options = modal.querySelectorAll('.avatar-option');
    options.forEach(opt => {
        opt.onclick = () => {
            options.forEach(o => { o.style.borderColor = 'transparent'; o.classList.remove('selected'); });
            opt.style.borderColor = '#38bdf8';
            opt.classList.add('selected');
        };
    });
    
    document.getElementById('saveProfileBtn').onclick = saveProfile;
}

function openProfileModal() {
    createProfileModal();
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.classList.remove('menu-visible');
    
    const modal = document.getElementById('profileModal');
    const input = document.getElementById('profileUsername');
    const error = document.getElementById('profileError');
    const options = modal.querySelectorAll('.avatar-option');
    
    input.value = currentUser;
    error.innerText = '';

    // Calculate Most Played
    const data = getArcadeData();
    const userCounts = data.users[currentUser]?.playCounts || {};
    let maxGame = 'None';
    let maxCount = 0;
    for (const [game, count] of Object.entries(userCounts)) {
        if (count > maxCount) {
            maxCount = count;
            maxGame = game.charAt(0).toUpperCase() + game.slice(1);
        }
    }
    document.getElementById('mostPlayedDisplay').innerText = maxGame + (maxCount > 0 ? ` (${maxCount} plays)` : '');
    
    const currentIdx = data.users[currentUser]?.avatar || 0;
    
    options.forEach((opt, i) => {
        opt.classList.remove('selected');
        opt.style.borderColor = 'transparent';
        if (i === currentIdx) {
            opt.classList.add('selected');
            opt.style.borderColor = '#38bdf8';
        }
    });
    modal.style.display = 'flex';
}

function saveProfile() {
    const newName = document.getElementById('profileUsername').value.trim();
    const modal = document.getElementById('profileModal');
    const error = document.getElementById('profileError');
    const selected = modal.querySelector('.avatar-option.selected');
    const newAvatarIdx = selected ? parseInt(selected.dataset.idx) : 0;
    
    if (!newName) { error.innerText = "Username cannot be empty."; return; }
    
    const data = getArcadeData();
    if (newName !== currentUser) {
        if (data.users[newName]) { error.innerText = "Username already taken."; return; }
        // Move user data to the new username
        data.users[newName] = data.users[currentUser];
        delete data.users[currentUser];
        
        currentUser = newName;
        data.lastUser = newName; // Update session user
        if (data.rememberedUser) data.rememberedUser = newName;
    }
    
    // Update avatar for the current user (whether renamed or not)
    data.users[currentUser].avatar = newAvatarIdx;
    saveArcadeData(data);

    updateUserDisplay(currentUser);
    modal.style.display = 'none';
}

function createScoreboardModal() {
    if (document.getElementById('scoreboardModal')) return;
    const modal = document.createElement('div');
    modal.id = 'scoreboardModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: none; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px);`;
    modal.innerHTML = `
        <div style="background: #1e293b; padding: 2rem; border-radius: 1rem; width: 90%; max-width: 400px; border: 1px solid #334155; color: white; max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-top:0; color: #38bdf8; text-align: center;">High Scores</h2>
            <div id="scoresList" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
            <button id="closeScoreboardBtn" style="width: 100%; margin-top: 1.5rem; padding: 0.5rem; background: #334155; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeScoreboardBtn').onclick = () => modal.style.display = 'none';
}

function openScoreboardModal() {
    createScoreboardModal();
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.classList.remove('menu-visible');
    
    const list = document.getElementById('scoresList');
    list.innerHTML = '';
    const data = getArcadeData();
    const userScores = data.users[currentUser]?.scores || {};
    
    Object.keys(userScores).forEach(game => {
        const score = userScores[game] || 0;
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; padding: 0.5rem; background: #0f172a; border-radius: 0.25rem;';
        row.innerHTML = `<span style="text-transform: capitalize;">${game}</span><span style="color: #fbbf24; font-weight: bold;">${score}</span>`;
        list.appendChild(row);
    });
    
    document.getElementById('scoreboardModal').style.display = 'flex';
}

function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.classList.remove('menu-visible');
    
    const data = getArcadeData();
    const settings = data.settings || { music: true, sfx: true };
    
    const musicCheck = document.getElementById('settingMusic');
    const sfxCheck = document.getElementById('settingSFX');
    const delBtn = document.getElementById('deleteAccountBtn');
    const closeBtn = document.getElementById('closeSettingsBtn');

    if (musicCheck) musicCheck.checked = settings.music;
    if (sfxCheck) sfxCheck.checked = settings.sfx;

    if (delBtn) {
        delBtn.style.display = currentUser ? 'block' : 'none';
        delBtn.onclick = () => {
            if(confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                const data = getArcadeData();
                delete data.users[currentUser];
                data.lastUser = null;
                if (data.rememberedUser === currentUser) data.rememberedUser = null;
                saveArcadeData(data);
                location.reload();
            }
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (musicCheck) data.settings.music = musicCheck.checked;
            if (sfxCheck) data.settings.sfx = sfxCheck.checked;
            saveArcadeData(data);

            try {
                if (data.settings.music) playMusic(); else stopMusic();
            } catch (e) { console.error("Audio error:", e); }
            
            modal.classList.remove('show');
        };
    }

    modal.classList.add('show');
}

// Toggle Hamburger Menu
document.getElementById('hamburgerBtn').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('dropdownMenu').classList.toggle('menu-visible');
};

// Resume AudioContext on interaction (browser policy)
document.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdownMenu');
    const btn = document.getElementById('hamburgerBtn');
    if (menu.classList.contains('menu-visible') && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('menu-visible');
    }
});

// --- Expose Active Grid Setter for HTML ---
window.setActiveGrid = function(gridId) {
    activeGridId = gridId;
};

// Ensure this is at the top or bottom of your script.js
window.showModal = function(signup) {
    isSignupMode = signup;
    authModal.classList.add('show');
    document.getElementById('modalTitle').innerText = signup ? "Create Account" : "Welcome Back";
    errorMsg.innerText = "";
    
    if (!signup) {
        const data = getArcadeData();
        if (data.rememberedUser) {
            const u = document.getElementById('username');
            const c = document.getElementById('rememberMeCheck');
            if (u) u.value = data.rememberedUser;
            if (c) c.checked = true;
        }
    }
};

// Check for saved session on load
const data = getArcadeData();
if (data.lastUser && data.users[data.lastUser]) {
    loginUser(data.lastUser);
} else {
    initHomePageAnimation();
    initUfoController();
}

function updateGameControls(gameType) {
    const controlsEl = document.getElementById('gameControlsDisplay');
    let controlsText = 'Use <strong>Arrow Keys</strong> to Move';
    switch(gameType) {
        case 'snake': controlsText = '<strong>Arrow Keys</strong> to change direction.'; break;
        case 'invaders': case 'invaders-endless': controlsText = '<strong>← →</strong> to Move, <strong>Space</strong> to Shoot.'; break;
        case 'pong': controlsText = '<strong>↑ ↓</strong> to Move Paddle.'; break;
        case 'flappy': controlsText = '<strong>Space</strong> to Jump.'; break;
        case 'clicker': controlsText = '<strong>Click</strong> the targets as fast as you can!'; break;
        case 'memory': controlsText = '<strong>Click</strong> cards to find matching pairs.'; break;
        case 'typing': controlsText = '<strong>Type</strong> the falling letters.'; break;
        case 'tetris': controlsText = '<strong>← →</strong> to Move, <strong>↓</strong> to Speed Up, <strong>Space</strong> to Rotate.'; break;
        case 'doodle': controlsText = '<strong>← →</strong> to Move, <strong>Space</strong> or <strong>↑</strong> to Shoot.'; break;
        case 'pacman': controlsText = '<strong>Arrow Keys</strong> to Move.'; break;
        case 'cycles': controlsText = '<strong>Arrow Keys</strong> to Turn, <strong>Space</strong> for Turbo.'; break;
        case 'simon': controlsText = '<strong>Click</strong> the pads or use <strong>Arrow Keys</strong> to repeat the pattern.'; break;
        case 'platformer': controlsText = '<strong>Arrow Keys</strong> to Move, <strong>Space</strong> or <strong>↑</strong> to Jump.'; break;
        case '2048': controlsText = '<strong>Arrow Keys</strong> to Slide Tiles.'; break;
        case 'sudoku': controlsText = '<strong>Click</strong> to select, <strong>Numbers</strong> to fill.'; break;
        case 'minesweeper': controlsText = '<strong>Left Click</strong> to Reveal, <strong>Right Click</strong> to Flag.'; break;
        case 'wordle': controlsText = '<strong>Type</strong> letters, <strong>Enter</strong> to submit.'; break;
        case 'tictactoe': controlsText = '<strong>Click</strong> to place X.'; break;
        case 'math': controlsText = '<strong>Click</strong> the correct answer.'; break;
        case 'chess': controlsText = '<strong>Click</strong> to select and move pieces.'; break;
        case 'connect4': controlsText = '<strong>Click</strong> columns to drop pieces.'; break;
        case 'stroop': controlsText = '<strong>Click</strong> the button matching the <strong>text color</strong>.'; break;
        case 'crossy': controlsText = '<strong>Arrow Keys</strong> to Hop. Avoid cars and water!'; break;
        case 'paperio': controlsText = '<strong>Arrow Keys</strong> to Move. Enclose territory to capture.'; break;
    }
    controlsEl.innerHTML = `<p>${controlsText}</p>`;
}

// Select all the spans inside our floating-text h1
const letters = document.querySelectorAll('.floating-text span');

letters.forEach((letter) => {
    // Generate a random delay between 0 and 2 seconds
    const randomDelay = Math.random() * 2;
    // Generate a random duration between 2 and 4 seconds for variety
    const randomDuration = 2 + Math.random() * 2;
    
    letter.style.animationDelay = `${randomDelay}s`;
    letter.style.animationDuration = `${randomDuration}s`;
});

/* --- GAME LOGIC --- */
let gameInterval;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function createParticles(x, y, color) {
    for(let i=0; i<12; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color
        });
    }
}

function drawParticles() {
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
        if(p.life <= 0) particles.splice(i, 1);
    }
}

window.loadGame = function(gameType) {
    stopMusic();
    if (gameInterval) clearInterval(gameInterval);
    currentGameType = gameType;

    // Force hide ALL grids to prevent overlaps
    document.querySelectorAll('.game-grid').forEach(grid => grid.classList.add('hidden'));
    
    document.getElementById('activeGameContainer').classList.remove('hidden');
    const loader = document.getElementById('gameLoadingOverlay');
    loader.classList.remove('hidden');

    // Update play counts
    if (currentUser) {
        const data = getArcadeData();
        if (!data.users[currentUser].playCounts) data.users[currentUser].playCounts = {};
        data.users[currentUser].playCounts[gameType] = (data.users[currentUser].playCounts[gameType] || 0) + 1;
        saveArcadeData(data);
    }

    // Update UI
    document.getElementById('highScoreDisplay').innerText = `High Score: ${getHighScore(gameType)}`;
    updateGameControls(gameType);

    // Fake loading time for smoother transition
    setTimeout(() => {
        loader.classList.add('hidden');
        startGame(gameType);
    }, 500);
};

function startGame(gameType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    if (gameType === 'invaders') {
        const modal = document.createElement('div');
        modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(5px);";
        
        const content = document.createElement('div');
        content.style.cssText = "background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.5); min-width: 300px;";
        
        const title = document.createElement('h2');
        title.innerText = "Select Mode";
        title.style.cssText = "color: #38bdf8; margin-top: 0; margin-bottom: 1.5rem; font-family: 'Segoe UI', sans-serif;";
        
        const btnStyle = "display: block; width: 100%; padding: 1rem; margin: 1rem 0; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 0.5rem; cursor: pointer; font-size: 1.1rem; transition: all 0.3s ease;";
        
        const createBtn = (text, mode) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.cssText = btnStyle;
            btn.onmouseover = () => { btn.style.borderColor = '#38bdf8'; btn.style.boxShadow = '0 0 15px #38bdf8'; btn.style.transform = 'scale(1.05)'; };
            btn.onmouseout = () => { btn.style.borderColor = '#334155'; btn.style.boxShadow = 'none'; btn.style.transform = 'scale(1)'; };
            btn.onclick = () => {
                document.body.removeChild(modal);
                if (mode === 'endless') {
                    currentGameType = 'invaders-endless';
                    document.getElementById('highScoreDisplay').innerText = `High Score: ${getHighScore('invaders-endless')}`;
                    startInvadersGame('endless');
                } else if (mode === 'boss') {
                    currentGameType = 'invaders-boss';
                    document.getElementById('highScoreDisplay').innerText = `High Score: ${getHighScore('invaders-boss')}`;
                    startInvadersGame('boss');
                } else {
                    currentGameType = 'invaders';
                    document.getElementById('highScoreDisplay').innerText = `High Score: ${getHighScore('invaders')}`;
                    startInvadersGame('normal');
                }
            };
            return btn;
        };
        
        content.appendChild(title);
        content.appendChild(createBtn("Normal Mode", 'normal'));
        content.appendChild(createBtn("Endless Mode", 'endless'));
        content.appendChild(createBtn("Boss Battle", 'boss'));
        
        const backBtn = document.createElement('button');
        backBtn.innerText = "Cancel";
        backBtn.style.cssText = "margin-top: 1rem; background: transparent; border: none; color: #94a3b8; cursor: pointer; text-decoration: underline;";
        backBtn.onclick = () => {
            document.body.removeChild(modal);
            document.getElementById('backToLibrary').click();
        };
        content.appendChild(backBtn);

        modal.appendChild(content);
        document.body.appendChild(modal);
    } else if (gameType === 'snake') {
        startSnakeGame();
    } else if (gameType === 'pong') {
        startPongGame();
    } else if (gameType === 'breakout') {
        startBreakoutGame();
    } else if (gameType === 'flappy') {
        startFlappyGame();
    } else if (gameType === 'dodge') {
        startDodgeGame();
    } else if (gameType === 'clicker') {
        startClickerGame();
    } else if (gameType === 'memory') {
        startMemoryGame();
    } else if (gameType === 'typing') {
        startTypingGame();
    } else if (gameType === 'tetris') {
        startTetrisGame();
    } else if (gameType === 'doodle') {
        startDoodleGame();
    } else if (gameType === 'pacman') {
        startPacmanGame();
    } else if (gameType === 'platformer') {
        startPlatformerGame();
    } else if (gameType === 'simon') {
        startSimonGame();
    } else if (gameType === '2048') {
        start2048Game();
    } else if (gameType === 'sudoku') {
        startSudokuGame();
    } else if (gameType === 'minesweeper') {
        startMinesweeperGame();
    } else if (gameType === 'wordle') {
        startWordleGame();
    } else if (gameType === 'tictactoe') {
        startTicTacToeGame();
    } else if (gameType === 'math') {
        startMathGame();
    } else if (gameType === 'chess') {
        startChessGame();
    } else if (gameType === 'connect4') {
        startConnect4Game();
    } else if (gameType === 'stroop') {
        startStroopGame();
    } else if (gameType === 'crossy') {
        startChickenCrossyGame();
    } else if (gameType === 'paperio') {
        startPaperIoGame();
    } else {
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('Coming Soon!', canvas.width/2, canvas.height/2);
    }
}

document.getElementById('backToLibrary').onclick = () => {
    clearInterval(gameInterval); // Stop any running game
    document.onkeydown = null; // Reset controls
    document.onkeyup = null; // Reset keyup controls
    canvas.onclick = null; // Reset mouse controls
    canvas.oncontextmenu = null; // Reset context menu
    document.getElementById('activeGameContainer').classList.add('hidden');
    
    // Cleanup DOM-based games (Connect 4)
    const c4Container = document.getElementById('c4-container');
    if(c4Container) c4Container.remove();
    document.getElementById('gameCanvas').classList.remove('hidden');
    
    // Force hide ALL grids first to ensure clean state
    document.querySelectorAll('.game-grid').forEach(grid => grid.classList.add('hidden'));

    // Restore only the specific grid that was active before
    const gridToRestore = document.getElementById(activeGridId);
    if (gridToRestore) {
        gridToRestore.classList.remove('hidden');
    } else {
        // Fallback to retro grid if something goes wrong
        const retro = document.getElementById('retroGrid');
        if (retro) retro.classList.remove('hidden');
    }
    playMusic();
};

/* --- HIGH SCORE LOGIC --- */
function getHighScore(game) {
    if (!currentUser) return 0;
    const data = getArcadeData();
    return data.users[currentUser]?.scores?.[game] || 0;
}

function saveHighScore(score) {
    if (!currentUser) return false;
    const data = getArcadeData();
    const userScores = data.users[currentUser].scores || {};
    
    if (score > (userScores[currentGameType] || 0)) {
        userScores[currentGameType] = score;
        data.users[currentUser].scores = userScores;
        saveArcadeData(data);
        return true;
    }
    return false;
}

function endGame(score, win = false) {
    clearInterval(gameInterval);
    clearTimeout(gameInterval); // Ensure timeout loops are also stopped
    const isNewHigh = saveHighScore(score);
    const highScore = getHighScore(currentGameType);
    
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const msg = document.getElementById('gameOverMessage');
    
    // Generate animated text
    if (win) {
        title.innerHTML = "YOU WIN!".split('').map(char => {
            if (char === ' ') return '<span style="display:inline-block; width: 1rem;">&nbsp;</span>';
            const delay = Math.random() * 1;
            const duration = 2 + Math.random() * 1.5;
            return `<span class="game-over-char" style="animation: gameOverFloat ${duration}s ease-in-out ${delay}s infinite;">${char}</span>`;
        }).join('');
    } else {
        // Custom logic for GAME (White) OVER (Glitch)
        const gameText = "GAME".split('').map(char => {
            const delay = Math.random() * 1;
            const duration = 2 + Math.random() * 1.5;
            return `<span class="game-char" style="animation: gameOverFloat ${duration}s ease-in-out ${delay}s infinite;">${char}</span>`;
        }).join('');

        const overText = "OVER".split('').map(char => {
            const floatDelay = Math.random() * 1;
            const floatDuration = 2 + Math.random() * 1.5;
            const glitchDuration = 3 + Math.random() * 2; // Random duration for color switch
            return `<span class="over-char-wrapper" style="animation: gameOverFloat ${floatDuration}s ease-in-out ${floatDelay}s infinite;"><span class="over-char" style="animation-duration: ${glitchDuration}s;">${char}</span></span>`;
        }).join('');

        title.innerHTML = `${gameText}<span style="display:inline-block; width: 1rem;">&nbsp;</span>${overText}`;
    }

    msg.innerHTML = `Score: <span style="color:white">${score}</span><br>High Score: <span style="color:var(--accent)">${highScore}</span>`;
    
    if (isNewHigh) {
        msg.innerHTML += `<br><br><span style="color:#fbbf24">🏆 New High Score!</span>`;
    }
    
    modal.classList.add('show');
    
    document.getElementById('retryBtn').onclick = () => {
        modal.classList.remove('show');
        loadGame(currentGameType);
    };
    
    document.getElementById('exitBtn').onclick = () => {
        modal.classList.remove('show');
        document.getElementById('backToLibrary').click();
    };
}

function startSnakeGame() {
    const gridSize = 20;
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);
    
    let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    let obstacles = [];
    
    const getNewFood = () => {
        let valid = false;
        let newFood = {};
        while (!valid) {
            newFood = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY) };
            valid = true;
            for (let part of snake) {
                if (part.x === newFood.x && part.y === newFood.y) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                for (let obs of obstacles) {
                    if (obs.x === newFood.x && obs.y === newFood.y) {
                        valid = false;
                        break;
                    }
                }
            }
        }
        const r = Math.random();
        if (r < 0.1) newFood.type = 'golden';
        else if (r < 0.3) newFood.type = 'bonus';
        else newFood.type = 'normal';
        return newFood;
    };

    let food = getNewFood();
    let dx = 1;
    let dy = 0;
    let nextDx = 1; // Input buffer to prevent self-collision on quick turns
    let nextDy = 0;
    let score = 0;
    let level = 1;
    let speed = 100;
    let gameRunning = true;

    document.getElementById('gameScore').innerText = `Score: ${score} | Level: ${level}`;

    // Input Handling with Buffer
    document.onkeydown = function(event) {
        switch(event.keyCode) {
            case 37: event.preventDefault(); if(dx !== 1) { nextDx = -1; nextDy = 0; } break; // Left
            case 38: event.preventDefault(); if(dy !== 1) { nextDx = 0; nextDy = -1; } break; // Up
            case 39: event.preventDefault(); if(dx !== -1) { nextDx = 1; nextDy = 0; } break; // Right
            case 40: event.preventDefault(); if(dy !== -1) { nextDx = 0; nextDy = 1; } break; // Down
        }
    };

    // Sound Helper
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'eat') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'die') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    };

    const addObstacles = (count) => {
        for(let i=0; i<count; i++) {
            let valid = false;
            let obs = {};
            let attempts = 0;
            while(!valid && attempts < 100) {
                obs = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY) };
                valid = true;
                for (let part of snake) {
                    if (part.x === obs.x && part.y === obs.y) valid = false;
                }
                if (obs.x === food.x && obs.y === food.y) valid = false;
                for (let o of obstacles) {
                    if (o.x === obs.x && o.y === obs.y) valid = false;
                }
                if (Math.abs(obs.x - snake[0].x) < 4 && Math.abs(obs.y - snake[0].y) < 4) valid = false;
                attempts++;
            }
            if(valid) obstacles.push(obs);
        }
    };

    function gameLoop() {
        if (!gameRunning) return;

        // Apply buffered input
        dx = nextDx;
        dy = nextDy;

        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        // Check Wall Collision
        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            playSound('die');
            endGame(score);
            gameRunning = false;
            return;
        }
        // Check Obstacle Collision
        for (let obs of obstacles) {
            if (head.x === obs.x && head.y === obs.y) {
                playSound('die');
                endGame(score);
                gameRunning = false;
                return;
            }
        }
        // Check Self Collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                playSound('die');
                endGame(score);
                gameRunning = false;
                return;
            }
        }

        snake.unshift(head);

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
            let pColor = '#f87171';
            if (food.type === 'golden') {
                score += 50;
                pColor = '#fbbf24';
            } else if (food.type === 'bonus') {
                score += 5;
                pColor = '#38bdf8';
            } else {
                score += 10;
            }

            // Level Logic
            const newLevel = Math.floor(score / 50) + 1;
            if (newLevel > level) {
                level = newLevel;
                addObstacles(2);
            }

            // Increase speed: start at 100ms, cap at 40ms
            speed = Math.max(40, 100 - (level - 1) * 5);
            
            document.getElementById('gameScore').innerText = `Score: ${score} | Level: ${level}`;
            playSound('eat');
            createParticles(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, pColor);
            
            food = getNewFood();
        } else {
            snake.pop();
        }

        // Draw
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<=tileCountX; i++) { ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height); }
        for(let i=0; i<=tileCountY; i++) { ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); }
        ctx.stroke();

        // Draw Obstacles
        ctx.fillStyle = '#475569';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x * gridSize + 4, obs.y * gridSize + 4);
            ctx.lineTo(obs.x * gridSize + gridSize - 4, obs.y * gridSize + gridSize - 4);
            ctx.moveTo(obs.x * gridSize + gridSize - 4, obs.y * gridSize + 4);
            ctx.lineTo(obs.x * gridSize + 4, obs.y * gridSize + gridSize - 4);
            ctx.stroke();
        });
        
        // Draw Food (Neon Pulse)
        const pulse = Math.sin(Date.now() / 100) * 3;
        ctx.shadowBlur = 15 + pulse; 
        
        let foodColor = '#f87171';
        if (food.type === 'golden') foodColor = '#fbbf24';
        if (food.type === 'bonus') foodColor = '#38bdf8';

        ctx.shadowColor = foodColor;
        ctx.fillStyle = foodColor;
        ctx.beginPath(); 
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, (gridSize/2) - 4, 0, Math.PI*2); 
        ctx.fill();
        
        if (food.type === 'bonus') {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+5', food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2 + 1);
        }
        ctx.shadowBlur = 0;
        
        // Draw Snake
        snake.forEach((part, index) => {
            const isHead = index === 0;
            ctx.shadowBlur = isHead ? 20 : 10;
            ctx.shadowColor = isHead ? "#00f3ff" : "#38bdf8";
            ctx.fillStyle = isHead ? '#e0f2fe' : '#38bdf8';
            
            const x = part.x * gridSize;
            const y = part.y * gridSize;
            
            // Draw segment
            ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);

            if (isHead) {
                ctx.fillStyle = '#000';
                let ex1, ey1, ex2, ey2;
                // Eyes positioning based on direction
                if (dx === 1) { ex1=x+14; ey1=y+5; ex2=x+14; ey2=y+13; }
                else if (dx === -1) { ex1=x+4; ey1=y+5; ex2=x+4; ey2=y+13; }
                else if (dy === -1) { ex1=x+5; ey1=y+4; ex2=x+13; ey2=y+4; }
                else { ex1=x+5; ey1=y+14; ex2=x+13; ey2=y+14; }
                
                ctx.fillRect(ex1, ey1, 3, 3);
                ctx.fillRect(ex2, ey2, 3, 3);
            }
        });
        ctx.shadowBlur = 0;

        drawParticles();

        gameInterval = setTimeout(gameLoop, speed);
    }

    gameLoop();
}

function startConnect4Game() {
    const canvas = document.getElementById('gameCanvas');
    canvas.classList.add('hidden');
    
    // Create container if not exists
    let c4Container = document.getElementById('c4-container');
    if (!c4Container) {
        c4Container = document.createElement('div');
        c4Container.id = 'c4-container';
        c4Container.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 20px;";
        canvas.parentNode.appendChild(c4Container);
    }
    
    const rows = 6;
    const cols = 7;
    let board = Array(rows).fill().map(() => Array(cols).fill(0));
    let currentPlayer = 1; // 1 = Red (Player), 2 = Yellow (AI)
    let gameOver = false;
    let isAnimating = false;
    
    document.getElementById('gameScore').innerText = "Turn: Red";

    function renderBoard() {
        let html = `<div id="c4-game-board" style="position: relative;">`;
        html += `<div class="c4-board-overlay"></div>`;
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                let classNames = 'c4-slot';
                if(board[r][c] === 1) classNames += ' p1';
                if(board[r][c] === 2) classNames += ' p2';
                html += `<div class="${classNames}" data-col="${c}"></div>`;
            }
        }
        html += `</div>`;
        c4Container.innerHTML = html;
        
        const slots = c4Container.querySelectorAll('.c4-slot');
        slots.forEach(slot => {
            slot.onclick = () => {
                if(gameOver || currentPlayer !== 1 || isAnimating) return;
                const col = parseInt(slot.dataset.col);
                dropPiece(col);
            };
        });
    }

    function dropPiece(col) {
        if (isAnimating || gameOver) return;

        let r = -1;
        for(let i=rows-1; i>=0; i--) {
            if(board[i][col] === 0) {
                r = i;
                break;
            }
        }
        if (r === -1) return;

        isAnimating = true;

        const boardEl = document.getElementById('c4-game-board');
        const piece = document.createElement('div');
        piece.className = `c4-slot ${currentPlayer === 1 ? 'p1' : 'p2'}`;
        piece.style.position = 'absolute';
        piece.style.left = `${10 + col * 68}px`;
        piece.style.top = '-70px';
        piece.style.transition = 'top 0.5s cubic-bezier(0.5, 0, 0.5, 1)';
        piece.style.zIndex = '5';
        boardEl.appendChild(piece);

        // Force reflow
        piece.offsetHeight;

        piece.style.top = `${10 + r * 68}px`;

        setTimeout(() => {
            if(piece.parentNode) piece.remove();
            board[r][col] = currentPlayer;
            renderBoard();
            
            if(checkWin(r, col)) {
                gameOver = true;
                document.getElementById('gameScore').innerText = `${currentPlayer === 1 ? 'Red' : 'Yellow'} Wins!`;
                setTimeout(() => endGame(currentPlayer === 1 ? 100 : 0, currentPlayer === 1), 1000);
            } else if(board.every(row => row.every(cell => cell !== 0))) {
                gameOver = true;
                document.getElementById('gameScore').innerText = "Draw!";
                setTimeout(() => endGame(50, true), 1000);
            } else {
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                document.getElementById('gameScore').innerText = `Turn: ${currentPlayer === 1 ? 'Red' : 'Yellow'}`;
                isAnimating = false;
                if(currentPlayer === 2) setTimeout(aiMove, 200);
            }
        }, 500);
    }
    
    function aiMove() {
        if(gameOver) return;
        
        const getRow = (c) => {
            for(let r=rows-1; r>=0; r--) if(board[r][c] === 0) return r;
            return -1;
        };

        // 1. Try to Win
        for(let c=0; c<cols; c++) {
            let r = getRow(c);
            if(r !== -1) {
                board[r][c] = 2;
                if(checkWin(r, c)) { board[r][c] = 0; dropPiece(c); return; }
                board[r][c] = 0;
            }
        }

        // 2. Block Player Win
        for(let c=0; c<cols; c++) {
            let r = getRow(c);
            if(r !== -1) {
                board[r][c] = 1;
                if(checkWin(r, c)) { board[r][c] = 0; dropPiece(c); return; }
                board[r][c] = 0;
            }
        }

        // 3. Choose best non-losing move
        let validCols = [];
        for(let c=0; c<cols; c++) {
            let r = getRow(c);
            if(r !== -1) {
                // Lookahead: Don't play if it lets player win immediately above
                let safe = true;
                if(r > 0) {
                    board[r][c] = 2; // Assume AI plays here
                    board[r-1][c] = 1; // Check if Player wins on top
                    if(checkWin(r-1, c)) safe = false;
                    board[r-1][c] = 0;
                    board[r][c] = 0;
                }
                if(safe) validCols.push(c);
            }
        }

        // If no safe moves, forced to play unsafe
        if(validCols.length === 0) {
             for(let c=0; c<cols; c++) if(board[0][c] === 0) validCols.push(c);
        }

        if(validCols.length > 0) {
            // Priority: Center > Near Center > Random
            const priority = [3, 2, 4, 1, 5, 0, 6];
            for(let p of priority) {
                if(validCols.includes(p)) { dropPiece(p); return; }
            }
        }
    }

    function checkWin(r, c) {
        const player = board[r][c];
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for(let [dr, dc] of directions) {
            let count = 1;
            for(let i=1; i<4; i++) { let nr=r+dr*i, nc=c+dc*i; if(nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc]===player) count++; else break; }
            for(let i=1; i<4; i++) { let nr=r-dr*i, nc=c-dc*i; if(nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc]===player) count++; else break; }
            if(count >= 4) return true;
        }
        return false;
    }

    renderBoard();
}

function startStroopGame() {
    let score = 0;
    let timeLeft = 30;
    let currentWord = "";
    let currentColor = ""; // Object {name, hex}
    let options = []; // Array of color names
    
    const colors = [
        { name: "RED", hex: "#ef4444" },
        { name: "BLUE", hex: "#3b82f6" },
        { name: "GREEN", hex: "#22c55e" },
        { name: "YELLOW", hex: "#eab308" },
        { name: "PURPLE", hex: "#a855f7" },
        { name: "ORANGE", hex: "#f97316" }
    ];

    document.getElementById('gameScore').innerText = `Score: 0 | Time: 30`;

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'correct') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(1200, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now+0.3);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
            osc.start(now); osc.stop(now+0.3);
        }
    };

    function nextRound() {
        const wordIdx = Math.floor(Math.random() * colors.length);
        currentWord = colors[wordIdx].name;
        
        let colorIdx = Math.floor(Math.random() * colors.length);
        // 30% chance to match, 70% chance to mismatch
        if (Math.random() > 0.3 && colorIdx === wordIdx) {
            colorIdx = (colorIdx + 1) % colors.length;
        }
        currentColor = colors[colorIdx];

        let pool = colors.map(c => c.name).filter(n => n !== currentColor.name);
        pool.sort(() => Math.random() - 0.5);
        
        options = [currentColor.name, pool[0], pool[1], pool[2]];
        options.sort(() => Math.random() - 0.5);
    }

    nextRound();

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const btnW = 250; const btnH = 80; const gap = 20;
        const startX = (canvas.width - (btnW * 2 + gap)) / 2;
        const startY = canvas.height - 200;

        for(let i=0; i<4; i++) {
            let r = Math.floor(i / 2);
            let c = i % 2;
            let bx = startX + c * (btnW + gap);
            let by = startY + r * (btnH + gap);

            if(x > bx && x < bx + btnW && y > by && y < by + btnH) {
                if(options[i] === currentColor.name) {
                    score += 10; timeLeft += 1; playSound('correct');
                    createParticles(bx + btnW/2, by + btnH/2, '#22c55e');
                    nextRound();
                } else {
                    score = Math.max(0, score - 5); timeLeft -= 2; playSound('wrong');
                    createParticles(bx + btnW/2, by + btnH/2, '#ef4444');
                }
                document.getElementById('gameScore').innerText = `Score: ${score} | Time: ${Math.ceil(timeLeft)}`;
            }
        }
    };

    gameInterval = setInterval(() => {
        timeLeft -= 0.05;
        if(timeLeft <= 0) { endGame(score); return; }

        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, canvas.width, 10);
        ctx.fillStyle = timeLeft > 10 ? '#38bdf8' : '#ef4444'; ctx.fillRect(0, 0, Math.min(canvas.width, canvas.width * (timeLeft / 30)), 10);

        ctx.fillStyle = currentColor.hex; ctx.font = 'bold 80px "Orbitron"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 20; ctx.shadowColor = currentColor.hex; ctx.fillText(currentWord, canvas.width/2, canvas.height/2 - 120); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial'; ctx.fillText("What color is the text?", canvas.width/2, canvas.height/2 - 40);

        const btnW = 250; const btnH = 80; const gap = 20; const startX = (canvas.width - (btnW * 2 + gap)) / 2; const startY = canvas.height - 200;
        for(let i=0; i<4; i++) {
            let r = Math.floor(i / 2); let c = i % 2; let bx = startX + c * (btnW + gap); let by = startY + r * (btnH + gap);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(bx, by, btnW, btnH); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, btnW, btnH);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 30px "Orbitron"'; ctx.fillText(options[i], bx + btnW/2, by + btnH/2);
        }
        document.getElementById('gameScore').innerText = `Score: ${score} | Time: ${Math.ceil(timeLeft)}`;
        drawParticles();
    }, 50);
}

function startChickenCrossyGame() {
    // Configuration
    const TILE_SIZE = 40;
    const VIEW_ANGLE = 0.6; // For pseudo-3D projection
    
    // Game State
    let score = 0;
    let gameOver = false;
    let lanes = [];
    let particles = [];
    
    // Player
    let player = {
        gx: 0, // Grid X
        gy: 0, // Grid Y (Lane index)
        x: 0, y: 0, // Visual coordinates
        z: 0, // Jump height
        targetGx: 0,
        targetGy: 0,
        state: 'idle', // idle, jumping, dead
        jumpProgress: 0,
        facing: 'up' // up, down, left, right
    };

    // Camera
    let cameraY = 0;

    document.getElementById('gameScore').innerText = `Score: 0`;

    // Helper: 3D Box Drawing
    function drawCube(ctx, x, y, z, w, h, d, color, faceColor) {
        // Projection: x, y are screen coords for bottom-center of object
        // z is height off ground
        
        const topFaceH = d * VIEW_ANGLE;
        const bottomY = y - z;
        
        // Colors
        const baseColor = color;
        const sideColor = faceColor || adjustColor(color, -20);
        const topColor = faceColor || adjustColor(color, 20);

        // Front Face
        ctx.fillStyle = sideColor;
        ctx.fillRect(x - w/2, bottomY - h, w, h);
        
        // Top Face
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(x - w/2, bottomY - h);
        ctx.lineTo(x + w/2, bottomY - h);
        ctx.lineTo(x + w/2, bottomY - h - topFaceH);
        ctx.lineTo(x - w/2, bottomY - h - topFaceH);
        ctx.closePath();
        ctx.fill();

        // Right Face (Fake 3D extrusion)
        // For this simple projection, we just do Front + Top to look like "Zelda" perspective
        // But to make it look "Modern 3D", let's add a side if we are offset?
        // Let's stick to a clean "Cabinet" style where we see Front and Top.
    }

    function adjustColor(color, amount) {
        return color; // Simplified for now, can implement HSL shift if needed
    }

    // Lane Generation
    function createLane(index) {
        const types = ['grass', 'road', 'water', 'rail'];
        let type = 'grass';
        if (index > 3) {
            const r = Math.random();
            if (r < 0.4) type = 'road';
            else if (r < 0.7) type = 'water';
            else if (r < 0.8) type = 'rail';
        }

        let lane = {
            index: index,
            type: type,
            y: index * TILE_SIZE,
            entities: [],
            speed: (Math.random() * 2 + 2) * (Math.random() < 0.5 ? 1 : -1),
            timer: 0
        };

        // Static obstacles for grass
        if (type === 'grass') {
            for (let i = -5; i < 6; i++) {
                if (Math.random() < 0.2 && (index !== 0 || i !== 0)) {
                    lane.entities.push({ type: 'tree', gx: i, x: i * TILE_SIZE });
                }
            }
        }

        return lane;
    }

    // Init
    for (let i = 0; i < 20; i++) lanes.push(createLane(i));

    // Input
    document.onkeydown = (e) => {
        if (gameOver || player.state === 'jumping') return;
        
        let moved = false;
        if (e.key === 'ArrowUp') { player.targetGy++; player.facing = 'up'; moved = true; }
        else if (e.key === 'ArrowDown') { player.targetGy--; player.facing = 'down'; moved = true; }
        else if (e.key === 'ArrowLeft') { player.targetGx--; player.facing = 'left'; moved = true; }
        else if (e.key === 'ArrowRight') { player.targetGx++; player.facing = 'right'; moved = true; }

        if (moved) {
            // Check static collision (Trees)
            let targetLane = lanes.find(l => l.index === player.targetGy);
            if (targetLane && targetLane.type === 'grass') {
                let obs = targetLane.entities.find(e => Math.round(e.gx) === player.targetGx);
                if (obs) {
                    player.targetGx = player.gx;
                    player.targetGy = player.gy;
                    return; // Blocked
                }
            }
            
            player.state = 'jumping';
            player.jumpProgress = 0;
            score = Math.max(score, player.targetGy);
            document.getElementById('gameScore').innerText = `Score: ${score}`;
        }
    };

    gameInterval = setInterval(() => {
        // Update Logic
        if (!gameOver) {
            // Player Jump Physics
            if (player.state === 'jumping') {
                player.jumpProgress += 0.15;
                if (player.jumpProgress >= 1) {
                    player.state = 'idle';
                    player.gx = player.targetGx;
                    player.gy = player.targetGy;
                    player.z = 0;
                    
                    // Check landing
                    let lane = lanes.find(l => l.index === player.gy);
                    if (lane && lane.type === 'water') {
                        // Check for log
                        let onLog = false;
                        lane.entities.forEach(e => {
                            if (player.x > e.x - e.w/2 && player.x < e.x + e.w/2) onLog = true;
                        });
                        if (!onLog) {
                            gameOver = true;
                            setTimeout(() => endGame(score), 1000);
                        }
                    }
                } else {
                    // Interpolate
                    player.x = (player.gx * (1-player.jumpProgress) + player.targetGx * player.jumpProgress) * TILE_SIZE;
                    // Y needs to account for camera, but here we track world Y
                    // player.y is calculated in render relative to camera
                    player.z = Math.sin(player.jumpProgress * Math.PI) * 20;
                }
            } else {
                player.x = player.gx * TILE_SIZE;
                
                // Move with logs
                let lane = lanes.find(l => l.index === player.gy);
                if (lane && (lane.type === 'water' || lane.type === 'log')) {
                    let onLog = false;
                    lane.entities.forEach(e => {
                        if (player.x > e.x - e.w/2 && player.x < e.x + e.w/2) {
                            onLog = true;
                            player.x += lane.speed;
                            player.gx = player.x / TILE_SIZE;
                            player.targetGx = player.gx;
                        }
                    });
                    if (!onLog && lane.type === 'water') { gameOver = true; setTimeout(() => endGame(score), 1000); }
                }
            }

            // Camera Follow
            let targetCamY = player.gy * TILE_SIZE;
            cameraY += (targetCamY - cameraY) * 0.1;

            // Lane Management
            if (lanes[lanes.length-1].index < player.gy + 15) {
                lanes.push(createLane(lanes[lanes.length-1].index + 1));
            }
            if (lanes[0].index < player.gy - 5) lanes.shift();

            // Spawners
            lanes.forEach(l => {
                if (l.type === 'road' || l.type === 'water') {
                    l.entities.forEach(e => e.x += l.speed);
                    // Spawn
                    if (Math.random() < 0.02 && l.entities.length < 3) {
                        let w = l.type === 'water' ? 60 : 40;
                        let startX = l.speed > 0 ? -400 : 400;
                        // Check overlap
                        let clear = true;
                        l.entities.forEach(e => { if(Math.abs(e.x - startX) < 100) clear = false; });
                        if(clear) {
                            let type = l.type === 'water' ? 'log' : 'car';
                            let entity = { x: startX, w: w, type: type };
                            if (type === 'car') {
                                const colors = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#14b8a6', '#f43f5e'];
                                entity.color = colors[Math.floor(Math.random() * colors.length)];
                            }
                            l.entities.push(entity);
                        }
                    }
                    // Cleanup
                    l.entities = l.entities.filter(e => e.x > -500 && e.x < 500);

                    // Collision (Cars)
                    if (l.type === 'road' && l.index === player.gy && Math.abs(player.z) < 5) {
                        l.entities.forEach(e => {
                            if (Math.abs(player.x - e.x) < 30) {
                                gameOver = true;
                                setTimeout(() => endGame(score), 1000);
                            }
                        });
                    }
                }
            });
        }

        // Render
        ctx.fillStyle = '#87ceeb'; // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + 100; // Offset to show more ahead

        lanes.forEach(l => {
            // Screen Y calculation
            // World Y increases upwards. Screen Y decreases.
            // We want player at center.
            // dy = (l.y - cameraY)
            // screenY = cy - dy
            
            let sy = cy - (l.y - cameraY);
            
            // Draw Lane Base
            if (l.type === 'grass') ctx.fillStyle = '#86efac';
            else if (l.type === 'road') ctx.fillStyle = '#475569';
            else if (l.type === 'water') {
                // Animate water color
                const time = Date.now() * 0.002;
                const cVal = Math.floor(200 + Math.sin(time + l.index * 0.5) * 30);
                ctx.fillStyle = `rgb(56, 189, ${cVal})`;
            }
            else if (l.type === 'rail') ctx.fillStyle = '#78350f';
            
            // Draw a wide strip
            // Pseudo-3D: Top face is visible
            let depth = TILE_SIZE * VIEW_ANGLE;
            ctx.fillRect(0, sy, canvas.width, TILE_SIZE);
            
            // Water Waves
            if (l.type === 'water') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                const waveOffset = (Date.now() / 20) % 40;
                for(let wx = -40; wx < canvas.width; wx += 40) {
                    ctx.fillRect(wx + waveOffset, sy + 5, 20, 2);
                    ctx.fillRect(wx - waveOffset + 20, sy + 25, 10, 2);
                }
            }

            ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Side shadow
            ctx.fillRect(0, sy + TILE_SIZE, canvas.width, depth);

            // Draw Entities
            l.entities.forEach(e => {
                let sx = cx + e.x; // Center relative
                if (e.type === 'tree') drawCube(ctx, sx, sy + TILE_SIZE, 0, 30, 40, 30, '#166534', '#22c55e');
                else if (e.type === 'car') {
                    // Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(sx - 20, sy + TILE_SIZE - 2, 40, 10);

                    // Chassis
                    drawCube(ctx, sx, sy + TILE_SIZE, 0, 40, 12, 30, e.color, e.color); 
                    // Cabin
                    drawCube(ctx, sx, sy + TILE_SIZE, 12, 24, 8, 20, '#94a3b8', '#cbd5e1');
                    // Wheels
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(sx - 16, sy + TILE_SIZE - 2, 8, 6);
                    ctx.fillRect(sx + 8, sy + TILE_SIZE - 2, 8, 6);
                    
                    // Lights
                    const isRight = l.speed > 0;
                    ctx.fillStyle = '#facc15'; // Headlights
                    ctx.fillRect(sx + (isRight ? 18 : -20), sy + TILE_SIZE - 8, 2, 4);
                    ctx.fillStyle = '#ef4444'; // Taillights
                    ctx.fillRect(sx + (isRight ? -20 : 18), sy + TILE_SIZE - 8, 2, 4);
                }
                else if (e.type === 'log') {
                    drawCube(ctx, sx, sy + TILE_SIZE, -5, e.w, 10, 30, '#78350f', '#92400e');
                    // Log details (bark texture)
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(sx - e.w/2 + 10, sy + TILE_SIZE - 15, e.w - 20, 2);
                    ctx.fillRect(sx - e.w/2 + 5, sy + TILE_SIZE - 10, e.w - 10, 2);
                }
            });

            // Draw Player if on this lane
            if (Math.round(player.gy) === l.index || (player.state === 'jumping' && Math.round(player.targetGy) === l.index)) {
                // Interpolate Y for jumping visual
                let py = player.state === 'jumping' ? 
                    (player.gy * (1-player.jumpProgress) + player.targetGy * player.jumpProgress) * TILE_SIZE : 
                    player.gy * TILE_SIZE;
                
                let psy = cy - (py - cameraY) + TILE_SIZE;
                let psx = cx + player.x;
                
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(psx - 15, psy - 10, 30, 10);

                drawCube(ctx, psx, psy, player.z, 20, 20, 20, '#fff', '#f1f5f9'); // Body
                // Beak/Comb details could be added here with small rects
                ctx.fillStyle = '#ef4444'; ctx.fillRect(psx - 2, psy - player.z - 25, 4, 5); // Comb
                ctx.fillStyle = '#f97316'; 
                if(player.facing === 'right') ctx.fillRect(psx + 10, psy - player.z - 15, 5, 5);
                else if(player.facing === 'left') ctx.fillRect(psx - 15, psy - player.z - 15, 5, 5);
                else ctx.fillRect(psx - 2, psy - player.z - 15, 4, 5);
            }
        });

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '40px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText("SPLAT!", canvas.width/2, canvas.height/2);
        }
    }, 30);
}

function startChessGame() {
    const boardSize = 400;
    const tileSize = boardSize / 8;
    const offsetX = (canvas.width - boardSize) / 2;
    const offsetY = (canvas.height - boardSize) / 2;
    
    // Simple Unicode Chess Pieces
    const pieces = {
        r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
        R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
    };
    
    let board = [
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
    ];
    
    let selected = null; // {r, c}
    let turn = 'white'; // white (uppercase) goes first
    
    document.getElementById('gameScore').innerText = "Turn: White";

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        if (x >= offsetX && x < offsetX + boardSize && y >= offsetY && y < offsetY + boardSize) {
            const c = Math.floor((x - offsetX) / tileSize);
            const r = Math.floor((y - offsetY) / tileSize);
            
            if (selected) {
                if (selected.r === r && selected.c === c) {
                    selected = null;
                } else {
                    const piece = board[selected.r][selected.c];
                    const target = board[r][c];
                    const isWhite = piece === piece.toUpperCase();
                    const isTargetWhite = target !== '' && target === target.toUpperCase();
                    
                    if (target === '' || (isWhite !== isTargetWhite)) {
                        board[r][c] = piece;
                        board[selected.r][selected.c] = '';
                        selected = null;
                        turn = turn === 'white' ? 'black' : 'white';
                        document.getElementById('gameScore').innerText = `Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
                    } else if (isWhite === isTargetWhite) {
                        selected = {r, c};
                    }
                }
            } else {
                const piece = board[r][c];
                if (piece !== '') {
                    const isWhite = piece === piece.toUpperCase();
                    if ((turn === 'white' && isWhite) || (turn === 'black' && !isWhite)) selected = {r, c};
                }
            }
        }
    };

    gameInterval = setInterval(() => {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                const isDark = (r + c) % 2 === 1;
                ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
                if (selected && selected.r === r && selected.c === c) ctx.fillStyle = '#38bdf8';
                ctx.fillRect(offsetX + c*tileSize, offsetY + r*tileSize, tileSize, tileSize);
                const piece = board[r][c];
                if (piece) {
                    ctx.fillStyle = (piece === piece.toUpperCase()) ? '#fff' : '#000';
                    ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(pieces[piece] || piece, offsetX + c*tileSize + tileSize/2, offsetY + r*tileSize + tileSize/2);
                }
            }
        }
    }, 50);
}

function startMathGame() {
    let score = 0;
    let timeLeft = 20;
    let difficulty = 1;
    let question = "";
    let correctAnswer = 0;
    let options = [];
    
    document.getElementById('gameScore').innerText = `Score: 0 | Time: 20`;

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'correct') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(1200, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now+0.3);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
            osc.start(now); osc.stop(now+0.3);
        }
    };

    function generateQuestion() {
        const ops = ['+', '-', '*'];
        const maxNum = difficulty < 4 ? 9 : 20; 
        
        let n1 = Math.floor(Math.random() * maxNum) + 1;
        let n2 = Math.floor(Math.random() * maxNum) + 1;
        let op1 = ops[Math.floor(Math.random() * ops.length)];
        
        if (difficulty > 5 && Math.random() < 0.5) {
            let n3 = Math.floor(Math.random() * maxNum) + 1;
            let op2 = ops[Math.floor(Math.random() * ops.length)];
            question = `${n1} ${op1} ${n2} ${op2} ${n3}`;
        } else {
            question = `${n1} ${op1} ${n2}`;
        }
        
        try {
            // eslint-disable-next-line no-eval
            correctAnswer = eval(question);
        } catch(e) { correctAnswer = 0; }

        options = [correctAnswer];
        while(options.length < 3) {
            let offset = Math.floor(Math.random() * 10) + 1;
            let fake = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
            if(!options.includes(fake)) options.push(fake);
        }
        options.sort(() => Math.random() - 0.5);
    }

    generateQuestion();

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const btnW = 200; const btnH = 80; const gap = 30;
        const totalW = (btnW * 3) + (gap * 2);
        const startX = (canvas.width - totalW) / 2;
        const btnY = canvas.height - 180;

        for(let i=0; i<3; i++) {
            let bx = startX + i * (btnW + gap);
            if(x > bx && x < bx + btnW && y > btnY && y < btnY + btnH) {
                if(options[i] === correctAnswer) {
                    score += 10; timeLeft += 5; difficulty++;
                    playSound('correct');
                    createParticles(bx + btnW/2, btnY + btnH/2, '#22c55e');
                    generateQuestion();
                } else {
                    score = Math.max(0, score - 5); timeLeft = Math.max(0, timeLeft - 2);
                    playSound('wrong');
                    createParticles(bx + btnW/2, btnY + btnH/2, '#ef4444');
                }
                document.getElementById('gameScore').innerText = `Score: ${score} | Time: ${Math.ceil(timeLeft)}`;
            }
        }
    };

    gameInterval = setInterval(() => {
        timeLeft -= 0.05;
        if(timeLeft <= 0) { endGame(score); return; }
        
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, canvas.width, 10);
        ctx.fillStyle = timeLeft > 5 ? '#38bdf8' : '#ef4444'; 
        ctx.fillRect(0, 0, Math.min(canvas.width, canvas.width * (timeLeft / 30)), 10);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 80px "Orbitron"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(question, canvas.width/2, canvas.height/2 - 80);

        const btnW = 200; const btnH = 80; const gap = 30;
        const totalW = (btnW * 3) + (gap * 2);
        const startX = (canvas.width - totalW) / 2;
        const btnY = canvas.height - 180;

        for(let i=0; i<3; i++) {
            let bx = startX + i * (btnW + gap);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(bx, btnY, btnW, btnH);
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.strokeRect(bx, btnY, btnW, btnH);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 40px "Orbitron"'; ctx.fillText(options[i], bx + btnW/2, btnY + btnH/2);
        }
        document.getElementById('gameScore').innerText = `Score: ${score} | Time: ${Math.ceil(timeLeft)}`;
        drawParticles();
    }, 50);
}

function startTicTacToeGame() {
    const size = 3;
    const cellSize = 100;
    const boardSize = size * cellSize;
    const offsetX = (canvas.width - boardSize) / 2;
    const offsetY = (canvas.height - boardSize) / 2;
    
    let board = Array(9).fill(null);
    let turn = 'X'; // Player is X
    let gameOver = false;
    let winningLine = null;

    document.getElementById('gameScore').innerText = "Turn: Player (X)";

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'move') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'win') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now+0.3);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
            osc.start(now); osc.stop(now+0.3);
        }
    };

    function checkWin(b) {
        const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
        for(let line of lines) {
            const [a,b,c] = line;
            if(b[a] && b[a] === b[b] && b[a] === b[c]) return { winner: b[a], line };
        }
        if(!b.includes(null)) return { winner: 'Draw', line: null };
        return null;
    }

    function aiMove() {
        if(gameOver) return;
        let available = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if(available.length === 0) return;

        // 1. Try to win, 2. Block player, 3. Center, 4. Random
        let move = -1;
        for(let m of available) { let t = [...board]; t[m] = 'O'; if(checkWin(t)?.winner === 'O') { move = m; break; } }
        if(move === -1) for(let m of available) { let t = [...board]; t[m] = 'X'; if(checkWin(t)?.winner === 'X') { move = m; break; } }
        if(move === -1 && board[4] === null) move = 4;
        if(move === -1) move = available[Math.floor(Math.random() * available.length)];

        makeMove(move, 'O');
    }

    function makeMove(idx, player) {
        board[idx] = player;
        playSound('move');
        let r = Math.floor(idx / 3), c = idx % 3;
        createParticles(offsetX + c * cellSize + cellSize/2, offsetY + r * cellSize + cellSize/2, player === 'X' ? '#38bdf8' : '#ef4444');

        let result = checkWin(board);
        if(result) {
            gameOver = true;
            winningLine = result.line;
            if(result.winner === 'Draw') {
                document.getElementById('gameScore').innerText = "Draw!";
                setTimeout(() => endGame(50, true), 1000);
            } else {
                document.getElementById('gameScore').innerText = `${result.winner} Wins!`;
                playSound('win');
                setTimeout(() => endGame(result.winner === 'X' ? 100 : 0, result.winner === 'X'), 1000);
            }
        } else {
            turn = turn === 'X' ? 'O' : 'X';
            document.getElementById('gameScore').innerText = `Turn: ${turn === 'X' ? 'Player' : 'AI'}`;
            if(turn === 'O') setTimeout(aiMove, 500);
        }
    }

    canvas.onclick = (e) => {
        if(gameOver || turn !== 'X') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if(x > offsetX && x < offsetX + boardSize && y > offsetY && y < offsetY + boardSize) {
            let c = Math.floor((x - offsetX) / cellSize);
            let r = Math.floor((y - offsetY) / cellSize);
            let idx = r * 3 + c;
            if(board[idx] === null) makeMove(idx, 'X');
        }
    };

    gameInterval = setInterval(() => {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(offsetX + cellSize, offsetY); ctx.lineTo(offsetX + cellSize, offsetY + boardSize);
        ctx.moveTo(offsetX + cellSize*2, offsetY); ctx.lineTo(offsetX + cellSize*2, offsetY + boardSize);
        ctx.moveTo(offsetX, offsetY + cellSize); ctx.lineTo(offsetX + boardSize, offsetY + cellSize);
        ctx.moveTo(offsetX, offsetY + cellSize*2); ctx.lineTo(offsetX + boardSize, offsetY + cellSize*2);
        ctx.stroke();

        for(let i=0; i<9; i++) {
            if(!board[i]) continue;
            let cx = offsetX + (i%3)*cellSize + cellSize/2, cy = offsetY + Math.floor(i/3)*cellSize + cellSize/2, size = cellSize/3;
            ctx.strokeStyle = board[i] === 'X' ? '#38bdf8' : '#ef4444'; ctx.lineWidth = 8; ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); if(board[i] === 'X') { ctx.moveTo(cx-size, cy-size); ctx.lineTo(cx+size, cy+size); ctx.moveTo(cx+size, cy-size); ctx.lineTo(cx-size, cy+size); } else { ctx.arc(cx, cy, size, 0, Math.PI*2); } ctx.stroke(); ctx.shadowBlur = 0;
        }
        if(winningLine) {
            let start = winningLine[0], end = winningLine[2];
            let x1 = offsetX + (start%3)*cellSize + cellSize/2, y1 = offsetY + Math.floor(start/3)*cellSize + cellSize/2;
            let x2 = offsetX + (end%3)*cellSize + cellSize/2, y2 = offsetY + Math.floor(end/3)*cellSize + cellSize/2;
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 10; ctx.shadowBlur = 20; ctx.shadowColor = '#fbbf24';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.shadowBlur = 0;
        }
        drawParticles();
    }, 30);
}

function startWordleGame() {
    const words = ["ALERT", "ARGUE", "BEACH", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD", "CLICK", "CLOCK", "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH", "FEAST", "FIELD", "FRUIT", "GLASS", "GRAPE", "GREEN", "GHOST", "HEART", "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY", "MUSIC", "NIGHT", "OCEAN", "PARTY", "PIANO", "PILOT", "PLANE", "PLANT", "PLATE", "PHONE", "POWER", "QUIET", "RADIO", "RIVER", "ROBOT", "SHIRT", "SHOES", "SMILE", "SNAKE", "SPACE", "SPOON", "STORM", "TABLE", "TIGER", "TOAST", "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATER", "WATCH", "WHALE", "WORLD", "WRITE", "YOUTH", "ZEBRA"];
    const target = words[Math.floor(Math.random() * words.length)];
    
    const rows = 6;
    const cols = 5;
    const cellSize = 60;
    const gap = 10;
    const boardW = cols * cellSize + (cols - 1) * gap;
    const boardH = rows * cellSize + (rows - 1) * gap;
    const offsetX = (canvas.width - boardW) / 2;
    const offsetY = (canvas.height - boardH) / 2;

    let grid = Array(6).fill().map(() => Array(5).fill('').map(() => ({ char: '', state: 'empty' })));
    let currentRow = 0;
    let currentCol = 0;
    let gameOver = false;
    let message = "";
    let shake = 0;

    document.getElementById('gameScore').innerText = `Target: ?????`;

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'type') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.05); osc.start(now); osc.stop(now+0.05);
        } else if (type === 'enter') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(600, now+0.1); gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1); osc.start(now); osc.stop(now+0.1);
        } else if (type === 'win') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now+0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.3); osc.start(now); osc.stop(now+0.3);
        } else if (type === 'error') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now+0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.2); osc.start(now); osc.stop(now+0.2);
        }
    };

    document.onkeydown = (e) => {
        if (gameOver) return;
        if (e.key === 'Enter') {
            if (currentCol === 5) {
                let guess = grid[currentRow].map(c => c.char).join('');
                if (words.includes(guess)) {
                    let targetChars = target.split('');
                    let guessChars = guess.split('');
                    // Correct position
                    for (let i = 0; i < 5; i++) {
                        if (guessChars[i] === targetChars[i]) {
                            grid[currentRow][i].state = 'correct';
                            targetChars[i] = null; guessChars[i] = null;
                            createParticles(offsetX + i*(cellSize+gap) + cellSize/2, offsetY + currentRow*(cellSize+gap) + cellSize/2, '#22c55e');
                        }
                    }
                    // Wrong position
                    for (let i = 0; i < 5; i++) {
                        if (guessChars[i] !== null) {
                            let idx = targetChars.indexOf(guessChars[i]);
                            if (idx !== -1) {
                                grid[currentRow][i].state = 'present';
                                targetChars[idx] = null;
                                createParticles(offsetX + i*(cellSize+gap) + cellSize/2, offsetY + currentRow*(cellSize+gap) + cellSize/2, '#eab308');
                            } else {
                                grid[currentRow][i].state = 'absent';
                            }
                        }
                    }
                    playSound('enter');
                    if (guess === target) {
                        gameOver = true; message = "SPLENDID!";
                        setTimeout(() => endGame(1000 - currentRow * 100, true), 1500); playSound('win');
                    } else {
                        currentRow++; currentCol = 0;
                        if (currentRow >= 6) {
                            gameOver = true; message = target;
                            setTimeout(() => endGame(0, false), 2000);
                        }
                    }
                } else {
                    shake = 10; message = "Not in word list"; playSound('error'); setTimeout(() => message = "", 1000);
                }
            } else {
                shake = 5; message = "Too short"; playSound('error'); setTimeout(() => message = "", 1000);
            }
        } else if (e.key === 'Backspace') {
            if (currentCol > 0) { currentCol--; grid[currentRow][currentCol].char = ''; playSound('type'); }
        } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            if (currentCol < 5) { grid[currentRow][currentCol].char = e.key.toUpperCase(); currentCol++; playSound('type'); }
        }
    };

    gameInterval = setInterval(() => {
        if (shake > 0) shake *= 0.9; if (shake < 0.5) shake = 0;
        ctx.save(); ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cell = grid[r][c];
                let x = offsetX + c * (cellSize + gap); let y = offsetY + r * (cellSize + gap);
                let color = '#1e293b'; let borderColor = '#334155';
                if (cell.state === 'correct') { color = '#22c55e'; borderColor = '#22c55e'; }
                else if (cell.state === 'present') { color = '#eab308'; borderColor = '#eab308'; }
                else if (cell.state === 'absent') { color = '#475569'; borderColor = '#475569'; }
                else if (cell.char !== '') { borderColor = '#94a3b8'; }
                ctx.fillStyle = color; ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = borderColor; ctx.lineWidth = 2; ctx.strokeRect(x, y, cellSize, cellSize);
                if (cell.char) { ctx.fillStyle = '#fff'; ctx.font = 'bold 30px "Orbitron"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cell.char, x + cellSize/2, y + cellSize/2); }
            }
        }
        if (message) { ctx.fillStyle = '#fff'; ctx.font = '20px "Orbitron"'; ctx.textAlign = 'center'; ctx.fillText(message, canvas.width/2, offsetY - 30); }
        drawParticles();
        ctx.restore();
    }, 30);
}

function start2048Game() {
    const size = 4;
    const gap = 15;
    const boardSize = Math.min(canvas.width, canvas.height) - 100;
    const cellSize = (boardSize - (size + 1) * gap) / size;
    const offsetX = (canvas.width - boardSize) / 2;
    const offsetY = (canvas.height - boardSize) / 2;
    
    let grid = Array(size).fill().map(() => Array(size).fill(0));
    let score = 0;
    let won = false;
    let over = false;

    document.getElementById('gameScore').innerText = `Score: 0`;

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'move') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(50, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'merge') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(600, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        }
    };

    function spawn() {
        let empty = [];
        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if(grid[r][c] === 0) empty.push({r,c});
            }
        }
        if(empty.length > 0) {
            let spot = empty[Math.floor(Math.random() * empty.length)];
            grid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
            createParticles(offsetX + gap + spot.c*(cellSize+gap) + cellSize/2, offsetY + gap + spot.r*(cellSize+gap) + cellSize/2, '#fff');
        }
    }

    // Initial spawn
    spawn(); spawn();

    function getTileColor(val) {
        const colors = {
            2: '#38bdf8', 4: '#818cf8', 8: '#c084fc', 16: '#f472b6',
            32: '#f87171', 64: '#fbbf24', 128: '#34d399', 256: '#22c55e',
            512: '#0ea5e9', 1024: '#6366f1', 2048: '#d946ef'
        };
        return colors[val] || '#facc15';
    }

    function draw() {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Board bg
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(offsetX, offsetY, boardSize, boardSize);

        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                let val = grid[r][c];
                let x = offsetX + gap + c * (cellSize + gap);
                let y = offsetY + gap + r * (cellSize + gap);
                
                // Empty slot
                ctx.fillStyle = '#334155';
                ctx.fillRect(x, y, cellSize, cellSize);

                if(val !== 0) {
                    let color = getTileColor(val);
                    ctx.shadowBlur = 15; ctx.shadowColor = color;
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = (val > 4) ? '#fff' : '#0f172a';
                    ctx.font = `bold ${val > 100 ? 30 : 40}px "Orbitron"`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val, x + cellSize/2, y + cellSize/2);
                }
            }
        }
        drawParticles();
    }

    function move(dir) {
        if(over) return;
        let moved = false;
        let mergedScore = 0;
        
        let vector = {x: 0, y: 0};
        if(dir === 'ArrowLeft') vector = {x: -1, y: 0};
        else if(dir === 'ArrowRight') vector = {x: 1, y: 0};
        else if(dir === 'ArrowUp') vector = {x: 0, y: -1};
        else if(dir === 'ArrowDown') vector = {x: 0, y: 1};

        let traversals = { x: [], y: [] };
        for(let i=0; i<size; i++) { traversals.x.push(i); traversals.y.push(i); }
        
        if(vector.x === 1) traversals.x = traversals.x.reverse();
        if(vector.y === 1) traversals.y = traversals.y.reverse();

        let merged = Array(size).fill().map(() => Array(size).fill(false));

        traversals.x.forEach(c => {
            traversals.y.forEach(r => {
                if(grid[r][c] === 0) return;
                
                let tileVal = grid[r][c];
                let farthest = {x: c, y: r};
                let check = {x: c + vector.x, y: r + vector.y};
                
                while(check.x >= 0 && check.x < size && check.y >= 0 && check.y < size && grid[check.y][check.x] === 0) {
                    farthest = check;
                    check = {x: check.x + vector.x, y: check.y + vector.y};
                }
                
                let nextPos = check;
                if(nextPos.x >= 0 && nextPos.x < size && nextPos.y >= 0 && nextPos.y < size && 
                   grid[nextPos.y][nextPos.x] === tileVal && !merged[nextPos.y][nextPos.x]) {
                    // Merge
                    grid[nextPos.y][nextPos.x] *= 2;
                    grid[r][c] = 0;
                    merged[nextPos.y][nextPos.x] = true;
                    score += grid[nextPos.y][nextPos.x];
                    mergedScore += grid[nextPos.y][nextPos.x];
                    moved = true;
                    
                    let mx = offsetX + gap + nextPos.x*(cellSize+gap) + cellSize/2;
                    let my = offsetY + gap + nextPos.y*(cellSize+gap) + cellSize/2;
                    createParticles(mx, my, getTileColor(grid[nextPos.y][nextPos.x]));
                } else if(farthest.x !== c || farthest.y !== r) {
                    // Move
                    grid[farthest.y][farthest.x] = tileVal;
                    grid[r][c] = 0;
                    moved = true;
                }
            });
        });

        if(moved) {
            spawn();
            document.getElementById('gameScore').innerText = `Score: ${score}`;
            if(mergedScore > 0) playSound('merge'); else playSound('move');
            
            // Check Game Over
            let canMove = false;
            for(let r=0; r<size; r++) {
                for(let c=0; c<size; c++) {
                    if(grid[r][c] === 0) canMove = true;
                    if(c < size-1 && grid[r][c] === grid[r][c+1]) canMove = true;
                    if(r < size-1 && grid[r][c] === grid[r+1][c]) canMove = true;
                }
            }
            if(!canMove) {
                over = true;
                setTimeout(() => endGame(score), 1000);
            }
        }
    }

    document.onkeydown = (e) => {
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
            e.preventDefault();
            move(e.code);
        }
    };

    gameInterval = setInterval(() => {
        draw();
    }, 30);
}

function startSudokuGame() {
    const cellSize = 50;
    const gridSize = 9;
    const boardSize = gridSize * cellSize;
    const offsetX = (canvas.width - boardSize) / 2;
    const offsetY = (canvas.height - boardSize) / 2;

    let grid = Array(9).fill().map(() => Array(9).fill(0));
    let solution = Array(9).fill().map(() => Array(9).fill(0));
    let initial = Array(9).fill().map(() => Array(9).fill(false));
    let selected = { r: -1, c: -1 };
    let mistakes = 0;
    let score = 0;

    document.getElementById('gameScore').innerText = `Mistakes: 0/3`;

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'select') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'correct') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(1200, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now+0.3);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
            osc.start(now); osc.stop(now+0.3);
        }
    };

    // Generator
    const isValid = (g, r, c, num) => {
        for (let k = 0; k < 9; k++) if (g[r][k] === num) return false;
        for (let k = 0; k < 9; k++) if (g[k][c] === num) return false;
        const startR = Math.floor(r / 3) * 3;
        const startC = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (g[startR + i][startC + j] === num) return false;
        return true;
    };

    const generate = () => {
        let g = Array(9).fill().map(() => Array(9).fill(0));
        // Fill diagonal boxes
        for (let i = 0; i < 9; i += 3) {
            let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            let idx = 0;
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[i + r][i + c] = nums[idx++];
        }
        // Solve
        const solve = (board) => {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (board[r][c] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isValid(board, r, c, num)) {
                                board[r][c] = num;
                                if (solve(board)) return true;
                                board[r][c] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };
        solve(g);
        solution = g.map(row => [...row]);
        // Remove digits
        let attempts = 40;
        while (attempts > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (g[r][c] !== 0) {
                g[r][c] = 0;
                attempts--;
            }
        }
        grid = g;
        initial = grid.map(row => row.map(val => val !== 0));
    };
    generate();

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if (x >= offsetX && x <= offsetX + 9 * cellSize && y >= offsetY && y <= offsetY + 9 * cellSize) {
            selected.c = Math.floor((x - offsetX) / cellSize);
            selected.r = Math.floor((y - offsetY) / cellSize);
            playSound('select');
        } else {
            selected = { r: -1, c: -1 };
        }
    };

    document.onkeydown = (e) => {
        if (selected.r === -1) return;
        if (e.key === 'ArrowUp') selected.r = Math.max(0, selected.r - 1);
        if (e.key === 'ArrowDown') selected.r = Math.min(8, selected.r + 1);
        if (e.key === 'ArrowLeft') selected.c = Math.max(0, selected.c - 1);
        if (e.key === 'ArrowRight') selected.c = Math.min(8, selected.c + 1);
        
        if (!initial[selected.r][selected.c] && e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key);
            if (num === solution[selected.r][selected.c]) {
                grid[selected.r][selected.c] = num;
                initial[selected.r][selected.c] = true; // Lock it
                createParticles(offsetX + selected.c * cellSize + cellSize / 2, offsetY + selected.r * cellSize + cellSize / 2, '#22c55e');
                playSound('correct');
                // Check Win
                let full = true;
                for(let r=0; r<9; r++) for(let c=0; c<9; c++) if(grid[r][c] === 0) full = false;
                if(full) endGame(1000 - mistakes * 100, true);
            } else {
                mistakes++;
                document.getElementById('gameScore').innerText = `Mistakes: ${mistakes}/3`;
                createParticles(offsetX + selected.c * cellSize + cellSize / 2, offsetY + selected.r * cellSize + cellSize / 2, '#ef4444');
                playSound('wrong');
                if (mistakes >= 3) endGame(0, false);
            }
        }
    };

    gameInterval = setInterval(() => {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(offsetX, offsetY, boardSize, boardSize);
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                let x = offsetX + c * cellSize;
                let y = offsetY + r * cellSize;
                
                if (selected.r === r && selected.c === c) {
                    ctx.fillStyle = '#334155'; ctx.fillRect(x, y, cellSize, cellSize);
                }
                
                ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cellSize, cellSize);
                
                if (grid[r][c] !== 0) {
                    ctx.fillStyle = initial[r][c] ? '#94a3b8' : '#38bdf8';
                    ctx.font = '30px "Orbitron"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(grid[r][c], x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
        // Draw thick lines
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
        for (let i = 0; i <= 3; i++) {
            ctx.beginPath(); ctx.moveTo(offsetX + i * 3 * cellSize, offsetY); ctx.lineTo(offsetX + i * 3 * cellSize, offsetY + boardSize); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(offsetX, offsetY + i * 3 * cellSize); ctx.lineTo(offsetX + boardSize, offsetY + i * 3 * cellSize); ctx.stroke();
        }
        drawParticles();
    }, 30);
}

function startMinesweeperGame() {
    const cols = 16;
    const rows = 12;
    const totalMines = 30;
    
    const cellSize = 40;
    const boardW = cols * cellSize;
    const boardH = rows * cellSize;
    const offsetX = (canvas.width - boardW) / 2;
    const offsetY = (canvas.height - boardH) / 2;

    let grid = [];
    let gameOver = false;
    let firstClick = true;
    let flags = 0;

    document.getElementById('gameScore').innerText = `Mines: ${totalMines}`;

    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'click') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(400, now+0.05);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.05);
            osc.start(now); osc.stop(now+0.05);
        } else if (type === 'flag') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(800, now+0.05);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.05);
            osc.start(now); osc.stop(now+0.05);
        } else if (type === 'boom') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now+0.5);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.5);
            osc.start(now); osc.stop(now+0.5);
        }
    };

    function initGrid() {
        grid = [];
        for(let y=0; y<rows; y++) {
            let row = [];
            for(let x=0; x<cols; x++) row.push({ x, y, mine: false, revealed: false, flagged: false, count: 0 });
            grid.push(row);
        }
    }

    function placeMines(safeX, safeY) {
        let placed = 0;
        while(placed < totalMines) {
            let x = Math.floor(Math.random() * cols);
            let y = Math.floor(Math.random() * rows);
            if (Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1) continue;
            if (!grid[y][x].mine) { grid[y][x].mine = true; placed++; }
        }
        for(let y=0; y<rows; y++) {
            for(let x=0; x<cols; x++) {
                if(grid[y][x].mine) continue;
                let count = 0;
                for(let dy=-1; dy<=1; dy++) {
                    for(let dx=-1; dx<=1; dx++) {
                        if(y+dy >= 0 && y+dy < rows && x+dx >= 0 && x+dx < cols && grid[y+dy][x+dx].mine) count++;
                    }
                }
                grid[y][x].count = count;
            }
        }
    }

    function reveal(x, y) {
        if (x < 0 || x >= cols || y < 0 || y >= rows || grid[y][x].revealed || grid[y][x].flagged) return;
        grid[y][x].revealed = true;
        createParticles(offsetX + x*cellSize + cellSize/2, offsetY + y*cellSize + cellSize/2, '#38bdf8');
        if (grid[y][x].count === 0) {
            for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) reveal(x+dx, y+dy);
        }
    }

    function checkWin() {
        let revealedCount = 0;
        for(let y=0; y<rows; y++) for(let x=0; x<cols; x++) if(grid[y][x].revealed) revealedCount++;
        if (revealedCount === (cols * rows) - totalMines) endGame(1000 + (flags * 10), true);
    }

    initGrid();

    canvas.onmousedown = (e) => {
        if (gameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        if (mx >= offsetX && mx < offsetX + boardW && my >= offsetY && my < offsetY + boardH) {
            const cx = Math.floor((mx - offsetX) / cellSize);
            const cy = Math.floor((my - offsetY) / cellSize);
            const cell = grid[cy][cx];
            if (e.button === 2) { 
                if (!cell.revealed) { cell.flagged = !cell.flagged; flags += cell.flagged ? 1 : -1; document.getElementById('gameScore').innerText = `Mines: ${totalMines - flags}`; playSound('flag'); }
            } else if (e.button === 0) {
                if (cell.flagged || cell.revealed) return;
                if (firstClick) { placeMines(cx, cy); firstClick = false; }
                if (cell.mine) {
                    cell.revealed = true; gameOver = true; playSound('boom');
                    createParticles(offsetX + cx*cellSize + cellSize/2, offsetY + cy*cellSize + cellSize/2, '#ef4444');
                    grid.forEach(row => row.forEach(c => { if(c.mine) c.revealed = true; }));
                    setTimeout(() => endGame(0), 1000);
                } else { reveal(cx, cy); playSound('click'); checkWin(); }
            }
        }
    };
    canvas.oncontextmenu = (e) => e.preventDefault();

    gameInterval = setInterval(() => {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(offsetX, offsetY, boardW, boardH);
        for(let y=0; y<rows; y++) for(let x=0; x<cols; x++) {
            const cell = grid[y][x]; const px = offsetX + x * cellSize; const py = offsetY + y * cellSize;
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(px, py, cellSize, cellSize);
            if (!cell.revealed) {
                ctx.fillStyle = '#334155'; ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
                ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px+cellSize, py); ctx.lineTo(px, py+cellSize); ctx.fill();
                if (cell.flagged) { ctx.fillStyle = '#ef4444'; ctx.font = '20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🚩', px + cellSize/2, py + cellSize/2); }
            } else {
                ctx.fillStyle = '#0f172a'; ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
                if (cell.mine) { ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/3, 0, Math.PI*2); ctx.fill(); }
                else if (cell.count > 0) {
                    const colors = [null, '#38bdf8', '#22c55e', '#ef4444', '#a855f7', '#fbbf24', '#f472b6', '#fff', '#94a3b8'];
                    ctx.fillStyle = colors[cell.count]; ctx.font = 'bold 20px "Orbitron"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cell.count, px + cellSize/2, py + cellSize/2);
                }
            }
        }
        drawParticles();
    }, 30);
}

function startSimonGame() {
    const pads = [
        { x: canvas.width/2 - 105, y: canvas.height/2 - 105, w: 100, h: 100, color: '#ef4444', freq: 261.63, key: 'ArrowUp' },    // Top Left (Red)
        { x: canvas.width/2 + 5, y: canvas.height/2 - 105, w: 100, h: 100, color: '#22c55e', freq: 329.63, key: 'ArrowRight' },  // Top Right (Green)
        { x: canvas.width/2 - 105, y: canvas.height/2 + 5, w: 100, h: 100, color: '#3b82f6', freq: 392.00, key: 'ArrowLeft' },   // Bottom Left (Blue)
        { x: canvas.width/2 + 5, y: canvas.height/2 + 5, w: 100, h: 100, color: '#eab308', freq: 523.25, key: 'ArrowDown' }    // Bottom Right (Yellow)
    ];

    let sequence = [];
    let playerStep = 0;
    let state = 'idle'; // idle, playing, input, gameover
    let litPad = -1;
    let litTimer = 0;
    let score = 0;
    let playIndex = 0;
    let playTimer = 0;

    document.getElementById('gameScore').innerText = `Score: 0`;

    // Audio
    const playTone = (freq) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    };

    const nextRound = () => {
        score++;
        document.getElementById('gameScore').innerText = `Score: ${score}`;
        sequence.push(Math.floor(Math.random() * 4));
        playerStep = 0;
        playIndex = 0;
        state = 'playing';
        playTimer = 30; // Delay before starting sequence
    };

    // Start first round
    sequence.push(Math.floor(Math.random() * 4));
    state = 'playing';
    playTimer = 30;

    // Input
    const handleInput = (idx) => {
        if (state !== 'input') return;
        
        litPad = idx;
        litTimer = 10;
        playTone(pads[idx].freq);
        createParticles(pads[idx].x + pads[idx].w/2, pads[idx].y + pads[idx].h/2, pads[idx].color);

        if (idx === sequence[playerStep]) {
            playerStep++;
            if (playerStep >= sequence.length) {
                state = 'idle';
                setTimeout(nextRound, 800);
            }
        } else {
            endGame(score);
        }
    };

    document.onkeydown = (e) => {
        if (state !== 'input') return;
        const idx = pads.findIndex(p => p.key === e.code);
        if (idx !== -1) handleInput(idx);
    };

    canvas.onclick = (e) => {
        if (state !== 'input') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const idx = pads.findIndex(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
        if (idx !== -1) handleInput(idx);
    };

    gameInterval = setInterval(() => {
        // Logic
        if (state === 'playing') {
            playTimer--;
            if (playTimer <= 0) {
                if (litPad !== -1) {
                    litPad = -1;
                    playTimer = 10; // Gap between notes
                    playIndex++;
                    if (playIndex >= sequence.length) {
                        state = 'input';
                    }
                } else {
                    litPad = sequence[playIndex];
                    playTone(pads[litPad].freq);
                    litTimer = 20; // Duration of light
                    playTimer = 20;
                }
            }
        } else if (litPad !== -1) {
            litTimer--;
            if (litTimer <= 0) litPad = -1;
        }

        // Draw
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        pads.forEach((p, i) => {
            const isLit = (i === litPad);
            ctx.shadowBlur = isLit ? 30 : 0;
            ctx.shadowColor = p.color;
            ctx.fillStyle = isLit ? '#fff' : p.color;
            ctx.globalAlpha = isLit ? 1 : 0.4;
            
            ctx.fillRect(p.x, p.y, p.w, p.h);
            
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            
            // Key hint
            if (state === 'input') {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let arrow = '';
                if(p.key === 'ArrowUp') arrow = '↑';
                if(p.key === 'ArrowDown') arrow = '↓';
                if(p.key === 'ArrowLeft') arrow = '←';
                if(p.key === 'ArrowRight') arrow = '→';
                ctx.fillText(arrow, p.x + p.w/2, p.y + p.h/2);
            }
        });

        // Status Text
        ctx.fillStyle = '#fff';
        ctx.font = '24px "Orbitron"';
        ctx.textAlign = 'center';
        if (state === 'playing') ctx.fillText('WATCH', canvas.width/2, 50);
        else if (state === 'input') ctx.fillText('REPEAT', canvas.width/2, 50);

        drawParticles();

    }, 30);
}

function startPlatformerGame() {
    // Setup
    const gravity = 0.6;
    const friction = 0.8;
    const jumpStrength = 14;
    
    let player = {
        x: 100, y: 100, w: 30, h: 30,
        vx: 0, vy: 0,
        grounded: false,
        facingRight: true
    };
    
    let cameraX = 0;
    let score = 0;
    let levelWidth = 0;
    
    let blocks = [];
    let enemies = [];
    let coins = [];
    let decorations = [];
    let flag = null;
    
    // Input
    let keys = {};
    document.onkeydown = (e) => keys[e.code] = true;
    document.onkeyup = (e) => keys[e.code] = false;
    
    // Audio Helper
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'jump') {
            osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(300, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'coin') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.setValueAtTime(1600, now+0.05);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        } else if (type === 'stomp') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'die') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now+0.5);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.5);
            osc.start(now); osc.stop(now+0.5);
        }
    };

    // Level Generation
    function initLevel() {
        blocks = []; enemies = []; coins = []; decorations = [];
        let x = 0;
        const groundY = canvas.height - 50;
        
        // Start area
        for(let i=0; i<10; i++) {
            blocks.push({x: x, y: groundY, w: 50, h: 50, type: 'ground'});
            x += 50;
        }
        
        // Procedural generation
        for(let i=0; i<40; i++) {
            let type = Math.random();
            if (type < 0.2) { // Gap
                x += 100 + Math.random() * 50;
            } else if (type < 0.4) { // Raised platform
                let h = 100 + Math.random() * 100;
                blocks.push({x: x, y: groundY - h, w: 150, h: 20, type: 'brick'});
                if(Math.random() < 0.5) {
                    coins.push({x: x + 50, y: groundY - h - 40});
                    coins.push({x: x + 100, y: groundY - h - 40});
                }
                if(Math.random() < 0.3) {
                    enemies.push({x: x + 20, y: groundY - 40, w: 30, h: 30, vx: -2, type: 'goomba'});
                }
                blocks.push({x: x, y: groundY, w: 150, h: 50, type: 'ground'});
                x += 150;
            } else if (type < 0.6) { // Pipe
                let h = 60 + Math.random() * 60;
                blocks.push({x: x, y: groundY - h, w: 60, h: h + 50, type: 'pipe'});
                blocks.push({x: x, y: groundY, w: 60, h: 50, type: 'ground'});
                x += 60;
            } else { // Flat ground
                let len = 200 + Math.random() * 300;
                blocks.push({x: x, y: groundY, w: len, h: 50, type: 'ground'});
                if (Math.random() < 0.7) {
                    enemies.push({x: x + len/2, y: groundY - 40, w: 30, h: 30, vx: -2, type: 'goomba'});
                }
                if (Math.random() < 0.5) {
                    blocks.push({x: x + 50, y: groundY - 120, w: 40, h: 40, type: 'qblock'});
                    coins.push({x: x + 50, y: groundY - 120}); 
                }
                x += len;
            }
        }
        
        // End area
        x += 100;
        for(let i=0; i<10; i++) {
            blocks.push({x: x, y: groundY, w: 50, h: 50, type: 'ground'});
            if (i === 5) {
                flag = {x: x + 25, y: groundY - 300, w: 5, h: 300};
            }
            x += 50;
        }
        
        // Clouds
        for(let i=0; i<50; i++) {
            decorations.push({
                x: Math.random() * x,
                y: Math.random() * (canvas.height/2),
                w: 60 + Math.random() * 60,
                h: 30 + Math.random() * 20,
                type: 'cloud'
            });
        }
        
        levelWidth = x;
    }
    
    initLevel();
    
    document.getElementById('gameScore').innerText = `Score: 0`;

    gameInterval = setInterval(() => {
        // Physics
        if (keys['ArrowLeft']) { player.vx -= 1; player.facingRight = false; }
        if (keys['ArrowRight']) { player.vx += 1; player.facingRight = true; }
        if ((keys['Space'] || keys['ArrowUp']) && player.grounded) {
            player.vy = -jumpStrength;
            player.grounded = false;
            playSound('jump');
        }
        
        player.vx *= friction;
        player.vy += gravity;
        
        player.x += player.vx;
        // Horizontal Collision
        blocks.forEach(b => {
            if (player.x < b.x + b.w && player.x + player.w > b.x &&
                player.y < b.y + b.h && player.y + player.h > b.y) {
                if (player.vx > 0) player.x = b.x - player.w;
                else if (player.vx < 0) player.x = b.x + b.w;
                player.vx = 0;
            }
        });
        
        player.y += player.vy;
        player.grounded = false;
        // Vertical Collision
        blocks.forEach(b => {
            if (player.x < b.x + b.w && player.x + player.w > b.x &&
                player.y < b.y + b.h && player.y + player.h > b.y) {
                if (player.vy > 0) {
                    player.y = b.y - player.h;
                    player.grounded = true;
                    player.vy = 0;
                } else if (player.vy < 0) {
                    player.y = b.y + b.h;
                    player.vy = 0;
                    if(b.type === 'qblock') {
                        score += 10;
                        playSound('coin');
                        createParticles(b.x + b.w/2, b.y + b.h/2, '#fbbf24');
                        b.type = 'empty';
                    }
                }
            }
        });
        
        // Camera
        let targetCamX = player.x - canvas.width / 3;
        targetCamX = Math.max(0, Math.min(targetCamX, levelWidth - canvas.width));
        cameraX += (targetCamX - cameraX) * 0.1;
        
        // Death
        if (player.y > canvas.height) {
            endGame(score);
            return;
        }
        
        // Entities
        enemies.forEach((e, i) => {
            e.x += e.vx;
            let onGround = false;
            blocks.forEach(b => {
                if (e.x < b.x + b.w && e.x + e.w > b.x && e.y < b.y + b.h && e.y + e.h > b.y) {
                    e.vx *= -1;
                }
                if (e.x + e.w/2 > b.x && e.x + e.w/2 < b.x + b.w && Math.abs((e.y + e.h) - b.y) < 5) onGround = true;
            });
            if (!onGround) e.vx *= -1;
            
            if (player.x < e.x + e.w && player.x + player.w > e.x &&
                player.y < e.y + e.h && player.y + player.h > e.y) {
                if (player.vy > 0 && player.y + player.h < e.y + e.h/2 + 10) {
                    enemies.splice(i, 1);
                    player.vy = -8;
                    score += 100;
                    playSound('stomp');
                    createParticles(e.x + e.w/2, e.y + e.h/2, '#7f1d1d');
                } else {
                    playSound('die');
                    endGame(score);
                }
            }
        });
        
        coins.forEach((c, i) => {
            if (player.x < c.x + 20 && player.x + player.w > c.x &&
                player.y < c.y + 20 && player.y + player.h > c.y) {
                coins.splice(i, 1);
                score += 50;
                playSound('coin');
                document.getElementById('gameScore').innerText = `Score: ${score}`;
            }
        });
        
        if (flag && player.x > flag.x) {
            score += 1000;
            endGame(score, true);
        }
        
        // Draw
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(-cameraX, 0);
        
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        decorations.forEach(d => {
            ctx.beginPath(); ctx.arc(d.x, d.y, d.w/2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(d.x + d.w/2, d.y - 10, d.w/3, 0, Math.PI*2); ctx.fill();
        });
        
        blocks.forEach(b => {
            if (b.x + b.w < cameraX || b.x > cameraX + canvas.width) return;
            if (b.type === 'ground') ctx.fillStyle = '#22c55e';
            else if (b.type === 'brick') ctx.fillStyle = '#b45309';
            else if (b.type === 'pipe') ctx.fillStyle = '#15803d';
            else if (b.type === 'qblock') ctx.fillStyle = '#fbbf24';
            else if (b.type === 'empty') ctx.fillStyle = '#78350f';
            
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            
            if (b.type === 'qblock') {
                ctx.fillStyle = '#000'; ctx.font = '20px Arial'; ctx.fillText('?', b.x + 10, b.y + 28);
            }
        });
        
        if (flag) {
            ctx.fillStyle = '#fff'; ctx.fillRect(flag.x, flag.y, flag.w, flag.h);
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(flag.x+flag.w, flag.y); ctx.lineTo(flag.x+40, flag.y+15); ctx.lineTo(flag.x+flag.w, flag.y+30); ctx.fill();
        }
        
        ctx.fillStyle = '#fbbf24';
        coins.forEach(c => {
            ctx.beginPath(); ctx.arc(c.x + 10, c.y + 10, 8, 0, Math.PI*2); ctx.fill();
        });
        
        enemies.forEach(e => {
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(e.x, e.y, e.w, e.h);
            ctx.fillStyle = '#fff'; ctx.fillRect(e.x + 5, e.y + 5, 8, 8); ctx.fillRect(e.x + 18, e.y + 5, 8, 8);
            ctx.fillStyle = '#000'; ctx.fillRect(e.x + 7, e.y + 7, 3, 3); ctx.fillRect(e.x + 20, e.y + 7, 3, 3);
        });
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#b91c1c'; 
        if(player.facingRight) ctx.fillRect(player.x + 15, player.y, 20, 5);
        else ctx.fillRect(player.x - 5, player.y, 20, 5);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(player.x + 5, player.y + 20, 20, 10);
        
        drawParticles();
        ctx.restore();
        
    }, 20);
}

function startInvadersGame(mode = 'normal') {
    let isEndless = (mode === 'endless');
    let isBossRush = (mode === 'boss');
    let player = { x: canvas.width / 2 - 15, y: canvas.height - 30, w: 30, h: 20, hp: 100, maxHp: 100 };
    let bullets = [];
    let enemyBullets = [];
    let aliens = [];
    let boss = null;
    let powerUps = [];
    let score = 0;
    let wave = 1;
    let activePowerups = { speed: 0, big: 0, shield: 0 };
    let keys = {};
    let bossTextTimer = 0;
    let endlessSpeed = 1;
    let endlessTimer = 0;
    let lastShotTime = 0;

    let bgStars = [];
    for(let i=0; i<100; i++) {
        bgStars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 2, a: Math.random() });
    }
    
    document.getElementById('gameScore').innerText = `Score: 0 | Wave: 1`;

    function spawnWave() {
        aliens = [];
        bullets = []; // Clear bullets on new wave
        enemyBullets = [];
        powerUps = [];
        
        if (isBossRush || wave % 5 === 0) {
            // Boss Wave
            let scale = isBossRush ? wave : (wave / 5);
            boss = {
                x: canvas.width / 2 - 50,
                y: 50,
                w: 100,
                h: 80,
                hp: 100 * scale,
                maxHp: 100 * scale,
                dx: 2 + (scale * 0.5),
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                shootTimer: 0
            };
            bossTextTimer = 100;
        } else {
            boss = null;
            let count = 5 + wave * 2;
            for(let i=0; i<count; i++) {
                let size = 20 + Math.random() * 15;
                aliens.push({
                    x: Math.random() * (canvas.width - size),
                    y: -Math.random() * 300 - 50,
                    w: size, h: size,
                    dx: (Math.random() - 0.5) * 1.5,
                    dy: 1 + (wave * 0.2),
                    shape: wave % 3, // 0: rect, 1: circle, 2: triangle
                    color: `hsl(${wave * 50}, 70%, 50%)`,
                    hp: 1 + Math.floor(wave / 5),
                    alive: true
                });
            }
        }
    }

    if (!isEndless) spawnWave();

    document.onkeydown = (e) => {
        keys[e.code] = true;
        if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
    };
    document.onkeyup = (e) => {
        keys[e.code] = false;
    };

    gameInterval = setInterval(() => {
        // Clear Screen
        let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(1, '#172554');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Player Movement
        let speed = (Date.now() < activePowerups.speed) ? 16 : 8;
        if(keys['ArrowLeft']) player.x -= speed;
        if(keys['ArrowRight']) player.x += speed;
        player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

        // Shooting
        if (keys['Space'] || keys['ArrowUp']) {
            if (Date.now() - lastShotTime > 250) {
                let bW = (Date.now() < activePowerups.big) ? 12 : 4;
                bullets.push({ x: player.x + player.w/2 - bW/2, y: player.y, w: bW, h: 10, dmg: (Date.now() < activePowerups.big) ? 5 : 1 });
                lastShotTime = Date.now();
            }
        }

        bgStars.forEach(s => { ctx.fillStyle = `rgba(255, 255, 255, ${s.a})`; ctx.fillRect(s.x, s.y, s.s, s.s); });

        // Boss Text
        if (bossTextTimer > 0) {
            bossTextTimer--;
            if (Math.floor(Date.now() / 100) % 2 === 0) {
                ctx.fillStyle = '#ef4444'; ctx.font = '30px "Segoe UI"'; ctx.textAlign = 'center';
                ctx.fillText("WARNING: BOSS FIGHT", canvas.width/2, canvas.height/2);
            }
        }

        // Check Wave End
        if (isEndless) {
            endlessTimer++;
            if (endlessTimer > Math.max(10, 60 - endlessSpeed * 5)) {
                endlessTimer = 0;
                let size = 20 + Math.random() * 15;
                aliens.push({
                    x: Math.random() * (canvas.width - size),
                    y: -50,
                    w: size, h: size,
                    dx: (Math.random() - 0.5) * (1 + endlessSpeed * 0.2),
                    dy: (1 + Math.random()) * (1 + endlessSpeed * 0.1),
                    shape: Math.floor(Math.random() * 3),
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    hp: 1 + Math.floor(endlessSpeed / 3),
                    alive: true
                });
            }
            endlessSpeed += 0.001;
            document.getElementById('gameScore').innerText = `Score: ${score} | Speed: ${endlessSpeed.toFixed(1)}`;
        } else {
            if (!boss && aliens.length === 0) {
                wave++;
                document.getElementById('gameScore').innerText = `Score: ${score} | Wave: ${wave}`;
                spawnWave();
            } else if (boss && boss.hp <= 0) {
                score += 1000 * (wave/5);
                createParticles(boss.x + boss.w/2, boss.y + boss.h/2, boss.color);
                boss = null;
                wave++;
                player.hp = player.maxHp; // Heal on boss defeat
                document.getElementById('gameScore').innerText = `Score: ${score} | Wave: ${wave}`;
                spawnWave();
            }
        }

        // Player Bullets
        ctx.fillStyle = '#f87171';
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.y -= 5;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            if (b.y < 0) bullets.splice(i, 1);
        }

        // Enemy Bullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            let b = enemyBullets[i];
            b.x += b.vx; b.y += b.vy;
            ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
            
            if (b.x > player.x && b.x < player.x + player.w && b.y > player.y && b.y < player.y + player.h) {
                if (Date.now() < activePowerups.shield) {
                    enemyBullets.splice(i, 1);
                } else {
                    player.hp -= 10;
                    enemyBullets.splice(i, 1);
                    createParticles(player.x + player.w/2, player.y + player.h/2, '#ef4444');
                    if (player.hp <= 0) endGame(score);
                }
            } else if (b.y > canvas.height || b.x < 0 || b.x > canvas.width) {
                enemyBullets.splice(i, 1);
            }
        }

        // Powerups
        ctx.font = '20px Arial';
        for (let i = powerUps.length - 1; i >= 0; i--) {
            let p = powerUps[i];
            p.y += 3;
            if (p.type === 'speed') { ctx.fillStyle = '#fbbf24'; ctx.fillText('⚡', p.x, p.y); }
            else if (p.type === 'big') { ctx.fillStyle = '#c084fc'; ctx.fillText('★', p.x, p.y); }
            else if (p.type === 'heal') { ctx.fillStyle = '#22c55e'; ctx.fillText('♥', p.x, p.y); }
            else if (p.type === 'nuke') { ctx.fillStyle = '#ef4444'; ctx.fillText('☢️', p.x, p.y); }
            else if (p.type === 'shield') { ctx.fillStyle = '#06b6d4'; ctx.fillText('🛡️', p.x, p.y); }
            
            // Collision
            if (p.x < player.x + player.w && p.x + 20 > player.x && p.y < player.y + player.h && p.y + 20 > player.y) {
                if (p.type === 'speed') activePowerups.speed = Date.now() + 10000;
                if (p.type === 'big') activePowerups.big = Date.now() + 10000;
                if (p.type === 'heal') player.hp = Math.min(player.maxHp, player.hp + 30);
                if (p.type === 'shield') activePowerups.shield = Date.now() + 5000;
                if (p.type === 'nuke') {
                    aliens.forEach(a => {
                        createParticles(a.x + a.w/2, a.y + a.h/2, a.color);
                        score += 100;
                    });
                    aliens = [];
                    if(boss) {
                        boss.hp -= 50;
                        createParticles(boss.x + boss.w/2, boss.y + boss.h/2, boss.color);
                    }
                    document.getElementById('gameScore').innerText = `Score: ${score} | Wave: ${wave}`;
                }
                createParticles(player.x, player.y, '#fff');
                powerUps.splice(i, 1);
            } else if (p.y > canvas.height) {
                powerUps.splice(i, 1);
            }
        }

        // Entities
        if (boss) {
            boss.x += boss.dx;
            if (boss.x <= 0 || boss.x + boss.w >= canvas.width) boss.dx *= -1;
            
            boss.shootTimer++;
            if (boss.shootTimer > 40) {
                boss.shootTimer = 0;
                let angle = Math.atan2(player.y - (boss.y + boss.h), player.x - (boss.x + boss.w/2));
                enemyBullets.push({ x: boss.x + boss.w/2, y: boss.y + boss.h, vx: Math.cos(angle)*5, vy: Math.sin(angle)*5, r: 8, color: boss.color });
                if (wave >= 10) {
                     enemyBullets.push({ x: boss.x + boss.w/2, y: boss.y + boss.h, vx: -3, vy: 4, r: 6, color: '#fff' });
                     enemyBullets.push({ x: boss.x + boss.w/2, y: boss.y + boss.h, vx: 3, vy: 4, r: 6, color: '#fff' });
                }
            }
            
            ctx.fillStyle = boss.color; ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
            
            // Boss Face
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(boss.x + boss.w*0.3, boss.y + boss.h*0.4, 10, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(boss.x + boss.w*0.7, boss.y + boss.h*0.4, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.arc(boss.x + boss.w*0.3, boss.y + boss.h*0.4, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(boss.x + boss.w*0.7, boss.y + boss.h*0.4, 4, 0, Math.PI*2); ctx.fill();

            // Boss HP Bar
            ctx.fillStyle = '#334155'; ctx.fillRect(canvas.width/2 - 100, 10, 200, 10);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(canvas.width/2 - 100, 10, 200 * (boss.hp / boss.maxHp), 10);
            
            // Hit Boss
            for (let j = bullets.length - 1; j >= 0; j--) {
                let b = bullets[j];
                if (b.x < boss.x + boss.w && b.x + b.w > boss.x && b.y < boss.y + boss.h && b.y + b.h > boss.y) {
                    boss.hp -= b.dmg;
                    createParticles(b.x, b.y, boss.color);
                    bullets.splice(j, 1);
                }
            }
        } else {
            for (let i = aliens.length - 1; i >= 0; i--) {
                let a = aliens[i];
                a.x += a.dx; a.y += a.dy;
                if (a.x <= 0 || a.x + a.w >= canvas.width) a.dx *= -1;
                
                if (a.y + a.h >= player.y - 10) endGame(score);
                
                if (wave > 3 && Math.random() < 0.005) {
                    enemyBullets.push({ x: a.x + a.w/2, y: a.y + a.h, vx: 0, vy: 4, r: 4, color: '#fff' });
                }
                
                ctx.fillStyle = a.color;
                if (a.shape === 1) { ctx.beginPath(); ctx.arc(a.x + a.w/2, a.y + a.h/2, a.w/2, 0, Math.PI*2); ctx.fill(); }
                else if (a.shape === 2) { ctx.beginPath(); ctx.moveTo(a.x + a.w/2, a.y); ctx.lineTo(a.x + a.w, a.y + a.h); ctx.lineTo(a.x, a.y + a.h); ctx.fill(); }
                else { ctx.fillRect(a.x, a.y, a.w, a.h); }
                
                // Alien Face
                ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.arc(a.x + a.w*0.3, a.y + a.h*0.4, a.w*0.15, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(a.x + a.w*0.7, a.y + a.h*0.4, a.w*0.15, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath(); ctx.arc(a.x + a.w*0.3, a.y + a.h*0.4, a.w*0.05, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(a.x + a.w*0.7, a.y + a.h*0.4, a.w*0.05, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(a.x + a.w*0.5, a.y + a.h*0.7, a.w*0.1, 0, Math.PI*2); ctx.fill();
                
                // Hit Alien
                for (let j = bullets.length - 1; j >= 0; j--) {
                    let b = bullets[j];
                    if (b.x < a.x + a.w && b.x + b.w > a.x && b.y < a.y + a.h && b.y + b.h > a.y) {
                        a.hp -= b.dmg;
                        bullets.splice(j, 1);
                        if (a.hp <= 0) {
                            createParticles(a.x + a.w/2, a.y + a.h/2, a.color);
                            aliens.splice(i, 1);
                            score += 100;
                            document.getElementById('gameScore').innerText = `Score: ${score} | Wave: ${wave}`;
                            if (Math.random() < 0.1) {
                                let type = Math.random();
                                let pType = 'speed';
                                if (type < 0.20) pType = 'speed';
                                else if (type < 0.40) pType = 'big';
                                else if (type < 0.60) pType = 'heal';
                                else if (type < 0.80) pType = 'nuke';
                                else pType = 'shield';
                                powerUps.push({ x: a.x, y: a.y, type: pType });
                            }
                        }
                        break;
                    }
                }
                
                // Crash into player
                if (a && a.y + a.h > player.y && a.x < player.x + player.w && a.x + a.w > player.x) {
                    if (Date.now() < activePowerups.shield) {
                        createParticles(a.x + a.w/2, a.y + a.h/2, a.color);
                        aliens.splice(i, 1);
                        score += 100;
                        document.getElementById('gameScore').innerText = `Score: ${score} | Wave: ${wave}`;
                    } else {
                        endGame(score);
                    }
                }
            }
        }

        // Draw Player Ship
        ctx.shadowBlur = 15; ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = (Date.now() < activePowerups.speed) ? '#fbbf24' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(player.x + player.w/2, player.y);
        ctx.lineTo(player.x + player.w, player.y + player.h);
        ctx.lineTo(player.x, player.y + player.h);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Shield
        if (Date.now() < activePowerups.shield) {
            ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = "#06b6d4";
            ctx.beginPath(); ctx.arc(player.x + player.w/2, player.y + player.h/2, 25, 0, Math.PI*2); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Player HP Bar
        ctx.fillStyle = '#334155'; ctx.fillRect(10, canvas.height - 10, 100, 5);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(10, canvas.height - 10, Math.max(0, 100 * (player.hp / player.maxHp)), 5);
        
        drawParticles();
    }, 30);
}

function initAuthAliens() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    
    const content = modal.firstElementChild; // Assuming modal-content wrapper
    if (!content || document.getElementById('alienContainer')) return;

    // Layout Restructuring
    const leftPanel = document.createElement('div');
    leftPanel.style.cssText = "flex: 1; display: flex; flex-direction: column; gap: 10px; width: 100%; z-index: 10;";
    while (content.firstChild) leftPanel.appendChild(content.firstChild);
    
    const rememberDiv = document.createElement('div');
    rememberDiv.style.cssText = "display: flex; align-items: center; gap: 8px; margin-top: -5px; color: #94a3b8; font-size: 0.9rem;";
    rememberDiv.innerHTML = `<input type="checkbox" id="rememberMeCheck" style="accent-color: #38bdf8; width: 16px; height: 16px; cursor: pointer;"><label for="rememberMeCheck" style="cursor: pointer; user-select: none;">Remember Me</label>`;
    const sBtn = leftPanel.querySelector('#authSubmit');
    if(sBtn) leftPanel.insertBefore(rememberDiv, sBtn);
    else leftPanel.appendChild(rememberDiv);

    const rightPanel = document.createElement('div');
    rightPanel.id = 'alienContainer';
    rightPanel.style.cssText = "display: flex; justify-content: center; align-items: center; padding-left: 10px; border-left: 1px solid #334155; min-width: 250px; overflow: hidden;";

    // Inject SVG
    rightPanel.innerHTML = `
    <svg width="100%" height="100%" viewBox="130 70 280 230" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
      <defs>
        <style>
          @keyframes alienWobble { 0% { transform: rotate(-2deg); } 100% { transform: rotate(2deg); } }
          .alien-group { animation: alienWobble 2s infinite ease-in-out alternate; transform-box: fill-box; transform-origin: center bottom; }
          .eye-group { transition: transform 0.2s; transform-box: fill-box; transform-origin: center center; }
          .alien-pupil { transition: transform 0.1s; }
          .alien-mouth { transition: d 0.2s; }
        </style>
      </defs>
      
      <g id="yellow" class="alien-group" style="animation-delay: 0s;">
        <path d="M140 280 L140 220 Q140 180 180 180 Q220 180 220 220 L220 280 Z" fill="#FFC107"/>
        <g class="eye-group"><circle cx="165" cy="225" r="10" fill="white"/><circle cx="165" cy="225" r="5" fill="black" class="alien-pupil"/></g>
        <g class="eye-group"><circle cx="195" cy="225" r="10" fill="white"/><circle cx="195" cy="225" r="5" fill="black" class="alien-pupil"/></g>
        <path d="M165 255 Q180 265 195 255" stroke="black" stroke-width="3" fill="none" stroke-linecap="round" class="alien-mouth"/>
      </g>

      <g id="green" class="alien-group" style="animation-delay: 0.5s;">
        <rect x="210" y="80" width="50" height="200" rx="25" fill="#4CAF50"/>
        <g class="eye-group"><circle cx="235" cy="110" r="7" fill="white"/><circle cx="235" cy="110" r="3" fill="black" class="alien-pupil"/></g>
        <g class="eye-group"><circle cx="225" cy="140" r="7" fill="white"/><circle cx="225" cy="140" r="3" fill="black" class="alien-pupil"/></g>
        <g class="eye-group"><circle cx="245" cy="170" r="7" fill="white"/><circle cx="245" cy="170" r="3" fill="black" class="alien-pupil"/></g>
        <path d="M225 210 Q235 218 245 210" stroke="#1B5E20" stroke-width="3" fill="none" stroke-linecap="round" class="alien-mouth"/>
      </g>

      <g id="blue" class="alien-group" style="animation-delay: 1s;">
        <path d="M265 280 L265 180 Q265 150 300 150 Q335 150 335 180 L335 280 Z" fill="#42A5F5"/>
        <g class="eye-group"><circle cx="300" cy="195" r="18" fill="white"/><circle cx="300" cy="195" r="9" fill="black" class="alien-pupil"/></g>
        <path d="M288 235 Q300 245 312 235" stroke="black" stroke-width="3" fill="none" stroke-linecap="round" class="alien-mouth"/>
      </g>

      <g id="pink" class="alien-group" style="animation-delay: 1.5s;">
        <path d="M330 280 L330 200 L365 160 L400 200 L400 280 Z" fill="#EC407A"/>
        <g class="eye-group"><ellipse cx="350" cy="215" rx="8" ry="5" fill="white" transform="rotate(-15 350 215)"/><circle cx="350" cy="215" r="3" fill="black" class="alien-pupil"/></g>
        <g class="eye-group"><ellipse cx="380" cy="215" rx="8" ry="5" fill="white" transform="rotate(15 380 215)"/><circle cx="380" cy="215" r="3" fill="black" class="alien-pupil"/></g>
        <path d="M355 250 Q365 258 375 250" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" class="alien-mouth"/>
      </g>
    </svg>
    `;

    content.style.display = 'flex';
    content.style.flexDirection = 'row';
    content.style.alignItems = 'stretch';
    content.appendChild(leftPanel);
    content.appendChild(rightPanel);

    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');
    const closeBtn = document.getElementById('closeModal');
    const pupils = rightPanel.querySelectorAll('.alien-pupil');
    const eyeGroups = rightPanel.querySelectorAll('.eye-group');

    document.addEventListener('mousemove', (e) => {
        pupils.forEach(p => {
            const rect = p.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
            const dist = Math.min(3, Math.hypot(e.clientX - cx, e.clientY - cy) / 20);
            p.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
        });
    });

    if(userInput) {
        userInput.addEventListener('focus', () => {
            eyeGroups.forEach(g => g.style.transform = 'scale(1.2)');
        });
        userInput.addEventListener('blur', () => {
            eyeGroups.forEach(g => g.style.transform = 'scale(1)');
        });
    }

    if(passInput) {
        passInput.addEventListener('focus', () => {
            eyeGroups.forEach(g => {
                g.style.transform = 'scaleY(0.1)';
                const pupil = g.querySelector('.alien-pupil');
                if(pupil) pupil.style.opacity = '0';
            });
        });
        passInput.addEventListener('blur', () => {
            eyeGroups.forEach(g => {
                g.style.transform = 'scaleY(1)';
                const pupil = g.querySelector('.alien-pupil');
                if(pupil) pupil.style.opacity = '1';
            });
        });
    }

    if(closeBtn) {
        const mouths = rightPanel.querySelectorAll('.alien-mouth');
        const originalD = Array.from(mouths).map(m => m.getAttribute('d'));
        
        closeBtn.addEventListener('mouseenter', () => {
            mouths[0].setAttribute('d', 'M165 265 Q180 255 195 265'); // Yellow
            mouths[1].setAttribute('d', 'M225 218 Q235 210 245 218'); // Green
            mouths[2].setAttribute('d', 'M288 245 Q300 235 312 245'); // Blue
            mouths[3].setAttribute('d', 'M355 258 Q365 250 375 258'); // Pink
        });
        closeBtn.addEventListener('mouseleave', () => {
            mouths.forEach((m, i) => m.setAttribute('d', originalD[i]));
        });
    }
}
initAuthAliens();

function startPongGame() {
    let paddleH = 80, paddleW = 15; // Slightly thicker neon paddles
    let originalPaddleH = 80;
    let p1Y = canvas.height/2 - paddleH/2;
    let aiY = canvas.height/2 - paddleH/2;
    let aiSpeed = 5;
    // Balls array: { x, y, dx, dy, s, isReal, isFireball }
    let balls = [{ x: canvas.width/2, y: canvas.height/2, dx: 5, dy: (Math.random() - 0.5) * 6, s: 10, isReal: true, isFireball: false, trail: [], color: '#fff' }];
    let score = 0;
    let upPressed = false;
    let downPressed = false;
    let powerUps = [];
    let paddleTimer = 0;
    let paddleBlink = false;
    let shake = 0;
    let aiError = 0;

    document.getElementById('gameScore').innerText = `Score: 0`;

    document.onkeydown = (e) => {
        if(e.key === 'ArrowUp') { upPressed = true; e.preventDefault(); }
        if(e.key === 'ArrowDown') { downPressed = true; e.preventDefault(); }
    };

    document.onkeyup = (e) => {
        if(e.key === 'ArrowUp') upPressed = false;
        if(e.key === 'ArrowDown') downPressed = false;
    };

    // Sound helper
    const playHitSound = (freq) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq/2, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    };

    gameInterval = setInterval(() => {
        // Screen Shake Decay
        if(shake > 0) shake *= 0.9;
        if(shake < 0.5) shake = 0;

        // Paddle Movement
        if (upPressed) p1Y -= 8;
        if (downPressed) p1Y += 8;
        p1Y = Math.max(0, Math.min(canvas.height - paddleH, p1Y));

        // Spawn Powerups
        if (Math.random() < 0.003) {
             powerUps.push({
                 x: Math.random() * (canvas.width - 300) + 150,
                 y: Math.random() * (canvas.height - 100) + 50,
                 type: ['fireball', 'fakeball', 'long', 'short'][Math.floor(Math.random() * 4)],
                 r: 15,
                 angle: 0
             });
        }

        // Paddle Timer Logic
        if (paddleTimer > 0) {
            paddleTimer -= 20;
            if (paddleTimer < 2000) paddleBlink = true;
            if (paddleTimer <= 0) {
                paddleH = originalPaddleH;
                paddleBlink = false;
            }
        }

        // Clear Screen with Shake
        ctx.save();
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        
        ctx.fillStyle = 'rgba(5, 11, 20, 0.4)'; // Trail effect for everything
        ctx.fillRect(-10, -10, canvas.width+20, canvas.height+20);
        
        // Draw Center Line (Neon)
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)'; 
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]); 
        ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke(); 
        ctx.setLineDash([]);

        // Draw Powerups
        powerUps.forEach((p, i) => {
            p.angle += 0.05;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.beginPath(); 
            // Draw a star or shape
            for(let j=0; j<5; j++) {
                ctx.lineTo(Math.cos(j*Math.PI*0.4)*p.r, Math.sin(j*Math.PI*0.4)*p.r);
                ctx.lineTo(Math.cos((j*Math.PI*0.4)+(Math.PI*0.2))*(p.r/2), Math.sin((j*Math.PI*0.4)+(Math.PI*0.2))*(p.r/2));
            }
            ctx.closePath();
            
            if (p.type === 'fireball') { ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; }
            else if (p.type === 'fakeball') { ctx.fillStyle = '#94a3b8'; ctx.shadowColor = '#94a3b8'; }
            else if (p.type === 'long') { ctx.fillStyle = '#22c55e'; ctx.shadowColor = '#22c55e'; }
            else if (p.type === 'short') { ctx.fillStyle = '#eab308'; ctx.shadowColor = '#eab308'; }
            
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
            
            // Text
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px "Orbitron"'; ctx.textAlign = 'center';
            ctx.fillText(p.type === 'fakeball' ? '?' : p.type[0].toUpperCase(), p.x, p.y + 40);
        });

        // Process Balls
        for (let i = balls.length - 1; i >= 0; i--) {
            let b = balls[i];
            
            // Trail Logic
            b.trail.push({x: b.x, y: b.y});
            if(b.trail.length > 10) b.trail.shift();

            // Speed Increase
            if (Math.abs(b.dx) < 18 && !b.isFireball) {
                b.dx *= 1.0005; b.dy *= 1.0005;
            }

            // Move
            b.x += b.dx; b.y += b.dy;

            // Wall Bounce
            if (b.y <= b.s || b.y >= canvas.height - b.s) {
                b.dy *= -1;
                playHitSound(200);
                shake = 5;
                createParticles(b.x, b.y, b.color);
            }

            // Paddle Collision (Player) - Enhanced for high speed
            // Improved collision box
            if (b.dx < 0 && b.x - b.s < paddleW && b.y > p1Y && b.y < p1Y + paddleH) {
                b.dx = Math.abs(b.dx);
                // Spin Physics: Change dy based on hit position
                let hitPoint = b.y - (p1Y + paddleH/2);
                b.dy = hitPoint * 0.3; 
                b.x = paddleW + b.s + 1; // Prevent sticking
                
                score += 10; 
                document.getElementById('gameScore').innerText = `Score: ${score}`;
                playHitSound(400);
                shake = 8;
                createParticles(b.x, b.y, '#00f3ff');
                
                // Speed up slightly on hit
                b.dx *= 1.05;

                // AI makes a new estimation (with potential error) when player hits
                aiError = (Math.random() - 0.5) * 120; 
            }
            
            // AI Collision
            if (b.dx > 0 && b.x + b.s > canvas.width - paddleW && b.y > aiY && b.y < aiY + paddleH) {
                b.dx = -Math.abs(b.dx);
                let hitPoint = b.y - (aiY + paddleH/2);
                b.dy = hitPoint * 0.3;
                b.x = canvas.width - paddleW - b.s - 1;
                playHitSound(300);
                createParticles(b.x, b.y, '#bc13fe');
            }

            // Powerup Collision
            for (let j = powerUps.length - 1; j >= 0; j--) {
                let p = powerUps[j];
                let dist = Math.sqrt((b.x - p.x)**2 + (b.y - p.y)**2);
                if (dist < p.r + b.s) {
                    playHitSound(600);
                    createParticles(p.x, p.y, '#fff');
                    if (p.type === 'fireball') {
                        b.isFireball = true;
                        b.color = '#ef4444';
                        b.dx *= 1.5; b.dy *= 1.5;
                        setTimeout(() => { if(b) { b.isFireball = false; b.color = '#fff'; b.dx /= 1.5; b.dy /= 1.5; } }, 5000);
                    } else if (p.type === 'fakeball') {
                        for(let k=0; k<2; k++) {
                            balls.push({
                                x: b.x, y: b.y,
                                dx: b.dx * (0.8 + Math.random()*0.4), 
                                dy: b.dy + (Math.random()*4 - 2),
                                s: b.s, isReal: false, isFireball: false, trail: [], color: '#94a3b8'
                            });
                        }
                    } else if (p.type === 'long') {
                        paddleH = originalPaddleH * 1.5; paddleTimer = 10000;
                    } else if (p.type === 'short') {
                        paddleH = originalPaddleH * 0.5; paddleTimer = 10000;
                    }
                    powerUps.splice(j, 1);
                }
            }

            // Out of bounds
            if (b.x < -50) {
                if (b.isReal) { endGame(score); return; }
                else { balls.splice(i, 1); continue; }
            }
            if (b.x > canvas.width + 50) {
                if (b.isReal) { 
                    // AI Missed - Reset
                    b.x = canvas.width/2; b.y = canvas.height/2; 
                    b.dx = -6; b.dy = (Math.random()-0.5)*6; 
                    b.isFireball = false; b.color = '#fff';
                    score += 100; // Bonus for scoring on AI
                    document.getElementById('gameScore').innerText = `Score: ${score}`;
                    playHitSound(800);
                    shake = 15;
                } else { 
                    balls.splice(i, 1); continue; 
                }
            }

            // Draw Trail
            ctx.beginPath();
            for(let k=0; k<b.trail.length; k++) {
                let point = b.trail[k];
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = b.color;
            ctx.lineWidth = b.s;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Draw Ball
            ctx.shadowBlur = b.isFireball ? 30 : 15;
            ctx.shadowColor = b.color;
            ctx.fillStyle = b.color;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.s, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // AI Move (Predictive)
        let targetBall = balls.find(b => b.isReal && b.dx > 0) || balls[0];
        let targetY = canvas.height / 2;
        
        if (targetBall && targetBall.dx > 0) {
            // Simple prediction: calculate y at x = canvas.width
            let timeToHit = (canvas.width - paddleW - targetBall.x) / targetBall.dx;
            let predictedY = targetBall.y + targetBall.dy * timeToHit;
            
            // Handle bounces (approximate)
            while(predictedY < 0 || predictedY > canvas.height) {
                if(predictedY < 0) predictedY = -predictedY;
                if(predictedY > canvas.height) predictedY = 2*canvas.height - predictedY;
            }
            targetY = predictedY - paddleH/2;
            
            // Apply the calculated error
            targetY += aiError;
        }

        // Smooth AI movement
        let dy = targetY - aiY;
        if (Math.abs(dy) > aiSpeed) {
            aiY += Math.sign(dy) * (aiSpeed + (score/500)); // AI gets faster
        } else {
            aiY = targetY;
        }
        aiY = Math.max(0, Math.min(canvas.height - paddleH, aiY));

        // Draw Paddles
        // Player
        ctx.shadowBlur = 20; ctx.shadowColor = "#00f3ff";
        ctx.fillStyle = (paddleBlink && Math.floor(Date.now() / 100) % 2 === 0) ? '#ef4444' : '#00f3ff';
        ctx.fillRect(0, p1Y, paddleW, paddleH); 
        
        // AI
        ctx.shadowColor = "#bc13fe";
        ctx.fillStyle = '#bc13fe'; 
        ctx.fillRect(canvas.width - paddleW, aiY, paddleW, paddleH);
        
        ctx.shadowBlur = 0;
        
        drawParticles();
        ctx.restore(); // Restore transform (shake)
    }, 30);
}

function initHomePageAnimation() {
    const canvas = document.createElement('canvas');
    canvas.id = 'homeBgCanvas';
    canvas.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; background: #020617; transition: opacity 1s;";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let shapes = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const colors = ['#f87171', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#c084fc'];

    for(let i=0; i<50; i++) {
        shapes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 20 + 5,
            dx: (Math.random() - 0.5) * 1,
            dy: (Math.random() - 0.5) * 1,
            rot: Math.random() * Math.PI * 2,
            dRot: (Math.random() - 0.5) * 0.02,
            type: Math.floor(Math.random() * 3), // 0: square, 1: triangle, 2: circle
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    function animate() {
        if(!document.getElementById('homeBgCanvas')) return;
        
        ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
        ctx.fillRect(0, 0, width, height);

        shapes.forEach(s => {
            s.x += s.dx;
            s.y += s.dy;
            s.rot += s.dRot;

            if(s.x < -50) s.x = width + 50;
            if(s.x > width + 50) s.x = -50;
            if(s.y < -50) s.y = height + 50;
            if(s.y > height + 50) s.y = -50;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.fillStyle = s.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = s.color;
            
            ctx.beginPath();
            if(s.type === 0) {
                ctx.fillRect(-s.size/2, -s.size/2, s.size, s.size);
            } else if(s.type === 1) {
                ctx.moveTo(0, -s.size);
                ctx.lineTo(s.size, s.size);
                ctx.lineTo(-s.size, s.size);
                ctx.fill();
            } else {
                ctx.arc(0, 0, s.size/2, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

function initUfoController() {
    const ufo = document.querySelector('.ufo-container');
    if (!ufo) return;
    
    // Add beam
    if (!ufo.querySelector('.ufo-beam')) {
        const beam = document.createElement('div');
        beam.className = 'ufo-beam';
        ufo.querySelector('.ufo-ship').appendChild(beam);
    }
    const beam = ufo.querySelector('.ufo-beam');
    
    let isAbducting = false;
    
    function wander() {
        if (isAbducting) return;
        // Random position within viewport
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        const rot = (Math.random() - 0.5) * 30;
        const scale = 0.8 + Math.random() * 0.4;
        
        ufo.style.transition = 'transform 4s ease-in-out';
        ufo.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
        
        setTimeout(wander, 4000 + Math.random() * 2000);
    }
    
    function getTarget() {
        // Try to find a text node in visible elements
        const elements = document.querySelectorAll('h1, h2, p, button, a, span');
        const visible = Array.from(elements).filter(el => {
            const r = el.getBoundingClientRect();
            return r.top > 0 && r.bottom < window.innerHeight && r.left > 0 && r.right < window.innerWidth && el.offsetParent !== null;
        });
        
        if (visible.length === 0) return null;
        
        // Try 10 times to find a valid text node
        for(let i=0; i<10; i++) {
            const el = visible[Math.floor(Math.random() * visible.length)];
            // If it's already a target span
            if (el.classList.contains('abduct-target') || (el.tagName === 'SPAN' && el.parentElement.classList.contains('floating-text'))) {
                return el;
            }
            
            // Find text nodes
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            let nodes = [];
            let n;
            while(n = walker.nextNode()) {
                if (n.textContent.trim().length > 0) nodes.push(n);
            }
            
            if (nodes.length > 0) {
                const node = nodes[Math.floor(Math.random() * nodes.length)];
                const text = node.textContent;
                const charIdx = Math.floor(Math.random() * text.length);
                if (text[charIdx].trim() === '') continue;
                
                // Wrap it
                const span = document.createElement('span');
                span.textContent = text[charIdx];
                span.className = 'abduct-target';
                span.style.display = 'inline-block';
                span.style.transition = 'transform 0.5s, opacity 0.5s';
                
                const before = document.createTextNode(text.substring(0, charIdx));
                const after = document.createTextNode(text.substring(charIdx + 1));
                
                node.parentNode.insertBefore(before, node);
                node.parentNode.insertBefore(span, node);
                node.parentNode.insertBefore(after, node);
                node.parentNode.removeChild(node);
                
                return span;
            }
        }
        return null;
    }
    
    function abduct() {
        if (isAbducting) return;
        const target = getTarget();
        if (!target) return;
        
        isAbducting = true;
        
        const rect = target.getBoundingClientRect();
        // UFO center is roughly 30px offset from left
        const tx = rect.left + rect.width/2 - 30; 
        const ty = rect.top - 60; // Hover above
        
        ufo.style.transition = 'transform 1.5s ease-in-out';
        ufo.style.transform = `translate(${tx}px, ${ty}px) scale(1)`;
        
        setTimeout(() => {
            // Beam down
            beam.style.height = '60px';
            beam.style.opacity = '1';
            
            setTimeout(() => {
                // Lift letter
                target.style.transform = 'translateY(-40px) scale(0)';
                target.style.opacity = '0';
                
                setTimeout(() => {
                    // Beam up
                    beam.style.height = '0';
                    beam.style.opacity = '0';
                    
                    setTimeout(() => {
                        isAbducting = false;
                        wander();
                        
                        // Respawn
                        setTimeout(() => {
                            target.style.transform = '';
                            target.style.opacity = '1';
                        }, 2000);
                    }, 500);
                }, 500);
            }, 500);
        }, 1500);
    }
    
    wander();
    setInterval(() => {
        if (!isAbducting && !document.hidden && Math.random() < 0.4) abduct();
        if (!isAbducting && !document.hidden && Math.random() < 0.4 && ufo.style.display !== 'none') abduct();
    }, 3500);
}

/* --- AUDIO SYSTEM --- */
let audioCtx = null;
let bgmInterval = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.log("Audio resume failed", e));
    }
}

function playMusic() {
    const data = getArcadeData();
    const settings = data.settings || { music: true, sfx: true };
    if (!settings.music || !currentUser) return; // Only play if logged in

    initAudio();
    if (bgmInterval) return; // Already playing

    let noteIdx = 0;
    // Simple retro ambient loop
    const melody = [
        {f: 261.63, d: 0.5}, {f: 329.63, d: 0.5}, {f: 392.00, d: 0.5}, {f: 523.25, d: 0.5},
        {f: 392.00, d: 0.5}, {f: 329.63, d: 0.5} 
    ]; 

    const playNextNote = () => {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            return;
        }
        const note = melody[noteIdx % melody.length];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = note.f;
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1); // Soft attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.d); // Decay
        
        osc.start(now);
        osc.stop(now + note.d);
        
        noteIdx++;
    };

    playNextNote();
    bgmInterval = setInterval(playNextNote, 500);
}

function stopMusic() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function startBreakoutGame() {
    // Setup
    let paddle = { x: canvas.width / 2 - 60, w: 120, h: 15, color: '#38bdf8' };
    let balls = [{ x: canvas.width/2, y: canvas.height-40, dx: 0, dy: 0, r: 8, active: false, type: 'normal' }];
    let bricks = [];
    let powerUps = [];
    let score = 0;
    let level = 1;
    let lives = 3;
    let shake = 0;
    let combo = 0;
    
    // Input state
    let leftPressed = false;
    let rightPressed = false;
    let mouseX = null;

    // Audio helper (reusing existing context if available)
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'brick') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(600 + Math.random()*200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'powerup') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    };

    // Level Generator
    function createLevel(lvl) {
        bricks = [];
        const rows = 5 + Math.min(5, lvl);
        const cols = 8;
        const padding = 10;
        const offsetTop = 50;
        const offsetLeft = 35;
        const brickW = (canvas.width - (offsetLeft * 2) - (padding * (cols - 1))) / cols;
        const brickH = 20;

        for(let c=0; c<cols; c++) {
            for(let r=0; r<rows; r++) {
                // Patterns
                let active = true;
                if (lvl % 2 === 0 && (c + r) % 2 === 0) active = false; // Checkerboard
                if (lvl > 2 && r > 2 && c > 2 && c < cols-3) active = false; // Hole in middle

                if (active) {
                    let type = 'normal';
                    let hp = 1;
                    if (Math.random() < 0.1 * lvl) { type = 'hard'; hp = 2; }
                    if (Math.random() < 0.05) type = 'explosive';

                    let color = `hsl(${c * 40 + r * 10}, 70%, 50%)`;
                    if (type === 'hard') color = '#94a3b8'; // Silver
                    if (type === 'explosive') color = '#ef4444'; // Red

                    bricks.push({ 
                        x: offsetLeft + c*(brickW+padding), 
                        y: offsetTop + r*(brickH+padding), 
                        w: brickW, h: brickH, 
                        status: 1, 
                        type: type, 
                        hp: hp,
                        color: color 
                    });
                }
            }
        }
    }

    createLevel(level);

    // Controls
    document.onkeydown = (e) => {
        if(e.key === 'ArrowLeft') leftPressed = true;
        if(e.key === 'ArrowRight') rightPressed = true;
        if(e.code === 'Space') launchBall();
    };
    document.onkeyup = (e) => {
        if(e.key === 'ArrowLeft') leftPressed = false;
        if(e.key === 'ArrowRight') rightPressed = false;
    };
    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouseX = (e.clientX - rect.left) * scaleX;
    };
    canvas.onmousedown = () => launchBall();

    function launchBall() {
        balls.forEach(b => {
            if (!b.active) {
                b.active = true;
                b.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                b.dy = -6;
            }
        });
    }

    // Game Loop
    gameInterval = setInterval(() => {
        // Screen Shake Decay
        if(shake > 0) shake *= 0.9;
        if(shake < 0.5) shake = 0;

        // Clear
        ctx.save();
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'; // Trail effect
        ctx.fillRect(-10, -10, canvas.width+20, canvas.height+20);

        // Paddle Movement
        if (mouseX !== null) {
            paddle.x = mouseX - paddle.w / 2;
        } else {
            if (leftPressed) paddle.x -= 7;
            if (rightPressed) paddle.x += 7;
        }
        // Clamp
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;

        // Draw Paddle
        ctx.shadowBlur = 20; ctx.shadowColor = paddle.color;
        ctx.fillStyle = paddle.color;
        ctx.fillRect(paddle.x, canvas.height - paddle.h - 10, paddle.w, paddle.h);
        ctx.shadowBlur = 0;

        // Ball Logic
        let activeBalls = 0;
        for (let i = balls.length - 1; i >= 0; i--) {
            let b = balls[i];
            
            if (!b.active) {
                b.x = paddle.x + paddle.w / 2;
                b.y = canvas.height - paddle.h - 10 - b.r;
                
                // Draw inactive ball
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
                ctx.fillStyle = '#fff'; ctx.fill();
                continue;
            }

            activeBalls++;
            b.x += b.dx;
            b.y += b.dy;

            // Wall Collisions
            if (b.x + b.r > canvas.width || b.x - b.r < 0) {
                b.dx = -b.dx;
                playSound('hit');
            }
            if (b.y - b.r < 0) {
                b.dy = -b.dy;
                playSound('hit');
            }
            else if (b.y + b.r > canvas.height) {
                balls.splice(i, 1); // Remove ball
                combo = 0;
                continue;
            }

            // Paddle Collision
            if (b.y + b.r > canvas.height - paddle.h - 10 &&
                b.y - b.r < canvas.height - 10 &&
                b.x > paddle.x && b.x < paddle.x + paddle.w) {
                
                // Calculate angle
                let hitPoint = b.x - (paddle.x + paddle.w/2);
                hitPoint = hitPoint / (paddle.w/2); // -1 to 1
                
                let angle = hitPoint * (Math.PI / 3); // Max 60 degrees
                let speed = Math.sqrt(b.dx*b.dx + b.dy*b.dy);
                // Increase speed slightly
                speed = Math.min(15, speed * 1.02);

                b.dx = speed * Math.sin(angle);
                b.dy = -speed * Math.cos(angle);
                
                playSound('hit');
                shake = 3;
                combo = 0; // Reset combo on paddle hit
                
                // Visual hit effect
                createParticles(b.x, canvas.height - paddle.h - 10, paddle.color);
            }

            // Brick Collision
            for (let j = 0; j < bricks.length; j++) {
                let br = bricks[j];
                if (br.status === 1) {
                    if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + br.h) {
                        if (b.type !== 'fire') {
                            b.dy = -b.dy;
                        }

                        br.hp--;
                        shake = 2;
                        playSound('brick');
                        
                        if (br.hp <= 0) {
                            br.status = 0;
                            score += 10 * (combo + 1);
                            combo++;
                            createParticles(br.x + br.w/2, br.y + br.h/2, br.color);
                            
                            // Explosive
                            if (br.type === 'explosive') {
                                // Destroy neighbors
                                bricks.forEach(nbr => {
                                    if (nbr.status === 1 && Math.abs(nbr.x - br.x) <= br.w + 15 && Math.abs(nbr.y - br.y) <= br.h + 15) {
                                        nbr.hp = 0; nbr.status = 0;
                                        score += 10;
                                        createParticles(nbr.x + nbr.w/2, nbr.y + nbr.h/2, '#fca5a5');
                                    }
                                });
                                shake = 10;
                            }

                            // Powerup Drop
                            if (Math.random() < 0.15) {
                                let types = ['wide', 'multi', 'fire'];
                                powerUps.push({
                                    x: br.x + br.w/2,
                                    y: br.y + br.h/2,
                                    type: types[Math.floor(Math.random() * types.length)],
                                    dy: 3
                                });
                            }
                        } else {
                            // Hit but not destroyed (Hard brick)
                            createParticles(br.x + br.w/2, br.y + br.h/2, '#fff');
                        }
                        break; // Only hit one brick per frame per ball usually
                    }
                }
            }

            // Draw Ball
            ctx.shadowBlur = b.type === 'fire' ? 20 : 10;
            ctx.shadowColor = b.type === 'fire' ? '#ef4444' : '#fff';
            ctx.fillStyle = b.type === 'fire' ? '#ef4444' : '#fff';
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Powerups Logic
        for (let i = powerUps.length - 1; i >= 0; i--) {
            let p = powerUps[i];
            p.y += p.dy;
            
            // Draw
            ctx.fillStyle = p.type === 'wide' ? '#22c55e' : (p.type === 'multi' ? '#eab308' : '#ef4444');
            ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
            ctx.fillText(p.type[0].toUpperCase(), p.x, p.y + 4);

            // Collision with paddle
            if (p.y > canvas.height - paddle.h - 20 && p.y < canvas.height &&
                p.x > paddle.x && p.x < paddle.x + paddle.w) {
                
                playSound('powerup');
                if (p.type === 'wide') {
                    paddle.w = Math.min(200, paddle.w + 40);
                    setTimeout(() => paddle.w = 120, 10000);
                } else if (p.type === 'multi') {
                    // Spawn 2 more balls at current ball position (or paddle if none active)
                    let refBall = balls.find(b => b.active) || { x: paddle.x + paddle.w/2, y: canvas.height - 40 };
                    balls.push({ x: refBall.x, y: refBall.y, dx: -3, dy: -5, r: 8, active: true, type: 'normal' });
                    balls.push({ x: refBall.x, y: refBall.y, dx: 3, dy: -5, r: 8, active: true, type: 'normal' });
                } else if (p.type === 'fire') {
                    balls.forEach(b => b.type = 'fire');
                    setTimeout(() => balls.forEach(b => b.type = 'normal'), 5000);
                }
                powerUps.splice(i, 1);
            } else if (p.y > canvas.height) {
                powerUps.splice(i, 1);
            }
        }

        // Draw Bricks
        let activeBricks = 0;
        bricks.forEach(b => {
            if (b.status === 1) {
                activeBricks++;
                ctx.shadowBlur = 10; ctx.shadowColor = b.color;
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, b.w, b.h);
                
                // Shine effect
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(b.x, b.y, b.w, b.h/2);
                
                if (b.type === 'hard') {
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(b.x+2, b.y+2, b.w-4, b.h-4);
                }
                ctx.shadowBlur = 0;
            }
        });

        drawParticles();
        ctx.restore();

        // UI
        document.getElementById('gameScore').innerText = `Score: ${score} | Lives: ${lives} | Level: ${level}`;

        // Level Clear
        if (activeBricks === 0) {
            level++;
            balls.forEach(b => { b.active = false; b.dx = 0; b.dy = 0; });
            balls = [balls[0]]; // Reset to 1 ball
            createLevel(level);
            playSound('powerup'); // Victory sound placeholder
        }

        // Game Over / Life Loss
        if (balls.length === 0) {
            lives--;
            if (lives > 0) {
                balls.push({ x: canvas.width/2, y: canvas.height-40, dx: 0, dy: 0, r: 8, active: false, type: 'normal' });
            } else {
                endGame(score);
            }
        }
        
    }, 20);
}

function startFlappyGame() {
    // Setup
    let bird = { 
        x: 80, y: canvas.height / 2, 
        w: 30, h: 30, 
        dy: 0, gravity: 0.6, jump: -8, 
        rotation: 0, 
        trail: [],
        color: '#fbbf24'
    };
    let pipes = [];
    let score = 0;
    let frame = 0;
    let gameSpeed = 3;
    let isGameOver = false;
    let shake = 0;
    let bgOffset = 0;

    document.getElementById('gameScore').innerText = `Score: 0`;

    // Audio Helper
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'jump') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(500, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'score') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(800, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'crash') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    };

    // Input
    const jump = () => {
        if (isGameOver) return;
        bird.dy = bird.jump;
        playSound('jump');
        // Thruster particles
        for(let i=0; i<5; i++) {
            particles.push({
                x: bird.x - 10, 
                y: bird.y + (Math.random()-0.5)*10,
                vx: -2 - Math.random(),
                vy: (Math.random()-0.5)*2,
                life: 1.0,
                color: '#fff'
            });
        }
    };

    document.onkeydown = (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            jump();
        }
    };
    canvas.onmousedown = (e) => {
        e.preventDefault();
        jump();
    };

    gameInterval = setInterval(() => {
        // Screen Shake Decay
        if (shake > 0) shake *= 0.9;
        if (shake < 0.5) shake = 0;

        // Clear & Background
        ctx.save();
        if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Moving Grid/Stars Background
        bgOffset -= gameSpeed * 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            let x = (bgOffset + i * 100) % canvas.width;
            if (x < 0) x += canvas.width;
            let y = (i * 439) % canvas.height;
            ctx.fillRect(x, y, 2, 2);
        }

        // Update Bird
        bird.dy += bird.gravity;
        bird.y += bird.dy;
        bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.dy * 0.1)));

        // Trail Logic
        bird.trail.push({x: bird.x, y: bird.y, rot: bird.rotation});
        if (bird.trail.length > 15) bird.trail.shift();

        // Draw Trail
        ctx.lineWidth = 2;
        for (let i = 0; i < bird.trail.length - 1; i++) {
            let p1 = bird.trail[i];
            let p2 = bird.trail[i+1];
            let alpha = i / bird.trail.length;
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(p1.x - (bird.trail.length - i) * gameSpeed, p1.y);
            ctx.lineTo(p2.x - (bird.trail.length - (i+1)) * gameSpeed, p2.y);
            ctx.stroke();
        }

        // Draw Bird
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation);

        // Draw Spaceship (matching CSS .g-ship)
        // Engine
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-12, -3); ctx.lineTo(-18, 0); ctx.lineTo(-12, 3);
        ctx.fill();

        // Body
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        // Rounded rect approximation for canvas
        ctx.roundRect(-12, -7, 24, 14, [4, 12, 12, 4]);
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.roundRect(0, -4, 6, 4, 1);
        ctx.fill();
        
        ctx.restore();
        ctx.shadowBlur = 0;

        // Pipe Spawning
        if (frame % Math.floor(2000 / (gameSpeed * 10)) === 0) {
            let gap = Math.max(120, 180 - score * 2);
            let minTop = 50;
            let maxTop = canvas.height - gap - 50;
            let topH = Math.random() * (maxTop - minTop) + minTop;
            
            let moving = score >= 10;
            let moveSpeed = moving ? (Math.random() + 1) * (Math.random() < 0.5 ? 1 : -1) : 0;

            pipes.push({
                x: canvas.width,
                w: 60,
                topH: topH,
                gap: gap,
                passed: false,
                moving: moving,
                moveSpeed: moveSpeed
            });
        }

        // Update Pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            let p = pipes[i];
            p.x -= gameSpeed;

            if (p.moving) {
                p.topH += p.moveSpeed;
                if (p.topH < 30 || p.topH > canvas.height - p.gap - 30) p.moveSpeed *= -1;
            }

            // Draw Pipe
            ctx.fillStyle = '#475569';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            
            // Top
            ctx.beginPath();
            ctx.roundRect(p.x, 0, p.w, p.topH, [0, 0, 4, 4]);
            ctx.fill(); ctx.stroke();
            
            // Bottom
            ctx.beginPath();
            ctx.roundRect(p.x, p.topH + p.gap, p.w, canvas.height - (p.topH + p.gap), [4, 4, 0, 0]);
            ctx.fill(); ctx.stroke();

            // Collision
            let bx = bird.x;
            let by = bird.y;
            let br = 10; // Hitbox radius

            // AABB collision for pipes
            if (bx + br > p.x && bx - br < p.x + p.w) {
                if (by - br < p.topH || by + br > p.topH + p.gap) {
                    gameOver();
                }
            }

            // Score
            if (!p.passed && p.x + p.w < bird.x) {
                score++;
                p.passed = true;
                document.getElementById('gameScore').innerText = `Score: ${score}`;
                playSound('score');
                if (score % 5 === 0) gameSpeed += 0.5;
            }

            if (p.x + p.w < 0) pipes.splice(i, 1);
        }

        // Bounds Collision
        if (bird.y + 10 > canvas.height || bird.y - 10 < 0) {
            gameOver();
        }

        drawParticles();
        ctx.restore();
        frame++;

    }, 20);

    function gameOver() {
        if (isGameOver) return;
        isGameOver = true;
        playSound('crash');
        shake = 20;
        createParticles(bird.x, bird.y, '#fbbf24');
        setTimeout(() => endGame(score), 500);
    }
}

function startDodgeGame() {
    let player = { x: canvas.width/2, y: canvas.height - 80, w: 30, h: 40, dx: 0, speed: 6, tilt: 0, shielded: false };
    let enemies = [];
    let powerUps = [];
    let score = 0;
    let gameSpeed = 1;
    let shake = 0;
    let leftPressed = false;
    let rightPressed = false;

    document.getElementById('gameScore').innerText = `Score: 0`;
    
    // Audio
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'powerup') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(1200, now+0.2);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        } else if (type === 'explode') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now+0.4);
            gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.4);
            osc.start(now); osc.stop(now+0.4);
        }
    };

    document.onkeydown = (e) => {
        if(e.key === 'ArrowLeft') leftPressed = true;
        if(e.key === 'ArrowRight') rightPressed = true;
    };
    document.onkeyup = (e) => {
        if(e.key === 'ArrowLeft') leftPressed = false;
        if(e.key === 'ArrowRight') rightPressed = false;
    };
    
    gameInterval = setInterval(() => {
        // Shake
        if(shake > 0) shake *= 0.9;
        if(shake < 0.5) shake = 0;
        ctx.save();
        ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);

        // Clear
        ctx.fillStyle = 'rgba(15, 23, 42, 0.5)'; ctx.fillRect(-10,-10,canvas.width+20,canvas.height+20);

        // Player Move
        if(leftPressed) { player.dx = -player.speed; player.tilt = -0.3; }
        else if(rightPressed) { player.dx = player.speed; player.tilt = 0.3; }
        else { player.dx *= 0.8; player.tilt *= 0.8; }
        
        player.x += player.dx;
        if(player.x < 0) player.x = 0;
        if(player.x > canvas.width - player.w) player.x = canvas.width - player.w;

        // Draw Player (Ship)
        ctx.save();
        ctx.translate(player.x + player.w/2, player.y + player.h/2);
        ctx.rotate(player.tilt);
        
        // Engine Trail
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.moveTo(-5, 15); ctx.lineTo(0, 15 + Math.random()*20); ctx.lineTo(5, 15); ctx.fill();
        
        // Ship Body
        ctx.shadowBlur = 15; ctx.shadowColor = player.shielded ? '#22c55e' : '#38bdf8';
        ctx.fillStyle = player.shielded ? '#22c55e' : '#38bdf8';
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(15, 20); ctx.lineTo(0, 15); ctx.lineTo(-15, 20); ctx.closePath(); ctx.fill();
        
        // Shield Visual
        if(player.shielded) {
            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI*2); ctx.stroke();
        }
        ctx.restore();
        ctx.shadowBlur = 0;

        // Spawn Enemies
        if(Math.random() < 0.05 + (score * 0.0005)) {
            let type = Math.random();
            let enemy = { 
                x: Math.random() * canvas.width, 
                y: -30, 
                s: (Math.random() * 3 + 2) * gameSpeed, 
                r: Math.random() * 15 + 10,
                rot: 0,
                vRot: (Math.random()-0.5)*0.2,
                type: type > 0.9 ? 'homing' : 'normal'
            };
            enemies.push(enemy);
        }

        // Spawn Powerups
        if(Math.random() < 0.002) {
            powerUps.push({ x: Math.random() * canvas.width, y: -20, type: Math.random() > 0.5 ? 'shield' : 'nuke' });
        }
        
        enemies.forEach((e, i) => {
            e.y += e.s;
            e.rot += e.vRot;
            
            if (e.type === 'homing') {
                if(e.x < player.x) e.x += 1; else e.x -= 1;
                ctx.fillStyle = '#a855f7'; ctx.shadowColor = '#a855f7';
            } else {
                ctx.fillStyle = '#f87171'; ctx.shadowColor = '#f87171';
            }

            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate(e.rot);
            ctx.shadowBlur = 10; 
            // Jagged Meteor Shape
            ctx.beginPath(); 
            for(let j=0; j<6; j++) {
                let angle = (j/6)*Math.PI*2;
                let r = e.r * (0.8 + Math.random()*0.4);
                ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
            }
            ctx.fill();
            ctx.restore();
            ctx.shadowBlur = 0;

            if(e.y > canvas.height) { 
                enemies.splice(i, 1); 
                score++; 
                if(score % 20 === 0) gameSpeed += 0.1;
                document.getElementById('gameScore').innerText = `Score: ${score}`; 
            }
            
            // Collision
            let dist = Math.hypot(e.x - (player.x + player.w/2), e.y - (player.y + player.h/2));
            if(dist < e.r + 15) {
                if(player.shielded) {
                    player.shielded = false;
                    enemies.splice(i, 1);
                    createParticles(e.x, e.y, '#f87171');
                    playSound('explode');
                    shake = 10;
                } else {
                    playSound('explode');
                    createParticles(player.x, player.y, '#38bdf8');
                    endGame(score);
                }
            }
        });

        powerUps.forEach((p, i) => {
            p.y += 3;
            ctx.fillStyle = p.type === 'shield' ? '#22c55e' : '#eab308';
            ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
            ctx.fillText(p.type === 'shield' ? 'S' : 'N', p.x, p.y+4);

            if(Math.hypot(p.x - (player.x+player.w/2), p.y - (player.y+player.h/2)) < 25) {
                playSound('powerup');
                if(p.type === 'shield') player.shielded = true;
                if(p.type === 'nuke') {
                    enemies.forEach(e => createParticles(e.x, e.y, '#f87171'));
                    score += enemies.length * 5;
                    enemies = [];
                    shake = 20;
                    playSound('explode');
                }
                powerUps.splice(i, 1);
            }
        });

        drawParticles();
        ctx.restore();
    }, 20);
}

function startClickerGame() {
    let targets = [];
    let score = 0;
    let timeLeft = 30; // 30 seconds
    let combo = 0;
    let lastClickTime = 0;
    let floatingTexts = [];

    document.getElementById('gameScore').innerText = `Score: 0 | Time: ${timeLeft}`;
    
    // Audio
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'hit') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800 + (combo*50), now); osc.frequency.exponentialRampToValueAtTime(0.01, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'bad') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now+0.3);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
            osc.start(now); osc.stop(now+0.3);
        }
    };

    function spawnTarget() {
        let r = Math.random();
        let type = 'normal';
        if(r < 0.1) type = 'golden';
        else if(r < 0.3) type = 'bomb';
        
        targets.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            r: 30,
            maxR: 30,
            life: 1.0,
            type: type
        });
    }

    // Initial spawn
    for(let i=0; i<3; i++) spawnTarget();

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        
        let hit = false;
        for(let i = targets.length - 1; i >= 0; i--) {
            let t = targets[i];
            let dist = Math.hypot(clickX - t.x, clickY - t.y);
            
            if(dist < t.r) {
                hit = true;
                if(t.type === 'bomb') {
                    score = Math.max(0, score - 10);
                    combo = 0;
                    playSound('bad');
                    createParticles(t.x, t.y, '#ef4444');
                    floatingTexts.push({x: t.x, y: t.y, text: "-10", color: "#ef4444", life: 1.0});
                } else {
                    let pts = (t.type === 'golden' ? 5 : 1) * (1 + Math.floor(combo/5));
                    score += pts;
                    combo++;
                    playSound('hit');
                    createParticles(t.x, t.y, t.type === 'golden' ? '#fbbf24' : '#f472b6');
                    floatingTexts.push({x: t.x, y: t.y, text: `+${pts}`, color: "#fff", life: 1.0});
                }
                targets.splice(i, 1);
                spawnTarget();
                if(Math.random() < 0.3) spawnTarget(); // Chance for extra target
                break; // Only hit top target
            }
        }
        
        if(!hit) {
            combo = 0;
        }
    };
    
    gameInterval = setInterval(() => {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
        
        // Update & Draw Targets
        for(let i = targets.length - 1; i >= 0; i--) {
            let t = targets[i];
            t.life -= 0.01 + (score * 0.0001); // Shrink faster as score goes up
            t.r = t.maxR * t.life;
            
            if(t.life <= 0) {
                targets.splice(i, 1);
                spawnTarget();
                if(t.type !== 'bomb') combo = 0; // Missed a target
                continue;
            }

            let color = t.type === 'bomb' ? '#ef4444' : (t.type === 'golden' ? '#fbbf24' : '#f472b6');
            
            ctx.shadowBlur = 15; ctx.shadowColor = color;
            ctx.strokeStyle = color; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.stroke();
            
            ctx.fillStyle = color; 
            ctx.beginPath(); ctx.arc(t.x, t.y, t.r * 0.5, 0, Math.PI*2); ctx.fill();
            
            if(t.type === 'bomb') {
                ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('!', t.x, t.y);
            }
            ctx.shadowBlur = 0;
        }

        // Floating Text
        for(let i = floatingTexts.length - 1; i >= 0; i--) {
            let ft = floatingTexts[i];
            ft.y -= 1; ft.life -= 0.02;
            ctx.globalAlpha = Math.max(0, ft.life);
            ctx.fillStyle = ft.color; ctx.font = 'bold 20px "Orbitron"'; ctx.fillText(ft.text, ft.x, ft.y);
            ctx.globalAlpha = 1.0;
            if(ft.life <= 0) floatingTexts.splice(i, 1);
        }

        drawParticles();
        
        timeLeft -= 0.05;
        document.getElementById('gameScore').innerText = `Score: ${score} | Combo: x${combo} | Time: ${Math.ceil(timeLeft)}`;
        if(timeLeft <= 0) {
            canvas.onclick = null;
            endGame(score);
        }
    }, 30);
}

function startMemoryGame() {
    let cols = 4, rows = 4;
    let w = canvas.width / cols, h = canvas.height / rows;
    let colors = ['#f87171', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#e2e8f0'];
    let cards = [...colors, ...colors].sort(() => Math.random() - 0.5).map(c => ({ 
        color: c, 
        flipped: false, 
        matched: false, 
        scale: 1, // For flip animation
        animating: false
    }));
    let flippedCards = [];
    let score = 0;
    let moves = 0;
    let streak = 0;
    
    document.getElementById('gameScore').innerText = `Pairs: 0 | Moves: 0`;

    // Audio
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'flip') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(600, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'match') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.setValueAtTime(800, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
            osc.start(now); osc.stop(now+0.3);
        }
    };
    
    gameInterval = setInterval(() => {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
        
        cards.forEach((c, i) => {
            let x = (i % cols) * w, y = Math.floor(i / cols) * h;
            let cx = x + w/2;
            let cy = y + h/2;

            // Animation Logic
            if(c.animating) {
                if(c.flipped) {
                    if(c.scale > 0) c.scale -= 0.2;
                    else { c.scale = 1; c.animating = false; } // Instant flip visual at 0 scale
                } else {
                    if(c.scale > 0) c.scale -= 0.2;
                    else { c.scale = 1; c.animating = false; }
                }
            }

            // Draw Card
            ctx.save();
            ctx.translate(cx, cy);
            // If animating and scale is decreasing, we are showing the "old" side shrinking
            // But for simplicity, we just scale X
            let currentScale = c.animating ? c.scale : 1;
            ctx.scale(currentScale, 1);

            if(c.flipped || c.matched) {
                ctx.shadowBlur = 15; ctx.shadowColor = c.color;
                ctx.fillStyle = c.color; 
                ctx.fillRect(-w/2 + 5, -h/2 + 5, w-10, h-10);
                
                // Icon or Pattern
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Card Back (Neon Grid)
                ctx.fillStyle = '#1e293b'; 
                ctx.fillRect(-w/2 + 5, -h/2 + 5, w-10, h-10);
                ctx.strokeStyle = '#38bdf8'; 
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-w/2 + 15, -h/2 + 15); ctx.lineTo(w/2 - 15, h/2 - 15);
                ctx.moveTo(w/2 - 15, -h/2 + 15); ctx.lineTo(-w/2 + 15, h/2 - 15);
                ctx.stroke();
                ctx.strokeRect(-w/2 + 10, -h/2 + 10, w-20, h-20);
            }
            ctx.restore();
        });
        
        drawParticles();
    }, 20);
    
    canvas.onclick = (e) => {
        if(flippedCards.length >= 2) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        
        let idx = Math.floor(clickX / w) + Math.floor(clickY / h) * cols;
        if(cards[idx] && !cards[idx].flipped && !cards[idx].matched) {
            cards[idx].flipped = true;
            cards[idx].animating = true;
            cards[idx].scale = 1;
            flippedCards.push(idx);
            playSound('flip');
            
            if(flippedCards.length === 2) {
                moves++;
                setTimeout(() => {
                    if(cards[flippedCards[0]].color === cards[flippedCards[1]].color) {
                        cards[flippedCards[0]].matched = true;
                        cards[flippedCards[1]].matched = true;
                        score++; 
                        streak++;
                        playSound('match');
                        
                        // Particles
                        let c1 = cards[flippedCards[0]];
                        let x1 = (flippedCards[0] % cols) * w + w/2;
                        let y1 = Math.floor(flippedCards[0] / cols) * h + h/2;
                        createParticles(x1, y1, c1.color);
                        
                        document.getElementById('gameScore').innerText = `Pairs: ${score} | Moves: ${moves}`;
                        if(score === 8) { endGame(score, true); }
                    } else {
                        cards[flippedCards[0]].flipped = false;
                        cards[flippedCards[1]].flipped = false;
                        cards[flippedCards[0]].animating = true;
                        cards[flippedCards[1]].animating = true;
                        streak = 0;
                    }
                    flippedCards = [];
                }, 800);
            }
        }
    };
}

function startTypingGame() {
    let words = [], score = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let health = 100;
    let nukeCharge = 0;
    let level = 1;
    let spawnRate = 0.02;
    let laserBeams = [];

    document.getElementById('gameScore').innerText = `Score: 0 | HP: 100%`;

    // Audio
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'shoot') {
            osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'nuke') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(50, now+1.0);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+1.0);
            osc.start(now); osc.stop(now+1.0);
        }
    };
    
    document.onkeydown = (e) => {
        if(e.code === 'Space' && nukeCharge >= 100) {
            // Nuke
            words.forEach(w => createParticles(w.x, w.y, '#ef4444'));
            score += words.length * 10;
            words = [];
            nukeCharge = 0;
            playSound('nuke');
            return;
        }

        let key = e.key.toUpperCase();
        let idx = words.findIndex(w => w.char === key);
        if(idx !== -1) {
            const wordX = words[idx].x;
            const wordY = words[idx].y;
            words.splice(idx, 1); 
            score += 10;
            nukeCharge = Math.min(100, nukeCharge + 5);
            
            // Laser Visual
            laserBeams.push({x: wordX, y: wordY, life: 1.0});
            
            createParticles(wordX, wordY, '#22c55e');
            playSound('shoot');
            
            if(score % 100 === 0) {
                level++;
                spawnRate += 0.005;
            }
            document.getElementById('gameScore').innerText = `Score: ${score} | HP: ${health}%`;
        }
    };
    
    gameInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        
        // Spawn
        if(Math.random() < spawnRate) {
            words.push({ 
                char: chars[Math.floor(Math.random()*26)], 
                x: Math.random()*(canvas.width-40) + 20, 
                y: 0,
                speed: 2 + (level * 0.2)
            });
        }
        
        // Draw Lasers
        for(let i=laserBeams.length-1; i>=0; i--) {
            let l = laserBeams[i];
            ctx.strokeStyle = `rgba(56, 189, 248, ${l.life})`;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(canvas.width/2, canvas.height); ctx.lineTo(l.x, l.y); ctx.stroke();
            l.life -= 0.1;
            if(l.life <= 0) laserBeams.splice(i, 1);
        }

        // Draw Words
        ctx.shadowBlur = 10; ctx.shadowColor = "#22c55e";
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 30px "Orbitron"';
        
        for(let i=words.length-1; i>=0; i--) {
            let w = words[i];
            w.y += w.speed; 
            ctx.fillText(w.char, w.x, w.y);
            
            if(w.y > canvas.height) { 
                words.splice(i, 1);
                health -= 10;
                createParticles(w.x, canvas.height, '#ef4444');
                document.getElementById('gameScore').innerText = `Score: ${score} | HP: ${health}%`;
                if(health <= 0) endGame(score);
            }
        }
        ctx.shadowBlur = 0;

        // UI: Player Base
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height, 40, Math.PI, 0); ctx.fill();
        
        // Nuke Bar
        ctx.fillStyle = '#334155'; ctx.fillRect(canvas.width/2 - 100, canvas.height - 20, 200, 10);
        ctx.fillStyle = nukeCharge >= 100 ? '#ef4444' : '#fbbf24'; 
        ctx.fillRect(canvas.width/2 - 100, canvas.height - 20, 200 * (nukeCharge/100), 10);
        if(nukeCharge >= 100) {
            ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.fillText('PRESS SPACE', canvas.width/2, canvas.height - 25);
        }

        drawParticles();
    }, 30);
}

function startTetrisGame() {
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const OFFSET_X = (canvas.width - COLS * BLOCK_SIZE) / 2;
    const OFFSET_Y = (canvas.height - ROWS * BLOCK_SIZE) / 2;
    
    const COLORS = [
        null,
        '#06b6d4', '#3b82f6', '#f97316', '#eab308', '#22c55e', '#a855f7', '#ef4444'
    ];

    function createPiece(type) {
        if (type === 'I') return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
        else if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
        else if (type === 'J') return [[0, 2, 0], [0, 2, 0], [2, 2, 0]];
        else if (type === 'O') return [[4, 4], [4, 4]];
        else if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
        else if (type === 'S') return [[0, 5, 5], [5, 5, 0], [0, 0, 0]];
        else if (type === 'T') return [[0, 6, 0], [6, 6, 6], [0, 0, 0]];
    }

    let arena = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let score = 0;
    let player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };
    let nextPiece = null;

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
            }
        }
        return false;
    }

    function playClearSound() {
        const data = getArcadeData();
        if (!data.settings.sfx) return;
        
        if (!audioCtx) initAudio();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    function draw() {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.strokeRect(OFFSET_X - 2, OFFSET_Y - 2, COLS * BLOCK_SIZE + 4, ROWS * BLOCK_SIZE + 4);

        // Draw Arena
        arena.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) drawBlock(x, y, value);
            });
        });
        // Draw Player
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) drawBlock(x + player.pos.x, y + player.pos.y, value);
            });
        });

        // Draw Next Piece
        if (nextPiece) {
            const previewX = OFFSET_X + COLS * BLOCK_SIZE + 30;
            const previewY = OFFSET_Y + 30;
            
            ctx.fillStyle = '#38bdf8';
            ctx.font = '20px "Orbitron", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('NEXT', previewX, previewY - 10);

            nextPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        ctx.fillStyle = COLORS[value];
                        ctx.fillRect(previewX + x * BLOCK_SIZE, previewY + y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                        ctx.lineWidth = 2; 
                        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                        ctx.strokeRect(previewX + x * BLOCK_SIZE, previewY + y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                });
            });
        }
    }

    function drawBlock(x, y, value) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x * BLOCK_SIZE + OFFSET_X, y * BLOCK_SIZE + OFFSET_Y, BLOCK_SIZE, BLOCK_SIZE);
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.strokeRect(x * BLOCK_SIZE + OFFSET_X, y * BLOCK_SIZE + OFFSET_Y, BLOCK_SIZE, BLOCK_SIZE);
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
            });
        });
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    }

    function playerReset() {
        const pieces = 'ILJOTSZ';
        if (nextPiece === null) {
            nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
        }
        player.matrix = nextPiece;
        nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        if (collide(arena, player)) endGame(score);
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            document.getElementById('gameScore').innerText = `Score: ${score}`;
        }
        dropCounter = 0;
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) player.pos.x -= dir;
    }

    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    function arenaSweep() {
        let rowCount = 1;
        let cleared = false;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) if (arena[y][x] === 0) continue outer;
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            score += rowCount * 10;
            rowCount *= 2;
            cleared = true;
        }
        if (cleared) playClearSound();
    }

    document.onkeydown = event => {
        if (event.keyCode === 37) playerMove(-1);
        else if (event.keyCode === 39) playerMove(1);
        else if (event.keyCode === 40) playerDrop();
        else if (event.keyCode === 38 || event.keyCode === 32) playerRotate(1);
    };

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    playerReset();
    document.getElementById('gameScore').innerText = `Score: ${score}`;
    
    gameInterval = setInterval(() => {
        const now = Date.now();
        if (!lastTime) lastTime = now;
        const deltaTime = now - lastTime;
        lastTime = now;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) playerDrop();
        draw();
    }, 20);
}

function startDoodleGame() {
    // Setup
    let player = { 
        x: canvas.width / 2, 
        y: canvas.height / 2, 
        w: 40, h: 40, 
        vx: 0, vy: 0, 
        dir: 1,
        state: 'normal' // normal, jetpack
    };
    let platforms = [];
    let bullets = [];
    let monsters = [];
    let particles = [];
    let blackHoles = [];
    let score = 0;
    let maxY = 0; // Tracks height for score
    let cameraY = 0;
    let gravity = 0.4;
    let isGameOver = false;
    let jetpackFuel = 0;

    // Inputs
    let keys = {};
    document.onkeydown = (e) => {
        keys[e.code] = true;
        if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
        if((e.code === 'Space' || e.code === 'ArrowUp') && !isGameOver) shoot();
    };
    document.onkeyup = (e) => keys[e.code] = false;

    // Audio
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'jump') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(600, now+0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'shoot') {
            osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(200, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'jetpack') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'break') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(50, now+0.2);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        }
    };

    // Init Platforms
    for(let i=0; i<10; i++) {
        platforms.push({ x: Math.random() * (canvas.width - 60), y: canvas.height - i * 80, w: 60, h: 15, type: 'normal' });
    }
    // Ensure start platform under player
    platforms[0].x = canvas.width/2 - 30;
    platforms[0].y = canvas.height - 50;

    function shoot() {
        bullets.push({ x: player.x + player.w/2, y: player.y, vx: 0, vy: -15 });
        playSound('shoot');
    }

    gameInterval = setInterval(() => {
        // Clear
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player Physics
        if (keys['ArrowLeft']) { player.vx -= 1; player.dir = -1; }
        if (keys['ArrowRight']) { player.vx += 1; player.dir = 1; }
        player.vx *= 0.9; // Friction
        player.x += player.vx;

        // Screen Wrap
        if (player.x < -player.w) player.x = canvas.width;
        if (player.x > canvas.width) player.x = -player.w;

        if (player.state === 'jetpack') {
            player.vy -= 1.5;
            jetpackFuel--;
            playSound('jetpack');
            createParticles(player.x + player.w/2, player.y + player.h, '#f87171');
            if (jetpackFuel <= 0) player.state = 'normal';
        } else {
            player.vy += gravity;
        }
        player.y += player.vy;

        // Camera Scroll
        if (player.y < canvas.height / 2) {
            let diff = canvas.height / 2 - player.y;
            player.y = canvas.height / 2;
            cameraY += diff;
            score += Math.floor(diff);
            document.getElementById('gameScore').innerText = `Score: ${score}`;

            // Move entities down
            platforms.forEach(p => p.y += diff);
            monsters.forEach(m => m.y += diff);
            bullets.forEach(b => b.y += diff);
            particles.forEach(p => p.y += diff);
            blackHoles.forEach(bh => bh.y += diff);
        }

        // Platform Logic
        // Remove old
        platforms = platforms.filter(p => p.y < canvas.height + 50);
        
        // Generate new
        while (platforms.length < 12) {
            let lastY = Math.min(...platforms.map(p => p.y));
            let type = 'normal';
            let r = Math.random();
            if (r < 0.2) type = 'moving';
            else if (r < 0.3) type = 'breakable';
            else if (r < 0.35) type = 'spring';
            else if (r < 0.38) type = 'jetpack';

            platforms.push({
                x: Math.random() * (canvas.width - 60),
                y: lastY - (60 + Math.random() * 40),
                w: 60, h: 15,
                type: type,
                dx: type === 'moving' ? (Math.random() < 0.5 ? 2 : -2) : 0
            });

            // Spawn Monsters
            if (Math.random() < 0.05) {
                monsters.push({
                    x: Math.random() * (canvas.width - 40),
                    y: lastY - (100 + Math.random() * 50),
                    w: 40, h: 40,
                    vx: Math.random() < 0.5 ? 1 : -1
                });
            }

            // Spawn Black Holes
            if (Math.random() < 0.01) {
                blackHoles.push({
                    x: Math.random() * (canvas.width - 50),
                    y: lastY - (200 + Math.random() * 100),
                    angle: 0
                });
            }
        }

        // Platform Collision
        platforms.forEach(p => {
            if (p.type === 'moving') {
                p.x += p.dx;
                if (p.x < 0 || p.x + p.w > canvas.width) p.dx *= -1;
            }

            // Check collision only if falling
            if (player.vy > 0 && 
                player.x + player.w * 0.8 > p.x && 
                player.x + player.w * 0.2 < p.x + p.w &&
                player.y + player.h > p.y && 
                player.y + player.h < p.y + p.h + player.vy + 5) {
                
                if (p.type === 'breakable') {
                    p.y = canvas.height + 100; // Remove
                    playSound('break');
                    createParticles(p.x + p.w/2, p.y, '#78350f');
                    player.vy = -5; // Small hop
                } else {
                    player.vy = -12;
                    playSound('jump');
                    createParticles(player.x + player.w/2, player.y + player.h, '#38bdf8');
                    
                    if (p.type === 'spring') {
                        player.vy = -20;
                        createParticles(p.x + p.w/2, p.y, '#fbbf24');
                    }
                    if (p.type === 'jetpack') {
                        player.state = 'jetpack';
                        jetpackFuel = 100;
                        p.type = 'normal'; // Consume jetpack
                    }
                }
            }

            // Draw Platform
            ctx.shadowBlur = 10;
            if (p.type === 'normal') { ctx.fillStyle = '#22c55e'; ctx.shadowColor = '#22c55e'; }
            else if (p.type === 'moving') { ctx.fillStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8'; }
            else if (p.type === 'breakable') { ctx.fillStyle = '#78350f'; ctx.shadowColor = '#78350f'; }
            else if (p.type === 'spring') { ctx.fillStyle = '#22c55e'; ctx.shadowColor = '#22c55e'; } // Base
            else if (p.type === 'jetpack') { ctx.fillStyle = '#22c55e'; ctx.shadowColor = '#22c55e'; }

            ctx.fillRect(p.x, p.y, p.w, p.h);
            
            // Extras
            if (p.type === 'spring') { ctx.fillStyle = '#fbbf24'; ctx.fillRect(p.x + 20, p.y - 10, 20, 10); }
            if (p.type === 'jetpack') { ctx.fillStyle = '#ef4444'; ctx.fillRect(p.x + 20, p.y - 20, 20, 20); }
            ctx.shadowBlur = 0;
        });

        // Monsters
        monsters.forEach((m, i) => {
            m.x += m.vx;
            if (m.x < 0 || m.x + m.w > canvas.width) m.vx *= -1;

            // Draw
            ctx.shadowBlur = 15; ctx.shadowColor = '#ef4444';
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(m.x, m.y, m.w, m.h);
            // Eyes
            ctx.fillStyle = '#fff'; ctx.fillRect(m.x + 5, m.y + 10, 10, 10); ctx.fillRect(m.x + 25, m.y + 10, 10, 10);
            ctx.shadowBlur = 0;

            // Collision
            if (player.x < m.x + m.w && player.x + player.w > m.x && player.y < m.y + m.h && player.y + player.h > m.y) {
                if (player.vy > 0 && player.y + player.h < m.y + 20) {
                    // Jumped on head
                    monsters.splice(i, 1);
                    player.vy = -12;
                    playSound('break');
                    createParticles(m.x + m.w/2, m.y + m.h/2, '#ef4444');
                } else if (player.state !== 'jetpack') {
                    endGame(score);
                }
            }
        });

        // Black Holes
        blackHoles.forEach((bh, i) => {
            bh.angle += 0.1;
            
            // Draw
            ctx.save();
            ctx.translate(bh.x, bh.y);
            ctx.rotate(bh.angle);
            
            let grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
            grad.addColorStop(0, '#000');
            grad.addColorStop(0.4, '#7c3aed');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.stroke();
            ctx.restore();

            // Physics
            let dx = bh.x - (player.x + player.w/2);
            let dy = bh.y - (player.y + player.h/2);
            let dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 150) {
                let force = 200 / (dist * dist + 1);
                player.vx += dx * force;
                player.vy += dy * force;
                if (Math.random() < 0.2) createParticles(player.x + player.w/2, player.y + player.h/2, '#a78bfa');
            }

            if (dist < 20) endGame(score);
        });
        blackHoles = blackHoles.filter(bh => bh.y < canvas.height + 100);

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.y += b.vy;
            ctx.fillStyle = '#fbbf24'; ctx.fillRect(b.x - 2, b.y, 4, 10);
            
            // Hit Monster
            monsters.forEach((m, mi) => {
                if (b.x > m.x && b.x < m.x + m.w && b.y > m.y && b.y < m.y + m.h) {
                    monsters.splice(mi, 1);
                    bullets.splice(i, 1);
                    createParticles(m.x + m.w/2, m.y + m.h/2, '#ef4444');
                    playSound('break');
                }
            });
            if (b.y < -50) bullets.splice(i, 1);
        }

        // Draw Player
        ctx.save();
        ctx.translate(player.x + player.w/2, player.y + player.h/2);
        if (player.dir === -1) ctx.scale(-1, 1);
        
        ctx.shadowBlur = 20; ctx.shadowColor = '#00f3ff';
        ctx.fillStyle = '#00f3ff';
        // Body
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
        // Eyes
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(8, -5, 4, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(15, -5, 3, 0, Math.PI*2); ctx.fill();
        // Jetpack
        if (player.state === 'jetpack') {
            ctx.fillStyle = '#ef4444'; ctx.fillRect(-25, -10, 10, 25);
        }
        ctx.restore();
        ctx.shadowBlur = 0;

        drawParticles();

        // Game Over
        if (player.y > canvas.height + 50) endGame(score);

    }, 20);
}

function startCyclesGame() {
    // Configuration
    const gridSize = 10;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);
    
    // State
    let grid = Array(cols).fill().map(() => Array(rows).fill(0)); // 0: empty, 1: p1, 2: ai
    let p1 = { x: 10, y: Math.floor(rows/2), dx: 1, dy: 0, color: '#00f3ff', dead: false, turbo: 100, nextDx: 1, nextDy: 0 };
    let ai = { x: cols-10, y: Math.floor(rows/2), dx: -1, dy: 0, color: '#ef4444', dead: false, turbo: 100 };
    let score = 0;
    let gameOver = false;
    let shake = 0;
    let speed = 60; // ms per frame
    let frameCount = 0;

    document.getElementById('gameScore').innerText = `Wins: ${score}`;

    // Audio
    const playSound = (type) => {
        const data = getArcadeData();
        if (!data.settings.sfx || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        
        if (type === 'turn') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(100, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'crash') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now+0.5);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.5);
            osc.start(now); osc.stop(now+0.5);
        } else if (type === 'turbo') {
            osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(600, now+0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        }
    };

    // Controls
    let spacePressed = false;
    document.onkeydown = (e) => {
        if (gameOver) return;
        if (e.code === 'ArrowUp' && p1.dy === 0) { p1.nextDx = 0; p1.nextDy = -1; }
        else if (e.code === 'ArrowDown' && p1.dy === 0) { p1.nextDx = 0; p1.nextDy = 1; }
        else if (e.code === 'ArrowLeft' && p1.dx === 0) { p1.nextDx = -1; p1.nextDy = 0; }
        else if (e.code === 'ArrowRight' && p1.dx === 0) { p1.nextDx = 1; p1.nextDy = 0; }
        else if (e.code === 'Space') spacePressed = true;
        
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    };
    document.onkeyup = (e) => {
        if (e.code === 'Space') spacePressed = false;
    };

    function resetRound() {
        grid = Array(cols).fill().map(() => Array(rows).fill(0));
        p1.x = 10; p1.y = Math.floor(rows/2); p1.dx = 1; p1.dy = 0; p1.nextDx = 1; p1.nextDy = 0; p1.dead = false; p1.turbo = 100;
        ai.x = cols-10; ai.y = Math.floor(rows/2); ai.dx = -1; ai.dy = 0; ai.dead = false; ai.turbo = 100;
        gameOver = false;
        shake = 0;
    }

    function checkCollision(x, y) {
        return x < 0 || x >= cols || y < 0 || y >= rows || grid[x][y] !== 0;
    }

    function aiLogic() {
        // Simple Raycast AI
        const moves = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];
        
        // Filter out reverse
        const validMoves = moves.filter(m => !(m.dx === -ai.dx && m.dy === -ai.dy));
        
        // Score moves
        let bestMove = null;
        let maxScore = -9999;

        validMoves.forEach(m => {
            let score = 0;
            let nx = ai.x + m.dx;
            let ny = ai.y + m.dy;

            // Immediate death
            if (checkCollision(nx, ny)) {
                score = -1000;
            } else {
                // Raycast: Count free space in this direction
                let space = 0;
                let tx = nx, ty = ny;
                while (!checkCollision(tx, ty) && space < 20) {
                    space++;
                    tx += m.dx;
                    ty += m.dy;
                }
                score += space * 10;

                // Aggression: Move towards player if safe
                let dist = Math.abs(p1.x - nx) + Math.abs(p1.y - ny);
                score -= dist; // Closer is better (if safe)
            }

            if (score > maxScore) {
                maxScore = score;
                bestMove = m;
            }
        });

        if (bestMove) {
            ai.dx = bestMove.dx;
            ai.dy = bestMove.dy;
        }
    }

    function updateBike(bike, isPlayer) {
        if (bike.dead) return;

        // Apply buffered input for player
        if (isPlayer) {
            if (bike.dx !== bike.nextDx || bike.dy !== bike.nextDy) playSound('turn');
            bike.dx = bike.nextDx;
            bike.dy = bike.nextDy;
        }

        // Turbo Logic
        let steps = 1;
        if (isPlayer && spacePressed && bike.turbo > 0) {
            steps = 2;
            bike.turbo -= 2;
            playSound('turbo');
        } else if (bike.turbo < 100) {
            bike.turbo += 0.2;
        }

        for(let i=0; i<steps; i++) {
            // Mark current spot
            if (!checkCollision(bike.x, bike.y)) grid[bike.x][bike.y] = isPlayer ? 1 : 2;

            bike.x += bike.dx;
            bike.y += bike.dy;

            if (checkCollision(bike.x, bike.y)) {
                bike.dead = true;
                shake = 20;
                playSound('crash');
                createParticles(bike.x * gridSize, bike.y * gridSize, bike.color);
                
                if (!gameOver) {
                    gameOver = true;
                    if (!isPlayer && !p1.dead) {
                        score++;
                        document.getElementById('gameScore').innerText = `Wins: ${score}`;
                        setTimeout(resetRound, 2000);
                    } else if (isPlayer) {
                        setTimeout(() => endGame(score), 2000);
                    }
                }
                break;
            }
        }
    }

    function gameLoop() {
        // Logic
        if (!gameOver) {
            aiLogic();
            updateBike(p1, true);
            updateBike(ai, false);
        }

        // Draw
        if (shake > 0) shake *= 0.9;
        ctx.save();
        ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);

        // Background
        ctx.fillStyle = '#050b14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid Lines (Pulse)
        frameCount++;
        ctx.strokeStyle = `rgba(0, 243, 255, ${0.05 + Math.sin(frameCount*0.05)*0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let x=0; x<=canvas.width; x+=gridSize*2) { ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); }
        for(let y=0; y<=canvas.height; y+=gridSize*2) { ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); }
        ctx.stroke();

        // Draw Trails
        for(let x=0; x<cols; x++) {
            for(let y=0; y<rows; y++) {
                if (grid[x][y] !== 0) {
                    ctx.fillStyle = grid[x][y] === 1 ? '#00f3ff' : '#ef4444';
                    ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
                    ctx.fillRect(x*gridSize, y*gridSize, gridSize, gridSize);
                    ctx.shadowBlur = 0;
                }
            }
        }

        // Draw Heads
        if (!p1.dead) { ctx.fillStyle = '#fff'; ctx.fillRect(p1.x*gridSize, p1.y*gridSize, gridSize, gridSize); }
        if (!ai.dead) { ctx.fillStyle = '#fff'; ctx.fillRect(ai.x*gridSize, ai.y*gridSize, gridSize, gridSize); }

        // Turbo Bar
        ctx.fillStyle = '#334155'; ctx.fillRect(10, 10, 100, 5);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(10, 10, p1.turbo, 5);

        drawParticles();
        ctx.restore();

        gameInterval = setTimeout(gameLoop, 30);
    }

    gameLoop();
}
