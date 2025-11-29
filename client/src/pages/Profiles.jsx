import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSelector from '../components/ProfileSelector';

const Profiles = () => {
  const { selectProfile } = useAuth();
  const navigate = useNavigate();

  const handleSelectProfile = async (profile) => {
    await selectProfile(profile.id);
    navigate('/');
  };

  return <ProfileSelector onSelect={handleSelectProfile} />;
};

export default Profiles;

