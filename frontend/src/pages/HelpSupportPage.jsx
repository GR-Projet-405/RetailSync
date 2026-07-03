import { useEffect, useRef, useState } from 'react';
import { Plus, Send, Eye, CloudUpload, Filter, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getSupportTickets, createSupportTicket } from '../services/helpSupportService';

const categories = [
  'Technical Issue',
  'Billing',
  'Account Access',
  'Feature Request',
  'Other',
];

const PRIORITIES = ['High', 'Med', 'Low'];

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const STATUS_VARIANT = {
  Open: 'primary',
  'In Progress': 'info',
  Resolved: 'success',
  Closed: 'neutral',
}

//Mocked Data
const INITIAL_TICKETS = [
  {
    id: 'JK-2983',
    subject: 'API Connection Error',
    category: 'Technical Issue',
    date: 'Oct 12, 2023',
    status: 'In Progress',
    priority: 'High',
    messages: [
      {
        id: 1,
        type: 'user',
        text: 'Our POS terminal cannot connect to the API since this morning.',
        time: 'Oct 12, 2023, 9:15 AM',
      },
    ],
  },
  {
    id: 'JK-2984',
    subject: 'Unable to upgrade plan',
    category: 'Billing',
    date: 'Oct 14, 2023',
    status: 'Open',
    priority: 'High',
    messages: [
      {
        id: 1,
        type: 'user',
        text: "I'm trying to upgrade to the Enterprise plan but I keep getting a payment error (402). My card is valid and works elsewhere. Can you help?",
        time: 'Today, 10:45 AM',
      },
      {
        id: 2,
        type: 'system',
        text: 'Support Agent Sarah joined the chat',
      },
      {
        id: 3,
        type: 'agent',
        sender: 'Sarah',
        text: "Hi there! I'm Sarah from the billing department. I can see the failed transaction attempt. Could you please confirm the last 4 digits of the card you're trying to use?",
        time: 'Today, 10:48 AM',
      },
    ],
  },
];

function CreateTicketForm ({ onTicketCreated }){
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('Med');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  
  const [errors, setErrors] = useState({
    subject: '',
    description: '',
  });

  const validateAndAddFiles = (selectedFiles) => {
    const validFiles = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError('Only PNG, JPG, and PDF files are allowd.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError('Each file must be 25MB or less.');
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setFileError('');
    }
  };

  const handleFileChange = (e) => {
    validateAndAddFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = {
      subject: subject.trim() ? '' : 'Subject is required.',
      description: description.trim() ? '' : 'Description is required.',
    };
  
    setErrors(newErrors);
  
    if (newErrors.subject || newErrors.description) return;

    try {
      const newTicket = await createSupportTicket({
        subject,
        category,
        priority,
        description,
        senderName: 'Customer',
        attachments: files.map((file) => ({
          fileName: file.name,
          fileType: file.type,
          fileUrl: file.name,
        })),
      });
  
      onTicketCreated(newTicket);
  
      setSubject('');
      setCategory('Technical Issue');
      setPriority('Med');
      setDescription('');
      setFiles([]);
    } catch (err) {
      console.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Plus size={16} />
          </span>
          Create New Ticket
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/*Subject Input*/}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject
            </label>
            <input type="text" value={subject} onChange={(e) => { setSubject(e.target.value);
              if (errors.subject) {
                setErrors((prev) => ({ ...prev, subject: ''}));
              }
            }}
             placeholder="Brief summary of the issue" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
             {errors.subject && (
              <p className='mt-1.5 text-xs text-red-600'>{errors.subject}</p>
             )}
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priority
              </label>
              <div className="flex rounded-lg border border-slate-200 p-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                      priority === p
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: ''}));
                }
              }}
              rows={5}
              placeholder="Describe your problem in detail..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.description && (
              <p className='mt-1.5 text-xs text-red-600'>{errors.description}</p>
            )}
          </div>
          {/* Attachments */}
<div>
  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
    Attachments
  </label>

  <input
    ref={fileInputRef}
    type="file"
    accept=".png,.jpg,.jpeg,.pdf"
    multiple
    className="hidden"
    onChange={handleFileChange}
  />

  <div
    onClick={() => fileInputRef.current?.click()}
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/30"
  >
    <CloudUpload size={28} className="mb-2 text-blue-500" />
    <p className="text-sm font-medium text-slate-700">Click or drag to upload files</p>
    <p className="mt-1 text-xs text-slate-400">Max size 25MB (PNG, JPG, PDF)</p>
  </div>

  {fileError && (
    <p className="mt-2 text-xs text-red-600">{fileError}</p>
  )}

  {files.length > 0 && (
    <div className="mt-3 space-y-2">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <span className="truncate text-slate-700">{file.name}</span>
          <button
            type="button"
            onClick={() => removeFile(index)}
            className="text-xs font-medium text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>
          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full gap-2 py-2.5">
            {submitting ? 'Submitting...' : (
              <>
              <Send size={16} /> Submit Ticket
              </>
            )}
            </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function RecentTicketsTable({ tickets, selectedId, onSelect }) {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOption, setSortOption] = useState('Newest First');
  const [sortOpen, setSortOpen] = useState(false);

  const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Subject A-Z', 'Subject Z-A'];

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === 'All Status') return true;
    return ticket.status === statusFilter;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortOption === 'Oldest First') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortOption === 'Subject A-Z') {
      return b.subject.localeCompare(a.subject);
    }

    if (sortOption === 'Subject Z-A') {
      return a.subject.localeCompare(b.subject);
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Recent Tickets</CardTitle>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('All Status')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Filter size={14} />
            {statusFilter}
          </button>
          <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {sortOption}
            <ChevronDown size={14} />
          </button>

          {sortOpen && (
            <>
            <div className='fixed inset-0 z-10' onClick={() => setSortOpen(false)}/>
            <div className='absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg'>
             {SORT_OPTIONS.map((option) => (
              <button key={option} type="button" onClick={() => {setSortOption(option); setSortOpen(false); }} className={`block w-full px-3.5 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 ${ sortOption === option ? 'text-blue-600' : 'text-slate-600' }`}>
                {option}
              </button>
             ))}
             </div>
             </>
            )}
            </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`transition-colors hover:bg-blue-50/40 ${
                    selectedId === ticket.id ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    #{ticket.ticketId}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{ticket.subject}</p>
                    <p className="text-xs text-slate-400">{ticket.category}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ticket.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[ticket.status]}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onSelect(ticket.id)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        selectedId === ticket.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HelpSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError('');
  
        const data = await getSupportTickets();
        setTickets(data);
      } catch (err) {
        setError(err.message || 'Failed to load support tickets.');
      } finally {
        setLoading(false);
      }
    };
  
    loadTickets();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 pt-6 text-sm text-slate-500">
          Loading support tickets...
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 pt-6 text-sm text-red-600">
          {error}
        </CardContent>
      </Card>
    );
  }

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedId(newTicket.id);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-5">
        <CreateTicketForm onTicketCreated={handleTicketCreated} />
      </div>
      <div className="xl:col-span-7">
        <RecentTicketsTable tickets={tickets} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}
