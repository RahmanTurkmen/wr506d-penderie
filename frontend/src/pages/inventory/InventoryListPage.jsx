import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, Disc3, ListFilter, Package, Plus, Search, Shirt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState, Skeleton } from '@/components/lumen/primitives'
import { PullToRefresh } from '@/components/lumen/PullToRefresh'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { photoUrl } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }
const TYPE_TONE = {
  vetement: 'bg-secondary text-primary',
  livre: 'bg-amber-100 text-amber-700',
  vinyle: 'bg-violet-100 text-violet-700',
  autre: 'bg-sky-100 text-sky-700',
}

export function InventoryListPage({ objets, categories, loading, error, onOpenObjet, onAddObjet, onOpenDressing, onRefresh }) {
  const { t } = useTranslation('inventory')
  const [search, setSearch] = useState('')
  const [categorieFilter, setCategorieFilter] = useState(null)

  const filtered = useMemo(() => {
    const list = objets ?? []
    const q = search.trim().toLowerCase()
    return list.filter((o) => {
      if (categorieFilter && o.categorie?.id !== categorieFilter) return false
      if (q && !o.nom.toLowerCase().includes(q)) return false
      return true
    })
  }, [objets, search, categorieFilter])

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader
        title={t('list.title')}
        subtitle={loading ? t('list.loadingEllipsis') : t('list.count', { count: objets.length })}
      />

      <PullToRefresh onRefresh={onRefresh}>
      <div className="space-y-4 px-6 py-5 md:px-10">
        <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-border bg-card px-4">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.searchPlaceholder')}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="button"
          onClick={onOpenDressing}
          className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Shirt className="h-[18px] w-[18px]" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-primary">{t('list.dressingCard.title')}</span>
            <span className="block text-xs text-primary/80">{t('list.dressingCard.subtitle')}</span>
          </span>
          <span className="text-sm text-primary">›</span>
        </button>

        {categories.length > 0 && (
          <Select
            value={categorieFilter ?? 'tout'}
            onValueChange={(v) => setCategorieFilter(v === 'tout' ? null : v)}
          >
            <SelectTrigger className="h-12 w-full justify-between gap-2.5 rounded-2xl border-2 border-primary/20 bg-secondary px-4 text-sm font-semibold text-primary [&>svg]:text-primary">
              <span className="flex items-center gap-2.5">
                <ListFilter className="h-[18px] w-[18px] shrink-0" />
                <SelectValue placeholder={t('list.categoryPlaceholder')}>
                  {(value) =>
                    value === 'tout' || !value
                      ? t('list.all')
                      : (categories.find((c) => c.id === value)?.nom ?? t('list.categoryPlaceholder'))
                  }
                </SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tout">{t('list.all')}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-2xl bg-card p-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-[18px] w-[18px] shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState>{objets.length === 0 ? t('list.emptyNoObjets') : t('list.emptyNoMatch')}</EmptyState>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {filtered.map((o) => {
              const Icon = TYPE_ICON[o.type] ?? Package
              const tone = TYPE_TONE[o.type] ?? TYPE_TONE.autre
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onOpenObjet(o.id)}
                  className="flex flex-col gap-2 rounded-2xl bg-card p-3 text-left transition-all duration-150 hover:bg-muted active:scale-[0.97]"
                >
                  {o.photo ? (
                    <img
                      src={photoUrl(o.photo)}
                      alt={o.nom}
                      className="aspect-square w-full rounded-[14px] object-cover"
                    />
                  ) : (
                    <span className={`flex aspect-square w-full items-center justify-center rounded-[14px] ${tone}`}>
                      <Icon className="h-9 w-9" />
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold text-foreground">{o.nom}</span>
                  <span className="truncate text-xs text-muted-foreground">{o.piece?.nom ?? o.conteneur?.nom ?? '—'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      </PullToRefresh>

      {/* FAB mobile */}
      <button
        type="button"
        onClick={onAddObjet}
        aria-label={t('list.addAriaLabel')}
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
