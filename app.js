/**
 * Senior Swipe - Trait System Architecture
 */

const traits = [
    { id: 't1', text: "Will you go to this senior for fashion advice?", category: "social" },
    { id: 't2', text: "Will you go to this senior for pointers to pull baddies?", category: "personality" },
    { id: 't3', text: "Will you go to this senior for gossip/tea?", category: "social" },
    { id: 't4', text: "Will you go to this senior for tutoring?", category: "academic" },
    { id: 't5', text: "Will you go to this senior to bail you out of jail (metaphorically)?", category: "personality" },
    { id: 't6', text: "Will you go to this senior for partying?", category: "social" },
    { id: 't7', text: "Will you go to this senior for consolation after heartbreak?", category: "personality" },
    { id: 't8', text: "Will you go to this senior for deep conversations?", category: "personality" },
    { id: 't9', text: "Will you go to this senior to put one psych scene?", category: "social" }
];

// State
const RATINGS_KEY = 'seniorSwipeTraitRatings';
let ratings = {};

try {
    const storedStr = localStorage.getItem(RATINGS_KEY);
    if (storedStr) {
        ratings = JSON.parse(storedStr);
    }
    if (typeof ratings !== 'object' || ratings === null) {
        ratings = {};
    }
} catch (e) {
    ratings = {};
}

let unratedMembers = [];
let topCard = null;
let topCardHammer = null;
let currentTraitId = null;

// Audio Context for synthesized sounds
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
}

function playSound(type) {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  if (type === 'yes') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'no') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

// ----------------------------------------------------
// Initialization
// ----------------------------------------------------

function initApp() {
  // Ensure ratings object has all traits initialized
  traits.forEach(t => {
      if (!ratings[t.id]) ratings[t.id] = {};
  });

  // Bind Action Buttons in Swipe View
  document.getElementById('btn-no').addEventListener('click', () => handleButtonSwipe('no'));
  document.getElementById('btn-yes').addEventListener('click', () => handleButtonSwipe('yes'));
  document.getElementById('btn-undo').addEventListener('click', undoLastSwipe);

  // Bind Keyboard (Keydown listener)
  document.addEventListener('keydown', (e) => {
    // Swipe keys
    if (document.getElementById('swipe-view').classList.contains('active') && unratedMembers.length > 0) {
      if (e.key === 'ArrowRight') handleButtonSwipe('yes');
      if (e.key === 'ArrowLeft') handleButtonSwipe('no');
    }
    
    // Admin Reset Shortcut: Ctrl+Shift+X
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        resetApp();
    }
  });

  // Reset database button
  const resetBtn = document.getElementById('admin-reset-btn');
  if (resetBtn) {
      resetBtn.addEventListener('click', resetApp);
  } else {
      console.warn("Reset button missing in DOM");
  }

  // Audio unlock on first interaction
  document.body.addEventListener('pointerdown', initAudio, { once: true });
  document.body.addEventListener('keydown', initAudio, { once: true });

  // Bind Leaderboard Select
  const lbSelect = document.getElementById('leaderboard-trait-select');
  if (lbSelect) {
      traits.forEach(trait => {
          const opt = document.createElement('option');
          opt.value = trait.id;
          opt.innerText = `"${trait.text}"`;
          lbSelect.appendChild(opt);
      });
      lbSelect.addEventListener('change', (e) => {
          renderLeaderboard(e.target.value);
      });
  }

  renderTraits();
}

function renderTraits() {
    const grid = document.getElementById('traits-grid');
    if (!grid) return;
    grid.innerHTML = '';

    traits.forEach(trait => {
        const ratedCount = Object.keys(ratings[trait.id] || {}).length;
        const totalMembers = members.length;
        const isCompleted = ratedCount >= totalMembers;

        const card = document.createElement('div');
        card.className = `trait-card ${isCompleted ? 'completed' : ''}`;
        card.onclick = () => selectTrait(trait.id);
        
        card.innerHTML = `
            <div class="trait-category ${trait.category}">${trait.category}</div>
            <div class="trait-text">"${trait.text}"</div>
            <div style="margin-top: 10px; font-size: 0.75rem; color: #888;">
                ${isCompleted ? '✅ Completed' : `${ratedCount}/${totalMembers} Rated`}
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectTrait(traitId) {
    currentTraitId = traitId;
    const traitObj = traits.find(t => t.id === traitId);
    
    document.getElementById('current-question-text').innerText = `"${traitObj.text}"`;
    
    document.getElementById('nav-swipe').classList.remove('disabled');
    switchTab('swipe');
    loadDataForCurrentTrait();
}

function loadDataForCurrentTrait() {
  const shuffled = [...members].sort(() => Math.random() - 0.5);
  
  // Exclude members already rated for THIS trait
  unratedMembers = shuffled.filter(m => {
      // safe guard
      if(!ratings[currentTraitId]) return true;
      return !ratings[currentTraitId][m.id];
  });

  if (unratedMembers.length === 0) {
    showEndScreen();
  } else {
    document.getElementById('swipe-view').classList.add('active');
    document.getElementById('swipe-view').classList.remove('hidden');
    document.getElementById('end-view').classList.remove('active');
    document.getElementById('end-view').classList.add('hidden');
    renderCardStack();
  }
}

function updateCardsLeft() {
  document.getElementById('cards-left-text').innerText = `${unratedMembers.length} senior${unratedMembers.length !== 1 ? 's' : ''} left`;
}

function renderCardStack() {
  const container = document.getElementById('card-stack');
  container.innerHTML = '';
  
  const cardsToRender = unratedMembers.slice(0, 3).reverse();
  
  cardsToRender.forEach((member, idx) => {
    const isTopCard = idx === cardsToRender.length - 1;
    const i = cardsToRender.length - 1 - idx;
    
    const scale = 1 - (i * 0.05);
    const translateY = i * 15;
    
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = member.id;
    card.style.transform = `translateY(${translateY}px) scale(${scale})`;
    card.style.zIndex = idx;
    
    card.innerHTML = `
      <img src="${member.image}" alt="${member.name}" draggable="false" />
      <div class="card-info">
        <div class="card-header">
           <span class="card-name">${member.name}</span>
           <span class="card-year">${member.year}</span>
        </div>
        <div class="card-role">${member.role}</div>
        <p class="card-bio">${member.bio}</p>
        <div class="card-tags">
          ${member.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
      </div>
      
      <div class="swipe-overlay overlay-yes">YES✅</div>
      <div class="swipe-overlay overlay-no">NO❌</div>
    `;
    
    container.appendChild(card);
    
    if (isTopCard) {
      topCard = card;
      initHammer(topCard);
    }
  });
  
  updateCardsLeft();
}

// ----------------------------------------------------
// Swipe Logic
// ----------------------------------------------------

let lastSwipedMember = null;
let lastSwipedType = null;
let lastTraitId = null;

function initHammer(card) {
  if (topCardHammer) topCardHammer.destroy();
  
  topCardHammer = new Hammer(card);
  topCardHammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 });
  
  const maxDisplacement = window.innerWidth / 2;
  const overlayYes = card.querySelector('.overlay-yes');
  const overlayNo = card.querySelector('.overlay-no');
  
  let isDragging = false;
  
  topCardHammer.on('panstart', () => {
    isDragging = true;
    card.style.transition = 'none';
  });
  
  topCardHammer.on('panmove', (e) => {
    if (!isDragging) return;
    const x = e.deltaX;
    const y = e.deltaY;
    const rotate = x * 0.05;
    
    card.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    
    overlayYes.style.opacity = Math.max(0, x / (maxDisplacement / 2));
    overlayNo.style.opacity = Math.max(0, -x / (maxDisplacement / 2));
  });
  
  topCardHammer.on('panend', (e) => {
    isDragging = false;
    card.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    
    const velocity = Math.abs(e.velocityX);
    const displacement = Math.abs(e.deltaX);
    
    if (velocity > 0.5 || displacement > 100) {
      const isYes = e.deltaX > 0;
      processSwipe(isYes ? 'yes' : 'no', isYes ? 'fly-right' : 'fly-left', card);
    } else {
      card.style.transform = `translate(0px, 0px) rotate(0deg)`;
      overlayYes.style.opacity = 0;
      overlayNo.style.opacity = 0;
    }
  });
}

function handleButtonSwipe(type) {
  if (unratedMembers.length === 0 || !topCard) return;
  const animClass = type === 'yes' ? 'fly-right' : 'fly-left';
  processSwipe(type, animClass, topCard);
}

function processSwipe(type, animClass, cardEl) {
  const member = unratedMembers.shift();
  
  if (type === 'yes') cardEl.querySelector('.overlay-yes').style.opacity = 1;
  else if (type === 'no') cardEl.querySelector('.overlay-no').style.opacity = 1;

  cardEl.classList.add(animClass);
  playSound(type);

  // Store Rating securely
  if(!ratings[currentTraitId]) ratings[currentTraitId] = {};
  ratings[currentTraitId][member.id] = type;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));

  lastSwipedMember = member;
  lastSwipedType = type;
  lastTraitId = currentTraitId;

  setTimeout(() => {
    if (unratedMembers.length === 0) {
      showEndScreen();
    } else {
      renderCardStack();
    }
  }, 300);
}

function undoLastSwipe() {
  if (!lastSwipedMember || lastTraitId !== currentTraitId) return;
  
  // Remove from state
  delete ratings[currentTraitId][lastSwipedMember.id];
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  
  // Put member back
  unratedMembers.unshift(lastSwipedMember);
  lastSwipedMember = null;
  lastTraitId = null;
  
  document.getElementById('end-view').classList.add('hidden');
  document.getElementById('end-view').classList.remove('active');
  document.getElementById('swipe-view').classList.add('active');
  document.getElementById('swipe-view').classList.remove('hidden');
  renderCardStack();
  
  initAudio();
  playSound('no');
}

function resetApp() {
  if(confirm("Are you sure you want to completely clear the local database? This will reset all your trait reviews.")) {
    // 1. Wipe local storage completely
    localStorage.removeItem(RATINGS_KEY);
    
    // 2. Clear state entirely
    ratings = {};
    traits.forEach(t => ratings[t.id] = {});
    currentTraitId = null;
    lastSwipedMember = null;
    lastTraitId = null;
    unratedMembers = [];
    
    // 3. Clear UI Stack
    document.getElementById('card-stack').innerHTML = '';
    
    // 4. Send back to traits selection view instantly
    switchTab('traits');
    renderTraits();
    
    // 5. Notify the user this succeeded without reloading
    alert("Database has been reset successfully. Everything is wiped!");
  }
}

// ----------------------------------------------------
// Views & Navigation
// ----------------------------------------------------

function switchTab(tabId) {
  if(tabId === 'swipe' && !currentTraitId) return;

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${tabId}`).classList.add('active');
  
  document.getElementById('traits-view').classList.toggle('active', tabId === 'traits');
  document.getElementById('traits-view').classList.toggle('hidden', tabId !== 'traits');

  document.getElementById('leaderboard-view').classList.toggle('active', tabId === 'leaderboard');
  document.getElementById('leaderboard-view').classList.toggle('hidden', tabId !== 'leaderboard');
  
  if(tabId === 'traits') {
      renderTraits();
      document.getElementById('swipe-view').classList.add('hidden');
      document.getElementById('swipe-view').classList.remove('active');
      document.getElementById('end-view').classList.add('hidden');
      document.getElementById('end-view').classList.remove('active');
  }

  if (tabId === 'swipe') {
      if (unratedMembers.length === 0) {
          showEndScreen();
      } else {
          document.getElementById('swipe-view').classList.add('active');
          document.getElementById('swipe-view').classList.remove('hidden');
      }
  } else {
      document.getElementById('swipe-view').classList.add('hidden');
      document.getElementById('swipe-view').classList.remove('active');
      document.getElementById('end-view').classList.add('hidden');
      document.getElementById('end-view').classList.remove('active');
  }

  if (tabId === 'leaderboard') {
    const lbSelect = document.getElementById('leaderboard-trait-select');
    renderLeaderboard(lbSelect ? lbSelect.value : 'overall');
  }
}

function showEndScreen() {
  document.getElementById('swipe-view').classList.remove('active');
  document.getElementById('swipe-view').classList.add('hidden');
  document.getElementById('end-view').classList.remove('hidden');
  document.getElementById('end-view').classList.add('active');
  document.getElementById('nav-swipe').classList.add('disabled');
  currentTraitId = null;
  renderTraits();
}

// ----------------------------------------------------
// Leaderboard Logic
// ----------------------------------------------------

function renderLeaderboard(filterId) {
  const container = document.getElementById('leaderboard-list');
  container.innerHTML = '';
  
  const scoredMembers = members.map(m => {
    let yesVotes = 0;
    
    traits.forEach(trait => {
        if (filterId === 'overall' || trait.id === filterId) {
            if (ratings[trait.id] && ratings[trait.id][m.id] === 'yes') {
                yesVotes++;
            }
        }
    });

    return { ...m, yesVotes };
  });
  
  scoredMembers.sort((a, b) => b.yesVotes - a.yesVotes);
  
  scoredMembers.forEach((m, idx) => {
    let rankClass = '';
    if (idx === 0) rankClass = 'rank-1';
    else if (idx === 1) rankClass = 'rank-2';
    else if (idx === 2) rankClass = 'rank-3';

    let rankDisplay = `#${idx + 1}`;
    if (idx === 0) rankDisplay = '🥇';
    if (idx === 1) rankDisplay = '🥈';
    if (idx === 2) rankDisplay = '🥉';
    
    const div = document.createElement('div');
    div.className = `leaderboard-item ${rankClass}`;
    div.style.animationDelay = `${idx * 0.1}s`;
    
    div.innerHTML = `
      <div class="rank">${rankDisplay}</div>
      <img src="${m.image}" class="avatar" draggable="false" />
      <div class="lb-info">
        <div class="lb-name">${m.name}</div>
        <div class="lb-role">${m.role}</div>
      </div>
      <div class="lb-score">
         ✅ ${m.yesVotes}
      </div>
    `;
    
    container.appendChild(div);
  });

  if (filterId === 'overall' && scoredMembers[0].yesVotes > 0 && typeof confetti === 'function') {
    triggerConfetti();
  }
}

function triggerConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF2D6B', '#00F5D4', '#FFD700'] });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF2D6B', '#00F5D4', '#FFD700'] });

    if (Date.now() < end) requestAnimationFrame(frame);
  }());
}

window.onload = initApp;
