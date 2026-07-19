import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, UserCheck, ShieldCheck } from 'lucide-react';
import { userService, authService } from '../services/api';

const AdminUsers = () => {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const currentUser = authService.getCurrentUser();

 // Modal controls
 const [modalOpen, setModalOpen] = useState(false);
 const [editingUser, setEditingUser] = useState(null);

 // Form states
 const [username, setUsername] = useState('');
 const [fullName, setFullName] = useState('');
 const [email, setEmail] = useState('');
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [role, setRole] = useState('Customer'); // Admin, Staff, Customer
 const [status, setStatus] = useState('Active'); // Active, Blocked

 const loadUsers = async () => {
 try {
 setLoading(true);
 const data = await userService.getUsers();
 setUsers(data);
 } catch (err) {
 console.error("Error loading users:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadUsers();
 }, []);

 const openAddModal = () => {
 setEditingUser(null);
 setUsername('');
 setFullName('');
 setEmail('');
 setPhone('');
 setPassword('');
 setRole('Customer');
 setStatus('Active');
 setModalOpen(true);
 };

 const openEditModal = (u) => {
 setEditingUser(u);
 setUsername(u.Username);
 setFullName(u.FullName);
 setEmail(u.Email || '');
 setPhone(u.Phone || '');
 setPassword(''); // Leave password empty by default
 setRole(u.Role);
 setStatus(u.Status);
 setModalOpen(true);
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!username || !fullName) {
 alert("សូមបំពេញឈ្មោះគណនី និងឈ្មោះពេញ!");
 return;
 }

 const payload = {
 Username: username,
 FullName: fullName,
 Email: email || null,
 Phone: phone || null,
 Role: role,
 Status: status
 };

 if (password) {
 payload.Password = password;
 } else if (!editingUser) {
 alert("សូមបញ្ចូលលេខសម្ងាត់សម្រាប់គណនីថ្មី!");
 return;
 }

 try {
 if (editingUser) {
 await userService.updateUser(editingUser.UserID, payload);
 } else {
 await userService.createUser(payload);
 }
 setModalOpen(false);
 loadUsers();
 } catch (err) {
 console.error(err);
 alert(err.response?.data?.detail || "មិនអាចរក្សាទុកគណនីបានទេ។");
 }
 };

 const handleDelete = async (user) => {
 if (user.Username === currentUser.username) {
 alert("អ្នកមិនអាចលុបគណនី Admin ដែលកំពុងប្រើប្រាស់បានទេ!");
 return;
 }

 if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនី "${user.FullName}" មែនទេ? (លុបចេញពីប្រព័ន្ធ)`)) {
 try {
 await userService.deleteUser(user.UserID);
 loadUsers();
 } catch (err) {
 console.error(err);
 alert("មានបញ្ហាពេលលុបគណនី។");
 }
 }
 };

 const filteredUsers = users.filter(u => 
 u.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 u.Username.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="space-y-6 font-khmer">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-xl font-bold text-slate-800">គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ (Users)</h1>
 <p className="text-xs text-slate-400 mt-1">រៀបចំតួនាទី បង្កើត ឬបិទគណនីបុគ្គលិក និងអ្នកគ្រប់គ្រង</p>
 </div>
 
 <button
 onClick={openAddModal}
 className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition animate-in fade-in"
 >
 <Plus className="h-4 w-4" />
 <span>បង្កើតគណនីថ្មី</span>
 </button>
 </div>

 {/* Toolbar */}
 <div className="bg-white p-4 rounded-2xl premium-shadow">
 <div className="relative max-w-sm">
 <input
 type="text"
 placeholder="ស្វែងរកតាមគណនី ឬឈ្មោះពេញ..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
 />
 <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
 </div>
 </div>

 {/* Table */}
 {loading ? (
 <div className="bg-white rounded-3xl p-8 space-y-4">
 <div className="h-6 shimmer w-full rounded"></div>
 <div className="h-10 shimmer w-full rounded"></div>
 </div>
 ) : filteredUsers.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl premium-shadow">
 <p className="text-slate-400 text-xs">មិនមានគណនីណាដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ</p>
 </div>
 ) : (
 <div className="bg-white rounded-3xl premium-shadow overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
 <th className="py-4 px-6">ឈ្មោះពេញ</th>
 <th className="py-4 px-6">ឈ្មោះគណនី (Username)</th>
 <th className="py-4 px-6">អ៊ីមែល</th>
 <th className="py-4 px-6">ទូរស័ព្ទ</th>
 <th className="py-4 px-6">តួនាទី (Role)</th>
 <th className="py-4 px-6 text-center">ស្ថានភាព</th>
 <th className="py-4 px-6 text-right">សកម្មភាព</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700">
 {filteredUsers.map((u) => (
 <tr key={u.UserID} className="hover:bg-slate-50/50 transition-colors">
 <td className="py-4 px-6 font-semibold flex items-center space-x-2">
 <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-bold text-indigo-650 text-[10px] uppercase font-sans">
 {u.Username.substring(0, 2)}
 </div>
 <span>{u.FullName}</span>
 </td>
 <td className="py-4 px-6 font-sans font-bold text-slate-550">{u.Username}</td>
 <td className="py-4 px-6 font-sans text-slate-500">{u.Email || '-'}</td>
 <td className="py-4 px-6 font-sans text-slate-500">{u.Phone || '-'}</td>
 <td className="py-4 px-6">
 <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
 u.Role === 'Admin' 
 ? 'bg-red-50 border-red-200 text-red-600'
 : u.Role === 'Staff' 
 ? 'bg-blue-50 border-blue-200 text-blue-600'
 : 'bg-slate-100 border-slate-200 text-slate-600'
 }`}>
 {u.Role}
 </span>
 </td>
 <td className="py-4 px-6 text-center">
 <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
 u.Status === 'Active'
 ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
 : 'bg-red-50 border-red-200 text-red-600'
 }`}>
 {u.Status === 'Active' ? 'Active' : 'Blocked'}
 </span>
 </td>
 <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
 <button
 onClick={() => openEditModal(u)}
 className="p-1.5 border border-slate-200 hover:border-amber-500 hover:text-amber-500 bg-white rounded-lg transition"
 title="កែប្រែ"
 >
 <Edit className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleDelete(u)}
 disabled={u.Username === currentUser.username}
 className={`p-1.5 border rounded-lg bg-white transition ${
 u.Username === currentUser.username 
 ? 'text-slate-350 border-slate-100 cursor-not-allowed' 
 : 'border-slate-200 hover:border-red-500 hover:text-red-500'
 }`}
 title="លុបចោល"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* ========================================================
 User Create/Edit Modal
 ======================================================== */}
 {modalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="relative bg-white rounded-3xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
 <h3 className="font-bold text-slate-800 text-sm">
 {editingUser ? 'កែប្រែព័ត៌មានគណនី' : 'បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី'}
 </h3>
 <button 
 onClick={() => setModalOpen(false)}
 className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 
 {/* Full Name */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">ឈ្មោះពេញ (Full Name) *</label>
 <input
 type="text"
 required
 placeholder="វាយបញ្ចូលឈ្មោះពេញ..."
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
 />
 </div>

 {/* Username */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">ឈ្មោះគណនី (Username) *</label>
 <input
 type="text"
 required
 disabled={!!editingUser}
 placeholder="ឧ. user123 (មិនអនុញ្ញាតឱ្យកែប្រែ)"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 className={`w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none ${editingUser ? 'cursor-not-allowed opacity-60' : ''}`}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Email */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">អ៊ីមែល (Email)</label>
 <input
 type="email"
 placeholder="example@gmail.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
 />
 </div>

 {/* Phone */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">លេខទូរស័ព្ទ (Phone)</label>
 <input
 type="text"
 placeholder="លេខទូរស័ព្ទ..."
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
 />
 </div>
 </div>

 {/* Password */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">
 {editingUser ? 'លេខសម្ងាត់ថ្មី (ទុកទទេបើមិនចង់ប្តូរ)' : 'លេខសម្ងាត់ចូលគណនី *'}
 </label>
 <input
 type="password"
 required={!editingUser}
 placeholder={editingUser ? "បំពេញប្រសិនបើចង់ផ្លាស់ប្តូរ..." : "វាយបញ្ចូលលេខសម្ងាត់..."}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Role */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">តួនាទី (Role)</label>
 <select
 value={role}
 onChange={(e) => setRole(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
 >
 <option value="Customer">Customer</option>
 <option value="Staff">Staff</option>
 <option value="Admin">Admin</option>
 </select>
 </div>

 {/* Status */}
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-500">ស្ថានភាពគណនី</label>
 <select
 value={status}
 onChange={(e) => setStatus(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
 >
 <option value="Active">សកម្ម (Active)</option>
 <option value="Blocked">បិទចោល (Blocked)</option>
 </select>
 </div>
 </div>

 {/* Actions */}
 <div className="pt-6 border-t border-slate-100 flex gap-4">
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
 >
 បោះបង់ (Cancel)
 </button>
 <button
 type="submit"
 className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition"
 >
 រក្សាទុក (Save)
 </button>
 </div>

 </form>
 </div>
 </div>
 )}

 </div>
 );
};

export default AdminUsers;
