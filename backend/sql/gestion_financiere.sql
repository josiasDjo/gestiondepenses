-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 15 avr. 2026 à 13:34
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_financiere`
--

-- --------------------------------------------------------

--
-- Structure de la table `alertes`
--

DROP TABLE IF EXISTS `alertes`;
CREATE TABLE IF NOT EXISTS `alertes` (
  `id_alerte` int NOT NULL AUTO_INCREMENT,
  `message` text,
  `date_alerte` datetime DEFAULT CURRENT_TIMESTAMP,
  `statut` varchar(20) DEFAULT NULL,
  `id_budget` int DEFAULT NULL,
  PRIMARY KEY (`id_alerte`),
  KEY `id_budget` (`id_budget`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
CREATE TABLE IF NOT EXISTS `budgets` (
  `id_budget` int NOT NULL AUTO_INCREMENT,
  `categorie` varchar(100) DEFAULT NULL,
  `limite_montant` decimal(15,2) DEFAULT NULL,
  `periode` varchar(50) DEFAULT NULL,
  `id_menage` int DEFAULT NULL,
  PRIMARY KEY (`id_budget`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `comptes`
--

DROP TABLE IF EXISTS `comptes`;
CREATE TABLE IF NOT EXISTS `comptes` (
  `id_compte` int NOT NULL AUTO_INCREMENT,
  `nom_compte` varchar(50) DEFAULT NULL,
  `type_compte` varchar(50) DEFAULT NULL,
  `solde` decimal(15,2) DEFAULT '0.00',
  `id_devise` int DEFAULT NULL,
  `id_menage` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_compte`),
  KEY `id_devise` (`id_devise`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comptes`
--

INSERT INTO `comptes` (`id_compte`, `nom_compte`, `type_compte`, `solde`, `id_devise`, `id_menage`, `created_at`) VALUES
(1, 'Compte Courant', 'MOBILE_MONEY', 90000.00, 1, 12, '2026-04-13 19:17:48'),
(2, 'Compte Courant Dollars', '2', 150.00, 2, 12, '2026-04-13 19:30:40');

-- --------------------------------------------------------

--
-- Structure de la table `devises`
--

DROP TABLE IF EXISTS `devises`;
CREATE TABLE IF NOT EXISTS `devises` (
  `id_devise` int NOT NULL AUTO_INCREMENT,
  `code_devise` varchar(5) NOT NULL,
  `nom_devise` varchar(50) DEFAULT NULL,
  `taux_exchange` decimal(15,4) DEFAULT NULL,
  PRIMARY KEY (`id_devise`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `devises`
--

INSERT INTO `devises` (`id_devise`, `code_devise`, `nom_devise`, `taux_exchange`) VALUES
(1, 'FC', 'Francs Congolais', NULL),
(2, 'USD', 'Dollars Américains', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `invitations`
--

DROP TABLE IF EXISTS `invitations`;
CREATE TABLE IF NOT EXISTS `invitations` (
  `id_invitation` int NOT NULL AUTO_INCREMENT,
  `id_menage` int NOT NULL,
  `email_invite` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_expediteur` int NOT NULL,
  `token` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','member') COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `statut` enum('en_attente','acceptee','expiree') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_expiration` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_invitation`),
  UNIQUE KEY `token` (`token`),
  KEY `id_menage` (`id_menage`),
  KEY `id_expediteur` (`id_expediteur`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `invitations`
--

INSERT INTO `invitations` (`id_invitation`, `id_menage`, `email_invite`, `id_expediteur`, `token`, `role`, `statut`, `date_creation`, `date_modification`, `date_expiration`, `createdAt`, `updatedAt`) VALUES
(1, 12, 'enfant1@gmail.com', 14, 'mnz0j3ml7f1e255038fe31628ca660164c9d34dca7bc470248e56cb4e03398650da8b0aa8a8056fa96d485a2d2977948b844a9da256c5feaf3d493dfbe138a2c1cf165c839a7dbfa41659cb617cc652efb', 'member', 'acceptee', '2026-04-14 19:26:51', '2026-04-15 04:45:44', '2026-04-21 19:26:51', '2026-04-14 19:26:51', '2026-04-15 04:45:44');

-- --------------------------------------------------------

--
-- Structure de la table `membres_menage`
--

DROP TABLE IF EXISTS `membres_menage`;
CREATE TABLE IF NOT EXISTS `membres_menage` (
  `id_utilisateur` int NOT NULL DEFAULT '0',
  `id_menage` int NOT NULL DEFAULT '0',
  `role` varchar(200) NOT NULL,
  `date_adhesion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_utilisateur`,`id_menage`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `membres_menage`
--

INSERT INTO `membres_menage` (`id_utilisateur`, `id_menage`, `role`, `date_adhesion`, `created_at`, `updated_at`) VALUES
(10, 8, 'admin', '2026-04-13 06:26:42', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(11, 9, 'admin', '2026-04-13 12:12:56', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(12, 10, 'admin', '2026-04-13 12:22:15', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(13, 11, 'admin', '2026-04-13 12:28:56', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(14, 12, 'admin', '2026-04-13 12:49:44', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(15, 12, 'member', '2026-04-15 04:45:44', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(15, 13, 'admin', '2026-04-14 15:39:59', '2026-04-15 06:14:58', '2026-04-15 06:14:58'),
(18, 16, 'admin', '2026-04-15 06:33:05', '2026-04-15 06:33:05', '2026-04-15 06:33:05');

-- --------------------------------------------------------

--
-- Structure de la table `menages`
--

DROP TABLE IF EXISTS `menages`;
CREATE TABLE IF NOT EXISTS `menages` (
  `id_menage` int NOT NULL AUTO_INCREMENT,
  `nom_menage` varchar(100) NOT NULL,
  `id_devise_principale` int DEFAULT NULL,
  PRIMARY KEY (`id_menage`),
  KEY `id_devise_principale` (`id_devise_principale`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `menages`
--

INSERT INTO `menages` (`id_menage`, `nom_menage`, `id_devise_principale`) VALUES
(1, 'Ménage de besodia kabambi', NULL),
(2, 'Ménage de test', NULL),
(3, 'Ménage de test2', NULL),
(4, 'Ménage de test3', NULL),
(5, 'Ménage de test4', NULL),
(6, 'Ménage de test5', NULL),
(7, 'Ménage de test6', NULL),
(8, 'Ménage de test7', NULL),
(9, 'Ménage de test8', NULL),
(10, 'Ménage de test9', NULL),
(11, 'Ménage de test10', NULL),
(12, 'Ménage de test11', NULL),
(13, 'Ménage de enfant1', NULL),
(14, 'Ménage de paid read', NULL),
(15, 'Ménage de paid read', NULL),
(16, 'Ménage de paid read', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `patrimoine`
--

DROP TABLE IF EXISTS `patrimoine`;
CREATE TABLE IF NOT EXISTS `patrimoine` (
  `id_patrimoine` int NOT NULL AUTO_INCREMENT,
  `type_engagement` enum('Dette','Creance') NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `tiers` varchar(100) DEFAULT NULL,
  `id_menage` int DEFAULT NULL,
  PRIMARY KEY (`id_patrimoine`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id_transaction` int NOT NULL AUTO_INCREMENT,
  `montant` decimal(15,2) NOT NULL,
  `date_transaction` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  `type_flux` enum('Revenu','Depense') NOT NULL,
  `type_depense` enum('Fixe','Variable') DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `id_compte` int DEFAULT NULL,
  PRIMARY KEY (`id_transaction`),
  KEY `id_compte` (`id_compte`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `transactions`
--

INSERT INTO `transactions` (`id_transaction`, `montant`, `date_transaction`, `description`, `type_flux`, `type_depense`, `categorie`, `id_compte`) VALUES
(1, 20.00, '2026-04-14 00:00:00', '', 'Depense', NULL, 'Alimentation', 2),
(2, 50.00, '2026-04-14 00:00:00', '', 'Revenu', NULL, 'Revenue', 2),
(3, 10000.00, '2026-04-14 00:00:00', '', 'Depense', NULL, 'Transport', 1),
(4, 30.00, '2026-04-15 00:00:00', '', 'Revenu', NULL, 'Revenu', 2),
(5, 10.00, '2026-04-15 00:00:00', '', 'Depense', NULL, 'Loisir', 2);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `google_id` text,
  `avatar` text,
  `provider` text NOT NULL,
  `email_verifie` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `nom`, `email`, `mot_de_passe`, `google_id`, `avatar`, `provider`, `email_verifie`, `created_at`, `updated_at`) VALUES
(1, 'besodia kabambi', 'djo@gmail.com', '$2a$10$TYBpSovy29nOeQVn1V67LOdGK6BFOZYDXl3qtw.LPvwbHk99wVeqC', NULL, NULL, 'local', 0, '2026-04-12 20:21:10', '2026-04-12 20:21:10'),
(2, 'besodia kabambi', 'djodev@gmail.com', '$2a$10$U.txetR3pUn9XwOrVXMHoelrXiASHlJ1odnGOIM/ulJ/klla0JW/W', NULL, NULL, 'local', 0, '2026-04-12 20:26:23', '2026-04-12 20:26:23'),
(3, 'besodia kabambi', 'djo23@gmail.com', '$2a$10$8lwrCzLGK3jUhtd8XMVmlOQNB4FOumR70is3sDjhYdB8UV29edm6S', NULL, NULL, 'local', 0, '2026-04-13 05:39:17', '2026-04-13 05:39:17'),
(4, 'test', 'test1@gmail.com', '$2a$10$WVEajbjrUwyp4R0TngrIOeBeeAbmgpf3I7XwFZnByx7/6H0v1B9OS', NULL, NULL, 'local', 0, '2026-04-13 05:51:08', '2026-04-13 05:51:08'),
(5, 'test2', 'test2@gmail.com', '$2a$10$FPZtMXByGa.FPmmx0DWZIO7U7Yh43BR9xcE/GDJgZUk8eYjDXuTEO', NULL, NULL, 'local', 0, '2026-04-13 05:53:01', '2026-04-13 05:53:01'),
(6, 'test3', 'test3@gmail.com', '$2a$10$YHdQDQdrXdHbX73Esyxca.8JsdVyk2m8a/7RKxrY4BkvHQ3CuGcYi', NULL, NULL, 'local', 0, '2026-04-13 06:17:08', '2026-04-13 06:17:08'),
(7, 'test4', 'test4@gmail.com', '$2a$10$pl0HUBEHND2wxf67llU0yuq/jy5glUSQX89jlWqo.gxMNRo/tQ91G', NULL, NULL, 'local', 0, '2026-04-13 06:21:31', '2026-04-13 06:21:31'),
(8, 'test5', 'test5@gmail.com', '$2a$10$GIqEumi5cBsXzIY8veqQX.3ol5Wkcvs60xViz5VGPQ3VqTNDMPhEG', NULL, NULL, 'local', 0, '2026-04-13 06:24:30', '2026-04-13 06:24:30'),
(9, 'test6', 'test6@gmail.com', '$2a$10$gSmEItCICxtXhhf/y8c/aePXUI4KF1nTp2ORZFJD261HIOJlnS.Ny', NULL, NULL, 'local', 0, '2026-04-13 06:25:26', '2026-04-13 06:25:26'),
(10, 'test7', 'test7@gmail.com', '$2a$10$Lnq/Gz6YiV2HLCt4DVbtA.kDv4eZm1/KBwFakGHmfPMoDuVo0sk9S', NULL, NULL, 'local', 0, '2026-04-13 06:26:42', '2026-04-13 06:26:42'),
(11, 'test8', 'test8@gmail.com', '$2a$10$ckyZIdpUb3zfrf0uj0eST.c08ZiMqnrlulz04BXQA8HqXU49ItONq', NULL, NULL, 'local', 0, '2026-04-13 12:12:56', '2026-04-13 12:12:56'),
(12, 'test9', 'test9@gmail.com', '$2a$10$vsLuWO/rxc4YEI11BmMNq.S07Ei8f2gFJiFIkp5naN1eBBxDyPkMm', NULL, NULL, 'local', 0, '2026-04-13 12:22:15', '2026-04-13 12:22:15'),
(13, 'test10', 'test10@gmail.com', '123456', NULL, NULL, 'local', 0, '2026-04-13 12:28:56', '2026-04-13 12:28:56'),
(14, 'test11', 'test11@gmail.com', '$2a$10$8y.pI9Zz4ehDSGf8Qos0teNYs3K.UyKcxXsQ8OfB1Sf9q3BTUvXCm', NULL, NULL, 'local', 0, '2026-04-13 12:49:43', '2026-04-13 12:49:43'),
(15, 'enfant1', 'enfant1@gmail.com', '$2a$10$BIRmnRFYsiX7wdcwAbyPFO.m1VrKLWmHn6uSlw7R6t4XVJTedZSdm', NULL, NULL, 'local', 0, '2026-04-14 15:39:59', '2026-04-14 15:39:59'),
(18, 'paid read', 'readpaid205@gmail.com', NULL, '107146376685910178949', 'https://lh3.googleusercontent.com/a/ACg8ocL7N0Qt39cP6C9uEVbmzoI2Angt3FNjphrH4UVqIKRtzQAKuw=s96-c', 'google', 1, '2026-04-15 06:33:05', '2026-04-15 06:33:05');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `alertes`
--
ALTER TABLE `alertes`
  ADD CONSTRAINT `alertes_ibfk_1` FOREIGN KEY (`id_budget`) REFERENCES `budgets` (`id_budget`);

--
-- Contraintes pour la table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`id_menage`) REFERENCES `menages` (`id_menage`);

--
-- Contraintes pour la table `comptes`
--
ALTER TABLE `comptes`
  ADD CONSTRAINT `comptes_ibfk_1` FOREIGN KEY (`id_devise`) REFERENCES `devises` (`id_devise`),
  ADD CONSTRAINT `comptes_ibfk_2` FOREIGN KEY (`id_menage`) REFERENCES `menages` (`id_menage`);

--
-- Contraintes pour la table `membres_menage`
--
ALTER TABLE `membres_menage`
  ADD CONSTRAINT `membres_menage_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`),
  ADD CONSTRAINT `membres_menage_ibfk_2` FOREIGN KEY (`id_menage`) REFERENCES `menages` (`id_menage`);

--
-- Contraintes pour la table `menages`
--
ALTER TABLE `menages`
  ADD CONSTRAINT `menages_ibfk_1` FOREIGN KEY (`id_devise_principale`) REFERENCES `devises` (`id_devise`);

--
-- Contraintes pour la table `patrimoine`
--
ALTER TABLE `patrimoine`
  ADD CONSTRAINT `patrimoine_ibfk_1` FOREIGN KEY (`id_menage`) REFERENCES `menages` (`id_menage`);

--
-- Contraintes pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`id_compte`) REFERENCES `comptes` (`id_compte`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
