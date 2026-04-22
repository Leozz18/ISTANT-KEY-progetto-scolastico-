import React from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingCart, User, Heart, LogOut } from 'lucide-react';
import './header.css';

export default function Header({ auth }) {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          <span className="logo-text">INSTANT KEY</span>
        </Link>

        <nav className="nav-menu">
          <Link href="/products" className="nav-link">
            Marketplace
          </Link>
          <Link href="/support" className="nav-link">
            Support
          </Link>
          {auth?.user && (
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {auth?.user ? (
            <>
              <Link href="/cart" className="action-icon">
                <ShoppingCart size={24} />
              </Link>
              <Link href="/wishlist" className="action-icon">
                <Heart size={24} />
              </Link>
              <div className="user-menu">
                <span className="user-name">{auth.user.name}</span>
                <form method="post" action="/logout">
                  <button className="logout-btn">
                    <LogOut size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-link">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
