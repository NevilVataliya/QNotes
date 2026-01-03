import { useState, useEffect } from 'react'
import { Container, Button, Select, NoteCard, NoteCardSkeleton, Skeleton } from '../../components'
import { useNavigate } from 'react-router-dom'
import appwriteService from '../../appwrite/config'
import { extractNotesFromResult, normalizeNote } from '../../utils/noteUtils'

function NotesList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all') // all, public, private
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, title
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        const result = await appwriteService.getNotes()
        const rawNotes = extractNotesFromResult(result)
        if (rawNotes.length === 0) {
          console.warn('Unexpected API response format:', result)
          setNotes([])
          return
        }

        setNotes(rawNotes.map(normalizeNote))
      } catch (err) {
        console.error('Error fetching notes:', err)
        setError('Failed to load notes')
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  const filterOptions = [
    { value: 'all', label: 'All Notes' },
    { value: 'public', label: 'Public Only' },
    { value: 'private', label: 'Private Only' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
  ]

  const filteredAndSortedNotes = notes
    .filter(note => {
      const matchesFilter = filter === 'all' ||
        (filter === 'public' && note.isPublic) ||
        (filter === 'private' && !note.isPublic)

      const matchesSearch = searchQuery === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.$createdAt || b.createdAt) - new Date(a.$createdAt || a.createdAt)
        case 'oldest':
          return new Date(a.$createdAt || a.createdAt) - new Date(b.$createdAt || b.createdAt)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8 transition-colors duration-200">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-10 w-44" rounded="rounded-xl" />
                <Skeleton className="h-5 w-40" rounded="rounded" />
              </div>
              <Skeleton className="h-11 w-40" rounded="rounded-xl" />
            </div>

            <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-8 mb-10 border border-surface-200/70 dark:border-surface-700/70 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <Skeleton className="h-12 w-full" rounded="rounded-xl" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-40" rounded="rounded-xl" />
                  <Skeleton className="h-12 w-40" rounded="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <NoteCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8 transition-colors duration-200">
        <Container>
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-20 h-20 bg-brand-red/10 dark:bg-brand-red/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-red/20">
              <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-brand-red">Error loading notes</h2>
            <p className="text-surface-600 dark:text-surface-300 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-12 transition-colors duration-200">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-surface-900 dark:text-surface-50">My Notes</h1>
              <p className="text-surface-600 dark:text-surface-300 text-lg">{notes.length} total notes</p>
            </div>
            <Button
              onClick={() => navigate('/create-note')}
              className="bg-primary-600 hover:bg-primary-700 mt-4 sm:mt-0 shadow-sm text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Note
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-8 mb-10 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select
                  options={filterOptions}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 rounded-xl"
                />

                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredAndSortedNotes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredAndSortedNotes.map((note) => (
                  <NoteCard key={note.$id || note._id} {...note} />
                ))}
              </div>

              {/* Pagination info */}
              <div className="text-center">
                <p className="text-surface-600 dark:text-surface-300 bg-surface-200/50 dark:bg-surface-800/50 backdrop-blur-sm px-6 py-3 rounded-xl inline-block transition-colors duration-200">
                  Showing {filteredAndSortedNotes.length} of {notes.length} notes
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-surface-200/70 dark:bg-surface-800/60 rounded-full flex items-center justify-center mx-auto mb-8 border border-surface-300/70 dark:border-surface-700/70">
                <svg className="w-12 h-12 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-4">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-surface-600 dark:text-surface-300 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Create your first note to get started'
                }
              </p>
              <Button
                onClick={() => navigate('/create-note')}
                className="bg-primary-600 hover:bg-primary-700 shadow-sm px-8 py-4 text-lg text-white transition-colors duration-200"
              >
                Create Your First Note
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default NotesList
