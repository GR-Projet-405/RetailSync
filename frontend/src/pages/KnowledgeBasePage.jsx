import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { BookOpen, Settings2, CreditCard, GitBranch, Zap, Search, X } from 'lucide-react';

const knowledgeBaseData = {
  'Getting Started': {
    icon: <BookOpen className="w-6 h-6 text-sky-600" />,
    count: 6,
    articles: [
      {
        title: 'Welcome to RetailSync',
        readTime: '4 min read',
        tags: ['START HERE', 'OVERVIEW'],
        summary: 'Get familiar with the RetailSync workspace, modules, and how the system supports retail operations.',
        sections: [
          {
            heading: 'Overview',
            body: 'RetailSync is designed for multi-branch retail operations with POS, inventory, reporting, and user management in one system.',
          },
          {
            heading: 'What to do first',
            body: 'Sign in, select your branch, review the dashboard, and explore POS, products, and inventory modules.',
          },
          {
            heading: 'Tip',
            body: 'Start with the branch and product setup before processing your first transaction.',
          },
        ],
      },
      {
        title: 'First Login Guide',
        readTime: '3 min read',
        tags: ['LOGIN', 'SETUP'],
        summary: 'Learn how to access your account and verify your role, branch, and permissions after login.',
        sections: [
          { heading: 'Steps', body: 'Open the login page, enter your credentials, and confirm the correct branch is selected.' },
          { heading: 'If you cannot sign in', body: 'Check your password, role assignment, or ask an administrator to reset your account.' },
        ],
      },
      {
        title: 'Creating Your First Branch',
        readTime: '5 min read',
        tags: ['BRANCHES'],
        summary: 'Set up a new branch so inventory, sales, and reports can be tracked separately.',
        sections: [
          { heading: 'Steps', body: 'Go to Branch Management, choose Add Branch, enter branch details, and save.' },
          { heading: 'Best practice', body: 'Keep branch names consistent with your business locations to simplify reporting.' },
        ],
      },
      {
        title: 'Adding Your First Product',
        readTime: '4 min read',
        tags: ['PRODUCTS', 'INVENTORY'],
        summary: 'Create product records so they can be used in POS sales and inventory tracking.',
        sections: [
          { heading: 'Steps', body: 'Open Products, enter name, barcode, category, price, and stock information, then save.' },
          { heading: 'Tip', body: 'Use consistent product codes and barcodes to reduce checkout errors.' },
        ],
      },
      {
        title: 'Processing Your First Sale',
        readTime: '3 min read',
        tags: ['POS', 'SALES'],
        summary: 'Process a customer purchase from scanning items to completing payment and printing the receipt.',
        sections: [
          { heading: 'Steps', body: 'Open POS, scan or search products, review the cart, apply discounts if needed, and complete payment.' },
          { heading: 'Result', body: 'The sale is recorded and stock updates automatically after the transaction completes.' },
        ],
      },
      {
        title: 'Understanding the Dashboard',
        readTime: '3 min read',
        tags: ['OVERVIEW'],
        summary: 'Learn how to read the main dashboard cards, alerts, and store performance summaries.',
        sections: [
          { heading: 'Overview', body: 'The dashboard shows sales activity, notifications, stock alerts, and quick access to operational modules.' },
          { heading: 'Tip', body: 'Use the dashboard first thing each day to check for low stock or pending tasks.' },
        ],
      },
    ],
  },
  'Account Setup': {
    icon: <Settings2 className="w-6 h-6 text-emerald-600" />,
    count: 6,
    articles: [
      {
        title: 'Creating User Accounts',
        readTime: '4 min read',
        tags: ['USERS'],
        summary: 'Create staff accounts and assign them to the correct branch and role.',
        sections: [
          { heading: 'Steps', body: 'Open User Management, add the user, assign the role, and save the account.' },
          { heading: 'Tip', body: 'Assign only the access needed for the user’s responsibilities.' },
        ],
      },
      {
        title: 'Managing Roles & Permissions',
        readTime: '5 min read',
        tags: ['ACCESS CONTROL'],
        summary: 'Control what each user can view and do across the system.',
        sections: [
          { heading: 'What roles do', body: 'Roles define access to POS, inventory, reports, administration, and other modules.' },
          { heading: 'Best practice', body: 'Use branch manager, cashier, inventory manager, and admin roles as needed.' },
        ],
      },
      {
        title: 'Resetting Your Password',
        readTime: '2 min read',
        tags: ['PASSWORD'],
        summary: 'Recover access when a staff member forgets their password.',
        sections: [
          { heading: 'Steps', body: 'Go to User Management, open the account, and set a new password or send reset instructions.' },
        ],
      },
      {
        title: 'Configuring Company Information',
        readTime: '4 min read',
        tags: ['SETTINGS'],
        summary: 'Set up business name, contact info, and branding details used across the app and receipts.',
        sections: [
          { heading: 'Steps', body: 'Open Settings, update company details, and save the branding information.' },
        ],
      },
      {
        title: 'Setting Up Branch Managers',
        readTime: '4 min read',
        tags: ['BRANCH', 'ROLES'],
        summary: 'Assign branch-level responsibility to the right staff member.',
        sections: [
          { heading: 'Steps', body: 'Create the user, assign the branch manager role, and link the account to the target branch.' },
          { heading: 'Tip', body: 'Branch managers should have access only to the branches they supervise.' },
        ],
      },
      {
        title: 'Email Verification Guide',
        readTime: '3 min read',
        tags: ['EMAIL'],
        summary: 'Confirm email addresses for account notifications and recovery.',
        sections: [
          { heading: 'Steps', body: 'Verify the inbox, open the verification link, and complete the account activation process.' },
        ],
      },
    ],
  },
  Billing: {
    icon: <CreditCard className="w-6 h-6 text-slate-600" />,
    count: 5,
    articles: [
      {
        title: 'Understanding Sales Transactions',
        readTime: '4 min read',
        tags: ['PAYMENTS'],
        summary: 'Review how each sale is recorded and what payment details are captured.',
        sections: [
          { heading: 'Overview', body: 'Each transaction includes items sold, discounts, payment type, and final totals.' },
        ],
      },
      {
        title: 'Payment Methods',
        readTime: '3 min read',
        tags: ['CASH', 'CARD'],
        summary: 'Learn which payment methods can be used at checkout.',
        sections: [
          { heading: 'Examples', body: 'Cash, card, and other configured payment methods can be supported depending on your setup.' },
        ],
      },
      {
        title: 'Refunds & Returns',
        readTime: '4 min read',
        tags: ['REFUNDS'],
        summary: 'Handle returned products and refunded payments accurately.',
        sections: [
          { heading: 'Workflow', body: 'Open Returns & Refunds, select the sale, confirm items, and process the refund according to policy.' },
        ],
      },
      {
        title: 'Printing Receipts',
        readTime: '2 min read',
        tags: ['RECEIPTS'],
        summary: 'Print or share customer receipts after checkout.',
        sections: [
          { heading: 'Tip', body: 'Confirm printer setup before live transactions to avoid delays at checkout.' },
        ],
      },
      {
        title: 'Applying Discounts',
        readTime: '3 min read',
        tags: ['PROMOTIONS'],
        summary: 'Use approved discounts during checkout to adjust the final sale total.',
        sections: [
          { heading: 'How it works', body: 'Discounts are applied during POS billing according to permissions and active promotion rules.' },
        ],
      },
    ],
  },
  Integrations: {
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    count: 6,
    articles: [
      {
        title: 'Barcode Scanner Setup',
        readTime: '3 min read',
        tags: ['HARDWARE'],
        summary: 'Connect and test barcode scanners for fast checkout and inventory lookup.',
        sections: [
          { heading: 'Steps', body: 'Connect the scanner, verify input mode, and test barcode entry in POS and product search.' },
        ],
      },
      {
        title: 'Receipt Printer Setup',
        readTime: '4 min read',
        tags: ['HARDWARE'],
        summary: 'Prepare printers for in-store receipt printing.',
        sections: [
          { heading: 'Steps', body: 'Install the printer, select the correct driver, and print a test receipt.' },
        ],
      },
      {
        title: 'CSV Product Import',
        readTime: '5 min read',
        tags: ['IMPORT'],
        summary: 'Bulk upload product data using a CSV file.',
        sections: [
          { heading: 'Workflow', body: 'Download the template, fill in product records, validate columns, then import the file.' },
        ],
      },
      {
        title: 'Email Notifications',
        readTime: '3 min read',
        tags: ['EMAIL'],
        summary: 'Configure notifications for users, orders, and system events.',
        sections: [
          { heading: 'Tip', body: 'Use a working SMTP configuration if you want receipts and alerts to be sent by email.' },
        ],
      },
      {
        title: 'Gemini AI Integration',
        readTime: '4 min read',
        tags: ['AI'],
        summary: 'Use AI-assisted insights for stock recommendations and forecasting support.',
        sections: [
          { heading: 'Use case', body: 'AI features can support forecasting, stock alerts, and operational suggestions based on sales patterns.' },
        ],
      },
      {
        title: 'Exporting Reports to PDF and Excel',
        readTime: '4 min read',
        tags: ['EXPORT'],
        summary: 'Share analytics and operational data in common file formats.',
        sections: [
          { heading: 'Workflow', body: 'Open the report, choose export format, and download the file for sharing or archiving.' },
        ],
      },
    ],
  },
  Troubleshooting: {
    icon: <GitBranch className="w-6 h-6 text-rose-600" />,
    count: 6,
    articles: [
      {
        title: 'Unable to Login',
        readTime: '2 min read',
        tags: ['LOGIN'],
        summary: 'Check why a user cannot access the system.',
        sections: [
          { heading: 'Common causes', body: 'Wrong password, expired session, disabled account, or incorrect role assignment.' },
        ],
      },
      {
        title: 'Barcode Scanner Not Working',
        readTime: '3 min read',
        tags: ['HARDWARE'],
        summary: 'Fix scanner input issues in the POS.',
        sections: [
          { heading: 'Check first', body: 'Verify connection, scanner mode, and whether the barcode is configured correctly in the product record.' },
        ],
      },
      {
        title: 'Stock Not Updating',
        readTime: '4 min read',
        tags: ['INVENTORY'],
        summary: 'Investigate why inventory levels do not change after operations.',
        sections: [
          { heading: 'Possible reasons', body: 'Sale not completed, wrong branch selected, or inventory sync issue.' },
        ],
      },
      {
        title: 'Reports Not Loading',
        readTime: '3 min read',
        tags: ['REPORTS'],
        summary: 'Resolve dashboard and reporting display issues.',
        sections: [
          { heading: 'Tip', body: 'Refresh the page, verify permissions, and confirm the backend is connected.' },
        ],
      },
      {
        title: 'Permission Denied',
        readTime: '2 min read',
        tags: ['ACCESS'],
        summary: 'Fix module access errors for restricted users.',
        sections: [
          { heading: 'Check', body: 'Confirm the user role includes access to the requested module and branch.' },
        ],
      },
      {
        title: 'Session Expired',
        readTime: '2 min read',
        tags: ['AUTH'],
        summary: 'Restore access after a login session times out.',
        sections: [
          { heading: 'Action', body: 'Sign in again and refresh the browser if the system logs you out automatically.' },
        ],
      },
    ],
  },
};

const relatedTopics = [
  'API Documentation',
  'User Roles & Permissions',
  'Inventory Management',
  'Purchase Orders',
  'AI Features',
  'Reports & Analytics',
  'Security & Privacy',
  'Multi-Branch Management',
];

const recentArticles = [
  { title: 'Quickstart Guide v1.0', category: 'Getting Started' },
  { title: 'Managing API Keys', category: 'Account Setup' },
];

const CategoryTile = ({ icon, title, count, active, onClick }) => (
  <button type="button" onClick={onClick} className="text-left">
    <Card className={`p-6 flex flex-col items-start justify-center transition border ${active ? 'border-sky-300 ring-2 ring-sky-100' : 'border-[#E2E8F0]'}`}>
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-400 mt-1">{count} Articles</p>
    </Card>
  </button>
);

const ArticleCard = ({ title, summary, tags, readTime, onClick }) => (
  <button type="button" onClick={onClick} className="w-full text-left mb-6">
    <Card className="h-full hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="space-x-2">
            {tags && tags.map((t) => (
              <span key={t} className="inline-block px-2 py-1 text-xs bg-slate-100 rounded">{t}</span>
            ))}
          </div>
          <div>{readTime}</div>
        </div>
      </CardContent>
    </Card>
  </button>
);

const ArticleModal = ({ article, categoryTitle, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 px-4 py-6 flex items-center justify-center bg-white/20 backdrop-blur-md" onClick={onClose}>
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <Card className="p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">{categoryTitle}</div>
              <h2 className="text-2xl font-bold text-slate-900">{article.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{article.summary}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {article.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {article.readTime}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {article.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{section.heading}</h3>
                <p className="text-sm leading-6 text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const KnowledgeBasePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Getting Started');
  const [selectedArticle, setSelectedArticle] = useState(knowledgeBaseData['Getting Started'].articles[0]);
  const [isArticleOpen, setIsArticleOpen] = useState(false);

  const currentCategoryData = knowledgeBaseData[selectedCategory];
  const displayedArticle = selectedArticle ?? currentCategoryData.articles[0];

  const categoryCards = useMemo(() => Object.entries(knowledgeBaseData), []);

  return (
    <div className="space-y-6">
      <header className="pt-2 pb-6 border-b border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            <span className="bg-yellow-300 px-3 py-0.5 rounded-md mr-1">Knowledge</span>
            Base
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Find answers to your questions, explore detailed documentation, and learn how to master RetailSync&apos;s powerful toolset.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categoryCards.map(([title, category]) => (
              <CategoryTile
                key={title}
                icon={category.icon}
                title={title}
                count={category.count}
                active={selectedCategory === title}
                onClick={() => {
                  setSelectedCategory(title);
                  setSelectedArticle(category.articles[0]);
                  setIsArticleOpen(false);
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{selectedCategory} Articles</h3>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Click an article to view details
            </div>
          </div>

          {currentCategoryData.articles.map((article) => (
            <ArticleCard
              key={article.title}
              title={article.title}
              summary={article.summary}
              tags={article.tags}
              readTime={article.readTime}
              onClick={() => {
                setSelectedArticle(article);
                setIsArticleOpen(true);
              }}
            />
          ))}
        </div>

        <aside className="md:col-span-1 space-y-4">
          <Card className="p-6">
            <h4 className="font-semibold mb-2">Related Topics</h4>
            <ul className="text-sm text-slate-600 space-y-2">
              {relatedTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold mb-2">Recently Viewed</h4>
            <div className="text-sm text-slate-600 space-y-3">
              {recentArticles.map((article) => (
                <button
                  key={article.title}
                  type="button"
                  className="w-full text-left p-3 bg-slate-50 rounded hover:bg-slate-100 transition"
                  onClick={() => {
                    setSelectedCategory(article.category);
                    setSelectedArticle(knowledgeBaseData[article.category].articles[0]);
                    setIsArticleOpen(false);
                  }}
                >
                  <div className="font-medium text-slate-800">{article.title}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mt-1">{article.category}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-b from-sky-600 to-sky-700 text-white">
            <h4 className="font-semibold mb-2">Still need help?</h4>
            <p className="text-sm opacity-90">Our support team is available for RetailSync customers who need assistance with POS, inventory, or reporting.</p>
            <div className="mt-4">
              <button className="bg-white text-sky-700 px-4 py-2 rounded">Open a Ticket</button>
            </div>
          </Card>
        </aside>
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {displayedArticle.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">{displayedArticle.title}</h3>
            <p className="text-sm text-slate-600 max-w-2xl">{displayedArticle.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>{displayedArticle.readTime}</span>
              <span>Click any article above to open it in a popup</span>
            </div>
          </div>
          <div className="w-full lg:w-[240px] rounded-2xl bg-slate-100/80 min-h-[120px] flex items-center justify-center text-slate-300">
            <div className="h-14 w-14 rounded-full border-4 border-slate-200 flex items-center justify-center">
              <GitBranch className="h-7 w-7" />
            </div>
          </div>
        </div>
      </Card>

      {isArticleOpen && (
        <ArticleModal
          article={displayedArticle}
          categoryTitle={selectedCategory}
          onClose={() => setIsArticleOpen(false)}
        />
      )}
    </div>
  );
};

export default KnowledgeBasePage;
