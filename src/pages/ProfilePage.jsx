import React, { useState, useEffect } from 'react';
import '../profile.css';

const ProfilePage = ({ userId }) => {
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

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState('');

    // Fetch user details on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://aptitude.cse.buffalo.edu/profile.php?user_id=${userId}`);
                const data = await response.json();
                if (data.status === 'success') {
                    setUser(data.user);
                    // Ensure full URL for the avatar image
                    setPreviewUrl(`http://aptitude.cse.buffalo.edu/${data.user.avatar}`);
                }
            } catch (err) {
                console.error("Failed to load user data", err);
            }
        };
        fetchUserData();
    }, [userId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setMessage("Error: New passwords do not match.");
            return;
        }

        const formData = new FormData();
        formData.append('user_id', userId);
        if (selectedFile) formData.append('avatar', selectedFile);
        formData.append('oldPassword', passwords.oldPassword);
        formData.append('newPassword', passwords.newPassword);

        try {
            const response = await fetch('http://aptitude.cse.buffalo.edu/profile.php', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            setMessage(result.message);
            
            // Clear password fields on success
            if (result.status === 'success') {
                setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            }
        } catch (error) {
            setMessage("Server error. Could not save changes.");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                {/* Avatar Section */}
                <div className="avatar-wrapper">
                    <img src={previewUrl || 'default_avatar.png'} alt="User Avatar" className="profile-avatar" />
                    <label htmlFor="avatar-upload" className="edit-icon-label">
                        ✎
                    </label>
                    <input 
                        id="avatar-upload" 
                        type="file" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                </div>

                <form onSubmit={handleSave} className="profile-form">
                    <label className="profile-label">Username</label>
                    <input className="profile-input profile-input-readonly" value={user.username} readOnly />

                    <label className="profile-label">Email</label>
                    <input className="profile-input profile-input-readonly" value={user.email} readOnly />

                    <label className="profile-label">Current Password</label>
                    <input 
                        type="password" 
                        className="profile-input" 
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                        placeholder="••••••••"
                    />

                    <label className="profile-label">New Password</label>
                    <input 
                        type="password" 
                        className="profile-input" 
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                        placeholder="••••••••"
                    />

                    <label className="profile-label">Confirm New Password</label>
                    <input 
                        type="password" 
                        className="profile-input" 
                        value={passwords.confirmNewPassword}
                        onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})} 
                        placeholder="••••••••"
                    />

                    {message && <p className="status-message">{message}</p>}

                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="home-btn" onClick={() => window.location.href='/home'}>Home</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;