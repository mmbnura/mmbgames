// ─── Firebase Setup ───────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, 
         query, orderBy, limit }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  // PASTE YOUR CONFIG HERE
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);

const currentUser = JSON.parse(localStorage.getItem('mmb_google_user') || '{}');
const isGoogleUser = currentUser?.uid && currentUser.authProvider !== 'guest';

    const APP_VERSION = '0.8';
    const PIECE_UNICODE = {
      wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
      bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
    };
    const FILES = ['a','b','c','d','e','f','g','h'];
    const DIFFICULTIES = [
      { key: 'beginner', name: 'Beginner', elo: 400, depth: 0 },
      { key: 'easy', name: 'Easy', elo: 800, depth: 1 },
      { key: 'medium', name: 'Medium', elo: 1200, depth: 2 },
      { key: 'hard', name: 'Hard', elo: 1800, depth: 3 },
      { key: 'expert', name: 'Expert', elo: 2200, depth: 4 }
    ];
    const PIECE_VALUES = { P:100, N:320, B:330, R:500, Q:900, K:20000 };
    const PST = {
      P:[
        [0,0,0,0,0,0,0,0],[7,8,8,-4,-4,8,8,7],[5,6,6,10,10,6,6,5],[3,3,4,8,8,4,3,3],[2,2,2,6,6,2,2,2],[1,1,1,2,2,1,1,1],[0,0,0,-8,-8,0,0,0],[0,0,0,0,0,0,0,0]
      ],
      N:[
        [-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,10,15,15,10,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,10,15,15,10,0,-30],[-40,-20,0,0,0,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]
      ],
      B:[
        [-20,-10,-10,-10,-10,-10,-10,-20],[-10,5,0,0,0,0,5,-10],[-10,10,10,10,10,10,10,-10],[-10,0,10,10,10,10,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,5,10,10,5,0,-10],[-10,0,0,0,0,0,0,-10],[-20,-10,-10,-10,-10,-10,-10,-20]
      ],
      R:[
        [0,0,5,10,10,5,0,0],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[5,10,10,10,10,10,10,5],[0,0,0,0,0,0,0,0]
      ],
      Q:[
        [-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]
      ],
      K:[
        [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]
      ]
    };
    const boardEl = document.getElementById('board');
    const topFilesEl = document.getElementById('topFiles');
    const bottomFilesEl = document.getElementById('bottomFiles');
    const leftRanksEl = document.getElementById('leftRanks');
    const rightRanksEl = document.getElementById('rightRanks');
    const turnDotEl = document.getElementById('turnDot');
    const turnTextEl = document.getElementById('turnText');
    const statusTextEl = document.getElementById('statusText');
    const difficultyTextEl = document.getElementById('difficultyText');
    const whiteCapturedEl = document.getElementById('whiteCaptured');
    const blackCapturedEl = document.getElementById('blackCaptured');
    const historyEl = document.getElementById('history');
    const difficultyModal = document.getElementById('difficultyModal');
    const difficultyListEl = document.getElementById('difficultyList');
    const promotionModal = document.getElementById('promotionModal');
    const promotionChoicesEl = document.getElementById('promotionChoices');
    const gameOverModal = document.getElementById('gameOverModal');
    const gameOverTitleEl = document.getElementById('gameOverTitle');
    const gameOverBodyEl = document.getElementById('gameOverBody');
    const whiteTimerEl = document.getElementById('whiteTimer');
    const blackTimerEl = document.getElementById('blackTimer');
    const reviewScreenEl = document.getElementById('reviewScreen');
    const reviewBoardEl = document.getElementById('reviewBoard');
    const analyzerGameListEl = document.getElementById('analyzerGameList');
    const pgnInputEl = document.getElementById('pgnInput');
    const GAMES_STORAGE_KEY = 'mmb_chess_saved_games';
    let game = null;
    let gameReviewData = null;
    let reviewState = null;
    let reviewMeta = { whiteName: 'White', blackName: 'Black', userColor: 'w', aiColor: 'b' };
    let selected = null;
    let validMoves = [];
    let pendingPromotion = null;
    let aiThinking = false;
    let gameClockInterval = null;
    let lastClockTick = 0;

    function byId(id){ return document.getElementById(id); }
    function on(id, event, handler){ const el = byId(id); if (el) el.addEventListener(event, handler); }
    function appContainer(){ return document.querySelector('.app'); }
    function inferReviewSides(whiteName, blackName) {
      const userRe = /(user|you|player|human)/i;
      const aiRe = /(computer|ai|bot|engine)/i;
      const whiteLooksUser = userRe.test(whiteName || '');
      const blackLooksUser = userRe.test(blackName || '');
      const whiteLooksAi = aiRe.test(whiteName || '');
      const blackLooksAi = aiRe.test(blackName || '');

      if (whiteLooksUser && blackLooksAi) return { userColor: 'w', aiColor: 'b' };
      if (blackLooksUser && whiteLooksAi) return { userColor: 'b', aiColor: 'w' };
      if (whiteLooksUser && !blackLooksUser) return { userColor: 'w', aiColor: 'b' };
      if (blackLooksUser && !whiteLooksUser) return { userColor: 'b', aiColor: 'w' };
      if (whiteLooksAi && !blackLooksAi) return { userColor: 'b', aiColor: 'w' };
      if (blackLooksAi && !whiteLooksAi) return { userColor: 'w', aiColor: 'b' };
      if (game?.playerColor && game?.aiColor) return { userColor: game.playerColor, aiColor: game.aiColor };
      return { userColor: 'w', aiColor: 'b' };
    }
    function renderSideAssignment() {
      const sideTextEl = byId('sideAssignmentText');
      if (!sideTextEl) return;
      const userSide = reviewMeta.userColor === 'b' ? 'Black' : 'White';
      const aiSide = reviewMeta.aiColor === 'w' ? 'White' : 'Black';
      sideTextEl.textContent = `User: ${userSide} • Computer: ${aiSide}`;
    }
    function buildLabels() {
      if (!topFilesEl || !bottomFilesEl || !leftRanksEl || !rightRanksEl) return;
      topFilesEl.innerHTML = ''; bottomFilesEl.innerHTML = '';
      FILES.forEach(f => {
        topFilesEl.innerHTML += `<div>${f}</div>`;
        bottomFilesEl.innerHTML += `<div>${f}</div>`;
      });
      leftRanksEl.innerHTML = ''; rightRanksEl.innerHTML = '';
      for (let r = 8; r >= 1; r--) {
        leftRanksEl.innerHTML += `<div>${r}</div>`;
        rightRanksEl.innerHTML += `<div>${r}</div>`;
      }
    }
    function createInitialBoard() {
      const b = Array.from({ length: 8 }, () => Array(8).fill(null));
      b[0] = ['bR','bN','bB','bQ','bK','bB','bN','bR'];
      b[1] = Array(8).fill('bP');
      b[6] = Array(8).fill('wP');
      b[7] = ['wR','wN','wB','wQ','wK','wB','wN','wR'];
      return b;
    }
    

    function gameResultTag(gameResultObj) {
      if (!gameResultObj) return '*';
      if (gameResultObj.type === 'checkmate' || gameResultObj.type === 'resign') return gameResultObj.winner === 'w' ? '1-0' : '0-1';
      return '1/2-1/2';
    }

    function buildPGNFromCurrentGame() {
      if (!game) return '';
      const today = new Date();
      const date = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
      const resultTag = gameResultTag(game.gameOver);
      let moves = '';
      for (let i = 0; i < game.moveHistory.length; i += 2) {
        const moveNo = Math.floor(i/2) + 1;
        const w = game.moveHistory[i] || '';
        const b = game.moveHistory[i+1] || '';
        moves += `${moveNo}. ${w}${b ? ` ${b}` : ''} `;
      }
      return `[Event "MMB Chess Casual Game"]\n[Site "Local Browser"]\n[Date "${date}"]\n[White "${game.playerName || 'User'}"]\n[Black "${game.aiName || 'Computer'}"]\n[Result "${resultTag}"]\n\n${moves.trim()} ${resultTag}`.trim();
    }

    function loadSavedGames() {
      try {
        const raw = localStorage.getItem(GAMES_STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (_) {
        return [];
      }
    }

    function saveGameToLocalStorage() {
      const pgn = buildPGNFromCurrentGame();
      if (!pgn) return;
      const saved = loadSavedGames();
      saved.unshift({
        id: `g_${Date.now()}`,
        playedAt: new Date().toISOString(),
        result: (() => {
          if (!game?.gameOver) return 'Completed game';
          if (game.gameOver.type === 'checkmate') return game.gameOver.winner === game.playerColor ? 'User wins' : 'Computer wins';
          return game.gameOver.message || 'Draw';
        })(),
        moves: game?.moveHistory?.length || 0,
        pgn
      });
      localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(saved.slice(0, 100)));
    }


    async function exportGamePgn(gameEntry) {
      if (!gameEntry?.pgn) return;
      const dt = new Date(gameEntry.playedAt || Date.now());
      const stamp = `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}_${String(dt.getHours()).padStart(2,'0')}${String(dt.getMinutes()).padStart(2,'0')}${String(dt.getSeconds()).padStart(2,'0')}`;
      const filename = `mmb_game_${stamp}.pgn`;

      try {
        if (navigator.share) {
          await navigator.share({ title: 'MMB Chess PGN', text: gameEntry.pgn });
          return;
        }
      } catch (_) {
        // Ignore and fallback to download/copy.
      }

      try {
        const blob = new Blob([gameEntry.pgn], { type: 'application/x-chess-pgn;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      } catch (_) {
        // fallback to clipboard
      }

      try {
        await navigator.clipboard.writeText(gameEntry.pgn);
        alert('PGN copied to clipboard.');
      } catch (_) {
        alert('Unable to export PGN on this browser.');
      }
    }

    function renderSavedGamesList() {
      const games = loadSavedGames();
      if (!analyzerGameListEl) return;
      analyzerGameListEl.innerHTML = games.length ? '' : '<div style="opacity:.75;">No saved games yet.</div>';
      games.forEach(g => {
        const row = document.createElement('div');
        row.className = 'game-list-row';

        const btn = document.createElement('button');
        btn.className = 'secondary game-open-btn';
        const dt = new Date(g.playedAt);
        btn.innerHTML = `<div>${dt.toLocaleString()}</div><div style="font-size:12px;opacity:.85;">${g.result} • ${g.moves} plies</div>`;
        btn.addEventListener('click', () => prepareReviewFromPGN(g.pgn));

        const shareBtn = document.createElement('button');
        shareBtn.className = 'secondary game-share-btn';
        shareBtn.textContent = 'Share';
        shareBtn.title = 'Export this game as PGN';
        shareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          exportGamePgn(g);
        });

        row.appendChild(btn);
        row.appendChild(shareBtn);
        analyzerGameListEl.appendChild(row);
      });
    }

    function normalizeSan(san) {
      return san.replace(/[!?]+/g,'').replace(/[+#]+$/,'').trim();
    }

    function parseSanToken(token) {
      const clean = normalizeSan(token);
      if (clean === 'O-O' || clean === '0-0') return { castle: 'K' };
      if (clean === 'O-O-O' || clean === '0-0-0') return { castle: 'Q' };
      const m = clean.match(/^([KQRBN]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])(?:=([QRBN]))?$/);
      if (!m) return null;
      const piece = m[1] || 'P';
      const fromFile = m[2] || null;
      const fromRank = m[3] || null;
      const isCapture = m[4] === 'x';
      const dest = m[5];
      const promo = m[6] || null;
      return {
        piece,
        fromFile,
        fromRank,
        isCapture,
        toC: FILES.indexOf(dest[0]),
        toR: 8 - Number(dest[1]),
        promotion: promo
      };
    }

    function findMatchingMovesForSan(state, sanToken) {
      const legal = generateAllLegalMoves(state, state.turn);
      const parsed = parseSanToken(sanToken);
      const matches = [];

      // Fallback to notation-based compare for unusual SAN cases.
      if (!parsed) {
        const target = normalizeSan(sanToken);
        for (const m of legal) {
          const promo = m.promotion ? 'Q' : null;
          const movedPiece = state.board[m.fromR][m.fromC];
          const applied = applyMove(state, m, promo);
          const note = notationForMove(state, m, applied.state, movedPiece, applied.captured, promo);
          if (normalizeSan(note) === target) matches.push({ move: m, applied, note });
        }
        return matches;
      }

      for (const m of legal) {
        const movedPiece = state.board[m.fromR][m.fromC];
        const pieceType = typeOf(movedPiece);

        if (parsed.castle) {
          if (!m.castle || m.castle !== parsed.castle) continue;
        } else {
          if (pieceType !== parsed.piece) continue;
          if (m.toR !== parsed.toR || m.toC !== parsed.toC) continue;
          if (parsed.fromFile && FILES[m.fromC] !== parsed.fromFile) continue;
          if (parsed.fromRank && String(8 - m.fromR) !== parsed.fromRank) continue;

          const targetPiece = state.board[m.toR][m.toC] || (m.enPassant ? `${enemy(state.turn)}P` : null);
          const isCapture = !!targetPiece;
          if (parsed.isCapture !== isCapture) continue;

          if (parsed.promotion && (!m.promotion || parsed.promotion !== 'Q')) continue;
        }

        const promo = m.promotion ? 'Q' : null;
        const applied = applyMove(state, m, promo);
        const note = notationForMove(state, m, applied.state, movedPiece, applied.captured, promo);
        matches.push({ move: m, applied, note });
      }
      return matches;
    }

    function findMoveMatchingSan(state, sanToken) {
      const m = findMatchingMovesForSan(state, sanToken);
      return m.length ? m[0] : null;
    }


    function parsePgnHeaders(pgnText) {
      const headers = {};
      const regex = /\[([^\s]+)\s+"([^"]*)"\]/g;
      let m;
      while ((m = regex.exec(pgnText)) !== null) headers[m[1]] = m[2];
      return headers;
    }

    function prepareReviewFromPGN(pgnText) {
      if (!pgnText || !pgnText.trim()) return;
      const normalizedPgn = pgnText.replace(/\\n/g, '\n');
      const headers = parsePgnHeaders(normalizedPgn);
      const whiteName = headers.White || 'White';
      const blackName = headers.Black || 'Black';
      reviewMeta = {
        whiteName,
        blackName,
        ...inferReviewSides(whiteName, blackName)
      };
      const wNameEl = document.getElementById('whitePlayerName');
      const bNameEl = document.getElementById('blackPlayerName');
      if (wNameEl) wNameEl.textContent = reviewMeta.whiteName;
      if (bNameEl) bNameEl.textContent = reviewMeta.blackName;
      renderSideAssignment();
      const body = normalizedPgn.replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/\([^)]*\)/g, ' ');
      const rawTokens = body.split(/\s+/).map(t => t.trim()).filter(Boolean);
      const tokens = rawTokens.filter(t => !/^\d+\.(\.\.)?$/.test(t) && !/^1-0$|^0-1$|^1\/2-1\/2$|^\*$/.test(t));

      const state = {
        board: createInitialBoard(),
        turn: 'w',
        castling: { wK: true, wQ: true, bK: true, bQ: true },
        enPassant: null,
        halfmoveClock: 0,
        fullmoveNumber: 1,
        moveHistory: [], capturedWhite: [], capturedBlack: [], lastMove: null
      };

      const positions = [];
      const plies = [];
      let furthest = 0;
      let nodes = 0;

      function replayWithBacktracking(currState, idx) {
        if (idx >= tokens.length) return true;
        furthest = Math.max(furthest, idx);

        const candidates = findMatchingMovesForSan(currState, tokens[idx]);
        for (const found of candidates) {
          nodes += 1;
          if (nodes > 60000) return false;

          const nextState = found.applied.state;
          positions.push(cloneGameState(currState));
          plies.push({
            fromR: found.move.fromR, fromC: found.move.fromC, toR: found.move.toR, toC: found.move.toC,
            notation: found.note, movedPiece: currState.board[found.move.fromR][found.move.fromC], captured: found.applied.captured,
            boardAfter: nextState.board.map(r => [...r]), turnAfter: nextState.turn,
            promotion: found.move.promotion ? 'Q' : null, castle: found.move.castle || null
          });

          if (replayWithBacktracking(nextState, idx + 1)) return true;
          positions.pop();
          plies.pop();
        }
        return false;
      }

      const ok = replayWithBacktracking(state, 0);
      if (!ok) {
        const badTok = tokens[furthest] || tokens[tokens.length - 1] || 'unknown';
        alert(`Could not parse PGN move: ${badTok}`);
        return;
      }

      gameReviewData = {
        initialState: { board: createInitialBoard(), turn: 'w', castling: { wK: true, wQ: true, bK: true, bQ: true }, enPassant: null, halfmoveClock: 0, fullmoveNumber: 1 },
        plies, positions, moveHistory: plies.map(p => p.notation), result: headers.Result || 'PGN Analysis',
        evals: [], bestMoves: [], bestEvals: [], classifications: []
      };
      analyzeReviewData(false);
    }

    function openAnalyzerPage() {
      if (!reviewScreenEl) { window.location.href = 'gameAnalyzer.html'; return; }
      const app = appContainer();
      if (app) app.style.display = 'none';
      reviewScreenEl.classList.add('show');
      renderSideAssignment();
      document.getElementById('reviewLoading').style.display = 'block';
      document.getElementById('reviewSummary').style.display = 'none';
      document.getElementById('reviewMain').style.display = 'none';
      document.getElementById('reviewLoadingText').textContent = 'Choose a game from the left or paste PGN to analyze.';
      document.getElementById('reviewProgressBar').style.width = '0%';
      renderSavedGamesList();
    }

    function formatClock(ms) {
      const totalSec = Math.floor(Math.max(0, ms) / 1000);
      const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      return `${m}:${s}`;
    }
    function stopGameClock() {
      if (gameClockInterval) clearInterval(gameClockInterval);
      gameClockInterval = null;
    }
    function startGameClock() {
      stopGameClock();
      lastClockTick = performance.now();
      gameClockInterval = setInterval(() => {
        if (!game || game.gameOver) return;
        const now = performance.now();
        const dt = now - lastClockTick;
        lastClockTick = now;
        if (game.turn === 'w') game.whiteTimeMs += dt; else game.blackTimeMs += dt;
        whiteTimerEl.textContent = formatClock(game.whiteTimeMs);
        blackTimerEl.textContent = formatClock(game.blackTimeMs);
      }, 200);
    }
    function renderInitialBoard() {
      if (!boardEl) return;
      const preview = createInitialBoard();
      boardEl.innerHTML = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const sq = document.createElement('div');
          sq.className = `square ${(r+c)%2===0?'light':'dark'}`;
          const piece = preview[r][c];
          if (piece) {
            const sp = document.createElement('span');
            sp.className = `piece ${colorOf(piece)==='w'?'white':'black'}`;
            sp.textContent = PIECE_UNICODE[piece];
            sq.appendChild(sp);
          }
          boardEl.appendChild(sq);
        }
      }
      if (turnDotEl) turnDotEl.style.background = '#fff';
      if (turnTextEl) turnTextEl.textContent = 'Press New Game to start';
      if (statusTextEl) statusTextEl.textContent = 'Ready. Start a new game to begin.';
      if (difficultyTextEl) difficultyTextEl.textContent = 'Not started';
      if (whiteCapturedEl) whiteCapturedEl.textContent = '';
      if (blackCapturedEl) blackCapturedEl.textContent = '';
      if (whiteTimerEl) whiteTimerEl.textContent = '00:00';
      if (blackTimerEl) blackTimerEl.textContent = '00:00';
      if (historyEl) historyEl.innerHTML = '<div class="hdr">#</div><div class="hdr">White</div><div class="hdr">Black</div>';
      const resignBtn = byId('resignBtn');
      if (resignBtn) resignBtn.disabled = true;
    }
function newGame(difficultyKey) {
      const diff = DIFFICULTIES.find(d => d.key === difficultyKey) || DIFFICULTIES[1];
      game = {
        board: createInitialBoard(),
        turn: 'w',
        castling: { wK: true, wQ: true, bK: true, bQ: true },
        enPassant: null,
        halfmoveClock: 0,
        fullmoveNumber: 1,
        selectedDifficulty: diff,
        playerColor: 'w',
        aiColor: 'b',
        playerName: 'User',
        aiName: 'Computer',
        moveHistory: [],
        capturedWhite: [],
        capturedBlack: [],
        lastMove: null,
        gameOver: null,
        pendingCheckFlash: null,
        whiteTimeMs: 0,
        blackTimeMs: 0,
        reviewPositions: [],
        reviewPlies: []
      };
      selected = null;
      validMoves = [];
      pendingPromotion = null;
      aiThinking = false;
      gameOverModal.classList.remove('show');
      startGameClock();
      render();
      maybeAIMove();
    }
    function cloneGameState(state) {
      return {
        ...state,
        board: state.board.map(row => [...row]),
        castling: { ...state.castling },
        enPassant: state.enPassant ? { ...state.enPassant } : null,
        moveHistory: [...state.moveHistory],
        capturedWhite: [...state.capturedWhite],
        capturedBlack: [...state.capturedBlack],
        lastMove: state.lastMove ? { ...state.lastMove } : null
      };
    }
    function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
    function colorOf(piece) { return piece ? piece[0] : null; }
    function typeOf(piece) { return piece ? piece[1] : null; }
    function enemy(color) { return color === 'w' ? 'b' : 'w'; }
    function squareName(r, c) { return `${FILES[c]}${8-r}`; }
    function findKing(board, color) {
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === `${color}K`) return [r, c];
      return null;
    }
    function isSquareAttacked(state, r, c, byColor) {
      const b = state.board;
      const dir = byColor === 'w' ? -1 : 1;
      for (const dc of [-1,1]) {
        const rr = r - dir, cc = c + dc;
        if (inBounds(rr, cc) && b[rr][cc] === `${byColor}P`) return true;
      }
      const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr,dc] of knightOffsets) {
        const rr=r+dr,cc=c+dc;
        if (inBounds(rr,cc) && b[rr][cc] === `${byColor}N`) return true;
      }
      const lines = [
        [[1,0],[-1,0],[0,1],[0,-1],['R','Q']],
        [[1,1],[1,-1],[-1,1],[-1,-1],['B','Q']]
      ];
      for (const [dirs, pieces] of lines.map(x => [x.slice(0,4), x[4]])) {
        for (const [dr,dc] of dirs) {
          let rr=r+dr, cc=c+dc;
          while (inBounds(rr,cc)) {
            const p = b[rr][cc];
            if (p) {
              if (colorOf(p) === byColor && pieces.includes(typeOf(p))) return true;
              break;
            }
            rr += dr; cc += dc;
          }
        }
      }
      for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
        if (!dr && !dc) continue;
        const rr=r+dr, cc=c+dc;
        if (inBounds(rr,cc) && b[rr][cc] === `${byColor}K`) return true;
      }
      return false;
    }
    function isInCheck(state, color) {
      const king = findKing(state.board, color);
      if (!king) return false;
      return isSquareAttacked(state, king[0], king[1], enemy(color));
    }
    function generatePseudoMoves(state, fromR, fromC, forAttack = false) {
      const b = state.board;
      const piece = b[fromR][fromC];
      if (!piece) return [];
      const color = colorOf(piece);
      const t = typeOf(piece);
      const moves = [];
      const add = (toR,toC,opts={}) => { if (inBounds(toR,toC)) moves.push({ fromR, fromC, toR, toC, ...opts }); };
      if (t === 'P') {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const promotionRow = color === 'w' ? 0 : 7;
        const oneR = fromR + dir;
        if (!forAttack && inBounds(oneR, fromC) && !b[oneR][fromC]) {
          if (oneR === promotionRow) add(oneR, fromC, { promotion: true }); else add(oneR, fromC);
          const twoR = fromR + dir*2;
          if (fromR === startRow && !b[twoR][fromC]) add(twoR, fromC, { pawnDouble: true });
        }
        for (const dc of [-1,1]) {
          const tr = fromR + dir, tc = fromC + dc;
          if (!inBounds(tr,tc)) continue;
          const target = b[tr][tc];
          if (target && colorOf(target) !== color) {
            if (tr === promotionRow) add(tr,tc,{ capture:true, promotion:true });
            else add(tr,tc,{ capture:true });
          }
          if (!forAttack && state.enPassant && state.enPassant.r === tr && state.enPassant.c === tc) {
            add(tr,tc,{ capture:true, enPassant:true });
          }
          if (forAttack && inBounds(tr,tc)) add(tr,tc,{ attackOnly:true });
        }
      }
      if (t === 'N') {
        for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
          const tr=fromR+dr, tc=fromC+dc;
          if (!inBounds(tr,tc)) continue;
          const target=b[tr][tc];
          if (!target || colorOf(target)!==color) add(tr,tc,{ capture:!!target });
        }
      }
      if (['B','R','Q'].includes(t)) {
        const dirs=[];
        if (['B','Q'].includes(t)) dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
        if (['R','Q'].includes(t)) dirs.push([1,0],[-1,0],[0,1],[0,-1]);
        for (const [dr,dc] of dirs) {
          let tr=fromR+dr, tc=fromC+dc;
          while (inBounds(tr,tc)) {
            const target=b[tr][tc];
            if (!target) add(tr,tc);
            else {
              if (colorOf(target)!==color) add(tr,tc,{ capture:true });
              break;
            }
            tr+=dr; tc+=dc;
          }
        }
      }
      if (t === 'K') {
        for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
          if (!dr && !dc) continue;
          const tr=fromR+dr, tc=fromC+dc;
          if (!inBounds(tr,tc)) continue;
          const target=b[tr][tc];
          if (!target || colorOf(target)!==color) add(tr,tc,{ capture:!!target });
        }
        if (!forAttack) {
          if (color === 'w' && fromR === 7 && fromC === 4) {
            if (state.castling.wK && !b[7][5] && !b[7][6]) add(7,6,{ castle:'K' });
            if (state.castling.wQ && !b[7][3] && !b[7][2] && !b[7][1]) add(7,2,{ castle:'Q' });
          }
          if (color === 'b' && fromR === 0 && fromC === 4) {
            if (state.castling.bK && !b[0][5] && !b[0][6]) add(0,6,{ castle:'K' });
            if (state.castling.bQ && !b[0][3] && !b[0][2] && !b[0][1]) add(0,2,{ castle:'Q' });
          }
        }
      }
      return moves;
    }
    function applyMove(state, move, chosenPromotion = null) {
      const s = cloneGameState(state);
      const piece = s.board[move.fromR][move.fromC];
      const color = colorOf(piece);
      const opp = enemy(color);
      let captured = s.board[move.toR][move.toC];
      s.board[move.fromR][move.fromC] = null;
      if (move.enPassant) {
        const capR = move.toR + (color === 'w' ? 1 : -1);
        captured = s.board[capR][move.toC];
        s.board[capR][move.toC] = null;
      }
      if (move.castle) {
        if (move.castle === 'K') {
          s.board[move.toR][5] = s.board[move.toR][7];
          s.board[move.toR][7] = null;
        } else {
          s.board[move.toR][3] = s.board[move.toR][0];
          s.board[move.toR][0] = null;
        }
      }
      let placed = piece;
      if (move.promotion) {
        const promoType = chosenPromotion || 'Q';
        placed = `${color}${promoType}`;
      }
      s.board[move.toR][move.toC] = placed;
      if (captured) {
        if (color === 'w') s.capturedWhite.push(captured);
        else s.capturedBlack.push(captured);
      }
      if (piece === 'wK') { s.castling.wK = false; s.castling.wQ = false; }
      if (piece === 'bK') { s.castling.bK = false; s.castling.bQ = false; }
      if (piece === 'wR' && move.fromR === 7 && move.fromC === 0) s.castling.wQ = false;
      if (piece === 'wR' && move.fromR === 7 && move.fromC === 7) s.castling.wK = false;
      if (piece === 'bR' && move.fromR === 0 && move.fromC === 0) s.castling.bQ = false;
      if (piece === 'bR' && move.fromR === 0 && move.fromC === 7) s.castling.bK = false;
      if (captured === 'wR' && move.toR === 7 && move.toC === 0) s.castling.wQ = false;
      if (captured === 'wR' && move.toR === 7 && move.toC === 7) s.castling.wK = false;
      if (captured === 'bR' && move.toR === 0 && move.toC === 0) s.castling.bQ = false;
      if (captured === 'bR' && move.toR === 0 && move.toC === 7) s.castling.bK = false;
      s.enPassant = null;
      if (move.pawnDouble) s.enPassant = { r: (move.fromR + move.toR) / 2, c: move.fromC };
      if (typeOf(piece) === 'P' || captured) s.halfmoveClock = 0;
      else s.halfmoveClock += 1;
      if (color === 'b') s.fullmoveNumber += 1;
      s.turn = opp;
      s.lastMove = { fromR: move.fromR, fromC: move.fromC, toR: move.toR, toC: move.toC };
      return { state: s, captured, movedPiece: piece, placedPiece: placed };
    }
    function legalMovesForPiece(state, r, c) {
      const p = state.board[r][c];
      if (!p || colorOf(p) !== state.turn) return [];
      const pseudo = generatePseudoMoves(state, r, c, false);
      const legal = [];
      for (const m of pseudo) {
        if (m.castle) {
          const color = state.turn;
          const row = color === 'w' ? 7 : 0;
          const passCols = m.castle === 'K' ? [4,5,6] : [4,3,2];
          if (isInCheck(state, color)) continue;
          if (passCols.some(col => isSquareAttacked(state, row, col, enemy(color)))) continue;
        }
        const result = applyMove(state, m, m.promotion ? 'Q' : null).state;
        if (!isInCheck(result, state.turn)) legal.push(m);
      }
      return legal;
    }
    function generateAllLegalMoves(state, color = state.turn) {
      const moves = [];
      const savedTurn = state.turn;
      state.turn = color;
      for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
        const p = state.board[r][c];
        if (p && colorOf(p) === color) moves.push(...legalMovesForPiece(state,r,c));
      }
      state.turn = savedTurn;
      return moves;
    }
    function isInsufficientMaterial(state) {
      const pieces = [];
      for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
        const p = state.board[r][c];
        if (p) pieces.push(p);
      }
      const noKings = pieces.filter(p => typeOf(p) !== 'K');
      if (noKings.length === 0) return true;
      if (noKings.length === 1 && ['B','N'].includes(typeOf(noKings[0]))) return true;
      return false;
    }
    function gameResult(state) {
      const moves = generateAllLegalMoves(state, state.turn);
      const inCheck = isInCheck(state, state.turn);
      if (moves.length === 0 && inCheck) return { type: 'checkmate', winner: enemy(state.turn) };
      if (moves.length === 0 && !inCheck) return { type: 'stalemate', winner: null };
      if (isInsufficientMaterial(state)) return { type: 'insufficient', winner: null };
      if (state.halfmoveClock >= 100) return { type: 'fifty', winner: null };
      return null;
    }
    function notationForMove(prevState, move, nextState, movedPiece, captured, promotionType) {
      const t = typeOf(movedPiece);
      if (move.castle) return move.castle === 'K' ? 'O-O' : 'O-O-O';
      const dest = squareName(move.toR, move.toC);
      const isCapture = !!captured || move.enPassant;
      let note = '';
      if (t === 'P') {
        if (isCapture) note += `${FILES[move.fromC]}x${dest}`;
        else note += dest;
      } else {
        note += t;
        if (isCapture) note += 'x';
        note += dest;
      }
      if (move.promotion) note += `=${promotionType || 'Q'}`;
      const result = gameResult(nextState);
      if (result?.type === 'checkmate') note += '#';
      else if (isInCheck(nextState, nextState.turn)) note += '+';
      return note;
    }
    function evaluateBoard(state, levelKey) {
      let score = 0;
      let whiteMob = 0, blackMob = 0;
      for (let r=0;r<8;r++) {
        for (let c=0;c<8;c++) {
          const p = state.board[r][c];
          if (!p) continue;
          const color = colorOf(p), t = typeOf(p);
          const base = PIECE_VALUES[t];
          const pr = color === 'w' ? r : 7-r;
          let pst = PST[t][pr][c] || 0;
          if (t === 'P') {
            let sameFile = 0;
            for (let rr=0; rr<8; rr++) if (state.board[rr][c] === `${color}P`) sameFile++;
            if (sameFile > 1) pst -= 8;
            const adjacentFiles = [c-1,c+1].filter(x => x>=0 && x<8);
            let isolated = true;
            for (const f of adjacentFiles) {
              for (let rr=0; rr<8; rr++) if (state.board[rr][f] === `${color}P`) isolated = false;
            }
            if (isolated) pst -= 10;
          }
          if (t === 'R') {
            let fileHasPawn = false;
            for (let rr=0; rr<8; rr++) if (typeOf(state.board[rr][c]) === 'P') fileHasPawn = true;
            if (!fileHasPawn) pst += 12;
            if ((color === 'w' && r === 1) || (color === 'b' && r === 6)) pst += 10;
          }
          if (['hard','expert'].includes(levelKey)) {
            // Piece activity scoring: reward active pieces beyond home ranks and central influence.
            if (t === 'N' || t === 'B') {
              const developed = (color === 'w' ? r < 7 : r > 0) ? 8 : 0;
              const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
              pst += developed + Math.max(0, 6 - centerDist * 2);
            }
            if (t === 'Q') {
              const isEarly = state.fullmoveNumber < 12;
              if (isEarly && ((color === 'w' && r < 6) || (color === 'b' && r > 1))) pst -= 10;
            }
          }
          if (t === 'K') {
            const home = color === 'w' ? [7,6] : [0,6];
            if (r === home[0] && (c === 6 || c === 2)) pst += 15;
            const shieldRow = color === 'w' ? r-1 : r+1;
            let shields = 0;
            for (let dc=-1; dc<=1; dc++) {
              const sr = shieldRow, sc = c+dc;
              if (inBounds(sr,sc) && state.board[sr][sc] === `${color}P`) shields++;
            }
            pst -= (3-shields) * 12;
          }
          const v = base + pst;
          score += color === 'b' ? v : -v;
        }
      }
      const savedTurn = state.turn;
      state.turn = 'w'; whiteMob = generateAllLegalMoves(state, 'w').length;
      state.turn = 'b'; blackMob = generateAllLegalMoves(state, 'b').length;
      state.turn = savedTurn;
      if (['medium','hard','expert'].includes(levelKey)) score += (blackMob - whiteMob) * 5;
      if (levelKey === 'expert') score += (blackMob - whiteMob) * 2;
      if (levelKey === 'easy') score += (blackMob - whiteMob) * 2;
      return score;
    }
    function minimax(state, depth, alpha, beta, maximizing, levelKey, searchCtx = null) {
      if (searchCtx) {
        searchCtx.nodes += 1;
        if (searchCtx.nodes >= searchCtx.maxNodes) searchCtx.aborted = true;
        if ((searchCtx.nodes & 1023) === 0 && (performance.now() - searchCtx.startMs) > searchCtx.maxTimeMs) searchCtx.aborted = true;
        if (searchCtx.aborted) return evaluateBoard(state, levelKey);
      }
      const result = gameResult(state);
      if (result) {
        if (result.type === 'checkmate') return maximizing ? -999999 : 999999;
        return 0;
      }
      if (depth === 0) return evaluateBoard(state, levelKey);
      const moves = generateAllLegalMoves(state, state.turn);
      if (maximizing) {
        let maxEval = -Infinity;
        for (const m of moves) {
          const promoted = m.promotion ? 'Q' : null;
          const next = applyMove(state, m, promoted).state;
          const val = minimax(next, depth-1, alpha, beta, false, levelKey, searchCtx);
          maxEval = Math.max(maxEval, val);
          alpha = Math.max(alpha, val);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const m of moves) {
          const promoted = m.promotion ? 'Q' : null;
          const next = applyMove(state, m, promoted).state;
          const val = minimax(next, depth-1, alpha, beta, true, levelKey, searchCtx);
          minEval = Math.min(minEval, val);
          beta = Math.min(beta, val);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    }
    function chooseAIMove(state) {
      const diff = state.selectedDifficulty;
      const moves = generateAllLegalMoves(state, 'b');
      if (!moves.length) return null;
      if (diff.key === 'beginner') {
        const captures = moves.filter(m => state.board[m.toR][m.toC] || m.enPassant);
        const pool = Math.random() < 0.35 ? moves : (captures.length ? captures : moves);
        return pool[Math.floor(Math.random() * pool.length)];
      }
      if (diff.key === 'easy') {
        let best = -Infinity, chosen = moves[0];
        for (const m of moves) {
          const next = applyMove(state, m, m.promotion ? 'Q' : null).state;
          let score = evaluateBoard(next, 'easy');
          if (state.board[m.toR][m.toC] || m.enPassant) score += 70;
          if ([3,4].includes(m.toR) && [3,4].includes(m.toC)) score += 20;
          if (isSquareAttacked(next, m.toR, m.toC, 'w')) score -= 35;
          score += Math.random() * 12;
          if (score > best) { best = score; chosen = m; }
        }
        return chosen;
      }
      const searchLimits = {
        medium: { maxNodes: 30000, maxTimeMs: 350 },
        hard: { maxNodes: 50000, maxTimeMs: 650 },
        expert: { maxNodes: 70000, maxTimeMs: 950 }
      }[diff.key] || { maxNodes: 25000, maxTimeMs: 300 };
      const depth = diff.depth;
      let bestVal = -Infinity;
      let bestMoves = [];
      const searchCtx = { nodes: 0, maxNodes: searchLimits.maxNodes, maxTimeMs: searchLimits.maxTimeMs, startMs: performance.now(), aborted: false };
      for (const m of moves) {
        const next = applyMove(state, m, m.promotion ? 'Q' : null).state;
        const val = minimax(next, depth-1, -Infinity, Infinity, false, diff.key, searchCtx);
        if (val > bestVal) { bestVal = val; bestMoves = [m]; }
        else if (val === bestVal) bestMoves.push(m);
        if (searchCtx.aborted) break;
      }
      if (!bestMoves.length) return moves[Math.floor(Math.random() * moves.length)];
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    async function chooseAIMoveAsync(state) {
      return new Promise(resolve => setTimeout(() => resolve(chooseAIMove(state)), 0));
    }

    async function animateMove(fromR, fromC, toR, toC, movedPiece, capturedPiece) {
      const fromSq = document.querySelector(`.square[data-r='${fromR}'][data-c='${fromC}']`);
      const toSq = document.querySelector(`.square[data-r='${toR}'][data-c='${toC}']`);
      if (!fromSq || !toSq) return;
      const fromRect = fromSq.getBoundingClientRect();
      const toRect = toSq.getBoundingClientRect();
      if (capturedPiece) {
        const cap = document.createElement('div');
        cap.className = `piece ${colorOf(capturedPiece)==='w'?'white':'black'} captured-fx`;
        cap.textContent = PIECE_UNICODE[capturedPiece];
        cap.style.left = `${toRect.left}px`;
        cap.style.top = `${toRect.top}px`;
        cap.style.width = `${toRect.width}px`;
        cap.style.height = `${toRect.height}px`;
        cap.style.display = 'flex';
        cap.style.alignItems = 'center';
        cap.style.justifyContent = 'center';
        document.body.appendChild(cap);
        requestAnimationFrame(() => {
          cap.style.opacity = '0';
          cap.style.transform = 'scale(0)';
        });
        setTimeout(() => cap.remove(), 210);
      }
      const fp = document.createElement('div');
      fp.className = `piece ${colorOf(movedPiece)==='w'?'white':'black'} floating-piece`;
      fp.textContent = PIECE_UNICODE[movedPiece];
      fp.style.left = `${fromRect.left}px`;
      fp.style.top = `${fromRect.top}px`;
      fp.style.width = `${fromRect.width}px`;
      fp.style.height = `${fromRect.height}px`;
      fp.style.display = 'flex';
      fp.style.alignItems = 'center';
      fp.style.justifyContent = 'center';
      document.body.appendChild(fp);
      const dx = toRect.left - fromRect.left;
      const dy = toRect.top - fromRect.top;
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          fp.style.transform = `translate(${dx}px, ${dy}px)`;
          setTimeout(resolve, 260);
        });
      });
      fp.remove();
    }
    function render() {
      if (!boardEl || !game) return;
      boardEl.innerHTML = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const sq = document.createElement('div');
          sq.className = `square ${(r+c)%2===0?'light':'dark'}`;
          sq.dataset.r = r;
          sq.dataset.c = c;
          if (selected && selected.r === r && selected.c === c) sq.classList.add('selected');
          if (game.lastMove && ((game.lastMove.fromR===r&&game.lastMove.fromC===c)||(game.lastMove.toR===r&&game.lastMove.toC===c))) sq.classList.add('last-move');
          const king = game.board[r][c];
          if (king && typeOf(king) === 'K' && colorOf(king) === game.turn && isInCheck(game, game.turn)) {
            sq.classList.add('check');
            if (game.pendingCheckFlash && game.pendingCheckFlash.r === r && game.pendingCheckFlash.c === c) sq.classList.add('flash');
          }
          const move = validMoves.find(m => m.toR === r && m.toC === c);
          if (move) {
            const target = game.board[r][c] || (move.enPassant ? `${enemy(game.turn)}P` : null);
            if (target) {
              const ring = document.createElement('div');
              ring.className = 'capture-ring';
              sq.appendChild(ring);
            } else {
              const dot = document.createElement('div');
              dot.className = 'move-dot';
              sq.appendChild(dot);
            }
          }
          const piece = game.board[r][c];
          if (piece) {
            const sp = document.createElement('span');
            sp.className = `piece ${colorOf(piece)==='w'?'white':'black'}`;
            sp.textContent = PIECE_UNICODE[piece];
            sq.appendChild(sp);
          }
          sq.addEventListener('click', () => handleSquareClick(r,c));
          boardEl.appendChild(sq);
        }
      }
      turnDotEl.style.background = game.turn === 'w' ? '#fff' : '#000';
      turnTextEl.textContent = game.gameOver ? 'Game Over' : `${game.turn === 'w' ? 'White' : 'Black'} to move`;
      const inCheck = isInCheck(game, game.turn);
      let status = `${game.turn === 'w' ? 'White' : 'Black'} to move.`;
      if (inCheck) status += ' Check!';
      if (game.gameOver) status = game.gameOver.message;
      statusTextEl.textContent = status;
      difficultyTextEl.textContent = `${game.selectedDifficulty.name} (ELO ~${game.selectedDifficulty.elo})`;
      whiteCapturedEl.textContent = game.capturedWhite.map(p => PIECE_UNICODE[p]).join(' ');
      blackCapturedEl.textContent = game.capturedBlack.map(p => PIECE_UNICODE[p]).join(' ');
      whiteTimerEl.textContent = formatClock(game.whiteTimeMs || 0);
      blackTimerEl.textContent = formatClock(game.blackTimeMs || 0);
      const resignBtn = byId('resignBtn');
      if (resignBtn) resignBtn.disabled = !game || !!game.gameOver;
      renderHistory();
    }
    function renderHistory() {
      historyEl.innerHTML = '<div class="hdr">#</div><div class="hdr">White</div><div class="hdr">Black</div>';
      for (let i = 0; i < game.moveHistory.length; i += 2) {
        const idx = Math.floor(i/2) + 1;
        const w = game.moveHistory[i] || '';
        const b = game.moveHistory[i+1] || '';
        historyEl.innerHTML += `<div>${idx}.</div><div>${w}</div><div>${b}</div>`;
      }
      historyEl.scrollTop = historyEl.scrollHeight;
    }
    async function makeMove(move, promotionChoice = null) {
      if (game.gameOver) return;
      const movingPiece = game.board[move.fromR][move.fromC];
      let captured = game.board[move.toR][move.toC];
      if (move.enPassant) {
        const capR = move.toR + (game.turn === 'w' ? 1 : -1);
        captured = game.board[capR][move.toC];
      }
      await animateMove(move.fromR, move.fromC, move.toR, move.toC, movingPiece, captured);
      const prev = cloneGameState(game);
      const applied = applyMove(game, move, promotionChoice);
      game = applied.state;
      const notation = notationForMove(prev, move, game, movingPiece, applied.captured, promotionChoice);
      game.moveHistory.push(notation);
      game.reviewPositions.push(prev);
      game.reviewPlies.push({
        fromR: move.fromR, fromC: move.fromC, toR: move.toR, toC: move.toC,
        notation, movedPiece: movingPiece, captured: applied.captured,
        boardAfter: game.board.map(row => [...row]),
        turnAfter: game.turn,
        promotion: promotionChoice,
        castle: move.castle || null
      });
      selected = null;
      validMoves = [];
      const result = gameResult(game);
      if (result) {
        finishGame(result);
      } else {
        const kingPos = findKing(game.board, game.turn);
        if (isInCheck(game, game.turn) && kingPos) {
          game.pendingCheckFlash = { r: kingPos[0], c: kingPos[1] };
          setTimeout(() => { game.pendingCheckFlash = null; render(); }, 900);
        }
      }
      render();
      maybeAIMove();
    }
    function resignGame() {
      if (!game || game.gameOver) return;
      const winner = game.aiColor || enemy(game.playerColor || 'w');
      finishGame({ type: 'resign', winner });
    }
    function finishGame(result) {
      let msg = '';
      if (result.type === 'checkmate') msg = `Checkmate — ${result.winner === 'w' ? 'White' : 'Black'} wins`;
      if (result.type === 'resign') msg = `${result.winner === 'w' ? 'White' : 'Black'} wins by resignation`;
      if (result.type === 'stalemate') msg = 'Stalemate — Draw';
      if (result.type === 'insufficient') msg = 'Draw by insufficient material';
      if (result.type === 'fifty') msg = 'Draw by 50-move rule';
      game.gameOver = { ...result, message: msg };
      gameOverTitleEl.textContent = result.type === 'checkmate' ? 'Checkmate' : 'Game Over';
      gameOverBodyEl.textContent = `${msg}. Final move count: ${game.moveHistory.length}.`;
      reviewMeta = {
        whiteName: game.playerName || 'User',
        blackName: game.aiName || 'Computer',
        userColor: game.playerColor || 'w',
        aiColor: game.aiColor || 'b'
      };
      gameReviewData = {
        initialState: {
          board: createInitialBoard(),
          turn: 'w',
          castling: { wK: true, wQ: true, bK: true, bQ: true },
          enPassant: null,
          halfmoveClock: 0,
          fullmoveNumber: 1
        },
        plies: game.reviewPlies.map(m => ({ ...m, boardAfter: m.boardAfter.map(r => [...r]) })),
        positions: game.reviewPositions.map(st => cloneGameState(st)),
        moveHistory: [...game.moveHistory],
        result: msg,
        evals: [],
        bestMoves: [],
        bestEvals: [],
        classifications: []
      };
      saveGameToLocalStorage();
      stopGameClock();
      gameOverModal.classList.add('show');
    }
    function handleSquareClick(r,c) {
      if (!game || game.gameOver || aiThinking || game.turn !== 'w' || pendingPromotion) return;
      const p = game.board[r][c];
      if (selected) {
        const move = validMoves.find(m => m.toR === r && m.toC === c);
        if (move) {
          if (move.promotion) {
            pendingPromotion = move;
            openPromotionModal('w');
            return;
          }
          makeMove(move);
          return;
        }
      }
      if (p && colorOf(p) === 'w') {
        selected = { r, c };
        validMoves = legalMovesForPiece(game, r, c);
      } else {
        selected = null;
        validMoves = [];
      }
      render();
    }
    function openPromotionModal(color) {
      promotionChoicesEl.innerHTML = '';
      const options = ['Q','R','B','N'];
      for (const t of options) {
        const btn = document.createElement('button');
        btn.className = 'promo-btn';
        btn.textContent = PIECE_UNICODE[`${color}${t}`];
        btn.addEventListener('click', () => {
          promotionModal.classList.remove('show');
          const move = pendingPromotion;
          pendingPromotion = null;
          makeMove(move, t);
        });
        promotionChoicesEl.appendChild(btn);
      }
      promotionModal.classList.add('show');
    }
    function maybeAIMove() {
      if (!game || game.gameOver || game.turn !== 'b') return;
      aiThinking = true;
      setTimeout(async () => {
        const move = await chooseAIMoveAsync(game);
        aiThinking = false;
        if (!move) {
          const result = gameResult(game);
          if (result) finishGame(result);
          render();
          return;
        }
        const promote = move.promotion ? 'Q' : null;
        await makeMove(move, promote);
      }, 500);
    }
    function moveToString(m) {
      if (!m) return '--';
      return `${squareName(m.fromR, m.fromC)}→${squareName(m.toR, m.toC)}`;
    }
    function classifyMove(cpLoss) {
      if (cpLoss <= 10) return { label: 'Best', icon: '★', color: '#5c8a3c' };
      if (cpLoss <= 30) return { label: 'Excellent', icon: '✓', color: '#96bc4b' };
      if (cpLoss <= 100) return { label: 'Good', icon: '•', color: '#d6dbe8' };
      if (cpLoss <= 200) return { label: 'Inaccuracy', icon: '!', color: '#f0c15b' };
      if (cpLoss <= 400) return { label: 'Mistake', icon: '?', color: '#e07b37' };
      return { label: 'Blunder', icon: '??', color: '#ca3431' };
    }
    function accuracyFromLoss(cpLoss) {
      return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * cpLoss) - 3.1668));
    }
    function analyzeReviewData(startAtBlunder = false) {
      if (!gameReviewData) return;
      const app = appContainer();
      if (app) app.style.display = 'none';
      reviewScreenEl.classList.add('show');
      document.getElementById('reviewLoading').style.display = 'block';
      document.getElementById('reviewSummary').style.display = 'none';
      document.getElementById('reviewMain').style.display = 'none';
      const total = gameReviewData.plies.length;
      let i = 0;
      gameReviewData.evals = [];
      gameReviewData.bestMoves = [];
      gameReviewData.bestEvals = [];
      const step = () => {
        if (i >= total) {
          buildReviewSummary(startAtBlunder);
          return;
        }
        const st = cloneGameState(gameReviewData.positions[i]);
        const all = generateAllLegalMoves(st, st.turn);
        let bestMove = null;
        let bestEval = st.turn === 'w' ? -Infinity : Infinity;
        for (const m of all) {
          const next = applyMove(st, m, m.promotion ? 'Q' : null).state;
          const whiteEval = -evaluateBoard(next, 'expert');
          if (st.turn === 'w') {
            if (whiteEval > bestEval) { bestEval = whiteEval; bestMove = m; }
          } else {
            if (whiteEval < bestEval) { bestEval = whiteEval; bestMove = m; }
          }
        }
        const actualEval = -evaluateBoard({ ...st, board: gameReviewData.plies[i].boardAfter, turn: gameReviewData.plies[i].turnAfter, castling: st.castling, enPassant: st.enPassant, halfmoveClock: st.halfmoveClock, fullmoveNumber: st.fullmoveNumber }, 'expert');
        gameReviewData.bestMoves.push(bestMove);
        gameReviewData.bestEvals.push(Math.max(-1000, Math.min(1000, Math.round(bestEval))));
        gameReviewData.evals.push(Math.max(-1000, Math.min(1000, Math.round(actualEval))));
        i++;
        document.getElementById('reviewLoadingText').textContent = `Analyzing game... move ${i}/${total}`;
        document.getElementById('reviewProgressBar').style.width = `${(i/Math.max(1,total))*100}%`;
        setTimeout(step, 0);
      };
      step();
    }
    function drawEvalGraph(canvasId, currentIndex = -1) {
      const c = document.getElementById(canvasId);
      const ctx = c.getContext('2d');
      const w = c.width, h = c.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#171a31'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = '#6b7094'; ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke();
      const vals = gameReviewData?.evals || [];
      if (!vals.length) return;
      const pts = vals.map((v,idx)=>{
        const x = vals.length===1 ? w/2 : (idx/(vals.length-1))*w;
        const y = h/2 - (Math.max(-10,Math.min(10,v/100))/10)*(h/2-8);
        return [x,y];
      });
      ctx.strokeStyle = '#f0d9b5'; ctx.lineWidth = 2; ctx.beginPath();
      pts.forEach((p,idx)=>{ if(idx===0) ctx.moveTo(...p); else { const prev=pts[idx-1]; const cx=(prev[0]+p[0])/2; ctx.quadraticCurveTo(cx,prev[1],p[0],p[1]); }});
      ctx.stroke();
      if (currentIndex >= 0) {
        const x = vals.length===1 ? w/2 : (currentIndex/(vals.length-1))*w;
        ctx.strokeStyle = 'yellow'; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
      }
      c.onclick = (e) => {
        if (!reviewState || reviewState.phase !== 'main') return;
        const rect = c.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const idx = Math.max(0, Math.min(vals.length-1, Math.round((x/rect.width)*(vals.length-1))));
        setReviewIndex(idx+1);
      };
    }
    function buildReviewSummary(startAtBlunder = false) {
      const classifs = [];
      const whiteNameEl = document.getElementById('whitePlayerName');
      const blackNameEl = document.getElementById('blackPlayerName');
      if (whiteNameEl) whiteNameEl.textContent = reviewMeta.whiteName || 'White';
      if (blackNameEl) blackNameEl.textContent = reviewMeta.blackName || 'Black';
      renderSideAssignment();
      const playerColor = reviewMeta.userColor || game?.playerColor || 'w';
      const aiColor = reviewMeta.aiColor || game?.aiColor || enemy(playerColor);
      const sideAcc = { w: [], b: [] };

      for (let i=0;i<gameReviewData.plies.length;i++) {
        const mover = i % 2 === 0 ? 'w' : 'b';
        const actual = gameReviewData.evals[i];
        const best = gameReviewData.bestEvals[i];
        const cpLoss = mover === 'w' ? Math.max(0, best - actual) : Math.max(0, actual - best);
        let cls = classifyMove(cpLoss);
        if (cls.label === 'Best' && gameReviewData.plies[i].captured && !gameReviewData.bestMoves[i]?.capture) cls = { label:'Brilliant', icon:'★★', color:'#1baca6' };
        classifs.push({ ...cls, cpLoss, moveIndex: i, mover });
        sideAcc[mover].push(accuracyFromLoss(cpLoss));
      }

      gameReviewData.classifications = classifs;
      const avg = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 100;
      const playerAcc = avg(sideAcc[playerColor]);
      const aiAcc = avg(sideAcc[aiColor]);

      document.getElementById('whiteAccuracy').innerHTML = `<span style="display:inline-block;background:#fff;color:#111;padding:2px 10px;border-radius:6px;min-width:84px;">${playerAcc.toFixed(1)}</span>`;
      document.getElementById('blackAccuracy').innerHTML = `<span style="display:inline-block;background:#2b2f39;color:#fff;padding:2px 10px;border-radius:6px;min-width:84px;">${aiAcc.toFixed(1)}</span>`;

      const bySide = {
        player: classifs.filter(c => c.mover === playerColor),
        ai: classifs.filter(c => c.mover === aiColor)
      };
      const countBy = (arr, labels) => arr.filter(c => labels.includes(c.label)).length;
      const rows = [
        { name:'Brilliant', icon:'‼', iconBg:'#1baca6', labels:['Brilliant'], color:'#21e6d8' },
        { name:'Great', icon:'!', iconBg:'#4f7fb6', labels:['Excellent'], color:'#9cc7ff' },
        { name:'Best', icon:'★', iconBg:'#7bb342', labels:['Best'], color:'#7dff84' },
        { name:'Mistake', icon:'?', iconBg:'#e07b37', labels:['Mistake','Inaccuracy'], color:'#ff9f6a' },
        { name:'Miss', icon:'✖', iconBg:'#9b59b6', labels:['Miss'], color:'#d7a4ff' },
        { name:'Blunder', icon:'??', iconBg:'#ca3431', labels:['Blunder'], color:'#ff615b' }
      ];
      document.getElementById('leftClassCol').innerHTML = rows.map(r => `<div class="class-row"><span>${r.name}</span><span style="font-weight:700;color:${r.color};">${countBy(bySide.player,r.labels)}</span></div>`).join('');
      document.getElementById('classLegendCol').innerHTML = rows.map(r => `<div class="class-icon-wrap"><span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${r.iconBg};font-weight:800;">${r.icon}</span></div>`).join('');
      document.getElementById('rightClassCol').innerHTML = rows.map(r => `<div class="class-row"><span style="font-weight:700;color:${r.color};">${countBy(bySide.ai,r.labels)}</span><span style="opacity:.9">${r.name}</span></div>`).join('');

      const rating = (acc, who) => Math.max(400, Math.min(2800, Math.round(500 + acc*18 - countBy(bySide[who],['Blunder'])*70 - countBy(bySide[who],['Mistake'])*25)));
      document.getElementById('whiteGameRating').textContent = rating(playerAcc, 'player');
      document.getElementById('blackGameRating').textContent = rating(aiAcc, 'ai');

      const phaseIcon = (arr) => {
        if (!arr.length) return '-';
        const avgP = arr.reduce((a,b)=>a+b,0)/arr.length;
        return avgP >= 80 ? '👍' : avgP >= 60 ? '⚠️' : '👎';
      };
      const split = (arr, part) => {
        if (!arr.length) return [];
        const n = arr.length;
        const a = Math.floor(n/3), b = Math.floor(2*n/3);
        return part===0 ? arr.slice(0,a||1) : part===1 ? arr.slice(a||1,b||Math.max(2,n-1)) : arr.slice(b||Math.max(2,n-1));
      };
      const playerMoves = sideAcc[playerColor], aiMoves = sideAcc[aiColor];
      document.getElementById('whiteOpening').textContent = phaseIcon(split(playerMoves,0));
      document.getElementById('whiteMiddle').textContent = phaseIcon(split(playerMoves,1));
      document.getElementById('whiteEnd').textContent = phaseIcon(split(playerMoves,2));
      document.getElementById('blackOpening').textContent = phaseIcon(split(aiMoves,0));
      document.getElementById('blackMiddle').textContent = phaseIcon(split(aiMoves,1));
      document.getElementById('blackEnd').textContent = phaseIcon(split(aiMoves,2));

      const swings = classifs.map((c,i)=>({i,s:Math.abs((gameReviewData.evals[i]||0)-(gameReviewData.evals[i-1]||0))})).sort((a,b)=>b.s-a.s).slice(0,3);
      document.getElementById('keyMoments').innerHTML = swings.map(k=>{
        const p = gameReviewData.plies[k.i];
        return `Move ${k.i+1}: ${p.notation}, eval swing ${(k.s/100).toFixed(1)} | best ${moveToString(gameReviewData.bestMoves[k.i])}`;
      }).join('<br>');
      drawEvalGraph('evalGraphSummary');
      document.getElementById('reviewLoading').style.display = 'none';
      document.getElementById('reviewSummary').style.display = 'block';
      reviewState = { phase: 'summary' };
      if (startAtBlunder) {
        const idx = classifs.findIndex(c => c.label === 'Blunder' || c.label === 'Mistake');
        startReview(Math.max(1, idx+1));
      }
    }
function renderReviewBoard(index) {
      const board = index === 0 ? createInitialBoard() : gameReviewData.plies[index-1].boardAfter;
      reviewBoardEl.innerHTML = '';
      for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
        const sq = document.createElement('div');
        sq.className = `square ${(r+c)%2===0?'light':'dark'}`;
        const last = index>0 ? gameReviewData.plies[index-1] : null;
        if (last && ((last.fromR===r&&last.fromC===c)||(last.toR===r&&last.toC===c))) sq.classList.add('last-move');
        const p = board[r][c];
        if (p) {
          const sp = document.createElement('span');
          sp.className = `piece ${colorOf(p)==='w'?'white':'black'}`;
          sp.textContent = PIECE_UNICODE[p];
          sq.appendChild(sp);
        }
        if (last && last.toR===r && last.toC===c) {
          const cls = gameReviewData.classifications[index-1];
          const dot = document.createElement('div');
          dot.style.width='12px'; dot.style.height='12px'; dot.style.borderRadius='50%'; dot.style.background=cls?.color||'#5ad1ff';
          dot.style.position='absolute'; dot.style.bottom='5px'; dot.style.right='5px'; sq.appendChild(dot);
          if (cls && (cls.label==='Mistake' || cls.label==='Blunder')) sq.style.boxShadow='inset 0 0 0 999px rgba(255,0,0,0.18)';
        }
        reviewBoardEl.appendChild(sq);
      }
    }
    function renderReviewMoveList(currentIdx) {
      const el = document.getElementById('reviewMoveList');
      el.innerHTML = '<div class="hdr">#</div><div class="hdr">White</div><div class="hdr">Black</div>';
      for (let i=0;i<gameReviewData.plies.length;i+=2) {
        const n = Math.floor(i/2)+1;
        const w = gameReviewData.plies[i];
        const b = gameReviewData.plies[i+1];
        const wc = gameReviewData.classifications[i];
        const bc = gameReviewData.classifications[i+1];
        el.innerHTML += `<div>${n}.</div><div data-jump="${i+1}" style="cursor:pointer;${currentIdx===i+1?'background:#2b315a':''}"><span style="color:${wc?.color||'#fff'}">${wc?.icon||''}</span> ${w?.notation||''}</div><div data-jump="${i+2}" style="cursor:pointer;${currentIdx===i+2?'background:#2b315a':''}"><span style="color:${bc?.color||'#fff'}">${bc?.icon||''}</span> ${b?.notation||''}</div>`;
      }
      el.querySelectorAll('[data-jump]').forEach(n=>n.onclick=()=>setReviewIndex(Number(n.dataset.jump)));
    }
    function setReviewIndex(index) {
      if (!reviewState || reviewState.phase !== 'main') return;
      reviewState.index = Math.max(0, Math.min(gameReviewData.plies.length, index));
      const i = reviewState.index;
      renderReviewBoard(i);
      renderReviewMoveList(i);
      drawEvalGraph('evalGraph', Math.max(0, i-1));
      const cp = i>0 ? gameReviewData.evals[i-1] : 0;
      const norm = Math.max(-10, Math.min(10, cp/100));
      const whitePct = ((norm + 10) / 20) * 100;
      document.getElementById('evalBarWhite').style.height = `${whitePct}%`;
      document.getElementById('evalBarBlack').style.height = `${100-whitePct}%`;
      const cls = i>0 ? gameReviewData.classifications[i-1] : null;
      const played = i>0 ? gameReviewData.plies[i-1] : null;
      const best = i>0 ? gameReviewData.bestMoves[i-1] : null;
      if (played && cls) {
        const bestEval = gameReviewData.bestEvals[i-1]/100;
        const actualEval = gameReviewData.evals[i-1]/100;
        const moverName = played.movedPiece?.[0] === 'b' ? 'Black' : 'White';
        const msg = (cls.label==='Best'||cls.label==='Excellent'||cls.label==='Brilliant')
          ? `✅ ${cls.label} move! (${actualEval.toFixed(1)})`
          : `❌ ${moverName} played ${played.notation} ${cls.icon}. Best was ${moveToString(best)} (${bestEval.toFixed(1)})`;
        document.getElementById('bestMoveText').textContent = `Best move was: ${moveToString(best)} | ${msg}`;
        document.getElementById('engineLineText').textContent = `Engine line: ${moveToString(best)} ...`;
      }
    }
    function startReview(startIndex = 0) {
      document.getElementById('reviewSummary').style.display = 'none';
      document.getElementById('reviewMain').style.display = 'block';
      reviewState = { phase: 'main', index: startIndex };
      buildLabelsForReview();
      setReviewIndex(startIndex);

      const whiteRole = reviewMeta.userColor === 'w' ? 'User' : 'Computer AI';
      const blackRole = reviewMeta.userColor === 'b' ? 'User' : 'Computer AI';
      const classOrder = ['Brilliant', 'Excellent', 'Best', 'Good', 'Inaccuracy', 'Mistake', 'Blunder', 'Miss'];
      const byColor = { w: {}, b: {} };
      gameReviewData.classifications.forEach((c, idx) => {
        const mover = idx % 2 === 0 ? 'w' : 'b';
        byColor[mover][c.label] = (byColor[mover][c.label] || 0) + 1;
      });
      const formatCounts = (counts) => {
        const rows = classOrder
          .filter(label => (counts[label] || 0) > 0)
          .map(label => `${label}: ${counts[label]}`);
        return rows.length ? rows.join('<br>') : 'No classified moves yet.';
      };
      document.getElementById('classSummary').innerHTML = `
        <div style="margin-bottom:10px;">
          <strong>Classification summary for Black (${blackRole})</strong><br>
          ${formatCounts(byColor.b)}
        </div>
        <div>
          <strong>Classification summary for White (${whiteRole})</strong><br>
          ${formatCounts(byColor.w)}
        </div>
      `;
    }
    function buildLabelsForReview() {
      const tf = document.getElementById('reviewTopFiles');
      const bf = document.getElementById('reviewBottomFiles');
      const lr = document.getElementById('reviewLeftRanks');
      const rr = document.getElementById('reviewRightRanks');
      tf.innerHTML = bf.innerHTML = FILES.map(f=>`<div>${f}</div>`).join('');
      let ranks=''; for (let r=8;r>=1;r--) ranks += `<div>${r}</div>`;
      lr.innerHTML = rr.innerHTML = ranks;
    }
    function setupDifficultyModal() {
      difficultyListEl.innerHTML = '';
      DIFFICULTIES.forEach(d => {
        const row = document.createElement('div');
        row.className = 'difficulty-item';
        row.innerHTML = `<div><strong>${d.name}</strong><div style="opacity:.8;font-size:13px;">ELO ~${d.elo}</div></div><div>▶</div>`;
        row.addEventListener('click', () => {
          difficultyModal.classList.remove('show');
          newGame(d.key);
        });
        difficultyListEl.appendChild(row);
      });
    }

    on('newGameBtn','click', () => difficultyModal?.classList.add('show'));
    on('newGameTopBtn','click', () => difficultyModal?.classList.add('show'));
    on('changeDifficultyBtn','click', () => difficultyModal?.classList.add('show'));
    on('resignBtn','click', () => {
      if (!game || game.gameOver) return;
      if (confirm('Are you sure you want to resign this game?')) resignGame();
    });
    on('openAnalyzerFromMenuBtn','click', openAnalyzerPage);
    on('playAgainBtn','click', () => {
      gameOverModal?.classList.remove('show');
      newGame(game?.selectedDifficulty?.key || 'easy');
    });
    on('changeDifficultyGameOverBtn','click', () => {
      gameOverModal?.classList.remove('show');
      difficultyModal?.classList.add('show');
    });
    on('copyHistoryBtn','click', async () => {
      if (!game?.moveHistory?.length) return;
      const txt = game.moveHistory.map((m,i)=>`${i+1}. ${m}`).join('\\n');
      await navigator.clipboard.writeText(txt);
      const btn = byId('copyHistoryBtn');
      if (!btn) return;
      btn.textContent = 'Copied!';
      setTimeout(()=>btn.textContent='Copy Move History',1000);
    });
    on('reviewGameBtn','click', () => {
      gameOverModal?.classList.remove('show');
      openAnalyzerPage();
      if (gameReviewData) analyzeReviewData(false);
    });
    on('refreshGamesBtn','click', renderSavedGamesList);
    on('analyzePgnBtn','click', () => prepareReviewFromPGN(pgnInputEl?.value || ''));
    on('backToMenuBtn','click', () => {
      if (!appContainer()) { window.location.href = 'chess.html'; return; }
      reviewScreenEl?.classList.remove('show');
      const app = appContainer();
      if (app) app.style.display = '';
    });
    on('startReviewBtn','click', () => startReview(0));
    on('skipBlundersBtn','click', () => analyzeReviewData(true));
    on('firstMoveBtn','click', () => setReviewIndex(0));
    on('prevMoveBtn','click', () => setReviewIndex((reviewState?.index||0)-1));
    on('nextMoveBtn','click', () => setReviewIndex((reviewState?.index||0)+1));
    on('lastMoveBtn','click', () => setReviewIndex(gameReviewData?.plies?.length||0));
    document.addEventListener('keydown', (e) => {
      if (!reviewState || reviewState.phase !== 'main') return;
      if (e.key === 'ArrowLeft') setReviewIndex((reviewState.index||0)-1);
      if (e.key === 'ArrowRight') setReviewIndex((reviewState.index||0)+1);
    });

    const v = byId('versionFooter');
    if (v) v.textContent = `MMB Chess v${APP_VERSION}`;
    renderSideAssignment();
    buildLabels();
    if (difficultyListEl) setupDifficultyModal();
    renderSavedGamesList();
    renderInitialBoard();
  
