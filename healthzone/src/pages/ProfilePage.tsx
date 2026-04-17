import React, { useState, useEffect } from 'react';
import '../styles/profile.css';

export const ProfilePage = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        avatar: '',
        bio: ''
    });

    const [editedUser, setEditedUser] = useState({
        username: '',
        email: '',
        bio: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    
    const [isEditingBio, setIsEditingBio] = useState(false);

    const API_BASE = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(API_BASE, { credentials: 'include' });
                const data = await response.json();
                if (data.status === 'success') {
                    setUser({
                        ...data.user,
                        bio: data.user.bio || ''
                    });
                    setEditedUser({
                        username: data.user.username,
                        email: data.user.email,
                        bio: data.user.bio || ''
                    });
                    const avatarPath = data.user.avatar
                        ? `https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/${data.user.avatar}`
                        : 'default_avatar.png';
                    setPreviewUrl(avatarPath);
                }
            } catch (err) {
                console.error("Failed to load user data", err);
            }
        };
        fetchUserData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Saving...');

        const formData = new FormData();
        if (selectedFile) formData.append('avatar', selectedFile);
        if (editedUser.username !== user.username) formData.append('username', editedUser.username);
        if (editedUser.email !== user.email) formData.append('email', editedUser.email);
        
        if (editedUser.bio !== user.bio) formData.append('bio', editedUser.bio);

        if (!selectedFile && editedUser.username === user.username && editedUser.email === user.email && editedUser.bio === user.bio) {
            setMessage('No changes made.');
            setIsEditingBio(false);
            return;
        }

        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            if (result.status === 'success') {
                setMessage(result.message);
                setUser({
                    ...user,
                    username: editedUser.username,
                    email: editedUser.email,
                    bio: editedUser.bio
                });
                setIsEditingBio(false);
                
                if (result.avatar_url) {
                    setPreviewUrl(`https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/${result.avatar_url}`);
                }
            } else {
                setMessage("Error: " + result.message);
            }
        } catch (error) {
            setMessage("Network error: Check VPN or Server connection.");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="avatar-wrapper">
                    <img src={previewUrl || 'default_avatar.png'} alt="User Avatar" className="profile-avatar" />
                    <label htmlFor="avatar-upload" className="edit-icon-label">✎</label>
                    <input id="avatar-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                </div>

                <form onSubmit={handleSave} className="profile-form">
                    <label className="profile-label">Username</label>
                    <input className="profile-input" value={editedUser.username} onChange={(e) => setEditedUser({...editedUser, username: e.target.value})} />

                    <label className="profile-label">Email</label>
                    <input className="profile-input" type="email" value={editedUser.email} onChange={(e) => setEditedUser({...editedUser, email: e.target.value})} />

                    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="profile-label" style={{ marginBottom: 0 }}>Bio</label>
                            {!isEditingBio && (
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditingBio(true)}
                                    style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    {user.bio ? 'Edit Bio' : 'Add Bio'}
                                </button>
                            )}
                        </div>

                        {isEditingBio ? (
                            <textarea 
                                className="profile-input" 
                                value={editedUser.bio} 
                                onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                                placeholder="Tell us about your fitness journey..."
                                rows={3}
                                style={{ resize: 'vertical', marginTop: '8px' }}
                            />
                        ) : (
                            <p style={{ 
                                color: user.bio ? '#1e293b' : '#64748b', 
                                fontSize: '14px', 
                                marginTop: '8px',
                                padding: '10px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px',
                                minHeight: '40px'
                            }}>
                                {user.bio || "No bio added yet."}
                            </p>
                        )}
                    </div>

                    {message && <p className="status-message">{message}</p>}

                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="home-btn" onClick={() => window.location.hash = '/dashboard'}>Home</button>
                </form>
            </div>
        </div>
    );
};