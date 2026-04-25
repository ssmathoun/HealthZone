import React, { useState, useEffect, useRef } from 'react';
import '../styles/profile.css';

export const ProfilePageMobile = () => {
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
    
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
            setMessage("Network error. Check VPN or Server connection.");
        }
    };

    return (
        <div className="mobile-profile-container">
            <header className="mobile-header">
                <button className="back-btn" onClick={() => window.location.hash = '/dashboard'}>←</button>
                <h1>Edit Profile</h1>
                <div style={{width: '40px'}}></div>
            </header>

            <div className="mobile-avatar-section">
                <div className="avatar-wrapper" onClick={triggerFileInput}>
                    <img 
                        src={previewUrl || 'default_avatar.png'} 
                        alt="Avatar" 
                        className="profile-avatar" 
                    />
                    <div className="edit-overlay">
                        <span>Change Photo</span>
                    </div>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        onChange={handleFileChange} 
                        className="hidden-file-input"
                        accept="image/*" 
                    />
                </div>
                <h2 className="display-name">{user.username}</h2>
            </div>

            <form onSubmit={handleSave} className="mobile-form">
                <section className="form-group">
                    <label>Username</label>
                    <input value={editedUser.username} onChange={(e) => setEditedUser({...editedUser, username: e.target.value})} />
                </section>

                <section className="form-group">
                    <label>Email</label>
                    <input type="email" value={editedUser.email} onChange={(e) => setEditedUser({...editedUser, email: e.target.value})} />
                </section>

                <section className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ marginBottom: 0 }}>Bio</label>
                        {!isEditingBio && (
                            <button 
                                type="button" 
                                onClick={() => setIsEditingBio(true)}
                                style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                            >
                                {user.bio ? 'Edit Bio' : 'Add Bio'}
                            </button>
                        )}
                    </div>

                    {isEditingBio ? (
                        <textarea 
                            value={editedUser.bio} 
                            onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                            placeholder="Tell us about your fitness journey..."
                            rows={3}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0',
                                resize: 'vertical',
                                fontSize: '14px'
                            }}
                        />
                    ) : (
                        <p style={{ 
                            color: user.bio ? '#1e293b' : '#64748b', 
                            fontSize: '14px', 
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            minHeight: '45px',
                            border: '1px solid transparent'
                        }}>
                            {user.bio || "No bio added yet."}
                        </p>
                    )}
                </section>

                {message && (
                    <p className={`status-msg ${message.includes('Error') ? 'err' : 'ok'}`}>
                        {message}
                    </p>
                )}

                <button type="submit" className="mobile-save-btn">Save Changes</button>
                <button 
                    type="button" 
                    className="mobile-home-btn" 
                    onClick={() => window.location.hash = '/dashboard'}
                >
                    Home
                </button>
            </form>
        </div>
    );
};