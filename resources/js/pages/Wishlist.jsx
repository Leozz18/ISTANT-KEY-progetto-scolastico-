import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/wishlist.css';

export default function Wishlist({ auth }) {
  const [wishlist, setWishlist] = React.useState([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved);
  }, []);

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exists = cart.find(item => item.id === product.id);

    if (!exists) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart!');
    } else {
      alert('Already in cart!');
    }
  };

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">My Wishlist</h1>

          {wishlist.length === 0 ? (
            <div className="empty-state">
              <p>Your wishlist is empty</p>
              <a href="/products" className="btn-primary">
                Browse Games
              </a>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map(item => (
                <div key={item.id} className="wishlist-item">
                  <img src={item.image_url} alt={item.title} />
                  <h3>{item.title}</h3>
                  <p className="price">${item.price}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
