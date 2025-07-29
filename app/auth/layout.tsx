import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-container">
       <div className="auth-card">
        {children}
        <p className="auth-form-header" style={{textAlign: "center", fontSize: "0.9rem", marginTop: "1.5rem"}}>
          <Link href="/" className="back-link-white">← Back to Command Center</Link>
        </p>
      </div>
    </main>
  );
}
