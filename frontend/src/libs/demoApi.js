import {
  buildHeatmap,
  categoryBreakdown,
  computeHealthScore,
  computeSnapshot,
  generateInsights,
  getGreeting,
  groupTimeline,
  healthLabel,
  monthlyTrend,
  savingsGrowth,
  weekOverWeekChange,
} from './financeEngine';

const STORAGE_KEY = 'finsight_ai_db_v1';

const defaultDb = () => ({
  users: [],
  accounts: [],
  transactions: [],
  goals: [],
  subscriptions: [],
  notifications: [],
  seq: { userId: 1, accountId: 1, txId: 1, goalId: 1, subId: 1, notifId: 1 },
});

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultDb();
  } catch {
    return defaultDb();
  }
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function requireUser(userId) {
  if (!userId) throw { response: { data: { message: 'Unauthorized' } } };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function getUser(userId) {
  return loadDb().users.find((u) => u.id === userId);
}

function userTx(userId) {
  return loadDb().transactions.filter((t) => t.user_id === userId);
}

function netBalance(userId) {
  return loadDb().accounts
    .filter((a) => a.user_id === userId)
    .reduce((s, a) => s + Number(a.account_balance), 0);
}

function pushNotification(userId, title, body, type = 'info') {
  const db = loadDb();
  db.notifications.unshift({
    id: db.seq.notifId++,
    user_id: userId,
    title,
    body,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
}

/** Sample data ONLY for demo@finsight.ai — never for real sign-ups */
function seedDemoData(userId) {
  const db = loadDb();
  if (db.accounts.some((a) => a.user_id === userId)) return;

  const acc1 = db.seq.accountId++;
  db.accounts.push({
    id: acc1,
    user_id: userId,
    account_name: 'Main Wallet',
    account_number: 'WAL-001',
    account_balance: 15000,
    account_type: 'Wallet',
  });

  const txs = [
    { description: 'Salary', source: 'Income', amount: 30000, type: 'income', days: 3 },
    { description: 'Lunch', source: 'Food', amount: 120, type: 'expense', days: 0 },
    { description: 'Uber', source: 'Travel', amount: 350, type: 'expense', days: 0 },
    { description: 'Netflix', source: 'Entertainment', amount: 649, type: 'expense', days: 1 },
  ];

  txs.forEach((t) => {
    db.transactions.push({
      id: db.seq.txId++,
      user_id: userId,
      description: t.description,
      source: t.source,
      amount: t.amount,
      type: t.type,
      status: 'Completed',
      payment_method: 'UPI',
      notes: '',
      createdat: daysAgo(t.days),
    });
  });

  db.goals.push({
    id: db.seq.goalId++,
    user_id: userId,
    name: 'MacBook',
    target: 80000,
    current: 35000,
    target_date: daysFromNow(180),
    icon: '💻',
  });

  db.subscriptions.push(
    { id: db.seq.subId++, user_id: userId, name: 'Netflix', amount: 649, cycle: 'monthly', next_due: daysFromNow(12) },
    { id: db.seq.subId++, user_id: userId, name: 'Spotify', amount: 119, cycle: 'monthly', next_due: daysFromNow(5) }
  );

  const u = db.users.find((x) => x.id === userId);
  if (u) {
    u.onboarded = true;
    u.profile = { monthlyIncome: 30000, currentSavings: 15000, currency: 'INR', goalName: 'MacBook', goalTarget: 80000 };
  }

  saveDb(db);
}

function intelligence(userId, firstname) {
  const db = loadDb();
  const txs = userTx(userId);
  const userGoals = db.goals.filter((g) => g.user_id === userId);
  const userSubs = db.subscriptions.filter((s) => s.user_id === userId);
  const snap = computeSnapshot(txs);
  const score = computeHealthScore(txs, userGoals);
  const wow = weekOverWeekChange(txs);
  const accounts = db.accounts.filter((a) => a.user_id === userId);
  const hasData = txs.length > 0 || accounts.length > 0;

  return {
    greeting: getGreeting(),
    name: firstname || 'there',
    hasData,
    onboarded: db.users.find((u) => u.id === userId)?.onboarded ?? false,
    netBalance: netBalance(userId),
    hero: { spendChange: wow.direction, spendPct: wow.pct, savedThisWeek: wow.saved },
    health: { score, label: healthLabel(score) },
    snapshot: { ...snap, netBalance: netBalance(userId) },
    timeline: groupTimeline(txs).slice(0, 3),
    recentTransactions: [...txs].sort((a, b) => new Date(b.createdat) - new Date(a.createdat)).slice(0, 5),
    insights: generateInsights(txs).slice(0, 2),
    heatmap: buildHeatmap(txs),
    goals: userGoals,
    subscriptions: userSubs,
    subscriptionTotal: userSubs.reduce((s, x) => s + x.amount, 0),
    chartData: monthlyTrend(txs),
    categoryData: categoryBreakdown(txs),
    savingsGrowth: savingsGrowth(txs),
    allInsights: generateInsights(txs),
    notifications: db.notifications.filter((n) => n.user_id === userId).slice(0, 5),
  };
}

export async function demoRequest(method, url, data, token) {
  await new Promise((r) => setTimeout(r, 120));
  let db = loadDb();
  const path = url.replace(/^\/+/, '');
  const userId = token ? JSON.parse(atob(token)).userId : null;
  const user = db.users.find((u) => u.id === userId);

  if (method === 'POST' && path === 'auth/sign-up') {
    if (db.users.find((u) => u.email === data.email)) {
      throw { response: { data: { message: 'Email already exists' } } };
    }
    if (data.password !== data.confirmPassword) {
      throw { response: { data: { message: 'Passwords do not match' } } };
    }
    const u = {
      id: db.seq.userId++,
      firstname: data.firstName,
      email: data.email,
      password: data.password,
      onboarded: false,
      isDemo: false,
      profile: null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(u);
    saveDb(db);
    return { data: { status: 'success', user: { ...u, password: undefined } } };
  }

  if (method === 'POST' && path === 'auth/sign-in') {
    const u = db.users.find((x) => x.email === data.email);
    if (!u || u.password !== data.password) {
      throw { response: { data: { message: 'Invalid email or password' } } };
    }
    return {
      data: {
        status: 'success',
        user: { ...u, password: undefined },
        token: btoa(JSON.stringify({ userId: u.id })),
      },
    };
  }

  if (path === 'user/profile') {
    requireUser(userId);
    return { data: { status: 'success', user: { ...user, password: undefined } } };
  }

  if (method === 'POST' && path === 'user/onboarding') {
    requireUser(userId);
    const u = db.users.find((x) => x.id === userId);
    u.onboarded = true;
    u.profile = {
      monthlyIncome: Number(data.monthlyIncome),
      currentSavings: Number(data.currentSavings),
      currency: data.currency || 'INR',
      goalName: data.goalName,
      goalTarget: Number(data.goalTarget || 0),
    };

    const acc = {
      id: db.seq.accountId++,
      user_id: userId,
      account_name: 'Primary Wallet',
      account_number: 'WAL-001',
      account_balance: Number(data.currentSavings || 0),
      account_type: 'Wallet',
    };
    db.accounts.push(acc);

    if (data.goalName && Number(data.goalTarget) > 0) {
      db.goals.push({
        id: db.seq.goalId++,
        user_id: userId,
        name: data.goalName,
        target: Number(data.goalTarget),
        current: 0,
        target_date: data.targetDate || daysFromNow(365),
        icon: '🎯',
      });
      pushNotification(userId, 'Goal created', `Your "${data.goalName}" goal is ready. Start saving!`, 'success');
    }

    if (Number(data.monthlyIncome) > 0) {
      db.transactions.push({
        id: db.seq.txId++,
        user_id: userId,
        description: 'Monthly Income (Setup)',
        source: 'Income',
        amount: data.monthlyIncome,
        type: 'income',
        status: 'Completed',
        payment_method: 'Bank',
        notes: 'Recorded during onboarding',
        createdat: new Date().toISOString(),
      });
    }

    pushNotification(userId, 'Welcome to FinSight AI', 'Your account is set up. Start tracking expenses!', 'success');
    saveDb(db);
    return { data: { status: 'success', user: { ...u, password: undefined } } };
  }

  if (path === 'intelligence/dashboard') {
    requireUser(userId);
    return { data: { status: 'success', ...intelligence(userId, user?.firstname) } };
  }
  if (path === 'intelligence/insights') {
    requireUser(userId);
    return { data: { status: 'success', insights: generateInsights(userTx(userId)) } };
  }
  if (path === 'intelligence/analytics') {
    requireUser(userId);
    const txs = userTx(userId);
    return {
      data: {
        status: 'success',
        chartData: monthlyTrend(txs),
        categoryData: categoryBreakdown(txs),
        savingsGrowth: savingsGrowth(txs),
      },
    };
  }
  if (path === 'notifications') {
    requireUser(userId);
    return { data: { status: 'success', data: db.notifications.filter((n) => n.user_id === userId) } };
  }
  if (path === 'goals') {
    requireUser(userId);
    return { data: { status: 'success', data: db.goals.filter((g) => g.user_id === userId) } };
  }
  if (path === 'subscriptions') {
    requireUser(userId);
    const subs = db.subscriptions.filter((s) => s.user_id === userId);
    return { data: { status: 'success', data: subs, total: subs.reduce((s, x) => s + x.amount, 0) } };
  }
  if (path === 'transaction/' || path === 'transaction') {
    requireUser(userId);
    return { data: { status: 'success', data: [...userTx(userId)].reverse() } };
  }
  if (path === 'account/' || path === 'account') {
    requireUser(userId);
    return { data: { status: 'success', data: db.accounts.filter((a) => a.user_id === userId) } };
  }

  if (method === 'POST' && path === 'account/create') {
    requireUser(userId);
    db = loadDb();
    const acc = {
      id: db.seq.accountId++,
      user_id: userId,
      account_name: data.name,
      account_number: data.account_number,
      account_balance: Number(data.amount),
      account_type: data.account_type || 'Wallet',
    };
    db.accounts.push(acc);
    if (Number(data.amount) > 0) {
      db.transactions.push({
        id: db.seq.txId++,
        user_id: userId,
        description: `${data.name} (Opening Balance)`,
        type: 'income',
        status: 'Completed',
        amount: data.amount,
        source: data.name,
        payment_method: 'Cash',
        notes: '',
        createdat: new Date().toISOString(),
      });
    }
    saveDb(db);
    return { data: { status: 'success', data: acc } };
  }

  if (method === 'PUT' && path.startsWith('account/add-money/')) {
    requireUser(userId);
    db = loadDb();
    const id = Number(path.split('/').pop());
    const acc = db.accounts.find((a) => a.id === id && a.user_id === userId);
    if (!acc) throw { response: { data: { message: 'Account not found' } } };
    acc.account_balance += Number(data.amount);
    db.transactions.push({
      id: db.seq.txId++,
      user_id: userId,
      description: `${acc.account_name} (Deposit)`,
      type: 'income',
      status: 'Completed',
      amount: data.amount,
      source: acc.account_name,
      payment_method: data.payment_method || 'UPI',
      notes: data.notes || '',
      createdat: new Date().toISOString(),
    });
    saveDb(db);
    return { data: { status: 'success', data: acc } };
  }

  if (method === 'POST' && path.includes('add-transaction/')) {
    requireUser(userId);
    db = loadDb();
    const accountId = Number(path.split('/').pop());
    const acc = db.accounts.find((a) => a.id === accountId && a.user_id === userId);
    if (!acc) throw { response: { data: { message: 'Account not found' } } };
    const amount = Number(data.amount);
    const isIncome = data.type === 'income';
    if (!isIncome && acc.account_balance < amount) {
      throw { response: { data: { message: 'Insufficient balance' } } };
    }
    if (isIncome) acc.account_balance += amount;
    else acc.account_balance -= amount;

    db.transactions.push({
      id: db.seq.txId++,
      user_id: userId,
      description: data.description,
      type: isIncome ? 'income' : 'expense',
      status: 'Completed',
      amount,
      source: data.source,
      payment_method: data.payment_method || 'UPI',
      notes: data.notes || '',
      createdat: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    });
    saveDb(db);
    return { data: { status: 'success' } };
  }

  if (method === 'PUT' && path.startsWith('transaction/')) {
    requireUser(userId);
    db = loadDb();
    const id = Number(path.split('/').pop());
    const tx = db.transactions.find((t) => t.id === id && t.user_id === userId);
    if (!tx) throw { response: { data: { message: 'Transaction not found' } } };
    Object.assign(tx, {
      description: data.description ?? tx.description,
      amount: data.amount != null ? Number(data.amount) : tx.amount,
      source: data.source ?? tx.source,
      payment_method: data.payment_method ?? tx.payment_method,
      notes: data.notes ?? tx.notes,
    });
    saveDb(db);
    return { data: { status: 'success', data: tx } };
  }

  if (method === 'DELETE' && path.startsWith('transaction/')) {
    requireUser(userId);
    db = loadDb();
    const id = Number(path.split('/').pop());
    const idx = db.transactions.findIndex((t) => t.id === id && t.user_id === userId);
    if (idx === -1) throw { response: { data: { message: 'Transaction not found' } } };
    db.transactions.splice(idx, 1);
    saveDb(db);
    return { data: { status: 'success' } };
  }

  if (method === 'POST' && path === 'goals') {
    requireUser(userId);
    db = loadDb();
    const g = {
      id: db.seq.goalId++,
      user_id: userId,
      name: data.name,
      target: Number(data.target),
      current: Number(data.current || 0),
      target_date: data.target_date || daysFromNow(365),
      icon: data.icon || '🎯',
    };
    db.goals.push(g);
    saveDb(db);
    return { data: { status: 'success', data: g } };
  }

  if (method === 'POST' && path === 'subscriptions') {
    requireUser(userId);
    db = loadDb();
    const s = {
      id: db.seq.subId++,
      user_id: userId,
      name: data.name,
      amount: Number(data.amount),
      cycle: data.cycle || 'monthly',
      next_due: data.next_due || daysFromNow(30),
    };
    db.subscriptions.push(s);
    pushNotification(userId, 'Subscription added', `${data.name} — ₹${data.amount}/month`, 'info');
    saveDb(db);
    return { data: { status: 'success', data: s } };
  }

  if (method === 'DELETE' && path.startsWith('subscriptions/')) {
    requireUser(userId);
    db = loadDb();
    const id = Number(path.split('/').pop());
    db.subscriptions = db.subscriptions.filter((s) => !(s.id === id && s.user_id === userId));
    saveDb(db);
    return { data: { status: 'success' } };
  }

  return { data: { status: 'success' } };
}

export const DEMO_USER = {
  email: 'demo@finsight.ai',
  password: 'demo1234',
  firstName: 'Demo',
};

(function ensureDemoAccount() {
  let db = loadDb();
  let demo = db.users.find((u) => u.email === DEMO_USER.email);
  if (!demo) {
    demo = {
      id: db.seq.userId++,
      firstname: DEMO_USER.firstName,
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      onboarded: false,
      isDemo: true,
      profile: null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(demo);
    saveDb(db);
  }
  if (demo.isDemo) seedDemoData(demo.id);
})();
