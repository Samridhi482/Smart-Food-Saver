// ===========================
// SMART FOOD SAVER - PART 1
// ===========================

// -------- DOM ELEMENTS --------

const welcomeModal = document.getElementById("welcomeModal");
const usernameInput = document.getElementById("usernameInput");
const startBtn = document.getElementById("startBtn");

const welcomeUser = document.getElementById("welcomeUser");

const foodForm = document.getElementById("foodForm");
const foodName = document.getElementById("foodName");
const foodCategory = document.getElementById("foodCategory");
const expiryDate = document.getElementById("expiryDate");

const foodList = document.getElementById("foodList");

const totalItems = document.getElementById("totalItems");
const expiringItems = document.getElementById("expiringItems");
const expiredItems = document.getElementById("expiredItems");

const fruitCount = document.getElementById("fruitCount");
const vegCount = document.getElementById("vegCount");
const dairyCount = document.getElementById("dairyCount");
const snackCount = document.getElementById("snackCount");

const expiryAlerts = document.getElementById("expiryAlerts");

const darkModeBtn = document.getElementById("darkModeBtn");

// -------- LOCAL STORAGE --------

let foods = JSON.parse(localStorage.getItem("foods")) || [];

let username =
  localStorage.getItem("username") || "";

// -------- USER SETUP --------

function initializeUser() {

  if (username) {

    welcomeModal.style.display = "none";

    welcomeUser.textContent =
      `Hello, ${username} 👋`;

  } else {

    welcomeModal.style.display = "flex";

  }
}

startBtn.addEventListener("click", () => {

  const name = usernameInput.value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  localStorage.setItem(
    "username",
    name
  );

  username = name;

  welcomeUser.textContent =
    `Hello, ${username} 👋`;

  welcomeModal.style.display = "none";
});

// -------- DARK MODE --------

darkModeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
});

if (
  localStorage.getItem("darkMode") === "true"
) {
  document.body.classList.add("dark");
}

// -------- ADD FOOD --------

foodForm.addEventListener("submit", (e) => {

  e.preventDefault();

  const name = foodName.value.trim();
  const category = foodCategory.value;
  const expiry = expiryDate.value;

  if (!name || !expiry) return;

  foods.push({
    name,
    category,
    expiry
  });

  localStorage.setItem(
    "foods",
    JSON.stringify(foods)
  );

  foodForm.reset();

  renderFoods();
});

// -------- DELETE FOOD --------

function deleteFood(index) {

  foods.splice(index, 1);

  localStorage.setItem(
    "foods",
    JSON.stringify(foods)
  );

  renderFoods();
}

// -------- STATUS CHECK --------

function getFoodStatus(expiryDateString) {

  const today = new Date();

  today.setHours(0,0,0,0);

  const expiry =
    new Date(expiryDateString);

  expiry.setHours(0,0,0,0);

  const diffDays = Math.ceil(
    (expiry - today) /
    (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      text: "Expired",
      className: "expired"
    };
  }

  if (diffDays <= 3) {
    return {
      text: "Expiring Soon",
      className: "expiring"
    };
  }

  return {
    text: "Fresh",
    className: "fresh"
  };
}

// -------- DATE FORMATTER --------

function formatDate(dateString) {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return dateString;
  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// -------- DASHBOARD --------

function updateDashboard() {

  totalItems.textContent =
    foods.length;

  let expiring = 0;
  let expired = 0;

  let fruits = 0;
  let vegetables = 0;
  let dairy = 0;
  let snacks = 0;

  foods.forEach(food => {

    const status =
      getFoodStatus(food.expiry);

    if (
      status.text ===
      "Expiring Soon"
    ) {
      expiring++;
    }

    if (
      status.text ===
      "Expired"
    ) {
      expired++;
    }

    if (
      food.category.includes("Fruit")
    ) {
      fruits++;
    }

    if (
      food.category.includes("Vegetable")
    ) {
      vegetables++;
    }

    if (
      food.category.includes("Dairy")
    ) {
      dairy++;
    }

    if (
      food.category.includes("Snack")
    ) {
      snacks++;
    }
  });

  expiringItems.textContent =
    expiring;

  expiredItems.textContent =
    expired;

  fruitCount.textContent =
    fruits;

  vegCount.textContent =
    vegetables;

  dairyCount.textContent =
    dairy;

  snackCount.textContent =
    snacks;
}

// -------- EXPIRY ALERTS --------

function updateAlerts() {

  const expiringFoods = [];

  foods.forEach(food => {

    const status =
      getFoodStatus(food.expiry);

    if (
      status.text ===
      "Expiring Soon"
    ) {
      expiringFoods.push(food.name);
    }
  });

  if (
    expiringFoods.length === 0
  ) {

    expiryAlerts.innerHTML =
      "✅ No urgent items.";

    return;
  }

  const chips = expiringFoods.map(name => `<span class="alert-chip"><i class="fas fa-hourglass-half"></i> ${name}</span>`).join("");

  expiryAlerts.innerHTML = `
    <strong>
      ${expiringFoods.length} item(s) need attention:
    </strong>
    <div class="alert-chip-container">
      ${chips}
    </div>
  `;
}

// -------- INVENTORY TABLE --------

function renderFoods() {

  foodList.innerHTML = "";

  if (foods.length === 0) {
    foodList.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="5">
          <div class="empty-state-container">
            <i class="fas fa-box-open empty-state-icon"></i>
            <p>Your pantry is empty. Add food items above to get started!</p>
          </div>
        </td>
      </tr>
    `;
    updateDashboard();
    updateAlerts();
    return;
  }

  foods.forEach(
    (food, index) => {

      const status =
        getFoodStatus(food.expiry);

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${food.name}</td>

        <td>${food.category}</td>

        <td>${formatDate(food.expiry)}</td>

        <td>
          <span class="${status.className}">${status.text}</span>
        </td>

        <td>
          <button
          class="delete-btn"
          onclick="deleteFood(${index})">
          Delete
          </button>
        </td>
      `;

      foodList.appendChild(row);
    }
  );

  updateDashboard();
  updateAlerts();
}

// -------- START APP --------

initializeUser();
renderFoods();
// ===========================
// SMART FOOD SAVER - PART 2
// ===========================

// ---------- EXTRA ELEMENTS ----------

const ecoPointsDisplay =
  document.getElementById("ecoPoints");

const userLevel =
  document.getElementById("userLevel");

const progressBar =
  document.getElementById("progressBar");

const sustainabilityScore =
  document.getElementById(
    "sustainabilityScore"
  );

const dailyChallenge =
  document.getElementById(
    "dailyChallenge"
  );

const foodTip =
  document.getElementById("foodTip");

const newTipBtn =
  document.getElementById("newTipBtn");

const recipeSuggestion =
  document.getElementById(
    "recipeSuggestion"
  );

const savedItems =
  document.getElementById("savedItems");

const savedCount =
  document.getElementById("savedCount");

const trackedCount =
  document.getElementById("trackedCount");

const wasteReduced =
  document.getElementById("wasteReduced");

const streakCount =
  document.getElementById("streakCount");

const searchInput =
  document.getElementById("searchInput");

const popup =
  document.getElementById("popup");

// ---------- LOCAL STORAGE ----------

let ecoPoints =
  parseInt(
    localStorage.getItem("ecoPoints")
  ) || 0;

let savedFoods =
  parseInt(
    localStorage.getItem("savedFoods")
  ) || 0;

let streak =
  parseInt(
    localStorage.getItem("streak")
  ) || 1;

// ---------- CHALLENGES ----------

const challenges = [
  "Add 3 food items today 🌱",
  "Save 1 item before expiry 🥗",
  "Track all groceries today 📦",
  "Reduce food waste this week ♻",
  "Check expiring foods today ⚠",
  "Organize your pantry 🍎"
];

dailyChallenge.textContent =
  challenges[
    Math.floor(
      Math.random() *
      challenges.length
    )
  ];

// ---------- FOOD TIPS ----------

const tips = [
  "Freeze leftovers instead of throwing them away.",
  "Store herbs in water to keep them fresh.",
  "Use older ingredients first.",
  "Plan meals before shopping.",
  "Store dairy at consistent temperatures.",
  "Buy only what you need."
];

newTipBtn.addEventListener(
  "click",
  () => {

    foodTip.textContent =
      tips[
        Math.floor(
          Math.random() *
          tips.length
        )
      ];
  }
);

// ---------- POPUP ----------

function showPopup(message){

  popup.innerHTML = `<div class="popup-icon"><i class="fas fa-medal"></i></div><div class="popup-text">${message}</div>`;

  popup.style.display = "flex";

  setTimeout(() => {
    popup.style.display = "none";
  },2500);
}

// ---------- CONSUME FOOD ----------

function consumeFood(index){

  foods.splice(index,1);

  ecoPoints += 10;
  savedFoods++;

  localStorage.setItem(
    "foods",
    JSON.stringify(foods)
  );

  localStorage.setItem(
    "ecoPoints",
    ecoPoints
  );

  localStorage.setItem(
    "savedFoods",
    savedFoods
  );

  showPopup(
    "🎉 Food Saved! +10 Eco Points"
  );

  renderFoods();
  updateGamification();
}

// ---------- LEVEL SYSTEM ----------

function updateLevel(){

  let level = "Food Saver";
  let progress = 0;

  if(ecoPoints >= 500){

    level =
      "Sustainability Master";

    progress = 100;
  }

  else if(ecoPoints >= 200){

    level = "Eco Guardian";

    progress = 75;
  }

  else if(ecoPoints >= 100){

    level = "Waste Reducer";

    progress = 50;
  }

  else{

    progress =
      Math.min(
        (ecoPoints/100)*50,
        50
      );
  }

  userLevel.textContent =
    level;

  progressBar.style.width =
    progress + "%";
}

// ---------- BADGES ----------

function updateBadges(){

  unlockBadge(
    "badge1",
    50,
    "🌱 Green Beginner"
  );

  unlockBadge(
    "badge2",
    100,
    "🌿 Waste Warrior"
  );

  unlockBadge(
    "badge3",
    200,
    "🌳 Eco Champion"
  );

  unlockBadge(
    "badge4",
    500,
    "♻ Sustainability Hero"
  );
}

function unlockBadge(
  badgeId,
  pointsNeeded,
  message
){

  const badge =
    document.getElementById(
      badgeId
    );

  if(
    ecoPoints >= pointsNeeded &&
    !badge.classList.contains(
      "unlocked"
    )
  ){

    badge.classList.add(
      "unlocked"
    );

    showPopup(
      message +
      " Badge Unlocked!"
    );
  }
}

// ---------- SCORE ----------

function updateScore(){

  let score = 100;

  const expired =
    parseInt(
      expiredItems.textContent
    ) || 0;

  score -= expired * 10;

  if(score < 0){
    score = 0;
  }

  sustainabilityScore.textContent =
    score;
}

// ---------- SDG IMPACT ----------

function updateImpact(){

  trackedCount.textContent =
    foods.length;

  savedCount.textContent =
    savedFoods;

  savedItems.textContent =
    savedFoods;

  wasteReduced.textContent =
    (
      savedFoods * 0.25
    ).toFixed(1)
    + " kg";
}

// ---------- STREAK ----------

function updateStreak(){

  streakCount.textContent =
    streak + " 🔥";
}

// ---------- RECIPE SUGGESTIONS ----------

function updateRecipes(){

  let recipe =
    "Add food items to get suggestions.";

  const names =
    foods.map(
      food =>
      food.name.toLowerCase()
    );

  if(
    names.includes("milk")
  ){
    recipe =
      "🥞 Pancakes, ☕ Milkshake";
  }

  else if(
    names.includes("bread")
  ){
    recipe =
      "🍞 Sandwich, 🧄 Garlic Bread";
  }

  else if(
    names.includes("banana")
  ){
    recipe =
      "🍌 Smoothie, 🍰 Banana Cake";
  }

  recipeSuggestion.textContent =
    recipe;
}

// ---------- SEARCH ----------

searchInput.addEventListener(
  "keyup",
  () => {

    const value =
      searchInput.value
      .toLowerCase();

    const rows =
      document.querySelectorAll(
        "#foodList tr"
      );

    rows.forEach(row => {

      const text =
        row.textContent
        .toLowerCase();

      row.style.display =
        text.includes(value)
        ? ""
        : "none";
    });
  }
);

// ---------- OVERRIDE TABLE ----------

const originalRenderFoods =
  renderFoods;

renderFoods = function(){

  foodList.innerHTML = "";

  if (foods.length === 0) {
    foodList.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="5">
          <div class="empty-state-container">
            <i class="fas fa-box-open empty-state-icon"></i>
            <p>Your pantry is empty. Add food items above to get started!</p>
          </div>
        </td>
      </tr>
    `;
    updateDashboard();
    updateAlerts();
    updateGamification();
    return;
  }

  foods.forEach(
    (food,index)=>{

      const status =
        getFoodStatus(
          food.expiry
        );

      const row =
        document.createElement(
          "tr"
        );

      row.innerHTML = `
      <td>${food.name}</td>
      <td>${food.category}</td>
      <td>${formatDate(food.expiry)}</td>
      <td>
        <span class="${status.className}">${status.text}</span>
      </td>

      <td>

      <button
      class="consume-btn"
      onclick="consumeFood(${index})">
      ✓ Consumed
      </button>

      <button
      class="delete-btn"
      onclick="deleteFood(${index})">
      Delete
      </button>

      </td>
      `;

      foodList.appendChild(row);
    }
  );

  updateDashboard();
  updateAlerts();

  updateGamification();
};

// ---------- GAMIFICATION HUB ----------

function updateGamification(){

  ecoPointsDisplay.textContent =
    ecoPoints + " 🌱";

  updateLevel();

  updateBadges();

  updateScore();

  updateImpact();

  updateRecipes();

  updateStreak();
}

// ---------- POINTS ON ADD ----------

const originalSubmit =
  foodForm.onsubmit;

foodForm.addEventListener(
  "submit",
  () => {

    ecoPoints += 5;

    localStorage.setItem(
      "ecoPoints",
      ecoPoints
    );

    updateGamification();
  }
);

// ---------- INITIALIZE ----------

updateGamification();
renderFoods();
