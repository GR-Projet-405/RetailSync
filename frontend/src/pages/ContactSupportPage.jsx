import { useState } from 'react';
import { ChevronDown, Paperclip, Send, MessageCircle, Mail, Clock, Zap, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { createContactMessage } from '../services/contactSupportService';
import { toast } from '../utils/toast';

const SUBJECT_OPTIONS = [
    'Technical Issue',
    'Billing',
    'Account Access',
    'Feature Request',
    'Other',
];

const inputClassName = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

function SupportInfoPanel() {
    return (
    <div className="space-y-4">
        {/* Instant Live Chat */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#1E56B8] p-4 text-white shadow-lg">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
            <MessageCircle size={16} />
          </div>
          <h3 className="text-base font-semibold">Instant Live Chat</h3>
          <p className="mt-1 text-xs text-blue-100">Available for Enterprise Users</p>
          <p className="mt-2 text-xs leading-snug text-blue-50/90">
            Need an answer right now? Our expert support team is online and ready to chat.
            Typical wait time is less than 2 minutes.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-white py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Start Live Chat
          </button>
        </div>
  
        {/* Email + Working Hours */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 pt-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail size={18} />
              </div>
              <p className="text-sm font-semibold text-slate-900">Email Support</p>
              <p className="mt-1 text-xs text-slate-500">support@jayani.com</p>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-5 pt-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock size={18} />
              </div>
              <p className="text-sm font-semibold text-slate-900">Working Hours</p>
              <p className="mt-1 text-xs text-slate-500 whitespace-nowrap">Mon-Fri, 9am-6pm EST</p>
            </CardContent>
          </Card>
        </div>
  
        {/* Our Commitment */}
        <Card className="overflow-hidden bg-slate-50/80">
          <CardContent className="p-5 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Our Commitment
            </p>
  
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap size={16} className="text-blue-600" />
                  Response Time
                </div>
                <span className="text-sm font-bold text-blue-600">&lt; 4h</span>
              </div>
  
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldCheck size={16} className="text-blue-600" />
                  Resolution Rate
                </div>
                <span className="text-sm font-bold text-blue-600">98.4%</span>
              </div>
            </div>
  
            <div className="mt-5 overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                alt="RetailSync headquarters office"
                className="h-36 w-full object-cover"
              />
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              Global Headquarters: New York City, NY
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

export default function ContactSupportPage() {
    const { user } = useAuth();

    const [fullName, setFullName] = useState( user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
    const [email, setEmail] = useState(user?.email || '');
    const [subject, setSubject] = useState('Technical Issue');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()){
          toast.error('Please fill in all required fields');
          return;
        }

        setSubmitting(true);

        try {
          const result = await createContactMessage({
            fullName: fullName.trim(),
            email: email.trim(),
            subject,
            message: message.trim(),
          });

          toast.success(`Message ${result.messageId} submitted successfully!`);
          setMessage('');
        }catch(err) {
          toast.error(err.message || 'Failed to submit message');
        }finally {
          setSubmitting(false);
        }
    };
    
    return (
    <div>
        <PageHeader title="Get in Touch" description="Get in touch with our support team"/>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7">
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Send us a Message</CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                            <label htmlFor='fullName' className={labelClassName}>
                                Full Name
                            </label>
                            <input id='fullName' type='text' value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Jayani User' className={inputClassName} />
                        </div>

                        <div>
                            <label htmlFor='email' className={labelClassName}>
                                Email Address
                            </label>
                            <input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='support@jayani.com' className={inputClassName} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='subject' className={labelClassName}>
                            Subject
                        </label>
                        <div className='relative'>
                            <select id='subject' value={subject} onChange={(e) => setSubject(e.target.value)} className={`${inputClassName} appearance-none bg-white pr-8`}>
                                {SUBJECT_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400' />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className={labelClassName}>
                            Detailed Message
                        </label>
                        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Describe your issue in detail..." className={`${inputClassName} resize-none`}/>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Paperclip size={14} />
                                <span>Max file size: 5MB</span>
                            </div>
                            <Button type="submit" className="gap-2">
                                Send Ticket
                                <Send size={16} />
                            </Button>
                        </div>
                </form>
            </CardContent>
        </Card>
        </div>

        <div className='xl:col-span-5'>
            <SupportInfoPanel />
        </div>
    </div>
    </div>
  );
}