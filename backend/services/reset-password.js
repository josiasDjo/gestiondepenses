const bcrypt = require('bcryptjs');
const { Utilisateur } = require('./models');
const sequelize = require('./config/database');

const resetPassword = async () => {
    try {
        // await sequelize.authenticate();
        // console.log('✅ Connexion DB réussie');
        
        const email = 'djo@gmail.com';
        const newPassword = '123456'; // Mettez le mot de passe désiré
        
        const user = await Utilisateur.findOne({ where: { email } });
        
        if (!user) {
        console.log('❌ Utilisateur non trouvé');
        return;
        }
        
        // Hacher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        console.log('Ancien hash:', user.mot_de_passe);
        console.log('Nouveau hash:', hashedPassword);
        
        // Mettre à jour
        user.mot_de_passe = hashedPassword;
        await user.save();
        
        // Vérifier
        const test = await bcrypt.compare(newPassword, user.mot_de_passe);
        console.log('Test après mise à jour:', test ? '✅ OK' : '❌ ÉCHEC');
        
        if (test) {
        console.log(`✅ Mot de passe réinitialisé pour ${email}`);
        console.log(`Nouveau mot de passe: ${newPassword}`);
        }
        
        await sequelize.close();
    } catch (error) {
        console.error('Erreur:', error);
    }
};

resetPassword();