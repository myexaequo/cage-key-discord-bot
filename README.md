# Cage & Key — Discord Bot V1

Bot Discord pour l’accueil, le questionnaire d’admission, la validation humaine et les profils des membres de **Cage & Key**.

## Fonctionnalités V1

- Animation néon `Cage & Key` à l’arrivée.
- Choix de langue FR / NL / EN, puis parcours traduit.
- Rôle temporaire `En attente`.
- Questionnaire : âge, orientation, genre, rôle, dispositifs, gestion des clés, kinks.
- `-18 ans` : arrêt immédiat, message 18+, journalisation minimale, kick automatique et suppression du brouillon.
- Récapitulatif avant envoi ; toutes les réponses validées sont visibles dans `/profil`.
- Demandes publiées dans `#validation`.
- Boutons staff : Accepter / Refuser / Demander une précision.
- Refus avec motif + MP + kick.
- Demande de précision avec réponse via modal et retour dans `#validation`.
- Acceptation : `Membre` + rôle de langue, retrait de `En attente`, animation de cadenas qui s’ouvre.
- Création automatique des rôles `En attente`, `Membre`, `FR`, `NL`, `EN` s’ils n’existent pas.
- Rôles `Propriétaire`, `Administrateur` et `Modérateur` laissés à Discord.
- SQLite local persistant dans `DATA_DIR`.
- `/commencer` pour relancer/reprendre l’inscription si les MP sont bloqués.
- `/profil [membre]` pour afficher un profil validé (réservé aux membres validés et au staff).
- `/health` pour l’hébergement en container.

## Pré-requis

- Node.js **24.17+** (la documentation actuelle de discord.js 14 l’exige).
- Un bot Discord avec l’intent privilégié **Server Members Intent / Guild Members** activé.
- Permissions du bot : `Manage Roles`, `Kick Members`, `View Channels`, `Send Messages`, `Read Message History`, `Embed Links`, `Attach Files`.
- Le rôle du bot doit être placé **au-dessus** de `En attente`, `Membre`, `FR`, `NL`, `EN`.

## Installation

```bash
cp .env.example .env
npm install
npm start
```

Au premier démarrage, le bot crée les rôles fonctionnels manquants et enregistre les commandes de serveur si `REGISTER_COMMANDS_ON_START=true`.

## Configuration Discord

Renseigner dans `.env` :

- `DISCORD_TOKEN` : token du bot.
- `CLIENT_ID` : Application ID du bot.
- `GUILD_ID` : ID du serveur Cage & Key.
- `VALIDATION_CHANNEL_ID` : ID du canal `#validation`.
- `LOG_CHANNEL_ID` : canal de journalisation (facultatif mais recommandé).
- `FR_CATEGORY_ID`, `NL_CATEGORY_ID`, `EN_CATEGORY_ID` : catégories linguistiques.
- `MODERATOR_ROLE_ID`, `ADMIN_ROLE_ID`, `OWNER_ROLE_ID` : IDs des rôles staff existants (recommandé).

### Permissions des catégories par langue

Le bot attribue le rôle `FR`, `NL` ou `EN` après acceptation. Dans Discord, configure chaque catégorie pour :

- refuser `Voir le salon` à `@everyone` ;
- autoriser `Voir le salon` au rôle correspondant (`FR`, `NL` ou `EN`) ;
- conserver les permissions nécessaires pour le staff.

Le bot vérifie cette configuration au démarrage et affiche un avertissement dans les logs s’il détecte un problème ; il ne réécrit pas automatiquement les permissions existantes afin de ne pas casser la structure du serveur.

## Docker

```bash
docker build -t cage-key-bot .
docker run --env-file .env -e DATA_DIR=/data -v cage-key-data:/data -p 3000:3000 cage-key-bot
```

Le stockage `/data` doit être monté sur un volume persistant. En local hors Docker, utilise plutôt `DATA_DIR=./data`.

## Sécurité des données

Les profils contiennent des informations personnelles sensibles. Le fichier SQLite ne doit pas être commité dans Git, exposé publiquement ou copié dans les logs. Le bot ne journalise pas les réponses du questionnaire lors de l’exclusion d’une personne ayant déclaré avoir moins de 18 ans.

## Prévisualisation web interactive

La V1 inclut une prévisualisation locale qui reproduit le parcours du bot dans une interface inspirée de Discord. Elle n'utilise ni le token Discord ni la base de production.

```bash
npm run preview
```

Puis ouvrir : `http://localhost:3000/preview`

La preview permet de tester :

- l'animation néon d'arrivée ;
- le choix FR / NL / EN ;
- toutes les questions et sélections multiples ;
- le blocage et la simulation du kick pour `-18 ans` ;
- le récapitulatif avant envoi ;
- l'état « en attente » ;
- la fiche envoyée dans `#validation` ;
- les boutons Accepter / Refuser / Demander une précision ;
- l'animation du cadenas lors de l'acceptation ;
- le déverrouillage visuel de la catégorie linguistique.

Pour lancer la preview sur un autre port :

```bash
PREVIEW_PORT=8080 npm run preview
```
