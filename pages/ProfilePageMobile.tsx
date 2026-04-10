import React, { useState, useEffect, useRef } from 'react';
import '../styles/profile.css';

export const ProfilePageMobile = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        avatar: ''
    });

    const [editedUser, setEditedUser] = useState({
        username: '',
        email: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(API_BASE, { credentials: 'include' });
                const data = await response.json();
                if (data.status === 'success') {
                    setUser(data.user);
                    setEditedUser({
                        username: data.user.username,
                        email: data.user.email
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

        // Check if there are any changes
        if (!selectedFile && editedUser.username === user.username && editedUser.email === user.email) {
            setMessage('No changes made.');
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
                    email: editedUser.email
                });
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
