import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Phone, Mail, FileText, CheckCircle, MoreHorizontal, X, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  getContacts,
  addContact as apiAddContact,
  addContactNote as apiAddContactNote,
} from '../../services/supplierService';

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

// ─── Add Contact Modal ────────────────────────────────────────────────────────
const AddContactModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', tags: '' });
  const [errors, setErrors] = useState({});
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (form.phone && !/^[\d\s\-+().]{7,20}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    onAdd({ name: form.name.trim(), role: form.role.trim(), email: form.email.trim(), phone: form.phone.trim(), tags });
    onClose();
  };

  const inputCls = (field) => cn(
    'w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400',
    errors[field] ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-blue-500'
  );

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
            { label: 'Full Name *', key: 'name', placeholder: 'Marcus Chen', type: 'text' },
            { label: 'Job Title', key: 'role', placeholder: 'Account Manager', type: 'text' },
            { label: 'Email *', key: 'email', placeholder: 'marcus@supplier.com', type: 'email' },
            { label: 'Phone', key: 'phone', placeholder: '+1 (555) 234-5678', type: 'tel' },
            { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'Primary, Sales', type: 'text' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">{label}</label>
              <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls(key)} />
              {errors[key] && <p className="text-xs text-red-500 font-medium">{errors[key]}</p>}
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

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, onDismiss }) => (
  <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
    <span>{message}</span>
    <button onClick={onDismiss} className="ml-2 text-slate-400 hover:text-white"><X size={14} /></button>
  </div>
);

// ─── Contacts Page ────────────────────────────────────────────────────────────
const Contacts = ({ supplier }) => {
  const supplierId = supplier?._id ?? supplier?.id;
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const noteRef = useRef(null);

  // BUG-04: Don't enter loading state at all if there's no supplierId
  useEffect(() => {
    if (!supplierId) return; // no loading spinner — handled gracefully below
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // BUG-01: Persist note to backend; merge returned note into local state
  const handleAddNote = async () => {
    if (!newNote.trim() || !selected || !supplierId) return;
    setSavingNote(true);
    try {
      const contactId = selected._id ?? selected.id;
      const res = await apiAddContactNote(supplierId, contactId, newNote.trim());
      const savedNote = res.data ?? { _id: Date.now(), text: newNote.trim(), createdAt: new Date().toISOString() };
      // Merge note into the contacts list so it shows immediately without reload
      setContacts(prev => prev.map(c => {
        if ((c._id ?? c.id) === contactId) {
          return { ...c, notes: [savedNote, ...(c.notes ?? [])] };
        }
        return c;
      }));
      setSelected(prev => ({ ...prev, notes: [savedNote, ...(prev.notes ?? [])] }));
      setNewNote('');
      showToast('Note saved successfully');
    } catch (err) {
      showToast(`Failed to save note: ${err.message}`);
    } finally {
      setSavingNote(false);
    }
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
      showToast(err.message || 'Failed to add contact');
    }
  };

  // BUG-04: No supplier selected — show a clear prompt instead of hanging
  if (!supplierId) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4 text-center fade-up">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">No Supplier Selected</p>
          <p className="text-sm text-slate-500 mt-1">Please open a supplier profile first, then navigate to Contacts.</p>
        </div>
      </div>
    );
  }

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
            {contacts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No contacts yet. Add one above.</p>
            ) : contacts.map(c => (
              <button
                key={c._id ?? c.id}
                onClick={() => setSelected(c)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border transition-all duration-150',
                  (selected?._id ?? selected?.id) === (c._id ?? c.id)
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
                      <span className="text-xs text-slate-400 shrink-0">
                        {c.notes?.length ? `${c.notes.length} note${c.notes.length > 1 ? 's' : ''}` : '—'}
                      </span>
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
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => showToast('Contact options coming soon')}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* BUG-05: Quick Actions wired with real handlers */}
                <div className="flex items-center gap-2 mb-4">
                  <a
                    href={selected.phone ? `tel:${selected.phone}` : '#'}
                    onClick={!selected.phone ? (e) => { e.preventDefault(); showToast('No phone number on record'); } : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a
                    href={selected.email ? `mailto:${selected.email}` : '#'}
                    onClick={!selected.email ? (e) => { e.preventDefault(); showToast('No email on record'); } : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                  <button
                    onClick={() => noteRef.current?.focus()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
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

                {/* Notes — BUG-01 fixed: persisted to DB */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
                    <button
                      onClick={() => noteRef.current?.focus()}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      + Add Note
                    </button>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                    {(selected.notes ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notes yet. Add one below.</p>
                    ) : (selected.notes ?? []).map(n => (
                      <div key={n._id ?? n.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Add Note Input */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <textarea
                      ref={noteRef}
                      rows={2}
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none resize-none placeholder:text-slate-400 transition-all"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={savingNote || !newNote.trim()}
                      className="w-full py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {savingNote ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Note'}
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

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default Contacts;

