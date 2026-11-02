import { KeyRound, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usersApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { canDeleteAccount, canEditAccount, canManageMembers } from '../auth/permissions';
import ConfirmDialog from '../components/ConfirmDialog';
import PasswordInput from '../components/PasswordInput';
import ResetPasswordForm from '../components/ResetPasswordForm';
import { useToast } from '../components/Toast';
import { Avatar, EmptyState, ErrorState, Field, Loading, Presence, Segmented, describedBy } from '../components/ui';
import { ALLOWED_EMAIL_DOMAIN } from '../config';
import { queries } from '../data/queries';
import { useTeam } from '../data/TeamContext';
import { asList, useApi } from '../hooks/useApi';
import { formatMonthShort, toISOMonth } from '../lib/format';
import { passwordProblem } from '../lib/password';

// Siapa boleh apa (lihat src/auth/permissions.js, backend memeriksa aturan yang sama):
// - Tambah anggota: hanya pemegang keuangan. Anggota lain tidak melihat tombolnya.
// - Edit data dan ganti password (ikon pensil dan kunci): pemilik akun sendiri, atau pemegang keuangan.
// - Hapus anggota: hanya pemegang keuangan, dan tidak untuk akunnya sendiri.
// Anggota baru lalu login di halaman masuk dashboard. Email tidak bisa diubah setelah akun dibuat.

const EMPTY_FORM = { name: '', email: '', role: '', division: '', password: '' };

function MemberForm({ mode, member, team, onCancel, onSaved }) {
  const toast = useToast();
  const { patchTeam } = useTeam();
  const isCreate = mode === 'create';
  const [form, setForm] = useState(() =>
    member ? { name: member.name || '', email: member.email || '', role: member.role || '', division: member.division || '', password: '' } : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const divisions = useMemo(() => [...new Set(team.map((m) => m.division).filter(Boolean))].sort(), [team]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    const email = form.email.trim().toLowerCase();
    if (!form.name.trim()) next.name = 'Nama wajib diisi.';
    if (isCreate) {
      if (!email) next.email = 'Email wajib diisi.';
      else if (!/^[^\s@]+@[^\s@]+$/.test(email)) next.email = 'Format email belum benar.';
      else if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) next.email = `Email harus berakhiran ${ALLOWED_EMAIL_DOMAIN}.`;
      // Backend lama menimpa akun yang emailnya sama (kode backend baru menolaknya), jadi dicegah juga di sini.
      else if (team.some((m) => String(m.email).toLowerCase() === email)) next.email = 'Email ini sudah dipakai anggota lain.';
      const problem = passwordProblem(form.password, 'Password wajib diisi untuk akun baru.');
      if (problem) next.password = problem;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const payload = { name: form.name.trim(), role: form.role.trim(), division: form.division.trim() };
    try {
      // Tabel langsung ikut berubah bersamaan dengan pemberitahuan, lalu onSaved memuat ulang daftar dari server
      if (isCreate) {
        const created = await usersApi.create({ ...payload, email: form.email.trim().toLowerCase(), password: form.password });
        if (created?.id !== undefined) {
          const { password: _password, ...shown } = created;
          patchTeam((list) => [...asList(list).filter((u) => u.id !== shown.id), shown]);
        }
        toast.success(`${payload.name} ditambahkan. Sekarang dia bisa login di dashboard.`);
      } else {
        await usersApi.update(member.id, payload);
        patchTeam((list) => asList(list).map((u) => (u.id === member.id ? { ...u, ...payload } : u)));
        toast.success(`Data ${payload.name} disimpan.`);
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  const hints = {
    email: isCreate ? `Wajib berakhiran ${ALLOWED_EMAIL_DOMAIN}. Dipakai untuk login.` : 'Email tidak bisa diubah setelah akun dibuat.',
    password: 'Minimal 8 karakter. Kirim ke anggota lewat pesan pribadi. Setelah login, dia bisa menggantinya sendiri di halaman Anggota.',
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="Nama lengkap" htmlFor="m-nama" error={errors.name}>
        <input id="m-nama" className="input" value={form.name} onChange={set('name')} maxLength={150} autoComplete="off" {...describedBy('m-nama', { error: errors.name })} />
      </Field>
      <Field label="Email" htmlFor="m-email" hint={hints.email} error={errors.email}>
        <input
          id="m-email"
          className="input"
          type="email"
          value={form.email}
          onChange={set('email')}
          disabled={!isCreate}
          maxLength={150}
          autoComplete="off"
          placeholder={isCreate ? `nama${ALLOWED_EMAIL_DOMAIN}` : undefined}
          {...describedBy('m-email', { hint: hints.email, error: errors.email })}
        />
      </Field>
      <Field label="Peran" htmlFor="m-peran" hint="Contoh: Frontend Developer">
        <input id="m-peran" className="input" value={form.role} onChange={set('role')} maxLength={50} {...describedBy('m-peran', { hint: true })} />
      </Field>
      <Field label="Divisi" htmlFor="m-divisi">
        <input id="m-divisi" className="input" list="daftar-divisi" value={form.division} onChange={set('division')} maxLength={100} />
        <datalist id="daftar-divisi">
          {divisions.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </Field>
      {isCreate && (
        <Field label="Password" htmlFor="m-password" hint={hints.password} error={errors.password}>
          <PasswordInput
            id="m-password"
            value={form.password}
            onChange={(value) => setForm((f) => ({ ...f, password: value }))}
            visible={showPassword}
            onVisibleChange={setShowPassword}
            {...describedBy('m-password', { hint: hints.password, error: errors.password })}
          />
        </Field>
      )}
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
          {busy ? 'Menyimpan...' : isCreate ? 'Tambah anggota' : 'Simpan perubahan'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
          Batal
        </button>
      </div>
    </form>
  );
}

export default function Anggota() {
  const toast = useToast();
  const { email: myEmail } = useAuth();
  const { team, me, loading, error, presenceAvailable, reloadTeam, patchTeam } = useTeam();
  const month = toISOMonth(new Date());
  const summary = useApi(queries.attendanceSummary(month));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [panel, setPanel] = useState(null); // { mode: 'create' } | { mode: 'edit' | 'reset', member }
  const [toDelete, setToDelete] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (panel && window.matchMedia('(max-width: 1100px)').matches) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [panel]);

  const hadirByUser = useMemo(() => {
    const map = {};
    asList(summary.data).forEach((s) => {
      map[s.userId] = s.hadir;
    });
    return map;
  }, [summary.data]);
  const canManage = canManageMembers(myEmail);
  const panelMember = panel?.member ?? null;
  const panelIsSelf = Boolean(panelMember) && me?.id === panelMember.id;
  const panelCanDelete = Boolean(panelMember) && canDeleteAccount(myEmail, panelMember.email);
  // Panel hanya terbuka lewat tombol yang memang boleh dipakai. Pemeriksaan ini berjaga-jaga
  // kalau daftar anggota berubah saat panel masih terbuka.
  const panelAllowed = panel?.mode === 'create' ? canManage : Boolean(panelMember) && canEditAccount(myEmail, panelMember.email);
  const panelOpen = Boolean(panel) && panelAllowed;
  // Saat panel terbuka, tabel diringkas supaya tetap muat di samping panel.
  const compact = panelOpen;
  const showAttendance = !summary.error && !compact;
  const closePanel = () => setPanel(null);

  const panelTitle = {
    create: 'Tambah anggota',
    edit: panelIsSelf ? 'Edit data kamu' : 'Edit anggota',
    reset: panelIsSelf ? 'Ganti password kamu' : 'Atur ulang password',
  }[panel?.mode];

  const onlineCount = team.filter((m) => m.online).length;
  const visible = team.filter((m) => {
    const text = `${m.name} ${m.email} ${m.role} ${m.division}`.toLowerCase();
    if (query && !text.includes(query.trim().toLowerCase())) return false;
    if (filter === 'online') return m.online === true;
    if (filter === 'offline') return m.online === false;
    return true;
  });

  const filterOptions = [
    { value: 'all', label: `Semua ${team.length}` },
    ...(presenceAvailable
      ? [
          { value: 'online', label: `Online ${onlineCount}` },
          { value: 'offline', label: `Offline ${team.length - onlineCount}` },
        ]
      : []),
  ];

  const removeMember = async () => {
    try {
      await usersApi.remove(toDelete.id);
      patchTeam((list) => asList(list).filter((u) => u.id !== toDelete.id));
      toast.success(`${toDelete.name} dihapus dari tim.`);
      if (panelMember?.id === toDelete.id) setPanel(null);
      setToDelete(null);
      reloadTeam();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="split">
      <section className="split__main stack stack--sm" aria-label="Daftar anggota">
        <div className="toolbar">
          <div className="search">
            <label htmlFor="cari-anggota" className="sr-only">
              Cari anggota
            </label>
            <Search size={18} aria-hidden="true" className="search__icon" />
            <input
              id="cari-anggota"
              className="input search__input"
              type="search"
              placeholder="Cari nama, email, atau peran"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {filterOptions.length > 1 && <Segmented label="Saring status" options={filterOptions} value={filter} onChange={setFilter} />}
          {canManage && (
            <button
              type="button"
              className="btn btn--primary"
              aria-expanded={panelOpen && panel.mode === 'create'}
              onClick={() => setPanel({ mode: 'create' })}
            >
              <Plus size={18} aria-hidden="true" />
              <span>Tambah anggota</span>
            </button>
          )}
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reloadTeam} />
        ) : loading && !team.length ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState title={team.length ? 'Tidak ada anggota yang cocok' : 'Belum ada anggota'}>
            {team.length
              ? 'Coba kata kunci atau saringan lain.'
              : canManage
                ? 'Tambahkan anggota pertama dengan tombol Tambah anggota.'
                : 'Anggota baru ditambahkan oleh pemegang keuangan.'}
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className={`table${compact ? ' table--narrow' : ''}`}>
              <thead>
                <tr>
                  <th scope="col">Anggota</th>
                  <th scope="col">Peran dan divisi</th>
                  <th scope="col">Status</th>
                  {showAttendance && (
                    <th scope="col" className="num">
                      Hadir {formatMonthShort(new Date())}
                    </th>
                  )}
                  <th scope="col">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => {
                  const isSelf = me?.id === m.id;
                  const canEdit = canEditAccount(myEmail, m.email);
                  const canDelete = canDeleteAccount(myEmail, m.email);
                  const selected = panelOpen && panelMember?.id === m.id;
                  const editing = selected && panel.mode === 'edit';
                  const resetting = selected && panel.mode === 'reset';
                  const deleteLabel = canDelete ? `Hapus ${m.name}` : 'Akun sendiri tidak bisa dihapus';
                  return (
                    <tr key={m.id} className={selected ? 'is-selected' : undefined}>
                      <td>
                        <div className="cell-person">
                          <Avatar name={m.name} />
                          <span className="cell-stack">
                            <span className="cell-title">
                              {m.name}
                              {isSelf && <span className="cell-tag">Kamu</span>}
                            </span>
                            <span className="cell-sub">{m.email}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="cell-stack">
                          <span>{m.role || '-'}</span>
                          <span className="cell-sub">{m.division || 'Tanpa divisi'}</span>
                        </span>
                      </td>
                      <td>
                        <Presence member={m} />
                      </td>
                      {showAttendance && (
                        <td className="num">{hadirByUser[m.id] !== undefined ? `${hadirByUser[m.id]} hari` : '-'}</td>
                      )}
                      <td>
                        {/* Anggota biasa hanya melihat tombol di baris akunnya sendiri */}
                        <div className="row-actions">
                          {canEdit && (
                            <>
                              <button
                                type="button"
                                className={`icon-btn${editing ? ' is-active' : ''}`}
                                aria-label={isSelf ? 'Edit data kamu' : `Edit ${m.name}`}
                                aria-expanded={editing}
                                onClick={() => setPanel({ mode: 'edit', member: m })}
                              >
                                <Pencil size={18} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className={`icon-btn${resetting ? ' is-active' : ''}`}
                                aria-label={isSelf ? 'Ganti password kamu' : `Atur ulang password ${m.name}`}
                                aria-expanded={resetting}
                                onClick={() => setPanel({ mode: 'reset', member: m })}
                              >
                                <KeyRound size={18} aria-hidden="true" />
                              </button>
                            </>
                          )}
                          {canManage && !compact && (
                            <button
                              type="button"
                              className="icon-btn icon-btn--danger"
                              aria-label={deleteLabel}
                              title={canDelete ? undefined : deleteLabel}
                              disabled={!canDelete}
                              onClick={() => setToDelete(m)}
                            >
                              <Trash2 size={18} aria-hidden="true" />
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
        )}
        {summary.error?.isMissingEndpoint && (
          <p className="footnote">Kolom jumlah hadir muncul setelah API absensi dibuat di backend.</p>
        )}
        {!canManage && !error && team.length > 0 && (
          <p className="footnote">
            Kamu hanya bisa mengubah data dan password akunmu sendiri. Menambah dan menghapus anggota dilakukan oleh pemegang keuangan.
          </p>
        )}
      </section>

      {panelOpen && (
        <section ref={panelRef} className="panel panel--padded split__side side-panel" aria-labelledby="judul-panel-anggota">
          <div className="side-panel__head">
            <div>
              <h2 id="judul-panel-anggota" className="panel__title">
                {panelTitle}
              </h2>
              <p className="panel__subtitle">{panelMember ? panelMember.name : 'Akun baru untuk login di dashboard'}</p>
            </div>
            <button type="button" className="icon-btn" aria-label="Tutup panel" onClick={closePanel}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {panel.mode === 'reset' ? (
            <ResetPasswordForm
              key={`reset-${panelMember.id}`}
              member={panelMember}
              isSelf={panelIsSelf}
              onCancel={closePanel}
              onDone={closePanel}
              onGone={() => {
                closePanel();
                reloadTeam();
              }}
            />
          ) : (
            <MemberForm
              key={panelMember ? panelMember.id : 'baru'}
              mode={panel.mode}
              member={panelMember}
              team={team}
              onCancel={closePanel}
              onSaved={() => {
                closePanel();
                reloadTeam();
              }}
            />
          )}
          {panel.mode === 'edit' && (
            <div className="side-panel__extra">
              <button type="button" className="btn btn--secondary" onClick={() => setPanel({ mode: 'reset', member: panelMember })}>
                <KeyRound size={18} aria-hidden="true" />
                <span>{panelIsSelf ? 'Ganti password' : 'Atur ulang password'}</span>
              </button>
              <p className="field__hint">{panelIsSelf ? 'Ganti password yang kamu pakai untuk login.' : 'Untuk anggota yang lupa password.'}</p>
            </div>
          )}
          {panel.mode === 'edit' && panelCanDelete && (
            <div className="side-panel__danger">
              <button type="button" className="btn btn--danger-outline" onClick={() => setToDelete(panelMember)}>
                <Trash2 size={18} aria-hidden="true" />
                <span>Hapus anggota</span>
              </button>
              <p className="field__hint">Anggota yang dihapus tidak bisa login lagi.</p>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus anggota?"
        message={toDelete ? `${toDelete.name} (${toDelete.email}) akan dihapus dan tidak bisa login lagi.` : ''}
        confirmLabel="Hapus anggota"
        onConfirm={removeMember}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
