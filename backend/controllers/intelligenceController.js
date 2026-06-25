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
} from "../libs/financeEngine.js";
import {
  getNetBalance,
  getUserGoals,
  getUserSubscriptions,
  getUserTransactions,
} from "../libs/helpers.js";
import { pool } from "../libs/database.js";

async function buildIntelligence(userId, firstname) {
  const txs = await getUserTransactions(userId);
  const goals = await getUserGoals(userId);
  const subscriptions = await getUserSubscriptions(userId);
  const snap = computeSnapshot(txs);
  const score = computeHealthScore(txs, goals);
  const wow = weekOverWeekChange(txs);
  const netBalance = await getNetBalance(userId);
  const hasData = txs.length > 0 || netBalance > 0;

  const { rows: accountRows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM tblaccount WHERE user_id = $1`,
    [userId]
  );
  const hasAccounts = accountRows[0]?.c > 0;

  return {
    greeting: getGreeting(),
    name: firstname || "there",
    hasData: hasData || hasAccounts,
    netBalance,
    hero: {
      spendChange: wow.direction,
      spendPct: wow.pct,
      savedThisWeek: wow.saved,
    },
    health: { score, label: healthLabel(score) },
    snapshot: { ...snap, netBalance },
    timeline: groupTimeline(txs).slice(0, 3),
    recentTransactions: txs.slice(0, 5),
    insights: generateInsights(txs).slice(0, 2),
    heatmap: buildHeatmap(txs),
    goals,
    subscriptions,
    subscriptionTotal: subscriptions.reduce((s, x) => s + x.amount, 0),
    chartData: monthlyTrend(txs),
    categoryData: categoryBreakdown(txs),
    savingsGrowth: savingsGrowth(txs),
    allInsights: generateInsights(txs),
  };
}

export const getDashboard = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { rows } = await pool.query(`SELECT firstname FROM tbluser WHERE id = $1`, [userId]);
    const data = await buildIntelligence(userId, rows[0]?.firstname);
    res.status(200).json({ status: "success", ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const getInsights = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const txs = await getUserTransactions(userId);
    res.status(200).json({ status: "success", insights: generateInsights(txs) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const txs = await getUserTransactions(userId);
    res.status(200).json({
      status: "success",
      chartData: monthlyTrend(txs),
      categoryData: categoryBreakdown(txs),
      savingsGrowth: savingsGrowth(txs),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
