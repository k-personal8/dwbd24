// References to DOM elements
const heartButton = document.getElementById("heartButton");
const letterModal = document.getElementById("letterModal");
const closeBtn = document.getElementById("closeBtn");
const loveSong = document.getElementById("loveSong");
const fallingHeartsContainer = document.getElementById("fallingHeartsContainer");
const lockedMessageEl = document.getElementById("lockedMessage");
const countdownEl = document.getElementById("countdown");

/*********************************
   Lock Until December 26, 2024 12 AM CST
**********************************/
const unlockDate = new Date("2024-12-26T01:00:00");
let countdownInterval = null;

// Checks if it's locked or unlocked on page load
function checkLock() {
  const now = new Date();
  if (now < unlockDate) {
    // LOCKED
    heartButton.disabled = true;
    heartButton.style.cursor = "not-allowed";
    heartButton.style.opacity = "0.5";
  
    // Show locked message
    lockedMessageEl.style.display = "block";   // Ensure it's spelled exactly
    startCountdown();
  } else {
    // UNLOCKED
    heartButton.disabled = false;
    heartButton.style.cursor = "pointer";
    heartButton.style.opacity = "1";
  
    lockedMessageEl.style.display = "none";
    unlockHeart();
  }
  
}

function startCountdown() {
    // Clear any existing interval so we don’t double-run
    if (countdownInterval) clearInterval(countdownInterval);
  
    countdownInterval = setInterval(() => {
      const now = new Date();
      if (now >= unlockDate) {
        // Stop the countdown and unlock
        clearInterval(countdownInterval);
        unlockHeart();
        return;
      }
      
      const diff = unlockDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
  
      countdownEl.textContent = 
        `Countdown: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }
  

/**
 * Unlocks the heart button and hides the locked message.
 */
function unlockHeart() {
  heartButton.disabled = false;
  heartButton.style.cursor = "pointer";
  heartButton.style.opacity = "1";
  lockedMessageEl.style.display = "none";
}

/*********************************
   Random Movement + Dot Trails
**********************************/

// Position & Velocity
let x = 100;
let y = 100;
let vx = getRandomSpeed();
let vy = getRandomSpeed();

// Speed multipliers to move faster horizontally & slightly faster vertically
vx *= 1.6;    // double horizontal speed
vy *= 1.6;  // increase vertical speed

// Dot interval
let trailInterval = null;

// On page load => check lock, then start animations
window.addEventListener("load", () => {
  checkLock();  // Check locked/unlocked & start countdown if locked

  // Start the random animation
  requestAnimationFrame(moveButton);

  // Create a fading dot every 75ms
  trailInterval = setInterval(createTrailDot, 75);
});

/** Moves the button each frame, bouncing off edges if needed. */
function moveButton() {
  const btnRect = heartButton.getBoundingClientRect();

  // Adjust these offsets to better match the heart's visual shape
  const btnW = btnRect.width - 35;  
  const btnH = btnRect.height - 55;

  // Update positions
  x += vx;
  y += vy;

  // Screen boundaries
  const maxW = window.innerWidth;
  const maxH = window.innerHeight;

  // Bounce horizontally
  if (x < 0) {
    x = 0;
    vx *= -1;
  } else if (x + btnW > maxW) {
    x = maxW - btnW;
    vx *= -1;
  }

  // Bounce vertically
  if (y < 0) {
    y = 0;
    vy *= -1;
  } else if (y + btnH > maxH) {
    y = maxH - btnH;
    vy *= -1;
  }

  // Apply new position (with -45deg rotation)
  heartButton.style.transform = `translate(${x}px, ${y}px) rotate(-45deg)`;

  requestAnimationFrame(moveButton);
}

/** Spawn a small dot near the bottom tip of the heart, then fade out. */
function createTrailDot() {
  // If locked, do nothing
  if (heartButton.disabled) return;

  const rect = heartButton.getBoundingClientRect();
  const dotSize = 12;
  const verticalOffset = 0.9; // 90% => near bottom tip

  const cx = rect.x + rect.width / 2 - dotSize / 2;
  const cy = rect.y + rect.height * verticalOffset - dotSize / 2;

  const dot = document.createElement("div");
  dot.classList.add("trail-dot");
  dot.style.left = cx + "px";
  dot.style.top = cy + "px";

  document.body.appendChild(dot);

  // Force reflow, then fade
  dot.getBoundingClientRect();
  dot.style.opacity = 0;

  setTimeout(() => dot.remove(), 1000);
}

/** Returns random speed between -4..4, excluding small absolute values */
function getRandomSpeed() {
  let speed = 0;
  while (Math.abs(speed) < 1) {
    speed = (Math.random() * 8) - 4; 
  }
  return speed;
}

/*********************************
   Open Letter + Falling Hearts
**********************************/
heartButton.addEventListener("click", () => {
  // If locked, do nothing
  if (heartButton.disabled) return;

  letterModal.style.display = "block";

  // Play music (if allowed)
  loveSong.play().catch(err => {
    console.log("Music blocked:", err);
  });

  // Show falling hearts container
  fallingHeartsContainer.style.display = "block";
  startFallingHearts();
});

// Close the letter
closeBtn.addEventListener("click", () => {
  letterModal.style.display = "none";
  // Optionally pause music
  loveSong.pause();
});

// Click outside => close modal + pause music
window.addEventListener("click", (e) => {
  if (e.target === letterModal) {
    letterModal.style.display = "none";
    loveSong.pause();
  }
});

/*********************************
         Falling Hearts
**********************************/
let heartFallInterval = null;

function startFallingHearts() {
  if (heartFallInterval) return; 
  // create a heart every 75ms => big "storm" of hearts
  heartFallInterval = setInterval(createFallingHeart, 75);
}

function stopFallingHearts() {
  if (heartFallInterval) {
    clearInterval(heartFallInterval);
    heartFallInterval = null;
  }
}

function createFallingHeart() {
  const heart = document.createElement("div");
  heart.classList.add("falling-heart");
  heart.innerHTML = "&hearts;";

  const maxLeft = window.innerWidth - 20;
  heart.style.left = Math.floor(Math.random() * maxLeft) + "px";

  fallingHeartsContainer.appendChild(heart);

  // Remove after 5s
  setTimeout(() => heart.remove(), 5000);
}
