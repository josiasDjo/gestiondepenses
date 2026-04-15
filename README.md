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

Ouvrez votre outil de gestion MySQL. Créez une nouvelle base de données que vous pouvez appeler gestion_depenses. Choisissez l encodage **utf8mb4_unicode_ci general** .

Ensuite, importez le fichier SQL qui se trouve dans le dossier **backend/sql**. Le fichier s appelle gestion_financiere.sql. Pour importer, allez dans l'onglet Importer de phpMyAdmin, sélectionnez le fichier et cliquez sur Exécuter.

Cela va créer toutes les tables nécessaires : utilisateurs, menages, comptes, transactions, devises, invitations, alertes et les tables de liaison.

## **CONFIGURATION DES VARIABLES D ENVIRONNEMENT**

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

#Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173




## **LANCEMENT DE L APPLICATION**

Maintenant que tout est configuré, vous pouvez lancer l application.

Le projet utilise un outil appelé concurrently qui permet de lancer le serveur et le client en même temps. Depuis le dossier racine du projet.

Pour lancer l'application, exécutez la commande **npm run dev**

Vous verrez deux serveurs démarrer. Le backend tourne sur le port 5000. Le frontend tourne sur le port 5173.

Ouvrez votre navigateur et allez à l'adresse http://localhost:5173. L application devrait s afficher.

Pour arrêter l application, appuyez sur les touches Ctrl et C en même temps dans le terminal.



## **FONCTIONNALITES DE L APPLICATION**

L application Gestion Dépenses propose plusieurs fonctionnalités.

Inscription et connexion

Un nouvel utilisateur peut créer un compte en fournissant son nom, son email et un mot de passe. Les mots de passe sont cryptés dans la base de données pour des raisons de sécurité. On peut aussi se connecter avec son compte Google.

Une fois connecté, l utilisateur accède à son tableau de bord personnel.

Gestion des ménages

Quand un utilisateur s inscrit, un ménage est automatiquement créé pour lui. Le ménage porte par défaut le nom Ménage de suivi de son nom.

Un utilisateur peut appartenir à plusieurs ménages. C est utile pour une personne qui gère ses finances personnelles et les finances d une association en même temps.

L utilisateur peut changer de ménage actif via un sélecteur dans le menu. Toutes les données affichées correspondent alors au ménage sélectionné.

Invitation de membres

Un administrateur de ménage peut inviter d autres utilisateurs à rejoindre son ménage. Pour cela, il clique sur le bouton Inviter un membre, saisit l email de la personne à inviter et choisit son rôle.

Le rôle peut être administrateur, ce qui donne le droit d inviter d autres membres, ou simple membre, qui peut seulement consulter et ajouter des transactions.

La personne invitée reçoit une notification dans sa cloche de notifications. Elle peut accepter ou refuser l invitation. Si elle accepte, elle rejoint automatiquement le ménage et peut voir toutes les données de ce ménage.

Gestion des comptes bancaires

L utilisateur peut créer plusieurs comptes comme un compte courant, un portefeuille espèces ou un compte mobile money. Chaque compte a un nom, un type et un solde initial.

Chaque compte est associé à une devise. Les devises disponibles sont les Francs Congolais et les Dollars Américains.

L utilisateur peut modifier le nom d un compte ou le supprimer. On ne peut pas supprimer un compte s il contient encore des transactions.

Gestion des transactions

L utilisateur peut ajouter des transactions. Chaque transaction a un montant, une date, une description, une catégorie et un type. Le type peut être revenu ou dépense.

Quand on ajoute une transaction, le solde du compte concerné est automatiquement mis à jour.

On peut modifier ou supprimer une transaction. La modification ajuste automatiquement le solde du compte.

La liste des transactions est paginée et on peut filtrer par type et par catégorie.

Tableau de bord

Le tableau de bord affiche un résumé des finances. On y voit le solde total, les revenus du mois et les dépenses du mois.

Les statistiques sont séparées par devise. On voit donc pour chaque devise son solde, ses revenus et ses dépenses.

Un graphique montre l évolution des revenus et dépenses sur les six derniers mois.

Un autre graphique montre la répartition des dépenses par catégorie.

Les dernières transactions sont affichées dans un tableau.

Rapports

L utilisateur peut consulter des rapports détaillés. Le rapport mensuel montre les revenus et dépenses jour par jour pour un mois donné.

Le rapport annuel montre les revenus et dépenses mois par mois pour une année donnée.

On peut aussi voir les dépenses regroupées par catégorie.

Il est possible d exporter toutes les transactions au format CSV pour les ouvrir dans un tableur.

Notifications

Quand une dépense approche ou dépasse la limite du budget, une notification apparaît. Les invitations à rejoindre un ménage apparaissent aussi dans les notifications.

La cloche de notification affiche un badge avec le nombre de notifications non lues. En cliquant sur la cloche, on voit la liste des notifications et on peut les marquer comme lues.

Authentification avec Google

L utilisateur peut se connecter avec son compte Google. Au premier clic, Google demande l autorisation de partager le profil et l adresse email.

Si l utilisateur n a pas encore de compte dans l application, un compte est automatiquement créé avec les informations Google. Un ménage par défaut est également créé pour lui.

Si l utilisateur a déjà un compte avec le même email, le compte Google est lié à son compte existant.

Gestion des erreurs

L application gère plusieurs situations d erreur. Si l utilisateur saisit un mauvais email ou mot de passe, un message d erreur s affiche.

Si on essaie d ajouter une transaction sans être connecté, l application redirige vers la page de connexion.

Si on essaie de supprimer un compte qui contient des transactions, un message explique qu il faut d abord supprimer les transactions.

Les erreurs de connexion à la base de données sont affichées dans la console du serveur.

STRUCTURE DU PROJET

Le dossier backend contient tout le code serveur. Le dossier config contient la configuration de la base de données et de l authentification. Le dossier controllers contient les fonctions qui répondent aux requêtes. Le dossier models contient la définition des tables. Le dossier routes contient les adresses des API. Le dossier middleware contient les fonctions de vérification comme l authentification.

Le dossier frontend contient tout le code client. Le dossier src contient le code source React. Le dossier components contient les petits éléments réutilisables. Le dossier pages contient les grandes pages comme le tableau de bord ou les transactions. Le dossier context contient la gestion de l état global comme le ménage actif. Le dossier hooks contient des fonctions personnalisées.

Le dossier sql contient le fichier pour créer la base de données.

Le fichier .env contient les variables de configuration.

Le fichier package.json liste toutes les dépendances du projet.

ERREURS COURANTES ET SOLUTIONS

Si l application ne se lance pas, vérifiez que vous avez bien exécuté npm install dans les dossiers backend et frontend.

Si la base de données ne se connecte pas, vérifiez que MySQL est bien démarré et que les identifiants dans le fichier .env sont corrects.

Si les requêtes API retournent une erreur 401, cela signifie que vous n êtes pas connecté ou que votre token a expiré. Reconnectez vous.

Si l erreur 404 apparaît, cela signifie que l adresse demandée n existe pas. Vérifiez que le serveur backend tourne sur le port 5000.

Si les styles ne s appliquent pas, vérifiez que Tailwind CSS est bien installé. Exécutez npm install dans le dossier frontend si nécessaire.

Si l authentification Google ne fonctionne pas, vérifiez que les identifiants dans le fichier .env sont corrects et que l URI de redirection est exactement http://localhost:5000/api/auth/google/callback.

Si les invitations ne fonctionnent pas, vérifiez que la table invitations a bien été créée dans la base de données.

TECHNOLOGIES UTILISEES

Le backend utilise Node.js pour l exécution du code JavaScript côté serveur. Express est le framework qui facilite la création des routes. Sequelize est l outil qui permet de parler à la base de données MySQL sans écrire de requêtes SQL. MySQL est la base de données relationnelle.

Le frontend utilise React pour construire l interface utilisateur. Vite est l outil qui permet de démarrer rapidement le projet et de recharger les modifications en temps réel. Tailwind CSS est la bibliothèque de styles qui permet de créer des interfaces modernes sans écrire beaucoup de CSS. Chart.js est la bibliothèque qui dessine les graphiques.

Pour la sécurité, bcrypt est utilisé pour cacher les mots de passe. jsonwebtoken est utilisé pour créer des tokens d authentification. Passport est utilisé pour l authentification avec Google.

Pour les communications, axios est utilisé pour envoyer des requêtes du frontend vers le backend. react router dom est utilisé pour naviguer entre les pages.

CONTACT ET SUPPORT

Si vous rencontrez des problèmes non listés dans cette documentation, vous pouvez consulter les logs dans le terminal où tourne le serveur. Les messages d erreur vous aideront à comprendre ce qui ne va pas.

Vous pouvez aussi vérifier dans la console du navigateur en appuyant sur F12 puis en allant dans l onglet Console. Les erreurs JavaScript y apparaissent.

FIN DE LA DOCUMENTATION