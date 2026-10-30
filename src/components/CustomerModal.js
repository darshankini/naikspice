import { useState } from 'react';
import { money } from './Layout';

// Post-checkout dialog. The order is already saved; this only collects optional
// customer details. "Skip & Print" prints without details; "Save & Print" saves
// the details first. Responsive: centered card on desktop, bottom sheet on mobile.
export default function CustomerModal({ order, total, onSkip, onSubmit, saving }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMode,setPaymentMode] = useState('');
  const [cash,setCash] = useState('');
  const [online,setOnline] = useState('');
  const [error, setError] = useState('');

  const paymentModes = ['Cash','Online','Split'];
  

  const submit = (e) => {
    e.preventDefault();
    const digits = mobile.replace(/\D/g, '');
    if (digits && digits.length !== 10) return setError('Mobile must be 10 digits.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email.');
    setError('');
    onSubmit({ name: name.trim(), mobile: digits, email: email.trim(),cash:cash,online:online,order:order,total:total });
  };

  const field =
    'mt-1 w-full rounded-md border px-3 py-2 outline-none focus:border-brand text-base';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <form
        onSubmit={submit}
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-xl shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <h2 className="text-lg font-bold">Customer details</h2>
          <p className="text-sm text-gray-500">
            Order #{order?.id} · {money(total)} — optional, you can skip.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>
        )}

        <label className="block">
          <span className="text-sm text-gray-600">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className={field} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Mobile</span>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="string"
            placeholder="darshan@gmail.com"
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Payment Mode</span>
          <select onChange={(e) => setPaymentMode(e.target.value)} className={field} value={paymentMode}>
            <option value="">Please Select Payment Mode</option>
            {paymentModes.map((pm) => (
              <option value={pm} key={pm}>{pm}</option>
            ))}
          </select>
        </label>

        {paymentMode && (paymentMode.toLowerCase() === 'cash' || paymentMode.toLowerCase() === 'split') && (<label className="block">
          <span className="text-sm text-gray-600">Cash</span>
          <input
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            type="number"
            placeholder=""
            className={field}
          />
        </label>)}

        {paymentMode && (paymentMode.toLowerCase() === 'online' || paymentMode.toLowerCase() === 'split') && (<label className="block">
          <span className="text-sm text-gray-600">Online</span>
          <input
            value={online}
            onChange={(e) => setOnline(e.target.value)}
            type="number"
            inputMode="number"
            placeholder=""
            className={field}
          />
        </label>)}
        

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="py-2.5 rounded-md bg-gray-200 hover:bg-gray-300 font-medium disabled:opacity-40"
          >
            Skip &amp; Print
          </button>
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 rounded-md bg-brand hover:bg-brand-dark text-white font-semibold disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save & Print'}
          </button>
        </div>
      </form>
    </div>
  );
}
