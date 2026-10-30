// Sends raw ESC/POS bytes to a Bluetooth thermal printer straight from the browser.
//
// Two ways to reach the printer (both need Chrome/Edge and https:// or localhost):
//  - 'ble':    Web Bluetooth. For printers that advertise Bluetooth Low Energy
//              (most cheap 58mm printers do). Works on Android and Windows.
//  - 'serial': Web Serial. For a printer paired in Windows Bluetooth settings,
//              which shows up as a COM port ("Standard Serial over Bluetooth link").
// When no printer is connected, callers fall back to the browser print dialog.

// GATT services that common thermal printers use for their write channel.
const PRINTER_SERVICES = [
  0x18f0, 0xff00, 0xffe0, 0xfee7, 0xae30, 0xae3a,
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
];
const CHUNK = 100; // bytes per BLE write; small printers have tiny buffers
const KIND_KEY = 'printer_kind';

let conn = null; // { kind, name, write(bytes), close() }
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(status()));

export const support = {
  ble: typeof navigator !== 'undefined' && !!navigator.bluetooth,
  serial: typeof navigator !== 'undefined' && !!navigator.serial,
};

export function status() {
  return conn ? { connected: true, kind: conn.kind, name: conn.name } : { connected: false };
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const remember = (kind) => { try { localStorage.setItem(KIND_KEY, kind); } catch {} };

// --- Bluetooth Low Energy ---------------------------------------------------
async function findWritable(server) {
  for (const service of await server.getPrimaryServices()) {
    for (const ch of await service.getCharacteristics()) {
      if (ch.properties.write || ch.properties.writeWithoutResponse) return ch;
    }
  }
  throw new Error('This device has no printable channel. Is it the printer?');
}

async function openBle(device) {
  const server = await device.gatt.connect();
  const ch = await findWritable(server);
  device.addEventListener('gattserverdisconnected', () => {
    if (conn?.device === device) { conn = null; notify(); }
  }, { once: true });
  conn = {
    kind: 'ble',
    name: device.name || 'Bluetooth printer',
    device,
    async write(bytes) {
      if (!device.gatt.connected) await device.gatt.connect();
      for (let i = 0; i < bytes.length; i += CHUNK) {
        const part = bytes.slice(i, i + CHUNK);
        if (ch.properties.write) await ch.writeValueWithResponse(part);
        else { await ch.writeValueWithoutResponse(part); await sleep(20); }
      }
    },
    close: () => device.gatt.disconnect(),
  };
  remember('ble');
  notify();
}

export async function connectBluetooth() {
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: PRINTER_SERVICES,
  });
  await openBle(device);
}

// --- Serial (Bluetooth COM port) ------------------------------------------
async function openSerial(port) {
  await port.open({ baudRate: 9600 });
  const writer = port.writable.getWriter();
  const info = port.getInfo?.() || {};
  conn = {
    kind: 'serial',
    name: info.bluetoothServiceClassId ? 'Bluetooth printer (COM)' : 'Serial printer',
    port,
    async write(bytes) { await writer.write(bytes); },
    async close() { writer.releaseLock(); await port.close(); },
  };
  remember('serial');
  notify();
}

export async function connectSerial() {
  const port = await navigator.serial.requestPort();
  await openSerial(port);
}

// --- Common -----------------------------------------------------------------

// Reconnect silently after a page reload to a printer the user already picked.
// Serial ports stay granted; Bluetooth devices only when the browser exposes getDevices().
export async function reconnect() {
  if (conn) return;
  let kind = null;
  try { kind = localStorage.getItem(KIND_KEY); } catch {}
  try {
    if (kind === 'serial' && support.serial) {
      const [port] = await navigator.serial.getPorts();
      if (port) await openSerial(port);
    } else if (kind === 'ble' && navigator.bluetooth?.getDevices) {
      const [device] = await navigator.bluetooth.getDevices();
      if (device) await openBle(device);
    }
  } catch (e) {
    console.warn('Printer reconnect failed', e);
  }
}

export async function disconnect() {
  const c = conn;
  conn = null;
  try { localStorage.removeItem(KIND_KEY); } catch {}
  notify();
  try { await c?.close(); } catch {}
}

export async function printBytes(bytes) {
  if (!conn) throw new Error('No printer connected');
  try {
    await conn.write(bytes);
  } catch (e) {
    // A dropped link leaves a dead connection behind; forget it so the next print falls back cleanly.
    if (conn?.kind === 'ble' && !conn.device.gatt.connected) { conn = null; notify(); }
    throw e;
  }
}
