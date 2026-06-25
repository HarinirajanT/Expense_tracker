import { Link } from 'react-router-dom';
import { RiWallet3Line, RiAddLine, RiExchangeLine } from 'react-icons/ri';
import Button from './Button';

export default function EmptyState({ name }) {
  const steps = [
    { icon: RiWallet3Line, title: 'Create an account', desc: 'Add your bank, wallet, or savings with your real balance.', to: '/accounts', cta: 'Go to Accounts' },
    { icon: RiAddLine, title: 'Record income', desc: 'Deposit salary or add money to your account.', to: '/accounts', cta: 'Add money' },
    { icon: RiExchangeLine, title: 'Log expenses', desc: 'Every coffee, bill, or purchase — track it here.', to: '/transactions', cta: 'Add transaction' },
  ];

  return (
    <div className="card p-8 md:p-12 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-6 text-3xl">
        ₹
      </div>
      <h2 className="text-2xl font-bold mb-2">Welcome{name ? `, ${name}` : ''}!</h2>
      <p className="text-[var(--muted)] mb-8">
        Your dashboard is empty — that&apos;s normal for a new account.
        Follow these steps to start tracking your money.
      </p>
      <div className="space-y-4 text-left mb-8">
        {steps.map(({ icon: Icon, title, desc, to, cta }, i) => (
          <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold flex items-center gap-2">
                <Icon className="text-teal-600" /> {title}
              </p>
              <p className="text-sm text-[var(--muted)] mt-0.5">{desc}</p>
            </div>
            <Link to={to}>
              <Button className="!w-auto !text-xs px-3 py-2 whitespace-nowrap">{cta}</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
