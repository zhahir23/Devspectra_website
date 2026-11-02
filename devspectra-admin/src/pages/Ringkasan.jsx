import { Clock, LogIn, Megaphone, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { announcementsApi, settingsApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { canSeeFinance } from '../auth/permissions';
import Modal from '../components/Modal';
import Spectrum from '../components/Spectrum';
import { useToast } from '../components/Toast';
import { Avatar, Badge, ErrorState, Field, Loading, StatGrid, StatTile } from '../components/ui';
import { FOLLOWERS_SETTING_KEY } from '../config';
import { queries } from '../data/queries';
import { useTeam } from '../data/TeamContext';
import { asList, useApi } from '../hooks/useApi';
import { useMyAttendance } from '../hooks/useMyAttendance';
import {
  firstName,
  formatDayMonth,
  formatLongDate,
  formatMonth,
  formatNumber,
  formatRelative,
  formatRupiahShort,
  formatTime,
  parseDateTime,
  percentChange,
  presenceText,
  toISOMonth,
} from '../lib/format';
import { attendanceStatus, inquiryStatus } from '../lib/status';

const WEEK_MS = 7 * 24 * 3_600_000;

function AnnouncementBlock() {
  const toast = useToast();
  const { data, error, loading, setData } = useApi(queries.announcement());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const missing = error?.isMissingEndpoint;
  const announcement = data && typeof data === 'object' ? data : null;

  const openEditor = () => {
    setDraft(announcement?.message || '');
    setEditing(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    try {
      const saved = await announcementsApi.create(draft.trim());
      setData(saved && typeof saved === 'object' ? saved : { message: draft.trim(), createdAt: new Date() });
      setEditing(false);
      toast.success('Pengumuman disimpan.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hero__announcement">
      <p className="hero__label">
        <Megaphone size={18} aria-hidden="true" />
        <span>Pengumuman</span>
      </p>
      {loading && !data && <p className="hero__text hero__text--muted">Memuat pengumuman...</p>}
      {missing && (
        <p className="hero__text hero__text--muted">
          Pengumuman tampil di sini setelah API pengumuman dibuat di backend.
        </p>
      )}
      {error && !missing && <p className="hero__text hero__text--muted">{error.message}</p>}
      {!loading && !error && !announcement && <p className="hero__text hero__text--muted">Belum ada pengumuman.</p>}
      {announcement && <p className="hero__text">{announcement.message}</p>}
      {!missing && !(loading && !data) && (
        <div className="hero__meta">
          {announcement?.createdAt && (
            <span>
              {announcement.createdByName ? `Dari ${announcement.createdByName}, ` : ''}
              {formatLongDate(announcement.createdAt)}
            </span>
          )}
          {!error && (
            <button type="button" className="hero__link-btn" onClick={openEditor}>
              {announcement ? 'Ubah pengumuman' : 'Tulis pengumuman'}
            </button>
          )}
        </div>
      )}

      <Modal
        open={editing}
        title={announcement ? 'Ubah pengumuman' : 'Tulis pengumuman'}
        description="Tampil di halaman Ringkasan untuk semua anggota."
        onClose={() => setEditing(false)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setEditing(false)}>
              Batal
            </button>
            <button type="submit" form="form-pengumuman" className="btn btn--primary" disabled={busy || !draft.trim()}>
              {busy ? 'Menyimpan...' : 'Simpan pengumuman'}
            </button>
          </>
        }
      >
        <form id="form-pengumuman" className="form" onSubmit={save}>
          <Field label="Isi pengumuman" htmlFor="isi-pengumuman" hint={`${draft.length}/500 karakter`}>
            <textarea
              id="isi-pengumuman"
              className="input textarea"
              rows={5}
              maxLength={500}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-describedby="isi-pengumuman-hint"
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}

function AttendanceAction({ attendance }) {
  const toast = useToast();
  const { available, row, busy, checkIn, checkOut } = attendance;

  if (available === false) {
    return <p className="hero__text hero__text--muted hero__text--sm">Absensi aktif setelah API absensi dibuat di backend.</p>;
  }
  if (available === null) return null;

  const act = async (fn, label) => {
    try {
      await fn();
      toast.success(`${label} tercatat pukul ${formatTime(new Date())}.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (row && !row.checkInAt && row.status && row.status !== 'HADIR') {
    return (
      <p className="hero__text hero__text--muted hero__text--sm">
        Hari ini kamu tercatat {attendanceStatus(row).label.toLowerCase()}.
      </p>
    );
  }
  if (row?.checkInAt && row?.checkOutAt) {
    return (
      <p className="hero__text hero__text--muted hero__text--sm">
        Kamu sudah absen hari ini: masuk {formatTime(row.checkInAt)}, pulang {formatTime(row.checkOutAt)}.
      </p>
    );
  }
  const checkedIn = Boolean(row?.checkInAt);
  return (
    <div className="hero__actions">
      <button
        type="button"
        className="btn btn--light"
        disabled={busy}
        onClick={() => (checkedIn ? act(checkOut, 'Absen pulang') : act(checkIn, 'Absen masuk'))}
      >
        {checkedIn ? <Clock size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
        <span>{busy ? 'Mencatat...' : checkedIn ? 'Absen pulang' : 'Absen masuk'}</span>
      </button>
      <span className="hero__text hero__text--muted hero__text--sm">
        {checkedIn ? `Kamu sudah absen masuk pukul ${formatTime(row.checkInAt)}` : 'Kamu belum absen hari ini'}
      </span>
    </div>
  );
}

function FollowersTile() {
  const toast = useToast();
  const { data, error, loading, reload } = useApi(queries.settings());
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const setting = asList(data).find((s) => s.settingKey === FOLLOWERS_SETTING_KEY) || null;
  const count = setting ? Number(setting.settingValue) || 0 : null;

  const save = async (event) => {
    event.preventDefault();
    const clean = String(value).replace(/\D/g, '');
    if (!clean) return;
    setBusy(true);
    try {
      const payload = { settingKey: FOLLOWERS_SETTING_KEY, settingValue: clean };
      if (setting) await settingsApi.update(setting.id, payload);
      else await settingsApi.create(payload);
      setOpen(false);
      reload();
      toast.success('Jumlah followers diperbarui.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  let caption = 'Belum diisi';
  if (loading && !data) caption = 'Memuat...';
  else if (error) caption = 'Gagal memuat';
  else if (setting) caption = `Instagram, diperbarui ${formatDayMonth(setting.updatedAt)}`;

  return (
    <>
      <StatTile
        label="Followers"
        value={count === null ? '-' : formatNumber(count)}
        caption={caption}
        action={
          !error && (
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              aria-label="Perbarui jumlah followers"
              onClick={() => {
                setValue(count === null ? '' : String(count));
                setOpen(true);
              }}
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
          )
        }
      />
      <Modal
        open={open}
        title="Perbarui jumlah followers"
        description="Isi sesuai angka followers Instagram DevSpectra saat ini."
        size="sm"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button type="submit" form="form-followers" className="btn btn--primary" disabled={busy}>
              {busy ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="form-followers" className="form" onSubmit={save}>
          <Field label="Jumlah followers" htmlFor="jumlah-followers">
            <input
              id="jumlah-followers"
              className="input"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
              required
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}

export default function Ringkasan() {
  const { email } = useAuth();
  const { team, me, loading: teamLoading, error: teamError, presenceAvailable, reloadTeam } = useTeam();
  const attendance = useMyAttendance();
  // Sama dengan data halaman Klien masuk dan angka di menu: satu permintaan untuk semuanya
  const inquiries = useApi(queries.inquiries());
  // Data keuangan hanya diminta untuk anggota yang boleh melihatnya.
  const showFinance = canSeeFinance(email);
  const incomes = useApi(showFinance ? queries.incomes() : null);

  const inquiryList = asList(inquiries.data);
  const latestInquiries = useMemo(
    () =>
      [...inquiryList]
        .sort((a, b) => (parseDateTime(b.createdAt)?.getTime() || 0) - (parseDateTime(a.createdAt)?.getTime() || 0))
        .slice(0, 4),
    [inquiryList],
  );
  const weekCount = inquiryList.filter((q) => {
    const d = parseDateTime(q.createdAt);
    return d && Date.now() - d.getTime() < WEEK_MS;
  }).length;

  const onlineCount = team.filter((m) => m.online).length;

  const now = new Date();
  const thisMonth = toISOMonth(now);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = toISOMonth(prevDate);
  const incomeList = asList(incomes.data);
  const sumMonth = (month) =>
    incomeList.filter((i) => String(i.receivedOn || '').startsWith(month)).reduce((t, i) => t + (Number(i.amount) || 0), 0);
  const incomeNow = sumMonth(thisMonth);
  const incomePrev = sumMonth(prevMonth);
  const incomeDelta = percentChange(incomeNow, incomePrev);

  let incomeCaption;
  let incomeTrend;
  if (incomes.error?.status === 403) incomeCaption = 'Akses keuangan ditolak server';
  else if (incomes.error?.isMissingEndpoint) incomeCaption = 'Menunggu API keuangan di backend';
  else if (incomes.error) incomeCaption = 'Gagal memuat';
  else if (incomes.loading && !incomes.data) incomeCaption = 'Memuat...';
  else if (incomeDelta === null) incomeCaption = `Belum ada data ${formatMonth(prevDate)}`;
  else {
    incomeCaption = `${incomeDelta >= 0 ? '+' : ''}${incomeDelta}% dari ${formatMonth(prevDate)}`;
    incomeTrend = incomeDelta >= 0 ? 'up' : 'down';
  }

  const todayRows = attendance.rows;
  const attendanceLabel = (member) => {
    if (attendance.available !== true) return null;
    const row = todayRows.find((r) => r.userId === member.id);
    const status = attendanceStatus(row);
    const label = row?.status === 'HADIR' && row?.checkInAt ? `Hadir ${formatTime(row.checkInAt)}` : status.label;
    return <Badge tone={status.tone}>{label}</Badge>;
  };

  return (
    <div className="stack">
      <section className="hero" aria-labelledby="sapaan">
        <div className="hero__main">
          <h2 id="sapaan" className="hero__greeting">
            {me?.name ? `Selamat datang, ${firstName(me.name)}!` : 'Selamat datang!'}
          </h2>
          <AnnouncementBlock />
          <AttendanceAction attendance={attendance} />
        </div>
        <figure className="hero__figure">
          {team.length > 0 && <Spectrum members={team} />}
          <figcaption className="hero__caption">
            {teamLoading && !team.length
              ? 'Memuat anggota...'
              : presenceAvailable === false
                ? 'Status online tampil setelah API presence dibuat di backend.'
                : presenceAvailable === null
                  ? `${team.length} anggota tim`
                  : `${onlineCount} dari ${team.length} anggota sedang online`}
          </figcaption>
        </figure>
      </section>

      <StatGrid label="Statistik">
        <StatTile
          label="Klien masuk"
          value={inquiries.error ? '-' : inquiries.loading && !inquiries.data ? '...' : formatNumber(inquiryList.length)}
          caption={
            inquiries.error ? 'Gagal memuat' : weekCount > 0 ? `+${weekCount} minggu ini` : 'Belum ada pesan baru minggu ini'
          }
          trend={!inquiries.error && weekCount > 0 ? 'up' : undefined}
        />
        <FollowersTile />
        <StatTile
          label="Anggota"
          value={teamError ? '-' : formatNumber(team.length)}
          caption={presenceAvailable ? `${onlineCount} sedang online` : 'Status online belum tersedia'}
        />
        {showFinance && (
          <StatTile
            label={`Pemasukan ${formatMonth(now)}`}
            value={incomes.error ? '-' : formatRupiahShort(incomeNow)}
            caption={incomeCaption}
            trend={incomeTrend}
          />
        )}
      </StatGrid>

      <div className="split split--overview">
        <section className="panel split__main" aria-labelledby="judul-klien-terbaru">
          <div className="panel__header">
            <h2 id="judul-klien-terbaru" className="panel__title">
              Klien masuk terbaru
            </h2>
            <Link to="/klien" className="panel__link">
              Lihat semua klien
            </Link>
          </div>
          {inquiries.error ? (
            <div className="panel__pad">
              <ErrorState error={inquiries.error} onRetry={inquiries.reload} />
            </div>
          ) : inquiries.loading && !inquiries.data ? (
            <Loading />
          ) : latestInquiries.length === 0 ? (
            <p className="panel__empty">Belum ada pesan dari formulir kontak.</p>
          ) : (
            <ul className="list">
              {latestInquiries.map((q) => {
                const status = inquiryStatus(q.status);
                return (
                  <li key={q.id}>
                    <Link to={`/klien?pesan=${q.id}`} className="list__row list__row--link">
                      <Avatar name={q.name} tone="neutral" />
                      <span className="list__main">
                        <span className="list__title">{q.name}</span>
                        <span className="list__sub">{q.subject || 'Tanpa subjek'}</span>
                      </span>
                      <span className="list__aside">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <span className="list__meta">{formatRelative(q.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel split__side" aria-labelledby="judul-tim-hari-ini">
          <div className="panel__header">
            <h2 id="judul-tim-hari-ini" className="panel__title">
              Tim hari ini
            </h2>
            <Link to="/absensi" className="panel__link">
              Lihat absensi
            </Link>
          </div>
          {teamError ? (
            <div className="panel__pad">
              <ErrorState error={teamError} onRetry={reloadTeam} />
            </div>
          ) : teamLoading && !team.length ? (
            <Loading />
          ) : (
            <ul className="list">
              {team.map((m) => (
                <li key={m.id} className="list__row">
                  <Avatar name={m.name} online={m.online ?? undefined} />
                  <span className="list__main">
                    <span className="list__title">{m.name}</span>
                    <span className={`list__sub${m.online ? ' is-online' : ''}`}>
                      {presenceText(m) || m.role || m.division || m.email}
                    </span>
                  </span>
                  {attendanceLabel(m)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
