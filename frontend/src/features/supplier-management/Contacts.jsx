import React, { useState, useEffect } from 'react';
import {
  Plus, Phone, Mail, FileText, CheckCircle, MoreHorizontal, X, Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getContacts, addContact as apiAddContact } from '../../services/supplierService';

// ─── Tag Badge ────────────────────────────────────────────────────────────────
const TagBadge = ({ tag }) => {
  const map = {
    Primary: 'bg-blue-50 text-blue-700 border-blue-200',
    Sales: 'bg-violet-50 text-violet-700 border-violet-200',
    Operations: 'bg-amber-50 text-amber-700 border-amber-200',
    Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Billing: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Logistics: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-xs font-semibold border',
      map[tag] ?? 'bg-slate-100 text-slate-600 border-slate-200'
    )}>
      {tag}
    </span>
  );
};

// ─── Activity icon map ────────────────────────────────────────────────────────
const activityMap = {
  email:  { Icon: Mail,        cls: 'bg-blue-50 text-blue-500' },
  call:   { Icon: Phone,       cls: 'bg-emerald-50 text-emerald-500' },
  note:   { Icon: FileText,    cls: 'bg-amber-50 text-amber-500' },
  system: { Icon: CheckCircle, cls: 'bg-slate-100 text-slate-400' },
};

// ─── Add Contact Modal ────────────────────────────────────────────────────────
const AddContactModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', tags: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    onAdd({ id: `C${Date.now()}`, initials, name: form.name, role: form.role, email: form.email, phone: form.phone, tags, lastContact: 'Just now', color });
    onClose();
  };

  const inputCls = 'w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 modal-enter">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <h3 className="text-base font-semibold text-slate-900">Add New Contact</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'Marcus Chen' },
            { label: 'Job Title', key: 'role', placeholder: 'Account Manager' },
            { label: 'Email *', key: 'email', placeholder: 'marcus@supplier.com' },
            { label: 'Phone', key: 'phone', placeholder: '+1 (555) 234-5678' },
            { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'Primary, Sales' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">{label}</label>
              <input type="text" value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">Add Contact</button>
        </div>
      </div>
    </div>
  );
};

// ─── Contacts Page ────────────────────────────────────────────────────────────
const Contacts = ({ supplier }) => {
  const supplierId = supplier?._id ?? supplier?.id;
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    setError(null);
    getContacts(supplierId)
      .then(res => {
        const list = res.data?.contacts ?? [];
        setContacts(list);
        setSelected(list[0] ?? null);
      })
      .catch(err => setError(err.message || 'Failed to load contacts'))
      .finally(() => setLoading(false));
  }, [supplierId]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [
      { id: Date.now(), text: newNote, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), author: 'You' },
      ...prev,
    ]);
    setNewNote('');
  };

  const handleAddContact = async (contactPayload) => {
    try {
      const res = await apiAddContact(supplierId, {
        name: contactPayload.name,
        role: contactPayload.role,
        email: contactPayload.email,
        phone: contactPayload.phone,
        tags: contactPayload.tags,
        isPrimary: false,
      });
      const newContact = res.data ?? contactPayload;
      setContacts(prev => [newContact, ...prev]);
      setSelected(newContact);
    } catch (err) {
      alert(err.message || 'Failed to add contact');
    }
  };

  return (
    <div className="space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {supplier?.name ?? 'Supplier'} · {contacts.length} contacts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading contacts...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}

      {/* Main Split Layout */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Contact List */}
          <div className="md:col-span-2 space-y-2">
            {contacts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border transition-all duration-150',
                  selected?._id === c._id || selected?.id === c.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0', c.color ?? 'bg-blue-500')}>
                    {c.initials ?? c.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <span className="text-xs text-slate-400 shrink-0">{c.lastContact ?? '—'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags?.map(t => <TagBadge key={t} tag={t} />)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Contact Detail */}
          {selected ? (
            <div className="md:col-span-3 space-y-4">
              {/* Contact Header */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold', selected.color ?? 'bg-blue-500')}>
                      {selected.initials ?? selected.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{selected.name}</h2>
                      <p className="text-sm text-slate-500">{selected.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {selected.tags?.map(t => <TagBadge key={t} tag={t} />)}
                      </div>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                {/* Quick Actions */}
                <div className="flex items-center gap-2 mb-4">
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Note
                  </button>
                </div>
                {/* Contact Info Row */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline font-medium">{selected.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                    <p className="font-medium text-slate-800">{selected.phone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Last Contact</p>
                    <p className="font-medium text-slate-800">{selected.lastContact ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Communication History + Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Communication History */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Communication History</h3>
                  <div className="space-y-3.5">
                    <p className="text-xs text-slate-400 text-center py-4">No communication history available.</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
                    <button className="text-xs text-blue-600 font-medium hover:underline">+ Add Note</button>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                    {notes.map(n => (
                      <div key={n.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">{n.date} · {n.author}</p>
                      </div>
                    ))}
                  </div>
                  {/* Add Note Input */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <textarea
                      rows={2}
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none resize-none placeholder:text-slate-400 transition-all"
                    />
                    <button
                      onClick={handleAddNote}
                      className="w-full py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-3 flex items-center justify-center bg-white rounded-2xl border border-slate-200 p-12">
              <p className="text-sm text-slate-400">Select a contact to view details</p>
            </div>
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal onClose={() => setShowAddModal(false)} onAdd={handleAddContact} />
      )}
    </div>
  );
};

export default Contacts;
