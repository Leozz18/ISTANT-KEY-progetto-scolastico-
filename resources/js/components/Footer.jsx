import React from 'react';
import './header.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>INSTANT KEY</h4>
          <p>Your trusted digital gaming marketplace</p>
        </div>

        <div className="footer-section">
          <h5>Company</h5>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Marketplace</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Legal</h5>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Contact</h5>
          <p>Email: support@instantkey.com</p>
          <p>Phone: +1 (555) 000-0000</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} INSTANT KEY. All rights reserved.</p>
      </div>
    </footer>
  );
}
