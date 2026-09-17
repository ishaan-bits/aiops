export default function SettingsPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="glass rounded-3xl p-12 text-center max-w-md w-full">
        <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-4 mb-6 shadow-lg shadow-violet-500/25">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Settings</h1>
        <p className="text-sm dark:text-white/40 text-muted-foreground mb-6">
          Manage your account preferences and integrations
        </p>
        <div className="rounded-xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-violet-500/10 border border-violet-500/20 px-5 py-4">
          <p className="text-sm font-medium text-violet-300">
            Coming Soon
          </p>
          <p className="text-xs text-violet-400/60 mt-1">
            Configuration options will be available in a future update
          </p>
        </div>
      </div>
    </div>
  );
}
