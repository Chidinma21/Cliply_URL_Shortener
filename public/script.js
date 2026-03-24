const shortenBtn = document.getElementById("shortenBtn");
const resultDiv = document.getElementById("result");
const shortLinkInput = document.getElementById("shortLink");
const historyList = document.getElementById("historyList");
const historySection = document.getElementById("historySection");

document.addEventListener("DOMContentLoaded", renderHistory);

shortenBtn.addEventListener("click", async () => {
  const longUrl = document.getElementById("longUrl").value.trim();
  const customAlias = document.getElementById("customAlias").value.trim();

  if (!longUrl) {
    showToast("Please enter a destination URL");
    return;
  }

  try {
    new URL(longUrl);
  } catch (_) {
    showToast("Please enter a valid URL (include http/https)");
    return;
  }

  shortenBtn.disabled = true;
  shortenBtn.innerText = "Processing...";

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        longUrl,
        customAlias: customAlias || null,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      shortLinkInput.value = data.shortUrl;
      resultDiv.classList.remove("hidden");
      saveToHistory(data.shortUrl, longUrl);
      showToast("Link shortened successfully!", "success");
    } else {
      showToast(data.error || "Failed to shorten URL");
    }
  } catch (err) {
    showToast("Server unreachable. Check your connection.");
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.innerText = "Shorten Now";
  }
});

function saveToHistory(shortUrl, longUrl) {
  let history = JSON.parse(localStorage.getItem("cliply_history") || "[]");

  const exists = history.find((item) => item.shortUrl === shortUrl);
  if (exists) return;

  history.unshift({ shortUrl, longUrl, date: new Date().toLocaleTimeString() });

  history = history.slice(0, 5);
  localStorage.setItem("cliply_history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("cliply_history") || "[]");

  if (history.length === 0) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyList.innerHTML = history
    .map(
      (item) => `
        <div class="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center group hover:border-blue-500/30 transition-all">
            <div class="truncate pr-4">
                <p class="text-blue-400 font-bold truncate text-sm">${item.shortUrl}</p>
                <p class="text-slate-500 text-[10px] truncate uppercase tracking-tighter">${item.longUrl}</p>
            </div>
            <button onclick="window.open('${item.shortUrl}', '_blank')" class="bg-slate-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </button>
        </div>
    `,
    )
    .join("");
}

function clearHistory() {
  if (confirm("Clear your recent clips?")) {
    localStorage.removeItem("cliply_history");
    renderHistory();
  }
}

function copyLink() {
  shortLinkInput.select();
  navigator.clipboard.writeText(shortLinkInput.value);
  showToast("Copied to clipboard!", "success");
}

function showToast(message, type = "error") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");

  const bgColor = type === "success" ? "bg-emerald-600" : "bg-red-600";
  const icon = type === "success" ? "✅" : "⚠️";

  toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0 font-bold text-sm`;
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
