// ********************************************************** js page principale **********************************************************************
// Variable globale pour stocker les matériels chargés depuis l'API
let items = [];

/**
 * Charger les matériels depuis l'API
 */
async function chargerMateriels() {
  try {
    items = await API.getMateriels();
    console.log('Matériels chargés:', items.length);
    renderItems();
    attachDeleteHandlers();
  } catch (error) {
    console.error('Erreur lors du chargement des matériels:', error);
    // Afficher un message d'erreur à l'utilisateur
    const container = document.getElementById("inventoryList");
    if (container) {
      container.innerHTML = `
        <div class="alert alert-warning" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Erreur lors du chargement des données. Veuillez rafraîchir la page.
        </div>
      `;
    }
  }
}

/**
 * Afficher les matériels
 */
function renderItems() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const container = document.getElementById("inventoryList");
  container.innerHTML = "";

  items.forEach(item => {
    if ((categoryFilter && item.categorie !== categoryFilter) ||
        (statusFilter && item.status !== statusFilter)) {
      return;
    }

    const statusClass = `status-${item.status}`;
    const listItem = document.createElement("div");
    listItem.className = "list-group-item";
    listItem.dataset.itemId = item.id; // Ajouter l'ID comme data attribute

    listItem.innerHTML = `
      <div class="left">
        <div class="item-icon"><i class="fas ${item.icone}"></i></div>
        <div class="item-meta">
          <div><strong>${item.nom}</strong></div>
          <div><span class="status-dot ${statusClass}"></span>${item.status}</div>
        </div>
      </div>
      <div class="item-right">
        ${item.status === 'disponible' ? '' : `<div class="text-muted small">${item.dateAjout}</div>`}
        <button class="trash-btn" title="Supprimer" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    container.appendChild(listItem);
  });
  
  // Attacher les gestionnaires de clic après le rendu
  attachClickHandlers();
}

// Nouvelle fonction pour attacher les gestionnaires de clic sur les items
function attachClickHandlers() {
  const listItems = document.querySelectorAll('#inventoryList .list-group-item');
  const categoryFilter = document.getElementById("categoryFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  
  // Créer le tableau filtré pour correspondre à l'ordre d'affichage
  const filteredItems = items.filter(item => {
    return (!categoryFilter || item.categorie === categoryFilter) &&
           (!statusFilter || item.status === statusFilter);
  });
  
  listItems.forEach((listItem, index) => {
    listItem.style.cursor = 'pointer';
    
    listItem.addEventListener('click', function(e) {
      // Ne pas ouvrir si on clique sur le bouton de suppression
      if (e.target.closest('.trash-btn')) {
        return;
      }
      
      // Trouver l'item correspondant dans le tableau
      if (filteredItems[index]) {
        const itemIndex = items.indexOf(filteredItems[index]);
        ouvrirFicheProduit(filteredItems[index], itemIndex);
      }
    });
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
  let currentItemId = null;

  deleteBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Empêcher l'ouverture de l'offcanvas
      const itemId = parseInt(btn.dataset.id);
      currentItemId = itemId;
      
      // Trouver l'item dans le tableau
      const item = items.find(i => i.id === itemId);
      if (item) {
        deleteIcon.innerHTML = `<i class="fas ${item.icone} fa-2x"></i>`;
        deleteName.textContent = item.nom;
        bsModal.show();
      }
    });
  });
  
  // Gestionnaire de confirmation
  if (confirmBtn) {
    // Retirer les anciens listeners pour éviter les doublons
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', async () => {
      if (currentItemId !== null) {
        try {
          await API.deleteMateriel(currentItemId);
          bsModal.hide();
          await chargerMateriels(); // Recharger les données
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du matériel');
        }
      }
    });
  }
}

const catFilterEl = document.getElementById('categoryFilter');
if (catFilterEl) catFilterEl.addEventListener('change', renderItems);
const statusFilterEl = document.getElementById('statusFilter');
if (statusFilterEl) statusFilterEl.addEventListener('change', renderItems);

// Charger les données au chargement de la page
window.onload = function(){
  chargerMateriels();
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

// ********************************************************** js fiche produit (offcanvas) **********************************************************

/**
 * Récupérer l'historique des prêts via l'API
 */
async function getHistoriquePrets(materielId) {
  try {
    return await API.getPretsByMaterielId(materielId);
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    return [];
  }
}

/**
 * Ajouter un prêt via l'API (appelé depuis creation-pret.html)
 */
async function ajouterPret(materielId, pretData) {
  try {
    const pretPayload = {
      materielId: materielId,
      emprunteur: pretData.nom + ' ' + pretData.prenom,
      datePret: pretData.datePret,
      dateRetour: pretData.dateRetour,
      etatPret: pretData.etat,
      intervenant: pretData.intervenant,
      classe: pretData.classe,
      notes: pretData.notes
    };
    
    await API.ajouterPret(pretPayload);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du prêt:', error);
    throw error;
  }
}

/**
 * Mettre à jour un prêt lors de la restitution
 */
async function mettreAJourRestitution(pretId, etatRetour) {
  try {
    await API.updatePret(pretId, {
      etatRetour: etatRetour,
      dateRestitution: new Date().toISOString().split('T')[0]
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la restitution:', error);
    throw error;
  }
}

/**
 * Ouvrir l'offcanvas avec la fiche produit
 */
function ouvrirFicheProduit(item, itemIndex) {
  // Remplir les informations du produit
  document.getElementById('ficheNom').textContent = item.nom;
  
  // Icône
  const ficheIcon = document.getElementById('ficheIcon');
  ficheIcon.innerHTML = `<i class="fas ${item.icone} fa-3x"></i>`;
  
  // Afficher le status (disponible/indisponible/retard) ET l'état (Bon/Moyen/Mauvais)
  const ficheEtat = document.getElementById('ficheEtat');
  
  // Badge pour le status
  let statusBadge = '';
  switch(item.status) {
    case 'disponible':
      statusBadge = '<span class="badge bg-success me-2">Disponible</span>';
      break;
    case 'indisponible':
      statusBadge = '<span class="badge bg-warning me-2">Indisponible</span>';
      break;
    case 'retard':
      statusBadge = '<span class="badge bg-danger me-2">Retard</span>';
      break;
  }
  
  // Badge pour l'état (Bon/Moyen/Mauvais)
  const etatClass = item.etat ? item.etat.toLowerCase() : 'bon';
  const etatBadge = `<span class="badge badge-etat ${etatClass}">${item.etat || 'Bon'}</span>`;
  
  // Afficher les deux badges
  ficheEtat.innerHTML = statusBadge + etatBadge;
  
  // Générer le QR code avec l'ID du matériel
  const materielId = item.id;
  genererQRCodeFiche(materielId);
  
  // Afficher l'historique des prêts
  afficherHistoriquePrets(materielId);
  
  // Ouvrir l'offcanvas
  const offcanvas = new bootstrap.Offcanvas(document.getElementById('ficheProduitOffcanvas'));
  offcanvas.show();
}

/**
 * Générer le QR code dans la fiche produit
 */
function genererQRCodeFiche(materielId) {
  const ficheQRCode = document.getElementById('ficheQRCode');
  ficheQRCode.innerHTML = ''; // Nettoyer
  
  // Créer le QR code
  new QRCode(ficheQRCode, {
    text: materielId.toString(),
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

/**
 * Afficher l'historique des prêts dans l'offcanvas
 */
async function afficherHistoriquePrets(materielId) {
  const ficheHistorique = document.getElementById('ficheHistorique');
  
  // Afficher un loader pendant le chargement
  ficheHistorique.innerHTML = `
    <div class="text-center py-3">
      <div class="spinner-border text-coral" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  `;
  
  try {
    const historique = await getHistoriquePrets(materielId);
    
    if (historique.length === 0) {
      ficheHistorique.innerHTML = `
        <div class="text-center text-muted py-3">
          <i class="fas fa-inbox fa-2x mb-2"></i>
          <p>Aucun prêt enregistré pour ce matériel</p>
        </div>
      `;
      return;
    }
    
    // Afficher les prêts (du plus récent au plus ancien)
    let html = '<div class="list-group">';
    
    historique.reverse().forEach((pret, index) => {
      const estRestitue = pret.dateRestitution !== null;
      const badgeClass = estRestitue ? 'bg-secondary' : 'bg-primary';
      const badgeText = estRestitue ? 'Restitué' : 'En cours';
    
    html += `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>${pret.emprunteur}</strong>
            <span class="badge ${badgeClass} ms-2">${badgeText}</span>
          </div>
        </div>
        
        <div class="small mb-2">
          <i class="fas fa-calendar-alt me-1"></i>
          <strong>Prêt:</strong> ${pret.datePret} 
          <i class="fas fa-arrow-right mx-2"></i>
          <strong>Retour prévu:</strong> ${pret.dateRetour}
        </div>
        
        <div class="small">
          <span class="badge badge-etat ${pret.etatPret.toLowerCase()}">${pret.etatPret}</span>
          <span class="mx-2">→</span>
          ${estRestitue 
            ? `<span class="badge badge-etat ${pret.etatRetour.toLowerCase()}">${pret.etatRetour}</span>` 
            : '<span class="text-muted">En attente de restitution</span>'}
        </div>
        
        ${estRestitue ? `
          <div class="small text-muted mt-1">
            <i class="fas fa-check-circle me-1"></i>Restitué le ${pret.dateRestitution}
          </div>
        ` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  ficheHistorique.innerHTML = html;
  
  } catch (error) {
    console.error('Erreur lors de l\'affichage de l\'historique:', error);
    ficheHistorique.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Erreur lors du chargement de l'historique
      </div>
    `;
  }
}

// Initialiser les données dans localStorage si elles n'existent pas (fallback)
if (!localStorage.getItem('materiels')) {
  // Copier les données depuis materiels.json dans localStorage
  fetch('./data/materiels.json')
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('materiels', JSON.stringify(data.materiels));
    })
    .catch(error => console.error('Erreur lors de l\'initialisation des matériels:', error));
}

if (!localStorage.getItem('historiquePrets')) {
  // Copier les données depuis prets.json dans localStorage
  fetch('./data/prets.json')
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('historiquePrets', JSON.stringify(data.prets));
    })
    .catch(error => console.error('Erreur lors de l\'initialisation des prêts:', error));
}

// ****************************************************** fin js fiche produit (offcanvas) **************************************************************