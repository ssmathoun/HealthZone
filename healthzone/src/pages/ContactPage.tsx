import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, MessageSquare } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

export function ContactPage() {
  const navigate = useNavigate();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  
  // Status State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    setError('');
    setSuccess('');

    if (!name.trim() && !email.trim() && !phone.trim() && !reason.trim()) {
      setError("Cannot submit empty form");
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim() || !reason.trim()) {
      setError("All fields are required");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError("Invalid phone number");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/contact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          phone: phone.trim(), 
          reason: reason.trim() 
        })
      });
      
      const data = await res.json();

      if (data.status === 'success') {
        setSuccess("Contact form submitted successfully");
        setName('');
        setEmail('');
        setPhone('');
        setReason('');
      } else {
        setError(data.message || "An error occurred during submission.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation Bar */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg hover:opacity-80 transition-opacity">
            <span className="text-[#d97706]">Health</span><span className="text-white">Zone</span>
          </button>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#1e293b] mb-2">Contact Us</h1>
          <p className="text-[#64748b]">Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
              {success}
            </div>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748b]" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="The Name"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748b]" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="thename@name.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748b]" />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="1234567890"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Reason for contacting</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 size-4 text-[#64748b]" />
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Your message here..."
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#d97706] text-white py-3 rounded-lg font-bold hover:bg-[#b45309] transition-colors mt-2 disabled:opacity-70"
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}