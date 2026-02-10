'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function ProtectedPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) {
        setUser(data.user ?? null)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Gated</p>
          <h1 className="mt-4 text-4xl font-bold">You made it inside.</h1>
          <p className="mt-3 text-lg text-slate-200">
            This route is protected by Supabase auth + middleware. Only signed-in users can see it.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Session</p>
            <p className="mt-2 text-base text-white">
              {user?.email ? `Signed in as ${user.email}` : 'Loading account details...'}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Back to Home
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-sky-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
