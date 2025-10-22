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
        const dateValue = document.getElementById("datePicker").value;
        // Accepter les deux formats : " to " (anglais) et " au " (français)
        let dates = dateValue.split(" au ");
        if (dates.length !== 2) {
          dates = dateValue.split(" to ");
        }
        if (dates.length !== 2 || !dates[0] || !dates[1]) {
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
            datePret: dates[0].trim(),
            dateRetour: dates[1].trim(),
          };

          if (!payload.nom || !payload.prenom || !payload.classe) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
          }

          // Afficher la modale de succès
          console.log("Prêt créé", payload);
          const successModal = new bootstrap.Modal(document.getElementById('successModal'));
          successModal.show();
          
          // Rediriger après la fermeture de la modale
          document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
            window.location.href = "index.html";
          }, { once: true });
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

        // Limiter le menu déroulant des classes à 4 options visibles
        const classeSelect = document.getElementById("classe");
        if (classeSelect) {
          classeSelect.addEventListener("mousedown", function() {
            this.size = 4;
          });
          classeSelect.addEventListener("blur", function() {
            this.size = 1;
          });
          classeSelect.addEventListener("change", function() {
            this.size = 1;
            this.blur();
          });
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
              locale: 'fr',
              minDate: 'today',
              disableMobile: true,
              conjunction: ' au ',
              rangeSeparator: ' au ',
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

// ******************************************************  js page de restitution *****************************************************************

// Données d'exemple pour simuler un prêt (dans une vraie application, elles viendraient d'une base de données ou de l'URL)
const loanData = {
  item: "souris logitek g 502",
  intervenant: "GOJO",
  nom: "Yeager",
  prenom: "Eren",
  classe: "BTS SIO 1",
  etat: "Bon",
  notes: "loger nunc suscipit sed hendrerit semper veli class aptent tachi socioas ad litora torquent per conubia incepti himenaeos orci netus magna tristique tacilisis viverra, a consectetur sapien fringilla malesuada porro scelerisque lorem mauris eros lobortis velit maeciti mattis scelerisque maximus eget fermentum odio placerat ultrices efficitur bacsed nulla eleifend.",
  datePret: "2025-06-08",
  dateRetour: "2025-06-22"
};

// Attendre que le DOM soit chargé avant d'initialiser
window.addEventListener('DOMContentLoaded', function() {
  // Pré-remplir les champs du formulaire de restitution
  if (document.getElementById("returnForm")) {
    const itemNameEl = document.getElementById("itemNameReturn");
    if (itemNameEl) {
    itemNameEl.textContent = loanData.item;
  }

  // Remplir les champs
  const intervenantInput = document.getElementById("intervenantReturn");
  if (intervenantInput) intervenantInput.value = loanData.intervenant;

  const nomInput = document.getElementById("emprunteurNomReturn");
  if (nomInput) nomInput.value = loanData.nom;

  const prenomInput = document.getElementById("emprunteurPrenomReturn");
  if (prenomInput) prenomInput.value = loanData.prenom;

  const classeInput = document.getElementById("classeReturn");
  if (classeInput) classeInput.value = loanData.classe;

  // Afficher l'état du prêt avec un badge coloré
  const etatPretBadge = document.getElementById("etatPretBadge");
  if (etatPretBadge) {
    etatPretBadge.textContent = loanData.etat;
    etatPretBadge.className = "badge-etat " + loanData.etat.toLowerCase();
  }

  // Retirer tous les checked existants et pré-sélectionner le bon état
  const tousLesBoutonsReturn = document.querySelectorAll('input[name="etatReturn"]');
  tousLesBoutonsReturn.forEach(btn => {
    btn.removeAttribute('checked');
    btn.checked = false;
  });
  
  // Sélectionner le bon état selon loanData
  const etatRetourRadio = document.querySelector(`input[name="etatReturn"][value="${loanData.etat}"]`);
  if (etatRetourRadio) {
    etatRetourRadio.setAttribute('checked', 'checked');
    etatRetourRadio.checked = true;
    console.log("État de restitution pré-sélectionné:", loanData.etat);
  }

  // Remplir les notes
  const notesTextarea = document.getElementById("notesReturn");
  const notesCount = document.getElementById("notesCountReturn");
  if (notesTextarea && notesCount) {
    notesTextarea.value = loanData.notes;
    notesCount.textContent = `${loanData.notes.length} / 500`;
  }

  // Compteur pour le commentaire de retour
  const commentaireTextarea = document.getElementById("commentaireReturn");
  const commentaireCount = document.getElementById("commentaireCountReturn");
  if (commentaireTextarea && commentaireCount) {
    commentaireTextarea.addEventListener("input", () => {
      commentaireCount.textContent = `${commentaireTextarea.value.length} / 500`;
    });
  }

  // Initialiser le calendrier avec la date de retour prévue
  try {
    const dpReturn = document.getElementById('datePickerReturn');
    const calendarContainerReturn = document.querySelector('.calendar-container-return');
    if (dpReturn && typeof flatpickr === 'function') {
      flatpickr(dpReturn, {
        inline: true,
        appendTo: calendarContainerReturn || undefined,
        altInput: true,
        altFormat: 'j F Y',
        dateFormat: 'Y-m-d',
        locale: 'fr',
        disableMobile: true,
        defaultDate: loanData.dateRetour,
        disable: [
          function(date) {
            // Désactiver toutes les dates sauf la date de retour prévue
            return date.toISOString().split('T')[0] !== loanData.dateRetour;
          }
        ]
      });
    }
  } catch (err) {
    console.warn('flatpickr init failed for return page', err);
  }

  // Validation du formulaire de restitution
  const formReturn = document.getElementById("returnForm");
  if (formReturn) {
    formReturn.addEventListener("submit", function (e) {
      e.preventDefault();

      // Vérifier si le formulaire est valide
      if (!formReturn.checkValidity()) {
        e.stopPropagation();
        formReturn.classList.add("was-validated");
        return;
      }

      try {
        const payload = {
          item: itemNameEl.textContent,
          intervenant: document.getElementById("intervenantReturn").value,
          nom: document.getElementById("emprunteurNomReturn").value,
          prenom: document.getElementById("emprunteurPrenomReturn").value,
          classe: document.getElementById("classeReturn").value,
          etatInitial: loanData.etat,
          etatRetour: document.querySelector('input[name="etatReturn"]:checked').value,
          notesInitiales: document.getElementById("notesReturn").value,
          commentaireRetour: document.getElementById("commentaireReturn").value.trim(),
          dateRetourPrevue: loanData.dateRetour,
          dateRetourEffective: new Date().toISOString().split('T')[0]
        };

        // Afficher la modale de succès
        console.log("Restitution effectuée", payload);
        const successModal = new bootstrap.Modal(document.getElementById('successModalReturn'));
        successModal.show();
        
        // Rediriger après la fermeture de la modale
        document.getElementById('successModalReturn').addEventListener('hidden.bs.modal', function () {
          window.location.href = "index.html";
        }, { once: true });
      } catch (err) {
        alert("Erreur: " + err.message);
      }
    });
  }
  }
}); // Fin du DOMContentLoaded

// ****************************************************** fin js page de restitution **************************************************************