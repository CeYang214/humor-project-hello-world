'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface Caption {
  id: string
  content: string
  created_datetime_utc: string
  is_public: boolean
  profile_id: string
  image_id: string
  images: {
    url: string
  } | null
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
  const [captions, setCaptions] = useState<Caption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCaptions() {
      const { data, error } = await supabase
        .from('captions')
        .select('*, images(url)')
        .limit(20)

      if (error) {
        console.error('Supabase error:', error)
      } else {
        console.log('Full captions data:', data) // Log full caption data
        setCaptions(data as Caption[])
      }
      setLoading(false)
    }

    fetchCaptions()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Caption Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A curated collection of creative and witty captions, paired with their inspiring images.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {captions
              .filter(caption => {
                console.log(`Caption ID: ${caption.id}, Image URL: ${caption.images?.url}`);
                return caption.images?.url;
              })
              .map((caption) => (
                <CaptionCard key={caption.id} caption={caption} />
              ))}
          </div>
        )}
      </main>
    </div>
  )
}

interface CaptionCardProps {
  caption: Caption;
}

const CaptionCard: React.FC<CaptionCardProps> = ({ caption }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
    >
      {caption.images?.url && !imageError ? (
        <img
          src={caption.images.url}
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
  );
};
