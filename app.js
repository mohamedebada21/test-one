import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';

// Import Firebase config and services
import { db, auth, onAuthStateChanged, signIn, appId, ADMIN_UID } from './firebase';

// Import Components
import Header from './components/Header';
import { Footer, Notification } from './components/OtherComponents';

// Import Views
import ShopView from './views/ShopView';
import CartView from './views/CartView';
import AdminDashboard from './views/AdminDashboard';

function App() {
  // --- State Management ---
  const [view, setView] = useState('shop'); // 'shop', 'cart', 'admin'
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // Auth state
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // If no user, sign in anonymously or with a custom token
        const signedInUser = await signIn();
        setUserId(signedInUser.user.uid);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    if (!isAuthReady) return; // Don't fetch until authentication is ready

    setIsLoading(true);
    
    // Fetch Products
    const productsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubscribeProducts = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        showNotification("Could not fetch products.", "error");
        setIsLoading(false);
    });

    // Fetch Orders (only if admin)
    let unsubscribeOrders = () => {};
    if (userId === ADMIN_UID) {
      const ordersCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      unsubscribeOrders = onSnapshot(ordersCollectionRef, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        ordersData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setOrders(ordersData);
      }, (error) => {
          console.error("Error fetching orders:", error);
          showNotification("Could not fetch orders.", "error");
      });
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [isAuthReady, userId]); // Rerun effect if auth state changes


  // --- Helper Functions ---
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // --- Cart Management ---
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} added to cart!`, 'success');
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    showNotification('Item removed from cart.', 'success');
  };
  
  const handleOrderSuccess = () => {
    setCart([]);
    setView('shop');
    showNotification('Order Placed! Thank you for your purchase.', 'success');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // --- View Rendering Logic ---
  const renderView = () => {
    if (!isAuthReady || isLoading) {
        return <div className="text-center p-10 text-gray-700">Loading your shop...</div>;
    }
    switch (view) {
      case 'cart':
        return <CartView 
                    cart={cart} 
                    updateCartQuantity={updateCartQuantity} 
                    removeFromCart={removeFromCart} 
                    cartTotal={cartTotal} 
                    setView={setView} 
                    onOrderSuccess={handleOrderSuccess}
                    db={db}
                    showNotification={showNotification}
                />;
      case 'admin':
        return <AdminDashboard 
                    userId={userId} 
                    ADMIN_UID={ADMIN_UID} 
                    products={products} 
                    orders={orders} 
                    db={db} 
                    showNotification={showNotification}
                />;
      default:
        return <ShopView products={products} addToCart={addToCart} />;
    }
  };

  return (
    <div className="bg-[#F0FFF4] min-h-screen font-sans">
      <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
      <Header setView={setView} cartItemCount={cartItemCount} isAdmin={userId === ADMIN_UID} />
      <main className="container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

