import { useState } from 'react';
import { Plus, Send, Eye, CloudUpload, Smile, Paperclip, MessageSquare, Filter, ChevronDown, } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const categories = [
  'Technical Issue',
  'Billing',
  'Account Access',
  'Feature Request',
  'Other',
];

const PRIORITIES = ['High', 'Med', 'Low'];

const STATUS_VARIANT = {
  Open: 'primary',
  'In Progress': 'info',
  Resolved: 'success',
  Closed: 'neutral',
}

//Mocked Data
const INITIAL_TICKETS = [
  {
    id: 1,
    subject: 'API Connection Error',
    category: 'Technical Issue',
    date: '2023-08-15',
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
];

function CreateTicketForm (){
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('Med');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ subject, category, priority, description });
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
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of the issue" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe your problem in detail..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {/* Attachments */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Attachments
            </label>
            <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/30">
              <CloudUpload size={28} className="mb-2 text-blue-500" />
              <p className="text-sm font-medium text-slate-700">Click or drag to upload files</p>
              <p className="mt-1 text-xs text-slate-400">Max size 25MB (PNG, JPG, PDF)</p>
            </div>
          </div>
          {/* Submit */}
          <Button type="submit" className="w-full gap-2 py-2.5">
            <Send size={16} />
            Submit Ticket
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function RecentTicketsTable (){
  return (
    <Card>
      <CardContent className="p-6 pt-6">
        Recent Tickets
      </CardContent>
    </Card>
  );
}

function TicketChatPanel (){
  return (
    <Card>
      <CardContent className="p-6 pt-6">
        Ticket Chat
      </CardContent>
    </Card>
  );
}

export default function HelpSupportPage() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedId, setSelectedId] = useState(1);
  
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-5">
        <CreateTicketForm />
      </div>
      <div className="xl:col-span-7 flex flex-col gap-6">
        <RecentTicketsTable />
        <TicketChatPanel />
      </div>
    </div>
  );
}
