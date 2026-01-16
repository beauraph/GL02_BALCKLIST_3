# GL02 - Sujet B - Groupe Xx_Master_Coder_10000_xX Livrable 3

---


L’objectif principal de l’outil est de permettre à un enseignant de **composer un examen complet** au format GIFT en sélectionnant des questions issues de la banque officielle fournie dans `SujetB_data/`.

Chaque fichier `.gift` du dossier représente un **exercice thématique** contenant plusieurs questions.
Un examen réglementaire du SRYEM doit contenir **entre 15 et 20 questions**, sans doublons.


## Équipe - Groupe Blacklist

- **El Amir Abdelkader IDIR**
- **Hong Phuoc DINH**
- **Raphaël BEAU**

---

## Description

Outil permettant aux enseignants du SRYEM (Sealand Republic Youth Education Ministry) de composer des examens conformes au format GIFT en sélectionnant des questions depuis la banque nationale certifiée.

**Contraintes institutionnelles :**
- Un examen doit contenir **entre 15 et 20 questions**
- Pas de doublons
- Format compatible Moodle

---

## Installation

### Prérequis
- Node.js (v18+)
- npm

### Installation rapide
```bash
# Cloner le projet
git clone https://github.com/beauraph/GL02_BALCKLIST_3.git
cd GL02_BALCKLIST_3

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

> **Note :** Si vous modifiez le code TypeScript, recompilez avec `npm run build` avant de relancer.

---

## Fonctionnalités

### Principales (Cahier des charges)
-  **EF01** - Recherche de questions par mot-clé
-  **EF02** - Affichage détaillé d'une question
-  **EF03/04** - Ajout de questions avec détection de doublons
-  **EF05** - Validation du nombre de questions (15-20)
-  **EF06** - Export au format GIFT conforme Moodle
-  **EF07** - Génération de vCard enseignant (RFC 6350)
-  **EF08** - Simulation de passation d'examen
-  **EF09** - Bilan détaillé avec score sur 20
-  **EF10** - Analyse statistique du profil d'examen

### Nouvelles fonctionnalités (Phase 3)
-  **Export avec catégories** - Préserve les catégories GIFT lors de l'import/export
-  **Randomisation des réponses** - Mélange aléatoire des réponses lors de la simulation
-  **Validation de qualité** - Détecte les erreurs et warnings dans les questions

---

##  Documentation

Pour plus de détails, consultez le **[Wiki du projet](https://github.com/beauraph/GL02_BALCKLIST_3/wiki)** :
- [Guide Utilisateur](https://github.com/beauraph/GL02_BALCKLIST_3/wiki/Guide-Utilisateur)
- [Guide Développeur](https://github.com/beauraph/GL02_BALCKLIST_3/wiki/Guide-Développeur)

---

## Utilisation rapide

### 1. Lancer l'application
```bash
npm start
```

### 2. Composer un examen
1. Choisir **"Edit an existing Gift file"**
2. Charger un fichier depuis `./SujetB_data/`
3. Ajouter des questions : **"Add a new question"** → **"Select file & questions"**
4. Vérifier : **"List all questions"** (doit avoir 15-20 questions)
5. Valider : **"Validate exam questions"** (nouveau !)
6. Exporter : **"Export exam to GIFT file"**

### 3. Simuler un examen
1. **"Simulate exam"** - Les réponses sont mélangées automatiquement (nouveau !)
2. Répondre aux questions
3. **"Show exam summary"** - Voir le score

---

## Architecture du projet
```
src/
- index.ts          # Point d'entrée, CLI
- classes.ts        # Modèles (Question, Exam, Category)
- parser.ts         # Parser GIFT
- writer.ts         # Export GIFT
- vcard.ts          # Génération vCard

./SujetB_data/          # Banque de questions certifiée SRYEM
```

---

## 🧪 Tests
```bash
npm run build
npm test
```

Les tests couvrent :
- Parsing GIFT
- Gestion des doublons
- Validation des contraintes (15-20 questions)
- Export GIFT
- Analyse statistique

---

## Contribution

Ce projet a été développé dans le cadre du module GL02 - UTT.

**Workflow Git :**
- Branche `main` : version stable
- Branche `develop` : intégration des features
- Branches `feature/*` : développement de nouvelles fonctionnalités

---

## 🎓 Références

- [Format GIFT - Documentation Moodle](https://docs.moodle.org/en/GIFT_format)
- [RFC 6350 - vCard Format](https://tools.ietf.org/html/rfc6350)
- [Cahier des charges SRYEM](lien-vers-le-cahier-des-charges)
