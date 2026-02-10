'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function ProtectedPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('saving')
    setMessage('')

    if (!user) {
      setStatus('error')
      setMessage('You must be signed in to add a caption.')
      return
    }

    if (!caption.trim() || !imageUrl.trim()) {
      setStatus('error')
      setMessage('Caption and image URL are required.')
      return
    }

    const { data: imageRow, error: imageError } = await supabase
      .from('images')
      .insert({
        url: imageUrl.trim(),
      })
      .select('id')
      .single()

    if (imageError || !imageRow) {
      setStatus('error')
      setMessage(imageError?.message ?? 'Failed to create image.')
      return
    }

    const { error: captionError } = await supabase.from('captions').insert({
      content: caption.trim(),
      image_id: imageRow.id,
      profile_id: user.id,
      is_public: true,
      created_datetime_utc: new Date().toISOString(),
    })

    if (captionError) {
      setStatus('error')
      setMessage(captionError.message)
      return
    }

    setStatus('success')
    setMessage('Caption created successfully.')
    setCaption('')
    setImageUrl('')
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

          {user ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Create Caption</p>
              <p className="mt-2 text-sm text-slate-300">
                This writes to Supabase and demonstrates authenticated data mutation.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
                <label className="grid gap-2 text-sm text-slate-200">
                  Caption
                  <textarea
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                    placeholder="Write a new caption..."
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-200">
                  Image URL
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    type="url"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </label>

                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      status === 'success'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className="mt-2 w-fit rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'saving' ? 'Saving...' : 'Create Caption'}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Sign in to create new captions.
            </div>
          )}

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
