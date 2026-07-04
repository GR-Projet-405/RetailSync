import { useState } from 'react';
import { ChevronDown, Paperclip, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

const SUBJECT_OPTIONS = [
    'Technical Issue',
    'Billing',
    'Account Access',
    'Feature Request',
    'Other',
];

const inputClassName = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

export default function ContactSupportPage() {
    const { user } = useAuth();

    const [fullName, setFullName] = useState( user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
    const [email, setEmail] = useState(user?.email || '');
    const [subject, setSubject] = useState('Technical Issue');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ fullName, email, subject, message });
    };
    
    return (
    <div>
        <PageHeader title="Contact Support" description="Get in touch with our support team"/>

        <Card className="max-w-3x1">
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
  );
}