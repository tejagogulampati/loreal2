const WORKER_URL = "https://lorea.gogulampativenkatatejacollege.workers.dev/";

let products = [];
let selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];
let chatHistory = [];

// LOAD PRODUCTS
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    products = data.products;
    displayProducts(products);
    renderSelectedProducts();
  });

// DISPLAY PRODUCTS
function displayProducts(list) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";

    if (selectedProducts.some(sp => sp.id === p.id)) {
      div.classList.add("selected");
    }

    div.innerHTML = `
      <img src="${p.image}">
      <h4>${p.name}</h4>
      <p>${p.brand}</p>
      <button onclick="event.stopPropagation(); showDetails('${p.description}')">
        Details
      </button>
    `;

    div.onclick = () => toggleProduct(p);
    grid.appendChild(div);
  });
}

function showDetails(desc) {
  alert(desc);
}

// TOGGLE
function toggleProduct(product) {
  const exists = selectedProducts.find(p => p.id === product.id);

  if (exists) {
    selectedProducts = selectedProducts.filter(p => p.id !== product.id);
  } else {
    selectedProducts.push(product);
  }

  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  displayProducts(products);
  renderSelectedProducts();
}

// SELECTED UI
function renderSelectedProducts() {
  const container = document.getElementById("selected-products");
  container.innerHTML = "";

  selectedProducts.forEach(p => {
    const div = document.createElement("div");
    div.className = "selected-item";
    div.innerHTML = `
      ${p.name}
      <button onclick="removeProduct(${p.id})">✕</button>
    `;
    container.appendChild(div);
  });
}

// REMOVE
function removeProduct(id) {
  selectedProducts = selectedProducts.filter(p => p.id !== id);
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  displayProducts(products);
  renderSelectedProducts();
}

// CHAT UI
function addMessage(role, text) {
  const chat = document.getElementById("chat");

  const div = document.createElement("div");
  div.className = role === "User" ? "user-msg" : "ai-msg";
  div.innerText = text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// SEND MESSAGE
async function sendMessage(customText = null) {
  const input = document.getElementById("user-input");

  const text = customText || input.value.trim();
  if (!text) return;

  addMessage("User", text);
  chatHistory.push({ role: "user", content: text });

  input.value = "";

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: chatHistory,
        products: selectedProducts
      })
    });

    const data = await res.json();
    const reply = data.reply || "No response";

    addMessage("AI", reply);
    chatHistory.push({ role: "assistant", content: reply });

  } catch (err) {
    addMessage("AI", "Error connecting to AI");
  }
}

// GENERATE ROUTINE
function generateRoutine() {
  if (selectedProducts.length === 0) {
    alert("Select products first!");
    return;
  }

  const prompt = `
Create a skincare routine using ONLY these products:
${selectedProducts.map(p => `${p.name} (${p.brand})`).join(", ")}

Include:
- Morning routine
- Night routine
- Step-by-step order
`;

  sendMessage(prompt);
}