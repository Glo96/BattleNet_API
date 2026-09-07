const state = {
  items: [],
  filter: "all",
  search: "",
};

const messageList = document.getElementById("messageList");
const statsContainer = document.getElementById("stats");
const searchInput = document.getElementById("searchInput");
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const template = document.getElementById("message-card-template");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTable(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="empty-state">No table data available.</p>';
  }

  const columns = new Set();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => columns.add(key));
  });

  const headers = [...columns]
    .map((key) => `<th>${escapeHtml(key)}</th>`)
    .join("");
  const body = rows
    .map((row) => {
      const values = [...columns]
        .map((key) => `<td>${escapeHtml(row[key] ?? "")}</td>`)
        .join("");
      return `<tr>${values}</tr>`;
    })
    .join("");

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderBody(item) {
  if (typeof item.message === "object" && item.message !== null) {
    const title = item.message.title || "Cargo manifest";
    return `
      <div class="binary-note">${escapeHtml(title)}</div>
      ${renderTable(item.message.rows || [])}
    `;
  }

  const displayText = item.decoded_ascii || item.message || "";
  const isBinary = Boolean(item.decoded_ascii);

  if (isBinary) {
    return `
      <div class="binary-block">
        <div class="binary-note">Decoded output</div>
        <pre class="message-text">${escapeHtml(displayText)}</pre>
        <div class="binary-note">Original binary</div>
        <code class="inline-code">${escapeHtml(item.message)}</code>
      </div>
    `;
  }

  return `<pre class="message-text">${escapeHtml(displayText)}</pre>`;
}

function renderStats(items) {
  const total = items.length;
  const samplePool = Math.max(
    ...items.flatMap((item) => item.observed_in_samples),
    0,
  );
  const types = {
    text: items.filter((item) => item.kind === "text").length,
    binary: items.filter((item) => item.kind === "binary").length,
    table: items.filter((item) => item.kind === "table").length,
  };

  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="label">Unique entries</div>
      <strong>${total}</strong>
    </div>
    <div class="stat-card">
      <div class="label">Samples</div>
      <strong>${samplePool}</strong>
    </div>
    <div class="stat-card">
      <div class="label">Text logs</div>
      <strong>${types.text}</strong>
    </div>
    <div class="stat-card">
      <div class="label">Binary + table</div>
      <strong>${types.binary + types.table}</strong>
    </div>
  `;
}

function getVisibleItems() {
  return state.items.filter((item) => {
    const matchesFilter = state.filter === "all" || item.kind === state.filter;
    const needle = state.search.trim().toLowerCase();
    const text =
      `${item.title} ${item.message || ""} ${item.decoded_ascii || ""}`.toLowerCase();
    const matchesSearch = !needle || text.includes(needle);
    return matchesFilter && matchesSearch;
  });
}

function renderItems() {
  const visible = getVisibleItems();

  if (visible.length === 0) {
    messageList.innerHTML =
      '<div class="empty-state">Няма съвпадения за текущия филтър.</div>';
    return;
  }

  messageList.innerHTML = visible
    .map((item) => {
      const node = template.content.cloneNode(true);
      node.querySelector(".tag").textContent = item.kind;
      node.querySelector(".samples").textContent =
        `${item.observed_in_samples.length} samples`;
      node.querySelector("h3").textContent = item.title;
      node.querySelector(".body").innerHTML = renderBody(item);
      return node;
    })
    .map((node) => node.firstElementChild.outerHTML)
    .join("");
}

function applyFilter(filter) {
  state.filter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
  renderItems();
}

async function loadData() {
  const response = await fetch("data/messages.json");
  if (!response.ok) {
    throw new Error("Could not load archive data.");
  }

  const data = await response.json();
  state.items = data.messages.map((item) => {
    const kind =
      typeof item.message === "object" && item.message !== null ? "table"
      : item.decoded_ascii ? "binary"
      : "text";
    return { ...item, kind };
  });

  renderStats(state.items);
  renderItems();
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderItems();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyFilter(button.dataset.filter);
  });
});

loadData().catch((error) => {
  messageList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
});
