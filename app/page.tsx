'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface Caption {
  id: string
  content: string
  created_datetime_utc: string
  image_id: string
  images: {
    url: string
  }[]
}

const PAGE_SIZE = 36;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchPaginatedCaptions() {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // First, get the total count of captions that have an image
      const { count, error: countError } = await supabase
        .from('captions')
        .select('id, content, created_datetime_utc, image_id, images!inner(url)', { count: 'exact', head: true })
        .not('images.url', 'is', null);

      if (countError) {
        console.error('Supabase count error:', countError);
        setTotalCount(0);
      } else {
        setTotalCount(count || 0);
      }

      // Then, fetch the data for the current page
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('captions')
        .select('id, content, created_datetime_utc, image_id, images!inner(url)')
        .not('images.url', 'is', null)
        .order('created_datetime_utc', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Supabase fetch error:', error)
      } else {
        setCaptions(data as Caption[])
        // Log the first 3 image URLs for debugging
        data.slice(0, 3).forEach((caption, index) => {
          if (caption.images && caption.images[0]?.url) {
            console.log(`Debug: Caption ${index + 1} Image URL:`, caption.images[0].url);
          } else {
            console.log(`Debug: Caption ${index + 1} has no image URL.`);
          }
        });
      }
      setLoading(false)
    }

    fetchPaginatedCaptions()
  }, [currentPage])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {captions.map((caption) => (
                <CaptionCard key={caption.id} caption={caption} />
              ))}
            </div>
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
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

  if (imageError) {
    // Log which image failed to load
    console.error('Image failed to load:', caption.images[0]?.url);
    return null; // Don't render the card if the image fails to load
  }

  // The query now ensures that images.url exists.
  // We can safely assume caption.images[0]?.url exists due to the filter and inner join.
  // Using '!' for non-null assertion as TypeScript knows it's there.
  return (
    <div
      className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
    >
      <img
        src={caption.images[0]!.url} // Use non-null assertion as per the filter
        alt={`Image for caption: ${caption.content.substring(0, 30)}`}
        className="w-full h-48 object-cover"
        onError={() => setImageError(true)}
        crossOrigin="anonymous" // Add crossOrigin attribute
      />
      <div className="p-6">
        <p className="text-lg font-medium text-gray-100 mb-2">{caption.content}</p>
        <p className="text-sm text-gray-400">
          {new Date(caption.created_datetime_utc).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-purple-600/50 rounded-lg backdrop-blur-sm text-white font-semibold transition-colors duration-300 hover:bg-purple-600/80 disabled:bg-gray-600/50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-lg font-medium text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-4 py-2 bg-purple-600/50 rounded-lg backdrop-blur-sm text-white font-semibold transition-colors duration-300 hover:bg-purple-600/80 disabled:bg-gray-600/50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}