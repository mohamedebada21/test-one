import React, { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Icon } from '../components/Icon';
import { Modal } from '../components/OtherComponents';
import { appId } from '../firebase';

// This file contains all components related to the Admin Dashboard.

const AdminDashboard = ({ userId, ADMIN_UID, products, orders, db, showNotification }) => {
    const [currentAdminView, setCurrentAdminView] = useState('products'); // 'products' or 'orders'
    
    if (userId !== ADMIN_UID) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-2">You do not have permission to view this page.</p>
                <p className="text-sm text-gray-500">Please ensure your Firebase UID is correctly set in the firebase.js file.</p>
                <p className="text-sm text-gray-500 mt-4">Your UID: <span className="font-mono bg-gray-200 p-1 rounded">{userId || 'Loading...'}</span></p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
            <div className="flex border-b mb-6">
                <button onClick={() => setCurrentAdminView('products')} className={`py-2 px-4 text-lg font-semibold ${currentAdminView === 'products' ? 'border-b-2 border-[#F25F5C] text-[#F25F5C]' : 'text-gray-500'}`}>
                    Manage Products
                </button>
                <button onClick={() => setCurrentAdminView('orders')} className={`py-2 px-4 text-lg font-semibold ${currentAdminView === 'orders' ? 'border-b-2 border-[#F25F5C] text-[#F25F5C]' : 'text-gray-500'}`}>
                    View Orders ({orders.length})
                </button>
            </div>
            {currentAdminView === 'products' ? <AdminProductManagement products={products} db={db} showNotification={showNotification} /> : <AdminOrderManagement orders={orders} db={db} showNotification={showNotification} />}
        </div>
    );
};


const AdminProductManagement = ({ products, db, showNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (productId, productName) => {
        try {
            const productDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', productId);
            await deleteDoc(productDocRef);
            showNotification(`Product "${productName}" deleted successfully.`, 'success');
        } catch (error) {
            console.error("Error deleting product:", error);
            showNotification('Failed to delete product.', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">Your Products</h3>
                <button onClick={handleAddNew} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center space-x-2">
                    <Icon name="plus" className="w-5 h-5"/>
                    <span>Add New Product</span>
                </button>
            </div>
            <div className="space-y-4">
                {products.map(p => (
                    <div key={p.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <img src={p.imageUrl || `https://placehold.co/100x100/E2E8F0/4A5568?text=Item`} alt={p.name} className="w-16 h-16 rounded-md object-cover"/>
                            <div>
                                <p className="font-bold text-lg">{p.name}</p>
                                <p className="text-gray-600">${(p.price || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-red-600 hover:text-red-800"><Icon name="trash" className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <AdminProductForm 
                    product={editingProduct} 
                    onClose={() => setIsModalOpen(false)}
                    db={db}
                    showNotification={showNotification}
                />
            </Modal>
        </div>
    );
};

const AdminProductForm = ({ product, onClose, db, showNotification }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        stock: product?.stock || 0,
        imageUrl: product?.imageUrl || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (product) {
                const productDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', product.id);
                await setDoc(productDocRef, formData, { merge: true });
                showNotification('Product updated successfully!', 'success');
            } else {
                const productsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
                await addDoc(productsCollectionRef, formData);
                showNotification('Product added successfully!', 'success');
            }
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            showNotification('Failed to save product.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h3>
            <div>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded"/>
            </div>
            <div>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full p-2 border rounded"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label>Price ($)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label>Stock Quantity</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full p-2 border rounded"/>
                </div>
            </div>
            <div>
                <label>Image URL</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded"/>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#F25F5C] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#d95452] disabled:bg-gray-400">
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
            </div>
        </form>
    );
};

const AdminOrderManagement = ({ orders, db, showNotification }) => {
    const [viewingOrder, setViewingOrder] = useState(null);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const orderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
            await updateDoc(orderDocRef, { status: newStatus });
            showNotification(`Order status updated to ${newStatus}`, 'success');
        } catch (error) {
            console.error("Error updating status:", error);
            showNotification('Failed to update status.', 'error');
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-6">Incoming Orders</h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                            <th className="py-3 px-5">Date</th>
                            <th className="py-3 px-5">Customer</th>
                            <th className="py-3 px-5">Payment</th>
                            <th className="py-3 px-5 text-right">Total</th>
                            <th className="py-3 px-5 text-center">Status</th>
                            <th className="py-3 px-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-5">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className="py-3 px-5">{order.customerDetails.name}</td>
                                <td className="py-3 px-5">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.paymentMethod === 'Cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {order.paymentMethod}
                                    </span>
                                </td>
                                <td className="py-3 px-5 text-right">${(order.totalAmount || 0).toFixed(2)}</td>
                                <td className="py-3 px-5 text-center">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="p-1 rounded border bg-gray-50"
                                    >
                                        <option>Pending</option>
                                        <option>Paid</option>
                                        <option>Shipped</option>
                                        <option>Delivered</option>
                                        <option>Cancelled</option>
                                    </select>
                                </td>
                                <td className="py-3 px-5">
                                    <button onClick={() => setViewingOrder(order)} className="text-[#4A934A] hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={!!viewingOrder} onClose={() => setViewingOrder(null)}>
                {viewingOrder && <OrderDetailView order={viewingOrder} />}
            </Modal>
        </div>
    );
};

const OrderDetailView = ({ order }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4">Order Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-lg mb-2">Customer Info</h4>
                <p><strong>Name:</strong> {order.customerDetails.name}</p>
                <p><strong>Email:</strong> {order.customerDetails.email}</p>
                <p><strong>Address:</strong> {order.customerDetails.address}</p>
            </div>
            <div>
                <h4 className="font-semibold text-lg mb-2">Order Summary</h4>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
                <p><strong>Total:</strong> <span className="font-bold">${(order.totalAmount || 0).toFixed(2)}</span></p>
            </div>
        </div>
        <div className="mt-6">
            <h4 className="font-semibold text-lg mb-2">Items Ordered</h4>
            <div className="space-y-2">
                {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default AdminDashboard;
