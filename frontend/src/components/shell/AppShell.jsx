import { BottomTabBar } from './BottomTabBar'
import { Sidebar } from './Sidebar'

export function AppShell({ active, onNavigate, profilNom, profilSubtitle, onLogout, children }) {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar active={active} onNavigate={onNavigate} profilNom={profilNom} profilSubtitle={profilSubtitle} onLogout={onLogout} />
      <div className="flex min-h-svh flex-1 flex-col">
        <div className="flex flex-1 flex-col pb-20 md:pb-0">{children}</div>
        <BottomTabBar active={active} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
