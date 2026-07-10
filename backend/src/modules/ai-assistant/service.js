const mongoose = require('mongoose');
const AIAssistantConversation = require('./model');
const businessAnalyticsService = require('../business-analytics/service');
const aiReorderingService = require('../ai-reordering/service');

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatCurrency = (value = 0) => {
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
};

const formatNumber = (value = 0) => Number(value || 0).toLocaleString('en-US');

const getModuleDetails = async () => ({
  module: 'AI Assistant',
  status: 'Active',
  strategy: 'Rule-based business assistant using analytics and reorder data. No external LLM is required.',
  examples: [
    'What are total sales this month?',
    'Which products are low stock?',
    'What should I reorder?',
    'Which branch is performing best?',
    'Show top products.',
  ],
});

const classifyIntent = (message = '') => {
  const text = message.toLowerCase();

  if (/(reorder|restock|purchase order|buy more|order more)/.test(text)) return 'reordering';
  if (/(low stock|out of stock|inventory health|stock health|dead stock|overstock)/.test(text)) return 'inventory_health';
  if (/(top product|best product|best-selling|best selling|product performance)/.test(text)) return 'top_products';
  if (/(branch|store performance|best branch|location performance)/.test(text)) return 'branch_performance';
  if (/(trend|daily|weekly|monthly|chart|sales over time)/.test(text)) return 'sales_trends';
  if (/(sale|sales|revenue|profit|summary|kpi|business performance|dashboard)/.test(text)) return 'summary';
  if (/(help|what can you do|commands|capabilities)/.test(text)) return 'help';

  return 'general';
};

const createTitle = (message) => {
  const compact = message.replace(/\s+/g, ' ').trim();
  return compact.length > 60 ? `${compact.slice(0, 57)}...` : compact || 'RetailSync Assistant Chat';
};

const getConversation = async ({ conversationId, userId, firstMessage }) => {
  if (conversationId) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw buildError('Invalid conversation ID format');
    }

    const existing = await AIAssistantConversation.findOne({
      _id: conversationId,
      userId,
      status: 'ACTIVE',
    });

    if (!existing) {
      throw buildError('AI assistant conversation not found', 404);
    }

    return existing;
  }

  const conversation = new AIAssistantConversation({
    userId,
    title: createTitle(firstMessage),
    messages: [],
  });

  await conversation.save();
  return conversation;
};

const formatSummaryAnswer = (summary) => {
  const kpis = summary.kpis || {};
  return [
    'Business summary for the selected period:',
    `- Net revenue: ${formatCurrency(kpis.netRevenue)}`,
    `- Gross revenue: ${formatCurrency(kpis.grossRevenue)}`,
    `- Gross profit: ${formatCurrency(kpis.grossProfit)}`,
    `- Total orders: ${formatNumber(kpis.totalOrders)}`,
    `- Average order value: ${formatCurrency(kpis.averageOrderValue)}`,
    `- Low-stock count: ${formatNumber(kpis.lowStockCount)}`,
  ].join('\n');
};

const formatTopProductsAnswer = (result) => {
  const products = result.products || [];
  if (!products.length) {
    return 'I could not find product performance data for the selected period. Create an analytics snapshot first, then ask again.';
  }

  const lines = products.slice(0, 5).map((product, index) => (
    `${index + 1}. ${product.name} (${product.sku}) - ${formatNumber(product.quantitySold)} units, ${formatCurrency(product.revenue)} revenue`
  ));

  return `Top products for the selected period:\n${lines.join('\n')}`;
};

const formatBranchPerformanceAnswer = (result) => {
  const branches = result.branches || [];
  if (!branches.length) {
    return 'I could not find branch performance data for the selected period.';
  }

  const lines = branches.slice(0, 5).map((branch, index) => (
    `${index + 1}. ${branch.branchName} (${branch.branchCode}) - ${formatCurrency(branch.netRevenue)} net revenue, ${formatNumber(branch.orderCount)} orders`
  ));

  return `Branch performance ranking:\n${lines.join('\n')}`;
};

const formatInventoryHealthAnswer = (result) => {
  const overall = result.overall || {};
  const lowStock = result.lowStockProducts || [];
  const outOfStock = result.outOfStockProducts || [];

  const lines = [
    'Inventory health summary:',
    `- Low-stock items: ${formatNumber(overall.lowStockCount)}`,
    `- Out-of-stock items: ${formatNumber(overall.outOfStockCount)}`,
    `- Overstock items: ${formatNumber(overall.overstockCount)}`,
    `- Dead-stock items: ${formatNumber(overall.deadStockCount)}`,
  ];

  if (lowStock.length) {
    lines.push('Most urgent low-stock products:');
    lowStock.slice(0, 5).forEach((product, index) => {
      lines.push(`${index + 1}. ${product.name} (${product.sku}) - current ${product.currentStock}, reorder level ${product.reorderLevel}`);
    });
  } else if (outOfStock.length) {
    lines.push('Out-of-stock products:');
    outOfStock.slice(0, 5).forEach((product, index) => {
      lines.push(`${index + 1}. ${product.name} (${product.sku})`);
    });
  }

  return lines.join('\n');
};

const formatSalesTrendsAnswer = (result) => {
  const trends = result.trends || [];
  if (!trends.length) {
    return 'I could not find sales trend data for the selected period.';
  }

  const latest = trends[trends.length - 1];
  const best = [...trends].sort((a, b) => b.netRevenue - a.netRevenue)[0];

  return [
    `Sales trends are grouped by ${result.period}.`,
    `- Latest period (${latest.period}): ${formatCurrency(latest.netRevenue)} net revenue from ${formatNumber(latest.orderCount)} orders`,
    `- Best period (${best.period}): ${formatCurrency(best.netRevenue)} net revenue`,
    `- Data points found: ${formatNumber(trends.length)}`,
  ].join('\n');
};

const formatReorderingAnswer = (result) => {
  const recommendations = result.recommendations || [];
  if (!recommendations.length) {
    return 'I could not find pending reorder recommendations. Run the AI Reordering generate endpoint after creating analytics snapshots, then ask again.';
  }

  const lines = recommendations.slice(0, 5).map((rec, index) => (
    `${index + 1}. ${rec.productName} (${rec.sku}) - reorder ${rec.recommendedQuantity} units, urgency ${rec.urgency}, confidence ${rec.confidenceScore}%`
  ));

  return `Current reorder recommendations:\n${lines.join('\n')}`;
};

const buildAssistantAnswer = async (intent, filters) => {
  if (intent === 'summary') {
    const data = await businessAnalyticsService.getSummary(filters);
    return { answer: formatSummaryAnswer(data), contextUsed: ['business-analytics.summary'], data };
  }

  if (intent === 'sales_trends') {
    const data = await businessAnalyticsService.getSalesTrends(filters);
    return { answer: formatSalesTrendsAnswer(data), contextUsed: ['business-analytics.sales-trends'], data };
  }

  if (intent === 'top_products') {
    const data = await businessAnalyticsService.getTopProducts({ ...filters, limit: filters.limit || 5 });
    return { answer: formatTopProductsAnswer(data), contextUsed: ['business-analytics.top-products'], data };
  }

  if (intent === 'branch_performance') {
    const data = await businessAnalyticsService.getBranchPerformance(filters);
    return { answer: formatBranchPerformanceAnswer(data), contextUsed: ['business-analytics.branch-performance'], data };
  }

  if (intent === 'inventory_health') {
    const data = await businessAnalyticsService.getInventoryHealth({ ...filters, limit: filters.limit || 5 });
    return { answer: formatInventoryHealthAnswer(data), contextUsed: ['business-analytics.inventory-health'], data };
  }

  if (intent === 'reordering') {
    const data = await aiReorderingService.getRecommendations({
      ...filters,
      status: 'PENDING',
      limit: filters.limit || 5,
    });
    return { answer: formatReorderingAnswer(data), contextUsed: ['ai-reordering.recommendations'], data };
  }

  if (intent === 'help') {
    return {
      answer: [
        'I can help with these RetailSync backend questions:',
        '- Sales and revenue summaries',
        '- Sales trends',
        '- Top-selling products',
        '- Branch performance',
        '- Inventory health and low-stock items',
        '- Reorder recommendations',
      ].join('\n'),
      contextUsed: ['assistant.capabilities'],
      data: {},
    };
  }

  return {
    answer: 'I can help with sales summaries, trends, top products, branch performance, inventory health, and reorder recommendations. Try asking: "What should I reorder?" or "Show me business performance."',
    contextUsed: ['assistant.fallback'],
    data: {},
  };
};

const chat = async ({ message, conversationId, filters = {} }, userId) => {
  const conversation = await getConversation({ conversationId, userId, firstMessage: message });
  const intent = classifyIntent(message);
  const assistantResult = await buildAssistantAnswer(intent, filters);

  conversation.messages.push({
    role: 'user',
    content: message,
    intent,
  });
  conversation.messages.push({
    role: 'assistant',
    content: assistantResult.answer,
    intent,
    metadata: {
      contextUsed: assistantResult.contextUsed,
    },
  });
  conversation.lastIntent = intent;
  conversation.contextUsed = Array.from(new Set([
    ...(conversation.contextUsed || []),
    ...assistantResult.contextUsed,
  ]));

  await conversation.save();

  return {
    conversationId: conversation._id,
    intent,
    answer: assistantResult.answer,
    contextUsed: assistantResult.contextUsed,
    conversation,
  };
};

const getHistory = async (userId, filters = {}) => {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 10);
  const skip = (page - 1) * limit;
  const query = {
    userId,
    status: filters.status || 'ACTIVE',
  };

  const [conversations, total] = await Promise.all([
    AIAssistantConversation.find(query)
      .select('title status lastIntent contextUsed messages updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AIAssistantConversation.countDocuments(query),
  ]);

  return {
    conversations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getConversationById = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError('Invalid conversation ID format');
  }

  const conversation = await AIAssistantConversation.findOne({ _id: id, userId });
  if (!conversation) {
    throw buildError('AI assistant conversation not found', 404);
  }

  return conversation;
};

const deleteConversation = async (id, userId) => {
  const conversation = await getConversationById(id, userId);
  await conversation.deleteOne();
  return { deleted: true, id };
};

module.exports = {
  getModuleDetails,
  chat,
  getHistory,
  getConversationById,
  deleteConversation,
};
