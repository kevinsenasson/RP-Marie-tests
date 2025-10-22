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