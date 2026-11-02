import { ImageOff, Star } from 'lucide-react';
import { useState } from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { projectsApi, servicesApi, teamMembersApi, testimonialsApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import CrudSection from '../components/CrudSection';
import ImagePicker from '../components/ImagePicker';
import { prefetchPath, queries } from '../data/queries';
import { useToast } from '../components/Toast';
import { Badge, Field, describedBy } from '../components/ui';
import { parseDateTime } from '../lib/format';
import { imageSrc } from '../lib/image';
import { serviceIconOptions } from '../lib/serviceIcons';
import { slugify } from '../lib/slug';
import {
  byWebsiteOrder,
  DIVISIONS,
  memberPlaces,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  projectStatusLabel,
  splitTags,
  websiteInitials,
} from '../lib/websiteContent';

const byNewest = (field) => (a, b) => (parseDateTime(b[field])?.getTime() || 0) - (parseDateTime(a[field])?.getTime() || 0);

function TitleCell({ title, path }) {
  return (
    <span className="cell-stack">
      <span className="cell-title">{title}</span>
      {path && <span className="cell-sub cell-mono">{path}</span>}
    </span>
  );
}

function ActiveBadge({ active }) {
  return active === false ? <Badge tone="neutral">Disembunyikan</Badge> : <Badge tone="good">Tampil</Badge>;
}

function FormActions({ busy, isEdit, createText, onCancel }) {
  return (
    <div className="form__actions">
      <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
        {busy ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : createText}
      </button>
      <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
        Batal
      </button>
    </div>
  );
}

/** Menangani state isian + simpan untuk formulir konten. */
function useContentForm(initial, save) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };
  const submit = (validate) => async (event) => {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await save(form, toast);
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };
  return { form, setForm, set, errors, busy, submit };
}

/* ---------------- Layanan ---------------- */

function ServiceForm({ item, onCancel, onSaved }) {
  const { form, set, errors, busy, submit } = useContentForm(
    {
      title: item?.title || item?.name || '',
      slug: item?.slug || '',
      description: item?.description || '',
      icon: item?.icon || '',
      isActive: item?.isActive !== false,
    },
    async (f, toast) => {
      const payload = {
        title: f.title.trim(),
        name: f.title.trim(),
        slug: f.slug.trim() ? slugify(f.slug) : item ? item.slug : null,
        description: f.description.trim(),
        icon: f.icon.trim() || null,
        iconClass: item?.iconClass ?? null,
        isActive: f.isActive,
      };
      const saved = item ? await servicesApi.update(item.id, payload) : await servicesApi.create(payload);
      toast.success(item ? 'Layanan diperbarui.' : 'Layanan ditambahkan.');
      onSaved(saved);
    },
  );

  return (
    <form className="form" onSubmit={submit((f) => (f.title.trim() ? {} : { title: 'Nama layanan wajib diisi.' }))} noValidate>
      <Field label="Nama layanan" htmlFor="s-nama" error={errors.title}>
        <input id="s-nama" className="input" value={form.title} onChange={set('title')} maxLength={150} {...describedBy('s-nama', { error: errors.title })} />
      </Field>
      <Field
        label="Slug"
        htmlFor="s-slug"
        hint={`Untuk tautan langsung ke layanan ini di beranda website: /#${slugify(form.slug || form.title) || '...'}. Kosongkan untuk dibuat otomatis dari nama.`}
      >
        <input id="s-slug" className="input" value={form.slug} onChange={set('slug')} maxLength={150} {...describedBy('s-slug', { hint: true })} />
      </Field>
      <Field label="Deskripsi" htmlFor="s-desk" hint="Tampil di kartu layanan. Satu atau dua kalimat sudah cukup.">
        <textarea id="s-desk" className="input textarea" rows={4} value={form.description} onChange={set('description')} {...describedBy('s-desk', { hint: true })} />
      </Field>
      <Field label="Ikon" htmlFor="s-ikon" hint="Ikon di kartu layanan pada website.">
        <select id="s-ikon" className="input" value={form.icon} onChange={set('icon')} {...describedBy('s-ikon', { hint: true })}>
          {serviceIconOptions(item?.icon).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <label className="checkbox">
        <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
        <span>Tampilkan di website</span>
      </label>
      <FormActions busy={busy} isEdit={Boolean(item)} createText="Tambah layanan" onCancel={onCancel} />
    </form>
  );
}

function LayananTab() {
  return (
    <CrudSection
      api={servicesApi}
      listQuery={queries.services()}
      noun="layanan"
      createLabel="Tambah layanan"
      emptyText="Belum ada layanan."
      describe={(s) => s.title || s.name}
      searchText={(s) => `${s.title} ${s.description}`}
      columns={[
        { key: 'title', header: 'Layanan', render: (s) => <TitleCell title={s.title || s.name} path={s.slug ? `/#${slugify(s.slug)}` : null} /> },
        { key: 'desc', header: 'Deskripsi', className: 'cell-clamp', render: (s) => <span className="clamp-2">{s.description || '-'}</span> },
        { key: 'active', header: 'Di website', render: (s) => <ActiveBadge active={s.isActive} /> },
      ]}
      renderForm={(props) => <ServiceForm {...props} />}
    />
  );
}

/* ---------------- Testimoni ---------------- */

function TestimonialForm({ item, onCancel, onSaved }) {
  const { form, set, errors, busy, submit } = useContentForm(
    {
      clientName: item?.clientName || '',
      company: item?.company || '',
      content: item?.content || '',
      rating: String(item?.rating || 5),
      isActive: item?.isActive !== false,
    },
    async (f, toast) => {
      const payload = {
        clientName: f.clientName.trim(),
        company: f.company.trim() || null,
        content: f.content.trim() || null,
        rating: Number(f.rating),
        isActive: f.isActive,
      };
      const saved = item ? await testimonialsApi.update(item.id, payload) : await testimonialsApi.create(payload);
      toast.success(item ? 'Testimoni diperbarui.' : 'Testimoni ditambahkan.');
      onSaved(saved);
    },
  );

  const validate = (f) => {
    const next = {};
    if (!f.clientName.trim()) next.clientName = 'Nama klien wajib diisi.';
    // Penilaian dari website boleh tanpa ulasan, tapi yang tampil di website harus ada isinya
    if (!f.content.trim() && f.isActive) {
      next.content = 'Testimoni tanpa isi tidak bisa tampil di website. Tulis isinya, atau hilangkan centang Tampilkan di website.';
    }
    return next;
  };

  return (
    <form className="form" onSubmit={submit(validate)} noValidate>
      <div className="form__row">
        <Field label="Nama klien" htmlFor="t-nama" error={errors.clientName}>
          <input id="t-nama" className="input" value={form.clientName} onChange={set('clientName')} {...describedBy('t-nama', { error: errors.clientName })} />
        </Field>
        <Field label="Perusahaan" htmlFor="t-perusahaan">
          <input id="t-perusahaan" className="input" value={form.company} onChange={set('company')} />
        </Field>
      </div>
      <Field label="Isi testimoni" htmlFor="t-isi" error={errors.content}>
        <textarea id="t-isi" className="input textarea" rows={5} value={form.content} onChange={set('content')} {...describedBy('t-isi', { error: errors.content })} />
      </Field>
      <Field label="Rating" htmlFor="t-rating">
        <select id="t-rating" className="input" value={form.rating} onChange={set('rating')}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} dari 5
            </option>
          ))}
        </select>
      </Field>
      <label className="checkbox">
        <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
        <span>Tampilkan di website</span>
      </label>
      <FormActions busy={busy} isEdit={Boolean(item)} createText="Tambah testimoni" onCancel={onCancel} />
    </form>
  );
}

function Rating({ value }) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="rating" aria-label={`${n} dari 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={15} aria-hidden="true" className={i < n ? 'is-on' : undefined} />
      ))}
    </span>
  );
}

function TestimoniTab() {
  return (
    <CrudSection
      api={testimonialsApi}
      listQuery={queries.testimonials()}
      noun="testimoni"
      createLabel="Tambah testimoni"
      emptyText="Belum ada testimoni."
      describe={(t) => `Testimoni ${t.clientName}`}
      searchText={(t) => `${t.clientName} ${t.company} ${t.content}`}
      sort={byNewest('createdAt')}
      columns={[
        {
          key: 'client',
          header: 'Klien',
          // Penilaian dari halaman Contact website tidak punya nama perusahaan
          render: (t) => <TitleCell title={t.clientName} path={t.company || (t.fromWebsite ? 'Penilaian dari website' : null)} />,
        },
        { key: 'content', header: 'Ulasan', className: 'cell-clamp', render: (t) => <span className="clamp-2">{t.content || '-'}</span> },
        { key: 'rating', header: 'Rating', className: 'nowrap', render: (t) => <Rating value={t.rating} /> },
        { key: 'active', header: 'Di website', render: (t) => <ActiveBadge active={t.isActive} /> },
      ]}
      renderForm={(props) => <TestimonialForm {...props} />}
    />
  );
}

/* ---------------- Projects ---------------- */

/** "Urutan tampil": kosong = null (backend menaruhnya paling akhir), selain itu angka bulat >= 0. */
const orderValue = (value) => (String(value).trim() === '' ? null : Number(value));
const orderProblem = (value) => {
  const n = orderValue(value);
  return n === null || (Number.isInteger(n) && n >= 0) ? null : 'Isi dengan angka bulat, misalnya 1.';
};

function ProjectThumb({ url }) {
  const src = imageSrc(url);
  const [brokenSrc, setBrokenSrc] = useState(null);
  if (!src || brokenSrc === src) {
    return (
      <span className="cell-thumb cell-thumb--empty" aria-hidden="true">
        <ImageOff size={18} />
      </span>
    );
  }
  return <img className="cell-thumb" src={src} alt="" loading="lazy" onError={() => setBrokenSrc(src)} />;
}

function ProjectForm({ item, onCancel, onSaved }) {
  const [image, setImage] = useState(null); // gambar baru yang dipilih: { dataUrl, width, height, bytes }
  const { form, set, errors, busy, submit } = useContentForm(
    {
      title: item?.title || '',
      category: item?.category || PROJECT_CATEGORIES[0],
      status: item?.status || 'active',
      description: item?.description || '',
      tags: item?.tags || '',
      canvaUrl: item?.canvaUrl || '',
      sortOrder: item?.sortOrder ?? '',
      isActive: item?.isActive !== false,
    },
    async (f, toast) => {
      const payload = {
        title: f.title.trim(),
        category: f.category,
        status: f.status,
        description: f.description.trim() || null,
        tags: splitTags(f.tags).join(', ') || null,
        canvaUrl: f.canvaUrl.trim() || null,
        sortOrder: orderValue(f.sortOrder),
        isActive: f.isActive,
        // imageUrl null = gambar yang sekarang tetap dipakai; gambar baru dikirim di imageData
        imageUrl: null,
        imageData: image?.dataUrl || null,
      };
      const saved = item ? await projectsApi.update(item.id, payload) : await projectsApi.create(payload);
      toast.success(item ? 'Project diperbarui.' : 'Project ditambahkan.');
      onSaved(saved);
    },
  );

  const validate = (f) => {
    const next = {};
    if (!f.title.trim()) next.title = 'Judul project wajib diisi.';
    if (!image && !item?.imageUrl) next.image = 'Pilih gambar project.';
    const link = f.canvaUrl.trim();
    if (link && !/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(link)) {
      next.canvaUrl = 'Tulis alamat lengkap yang diawali https://, misalnya https://canva.link/abc123';
    }
    const order = orderProblem(f.sortOrder);
    if (order) next.sortOrder = order;
    return next;
  };

  return (
    <form className="form" onSubmit={submit(validate)} noValidate>
      <ImagePicker
        id="p-gambar"
        label="Gambar project"
        value={image?.dataUrl || item?.imageUrl || null}
        onChange={setImage}
        hint="Tampil di kartu project dengan perbandingan 16:10, jadi tepi gambar bisa sedikit terpotong. Ukurannya diperkecil otomatis sebelum diunggah."
        error={image ? undefined : errors.image}
      />
      <Field label="Judul" htmlFor="p-judul" error={errors.title}>
        <input id="p-judul" className="input" value={form.title} onChange={set('title')} maxLength={150} {...describedBy('p-judul', { error: errors.title })} />
      </Field>
      <div className="form__row">
        <Field label="Kategori" htmlFor="p-kategori" hint="Sama dengan menu Projects di website.">
          <select id="p-kategori" className="input" value={form.category} onChange={set('category')} {...describedBy('p-kategori', { hint: true })}>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="p-status" hint="Aktif: label kategori hijau. Arsip: abu-abu.">
          <select id="p-status" className="input" value={form.status} onChange={set('status')} {...describedBy('p-status', { hint: true })}>
            {PROJECT_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Urutan tampil"
          htmlFor="p-urutan"
          error={errors.sortOrder}
          hint={item ? 'Angka kecil tampil lebih dulu.' : 'Angka kecil tampil lebih dulu. Kosongkan untuk ditaruh paling akhir.'}
        >
          <input
            id="p-urutan"
            className="input"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.sortOrder}
            onChange={set('sortOrder')}
            {...describedBy('p-urutan', { hint: true, error: errors.sortOrder })}
          />
        </Field>
      </div>
      <Field label="Deskripsi" htmlFor="p-desk" hint="Tampil di bawah judul. Dua atau tiga kalimat sudah cukup.">
        <textarea id="p-desk" className="input textarea" rows={4} maxLength={2000} value={form.description} onChange={set('description')} {...describedBy('p-desk', { hint: true })} />
      </Field>
      <Field label="Tag" htmlFor="p-tag" hint="Pisahkan dengan koma, misalnya UI/UX, Mobile, Figma.">
        <input id="p-tag" className="input" value={form.tags} onChange={set('tags')} {...describedBy('p-tag', { hint: true })} />
      </Field>
      <Field label="Link Canva" htmlFor="p-canva" error={errors.canvaUrl} hint='Tujuan tombol "Lihat di Canva" di kartu project. Kosongkan kalau belum ada.'>
        <input
          id="p-canva"
          className="input"
          type="url"
          inputMode="url"
          placeholder="https://canva.link/..."
          value={form.canvaUrl}
          onChange={set('canvaUrl')}
          maxLength={500}
          {...describedBy('p-canva', { hint: true, error: errors.canvaUrl })}
        />
      </Field>
      <label className="checkbox">
        <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
        <span>Tampilkan di website</span>
      </label>
      <FormActions busy={busy} isEdit={Boolean(item)} createText="Tambah project" onCancel={onCancel} />
    </form>
  );
}

function ProjectsTab() {
  return (
    <CrudSection
      api={projectsApi}
      listQuery={queries.projects()}
      pending={{ title: 'Projects menunggu API backend', endpoints: ['GET/POST /api/projects', 'PUT/DELETE /api/projects/{id}', 'GET /api/media/{id}'] }}
      noun="project"
      createLabel="Tambah project"
      emptyText="Belum ada project."
      describe={(p) => p.title}
      searchText={(p) => `${p.title} ${p.description || ''} ${p.tags || ''} ${p.category || ''}`}
      sort={byWebsiteOrder}
      columns={[
        {
          key: 'title',
          header: 'Project',
          render: (p) => (
            <span className="cell-person">
              <ProjectThumb url={p.imageUrl} />
              <span className="cell-stack">
                <span className="cell-title">{p.title}</span>
                {p.tags && <span className="cell-sub">{splitTags(p.tags).join(', ')}</span>}
              </span>
            </span>
          ),
        },
        {
          key: 'category',
          header: 'Kategori',
          className: 'nowrap',
          render: (p) => (
            <span className="cell-stack">
              <span>{p.category}</span>
              <span className="cell-sub">{projectStatusLabel(p.status)}</span>
            </span>
          ),
        },
        { key: 'desc', header: 'Deskripsi', className: 'cell-clamp', render: (p) => <span className="clamp-2">{p.description || '-'}</span> },
        { key: 'active', header: 'Di website', render: (p) => <ActiveBadge active={p.isActive} /> },
      ]}
      renderForm={(props) => <ProjectForm {...props} />}
    />
  );
}

/* ---------------- Divisi (anggota tim di website) ---------------- */

function MemberPhoto({ member }) {
  const src = imageSrc(member.photoUrl);
  const [brokenSrc, setBrokenSrc] = useState(null);
  if (src && brokenSrc !== src) {
    return <img className="cell-photo" src={src} alt="" loading="lazy" onError={() => setBrokenSrc(src)} />;
  }
  return (
    <span className="avatar-wrap">
      <span className="avatar avatar--accent" style={{ width: 36, height: 36, fontSize: 13 }} aria-hidden="true">
        {member.initials || websiteInitials(member.name)}
      </span>
    </span>
  );
}

function TeamMemberForm({ item, onCancel, onSaved }) {
  // Foto: gambar baru yang dipilih, atau ditandai dihapus (kembali memakai inisial)
  const [photo, setPhoto] = useState({ image: null, removed: false });
  const { form, set, errors, busy, submit } = useContentForm(
    {
      name: item?.name || '',
      role: item?.role || '',
      division: item?.division || DIVISIONS[0],
      email: item?.email || '',
      initials: item?.initials || '',
      sortOrder: item?.sortOrder ?? '',
      showOnHome: item ? item.showOnHome !== false : true,
      showInDivision: item ? item.showInDivision !== false : true,
      showInContact: item ? item.showInContact !== false : true,
    },
    async (f, toast) => {
      const payload = {
        name: f.name.trim(),
        role: f.role.trim() || null,
        division: f.division,
        email: f.email.trim() || null,
        initials: f.initials.trim().toUpperCase() || null,
        sortOrder: orderValue(f.sortOrder),
        showOnHome: f.showOnHome,
        showInDivision: f.showInDivision,
        showInContact: f.showInContact,
        // photoUrl: null = foto tidak berubah, "" = foto dihapus. Foto baru dikirim di photoData
        photoUrl: photo.removed && !photo.image ? '' : null,
        photoData: photo.image?.dataUrl || null,
      };
      const saved = item ? await teamMembersApi.update(item.id, payload) : await teamMembersApi.create(payload);
      toast.success(item ? 'Anggota tim diperbarui.' : 'Anggota tim ditambahkan.');
      onSaved(saved);
    },
  );

  const validate = (f) => {
    const next = {};
    if (!f.name.trim()) next.name = 'Nama wajib diisi.';
    const email = f.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Format email belum benar, contoh: nama@devspectra.com';
    if (f.initials.trim().length > 3) next.initials = 'Inisial maksimal 3 huruf.';
    const order = orderProblem(f.sortOrder);
    if (order) next.sortOrder = order;
    return next;
  };

  const currentPhoto = photo.image?.dataUrl || (photo.removed ? null : item?.photoUrl) || null;
  const autoInitials = websiteInitials(form.name);

  return (
    <form className="form" onSubmit={submit(validate)} noValidate>
      <ImagePicker
        id="t-foto"
        label="Foto"
        shape="circle"
        maxSize={600}
        value={currentPhoto}
        onChange={(image) => setPhoto({ image, removed: false })}
        onRemove={() => setPhoto({ image: null, removed: true })}
        removeLabel="Hapus foto"
        fallbackText={form.initials.trim().toUpperCase() || autoInitials || '?'}
        hint="Opsional. Tanpa foto, website menampilkan inisial seperti di pratinjau."
      />
      <div className="form__row">
        <Field label="Nama" htmlFor="t-nama-anggota" error={errors.name}>
          <input id="t-nama-anggota" className="input" value={form.name} onChange={set('name')} maxLength={150} {...describedBy('t-nama-anggota', { error: errors.name })} />
        </Field>
        <Field label="Divisi" htmlFor="t-divisi" hint="Sama dengan menu Divisi di website.">
          <select id="t-divisi" className="input" value={form.division} onChange={set('division')} {...describedBy('t-divisi', { hint: true })}>
            {DIVISIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Posisi" htmlFor="t-posisi" hint="Misalnya Developer of Devspectra.">
        <input id="t-posisi" className="input" value={form.role} onChange={set('role')} maxLength={200} {...describedBy('t-posisi', { hint: true })} />
      </Field>
      <div className="form__row">
        <Field label="Email" htmlFor="t-email" error={errors.email} hint="Tampil saat nama anggota diklik di website.">
          <input
            id="t-email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="off"
            value={form.email}
            onChange={set('email')}
            maxLength={150}
            {...describedBy('t-email', { hint: true, error: errors.email })}
          />
        </Field>
        <Field label="Inisial" htmlFor="t-inisial" error={errors.initials} hint="Kosongkan supaya dibuat dari nama.">
          <input
            id="t-inisial"
            className="input"
            value={form.initials}
            onChange={set('initials')}
            maxLength={3}
            placeholder={autoInitials}
            {...describedBy('t-inisial', { hint: true, error: errors.initials })}
          />
        </Field>
        <Field label="Urutan tampil" htmlFor="t-urutan" error={errors.sortOrder} hint="Angka kecil tampil lebih dulu.">
          <input
            id="t-urutan"
            className="input"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.sortOrder}
            onChange={set('sortOrder')}
            {...describedBy('t-urutan', { hint: true, error: errors.sortOrder })}
          />
        </Field>
      </div>
      <fieldset className="checkbox-group" aria-describedby="t-tampil-hint">
        <legend className="field__label">Tampil di website</legend>
        <label className="checkbox">
          <input type="checkbox" checked={form.showOnHome} onChange={set('showOnHome')} />
          <span>Bagian Tim Kami di beranda</span>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={form.showInDivision} onChange={set('showInDivision')} />
          <span>Halaman Divisi</span>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={form.showInContact} onChange={set('showInContact')} />
          <span>Pilihan anggota di formulir Contact</span>
        </label>
        <p className="field__hint" id="t-tampil-hint">
          Formulir Contact hanya menampilkan anggota IT dan Media, sesuai jasa yang dipilih pengunjung. Kosongkan ketiganya untuk menyembunyikan anggota ini dari website.
        </p>
      </fieldset>
      <FormActions busy={busy} isEdit={Boolean(item)} createText="Tambah anggota tim" onCancel={onCancel} />
    </form>
  );
}

function DivisiTab() {
  return (
    <CrudSection
      api={teamMembersApi}
      listQuery={queries.teamMembers()}
      pending={{ title: 'Divisi menunggu API backend', endpoints: ['GET/POST /api/team-members', 'PUT/DELETE /api/team-members/{id}', 'GET /api/media/{id}'] }}
      noun="anggota tim"
      createLabel="Tambah anggota tim"
      emptyText="Belum ada anggota tim."
      describe={(m) => m.name}
      searchText={(m) => `${m.name} ${m.role || ''} ${m.email || ''} ${m.division || ''}`}
      sort={byWebsiteOrder}
      columns={[
        {
          key: 'name',
          header: 'Anggota tim',
          render: (m) => (
            <span className="cell-person">
              <MemberPhoto member={m} />
              <span className="cell-stack">
                <span className="cell-title">{m.name}</span>
                {m.email && <span className="cell-sub">{m.email}</span>}
              </span>
            </span>
          ),
        },
        { key: 'role', header: 'Posisi', className: 'cell-clamp', render: (m) => <span className="clamp-2">{m.role || '-'}</span> },
        { key: 'division', header: 'Divisi', className: 'nowrap', render: (m) => m.division },
        {
          key: 'places',
          header: 'Di website',
          render: (m) => {
            const places = memberPlaces(m);
            if (!places.length) return <Badge tone="neutral">Disembunyikan</Badge>;
            return (
              <span className="cell-stack">
                <span>
                  <Badge tone="good">Tampil</Badge>
                </span>
                <span className="cell-sub">{places.join(', ')}</span>
              </span>
            );
          },
        },
      ]}
      renderForm={(props) => <TeamMemberForm {...props} />}
    />
  );
}

// `note`: di mana isi tab ini muncul di website company.
const TABS = [
  {
    slug: 'layanan',
    label: 'Layanan',
    Component: LayananTab,
    note: 'Layanan berstatus Tampil muncul di beranda website, tepat di bawah perkenalan. Perubahan terlihat di website paling lama 1 menit.',
  },
  {
    slug: 'testimoni',
    label: 'Testimoni',
    Component: TestimoniTab,
    note: 'Testimoni berstatus Tampil muncul di beranda website, bagian Apa Kata Mereka. Penilaian dari halaman Contact website otomatis masuk ke sini: bintang 3 sampai 5 yang berisi ulasan langsung tampil, bintang 1 dan 2 atau tanpa ulasan disembunyikan. Perubahan terlihat di website paling lama 1 menit.',
  },
  {
    slug: 'projects',
    label: 'Projects',
    Component: ProjectsTab,
    note: 'Project berstatus Tampil muncul di halaman Projects website, dikelompokkan menurut kategori IT dan Media. Perubahan terlihat di website paling lama 1 menit.',
  },
  {
    slug: 'divisi',
    label: 'Divisi',
    Component: DivisiTab,
    note: 'Anggota tim di sini tampil di website: halaman Divisi, bagian Tim Kami di beranda, dan pilihan anggota di formulir Contact. Daftar ini terpisah dari akun di menu Anggota. Perubahan terlihat di website paling lama 1 menit.',
  },
];

export default function Konten() {
  const { email } = useAuth();
  const { tab } = useParams();
  const active = TABS.find((t) => t.slug === tab);
  if (!active) return <Navigate to="/konten/layanan" replace />;
  const { Component } = active;

  return (
    <div className="stack">
      <nav className="tabs" aria-label="Jenis konten">
        {TABS.map((t) => (
          <NavLink
            key={t.slug}
            to={`/konten/${t.slug}`}
            className="tabs__link"
            onPointerEnter={() => prefetchPath(email, `/konten/${t.slug}`)}
            onFocus={() => prefetchPath(email, `/konten/${t.slug}`)}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <p className="tab-note">{active.note}</p>
      <Component key={active.slug} />
    </div>
  );
}
