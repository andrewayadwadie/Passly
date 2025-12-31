import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, ExternalLink, Copy, Check, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultItem {
  id: string;
  account_name: string;
  url: string | null;
  login: string | null;
  created_at: string;
}

const VaultPage: React.FC = () => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  
  // Create/Edit Form State
  const [accountName, setAccountName] = useState('');
  const [url, setUrl] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [revealPassword, setRevealPassword] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get(`/vault/items?query=${search}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  const openCreateModal = () => {
    setSelectedItem(null);
    setAccountName('');
    setUrl('');
    setLogin('');
    setPassword('');
    setRevealPassword(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (item: VaultItem) => {
    setSelectedItem(item);
    setAccountName(item.account_name);
    setUrl(item.url || '');
    setLogin(item.login || '');
    setPassword('');
    setRevealPassword(null);
    setIsModalOpen(true);
  };

  const handleReveal = async () => {
    if (!selectedItem) return;
    try {
      const res = await api.post(`/vault/items/${selectedItem.id}/reveal`);
      setRevealPassword(res.data.password);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await api.put(`/vault/items/${selectedItem.id}`, {
          account_name: accountName,
          url,
          login,
          password: password || undefined
        });
      } else {
        await api.post('/vault/items', {
          account_name: accountName,
          url,
          login,
          password
        });
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/vault/items/${selectedItem.id}`);
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items; // Backend already filters by search

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Vault</h1>
            <p className="text-white/40">Securely managing {items.length} accounts</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-2.5 text-white/30" size={18} />
              <input 
                type="text" 
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark w-full pl-10"
              />
            </div>
            <button 
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <Shield className="mx-auto text-white/10 w-16 h-16 mb-4" />
            <h3 className="text-xl font-medium text-white/60">No items found</h3>
            <p className="text-white/30 mt-2">Start by creating your first secure entry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => openEditModal(item)}
                  className="glass-card cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <Shield className="text-primary-glow" size={24} />
                    </div>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">{item.account_name}</h3>
                  <p className="text-white/40 text-sm truncate">{item.login || 'No username'}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pb-20 md:pb-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {selectedItem ? 'Edit Account' : 'New Account'}
                </h2>
                {selectedItem && (
                  <button 
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 ml-1">Account Name</label>
                    <input 
                      type="text" 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="input-dark w-full"
                      placeholder="e.g. GitHub, Netflix"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 ml-1">URL (Optional)</label>
                    <input 
                      type="url" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="input-dark w-full"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Email / Username</label>
                  <input 
                    type="text" 
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="input-dark w-full"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">
                    {selectedItem ? 'New Password (Leave blank to keep current)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input 
                      type={revealPassword ? 'text' : 'password'}
                      value={revealPassword || password}
                      onChange={(e) => {
                        if (revealPassword) setRevealPassword(e.target.value);
                        setPassword(e.target.value);
                      }}
                      className="input-dark w-full pr-24"
                      placeholder="••••••••••••"
                      required={!selectedItem}
                    />
                    <div className="absolute right-2 top-1.5 flex gap-1">
                      {selectedItem && !revealPassword ? (
                        <button 
                          type="button"
                          onClick={handleReveal}
                          className="p-1.5 hover:bg-white/10 rounded-md text-white/30 hover:text-white transition-colors"
                          title="Reveal Password"
                        >
                          <Eye size={18} />
                        </button>
                      ) : revealPassword ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleCopy(revealPassword)}
                            className="p-1.5 hover:bg-white/10 rounded-md text-white/30 hover:text-white transition-colors"
                            title="Copy Password"
                          >
                            {isCopying ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setRevealPassword(null)}
                            className="p-1.5 hover:bg-white/10 rounded-md text-white/30 hover:text-white transition-colors"
                            title="Hide Password"
                          >
                            <EyeOff size={18} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (selectedItem ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification (Simple) */}
      <AnimatePresence>
        {isCopying && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg z-[100] flex items-center gap-2"
          >
            <Check size={18} />
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VaultPage;
