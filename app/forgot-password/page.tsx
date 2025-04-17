// pages/forgot-password.tsx
'use client';

import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    const res = await fetch('/api/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) alert('Password reset email sent!');
    else alert('Something went wrong.');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleReset} className="bg-blue-500 text-white p-2 rounded">
        Send Reset Link
      </button>
    </div>
  );
}
