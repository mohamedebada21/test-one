import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Icon } from '../components/Icon';
import { appId } from '../firebase';

// This file contains all components related to the cart and checkout process.

const CartView = ({ cart, updateCartQuantity, removeFromCart, cartTotal, setView, onOrderSuccess, db, showNotification }) => {
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    if (cart.length === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-6">Go find some juicy products!</p>
                <button onClick={() => setView('shop')} className="bg-[#4A934A] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3e7a3e] transition">
                    Continue Shopping
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Your Shopping Cart</h2>
            {isCheckingOut ? (
                <CheckoutForm 
                    cart={cart} 
                    cartTotal={cartTotal} 
                    onOrderSuccess={onOrderSuccess}
                    db={db}
                    showNotification={showNotification}
                />
            ) : (
                <>
                    <div className="space-y-6">
                        {cart.map(item => (
                            <CartItem key={item.id} item={item} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} />
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        <div className="text-2xl font-bold text-gray-800">
                            Total: <span className="text-[#4A934A]">${cartTotal.toFixed(2)}</span>
                        </div>
                        <button onClick={() => setIsCheckingOut(true)} className="bg-[#67C767] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#58b058] transition text-lg shadow-sm hover:shadow-md">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const CartItem = ({ item, updateCartQuantity, removeFromCart }) => (
    <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
            <img src={item.imageUrl || `https://placehold.co/100x100/E2E8F0/4A5568?text=Item`} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
            <div>
                <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                <p className="text-gray-500">${(item.price || 0).toFixed(2)}</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-lg">
                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-lg font-bold hover:bg-gray-100">-</button>
                <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))} 
                    className="w-12 text-center border-l border-r"
                />
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-lg font-bold hover:bg-gray-100">+</button>
            </div>
            <p className="text-lg font-semibold w-24 text-right">${((item.price || 0) * item.quantity).toFixed(2)}</p>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                <Icon name="trash" className="w-6 h-6" />
            </button>
        </div>
    </div>
);

const CheckoutForm = ({ cart, cartTotal, onOrderSuccess, db, showNotification }) => {
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', address: '' });
    const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' or 'Cash'
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerDetails.name || !customerDetails.email || !customerDetails.address) {
            showNotification("Please fill out all shipping fields.", "error");
            return;
        }
        setIsSubmitting(true);
        
        const orderData = {
            customerDetails,
            items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
            totalAmount: cartTotal,
            status: 'Pending',
            paymentMethod: paymentMethod,
            createdAt: serverTimestamp(),
        };

        try {
            if (!db) throw new Error("Database not initialized");
            const ordersCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
            await addDoc(ordersCollectionRef, orderData);
            
            onOrderSuccess();
            
        } catch (error) {
            console.error("Error placing order: ", error);
            showNotification("There was an error placing your order. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6">Shipping & Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Shipping Details</h4>
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" required value={customerDetails.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#67C767] focus:border-[#67C767]"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" required value={customerDetails.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#67C767] focus:border-[#67C767]"/>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                            <textarea name="address" id="address" required rows="3" value={customerDetails.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#67C767] focus:border-[#67C767]"></textarea>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Payment Method</h4>
                    <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${paymentMethod === 'Card' ? 'border-[#4A934A] bg-green-50' : 'border-gray-300'}`}>
                            <input type="radio" name="paymentMethod" value="Card" checked={paymentMethod === 'Card'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-[#4A934A] focus:ring-[#67C767]"/>
                            <span className="ml-3 text-gray-700">Credit/Debit Card (Simulated)</span>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${paymentMethod === 'Cash' ? 'border-[#4A934A] bg-green-50' : 'border-gray-300'}`}>
                            <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === 'Cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-[#4A934A] focus:ring-[#67C767]"/>
                            <span className="ml-3 text-gray-700">Cash on Delivery</span>
                        </label>
                    </div>
                </div>

                <div className="text-right pt-4">
                    <button type="submit" disabled={isSubmitting} className="bg-[#F25F5C] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#d95452] transition disabled:bg-gray-400 w-full sm:w-auto">
                        {isSubmitting ? 'Placing Order...' : `Place Order ($${cartTotal.toFixed(2)})`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CartView;
