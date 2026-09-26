import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus, Pencil, Eye, EyeOff, Trash2, Search,
  Upload, X, Package, ImagePlus, GripVertical,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Badge, AudienceBadge, CollectionBadge } from '../../components/ui/Badge';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import {
  getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage,
} from '../../api/products';
import { getCustomSubcategories } from '../../api/admin';
import { extractErrorMessage } from '../../api/client';
import { ALLOWED_COLLECTIONS, getSubcategories, isValidCombination } from '../../constants/catalogue';
import type { Audience, JewelleryCollection, Product } from '../../types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const MAX_IMAGES = 5;

// ─── Form state ────────────────────────────────────────────────────────────────

interface ProductFormData {
  name:        string;
  audience:    Audience | '';
  collection:  JewelleryCollection | '';
  subcategory: string;
  price:       string;
  purity:      string;
  weight:      string;
  description: string;
  stock:       string;
  available:   boolean;
  featured:    boolean;
  bestseller:  boolean;
  topValuable: boolean;
  images:      string[];   // up to 5 URLs
}

const EMPTY_FORM: ProductFormData = {
  name: '', audience: '', collection: '', subcategory: '',
  price: '', purity: '', weight: '', description: '',
  stock: '1', available: true, featured: false, bestseller: false, topValuable: false,
  images: [],
};

function productToForm(p: Product): ProductFormData {
  return {
    name: p.name, audience: p.audience, collection: p.collection,
    subcategory: p.subcategory, 
    price: p.price !== undefined ? String(p.price) : '',
    purity: p.purity ?? '', weight: p.weight ?? '',
    description: p.description, stock: String(p.stock),
    available: p.available, featured: p.featured,
    bestseller: p.bestseller, topValuable: p.topValuable,
    images: p.images ?? [],
  };
}

interface FormErrors {
  name?: string; audience?: string; collection?: string;
  subcategory?: string; price?: string; weight?: string; stock?: string;
}

function validateForm(f: ProductFormData): FormErrors {
  const e: FormErrors = {};
  const isGoldOrSilver = f.collection === 'Gold' || f.collection === 'Silver';
  
  if (!f.name.trim())    e.name       = 'Product name is required';
  if (!f.audience)       e.audience   = 'Please select an audience';
  if (!f.collection)     e.collection = 'Please select a collection';
  else if (f.audience && !isValidCombination(f.audience as Audience, f.collection as JewelleryCollection))
    e.collection = `${f.collection} is not available for ${f.audience}`;
  if (!f.subcategory)    e.subcategory = 'Please select a subcategory';
  
  // For Gold/Silver: weight is required, price is not used
  if (isGoldOrSilver) {
    if (!f.weight.trim() || isNaN(Number(f.weight)) || Number(f.weight) <= 0) 
      e.weight = 'Enter a valid weight in grams';
  } else {
    // For One Gram Gold and Stones: price is required
    if (!f.price || isNaN(Number(f.price)) || Number(f.price) <= 0) 
      e.price = 'Enter a valid price';
  }
  
  if (!f.stock || isNaN(Number(f.stock)) || Number(f.stock) < 0)  e.stock = 'Enter a valid stock quantity';
  return e;
}

// ─── Multi-image upload panel ─────────────────────────────────────────────────

interface ImageUploadPanelProps {
  images:        string[];
  onChange:      (imgs: string[]) => void;
  uploading:     boolean;
  onUploadStart: () => void;
  onUploadEnd:   () => void;
}

function ImageUploadPanel({ images, onChange, uploading, onUploadStart, onUploadEnd }: ImageUploadPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_IMAGES} photos allowed`); return; }

    const toUpload = Array.from(files).slice(0, remaining);
    onUploadStart();

    const uploaded: string[] = [];
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); continue; }
      if (file.size > 10 * 1024 * 1024)    { toast.error(`${file.name} is too large (max 10 MB)`); continue; }
      try {
        const url = await uploadProductImage(file);
        uploaded.push(url);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${extractErrorMessage(err)}`);
      }
    }

    if (uploaded.length) {
      onChange([...images, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} uploaded`);
    }
    onUploadEnd();
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveImage = (from: number, to: number) => {
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  // Drag-and-drop reorder
  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDrop      = (idx: number) => {
    if (dragIdx.current !== null && dragIdx.current !== idx) {
      moveImage(dragIdx.current, idx);
    }
    dragIdx.current = null;
  };

  const canAdd = images.length < MAX_IMAGES && !uploading;

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-brown-800 font-sans">
          Product Photos
          <span className="ml-1 text-xs font-normal text-gray-400">
            ({images.length}/{MAX_IMAGES} — first photo is the main display image)
          </span>
        </label>
        {images.length > 1 && (
          <span className="text-xs text-gray-400 font-sans flex items-center gap-1">
            <GripVertical size={12} /> Drag to reorder
          </span>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-grab active:cursor-grabbing"
          >
            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

            {/* Main badge */}
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-gold-500 text-white text-[9px] font-bold font-sans px-1.5 py-0.5 rounded-full">
                MAIN
              </span>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, idx - 1)}
                  title="Move left"
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-brown-800 hover:bg-gold-100 transition-colors text-xs font-bold"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                title="Remove photo"
                aria-label={`Remove photo ${idx + 1}`}
                className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, idx + 1)}
                  title="Move right"
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-brown-800 hover:bg-gold-100 transition-colors text-xs font-bold"
                >
                  →
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add more button */}
        {canAdd && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gold-400 hover:bg-gold-50 transition-colors flex flex-col items-center justify-center gap-1.5 group"
            aria-label="Add photo"
          >
            <ImagePlus size={20} className="text-gray-400 group-hover:text-gold-500 transition-colors" />
            <span className="text-[10px] font-sans text-gray-400 group-hover:text-gold-600 transition-colors font-semibold">
              Add Photo
            </span>
          </button>
        )}

        {/* Uploading indicator */}
        {uploading && (
          <div className="aspect-square rounded-xl border-2 border-dashed border-gold-300 bg-gold-50 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-sans text-gold-600 font-semibold">Uploading…</span>
          </div>
        )}
      </div>

      {/* Drop zone (when no images yet) */}
      {images.length === 0 && !uploading && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          aria-label="Upload product photos"
        >
          <Upload size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-sans font-semibold text-gray-500">
            Click or drag photos here
          </p>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Up to {MAX_IMAGES} photos · JPG, PNG, WEBP · Max 10 MB each
          </p>
        </div>
      )}

      {/* Hidden file input — accepts multiple */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label="Image file input"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      {images.length > 0 && (
        <p className="text-xs text-gray-400 font-sans">
          Tip: hover a photo to remove or reorder it. Drag photos to change their position.
        </p>
      )}
    </div>
  );
}

// ─── Product Form Modal ────────────────────────────────────────────────────────

interface ProductFormModalProps {
  open:               boolean;
  onClose:            () => void;
  editProduct?:       Product;
  customSubcategories: import('../../types').SubcategoryEntry[];
  onSaved:            () => void;
}

function ProductFormModal({ open, onClose, editProduct, customSubcategories, onSaved }: ProductFormModalProps) {
  const [form,      setForm]      = useState<ProductFormData>(EMPTY_FORM);
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editProduct ? productToForm(editProduct) : EMPTY_FORM);
      setErrors({});
    }
  }, [open, editProduct]);

  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  // Derived subcategory list
  const availableCollections = form.audience ? ALLOWED_COLLECTIONS[form.audience as Audience] : [];
  const builtInSubs = (form.audience && form.collection)
    ? getSubcategories(form.audience as Audience, form.collection as JewelleryCollection) : [];
  const customSubs  = customSubcategories
    .filter(c => c.audience === form.audience && c.collection === form.collection)
    .map(c => c.name);
  const allSubs = [...new Set([...builtInSubs, ...customSubs])];

  const handleSave = async () => {
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const isGoldOrSilver = form.collection === 'Gold' || form.collection === 'Silver';
      const payload = {
        name:        form.name.trim(),
        audience:    form.audience as Audience,
        collection:  form.collection as JewelleryCollection,
        subcategory: form.subcategory,
        price:       isGoldOrSilver ? undefined : Number(form.price),
        purity:      form.purity  || undefined,
        weight:      form.weight  || undefined,
        description: form.description,
        stock:       Number(form.stock),
        available:   form.available,
        featured:    form.featured,
        bestseller:  form.bestseller,
        topValuable: form.topValuable,
        images:      form.images,
        slug:        '',
      };
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product added');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editProduct ? 'Edit Jewellery' : 'Add New Jewellery'}
      description={editProduct ? `Editing: ${editProduct.name}` : 'Add a new product to the catalogue'}
      size="xl"
    >
      <div className="space-y-5">

        {/* Audience + Collection */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Audience" value={form.audience} required
            placeholder="Choose audience"
            options={[{ value:'Women', label:'Women' }, { value:'Men', label:'Men' }]}
            onChange={e => { set('audience', e.target.value as Audience|''); set('collection',''); set('subcategory',''); }}
            error={errors.audience}
          />
          <Select
            label="Collection" value={form.collection} required
            disabled={!form.audience}
            placeholder={form.audience ? 'Choose collection' : 'Select audience first'}
            options={availableCollections.map(c => ({ value:c, label:c }))}
            onChange={e => { set('collection', e.target.value as JewelleryCollection|''); set('subcategory',''); }}
            error={errors.collection}
          />
        </div>

        {/* Men + One Gram Gold guard */}
        {form.audience === 'Men' && form.collection === 'One Gram Gold' && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-sans">
            One Gram Gold is not available for Men.
          </p>
        )}

        <Select
          label="Subcategory" value={form.subcategory} required
          disabled={!form.collection}
          placeholder={form.collection ? 'Choose subcategory' : 'Select collection first'}
          options={allSubs.map(s => ({ value:s, label:s }))}
          onChange={e => set('subcategory', e.target.value)}
          error={errors.subcategory}
        />

        <Input
          label="Product Name" required
          value={form.name} onChange={e => set('name', e.target.value)}
          error={errors.name} placeholder="e.g. Traditional Gold Necklace Set"
        />

        <div className="grid grid-cols-2 gap-4">
          {/* For Gold/Silver: show Weight. For others: show Price */}
          {form.collection === 'Gold' || form.collection === 'Silver' ? (
            <Input 
              label="Weight (grams)" 
              type="number" 
              required 
              min={0} 
              step="0.01"
              placeholder="e.g. 18.5"
              value={form.weight} 
              onChange={e => set('weight', e.target.value)} 
              error={errors.weight} 
            />
          ) : (
            <Input 
              label="Price (₹)" 
              type="number" 
              required 
              min={0} 
              placeholder="e.g. 25000"
              value={form.price} 
              onChange={e => set('price', e.target.value)} 
              error={errors.price} 
            />
          )}
          <Input 
            label="Stock Quantity" 
            type="number" 
            required 
            min={0}
            value={form.stock} 
            onChange={e => set('stock', e.target.value)} 
            error={errors.stock} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Purity / Material" 
            value={form.purity} 
            onChange={e => set('purity', e.target.value)} 
            placeholder="e.g. 22KT Gold" 
          />
          {/* For non-Gold/Silver, weight is optional */}
          {form.collection !== 'Gold' && form.collection !== 'Silver' && (
            <Input 
              label="Weight (optional)" 
              value={form.weight} 
              onChange={e => set('weight', e.target.value)} 
              placeholder="e.g. 12g" 
            />
          )}
        </div>

        <Textarea label="Description" rows={3}
          value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Describe this product…" />

        {/* ── Multi-image upload ── */}
        <ImageUploadPanel
          images={form.images}
          onChange={imgs => set('images', imgs)}
          uploading={uploading}
          onUploadStart={() => setUploading(true)}
          onUploadEnd={() => setUploading(false)}
        />

        {/* Flags */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-brown-800 font-sans">Product Flags</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'available'   as const, label: 'Available for sale' },
              { key: 'featured'    as const, label: 'Featured Jewellery'  },
              { key: 'bestseller'  as const, label: 'Best Seller'         },
              { key: 'topValuable' as const, label: 'Top & Valuable'      },
            ]).map(({ key, label }) => (
              <label key={key} className={clsx(
                'flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all text-sm font-sans',
                form[key]
                  ? 'border-gold-400 bg-gold-50 text-brown-800'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              )}>
                <input type="checkbox" checked={form[key]}
                  onChange={e => set(key, e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving || uploading} onClick={handleSave}>
            {editProduct ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Products Page ────────────────────────────────────────────────────────

export function AdminProducts() {
  const [products,          setProducts]          = useState<Product[]>([]);
  const [total,             setTotal]             = useState(0);
  const [page,              setPage]              = useState(1);
  const [search,            setSearch]            = useState('');
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [modalOpen,         setModalOpen]         = useState(false);
  const [editProduct,       setEditProduct]       = useState<Product | undefined>();
  const [customSubcategories, setCustomSub]       = useState<import('../../types').SubcategoryEntry[]>([]);
  const [deleting,          setDeleting]          = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await getProducts({ search, page, pageSize: 20 });
      setProducts(result.data); setTotal(result.total);
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getCustomSubcategories().then(({ categories }) => setCustomSub(categories)).catch(() => {}); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await deleteProduct(id); toast.success('Product deleted'); fetchProducts(); }
    catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setDeleting(null); }
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      await updateProduct(product.id, { hidden: !product.hidden });
      toast.success(product.hidden ? 'Product visible' : 'Product hidden');
      fetchProducts();
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const openAdd  = () => { setEditProduct(undefined); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setModalOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-brown-800 font-bold">Products</h1>
          <p className="text-sm text-gray-500 font-sans mt-1">{total} products in catalogue</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openAdd}>
          Add Jewellery
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden />
        <input type="search" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products…" aria-label="Search products"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-sans text-brown-800 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-colors"
        />
      </div>

      {loading && <ProductGridSkeleton count={6} />}
      {!loading && error && <ErrorState message={error} onRetry={fetchProducts} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState icon={Package} title="No products yet"
          description="Add your first jewellery product to get started."
          action={{ label: 'Add Jewellery', onClick: openAdd }} />
      )}

      {!loading && !error && products.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans" aria-label="Products table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Product', 'Collection', 'Price/Weight', 'Stock', 'Photos', 'Flags', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className={clsx('hover:bg-gray-50 transition-colors', p.hidden && 'opacity-50')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Show up to 3 thumbnail images */}
                          <div className="flex -space-x-2">
                            {(p.images?.slice(0, 3) ?? []).map((img, i) => (
                              <div key={i} className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white overflow-hidden shrink-0" style={{ zIndex: 3 - i }}>
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {(!p.images || p.images.length === 0) && (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 text-xs" aria-hidden>◈</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-brown-800">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.subcategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <AudienceBadge audience={p.audience} />
                          <CollectionBadge collection={p.collection} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-brown-800">
                        {p.collection === 'Gold' || p.collection === 'Silver' 
                          ? (p.weight ? `${p.weight} g` : 'N/A')
                          : `₹${p.price?.toLocaleString('en-IN') ?? '0'}`
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('font-semibold', p.stock === 0 ? 'text-red-600' : p.stock <= 3 ? 'text-gold-600' : 'text-green-700')}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-sans bg-gray-100 px-2 py-0.5 rounded-full">
                          <ImagePlus size={11} /> {p.images?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.featured    && <Badge variant="gold">Featured</Badge>}
                          {p.bestseller  && <Badge variant="blue">Best Seller</Badge>}
                          {p.topValuable && <Badge variant="purple">Top</Badge>}
                          {p.hidden      && <Badge variant="gray">Hidden</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleToggleVisibility(p)} aria-label={p.hidden ? `Show ${p.name}` : `Hide ${p.name}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center">
                            {p.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id} aria-label={`Delete ${p.name}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map(p => (
              <div key={p.id} className={clsx('bg-white rounded-2xl shadow-card border border-gray-100 p-4 flex gap-3', p.hidden && 'opacity-50')}>
                {/* Image strip */}
                <div className="flex gap-1 shrink-0">
                  {(p.images?.slice(0, 2) ?? []).map((img, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {(!p.images || p.images.length === 0) && (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 text-lg" aria-hidden>◈</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-brown-800 text-sm">{p.name}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <AudienceBadge audience={p.audience} />
                    <CollectionBadge collection={p.collection} />
                  </div>
                  <p className="text-sm font-bold text-brown-800 mt-1.5">
                    {p.collection === 'Gold' || p.collection === 'Silver' 
                      ? (p.weight ? `${p.weight} g` : 'Weight N/A')
                      : `₹${p.price?.toLocaleString('en-IN') ?? '0'}`
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => openEdit(p)} aria-label="Edit" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id, p.name)} aria-label="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
        </>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editProduct={editProduct}
        customSubcategories={customSubcategories}
        onSaved={fetchProducts}
      />
    </div>
  );
}
