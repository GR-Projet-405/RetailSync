import PageHeader from '../components/PageHeader';
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const stats = [
  {
    title: 'OPEN TICKETS',
    value: '12',
    note: '+2 today',
    icon: MessageSquare,
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-700',
  },
  {
    title: 'RESOLVED TICKETS',
    value: '1,284',
    note: '+48 total',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'AVG RESPONSE TIME',
    value: '1h 24m',
    note: '-5% vs avg',
    icon: Clock3,
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100 text-violet-700',
  },
];

const quickActions = [
  {
    title: 'View FAQs',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Create Ticket',
    icon: PlusCircle,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Track Status',
    icon: ShieldCheck,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Contact Us',
    icon: PhoneCall,
    color: 'bg-sky-100 text-sky-700',
  },
];

const articles = [
  {
    title: 'How to reset your account password and MFA',
    summary: 'Step-by-step guide on security recovery protocols.',
  },
  {
    title: 'Understanding your monthly billing statement',
    summary: 'Deep dive into taxes, credits, and usage-based tiers.',
  },
  {
    title: 'Integrating Jayani with your existing CRM',
    summary: 'API documentation and third-party connector setup.',
  },
];

const activity = [
  {
    title: 'Support agent replied to Ticket #4923',
    time: '24 minutes ago',
    status: 'success',
  },
  {
    title: 'Ticket #4811 was marked as resolved',
    time: '2 hours ago',
    status: 'success',
  },
  {
    title: 'You viewed "API Rate Limits"',
    time: '5 hours ago',
    status: 'info',
  },
  {
    title: 'New ticket created: "Webhook timeout"',
    time: 'Yesterday, 4:15 PM',
    status: 'info',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="How can we help you today?"
        description="Find answers, manage your tickets, or chat with our experts."
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className={`rounded-3xl border border-slate-200 ${stat.bg} p-5 shadow-sm`}> 
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">{stat.title}</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{stat.note}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${action.color}`}> 
                    <ActionIcon className="h-5 w-5" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Quick access to common help center actions.</p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-slate-500 group-hover:text-slate-700">
                    Continue <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.24em]">Popular help articles</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Popular help articles</h2>
              </div>
              <button type="button" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                View all knowledge base
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {articles.map((article) => (
                <article key={article.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-200 hover:border-slate-300 hover:bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                      <p className="text-sm text-slate-500">{article.summary}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.24em]">Recent activity</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Recent activity</h2>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {activity.map((item, index) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className={`mt-1 h-3.5 w-3.5 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-lg">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Need urgent help?</p>
                <h2 className="mt-2 text-2xl font-semibold">Our team is online.</h2>
              </div>
              <p className="text-sm text-slate-300">Chat with our support team anytime for urgent ticket updates, account help, or integration support.</p>
              <button type="button" className="inline-flex items-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white">
                Chat Now
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

