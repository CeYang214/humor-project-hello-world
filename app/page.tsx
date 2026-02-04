'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Home() {
  const [captions, setCaptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCaptions() {
      const { data, error } = await supabase
        .from('captions')
        .select('*')
        .limit(20)

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error message:', error.message)
      } else {
        console.log('Captions data:', data)
        setCaptions(data)
      }
      setLoading(false)
    }

    fetchCaptions()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Captions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {captions.map((caption) => (
          <div key={caption.id} className="border rounded-lg p-4 shadow">
            <p className="text-lg">{caption.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(caption.created_datetime_utc).toLocaleDateString()}
            </p>
          </div>
        ))}

      </div>
    </div>
  )
}