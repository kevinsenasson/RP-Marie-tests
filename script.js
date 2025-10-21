const items = [
  { name: "souris logitek g 502", status: "disponible", date: "03/11/25", category: "informatique", icon: "fa-mouse" },
  { name: "souris logitek g 502", status: "indisponible", date: "03/11/25", category: "informatique", icon: "fa-mouse" },
  { name: "clavier logitek", status: "disponible", date: "03/11/25", category: "informatique", icon: "fa-keyboard" },
  { name: "clavier logitek", status: "retard", date: "03/11/25", category: "informatique", icon: "fa-keyboard" },
  { name: "micro cravatte", status: "disponible", date: "03/11/25", category: "audio", icon: "fa-microphone" },
  { name: "micro cravatte", status: "indisponible", date: "03/11/25", category: "audio", icon: "fa-microphone" },
  { name: "micro cravatte", status: "indisponible", date: "03/11/25", category: "audio", icon: "fa-microphone" },
  { name: "cable hdmi", status: "disponible", date: "03/11/25", category: "connectiques", icon: "fa-plug" },
  { name: "cable hdmi", status: "retard", date: "03/11/25", category: "connectiques", icon: "fa-plug" },
  { name: "adaptateur mac", status: "disponible", date: "03/11/25", category: "connectiques", icon: "fa-plug" },
  { name: "adaptateur mac", status: "indisponible", date: "03/11/25", category: "connectiques", icon: "fa-plug" },
  { name: "cable reseau", status: "disponible", date: "03/11/25", category: "connectiques", icon: "fa-network-wired" }
];

function renderItems() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const container = document.getElementById("inventoryList");
  container.innerHTML = "";

  items.forEach(item => {
    if ((categoryFilter && item.category !== categoryFilter) ||
        (statusFilter && item.status !== statusFilter)) {
      return;
    }

    const statusClass = `status-${item.status}`;
    const listItem = document.createElement("div");
    listItem.className = "list-group-item";

    listItem.innerHTML = `
      <div class="left">
        <div class="item-icon"><i class="fas ${item.icon}"></i></div>
        <div class="item-meta">
          <div><strong>${item.name}</strong></div>
          <div><span class="status-dot ${statusClass}"></span>${item.status}</div>
        </div>
      </div>
      <div class="item-right">
        <div class="text-muted small">${item.date}</div>
        <button class="trash-btn" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    container.appendChild(listItem);
  });
}

document.getElementById("categoryFilter").addEventListener("change", renderItems);
document.getElementById("statusFilter").addEventListener("change", renderItems);

window.onload = renderItems;
