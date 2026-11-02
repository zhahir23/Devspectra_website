import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { asList, useApi } from '../hooks/useApi';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { useToast } from './Toast';
import { EmptyState, ErrorState, FeaturePending, Loading } from './ui';

/**
 * Daftar + tambah/ubah/hapus untuk satu jenis konten (layanan, testimoni).
 * Tiap tab cukup menentukan kolom tabel dan formulirnya.
 * listQuery: data daftarnya (dari data/queries.js), api: untuk menghapus.
 * pending: { title, endpoints } untuk fitur yang API-nya mungkin belum ada di backend.
 */
export default function CrudSection({
  api,
  listQuery,
  noun,
  createLabel,
  columns,
  renderForm,
  describe,
  searchText,
  sort,
  emptyText,
  pending,
}) {
  const toast = useToast();
  const { data, error, loading, reload, setData } = useApi(listQuery);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // { item } ; item null = baru
  const [toDelete, setToDelete] = useState(null);

  const items = asList(data);
  const sorted = sort ? [...items].sort(sort) : items;
  const visible = query && searchText ? sorted.filter((i) => searchText(i).toLowerCase().includes(query.trim().toLowerCase())) : sorted;

  const remove = async () => {
    try {
      await api.remove(toDelete.id);
      // Tabel langsung ikut berubah bersamaan dengan pemberitahuan, lalu dicocokkan lagi dengan server
      setData((list) => asList(list).filter((i) => i.id !== toDelete.id));
      toast.success(`${describe(toDelete)} dihapus.`);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const apiMissing = Boolean(pending && error?.isMissingEndpoint);

  return (
    <div className="stack stack--sm">
      {!apiMissing && (
        <div className="toolbar">
          {searchText && (
            <div className="search">
              <label htmlFor={`cari-${noun}`} className="sr-only">
                Cari {noun}
              </label>
              <Search size={18} aria-hidden="true" className="search__icon" />
              <input
                id={`cari-${noun}`}
                className="input search__input"
                type="search"
                placeholder={`Cari ${noun}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <button type="button" className="btn btn--primary" onClick={() => setEditing({ item: null })}>
            <Plus size={18} aria-hidden="true" />
            <span>{createLabel}</span>
          </button>
        </div>
      )}

      {apiMissing ? (
        <FeaturePending title={pending.title} endpoints={pending.endpoints} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : visible.length === 0 ? (
        <EmptyState title={items.length ? `Tidak ada ${noun} yang cocok` : emptyText} />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} scope="col" className={c.className}>
                      {c.header}
                    </th>
                  ))}
                  <th scope="col">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    {columns.map((c) => (
                      <td key={c.key} className={c.className}>
                        {c.render(item)}
                      </td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-btn" aria-label={`Edit ${describe(item)}`} onClick={() => setEditing({ item })}>
                          <Pencil size={18} aria-hidden="true" />
                        </button>
                        <button type="button" className="icon-btn icon-btn--danger" aria-label={`Hapus ${describe(item)}`} onClick={() => setToDelete(item)}>
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="footnote">
            {visible.length} dari {items.length} {noun}
          </p>
        </>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?.item ? `Edit ${noun}` : createLabel}
        size="lg"
        onClose={() => setEditing(null)}
      >
        {editing &&
          renderForm({
            item: editing.item,
            items,
            onCancel: () => setEditing(null),
            // saved: data yang dikembalikan server. Kalau ada, tabel langsung memakainya.
            onSaved: (saved) => {
              setEditing(null);
              if (saved && typeof saved === 'object' && saved.id !== undefined) {
                setData((list) => {
                  const rows = asList(list);
                  return rows.some((i) => i.id === saved.id) ? rows.map((i) => (i.id === saved.id ? saved : i)) : [...rows, saved];
                });
              }
              reload();
            },
          })}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Hapus ${noun}?`}
        message={toDelete ? `"${describe(toDelete)}" akan dihapus dari website.` : ''}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
