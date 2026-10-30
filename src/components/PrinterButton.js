import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  support, status, subscribe, reconnect, connectBluetooth, connectSerial, disconnect, printBytes,
} from '../printer/printer';
import { buildReceipt } from '../printer/escpos';

// Header control for the Bluetooth thermal printer: connect, test print, disconnect.
export default function PrinterButton() {
  const [st, setSt] = useState(status);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const off = subscribe(setSt);
    reconnect();
    return off;
  }, []);

  // Close the menu on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!support.ble && !support.serial) return null; // browser can't talk to printers directly

  const run = async (fn, okMsg) => {
    setOpen(false);
    try {
      await fn();
      if (okMsg) toast.success(okMsg);
    } catch (e) {
      if (e?.name === 'NotFoundError') return; // user closed the device picker
      toast.error('Printer: ' + (e?.message || e));
    }
  };

  const testPrint = () =>
    printBytes(buildReceipt({
      order: { id: 'TEST', created_at: Date.now() },
      items: [{ id: 0, name: 'Printer test', price: 1000, grams: 100 }],
    }));

  const item = 'block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={st.connected ? `Printer: ${st.name}` : 'Connect printer'}
        className="px-2 sm:px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 whitespace-nowrap"
      >
        🖨<span className="hidden sm:inline"> {st.connected ? 'Printer ✓' : 'Connect printer'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-md bg-white shadow-lg border z-50 py-1">
          {st.connected ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 truncate">Connected: {st.name}</div>
              <button className={item} onClick={() => run(testPrint, 'Test page sent')}>Test print</button>
              <button className={item} onClick={() => run(disconnect)}>Disconnect</button>
            </>
          ) : (
            <>
              {support.ble && (
                <button className={item} onClick={() => run(connectBluetooth, 'Printer connected')}>
                  Bluetooth printer
                </button>
              )}
              {support.serial && (
                <button className={item} onClick={() => run(connectSerial, 'Printer connected')}>
                  Paired printer (COM port)
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
