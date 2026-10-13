import { Lock, Package, RefreshCw } from 'lucide-react'

const PITCH = [
  { icon: Package, text: 'Tout ce que tu possèdes, au même endroit' },
  { icon: RefreshCw, text: 'Prête et emprunte sans rien oublier' },
  { icon: Lock, text: 'Privé par défaut, partagé quand tu veux' },
]

export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <aside className="hidden w-[42%] max-w-xl shrink-0 flex-col justify-center gap-8 bg-primary px-16 py-12 text-primary-foreground md:flex">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-white">
          <span className="text-3xl font-bold text-primary">L</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">Lumen</h1>
          <p className="max-w-sm text-xl text-secondary">
            Range, retrouve, prête. Entre amis, sans rien publier.
          </p>
        </div>
        <ul className="space-y-4">
          {PITCH.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[15px] font-medium">
              <Icon className="h-5 w-5 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
