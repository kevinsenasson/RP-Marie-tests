//.............choix materiel.js.............//
function choisirMateriel(icon) {
      localStorage.setItem("selectedIcon", icon);
      window.location.href = "materiel.html";
    }

//.............materiel.js.............//

const selectedIcon = localStorage.getItem("selectedIcon");
const iconContainer = document.getElementById("icon-container");

if (selectedIcon && iconContainer) {
  iconContainer.innerHTML = `
    <i class="fas fa-${selectedIcon}" 
       style="font-size: 5rem; color: #00; opacity: 0.8;"></i>
  `;
} else {
  iconContainer.innerHTML = `
    <p class="text-center text-muted">Aucun matériel sélectionné.</p>
  `;
}

// ============================================================
// ========== SYSTÈME DE GÉNÉRATION DE QR CODE ===============
// ============================================================

let qrcodeInstance = null; // Instance du QR code généré
let currentMaterielId = null; // ID du matériel ajouté

/**
 * Récupère le prochain ID disponible (auto-incrémenté)
 * Dans une vraie application, cet ID viendrait de MySQL
 */
function getNextId() {
  // Récupérer le dernier ID utilisé depuis localStorage
  let lastId = localStorage.getItem('lastMaterielId');
  if (!lastId) {
    lastId = 0;
  }
  // Incrémenter et sauvegarder
  const nextId = parseInt(lastId) + 1;
  localStorage.setItem('lastMaterielId', nextId);
  return nextId;
}

/**
 * Simule l'ajout d'un matériel à la base de données
 * Retourne l'ID généré
 */
function ajouterMaterielBD(nomMateriel) {
  // Générer un ID auto-incrémenté
  const materielId = getNextId();
  
  // Simuler l'ajout à la base de données (localStorage pour l'instant)
  const materiel = {
    id: materielId,
    nom: nomMateriel,
    icon: selectedIcon,
    dateAjout: new Date().toISOString()
  };
  
  // Sauvegarder dans localStorage (remplacer par appel API MySQL plus tard)
  let materiels = JSON.parse(localStorage.getItem('materiels') || '[]');
  materiels.push(materiel);
  localStorage.setItem('materiels', JSON.stringify(materiels));
  
  console.log('Matériel ajouté:', materiel);
  return materielId;
}

/**
 * Génère un QR code contenant l'ID du matériel
 */
function genererQRCode(materielId) {
  const qrcodeDisplay = document.getElementById('qrcodeDisplay');
  
  // Nettoyer l'affichage précédent
  qrcodeDisplay.innerHTML = '';
  
  // Créer un conteneur pour le QR code
  const qrContainer = document.createElement('div');
  qrContainer.id = 'qrcode';
  qrContainer.style.padding = '20px';
  qrContainer.style.backgroundColor = 'white';
  qrContainer.style.borderRadius = '10px';
  qrContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  qrcodeDisplay.appendChild(qrContainer);
  
  // Générer le QR code avec l'ID
  qrcodeInstance = new QRCode(qrContainer, {
    text: materielId.toString(),
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  
  console.log('QR Code généré pour l\'ID:', materielId);
}

/**
 * Affiche le message de succès
 */
function afficherMessageSucces(materielId) {
  const messageSucces = document.getElementById('messageSucces');
  const messageTexte = document.getElementById('messageTexte');
  
  messageTexte.textContent = `Matériel ajouté avec succès ! ID: ${materielId}`;
  messageSucces.classList.remove('d-none');
  
  // Masquer le message après 5 secondes
  setTimeout(() => {
    messageSucces.classList.add('d-none');
  }, 5000);
}

/**
 * Affiche les boutons d'actions (télécharger, partager, imprimer)
 */
function afficherActions() {
  const actionsDiv = document.getElementById('qrcodeActions');
  actionsDiv.style.display = 'flex';
}

/**
 * Télécharge le QR code en format PNG
 */
function telechargerQRCode() {
  if (!qrcodeInstance || !currentMaterielId) {
    alert('Veuillez d\'abord générer un QR code');
    return;
  }
  
  const canvas = document.querySelector('#qrcode canvas');
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QRCode_Materiel_${currentMaterielId}.png`;
    link.href = url;
    link.click();
    console.log('QR Code téléchargé');
  }
}

/**
 * Partage le QR code (via Web Share API si disponible)
 */
async function partagerQRCode() {
  if (!qrcodeInstance || !currentMaterielId) {
    alert('Veuillez d\'abord générer un QR code');
    return;
  }
  
  const canvas = document.querySelector('#qrcode canvas');
  if (canvas) {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `QRCode_Materiel_${currentMaterielId}.png`, { type: 'image/png' });
      
      // Vérifier si l'API Web Share est disponible
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'QR Code Matériel',
            text: `QR Code pour le matériel ID: ${currentMaterielId}`,
            files: [file]
          });
          console.log('QR Code partagé avec succès');
        } catch (err) {
          console.log('Partage annulé ou erreur:', err);
        }
      } else {
        // Fallback: télécharger si le partage n'est pas disponible
        alert('Le partage n\'est pas disponible sur ce navigateur. Le QR code va être téléchargé.');
        telechargerQRCode();
      }
    });
  }
}

/**
 * Imprime le QR code
 */
function imprimerQRCode() {
  if (!qrcodeInstance || !currentMaterielId) {
    alert('Veuillez d\'abord générer un QR code');
    return;
  }
  
  const qrcodeContainer = document.getElementById('qrcodeContainer');
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Code - Matériel ${currentMaterielId}</title>
      <style>
        body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
        }
        h1 {
          margin-bottom: 20px;
        }
        .qr-container {
          padding: 20px;
          border: 2px solid #333;
          border-radius: 10px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <h1>Matériel ID: ${currentMaterielId}</h1>
      <div class="qr-container">
        ${qrcodeContainer.innerHTML}
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Attendre que l'image soit chargée avant d'imprimer
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
  
  console.log('QR Code envoyé à l\'impression');
}

// ============================================================
// ========== ÉVÉNEMENTS ET INITIALISATION ===================
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  
  // Événement: Ajouter à la base de données
  const btnAjouterBD = document.getElementById('btnAjouterBD');
  if (btnAjouterBD) {
    btnAjouterBD.addEventListener('click', function() {
      const nomInput = document.getElementById('materielNom');
      const nomMateriel = nomInput.value.trim();
      
      // Validation
      if (!nomMateriel) {
        alert('Veuillez saisir le nom du matériel');
        nomInput.focus();
        return;
      }
      
      // Ajouter à la BD et récupérer l'ID
      currentMaterielId = ajouterMaterielBD(nomMateriel);
      
      // Générer le QR code avec l'ID
      genererQRCode(currentMaterielId);
      
      // Afficher le message de succès
      afficherMessageSucces(currentMaterielId);
      
      // Afficher les boutons d'actions
      afficherActions();
      
      // Désactiver le bouton après l'ajout
      btnAjouterBD.disabled = true;
      btnAjouterBD.textContent = 'Matériel ajouté ✓';
      btnAjouterBD.style.opacity = '0.7';
    });
  }
  
  // Événement: Télécharger le QR code
  const btnTelecharger = document.getElementById('btnTelecharger');
  if (btnTelecharger) {
    btnTelecharger.addEventListener('click', telechargerQRCode);
  }
  
  // Événement: Partager le QR code
  const btnPartager = document.getElementById('btnPartager');
  if (btnPartager) {
    btnPartager.addEventListener('click', partagerQRCode);
  }
  
  // Événement: Imprimer le QR code
  const btnImprimer = document.getElementById('btnImprimer');
  if (btnImprimer) {
    btnImprimer.addEventListener('click', imprimerQRCode);
  }
  
});

// ============================================================
// ========== FIN DU SYSTÈME DE QR CODE ======================
// ============================================================