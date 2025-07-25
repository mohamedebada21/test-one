import React from 'react';
import { Icon } from './Icon';

// --- Notification Component ---
export const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;
  const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50";
  const typeStyle = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`${baseStyle} ${typeStyle}`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-4 font-bold">X</button>
    </div>
  );
};

// --- Modal Component ---
export const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-end">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <Icon name="x" className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Footer Component ---
export const Footer = () => (
    <footer className="bg-white mt-12 py-6 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Watermelon Stand. All Rights Reserved.</p>
            <p className="text-sm mt-1">Freshly coded with React & Firebase.</p>
        </div>
    </footer>
);

// --- Product Card Component ---
export const ProductCard = ({ product, onAddToCart }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col border-b-4 border-transparent hover:border-[#67C767]">
    <img 
        src={product.imageUrl || `https://placehold.co/600x400/F25F5C/FFFFFF?text=${encodeURIComponent(product.name)}`} 
        alt={product.name} 
        className="w-full h-56 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/E2E8F0/4A5568?text=Image+Error`; }}
    />
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-semibold text-[#2F3E46] mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <p className="text-2xl font-bold text-[#4A934A]">${(product.price || 0).toFixed(2)}</p>
        <button onClick={onAddToCart} className="bg-[#F25F5C] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#d95452] transition-colors duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md">
          <Icon name="shoppingCart" className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  </div>
);
