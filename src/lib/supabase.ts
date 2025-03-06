import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Cache-Control': 'max-age=300' // Cache responses for 5 minutes
    }
  }
})

// Cache for storing fetched data
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Wrapper for Supabase queries with caching
export const cachedQuery = async (
  key: string,
  queryFn: () => Promise<{ data: any; error: any }>,
  duration = CACHE_DURATION
) => {
  const cached = cache.get(key)
  const now = Date.now()

  if (cached && now - cached.timestamp < duration) {
    console.log(`Using cached data for ${key}`)
    return { data: cached.data, error: null }
  }

  const { data, error } = await queryFn()
  
  if (!error && data) {
    cache.set(key, { data, timestamp: now })
  }

  return { data, error }
}

// Prefetch data that will likely be needed soon
export const prefetch = async (queries: { key: string; queryFn: () => Promise<{ data: any; error: any }> }[]) => {
  return Promise.all(
    queries.map(async ({ key, queryFn }) => {
      const { data, error } = await queryFn()
      if (!error && data) {
        cache.set(key, { data, timestamp: Date.now() })
      }
    })
  )
}

// Clear cache for a specific key or all cache if no key provided
export const clearCache = (key?: string) => {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// Utility to generate cache keys
export const createCacheKey = (table: string, query: Record<string, any>) => {
  return `${table}:${JSON.stringify(query)}`
} 