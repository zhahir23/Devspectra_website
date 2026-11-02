import { Clock, LogIn, Pencil } from 'lucide-react';
import { useState } from 'react';
import { attendanceApi } from '../api/endpoints';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { Avatar, Badge, ErrorState, FeaturePending, Field, Loading, Segmented } from '../components/ui';
import { useAuth } from '../auth/AuthContext';
import { queries, refreshAttendance } from '../data/queries';
import { useTeam } from '../data/TeamContext';
import { asList, useApi } from '../hooks/useApi';
import { useMyAttendance } from '../hooks/useMyAttendance';
import { combineDateTime, formatLongDate, formatTime, timeInputValue, toISODate, toISOMonth } from '../lib/format';
import { ATTENDANCE_STATUS_OPTIONS, attendanceStatus } from '../lib/status';

const ENDPOINTS = [
  'GET /api/attendance?date=YYYY-MM-DD',
  'POST /api/attendance/check-in',
  'POST /api/attendance/check-out',
  'POST /api/attendance',
  'PUT /api/attendance/{id}',
  'GET /api/attendance/summary?month=YYYY-MM',
];

function MyAttendanceCard({ mine }) {
  const toast = useToast();
  const { row, busy, checkIn, checkOut, available } = mine;
  if (available !== true) return null;

  const act = async (fn, label) => {
    try {
      await fn();
      toast.success(`${label} tercatat pukul ${formatTime(new Date())}.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const leave = row && !row.checkInAt && row.status !== 'HADIR';
  const done = row?.checkInAt && row?.checkOutAt;
  const checkedIn = Boolean(row?.checkInAt);

  return (
    <section className="panel panel--padded my-attendance" aria-labelledby="judul-absen-saya">
      <h2 id="judul-absen-saya" className="panel__title">
        Absensi kamu hari ini
      </h2>
      {leave ? (
        <p className="my-attendance__note">
          Kamu tercatat <strong>{attendanceStatus(row).label.toLowerCase()}</strong> hari ini
          {row.note ? `: ${row.note}` : '.'}
        </p>
      ) : (
        <dl className="kv-grid">
          <div>
            <dt>Masuk</dt>
            <dd>{row?.checkInAt ? formatTime(row.checkInAt) : 'Belum'}</dd>
          </div>
          <div>
            <dt>Pulang</dt>
            <dd className={row?.checkOutAt ? undefined : 'is-muted'}>{row?.checkOutAt ? formatTime(row.checkOutAt) : 'Belum'}</dd>
          </div>
        </dl>
      )}
      {!leave && !done && (
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy}
          onClick={() => (checkedIn ? act(checkOut, 'Absen pulang') : act(checkIn, 'Absen masuk'))}
        >
          {checkedIn ? <Clock size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          <span>{busy ? 'Mencatat...' : checkedIn ? 'Absen pulang' : 'Absen masuk'}</span>
        </button>
      )}
      {done && <p className="field__hint">Absensi hari ini sudah lengkap.</p>}
    </section>
  );
}

function EditAttendance({ editing, date, onClose, onSaved }) {
  const toast = useToast();
  const { member, row } = editing;
  const [status, setStatus] = useState(row?.status || 'HADIR');
  const [timeIn, setTimeIn] = useState(timeInputValue(row?.checkInAt));
  const [timeOut, setTimeOut] = useState(timeInputValue(row?.checkOutAt));
  const [note, setNote] = useState(row?.note || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const present = status === 'HADIR';

  const submit = async (event) => {
    event.preventDefault();
    if (present && timeIn && timeOut && timeOut < timeIn) {
      setError('Jam pulang tidak boleh lebih awal dari jam masuk.');
      return;
    }
    setError('');
    setBusy(true);
    const payload = {
      userId: member.id,
      workDate: date,
      status,
      note: note.trim() || null,
      checkInAt: present ? combineDateTime(date, timeIn) : null,
      checkOutAt: present ? combineDateTime(date, timeOut) : null,
    };
    try {
      if (row?.id) await attendanceApi.update(row.id, payload);
      else await attendanceApi.save(payload);
      toast.success('Absensi kamu disimpan.');
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <form id="form-absensi" className="form" onSubmit={submit} noValidate>
      <p className="form__context">
        {member.name}, {formatLongDate(date)}
      </p>
      <Field label="Status" htmlFor="a-status">
        <select id="a-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {ATTENDANCE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      {present && (
        <div className="form__row">
          <Field label="Jam masuk" htmlFor="a-masuk">
            <input id="a-masuk" className="input" type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
          </Field>
          <Field label="Jam pulang" htmlFor="a-pulang" error={error}>
            <input id="a-pulang" className="input" type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} aria-invalid={Boolean(error)} />
          </Field>
        </div>
      )}
      <Field label="Keterangan" htmlFor="a-ket" hint="Opsional, misalnya alasan izin.">
        <input id="a-ket" className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={255} aria-describedby="a-ket-hint" />
      </Field>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
          {busy ? 'Menyimpan...' : 'Simpan absensi'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onClose} disabled={busy}>
          Batal
        </button>
      </div>
    </form>
  );
}

export default function Absensi() {
  const { email } = useAuth();
  const { team, me, loading: teamLoading, error: teamError, reloadTeam } = useTeam();
  const mine = useMyAttendance();
  const today = toISODate(new Date());
  const [view, setView] = useState('harian');
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(toISOMonth(new Date()));
  const [editing, setEditing] = useState(null);
  // Untuk hari ini, datanya sama dengan kartu "Absensi kamu hari ini" (satu permintaan untuk keduanya)
  const daily = useApi(queries.attendanceByDate(date));
  const monthly = useApi(view === 'bulanan' ? queries.attendanceSummary(month) : null);

  if (daily.error?.isMissingEndpoint) {
    return (
      <div className="stack">
        <FeaturePending title="Absensi menunggu API backend" endpoints={ENDPOINTS} />
      </div>
    );
  }

  const rows = asList(daily.data);
  const rowFor = (userId) => rows.find((r) => r.userId === userId) || null;
  const counts = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0, NONE: 0 };
  team.forEach((m) => {
    const r = rowFor(m.id);
    if (!r) counts.NONE += 1;
    else counts[r.status] = (counts[r.status] || 0) + 1;
  });

  const refreshAll = () => refreshAttendance(email, date);

  return (
    <div className="stack">
      <div className="split split--top">
        <MyAttendanceCard mine={mine} />
        <section className="stat-grid stat-grid--compact split__main" aria-label={`Ringkasan absensi ${formatLongDate(date)}`}>
          {[
            ['Hadir', counts.HADIR, 'good'],
            ['Izin', counts.IZIN, 'warn'],
            ['Sakit', counts.SAKIT, 'warn'],
            ['Alpa', counts.ALPA, 'bad'],
            ['Belum absen', counts.NONE, 'neutral'],
          ].map(([label, value, tone]) => (
            <div key={label} className="stat">
              <h3 className="stat__label stat__label--dot">
                <span className={`dot dot--${tone}`} aria-hidden="true" />
                {label}
              </h3>
              <p className="stat__value">{daily.loading && !daily.data ? '...' : value}</p>
            </div>
          ))}
        </section>
      </div>

      <section className="stack stack--sm" aria-labelledby="judul-daftar-hadir">
        <div className="toolbar toolbar--spread">
          <h2 id="judul-daftar-hadir" className="section-title">
            {view === 'harian' ? 'Daftar hadir' : 'Rekap bulanan'}
          </h2>
          <div className="toolbar">
            <Segmented
              label="Tampilan"
              options={[
                { value: 'harian', label: 'Harian' },
                { value: 'bulanan', label: 'Rekap bulanan' },
              ]}
              value={view}
              onChange={setView}
            />
            {view === 'harian' ? (
              <div className="inline-field">
                <label htmlFor="tanggal-absensi">Tanggal</label>
                <input id="tanggal-absensi" className="input" type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} />
              </div>
            ) : (
              <div className="inline-field">
                <label htmlFor="bulan-absensi">Bulan</label>
                <input id="bulan-absensi" className="input" type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {teamError ? (
          <ErrorState error={teamError} onRetry={reloadTeam} />
        ) : view === 'harian' ? (
          daily.error ? (
            <ErrorState error={daily.error} onRetry={daily.reload} />
          ) : (daily.loading && !daily.data) || (teamLoading && !team.length) ? (
            <Loading />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Anggota</th>
                    <th scope="col">Masuk</th>
                    <th scope="col">Pulang</th>
                    <th scope="col">Status</th>
                    <th scope="col">Keterangan</th>
                    <th scope="col">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => {
                    const r = rowFor(m.id);
                    const status = attendanceStatus(r);
                    const present = r?.status === 'HADIR';
                    // Hanya absensi milik sendiri yang bisa diubah (backend juga menolak yang lain)
                    const isSelf = me?.id === m.id;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="cell-person">
                            <Avatar name={m.name} />
                            <span className="cell-title">
                              {m.name}
                              {isSelf && <span className="cell-tag">Kamu</span>}
                            </span>
                          </div>
                        </td>
                        <td className="tabular">{r?.checkInAt ? formatTime(r.checkInAt) : <span className="cell-sub">{present || !r ? 'Belum' : '-'}</span>}</td>
                        <td className="tabular">{r?.checkOutAt ? formatTime(r.checkOutAt) : <span className="cell-sub">{present ? 'Belum' : '-'}</span>}</td>
                        <td>
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                        <td className="cell-note">{r?.note || ''}</td>
                        <td>
                          <div className="row-actions">
                            {isSelf && (
                              <button type="button" className="icon-btn" aria-label="Ubah absensi kamu" onClick={() => setEditing({ member: m, row: r })}>
                                <Pencil size={18} aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : monthly.error ? (
          <ErrorState error={monthly.error} onRetry={monthly.reload} />
        ) : monthly.loading && !monthly.data ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Anggota</th>
                  <th scope="col" className="num">Hadir</th>
                  <th scope="col" className="num">Izin</th>
                  <th scope="col" className="num">Sakit</th>
                  <th scope="col" className="num">Alpa</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m) => {
                  const s = asList(monthly.data).find((x) => x.userId === m.id) || {};
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="cell-person">
                          <Avatar name={m.name} />
                          <span className="cell-title">{m.name}</span>
                        </div>
                      </td>
                      <td className="num">{s.hadir ?? 0}</td>
                      <td className="num">{s.izin ?? 0}</td>
                      <td className="num">{s.sakit ?? 0}</td>
                      <td className="num">{s.alpa ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {view === 'harian' && !daily.error && <p className="footnote">Kamu hanya bisa mengubah absensi milikmu sendiri.</p>}
      </section>

      <Modal open={Boolean(editing)} title="Ubah absensi kamu" onClose={() => setEditing(null)}>
        {editing && (
          <EditAttendance
            editing={editing}
            date={date}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              refreshAll();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
