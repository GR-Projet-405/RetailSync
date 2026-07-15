import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Rocket,
  Lock,
  Code2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

const TABS = ['General', 'Billing', 'Account', 'Technical'];

const INFO_CARDS = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'New to Jayani? Learn the basics and set up your first workspace in minutes.',
  },
  {
    icon: Lock,
    title: 'Security & Privacy',
    description: 'Discover how we keep your data secure with enterprise-grade encryption.',
  },
  {
    icon: Code2,
    title: 'API Documentation',
    description: 'Comprehensive guides for integrating Jayani with your existing tech stack.',
  },
];

const FAQS = {
  General: [
    {
      question: 'How do I change my subscription plan?',
      answer:
        "Go to Settings > Billing, select the plan you'd like to switch to, and confirm the change. Your new plan takes effect at the start of the next billing cycle.",
    },
    {
      question: 'Can I export my support history to CSV?',
      answer:
        'Yes. Open Support > Ticket History and click Export CSV in the top right corner to download a full record of your past conversations.',
    },
    {
      question: 'What is the uptime guarantee for the Enterprise tier?',
      answer:
        "Enterprise tier customers are covered by a 99.9% monthly uptime SLA, with service credits available if that threshold isn't met.",
    },
    {
      question: 'How do I reset my API secret keys?',
      answer:
        'Navigate to Settings > API Documentation, select the key you want to rotate, and click Regenerate. The old key stays active for one hour to avoid downtime.',
    },
  ],
  Billing: [
    {
      question: 'When am I billed each month?',
      answer:
        'Invoices are generated on the same calendar day you originally subscribed, and charged to your default payment method automatically.',
    },
    {
      question: 'Can I switch from monthly to annual billing?',
      answer:
        'Yes, from Settings > Billing choose Annual Billing. The switch applies immediately and prorates any remaining balance on your current cycle.',
    },
  ],
  Account: [
    {
      question: 'How do I add a teammate to my workspace?',
      answer:
        "Go to User Management > Invite User, enter their email address, and assign a role. They'll receive an email invite to set up their account.",
    },
    {
      question: 'How do I change the primary branch for my account?',
      answer:
        'Use the branch selector in the top navigation bar and choose Set as Default from the dropdown next to the branch you want.',
    },
  ],
  Technical: [
    {
      question: 'Which browsers are officially supported?',
      answer:
        'RetailOS Pro is fully supported on the latest versions of Chrome, Edge, and Safari. Firefox is supported but some real-time features may be limited.',
    },
    {
      question: 'Is there a sandbox environment for testing integrations?',
      answer:
        'Yes, every workspace includes a free sandbox environment under Settings > API Documentation > Sandbox Keys for safe integration testing.',
    },
  ],
};

function InfoCard({ icon: Icon, title, description }) {
  return (
    <Card hover className="cursor-pointer transition-shadow">
      <CardContent className="p-6 pt-6">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
          <Icon size={20} className="text-blue-600" strokeWidth={1.75} />
        </div>
        <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1.5">{title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border border-[#E2E8F0] rounded-xl bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3 text-[15px] font-medium text-[#0F172A]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          {question}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'text-slate-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 pl-[34px] text-sm text-[#64748B] leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('General');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = FAQS[activeTab];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOpenIndex(0);
  };

  return (
    <div>
      <PageHeader
        title="How can we help you?"
        description="Find quick answers to common questions about RetailSync's platform and services."
      />

      <div className="mt-8 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {INFO_CARDS.map((card) => (
            <InfoCard key={card.title} {...card} />
          ))}
        </div>

        {/* FAQ list */}
        <h2 className="text-xl font-bold text-[#0F172A] mb-4">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3 mb-10">
          {faqs.map((faq, index) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-blue-600 rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white font-semibold mb-0.5">
              Still can't find what you're looking for?
            </p>
            <p className="text-blue-100 text-sm">
              Our expert support team is available 24/7 to help you resolve any issues or answer questions.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {/* TODO: Update path to '/support-tickets' once Support Ticket System page is merged */}
            <Button
              onClick={() => navigate('/help-support')}
              variant="secondary"
              size="md"
              className="!bg-white !text-blue-700 hover:!bg-blue-50"
            >
              Start Chat
            </Button>
            <Button
              onClick={() => window.location.href = 'mailto:support@retailsync.com'}
              variant="outline"
              size="md"
              className="!bg-transparent !border-white/60 !text-white hover:!bg-white/10"
            >
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}