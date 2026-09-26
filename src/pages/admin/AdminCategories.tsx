import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { getCustomSubcategories, addCustomSubcategory, deleteCustomSubcategory } from '../../api/admin';
import { ALLOWED_COLLECTIONS, SUBCATEGORIES } from '../../constants/catalogue';
import { isValidCombination } from '../../constants/catalogue';
import { extractErrorMessage } from '../../api/client';
import type { Audience, JewelleryCollection, SubcategoryEntry } from '../../types';
import toast from 'react-hot-toast';

const FORBIDDEN = ['One Gram Gold', 'Diamond', 'Platinum'];

export function AdminCategories() {
  const [categories, setCategories] = useState<SubcategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [audience, setAudience] = useState<Audience | ''>('');
  const [collection, setCollection] = useState<JewelleryCollection | ''>('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { categories } = await getCustomSubcategories();
      setCategories(categories);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const availableCollections = audience ? ALLOWED_COLLECTIONS[audience] : [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!audience) { setFormError('Select an audience'); return; }
    if (!collection) { setFormError('Select a collection'); return; }
    if (!name.trim()) { setFormError('Enter a subcategory name'); return; }

    // Guard: Men + One Gram Gold
    if (audience === 'Men' && collection === 'One Gram Gold') {
      setFormError('Men cannot have One Gram Gold subcategories.');
      return;
    }
    // Guard: Diamond / Platinum
    if (FORBIDDEN.some((f) => name.toLowerCase().includes(f.toLowerCase()))) {
      setFormError('Diamond, Platinum, or invalid collection names are not permitted.');
      return;
    }
    // Guard: invalid combination
    if (!isValidCombination(audience, collection as JewelleryCollection)) {
      setFormError(`${collection} is not available for ${audience}.`);
      return;
    }
    // Guard: duplicate built-in
    const builtin = SUBCATEGORIES[audience][collection as JewelleryCollection] ?? [];
    if (builtin.map((s) => s.toLowerCase()).includes(name.trim().toLowerCase())) {
      setFormError('This subcategory already exists in the built-in list.');
      return;
    }
    // Guard: duplicate custom
    const exists = categories.some(
      (c) => c.audience === audience && c.collection === collection && c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) { setFormError('This custom subcategory already exists.'); return; }

    setAdding(true);
    try {
      const { categories: updated } = await addCustomSubcategory({ audience, collection: collection as JewelleryCollection, name: name.trim(), isCustom: true });
      setCategories(updated);
      setName('');
      toast.success('Subcategory added');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete custom subcategory "${name}"?`)) return;
    setDeletingId(id);
    try {
      const { categories: updated } = await deleteCustomSubcategory(id);
      setCategories(updated);
      toast.success('Subcategory deleted');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-espresso font-medium">Categories</h1>
        <p className="text-sm text-espresso-400 font-sans mt-1">
          Add custom subcategories under the allowed collections. Built-in subcategories cannot be removed.
        </p>
      </div>

      {/* Add form */}
      <div className="card p-6">
        <h2 className="font-serif text-xl text-espresso font-medium mb-5 flex items-center gap-2">
          <Plus size={18} className="text-gold-600" /> Add Custom Subcategory
        </h2>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Audience"
              value={audience}
              onChange={(e) => { setAudience(e.target.value as Audience | ''); setCollection(''); }}
              required
              placeholder="Choose audience"
              options={[{ value: 'Women', label: 'Women' }, { value: 'Men', label: 'Men' }]}
            />
            <Select
              label="Collection"
              value={collection}
              onChange={(e) => setCollection(e.target.value as JewelleryCollection | '')}
              required
              disabled={!audience}
              placeholder={audience ? 'Choose collection' : 'Select audience first'}
              options={availableCollections.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Subcategory Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Toe Rings"
              required
              disabled={!collection}
            />
          </div>
          {formError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-sans">{formError}</p>
          )}
          <Button type="submit" variant="primary" loading={adding} leftIcon={<Plus size={15} />}>
            Add Subcategory
          </Button>
        </form>
      </div>

      {/* Built-in subcategories reference */}
      <div className="card p-6">
        <h2 className="font-serif text-xl text-espresso font-medium mb-4">Built-in Subcategories</h2>
        <p className="text-sm text-espresso-400 font-sans mb-5">
          These are the default subcategories defined in the catalogue structure. They cannot be removed.
        </p>
        <div className="space-y-4">
          {(['Women', 'Men'] as Audience[]).map((aud) =>
            ALLOWED_COLLECTIONS[aud].map((col) => {
              const subs = SUBCATEGORIES[aud][col] ?? [];
              if (!subs.length) return null;
              return (
                <div key={`${aud}-${col}`} className="p-4 bg-ivory-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={aud === 'Women' ? 'purple' : 'blue'}>{aud}</Badge>
                    <Badge variant="gold">{col}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subs.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-white border border-espresso-100 text-xs font-sans text-espresso rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Custom subcategories */}
      <div className="card p-6">
        <h2 className="font-serif text-xl text-espresso font-medium mb-4 flex items-center gap-2">
          <Tag size={18} className="text-gold-600" /> Custom Subcategories
        </h2>

        {loading && <div className="space-y-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-14 w-full" />)}</div>}
        {!loading && error && <ErrorState message={error} onRetry={fetchCategories} />}
        {!loading && !error && categories.length === 0 && (
          <p className="text-sm text-espresso-400 font-sans">No custom subcategories added yet.</p>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div key={(cat as SubcategoryEntry & { id?: string }).id ?? i} className="flex items-center justify-between gap-3 p-3 bg-ivory-50 border border-ivory-200 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={cat.audience === 'Women' ? 'purple' : 'blue'}>{cat.audience}</Badge>
                  <Badge variant="gold">{cat.collection}</Badge>
                  <span className="text-sm font-sans text-espresso font-medium">{cat.name}</span>
                  <Badge variant="gray">Custom</Badge>
                </div>
                <button
                  onClick={() => handleDelete((cat as SubcategoryEntry & { id?: string }).id ?? String(i), cat.name)}
                  disabled={deletingId === ((cat as SubcategoryEntry & { id?: string }).id ?? String(i))}
                  aria-label={`Delete ${cat.name}`}
                  className="p-1.5 rounded-lg text-espresso-400 hover:text-red-600 hover:bg-red-50 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
