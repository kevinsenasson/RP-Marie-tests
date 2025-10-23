/**
 * API Simulation - Interface pour les données
 * Ce fichier simule une API REST qui sera remplacée par de vraies requêtes MySQL plus tard
 */

const API = {
  // URL de base (pour le moment fichiers locaux, plus tard ce sera votre backend)
  BASE_URL: './data',
  
  /**
   * Récupérer tous les matériels
   */
  async getMateriels() {
    try {
      const response = await fetch(`${this.BASE_URL}/materiels.json`);
      if (!response.ok) throw new Error('Erreur lors du chargement des matériels');
      const data = await response.json();
      return data.materiels;
    } catch (error) {
      console.error('Erreur API getMateriels:', error);
      // Fallback sur localStorage si le fichier JSON n'existe pas encore
      return JSON.parse(localStorage.getItem('materiels') || '[]');
    }
  },

  /**
   * Récupérer un matériel par ID
   */
  async getMaterielById(id) {
    const materiels = await this.getMateriels();
    return materiels.find(m => m.id === parseInt(id));
  },

  /**
   * Récupérer les matériels par catégorie
   */
  async getMaterielsByCategorie(categorie) {
    const materiels = await this.getMateriels();
    return materiels.filter(m => m.categorie === categorie);
  },

  /**
   * Récupérer les matériels par status
   */
  async getMaterielsByStatus(status) {
    const materiels = await this.getMateriels();
    return materiels.filter(m => m.status === status);
  },

  /**
   * Ajouter un nouveau matériel
   */
  async ajouterMateriel(materielData) {
    try {
      // Simulation - dans le vrai backend ce sera une requête POST
      const materiels = await this.getMateriels();
      
      // Générer un nouvel ID
      const newId = materiels.length > 0 
        ? Math.max(...materiels.map(m => m.id)) + 1 
        : 1;
      
      const nouveauMateriel = {
        id: newId,
        ...materielData,
        dateAjout: new Date().toLocaleDateString('fr-FR')
      };
      
      materiels.push(nouveauMateriel);
      
      // Sauvegarder dans localStorage (temporaire)
      localStorage.setItem('materiels', JSON.stringify(materiels));
      
      return nouveauMateriel;
    } catch (error) {
      console.error('Erreur API ajouterMateriel:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un matériel
   */
  async updateMateriel(id, updates) {
    try {
      const materiels = await this.getMateriels();
      const index = materiels.findIndex(m => m.id === parseInt(id));
      
      if (index === -1) throw new Error('Matériel non trouvé');
      
      materiels[index] = { ...materiels[index], ...updates };
      localStorage.setItem('materiels', JSON.stringify(materiels));
      
      return materiels[index];
    } catch (error) {
      console.error('Erreur API updateMateriel:', error);
      throw error;
    }
  },

  /**
   * Supprimer un matériel
   */
  async deleteMateriel(id) {
    try {
      const materiels = await this.getMateriels();
      const filtered = materiels.filter(m => m.id !== parseInt(id));
      localStorage.setItem('materiels', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Erreur API deleteMateriel:', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les prêts
   */
  async getPrets() {
    try {
      const response = await fetch(`${this.BASE_URL}/prets.json`);
      if (!response.ok) throw new Error('Erreur lors du chargement des prêts');
      const data = await response.json();
      return data.prets;
    } catch (error) {
      console.error('Erreur API getPrets:', error);
      return JSON.parse(localStorage.getItem('historiquePrets') || '[]');
    }
  },

  /**
   * Récupérer les prêts d'un matériel
   */
  async getPretsByMaterielId(materielId) {
    const prets = await this.getPrets();
    return prets.filter(p => p.materielId === parseInt(materielId));
  },

  /**
   * Ajouter un nouveau prêt
   */
  async ajouterPret(pretData) {
    try {
      const prets = await this.getPrets();
      
      const newId = prets.length > 0 
        ? Math.max(...prets.map(p => p.id)) + 1 
        : 1;
      
      const nouveauPret = {
        id: newId,
        ...pretData,
        etatRetour: null,
        dateRestitution: null
      };
      
      prets.push(nouveauPret);
      localStorage.setItem('historiquePrets', JSON.stringify(prets));
      
      // Mettre à jour le status du matériel à "indisponible"
      await this.updateMateriel(pretData.materielId, { status: 'indisponible' });
      
      return nouveauPret;
    } catch (error) {
      console.error('Erreur API ajouterPret:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un prêt (restitution)
   */
  async updatePret(id, updates) {
    try {
      const prets = await this.getPrets();
      const index = prets.findIndex(p => p.id === parseInt(id));
      
      if (index === -1) throw new Error('Prêt non trouvé');
      
      prets[index] = { ...prets[index], ...updates };
      localStorage.setItem('historiquePrets', JSON.stringify(prets));
      
      // Si c'est une restitution, mettre à jour le status du matériel
      if (updates.dateRestitution) {
        await this.updateMateriel(prets[index].materielId, { 
          status: 'disponible',
          etat: updates.etatRetour 
        });
      }
      
      return prets[index];
    } catch (error) {
      console.error('Erreur API updatePret:', error);
      throw error;
    }
  },

  /**
   * Rechercher des matériels
   */
  async rechercherMateriels(query) {
    const materiels = await this.getMateriels();
    const lowerQuery = query.toLowerCase();
    
    return materiels.filter(m => 
      m.nom.toLowerCase().includes(lowerQuery) ||
      m.categorie.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Obtenir les statistiques
   */
  async getStatistiques() {
    const materiels = await this.getMateriels();
    const prets = await this.getPrets();
    
    return {
      totalMateriels: materiels.length,
      disponibles: materiels.filter(m => m.status === 'disponible').length,
      indisponibles: materiels.filter(m => m.status === 'indisponible').length,
      retards: materiels.filter(m => m.status === 'retard').length,
      totalPrets: prets.length,
      pretsEnCours: prets.filter(p => !p.dateRestitution).length,
      pretsTermines: prets.filter(p => p.dateRestitution).length
    };
  }
};

// Exporter l'API pour l'utiliser dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
