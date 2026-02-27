import React, { useState, useEffect } from 'react';
import '../styles/profile.css';

export const ProfilePage = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        avatar: ''
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
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

        if ((passwords.newPassword || passwords.confirmNewPassword) && !passwords.oldPassword) {
            setMessage("Error: Current password is required to set a new one.");
            return;
        }

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setMessage("Error: New passwords do not match.");
            return;
        }

        const formData = new FormData();
        if (selectedFile) formData.append('avatar', selectedFile);
        if (passwords.oldPassword) formData.append('oldPassword', passwords.oldPassword);
        if (passwords.newPassword) formData.append('newPassword', passwords.newPassword);
        if (passwords.confirmNewPassword) formData.append('confirmNewPassword', passwords.confirmNewPassword);

        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                body: formData,
                credentials: 'include' 
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                setMessage(result.message);
                setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
                
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
                    <input className="profile-input profile-input-readonly" value={user.username} readOnly />

                    <label className="profile-label">Email</label>
                    <input className="profile-input profile-input-readonly" value={user.email} readOnly />

                    <label className="profile-label">Current Password</label>
                    <input type="password" className="profile-input" value={passwords.oldPassword} 
                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} placeholder="••••••••" />

                    <label className="profile-label">New Password</label>
                    <input type="password" className="profile-input" value={passwords.newPassword} 
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} placeholder="••••••••" />

                    <label className="profile-label">Confirm New Password</label>
                    <input type="password" className="profile-input" value={passwords.confirmNewPassword} 
                        onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})} placeholder="••••••••" />

                    {message && <p className="status-message">{message}</p>}

                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="home-btn" onClick={() => window.location.href='/home'}>Home</button>
                </form>
            </div>
        </div>
    );
};