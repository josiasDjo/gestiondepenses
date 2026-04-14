// pages/Menage.jsx - Section invitations
const InvitationModal = ({ menageId, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);
    
    const handleInvite = async () => {
        setLoading(true);
        try {
        await api.post('/invitations', {
            email,
            id_menage: menageId,
            role
        });
        toast.success(`Invitation envoyée à ${email}`);
        onClose();
        } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur');
        } finally {
        setLoading(false);
        }
    };
    
    return (
        <div className="modal">
        <h3>Inviter un membre</h3>
        <input
            type="email"
            placeholder="Email du membre"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Membre</option>
            <option value="admin">Administrateur</option>
        </select>
        <button onClick={handleInvite} disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
        </button>
        </div>
    );
};