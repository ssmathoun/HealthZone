import React, { useState, useEffect } from 'react';
import '../styles/profile.css';

export const ProfilePage = () => {
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

    const API_BASE = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // No user_id in the URL; server uses session cookie
                const response = await fetch(API_BASE, { credentials: 'include' });
                const data = await response.json();
                if (data.status === 'success') {
                    setUser(data.user);
                    setEditedUser({
                        username: data.user.username,
                        email: data.user.email
                    });
                    setPreviewUrl(`https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/${data.user.avatar}`);
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

                    {message && <p className="status-message">{message}</p>}

                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="home-btn" onClick={() => window.location.hash = '/dashboard'}>Home</button>
                </form>
            </div>
        </div>
    );
};