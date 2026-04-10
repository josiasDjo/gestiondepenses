-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Client :  127.0.0.1
-- Généré le :  Ven 10 Avril 2026 à 22:36
-- Version du serveur :  5.6.17
-- Version de PHP :  5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données :  `gestion_financiere`
--

-- --------------------------------------------------------

--
-- Structure de la table `alertes`
--

CREATE TABLE IF NOT EXISTS `alertes` (
  `id_alerte` int(11) NOT NULL AUTO_INCREMENT,
  `message` text,
  `date_alerte` datetime DEFAULT CURRENT_TIMESTAMP,
  `statut` varchar(20) DEFAULT NULL,
  `id_budget` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_alerte`),
  KEY `id_budget` (`id_budget`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `budgets`
--

CREATE TABLE IF NOT EXISTS `budgets` (
  `id_budget` int(11) NOT NULL AUTO_INCREMENT,
  `categorie` varchar(100) DEFAULT NULL,
  `limite_montant` decimal(15,2) DEFAULT NULL,
  `periode` varchar(50) DEFAULT NULL,
  `id_menage` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_budget`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `comptes`
--

CREATE TABLE IF NOT EXISTS `comptes` (
  `id_compte` int(11) NOT NULL AUTO_INCREMENT,
  `nom_compte` varchar(50) DEFAULT NULL,
  `type_compte` varchar(50) DEFAULT NULL,
  `solde` decimal(15,2) DEFAULT '0.00',
  `id_devise` int(11) DEFAULT NULL,
  `id_menage` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_compte`),
  KEY `id_devise` (`id_devise`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `devises`
--

CREATE TABLE IF NOT EXISTS `devises` (
  `id_devise` int(11) NOT NULL AUTO_INCREMENT,
  `code_devise` varchar(5) NOT NULL,
  `nom_devise` varchar(50) DEFAULT NULL,
  `taux_exchange` decimal(15,4) DEFAULT NULL,
  PRIMARY KEY (`id_devise`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `membres_menage`
--

CREATE TABLE IF NOT EXISTS `membres_menage` (
  `id_utilisateur` int(11) NOT NULL DEFAULT '0',
  `id_menage` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_utilisateur`,`id_menage`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `menages`
--

CREATE TABLE IF NOT EXISTS `menages` (
  `id_menage` int(11) NOT NULL AUTO_INCREMENT,
  `nom_menage` varchar(100) NOT NULL,
  `id_devise_principale` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_menage`),
  KEY `id_devise_principale` (`id_devise_principale`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `patrimoine`
--

CREATE TABLE IF NOT EXISTS `patrimoine` (
  `id_patrimoine` int(11) NOT NULL AUTO_INCREMENT,
  `type_engagement` enum('Dette','Creance') NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `tiers` varchar(100) DEFAULT NULL,
  `id_menage` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_patrimoine`),
  KEY `id_menage` (`id_menage`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

CREATE TABLE IF NOT EXISTS `transactions` (
  `id_transaction` int(11) NOT NULL AUTO_INCREMENT,
  `montant` decimal(15,2) NOT NULL,
  `date_transaction` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  `type_flux` enum('Revenu','Depense') NOT NULL,
  `type_depense` enum('Fixe','Variable') DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_transaction`),
  KEY `id_compte` (`id_compte`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Contraintes pour les tables exportées
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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
