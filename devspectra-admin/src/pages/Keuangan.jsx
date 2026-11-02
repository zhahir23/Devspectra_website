import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { incomesApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import BarChart from '../components/BarChart';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import RupiahInput from '../components/RupiahInput';
import { useToast } from '../components/Toast';
import { AccessRestricted, Badge, EmptyState, ErrorState, FeaturePending, Field, Loading, Segmented, StatGrid, StatTile, describedBy } from '../components/ui';
import { queries } from '../data/queries';
import { refetchQuery, scopedKey } from '../data/queryCache';
import { useTeam } from '../data/TeamContext';
import { asList, useApi } from '../hooks/useApi';
import { downloadBlob, incomesToCsv, incomesToXlsx } from '../lib/exportIncomes';
import {
  formatDayMonth,
  formatMonth,
  formatMonthShort,
  formatMonthYear,
  formatNumber,
  formatRupiah,
  formatRupiahShort,
  parseDateTime,
  percentChange,
  toISODate,
  toISOMonth,
} from '../lib/format';
import { INCOME_CATEGORIES, incomeCategoryLabel } from '../lib/status';

const ENDPOINTS = ['GET /api/incomes', 'POST /api/incomes', 'PUT /api/incomes/{id}', 'DELETE /api/incomes/{id}'];

const monthStart = (iso) => {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m - 1, 1);
};

const sumAmount = (rows) => rows.reduce((t, i) => t + (Number(i.amount) || 0), 0);

/**
 * Export pemasukan: pilih periode (bulan yang sedang dilihat, setahun, atau semua) dan format.
 * Excel (.xlsx) untuk Microsoft Excel, lengkap dengan baris Total. CSV untuk Google Sheets atau aplikasi lain.
 */
function ExportForm({ incomes, month, nameOf, onCancel, onDone }) {
  const selectedDate = monthStart(month);
  const year = selectedDate.getFullYear();
  const [scope, setScope] = useState('month');
  const [format, setFormat] = useState('xlsx');

  const scopes = [
    { value: 'month', label: formatMonthYear(selectedDate), file: `pemasukan-devspectra-${month}` },
    { value: 'year', label: `Tahun ${year}`, file: `pemasukan-devspectra-${year}` },
    { value: 'all', label: 'Semua data', file: 'pemasukan-devspectra-semua' },
  ];
  const chosen = scopes.find((o) => o.value === scope);
  const rows = incomes.filter((i) => {
    const date = String(i.receivedOn || '');
    if (scope === 'month') return date.startsWith(`${month}-`);
    if (scope === 'year') return date.startsWith(`${year}-`);
    return true;
  });

  const download = () => {
    const blob = format === 'xlsx' ? incomesToXlsx(rows, { sheet: chosen.label, nameOf }) : incomesToCsv(rows, { nameOf });
    downloadBlob(blob, `${chosen.file}.${format}`);
    onDone(`File ${format === 'xlsx' ? 'Excel' : 'CSV'} diunduh: ${formatNumber(rows.length)} transaksi, ${chosen.label}.`);
  };

  return (
    <div className="form">
      <fieldset className="checkbox-group">
        <legend className="field__label">Periode</legend>
        {scopes.map((o) => (
          <label key={o.value} className="checkbox">
            <input type="radio" name="export-periode" value={o.value} checked={scope === o.value} onChange={() => setScope(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="checkbox-group">
        <legend className="field__label">Format</legend>
        <label className="checkbox checkbox--top">
          <input type="radio" name="export-format" value="xlsx" checked={format === 'xlsx'} onChange={() => setFormat('xlsx')} />
          <span className="checkbox__text">
            <span>Excel (.xlsx)</span>
            <span className="checkbox__hint">Untuk Microsoft Excel. Ada baris Total di bawahnya.</span>
          </span>
        </label>
        <label className="checkbox checkbox--top">
          <input type="radio" name="export-format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
          <span className="checkbox__text">
            <span>CSV</span>
            <span className="checkbox__hint">Untuk Google Sheets atau aplikasi lain.</span>
          </span>
        </label>
      </fieldset>
      <p className="export-summary" role="status">
        {rows.length ? `${formatNumber(rows.length)} transaksi, total ${formatRupiah(sumAmount(rows))}.` : 'Tidak ada pemasukan di periode ini.'}
      </p>
      <div className="form__actions">
        <button type="button" className="btn btn--primary btn--grow" onClick={download} disabled={!rows.length}>
          <Download size={18} aria-hidden="true" />
          <span>Unduh file</span>
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Batal
        </button>
      </div>
    </div>
  );
}

function IncomeForm({ income, onCancel, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    receivedOn: income?.receivedOn || toISODate(new Date()),
    description: income?.description || '',
    clientName: income?.clientName || '',
    category: income?.category || 'PROYEK',
    amount: income?.amount ? String(Math.round(Number(income.amount))) : '',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.receivedOn) next.receivedOn = 'Tanggal wajib diisi.';
    if (!form.description.trim()) next.description = 'Keterangan wajib diisi.';
    if (!(Number(form.amount) > 0)) next.amount = 'Jumlah harus lebih dari 0.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const payload = {
      receivedOn: form.receivedOn,
      description: form.description.trim(),
      clientName: form.clientName.trim() || null,
      category: form.category,
      amount: Number(form.amount),
    };
    try {
      if (income) await incomesApi.update(income.id, payload);
      else await incomesApi.create(payload);
      toast.success(income ? 'Pemasukan diperbarui.' : 'Pemasukan ditambahkan.');
      onSaved(payload.receivedOn);
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <form id="form-pemasukan" className="form" onSubmit={submit} noValidate>
      <div className="form__row">
        <Field label="Tanggal diterima" htmlFor="p-tanggal" error={errors.receivedOn}>
          <input id="p-tanggal" className="input" type="date" value={form.receivedOn} onChange={set('receivedOn')} {...describedBy('p-tanggal', { error: errors.receivedOn })} />
        </Field>
        <Field label="Kategori" htmlFor="p-kategori">
          <select id="p-kategori" className="input" value={form.category} onChange={set('category')}>
            {INCOME_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Keterangan" htmlFor="p-ket" hint="Contoh: DP website company profile" error={errors.description}>
        <input id="p-ket" className="input" value={form.description} onChange={set('description')} maxLength={200} {...describedBy('p-ket', { hint: true, error: errors.description })} />
      </Field>
      <Field label="Nama klien" htmlFor="p-klien">
        <input id="p-klien" className="input" value={form.clientName} onChange={set('clientName')} maxLength={150} />
      </Field>
      <Field label="Jumlah (rupiah)" htmlFor="p-jumlah" hint={form.amount ? formatRupiah(form.amount) : 'Tulis angkanya saja, tanpa titik.'} error={errors.amount}>
        <RupiahInput
          id="p-jumlah"
          value={form.amount}
          onChange={(amount) => setForm((f) => ({ ...f, amount }))}
          {...describedBy('p-jumlah', { hint: true, error: errors.amount })}
        />
      </Field>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
          {busy ? 'Menyimpan...' : income ? 'Simpan perubahan' : 'Simpan pemasukan'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
          Batal
        </button>
      </div>
    </form>
  );
}

export default function Keuangan() {
  const toast = useToast();
  const { email } = useAuth();
  const { nameOf } = useTeam();
  const { data, error, loading, reload } = useApi(queries.incomes());
  const [month, setMonth] = useState(toISOMonth(new Date()));
  const [view, setView] = useState('grafik');
  const [editing, setEditing] = useState(null); // { income } atau { income: null } untuk baru
  const [toDelete, setToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);

  const all = asList(data);
  const inMonth = (iso) => all.filter((i) => String(i.receivedOn || '').startsWith(iso));
  const sum = sumAmount;

  const selectedDate = monthStart(month);
  const prevDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const rows = useMemo(
    () =>
      inMonth(month).sort(
        (a, b) => (parseDateTime(b.receivedOn)?.getTime() || 0) - (parseDateTime(a.receivedOn)?.getTime() || 0),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, month],
  );
  const total = sum(rows);
  const prevTotal = sum(inMonth(toISOMonth(prevDate)));
  const delta = percentChange(total, prevTotal);
  const clients = new Set(rows.map((r) => r.clientName).filter(Boolean)).size;
  const year = selectedDate.getFullYear();
  const yearTotal = sum(all.filter((i) => String(i.receivedOn || '').startsWith(`${year}-`) && String(i.receivedOn) <= `${month}-31`));

  const chartItems = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - (5 - k), 1);
    const iso = toISOMonth(d);
    return { key: iso, label: formatMonthShort(d), longLabel: formatMonthYear(d), value: sum(inMonth(iso)) };
  });

  if (error?.isMissingEndpoint) {
    return (
      <div className="stack">
        <FeaturePending title="Keuangan menunggu API backend" endpoints={ENDPOINTS} />
      </div>
    );
  }

  // Dashboard mengizinkan, tapi backend menolak: daftar email di kedua tempat belum sama.
  if (error?.status === 403) {
    return (
      <div className="stack">
        <AccessRestricted title="Akses keuangan ditolak oleh server">
          Email kamu belum terdaftar sebagai pengelola keuangan di backend. Minta pengelola backend menambahkannya.
        </AccessRestricted>
      </div>
    );
  }

  const remove = async () => {
    try {
      await incomesApi.remove(toDelete.id);
      toast.success(toDelete.orderId ? `Pemasukan dihapus. Pesanan ${toDelete.orderId} kembali menunggu pembayaran.` : 'Pemasukan dihapus.');
      // Pemasukan dari QRIS: status pesanannya di Klien masuk ikut berubah
      if (toDelete.orderId) refetchQuery(scopedKey(email, queries.inquiries().key)).catch(() => {});
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="stack">
      <div className="toolbar toolbar--spread">
        <div className="inline-field">
          <label htmlFor="periode-keuangan">Periode</label>
          <input id="periode-keuangan" className="input" type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </div>
        <div className="toolbar">
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing({ income: null })}>
            <Plus size={16} aria-hidden="true" />
            <span>Tambah manual</span>
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setExporting(true)} disabled={!data || Boolean(error)}>
            <Download size={18} aria-hidden="true" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <>
          <StatGrid label="Ringkasan keuangan">
            <StatTile
              label={`Pemasukan ${formatMonthYear(selectedDate)}`}
              value={formatRupiahShort(total)}
              caption={delta === null ? `Belum ada data ${formatMonth(prevDate)}` : `${delta >= 0 ? '+' : ''}${delta}% dari ${formatMonth(prevDate)}`}
              trend={delta === null ? undefined : delta >= 0 ? 'up' : 'down'}
            />
            <StatTile
              label={`Transaksi ${formatMonth(selectedDate)}`}
              value={formatNumber(rows.length)}
              caption={clients ? `Dari ${clients} klien` : 'Belum ada transaksi'}
            />
            <StatTile
              label={`Total ${year}`}
              value={formatRupiahShort(yearTotal)}
              caption={`Januari sampai ${formatMonth(selectedDate)}`}
            />
          </StatGrid>

          <section className="panel panel--padded stack stack--sm" aria-labelledby="judul-grafik">
            <div className="toolbar toolbar--spread">
              <h2 id="judul-grafik" className="panel__title">
                Pemasukan per bulan
              </h2>
              <Segmented
                label="Tampilan data"
                options={[
                  { value: 'grafik', label: 'Grafik' },
                  { value: 'tabel', label: 'Tabel' },
                ]}
                value={view}
                onChange={setView}
              />
            </div>
            {view === 'grafik' ? (
              <BarChart items={chartItems} formatValue={formatRupiah} />
            ) : (
              <div className="table-wrap table-wrap--plain">
                <table className="table table--compact">
                  <thead>
                    <tr>
                      <th scope="col">Bulan</th>
                      <th scope="col" className="num">
                        Pemasukan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartItems.map((item) => (
                      <tr key={item.key}>
                        <td>{item.longLabel}</td>
                        <td className="num">{formatRupiah(item.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="stack stack--sm" aria-labelledby="judul-transaksi">
            <h2 id="judul-transaksi" className="section-title">
              Transaksi {formatMonthYear(selectedDate)}
            </h2>
            {rows.length === 0 ? (
              <EmptyState
                title="Belum ada pemasukan di bulan ini"
                action={
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing({ income: null })}>
                    Tambah manual
                  </button>
                }
              >
                Pembayaran QRIS tercatat otomatis setelah pemegang keuangan menekan Sudah dibayar di Klien masuk.
              </EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Tanggal</th>
                      <th scope="col">Keterangan</th>
                      <th scope="col">Kategori</th>
                      <th scope="col" className="num">
                        Jumlah
                      </th>
                      <th scope="col">Dicatat oleh</th>
                      <th scope="col">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="tabular nowrap">{formatDayMonth(r.receivedOn)}</td>
                        <td>
                          <span className="cell-stack">
                            <span className="cell-title">{r.description}</span>
                            {r.clientName && <span className="cell-sub">{r.clientName}</span>}
                          </span>
                        </td>
                        <td>
                          <span className="cell-stack">
                            <span>
                              <Badge tone="neutral">{incomeCategoryLabel(r.category)}</Badge>
                            </span>
                            {r.orderId && <span className="cell-sub nowrap">QRIS {r.orderId}</span>}
                          </span>
                        </td>
                        <td className="num nowrap cell-title">{formatRupiah(r.amount)}</td>
                        <td className="nowrap">{r.recordedByName || nameOf(r.recordedBy) || '-'}</td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="icon-btn" aria-label={`Edit pemasukan ${r.description}`} onClick={() => setEditing({ income: r })}>
                              <Pencil size={18} aria-hidden="true" />
                            </button>
                            <button type="button" className="icon-btn icon-btn--danger" aria-label={`Hapus pemasukan ${r.description}`} onClick={() => setToDelete(r)}>
                              <Trash2 size={18} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row" colSpan={3}>
                        Total {formatMonth(selectedDate)}
                      </th>
                      <td className="num nowrap cell-title">{formatRupiah(total)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <Modal
        open={exporting}
        title="Export pemasukan"
        description="Unduh data pemasukan untuk laporan atau arsip."
        onClose={() => setExporting(false)}
        size="sm"
      >
        {exporting && (
          <ExportForm
            incomes={all}
            month={month}
            nameOf={nameOf}
            onCancel={() => setExporting(false)}
            onDone={(message) => {
              setExporting(false);
              toast.success(message);
            }}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(editing)}
        title={editing?.income ? 'Edit pemasukan' : 'Tambah pemasukan manual'}
        description={editing?.income ? undefined : 'Untuk pembayaran di luar QRIS, misalnya DP lewat transfer atau tunai.'}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <IncomeForm
            income={editing.income}
            onCancel={() => setEditing(null)}
            onSaved={(receivedOn) => {
              setEditing(null);
              if (receivedOn) setMonth(receivedOn.slice(0, 7));
              reload();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus pemasukan?"
        message={
          toDelete
            ? `${toDelete.description} (${formatRupiah(toDelete.amount)}) akan dihapus.${
                toDelete.orderId ? ` Pesanan ${toDelete.orderId} kembali menunggu pembayaran, dan QRIS tampil lagi untuk klien.` : ''
              }`
            : ''
        }
        confirmLabel="Hapus"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
