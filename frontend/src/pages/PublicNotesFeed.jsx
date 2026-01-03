import { useState, useEffect } from 'react'
import { Container, Button, NoteCard, NoteCardSkeleton } from '../components'
import appwriteService from '../appwrite/config'

function PublicNotesFeed() {
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
    setNotes([])
    fetchPublicNotes(true)
  }, [sortBy, filterBy, debouncedSearch])

  useEffect(() => {
    if (page > 1) {
      fetchPublicNotes()
    }
  }, [page])

  const fetchPublicNotes = async (resetData = false) => {
    try {
      setLoading(true)
      const currentPage = resetData ? 1 : page
      const response = await appwriteService.getPublicNotesFeed(currentPage, 5, sortBy, filterBy, debouncedSearch)
      if (response) {
        if (resetData || currentPage === 1) {
          setNotes(response.notes || [])
        } else {
          setNotes(prev => [...prev, ...(response.notes || [])])
        }
        setHasMore(response.hasMore || false)
      }
    } catch (err) {
      setError('Failed to load public notes')
      console.error('Error fetching public notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreNotes = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Newest' },
    { value: 'most-clapped', label: 'Most Clapped' },
  ]

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ]

  const sortedAndFilteredNotes = notes

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-primary-900 dark:text-surface-50 py-4 sm:py-8 transition-colors duration-200">
      <Container>
        <div className="max-w-6xl mx-auto px-2 sm:px-0">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-200">Discover Notes</h1>
            <p className="text-surface-600 dark:text-surface-300 text-sm sm:text-base transition-colors duration-200">Explore public notes from the QNotes community</p>
          </div>

          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-surface-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search public notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-2 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-lg text-primary-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base sm:text-sm transition-[border-color,box-shadow,background-color,color] duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-surface-700 dark:text-surface-300 mb-1 sm:hidden transition-colors duration-200">Filter by time</label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-lg text-primary-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base sm:text-sm transition-[border-color,box-shadow,background-color,color] duration-200"
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs text-surface-700 dark:text-surface-300 mb-1 sm:hidden transition-colors duration-200">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-lg text-primary-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base sm:text-sm transition-[border-color,box-shadow,background-color,color] duration-200"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading && page === 1 ? (
            <div className="space-y-4 sm:space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <NoteCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-red/10 dark:bg-brand-red/15 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 border border-brand-red/20">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-brand-red transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-brand-red mb-2 transition-colors duration-200">Error Loading Notes</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6 text-sm sm:text-base transition-colors duration-200">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-brand-red hover:bg-brand-red/90 px-6 py-3 text-white transition-colors duration-200">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {sortedAndFilteredNotes.map((note) => (
                <NoteCard key={note._id || note.$id} {...note} />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div className="text-center mt-8 sm:mt-12">
              <Button
                onClick={loadMoreNotes}
                bgColor='bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700'
                textColor='text-surface-700 dark:text-surface-200'
                className="px-6 py-3 w-full sm:w-auto"
              >
                Load More Notes
              </Button>
            </div>
          )}

          {loading && page > 1 && (
            <div className="text-center mt-8 sm:mt-12">
              <div className="space-y-4 sm:space-y-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <NoteCardSkeleton key={index} />
                ))}
              </div>
            </div>
          )}

          {sortedAndFilteredNotes.length === 0 && !loading && (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-200/70 dark:bg-surface-800/60 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 border border-surface-300/70 dark:border-surface-700/70">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-surface-600 dark:text-surface-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-surface-800 dark:text-surface-200 mb-2 transition-colors duration-200">No notes found</h3>
              <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base transition-colors duration-200">Try adjusting your filters or check back later for new content.</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default PublicNotesFeed
