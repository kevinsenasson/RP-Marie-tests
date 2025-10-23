# 📚 Architecture API - MediaStock

## 🎯 Objectif

Cette architecture simule une API REST pour préparer l'intégration future avec une base de données MySQL. Au lieu d'avoir les données en dur dans le code JavaScript, elles sont maintenant organisées dans des fichiers JSON et accessibles via des fonctions API standardisées.

## 📁 Structure des fichiers

```
RP-Marie-tests/
├── data/
│   ├── materiels.json    # Base de données des matériels
│   └── prets.json        # Base de données des prêts
├── api.js                # Interface API (simulation)
├── script.js             # Code principal (utilise l'API)
└── index.html            # Page principale
```

## 🗂️ Structure des données

### Matériels (`materiels.json`)

```json
{
  "materiels": [
    {
      "id": 1,
      "nom": "souris logitek g 502",
      "status": "disponible",
      "etat": "Bon",
      "dateAjout": "03/11/25",
      "categorie": "informatique",
      "icone": "fa-mouse"
    }
  ]
}
```

**Propriétés :**

- `id` (number) : Identifiant unique auto-incrémenté
- `nom` (string) : Nom du matériel
- `status` (string) : État de disponibilité (`disponible`, `indisponible`, `retard`)
- `etat` (string) : État physique (`Bon`, `Moyen`, `Mauvais`)
- `dateAjout` (string) : Date d'ajout au système
- `categorie` (string) : Catégorie (`informatique`, `audio`, `connectiques`, etc.)
- `icone` (string) : Classe Font Awesome pour l'icône

### Prêts (`prets.json`)

```json
{
  "prets": [
    {
      "id": 1,
      "materielId": 1,
      "emprunteur": "Jean Dupont",
      "datePret": "2025-10-01",
      "dateRetour": "2025-10-15",
      "etatPret": "Bon",
      "etatRetour": "Bon",
      "dateRestitution": "2025-10-14",
      "intervenant": "GOJO",
      "classe": "BTS SIO 1",
      "notes": "Prêt pour projet"
    }
  ]
}
```

**Propriétés :**

- `id` (number) : Identifiant unique du prêt
- `materielId` (number) : ID du matériel emprunté (clé étrangère)
- `emprunteur` (string) : Nom complet de l'emprunteur
- `datePret` (string) : Date de début du prêt (YYYY-MM-DD)
- `dateRetour` (string) : Date de retour prévue (YYYY-MM-DD)
- `etatPret` (string) : État au moment du prêt (`Bon`, `Moyen`, `Mauvais`)
- `etatRetour` (string | null) : État au retour (null si pas encore restitué)
- `dateRestitution` (string | null) : Date effective de restitution (null si en cours)
- `intervenant` (string) : Nom de l'intervenant
- `classe` (string) : Classe de l'emprunteur
- `notes` (string) : Notes additionnelles

## 🔌 API disponibles

### Matériels

#### `API.getMateriels()`

Récupère tous les matériels.

```javascript
const materiels = await API.getMateriels();
```

#### `API.getMaterielById(id)`

Récupère un matériel spécifique par son ID.

```javascript
const materiel = await API.getMaterielById(1);
```

#### `API.getMaterielsByCategorie(categorie)`

Récupère tous les matériels d'une catégorie.

```javascript
const informatique = await API.getMaterielsByCategorie("informatique");
```

#### `API.getMaterielsByStatus(status)`

Récupère tous les matériels par statut.

```javascript
const disponibles = await API.getMaterielsByStatus("disponible");
```

#### `API.ajouterMateriel(materielData)`

Ajoute un nouveau matériel.

```javascript
const nouveau = await API.ajouterMateriel({
  nom: "Casque audio",
  status: "disponible",
  etat: "Bon",
  categorie: "audio",
  icone: "fa-headphones",
});
```

#### `API.updateMateriel(id, updates)`

Met à jour un matériel existant.

```javascript
await API.updateMateriel(1, { etat: "Moyen" });
```

#### `API.deleteMateriel(id)`

Supprime un matériel.

```javascript
await API.deleteMateriel(1);
```

### Prêts

#### `API.getPrets()`

Récupère tous les prêts.

```javascript
const prets = await API.getPrets();
```

#### `API.getPretsByMaterielId(materielId)`

Récupère l'historique des prêts d'un matériel.

```javascript
const historique = await API.getPretsByMaterielId(1);
```

#### `API.ajouterPret(pretData)`

Crée un nouveau prêt.

```javascript
await API.ajouterPret({
  materielId: 1,
  emprunteur: "Marie Dupont",
  datePret: "2025-11-01",
  dateRetour: "2025-11-15",
  etatPret: "Bon",
  intervenant: "GOJO",
  classe: "BTS SIO 2",
  notes: "Projet personnel",
});
```

#### `API.updatePret(id, updates)`

Met à jour un prêt (pour la restitution).

```javascript
await API.updatePret(1, {
  etatRetour: "Moyen",
  dateRestitution: "2025-11-14",
});
```

### Utilitaires

#### `API.rechercherMateriels(query)`

Recherche des matériels par nom ou catégorie.

```javascript
const resultats = await API.rechercherMateriels("souris");
```

#### `API.getStatistiques()`

Récupère les statistiques globales.

```javascript
const stats = await API.getStatistiques();
// {
//   totalMateriels: 12,
//   disponibles: 5,
//   indisponibles: 4,
//   retards: 3,
//   totalPrets: 10,
//   pretsEnCours: 3,
//   pretsTermines: 7
// }
```

## 🔄 Flux de données

```
┌─────────────┐
│  index.html │
└──────┬──────┘
       │
    charge
       ↓
┌─────────────┐     utilise     ┌─────────────┐
│  script.js  │ ────────────→   │   api.js    │
└─────────────┘                 └──────┬──────┘
                                       │
                                    lit/écrit
                                       ↓
                        ┌──────────────────────────┐
                        │                          │
                  ┌─────┴─────  ┐           ┌───────┴────────┐
                  │ localStorage│           │  fichiers JSON │
                  └─────────────┘           └────────────────┘
```

### Actuellement (Phase de test)

- Les fichiers JSON servent de **source de vérité**
- L'API lit d'abord les JSON, puis fallback sur localStorage
- Les modifications sont stockées dans localStorage

### Futur (Production avec MySQL)

1. Remplacer `api.js` par de vraies requêtes HTTP vers votre backend
2. Le backend Node.js/PHP/Python gérera les requêtes SQL
3. **Aucun changement dans `script.js` !** Toutes les fonctions API restent identiques

## 🚀 Migration vers MySQL

Quand vous serez prêt à intégrer MySQL, il suffira de modifier `api.js` :

### Avant (simulation locale)

```javascript
async getMateriels() {
  const response = await fetch('./data/materiels.json');
  const data = await response.json();
  return data.materiels;
}
```

### Après (avec backend)

```javascript
async getMateriels() {
  const response = await fetch('https://votre-api.com/api/materiels');
  const data = await response.json();
  return data;
}
```

## 📝 Avantages de cette architecture

✅ **Séparation des responsabilités** : UI (script.js) ≠ Données (api.js)  
✅ **Facile à tester** : Données JSON modifiables sans toucher au code  
✅ **Migration simple** : Un seul fichier à modifier (api.js) pour passer à MySQL  
✅ **Code propre** : Plus de données en dur dans le JavaScript  
✅ **API standardisée** : Toutes les opérations passent par des fonctions async  
✅ **Évolutif** : Facile d'ajouter de nouvelles fonctions API

## 🔧 Maintenance

### Ajouter un nouveau matériel manuellement

Éditez `data/materiels.json` et ajoutez un objet avec un ID unique :

```json
{
  "id": 13,
  "nom": "Tablette graphique",
  "status": "disponible",
  "etat": "Bon",
  "dateAjout": "22/10/25",
  "categorie": "informatique",
  "icone": "fa-tablet"
}
```

### Réinitialiser les données

```javascript
localStorage.clear();
location.reload();
```

Les fichiers JSON seront rechargés automatiquement.

## 🎓 Pour aller plus loin

Prochaines étapes suggérées :

1. ✅ Créer un backend Node.js + Express
2. ✅ Configurer une base MySQL avec les tables `materiels` et `prets`
3. ✅ Implémenter les routes API REST
4. ✅ Modifier `api.js` pour pointer vers le backend
5. ✅ Ajouter l'authentification JWT
6. ✅ Mettre en place les validations côté serveur

---

**Créé le :** 22 octobre 2025  
**Version :** 1.0  
**Auteur :** Kevin (avec l'aide de GitHub Copilot)
