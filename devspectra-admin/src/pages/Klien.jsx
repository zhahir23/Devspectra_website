import { Mail, Phone, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inquiriesApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { canSeeFinance } from '../auth/permissions';
import ConfirmDialog from '../components/ConfirmDialog';
import QrisPayment from '../components/QrisPayment';
import { useToast } from '../components/Toast';
import { Badge, EmptyState, ErrorState, Field, Loading, Segmented } from '../components/ui';
import { queries } from '../data/queries';
import { refetchQuery, scopedKey } from '../data/queryCache';
import { useTeam } from '../data/TeamContext';
import { asList, useApi } from '../hooks/useApi';
import { formatDayMonth, formatLongDate, formatRupiah, formatTime, parseDateTime } from '../lib/format';
import { INQUIRY_STATUS_OPTIONS, inquiryStatus, normalizeInquiryStatus, orderIdOf } from '../lib/status';

const assignedIdOf = (q) => (q.assignedTo && typeof q.assignedTo === 'object' ? q.assignedTo.id : q.assignedTo ?? null);

function InquiryDetail({ inquiry, team, assignAvailable, canRecordPayment, onAssign, onStatus, onProject, onPayment, onDelete, onClose }) {
  const [status, setStatus] = useState(normalizeInquiryStatus(inquiry.status));
  const [busy, setBusy] = useState(false);
  const panelRef = useRef(null);
  const badge = inquiryStatus(inquiry.status);
  const assignedId = assignedIdOf(inquiry);
  const created = parseDateTime(inquiry.createdAt);

  // Di layar sempit, detail ada di bawah daftar: gulir ke sana saat dibuka.
  useEffect(() => {
    if (window.matchMedia('(max-width: 1100px)').matches) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    setStatus(normalizeInquiryStatus(inquiry.status));
  }, [inquiry.status]);

  const saveStatus = async () => {
    setBusy(true);
    await onStatus(status);
    setBusy(false);
  };

  const replyHref = `mailto:${inquiry.email || ''}?subject=${encodeURIComponent(`Re: ${inquiry.subject || 'Pesan untuk DevSpectra'}`)}`;

  return (
    <section ref={panelRef} className="panel panel--padded split__side side-panel" aria-labelledby="judul-detail-klien">
      <div className="side-panel__head">
        <div className="stack stack--xs">
          <div className="detail__title-row">
            <h2 id="judul-detail-klien" className="detail__title">
              {inquiry.name || 'Tanpa nama'}
            </h2>
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </div>
          {created && (
            <p className="panel__subtitle">
              Masuk {formatLongDate(created)}, pukul {formatTime(created)}
            </p>
          )}
        </div>
        <button type="button" className="icon-btn" aria-label="Tutup detail" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Email</dt>
          <dd>{inquiry.email ? <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a> : '-'}</dd>
        </div>
        <div>
          <dt>Telepon</dt>
          <dd className="tabular">
            {inquiry.phone ? (
              <a href={`tel:${String(inquiry.phone).replace(/[^\d+]/g, '')}`} className="link-plain">
                <Phone size={14} aria-hidden="true" /> {inquiry.phone}
              </a>
            ) : (
              '-'
            )}
          </dd>
        </div>
        <div>
          <dt>Subjek</dt>
          <dd className="detail__strong">{inquiry.subject || '-'}</dd>
        </div>
      </dl>

      <blockquote className="message">{inquiry.message || 'Tidak ada isi pesan.'}</blockquote>

      <QrisPayment inquiry={inquiry} canRecordPayment={canRecordPayment} onProject={onProject} onPayment={onPayment} />

      <div className="form">
        <Field
          label="Ditangani oleh"
          htmlFor="k-ditangani"
          hint={assignAvailable === false ? 'Aktif setelah kolom "ditangani oleh" dibuat di backend.' : undefined}
        >
          <select
            id="k-ditangani"
            className="input"
            value={assignedId ?? ''}
            disabled={assignAvailable === false}
            onChange={(e) => onAssign(e.target.value ? Number(e.target.value) : null)}
            aria-describedby={assignAvailable === false ? 'k-ditangani-hint' : undefined}
          >
            <option value="">Belum ada</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="form__row form__row--end">
          <Field label="Status" htmlFor="k-status">
            <select id="k-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {INQUIRY_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={saveStatus}
            disabled={busy || status === normalizeInquiryStatus(inquiry.status)}
          >
            {busy ? 'Menyimpan...' : 'Simpan status'}
          </button>
        </div>
      </div>

      <div className="side-panel__foot">
        <a href={replyHref} className="btn btn--primary">
          <Mail size={18} aria-hidden="true" />
          <span>Balas lewat email</span>
        </a>
        {normalizeInquiryStatus(inquiry.status) !== 'replied' && (
          <button type="button" className="btn btn--secondary" onClick={() => onStatus('replied')}>
            Tandai sudah dibalas
          </button>
        )}
        <button type="button" className="btn btn--ghost-danger" onClick={onDelete}>
          <Trash2 size={18} aria-hidden="true" />
          <span>Hapus pesan</span>
        </button>
      </div>
    </section>
  );
}

// Field pembayaran QRIS di balasan backend (yang tidak dikirim backend lama dilewati)
const QRIS_FIELDS = ['orderId', 'projectCompletedAt', 'billAmount', 'paidAt', 'incomeId'];
const qrisFieldsOf = (saved) => Object.fromEntries(QRIS_FIELDS.filter((k) => saved && k in saved).map((k) => [k, saved[k]]));

export default function Klien() {
  const toast = useToast();
  const { email } = useAuth();
  const canRecordPayment = canSeeFinance(email);
  const { team, nameOf } = useTeam();
  // Data yang sama dengan angka di menu dan Ringkasan: perubahan di sini langsung terlihat di sana
  const { data, error, loading, reload, setData } = useApi(queries.inquiries());
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const [assignAvailable, setAssignAvailable] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const markedRef = useRef(new Set());

  const list = useMemo(
    () =>
      [...asList(data)].sort(
        (a, b) => (parseDateTime(b.createdAt)?.getTime() || 0) - (parseDateTime(a.createdAt)?.getTime() || 0),
      ),
    [data],
  );
  const selectedId = params.get('pesan') ? Number(params.get('pesan')) : null;
  const selected = list.find((q) => q.id === selectedId) || null;

  // Backend yang belum punya kolom "ditangani oleh" sama sekali tidak mengirim field assignedTo.
  // Dari situ dashboard sudah tahu fiturnya belum siap, tanpa perlu mencoba lalu gagal.
  const assignFieldSent = list.length ? list.some((q) => 'assignedTo' in q) : null;
  const assignReady = assignAvailable ?? assignFieldSent;

  const patchLocal = (id, patch) => setData((items) => asList(items).map((q) => (q.id === id ? { ...q, ...patch } : q)));

  // Pesan "Baru" otomatis menjadi "Dibaca" saat dibuka.
  useEffect(() => {
    if (!selected || normalizeInquiryStatus(selected.status) !== 'unread' || markedRef.current.has(selected.id)) return;
    markedRef.current.add(selected.id);
    inquiriesApi
      .setStatus(selected.id, 'read')
      .then(() => patchLocal(selected.id, { status: 'read' }))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const counts = {
    all: list.length,
    open: list.filter((q) => normalizeInquiryStatus(q.status) !== 'replied').length,
    replied: list.filter((q) => normalizeInquiryStatus(q.status) === 'replied').length,
  };

  const visible = list.filter((q) => {
    const st = normalizeInquiryStatus(q.status);
    if (filter === 'open' && st === 'replied') return false;
    if (filter === 'replied' && st !== 'replied') return false;
    if (query) {
      // Isi pesan ikut dicari, supaya ID pesanan dari website (DSP-...) bisa ditemukan
      const text = `${q.name} ${q.email} ${q.subject} ${q.phone} ${q.message} ${q.orderId || ''}`.toLowerCase();
      if (!text.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  const select = (id) => {
    const next = new URLSearchParams(params);
    if (id) next.set('pesan', String(id));
    else next.delete('pesan');
    setParams(next, { replace: true });
  };

  const changeStatus = async (inquiry, status) => {
    try {
      await inquiriesApi.setStatus(inquiry.id, status);
      patchLocal(inquiry.id, { status });
      toast.success(`Status diubah menjadi ${inquiryStatus(status).label}.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const assign = async (inquiry, userId) => {
    try {
      await inquiriesApi.assign(inquiry.id, userId);
      patchLocal(inquiry.id, { assignedTo: userId });
      setAssignAvailable(true);
      toast.success(userId ? `Pesan ditangani oleh ${nameOf(userId)}.` : 'Penanggung jawab dikosongkan.');
    } catch (err) {
      if (err.isMissingEndpoint) {
        setAssignAvailable(false);
        toast.error('Fitur "ditangani oleh" belum ada di backend.');
      } else {
        toast.error(err.message);
      }
    }
  };

  // Tandai proyek selesai sambil mengisi tagihan, ubah tagihan, atau batalkan tanda selesai
  const setProjectDone = async (inquiry, completed, billAmount) => {
    try {
      const saved = await inquiriesApi.setProjectDone(inquiry.id, completed, billAmount);
      patchLocal(inquiry.id, {
        orderId: orderIdOf(inquiry),
        projectCompletedAt: completed ? inquiry.projectCompletedAt || new Date().toISOString() : null,
        ...(completed ? { billAmount } : {}),
        ...qrisFieldsOf(saved),
      });
      if (!completed) toast.success('Tanda selesai dibatalkan. QRIS tidak tampil lagi untuk klien.');
      else if (inquiry.projectCompletedAt) toast.success(`Tagihan disimpan: ${formatRupiah(billAmount)}.`);
      else toast.success(`Proyek ditandai selesai. Klien sekarang bisa melihat QRIS dan tagihan ${formatRupiah(billAmount)}.`);
      return true;
    } catch (err) {
      toast.error(err.isMissingEndpoint ? 'Fitur pembayaran QRIS belum ada di backend. Pasang kode backend terbaru dulu.' : err.message);
      return false;
    }
  };

  // Pemegang keuangan: konfirmasi pembayaran (pemasukan tercatat otomatis), atau batalkan
  const setPayment = async (inquiry, data) => {
    try {
      const saved = await inquiriesApi.setPayment(inquiry.id, data);
      patchLocal(inquiry.id, data.paid ? { paidAt: new Date().toISOString(), ...qrisFieldsOf(saved) } : { paidAt: null, incomeId: null, ...qrisFieldsOf(saved) });
      // Halaman Keuangan dan kotak Pemasukan di Ringkasan ikut diperbarui
      refetchQuery(scopedKey(email, queries.incomes().key)).catch(() => {});
      toast.success(data.paid ? `Pembayaran ${formatRupiah(data.amount)} tercatat di Keuangan.` : 'Pembayaran dibatalkan. Pemasukannya sudah dihapus dari Keuangan.');
      return true;
    } catch (err) {
      toast.error(err.isMissingEndpoint ? 'Konfirmasi pembayaran belum ada di backend. Pasang kode backend terbaru dulu.' : err.message);
      // Mungkin sudah diubah anggota lain: ambil data terbaru
      reload();
      return false;
    }
  };

  const remove = async () => {
    try {
      await inquiriesApi.remove(toDelete.id);
      setData((items) => asList(items).filter((q) => q.id !== toDelete.id));
      if (selectedId === toDelete.id) select(null);
      toast.success('Pesan dihapus.');
      setToDelete(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="split">
      <section className="split__main stack stack--sm" aria-label="Daftar pesan klien">
        <div className="toolbar">
          <Segmented
            label="Saring status"
            options={[
              { value: 'open', label: `Belum selesai ${counts.open}` },
              { value: 'replied', label: `Dibalas ${counts.replied}` },
              { value: 'all', label: `Semua ${counts.all}` },
            ]}
            value={filter}
            onChange={setFilter}
          />
          <div className="search">
            <label htmlFor="cari-pesan" className="sr-only">
              Cari pesan
            </label>
            <Search size={18} aria-hidden="true" className="search__icon" />
            <input
              id="cari-pesan"
              className="input search__input"
              type="search"
              placeholder="Cari nama, email, subjek, atau ID pesanan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState title={list.length ? 'Tidak ada pesan yang cocok' : 'Belum ada pesan masuk'}>
            {list.length
              ? 'Coba saringan atau kata kunci lain.'
              : 'Pesan dari formulir kontak website akan muncul di sini.'}
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Pengirim</th>
                  <th scope="col">Subjek</th>
                  <th scope="col">Status</th>
                  <th scope="col">Ditangani</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((q) => {
                  const st = inquiryStatus(q.status);
                  const isNew = normalizeInquiryStatus(q.status) === 'unread';
                  const assignedName = nameOf(assignedIdOf(q));
                  const created = parseDateTime(q.createdAt);
                  return (
                    <tr key={q.id} className={q.id === selectedId ? 'is-selected' : undefined}>
                      <td>
                        <span className="cell-stack">
                          <button
                            type="button"
                            className={`row-link${isNew ? ' is-strong' : ''}`}
                            aria-current={q.id === selectedId ? 'true' : undefined}
                            onClick={() => select(q.id)}
                          >
                            {q.name || 'Tanpa nama'}
                          </button>
                          <span className="cell-sub">
                            {created ? `${formatDayMonth(created)}, ${formatTime(created)}` : '-'}
                          </span>
                        </span>
                      </td>
                      <td className={isNew ? 'cell-strong' : undefined}>{q.subject || '-'}</td>
                      <td>
                        <span className="cell-stack">
                          <span>
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </span>
                          {q.paidAt ? (
                            <span className="cell-sub">Lunas</span>
                          ) : (
                            q.projectCompletedAt && <span className="cell-sub">Proyek selesai</span>
                          )}
                        </span>
                      </td>
                      <td className={assignedName ? undefined : 'cell-sub'}>{assignedName || 'Belum ada'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <InquiryDetail
          key={selected.id}
          inquiry={selected}
          team={team}
          assignAvailable={assignReady}
          canRecordPayment={canRecordPayment}
          onAssign={(userId) => assign(selected, userId)}
          onStatus={(status) => changeStatus(selected, status)}
          onProject={(completed, billAmount) => setProjectDone(selected, completed, billAmount)}
          onPayment={(data) => setPayment(selected, data)}
          onDelete={() => setToDelete(selected)}
          onClose={() => select(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus pesan?"
        message={toDelete ? `Pesan dari ${toDelete.name || 'pengirim ini'} akan dihapus permanen.` : ''}
        confirmLabel="Hapus pesan"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
