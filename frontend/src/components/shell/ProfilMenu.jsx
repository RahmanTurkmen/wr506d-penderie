import { Baby, Check, LogOut, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ProfilMenu({ profils, activeId, onSwitch, onClose, onLogout, align = 'left' }) {
  const { t } = useTranslation(['shell', 'common'])
  return (
    <>
      <button type="button" aria-label={t('close', { ns: 'common' })} onClick={onClose} className="fixed inset-0 z-20 cursor-default" />
      <div
        className={`absolute top-full z-30 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-lg ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('profilMenu.householdProfiles', { ns: 'shell' })}
        </p>
        {profils.map((p) => {
          const isActive = p.id === activeId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSwitch(p.id)
                onClose()
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                isActive ? 'bg-secondary' : 'hover:bg-muted'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                {p.estMineur ? <Baby className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{p.nom}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.type === 'principal'
                    ? t('profilMenu.mainAccount', { ns: 'shell' })
                    : p.estMineur
                      ? t('profilMenu.childProfile', { ns: 'shell' })
                      : t('profilMenu.managedProfile', { ns: 'shell' })}
                </span>
              </span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          )
        })}
        {onLogout && (
          <>
            <div className="my-1.5 border-t border-border" />
            <button
              type="button"
              onClick={() => {
                onClose()
                onLogout()
              }}
              data-cy="profil-menu-logout"
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <LogOut className="h-4 w-4" />
              </span>
              {t('profilMenu.logout', { ns: 'shell' })}
            </button>
          </>
        )}
      </div>
    </>
  )
}
