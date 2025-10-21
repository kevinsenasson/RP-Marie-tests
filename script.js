// ********************************************************** js page principale **********************************************************************
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
        ${item.status === 'disponible' ? '' : `<div class="text-muted small">${item.date}</div>`}
        <button class="trash-btn" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    container.appendChild(listItem);
  });
}

// Après rendu, attache les gestionnaires de suppression
function attachDeleteHandlers(){
  const deleteBtns = document.querySelectorAll('.trash-btn');
  const deleteModalEl = document.getElementById('deleteModal');
  if(!deleteModalEl) return;
  const bsModal = new bootstrap.Modal(deleteModalEl);
  const deleteIcon = document.getElementById('deleteIcon');
  const deleteName = document.getElementById('deleteName');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  let currentIndex = null;

  deleteBtns.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      // trouver l'index réel en parcourant jusqu'à l'élément parent
      const itemEl = btn.closest('.list-group-item');
      const name = itemEl.querySelector('.item-meta strong').textContent;
      // trouver l'index dans items (première occurrence)
      const index = items.findIndex(i=>i.name === name);
      currentIndex = index;
      // remplir modal
      deleteIcon.innerHTML = `<i class="fas ${items[index].icon} fa-2x"></i>`;
      deleteName.textContent = items[index].name;
      bsModal.show();
    });
  });
  // Attach confirmation handler if confirm button exists
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (currentIndex !== null && currentIndex >= 0) {
        items.splice(currentIndex, 1);
        bsModal.hide();
        renderItems();
        // ré-attacher handlers après rerender
        attachDeleteHandlers();
      }
    });
  }
}

const catFilterEl = document.getElementById('categoryFilter');
if (catFilterEl) catFilterEl.addEventListener('change', renderItems);
const statusFilterEl = document.getElementById('statusFilter');
if (statusFilterEl) statusFilterEl.addEventListener('change', renderItems);

window.onload = function(){
  renderItems();
  // attacher après premier rendu
  attachDeleteHandlers();
};

// **************************************************** fin js page principale **********************************************************************



//  ************************************************** js page création de prêt *********************************************************************
   



      // lecture du paramètre code (venant du scan QR)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const itemNameEl = document.getElementById("itemName");
      if (code) {
        itemNameEl.textContent = decodeURIComponent(code);
      } else {
        itemNameEl.textContent = "élément inconnu";
      }

      // gestion du visuel produit (si param img fourni) - sinon icône
      const productImageWrap = document.getElementById("productImageWrap");
      const productIcon = document.getElementById("productIcon");
      const imgParam = params.get("img");
      if (imgParam) {
        const img = document.createElement("img");
        img.src = imgParam;
        img.className = "product-image";
        productImageWrap.innerHTML = "";
        productImageWrap.appendChild(img);
      }

      // Validation du formulaire
      const form = document.getElementById("loanForm");
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Vérifier si le formulaire est valide
        if (!form.checkValidity()) {
          e.stopPropagation();
          form.classList.add("was-validated");
          return;
        }

        // Vérifier la sélection des dates
        const dates = document.getElementById("datePicker").value.split(" to ");
        if (dates.length !== 2) {
          alert("Veuillez sélectionner une date de prêt ET une date de retour");
          return;
        }

        try {
          const payload = {
            item: itemNameEl.textContent,
            intervenant: document.getElementById("intervenant").value,
            nom: document.getElementById("emprunteurNom").value.trim(),
            prenom: document.getElementById("emprunteurPrenom").value.trim(),
            classe: document.getElementById("classe").value.trim(),
            etat: document.querySelector('input[name="etat"]:checked').value,
            notes: document.getElementById("notes").value.trim(),
            datePret: dates[0],
            dateRetour: dates[1],
          };

          if (!payload.nom || !payload.prenom || !payload.classe) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
          }

          // pour l'instant on log et redirige vers index
          console.log("Prêt créé", payload);
          alert("Prêt enregistré pour : " + payload.item);
          window.location.href = "index.html";
        } catch (err) {
          alert("Erreur: " + err.message);
        }
      });

            // Initialisation au chargement de la page
      document.addEventListener("DOMContentLoaded", function () {
        // Initialisation du compteur de notes (protégé)
        const notes = document.getElementById("notes");
        const notesCount = document.getElementById("notesCount");
        if (notes && notesCount) {
          notes.addEventListener("input", () => {
            notesCount.textContent = `${notes.value.length} / 500`;
          });
          notesCount.textContent = `${notes.value.length} / 500`;
        }

        // Initialisation du calendrier : attacher le calendrier dans .calendar-container
        try {
          const dp = document.getElementById('datePicker');
          const calendarContainer = document.querySelector('.calendar-container');
          if (dp && typeof flatpickr === 'function') {
            flatpickr(dp, {
              mode: 'range',
              inline: true,
              appendTo: calendarContainer || undefined,
              altInput: true,
              altFormat: 'j F Y',
              dateFormat: 'Y-m-d',
              minDate: 'today',
              locale: 'fr',
              defaultHour: 12
            });
          }
        } catch (err) {
          console.warn('flatpickr init failed', err);
        }
      });
// ****************************************************** fin js page création de prêt **************************************************************