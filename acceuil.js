// Gestion du formulaire de connexion
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                // Simulation de la connexion
                alert(`Connexion réussie pour ${username}`);
                
                // Ici vous pourriez rediriger vers le tableau de bord administrateur
                // window.location.href = 'dashboard.html';
            } else {
                alert('Veuillez remplir tous les champs');
            }
        });
    }
});

// Animation des cartes d'équipement
document.addEventListener('DOMContentLoaded', function() {
    const equipmentCards = document.querySelectorAll('.equipment-card');
    
    equipmentCards.forEach(card => {
        // Animation d'apparition
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Effet hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
        
        // Clic sur les cartes
        card.addEventListener('click', function() {
            const equipmentType = this.querySelector('.card-title').textContent;
            const quantity = this.querySelector('.display-4').textContent;
            
            alert(`${equipmentType}: ${quantity} unités disponibles`);
        });
    });
    
    // Animation d'apparition au scroll
    function animateCards() {
        equipmentCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const cardVisible = cardTop < window.innerHeight;
            
            if (cardVisible) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Déclencher l'animation
    setTimeout(animateCards, 100);
    window.addEventListener('scroll', animateCards);
});

// Gestion des interactions avec les équipements
document.addEventListener('DOMContentLoaded', function() {
    // Simulation de la mise à jour des quantités
    function updateQuantities() {
        const quantities = document.querySelectorAll('.display-4');
        quantities.forEach(quantity => {
            // Animation de compteur
            const currentValue = parseInt(quantity.textContent);
            let newValue = currentValue + Math.floor(Math.random() * 3) - 1;
            newValue = Math.max(0, newValue); // Ne pas aller en dessous de 0
            
            if (newValue !== currentValue) {
                quantity.style.color = newValue > currentValue ? '#28a745' : '#dc3545';
                quantity.textContent = newValue;
                
                setTimeout(() => {
                    quantity.style.color = '#000';
                }, 1000);
            }
        });
    }
    
    // Mise à jour toutes les 30 secondes (simulation)
    setInterval(updateQuantities, 30000);
});

// Gestion des erreurs de connexion
function handleLoginError(message) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Créer un message d'erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = message;
        
        // Ajouter le message d'erreur
        loginForm.appendChild(errorDiv);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Validation des champs de connexion
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && passwordInput) {
        // Validation en temps réel
        usernameInput.addEventListener('input', function() {
            if (this.value.length < 3) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#28a745';
            }
        });
        
        passwordInput.addEventListener('input', function() {
            if (this.value.length < 6) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#28a745';
            }
        });
    }
});