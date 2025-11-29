import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfileSelector = ({ onSelect }) => {
  const { profiles, createProfile } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF0000');

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#808080'
  ];

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      try {
        const newProfile = await createProfile(newProfileName, selectedColor);
        setNewProfileName('');
        setShowCreateForm(false);
        onSelect(newProfile);
      } catch (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create profile. Maximum 5 profiles allowed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-flix-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl font-semibold text-white text-center mb-12">
          Who's watching?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="flex flex-col items-center group"
            >
              <div
                className="w-32 h-32 rounded-lg flex items-center justify-center text-white text-4xl font-bold mb-3 group-hover:ring-4 group-hover:ring-white transition-all"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors">
                {profile.name}
              </span>
            </button>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex flex-col items-center group"
            >
              <div className="w-32 h-32 rounded-lg border-2 border-gray-600 flex items-center justify-center text-gray-600 text-5xl mb-3 group-hover:border-white group-hover:text-white transition-all">
                +
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors">
                Add Profile
              </span>
            </button>
          )}
        </div>

        {/* Create Profile Form */}
        {showCreateForm && (
          <div className="bg-flix-gray rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Create Profile
            </h2>
            <form onSubmit={handleCreateProfile}>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Profile Name"
                className="input-field mb-4"
                maxLength={20}
                required
              />

              <div className="mb-4">
                <label className="block text-white text-sm mb-2">
                  Choose Avatar Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded ${
                        selectedColor === color ? 'ring-4 ring-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProfileName('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;

