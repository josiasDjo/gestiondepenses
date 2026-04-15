# DOCUMENTATION DU PROJET GESTION DEPENSES

## **PRESENTATION DU PROJET**

Gestion Dépenses est une application web qui aide les ménages à gérer leur argent au quotidien. Elle permet de suivre les revenus et les dépenses, de visualiser des graphiques, de gérer plusieurs comptes bancaires et de travailler à plusieurs dans le même ménage.

L'application a été développée avec des technologies du côté serveur, Node.js, Express et la base de données MySQL. Le côté client utilise React et Tailwind CSS pour l'interface utilisateur.


## **PREREQUIS POUR EXECUTER LE PROJET**

Avant de pouvoir lancer l'application, vous devez installer certains logiciels sur votre ordinateur.

*1. NODEJS* 
*2. WAMPSERVER ou XAMPER*
*3. VS CODE*

## **INSTALLATION DU PROJET**

Commencez par récupérer le code source du projet. Si vous avez un lien de téléchargement, décompressez le fichier dans un dossier de votre ordinateur. Sinon, ouvrez un terminal dans le dossier où vous voulez mettre le projet et exécutez la commande git clone https://github.com/josiasDjo/gestiondepenses.git 

Une fois le code récupéré, ouvrez un terminal dans le dossier racine du projet. Ce dossier contient deux sous dossiers principaux : backend et frontend.

### *Installation des dépendances*
Dans le dossier racine exécuter la commande  **npm run dep_install** pour installer toutes les dépendances coté Frontend & Backend


## **CONFIGURATION DE LA BASE DE DONNEES**

Avant de lancer l'application, vous devez créer la base de données.

Ouvrez votre outil de gestion MySQL. Créez une nouvelle base de données que vous pouvez appeler gestion_depenses. Choisissez l'encodage **utf8mb4_unicode_ci general** .

Ensuite, importez le fichier SQL qui se trouve dans le dossier **backend/sql**. Le fichier s'appelle gestion_financiere.sql. Pour importer, allez dans l'onglet Importer de phpMyAdmin, sélectionnez le fichier et cliquez sur Exécuter.

Cela va créer toutes les tables nécessaires : utilisateurs, menages, comptes, transactions, devises, invitations, alertes et les tables de liaison.

## **CONFIGURATION DES VARIABLES D'ENVIRONNEMENT**

Le projet utilise un fichier de configuration pour les informations sensibles comme les mots de passe. Dans le dossier backend, vous trouverez un fichier appelé .env.local Renommez le en .env

Ouvrez le fichier .env avec un éditeur de texte. Vous devez y renseigner les informations et mettez les informations suivantes :


PORT=5000

NODE_ENV=development

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=Votre_mot_de_passe_phpMyAdmin

DB_NAME=gestion_financiere

DB_PORT=3306

JWT_SECRET=une_phrase_longue_et_aléatoire

JWT_EXPIRE=7d

SESSION_SECRET=une_phrase_longue_et_aléatoire

PORT=5000

NODE_ENV=development

FRONTEND_URL=http://localhost:5173




## **LANCEMENT DE L'APPLICATION**

Maintenant que tout est configuré, vous pouvez lancer l'application.

Le projet utilise un outil appelé concurrently qui permet de lancer le serveur et le client en même temps. Depuis le dossier racine du projet.

Pour lancer l'application, exécutez la commande **npm run dev**

Vous verrez deux serveurs démarrer. Le backend tourne sur le port 5000. Le frontend tourne sur le port 5173.

Ouvrez votre navigateur et allez à l'adresse http://localhost:5173. L application devrait s afficher.

Pour arrêter l'application, appuyez sur les touches Ctrl et C en même temps dans le terminal.



## **FONCTIONNALITES DE L APPLICATION**

Un utilisateur peut s'inscrire avec un email et un mot de passe ou utiliser son compte Google. À l'inscription, un ménage est automatiquement créé. Un utilisateur peut appartenir à plusieurs ménages et changer de ménage actif via un sélecteur.

Un administrateur de ménage peut inviter d'autres utilisateurs par email. L'invité reçoit une notification et peut accepter ou refuser. L'utilisateur peut créer plusieurs comptes bancaires associés aux Francs Congolais ou aux Dollars Américains.

Il peut ajouter, modifier ou supprimer des transactions de type revenu ou dépense. Le solde du compte se met à jour automatiquement. Le tableau de bord affiche le solde total, les revenus et dépenses du mois, séparés par devise. Deux graphiques montrent l'évolution sur six mois et la répartition par catégorie.

## **STRUCTURE DU PROJET**

Le dossier backend contient tout le code serveur. Le dossier config contient la configuration de la base de données et de l authentification. Le dossier controllers contient les fonctions qui répondent aux requêtes. Le dossier models contient la définition des tables. Le dossier routes contient les adresses des API. Le dossier middleware contient les fonctions de vérification comme l authentification.

Le dossier frontend contient tout le code client. Le dossier src contient le code source React. Le dossier components contient les petits éléments réutilisables. Le dossier pages contient les grandes pages comme le tableau de bord ou les transactions. Le dossier context contient la gestion de l état global comme le ménage actif. Le dossier hooks contient des fonctions personnalisées.

Le dossier sql contient le fichier pour créer la base de données.

Le fichier .env contient les variables de configuration.

Le fichier package.json liste toutes les dépendances du projet.

## **ERREURS COURANTES ET SOLUTIONS**

Si l'application ne se lance pas, vérifiez que vous avez bien exécuté npm run .

Si la base de données ne se connecte pas, vérifiez que MySQL est bien démarré et que les identifiants dans le fichier .env sont corrects.

Si les requêtes API retournent une erreur 401, cela signifie que vous n êtes pas connecté ou que votre token a expiré. Reconnectez vous.

Si l'erreur 404 apparaît, cela signifie que l'adresse demandée n existe pas. Vérifiez que le serveur backend tourne sur le port 5000.

Si les styles ne s'appliquent pas, vérifiez que Tailwind CSS est bien installé. Exécutez npm install dans le dossier frontend si nécessaire.

Si l'authentification Google ne fonctionne pas, vérifiez que les identifiants dans le fichier .env sont corrects et que l URI de redirection est exactement http://localhost:5000/api/auth/google/callback.