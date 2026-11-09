export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
