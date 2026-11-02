import { useState } from 'react';
import { formatLongDate, formatRupiah, parseDateTime, toISODate } from '../lib/format';
import { orderIdOf } from '../lib/status';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import RupiahInput from './RupiahInput';
import { Badge, Field, describedBy } from './ui';

// Sama dengan batas di backend (OrderService.MAX_AMOUNT): paling banyak 13 digit
const MAX_AMOUNT = 9_999_999_999_999;

function amountProblem(value, label) {
  const n = Number(value);
  if (!value || !(n > 0)) return `${label} harus lebih dari 0.`;
  if (n > MAX_AMOUNT) return `${label} terlalu besar. Periksa lagi angkanya.`;
  return '';
}

const amountText = (n) => (Number(n) > 0 ? String(Math.round(Number(n))) : '');

/** Tagihan proyek. Tampil ke klien di samping QRIS sebagai "Total pembayaran". */
function BillForm({ initial, submitLabel, onCancel, onSubmit }) {
  const [bill, setBill] = useState(amountText(initial));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const problem = amountProblem(bill, 'Tagihan');
    setError(problem);
    if (problem) return;
    setBusy(true);
    if (!(await onSubmit(Number(bill)))) setBusy(false);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field
        label="Tagihan (rupiah)"
        htmlFor="q-tagihan"
        hint={bill ? `${formatRupiah(bill)}. Tampil ke klien di samping QRIS.` : 'Total yang dibayar klien lewat QRIS. Tulis angkanya saja.'}
        error={error}
      >
        <RupiahInput id="q-tagihan" value={bill} onChange={setBill} {...describedBy('q-tagihan', { hint: true, error })} />
      </Field>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
          {busy ? 'Menyimpan...' : submitLabel}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
          Batal
        </button>
      </div>
    </form>
  );
}

/** Konfirmasi pembayaran: jumlah dan tanggal sudah terisi, tinggal disimpan. */
function PaymentForm({ inquiry, orderId, onCancel, onSubmit }) {
  const today = toISODate(new Date());
  const bill = Number(inquiry.billAmount) > 0 ? Number(inquiry.billAmount) : null;
  const [amount, setAmount] = useState(amountText(bill));
  const [receivedOn, setReceivedOn] = useState(today);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    const problem = amountProblem(amount, 'Jumlah');
    if (problem) next.amount = problem;
    if (!receivedOn) next.receivedOn = 'Tanggal wajib diisi.';
    else if (receivedOn > today) next.receivedOn = 'Tanggal diterima tidak boleh setelah hari ini.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    if (!(await onSubmit({ amount: Number(amount), receivedOn }))) setBusy(false);
  };

  const amountHint = !amount
    ? 'Tulis angkanya saja.'
    : bill && Number(amount) !== bill
      ? `${formatRupiah(amount)}, berbeda dari tagihan ${formatRupiah(bill)}.`
      : formatRupiah(amount);

  return (
    <form className="form" onSubmit={submit} noValidate>
      <p className="notice notice--info">Pastikan uangnya sudah masuk di aplikasi GoPay Merchant.</p>
      <div className="form__row">
        <Field label="Jumlah diterima (rupiah)" htmlFor="q-jumlah" hint={amountHint} error={errors.amount}>
          <RupiahInput id="q-jumlah" value={amount} onChange={setAmount} {...describedBy('q-jumlah', { hint: true, error: errors.amount })} />
        </Field>
        <Field label="Tanggal diterima" htmlFor="q-tanggal" error={errors.receivedOn}>
          <input
            id="q-tanggal"
            className="input"
            type="date"
            max={today}
            value={receivedOn}
            onChange={(e) => setReceivedOn(e.target.value)}
            {...describedBy('q-tanggal', { error: errors.receivedOn })}
          />
        </Field>
      </div>
      <p className="qris-box__text">
        Tercatat di Keuangan sebagai pemasukan Proyek atas nama {inquiry.name || 'klien ini'}, dengan keterangan &ldquo;Pembayaran QRIS{' '}
        {orderId}&rdquo;.
      </p>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
          {busy ? 'Menyimpan...' : 'Catat pembayaran'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
          Batal
        </button>
      </div>
    </form>
  );
}

/**
 * Pembayaran QRIS di detail pesan (Klien masuk).
 * 1. Tandai proyek selesai sambil mengisi tagihan: klien melihat QRIS dan tagihannya di halaman Contact website.
 * 2. QRIS-nya statis, jadi sistem tidak tahu kapan klien membayar. Setelah uang masuk di GoPay Merchant,
 *    pemegang keuangan menekan "Sudah dibayar", lalu pemasukan tercatat otomatis di Keuangan.
 * onProject(completed, billAmount) dan onPayment(data) mengembalikan true kalau berhasil disimpan.
 */
export default function QrisPayment({ inquiry, canRecordPayment, onProject, onPayment }) {
  const [dialog, setDialog] = useState(null); // 'complete' | 'bill' | 'payment' | 'unpay'
  const [busy, setBusy] = useState(false);
  const orderId = orderIdOf(inquiry);
  if (!orderId) return null;

  const doneAt = parseDateTime(inquiry.projectCompletedAt);
  const paidAt = parseDateTime(inquiry.paidAt);
  const bill = Number(inquiry.billAmount) > 0 ? Number(inquiry.billAmount) : null;
  const close = () => setDialog(null);

  const uncomplete = async () => {
    setBusy(true);
    await onProject(false);
    setBusy(false);
  };

  return (
    <section className="qris-box" aria-labelledby="judul-qris">
      <div className="qris-box__head">
        <h3 id="judul-qris" className="qris-box__title">
          Pembayaran QRIS
        </h3>
        {paidAt ? (
          <Badge tone="good">Lunas</Badge>
        ) : doneAt ? (
          <Badge tone="warn">Menunggu pembayaran</Badge>
        ) : (
          <Badge tone="neutral">Proyek berjalan</Badge>
        )}
      </div>
      <dl className="qris-box__facts">
        <div>
          <dt>ID pesanan</dt>
          <dd className="tabular">{orderId}</dd>
        </div>
        {doneAt && (
          <div>
            <dt>Tagihan</dt>
            <dd className="tabular">{bill ? formatRupiah(bill) : 'Belum diisi'}</dd>
          </div>
        )}
      </dl>

      {paidAt ? (
        <>
          <p className="qris-box__text">
            Pembayaran dikonfirmasi {formatLongDate(paidAt)} dan sudah tercatat di Keuangan. Klien yang mengecek ID ini melihat bahwa
            pembayarannya sudah diterima.
          </p>
          {canRecordPayment && (
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setDialog('unpay')}>
              Batalkan pembayaran
            </button>
          )}
        </>
      ) : doneAt ? (
        <>
          <p className="qris-box__text">
            Ditandai selesai {formatLongDate(doneAt)}. Klien sudah bisa melihat QRIS{bill ? ' dan tagihan ini' : ''} di halaman Contact
            website.{' '}
            {canRecordPayment
              ? 'Setelah uangnya masuk di GoPay Merchant, klik Sudah dibayar.'
              : 'Setelah uangnya masuk, pemegang keuangan mencatat pembayarannya di sini.'}
          </p>
          <div className="qris-box__actions">
            {canRecordPayment && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setDialog('payment')}>
                Sudah dibayar
              </button>
            )}
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setDialog('bill')}>
              {bill ? 'Ubah tagihan' : 'Isi tagihan'}
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={uncomplete} disabled={busy}>
              {busy ? 'Menyimpan...' : 'Batalkan tanda selesai'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="qris-box__text">
            Setelah proyek selesai, tandai di sini sambil mengisi tagihannya. QRIS dan tagihan lalu muncul saat klien mengecek ID ini di
            halaman Contact website.
          </p>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setDialog('complete')}>
            Tandai proyek selesai
          </button>
        </>
      )}

      <Modal
        open={dialog === 'complete' || dialog === 'bill'}
        title={dialog === 'bill' ? (bill ? 'Ubah tagihan' : 'Isi tagihan') : 'Tandai proyek selesai'}
        description={`${inquiry.name || 'Klien'}, ID pesanan ${orderId}`}
        onClose={close}
        size="sm"
      >
        {(dialog === 'complete' || dialog === 'bill') && (
          <BillForm
            initial={bill}
            submitLabel={dialog === 'bill' ? 'Simpan tagihan' : 'Tandai selesai'}
            onCancel={close}
            onSubmit={async (amount) => {
              const ok = await onProject(true, amount);
              if (ok) close();
              return ok;
            }}
          />
        )}
      </Modal>

      <Modal open={dialog === 'payment'} title="Catat pembayaran QRIS" description={`${inquiry.name || 'Klien'}, ID pesanan ${orderId}`} onClose={close} size="sm">
        {dialog === 'payment' && (
          <PaymentForm
            inquiry={inquiry}
            orderId={orderId}
            onCancel={close}
            onSubmit={async (data) => {
              const ok = await onPayment({ paid: true, ...data });
              if (ok) close();
              return ok;
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={dialog === 'unpay'}
        title="Batalkan pembayaran?"
        message="Pemasukan dari pembayaran ini ikut dihapus dari Keuangan, dan QRIS tampil lagi untuk klien."
        confirmLabel="Batalkan pembayaran"
        busyLabel="Membatalkan..."
        onConfirm={async () => {
          if (await onPayment({ paid: false })) close();
        }}
        onClose={close}
      />
    </section>
  );
}
