# 🏰 AnimalVillage

Jeu de construction et de gestion d'un village médiéval en **Three.js**, jouable directement dans le navigateur.

## 🎮 Jouer

Le jeu est une page web autonome : Three.js est chargé depuis un CDN et aucune installation n'est nécessaire.

**GitHub Pages :** https://tabodevmc.github.io/AnimalVillage/

## 🕹️ Commandes

| Action | Contrôle |
|---|---|
| Construire | Clic gauche sur le terrain |
| Supprimer un bâtiment | Clic droit sur le bâtiment |
| Construire une zone | `Shift` + clic gauche |
| Supprimer tout | `Shift` + clic droit |
| Tourner les bâtiments | `R` |
| Déplacer la caméra | `W A S D` |
| Rotation de la caméra | Souris après verrouillage du pointeur |
| Zoom | Molette |

Les bâtiments occupent plusieurs tuiles et **ne peuvent pas se superposer**.

## 🏗️ Construction

Chaque bâtiment possède :

- une taille au sol ;
- un coût en ressources ;
- un nombre de travailleurs nécessaires à sa construction ;
- éventuellement une production, du stockage ou de la population supplémentaire ;
- parfois une technologie requise.

La construction est progressive. Les travailleurs sont bloqués pendant le chantier puis redeviennent disponibles une fois le bâtiment terminé.

### Bâtiments disponibles

- 🏠 Maison — augmente la population.
- 🌾 Ferme — produit de la nourriture.
- 🪵 Scierie — produit du bois.
- 🪨 Carrière — produit de la pierre.
- ⛏️ Mine — produit des métaux.
- 🪙 Marché — permet le commerce.
- 🌾 Grenier — augmente le stockage de nourriture.
- 📦 Entrepôt — augmente les stocks de bois, pierre et métaux.
- 🏦 Trésor — augmente le stockage de monnaie.
- ⚒️ Forge — produit des métaux.
- 🍺 Taverne — augmente la population.
- 🌬️ Moulin — production alimentaire avancée.
- 🥖 Boulangerie — forte production alimentaire.
- ⚔️ Caserne — permet de former des soldats.
- 🗼 Tour de garde — infrastructure militaire.
- 🧱 Remparts — défense du village.
- 📚 Université — produit de la recherche.
- 🏭 Scierie améliorée — forte production de bois.

## 📦 Ressources

Le village commence avec :

- **120 bois**
- **100 nourriture**
- **80 pierre**
- **40 métaux**
- **250 monnaie**

Les capacités de stockage de base sont augmentées par les bâtiments de stockage.

La production est limitée par la capacité disponible : un bâtiment ne peut pas produire une ressource déjà au maximum de son stockage.

## 🪙 Commerce

Le marché permet d'acheter et de vendre :

- bois ;
- nourriture ;
- pierre ;
- métaux.

Les prix sont **dynamiques** : ils évoluent en fonction du stock du village et des transactions précédentes. La technologie **Commerce organisé** réduit les prix.

## ⚔️ Armée

Une caserne permet de recruter des soldats.

Former un soldat consomme :

- nourriture ;
- métaux ;
- monnaie ;
- un habitant disponible.

Les soldats consomment également de la nourriture au fil du temps. Si le village manque de nourriture, le moral baisse et l'armée peut perdre des soldats.

## 🔬 Technologies

La recherche permet de débloquer progressivement les infrastructures avancées.

### Arbre technologique

```text
Maçonnerie ──┬── Métallurgie ── Ingénierie
             │
             └── Commerce organisé ──┐
                                     ├── Érudition
Agriculture avancée ─────────────────┘
```

Technologies :

1. **Maçonnerie** — accélère la construction.
2. **Agriculture avancée** — débloque moulin et boulangerie.
3. **Métallurgie** — débloque caserne et tour.
4. **Commerce organisé** — améliore les prix du commerce.
5. **Ingénierie** — débloque les remparts et la scierie améliorée.
6. **Érudition** — double la vitesse de recherche.

L'université génère automatiquement de la recherche.

## 👥 Villageois

Le jeu possède une petite IA de villageois :

- les habitants apparaissent automatiquement selon la population ;
- ils se déplacent dans le village ;
- ils ont un métier simulé ;
- ils gèrent faim et énergie ;
- ils peuvent manger ou dormir lorsque leurs besoins deviennent trop faibles.

La fenêtre **Villageois** permet de consulter leur état.

## 🌦️ Météo et climat

La météo repose sur trois variables continues comprises entre **0 et 1** :

- 🌡️ température ;
- 💧 humidité ;
- 💨 vent.

Le climat évolue progressivement à partir de sa valeur précédente, d'une composante aléatoire et des valeurs de référence de la saison.

La météo change toutes les **4 à 10 minutes**.

### Météos disponibles

- ☀️ Beau temps
- 🌤️ Éclaircies
- ☁️ Nuageux
- 🌧️ Pluie
- 🌧️ Pluie torrentielle
- 🌨️ Neige
- ❄️ Tempête de neige
- ⛈️ Orage
- 🌀 Ouragan
- 🔥 Canicule

### Effets

La météo modifie la production :

- la pluie favorise les fermes ;
- la canicule réduit fortement leur rendement ;
- neige et blizzard ralentissent la production ;
- l'ouragan est extrêmement pénalisant.

Certaines météos peuvent aussi endommager les bâtiments :

- pluie torrentielle → risque d'inondation ;
- neige et blizzard → dégâts ;
- orage → dégâts et foudre ;
- ouragan → très gros dégâts ;
- canicule → dégâts supplémentaires.

Les bâtiments possèdent des points de vie et peuvent être détruits par les événements météorologiques sévères.

## 🧱 Architecture technique

Le projet est volontairement simple :

- **HTML/CSS/JavaScript** dans `index.html` ;
- **Three.js 0.180.0** pour le rendu 3D ;
- génération procédurale des bâtiments avec des meshes Three.js ;
- aucune dépendance de build ou framework obligatoire ;
- déploiement possible directement avec GitHub Pages.

## 📁 Structure

```text
AnimalVillage/
├── index.html   # Jeu complet
└── README.md    # Documentation du projet
```

## 🚀 Développement

Pour modifier le jeu, le fichier principal est `index.html`.

Après une modification :

1. enregistrer le fichier ;
2. ouvrir/recharger la page ;
3. vérifier la console du navigateur en cas d'erreur JavaScript ;
4. tester construction, suppression, commerce, technologie, armée et météo.

## 📌 État du projet

AnimalVillage est actuellement un **prototype jouable** orienté construction/gestion. Les systèmes de gestion, météo, commerce, technologies, armée et IA villageoise sont présents mais peuvent encore être approfondis.

## 🔮 Idées d'évolution

- sauvegarde et chargement des villages ;
- vraies routes et pathfinding des villageois ;
- emplois affectés à de vrais bâtiments ;
- saisons qui changent réellement avec le temps ;
- pluie, neige, nuages et éclairs en 3D ;
- inondations avec zones d'eau persistantes ;
- système de défense et attaques ennemies ;
- objectifs et campagnes ;
- bâtiments avec niveaux et améliorations ;
- interface plus riche et tutoriel de début de partie.

## 📜 Licence

Aucune licence open source spécifique n'est actuellement déclarée dans le dépôt.