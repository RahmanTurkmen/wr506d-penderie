export function AuthHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-7 flex flex-col items-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-primary-foreground">
        {Icon ? <Icon className="h-7 w-7" /> : <span className="text-2xl font-bold">L</span>}
      </div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
