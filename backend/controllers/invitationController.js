const {
  Utilisateur,
  Menage,
  MembresMenage,
  Invitation,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { getUserFromToken } = require("../utils/auth");
const crypto = require("crypto");

// Générer un token unique
const genererToken = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(77).toString("hex");
  const token = timestamp + random;
  return token.substring(0, 190);
};

// Envoyer une invitation
const envoyerInvitation = async (req, res) => {
  try {
    const { email, id_menage, role } = req.body;
    const user = await getUserFromToken(req);

    // Vérifier que l'utilisateur est admin du ménage
    const estAdmin = await MembresMenage.findOne({
      where: { id_utilisateur: user.id_utilisateur, id_menage, role: "admin" },
    });

    if (!estAdmin) {
      return res
        .status(403)
        .json({ message: "Seul un admin peut inviter des membres" });
    }

    // Vérifier si l'utilisateur existe
    const invite = await Utilisateur.findOne({ where: { email } });

    if (!invite) {
      return res
        .status(404)
        .json({ message: "Aucun compte associé à cet email" });
    }

    // Vérifier s'il est déjà membre
    const dejaMembre = await MembresMenage.findOne({
      where: { id_utilisateur: invite.id_utilisateur, id_menage },
    });

    if (dejaMembre) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur est déjà membre du ménage" });
    }

    const token = genererToken();

    const invitation = await Invitation.create({
      id_menage,
      email_invite: email,
      id_expediteur: user.id_utilisateur,
      token: token,
      role: role || "member",
      statut: "en_attente",
      date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({ success: true, message: "Invitation envoyée", invitation });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Vérifier une invitation (route publique)
const verifierInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({
      where: { token, statut: "en_attente" },
      include: [{ model: Menage, as: "menage" }],
    });

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "Invitation invalide ou déjà traitée" });
    }

    if (invitation.date_expiration < new Date()) {
      await invitation.update({ statut: "expiree" });
      return res
        .status(400)
        .json({ message: "Cette invitation a expiré", expired: true });
    }

    let user = null;
    try {
      user = await getUserFromToken(req);
    } catch (e) {}

    if (!user) {
      return res.status(401).json({
        message: "Veuillez vous connecter pour accepter l'invitation",
        requireLogin: true,
        invitationToken: token,
      });
    }

    const dejaMembre = await MembresMenage.findOne({
      where: {
        id_utilisateur: user.id_utilisateur,
        id_menage: invitation.id_menage,
      },
    });

    if (dejaMembre) {
      return res.status(400).json({
        message: "Vous êtes déjà membre de ce ménage",
        alreadyMember: true,
        menage: invitation.menage,
      });
    }

    if (invitation.email_invite !== user.email) {
      return res
        .status(403)
        .json({ message: "Cette invitation ne vous est pas destinée" });
    }

    await MembresMenage.create({
      id_utilisateur: user.id_utilisateur,
      id_menage: invitation.id_menage,
      role: invitation.role,
      date_adhesion: new Date(),
    });

    await invitation.update({ statut: "acceptee" });

    res.json({
      success: true,
      message: `Vous avez rejoint le ménage "${invitation.menage.nom_menage}"`,
      menage: invitation.menage,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les invitations reçues par l'utilisateur connecté
const getMesInvitations = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    const invitations = await Invitation.findAll({
      where: { email_invite: user.email, statut: "en_attente" },
      include: [
        {
          model: Menage,
          as: "menage",
          attributes: ["id_menage", "nom_menage"],
        },
        {
          model: Utilisateur,
          as: "expediteur",
          attributes: ["id_utilisateur", "nom", "email", "avatar"],
        },
      ],
      order: [["date_creation", "DESC"]],
    });

    res.json(invitations);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: error.message });
  }
};

// Accepter une invitation par ID (depuis les notifications)
const accepterInvitationParId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req);

    const invitation = await Invitation.findOne({
      where: {
        id_invitation: id,
        email_invite: user.email,
        statut: "en_attente",
      },
      include: [{ model: Menage, as: "menage" }],
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation non trouvée" });
    }

    if (invitation.date_expiration < new Date()) {
      await invitation.update({ statut: "expiree" });
      return res.status(400).json({ message: "Cette invitation a expiré" });
    }

    await MembresMenage.create({
      id_utilisateur: user.id_utilisateur,
      id_menage: invitation.id_menage,
      role: invitation.role,
      date_adhesion: new Date(),
    });

    await invitation.update({ statut: "acceptee" });

    res.json({
      success: true,
      message: `Vous avez rejoint le ménage "${invitation.menage.nom_menage}"`,
      menage: invitation.menage,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: error.message });
  }
};

// Accepter une invitation
const accepterInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await getUserFromToken(req);

    const invitation = await Invitation.findOne({
      where: { token, statut: "en_attente" },
    });

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "Invitation invalide ou expirée" });
    }

    if (invitation.date_expiration < new Date()) {
      await invitation.update({ statut: "expiree" });
      return res.status(400).json({ message: "Invitation expirée" });
    }

    if (invitation.email_invite !== user.email) {
      return res
        .status(403)
        .json({ message: "Cette invitation ne vous est pas destinée" });
    }

    // Ajouter l'utilisateur au ménage
    await MembresMenage.create({
      id_utilisateur: user.id_utilisateur,
      id_menage: invitation.id_menage,
      role: invitation.role,
    });

    await invitation.update({ statut: "acceptee" });

    res.json({ success: true, message: "Vous avez rejoint le ménage" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refuser une invitation
const refuserInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req);

    const invitation = await Invitation.findOne({
      where: {
        id_invitation: id,
        email_invite: user.email,
        statut: "en_attente",
      },
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation non trouvée" });
    }

    await invitation.update({ statut: "annulee" });

    res.json({ success: true, message: "Invitation refusée" });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  envoyerInvitation,
  accepterInvitation,
  verifierInvitation,
  getMesInvitations,
  accepterInvitationParId,
  refuserInvitation,
};
