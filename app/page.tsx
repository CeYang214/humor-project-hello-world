'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface Caption {
  id: string
  content: string
  created_datetime_utc: string
  is_public: boolean
  profile_id: string
  image_id: string
  imageUrl?: string // We'll add the URL separately
}

const SkeletonCard = () => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-400/50"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-400/50 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-400/50 rounded w-1/2"></div>
    </div>
  </div>
)

export default function Home() {
  const supabase = useMemo(() => createClient(), [])
  const [captions, setCaptions] = useState<Caption[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const captionsPerPage = 36

  useEffect(() => {
    fetchCaptions()
  }, [currentPage])

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

  async function fetchCaptions() {
    setLoading(true)

    // Fetch MORE captions than we need (about 2x-3x) to account for missing images
    const fetchMultiplier = 3
    const from = (currentPage - 1) * captionsPerPage * fetchMultiplier
    const to = from + (captionsPerPage * fetchMultiplier) - 1

    console.log(`Fetching captions from ${from} to ${to} for page ${currentPage}`)

    // Fetch captions with their image_id
    const { data: captionsData, error: captionsError } = await supabase
      .from('captions')
      .select('id, content, created_datetime_utc, is_public, profile_id, image_id')
      .range(from, to)

    if (captionsError) {
      console.error('Supabase captions error:', captionsError)
      setLoading(false)
      return
    }

    if (!captionsData || captionsData.length === 0) {
      console.log('No captions data returned')
      setCaptions([])
      setLoading(false)
      return
    }

    console.log(`Fetched ${captionsData.length} captions`)

    // Get unique image IDs
    const imageIds = [...new Set(captionsData.map(c => c.image_id).filter(Boolean))]
    console.log(`Found ${imageIds.length} unique image IDs`)

    // Fetch all images at once
    const { data: imagesData, error: imagesError } = await supabase
      .from('images')
      .select('id, url')
      .in('id', imageIds)

    if (imagesError) {
      console.error('Supabase images error:', imagesError)
    }

    console.log(`Fetched ${imagesData?.length || 0} images`)

    // Create a map of image_id to url
    const imageMap = new Map(imagesData?.map(img => [img.id, img.url]) || [])

    // Add image URLs to captions
    const captionsWithImages = captionsData.map(caption => ({
      ...caption,
      imageUrl: imageMap.get(caption.image_id) || undefined
    }))

    // Filter to only captions with valid image URLs
    const validCaptions = captionsWithImages.filter(c => c.imageUrl && c.imageUrl.trim() !== '')

    console.log(`${validCaptions.length} captions have valid images`)

    // Take exactly 36 (or whatever we have if less)
    const finalCaptions = validCaptions.slice(0, captionsPerPage)
    console.log(`Displaying ${finalCaptions.length} captions on this page`)

    setCaptions(finalCaptions)
    setLoading(false)

    // Get total count for pagination (only on first load)
    if (currentPage === 1) {
      const { count } = await supabase
        .from('captions')
        .select('*', { count: 'exact', head: true })

      if (count) {
        setTotalPages(Math.ceil(count / (captionsPerPage * fetchMultiplier)))
      }
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSignIn = async () => {
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="text-sm text-gray-300">
            {user ? (
              <span>Signed in as {user.email ?? 'Google user'}</span>
            ) : (
              <span>Sign in to access the gated route.</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/protected"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Go to Gated Route
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-sky-600"
              >
                Continue with Google
              </button>
            )}
          </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Caption Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A curated collection of creative and witty captions, paired with their inspiring images.
          </p>
        </header>

        <section className="mx-auto mb-12 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Authentication</p>
              <p className="mt-3 text-lg text-white">
                Are you who you say you are?
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Authorization</p>
              <p className="mt-3 text-lg text-white">
                Do you have permission to access what you’re trying to access?
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : captions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No captions with images found on this page.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {captions.map((caption) => (
                <CaptionCard key={caption.id} caption={caption} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-6 mt-12">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentPage === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                Previous
              </button>

              <span className="text-lg font-medium text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

interface CaptionCardProps {
  caption: Caption
}

const CaptionCard: React.FC<CaptionCardProps> = ({ caption }) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105">
      {caption.imageUrl && !imageError ? (
        <img
          src={caption.imageUrl}
          alt={`Image for caption: ${caption.content.substring(0, 30)}`}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
          <p className="text-gray-500">
            {imageError ? 'Image failed to load' : 'No Image'}
          </p>
        </div>
      )}
      <div className="p-6">
        <p className="text-lg font-medium text-gray-100 mb-2">{caption.content}</p>
        <p className="text-sm text-gray-400">
          {new Date(caption.created_datetime_utc).toLocaleDateString()}
        </p>

      </div>
    </div>
  )
}
