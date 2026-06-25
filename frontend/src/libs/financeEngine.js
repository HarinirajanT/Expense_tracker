const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export function computeSnapshot(txs) {
  const now = new Date();
  const monthTx = txs.filter((t) => {
    const d = new Date(t.createdat);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expenses = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  return { income, expenses, savings, savingsRate };
}

export function computeHealthScore(txs, goals) {
  const snap = computeSnapshot(txs);
  let score = 50;
  if (snap.savingsRate >= 30) score += 25;
  else if (snap.savingsRate >= 15) score += 15;
  else if (snap.savingsRate >= 5) score += 5;

  const expenseRatio = snap.income > 0 ? snap.expenses / snap.income : 1;
  if (expenseRatio < 0.6) score += 15;
  else if (expenseRatio < 0.8) score += 8;

  const goalProgress = goals.length
    ? goals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / goals.length
    : 0;
  score += Math.round(goalProgress * 10);

  return Math.min(100, Math.max(0, score));
}

export function healthLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

export function generateInsights(txs) {
  const insights = [];
  const food = txs.filter((t) => t.type === 'expense' && /food|lunch|dinner|grocer|swiggy|zomato/i.test(`${t.source} ${t.description}`));
  const weekend = food.filter((t) => [0, 6].includes(new Date(t.createdat).getDay()));
  const weekday = food.filter((t) => ![0, 6].includes(new Date(t.createdat).getDay()));
  const weekendAvg = weekend.length ? weekend.reduce((s, t) => s + Number(t.amount), 0) / Math.max(weekend.length, 1) : 0;
  const weekdayAvg = weekday.length ? weekday.reduce((s, t) => s + Number(t.amount), 0) / Math.max(weekday.length, 1) : 0;

  if (weekendAvg > weekdayAvg * 1.1 && food.length > 2) {
    const pct = Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) || 27;
    insights.push({
      id: 'food-weekend',
      title: 'Weekend Food Spending',
      body: `You spend ${pct}% more on food during weekends.`,
      savings: `Potential savings: ${formatINR(Math.round(weekendAvg * 4))}/month.`,
      type: 'warning',
    });
  }

  const subs = txs.filter((t) => /netflix|spotify|youtube|subscription/i.test(t.description));
  if (subs.length) {
    const total = subs.reduce((s, t) => s + Number(t.amount), 0);
    insights.push({
      id: 'subs',
      title: 'Subscription Spend',
      body: `You have ${subs.length} recurring charges totalling ${formatINR(total)}/month.`,
      savings: 'Review unused subscriptions to cut costs.',
      type: 'info',
    });
  }

  const snap = computeSnapshot(txs);
  if (snap.savingsRate >= 20) {
    insights.push({
      id: 'savings',
      title: 'Strong Savings Habit',
      body: `Your savings rate is ${snap.savingsRate}% this month — above the recommended 20%.`,
      savings: `Projected month-end savings: ${formatINR(snap.savings)}.`,
      type: 'success',
    });
  }

  const transport = txs.filter((t) => t.type === 'expense' && /uber|ola|transport|fuel/i.test(`${t.source} ${t.description}`));
  if (transport.length >= 3) {
    const total = transport.reduce((s, t) => s + Number(t.amount), 0);
    insights.push({
      id: 'transport',
      title: 'Transport Costs Rising',
      body: `${transport.length} transport expenses totalling ${formatINR(total)} this month.`,
      savings: 'Consider metro passes or carpooling to save ~15%.',
      type: 'warning',
    });
  }

  if (!insights.length) {
    insights.push({
      id: 'default',
      title: 'Getting Started',
      body: 'Add more transactions to unlock personalized spending insights.',
      savings: 'Track daily expenses for smarter recommendations.',
      type: 'info',
    });
  }

  return insights;
}

export function buildHeatmap(txs) {
  const weeks = 12;
  const days = weeks * 7;
  const grid = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayTx = txs.filter((t) => {
      const td = new Date(t.createdat);
      return t.type === 'expense' && td.toDateString() === d.toDateString();
    });
    const total = dayTx.reduce((s, t) => s + Number(t.amount), 0);
    grid.push({ date: d.toISOString(), amount: total, level: total === 0 ? 0 : total < 300 ? 1 : total < 800 ? 2 : total < 1500 ? 3 : 4 });
  }
  return grid;
}

export function groupTimeline(txs) {
  const sorted = [...txs].sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
  const groups = {};
  sorted.forEach((t) => {
    const d = new Date(t.createdat);
    const key = d.toDateString() === new Date().toDateString() ? 'Today' : d.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export function categoryBreakdown(txs) {
  const map = {};
  txs.filter((t) => t.type === 'expense').forEach((t) => {
    map[t.source] = (map[t.source] || 0) + Number(t.amount);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function monthlyTrend(txs) {
  const year = new Date().getFullYear();
  return months.map((label, i) => {
    const m = txs.filter((t) => {
      const d = new Date(t.createdat);
      return d.getFullYear() === year && d.getMonth() === i;
    });
    return {
      label,
      income: m.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expense: m.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    };
  });
}

export function savingsGrowth(txs) {
  let running = 0;
  return months.map((label, i) => {
    const m = txs.filter((t) => new Date(t.createdat).getMonth() === i);
    const inc = m.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = m.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    running += inc - exp;
    return { label, savings: Math.max(0, running) };
  });
}

export function weekOverWeekChange(txs) {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  const twoWeeks = new Date(now - 14 * 86400000);
  const thisWeek = txs.filter((t) => t.type === 'expense' && new Date(t.createdat) >= weekAgo).reduce((s, t) => s + Number(t.amount), 0);
  const lastWeek = txs.filter((t) => {
    const d = new Date(t.createdat);
    return t.type === 'expense' && d >= twoWeeks && d < weekAgo;
  }).reduce((s, t) => s + Number(t.amount), 0);
  if (!lastWeek) return { pct: 0, saved: 0, direction: 'same' };
  const pct = Math.round(((lastWeek - thisWeek) / lastWeek) * 100);
  return { pct: Math.abs(pct), saved: Math.max(0, lastWeek - thisWeek), direction: pct > 0 ? 'less' : pct < 0 ? 'more' : 'same' };
}
