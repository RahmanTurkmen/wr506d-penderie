import { BottomTabBar } from './BottomTabBar'

export function AppShell({ active, onNavigate, children }) {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <div className="flex flex-1 flex-col pb-20">{children}</div>
      <BottomTabBar active={active} onNavigate={onNavigate} />
    </div>
  )
}
