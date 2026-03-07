import React, { useState, useEffect, useRef } from 'react';
import '../styles/profile.css';

export const ProfilePageMobile = () => {
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
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(API_BASE, { credentials: 'include' });
                const data = await response.json();
                if (data.status === 'success') {
                    setUser(data.user);
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

        // 1. Check if current password is provided when attempting to change password
        if ((passwords.newPassword || passwords.confirmNewPassword) && !passwords.oldPassword) {
            setMessage("Error: Current password required to set a new one.");
            return;
        }

        // 2. Strict Frontend Validation (Trimming to avoid mobile keyboard space issues)
        if (passwords.newPassword.trim() !== passwords.confirmNewPassword.trim()) {
            setMessage("Error: New passwords do not match.");
            return;
        }

        const formData = new FormData();
        if (selectedFile) formData.append('avatar', selectedFile);
        if (passwords.oldPassword) formData.append('oldPassword', passwords.oldPassword);
        if (passwords.newPassword) formData.append('newPassword', passwords.newPassword);
        // 3. Append confirmNewPassword so the PHP backend can also verify
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
                // Clear password fields on success
                setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
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
                    <input className="input-locked" value={user.username} readOnly />
                </section>

                <section className="form-group">
                    <label>Email</label>
                    <input className="input-locked" value={user.email} readOnly />
                </section>

                <hr />

                <section className="form-group">
                    <label>Current Password</label>
                    <input 
                        type="password" 
                        value={passwords.oldPassword} 
                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                        placeholder="••••••••" 
                    />
                </section>

                <section className="form-group">
                    <label>New Password</label>
                    <input 
                        type="password" 
                        value={passwords.newPassword} 
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                        placeholder="••••••••" 
                    />
                </section>

                <section className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                        type="password" 
                        value={passwords.confirmNewPassword} 
                        onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})} 
                        placeholder="••••••••" 
                    />
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