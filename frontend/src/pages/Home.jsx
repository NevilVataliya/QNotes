import {useEffect, useState} from 'react'
import {Container, Button, NoteCard, NoteCardSkeleton} from '../components'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import appwriteService from '../appwrite/config'

function Home() {
    const navigate = useNavigate()
    const [sortBy, setSortBy] = useState('newest')
    const [filterBy, setFilterBy] = useState('all')
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const isAuthenticated = useSelector((state) => state.auth.status)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)

        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        if (isAuthenticated) {
            setPage(1)
            setNotes([])
            fetchPublicNotes(true)
        }
    }, [sortBy, filterBy, debouncedSearch, isAuthenticated])

    useEffect(() => {
        if (isAuthenticated && page > 1) {
            fetchPublicNotes()
        }
    }, [page, isAuthenticated])

    const fetchPublicNotes = async (resetData = false) => {
        try {
            setLoading(true)
            const currentPage = resetData ? 1 : page
            const response = await appwriteService.getPublicNotesFeed(currentPage, 10, sortBy, filterBy, debouncedSearch)
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

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 transition-colors duration-200">
                <section className="py-20 sm:py-28">
                    <Container>
                        <div className="max-w-5xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20 mb-6">
                                <span className="text-sm font-semibold">QNotes</span>
                                <span className="text-xs text-surface-600 dark:text-surface-400">Audio • Text • PDF</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
                                Turn audio, text, and PDFs into
                                <span className="text-primary-700 dark:text-primary-300"> revision-ready notes</span>.
                            </h1>

                            <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto leading-relaxed mb-10">
                                Add content in the format you already have. QNotes uses AI to generate structured notes you can revise from, and quizzes for each note to quickly check understanding.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/signup">
                                    <Button className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors duration-200">
                                        Create an account
                                    </Button>
                                </Link>
                                <Link to="/discover">
                                    <Button className="w-full sm:w-auto bg-surface-200/70 dark:bg-surface-800/60 hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 px-8 py-3.5 rounded-xl font-semibold transition-colors duration-200">
                                        Explore public notes
                                    </Button>
                                </Link>
                                <Link to="/features">
                                    <Button className="w-full sm:w-auto bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-200 px-8 py-3.5 rounded-xl font-semibold transition-colors duration-200">
                                        See features
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-5 border border-surface-200/70 dark:border-surface-700/70 text-left">
                                    <div className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">Multi-format input</div>
                                    <div className="text-sm text-surface-600 dark:text-surface-400">Create from audio recordings, text, or PDFs.</div>
                                </div>
                                <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-5 border border-surface-200/70 dark:border-surface-700/70 text-left">
                                    <div className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">AI-generated notes</div>
                                    <div className="text-sm text-surface-600 dark:text-surface-400">Structured summaries you can revise quickly.</div>
                                </div>
                                <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-5 border border-surface-200/70 dark:border-surface-700/70 text-left">
                                    <div className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">Quiz for each note</div>
                                    <div className="text-sm text-surface-600 dark:text-surface-400">Check knowledge and reinforce concepts.</div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                <section className="py-14">
                    <Container>
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold">Built for real workflows</h2>
                                    <p className="text-surface-600 dark:text-surface-300 mt-2">Capture content once, then revise and practice with confidence.</p>
                                </div>
                                <Link to="/discover" className="text-primary-700 dark:text-primary-300 font-semibold hover:underline">
                                    Browse the community
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: 'Add content in any format',
                                        body: 'Start from audio, text, or PDFs — whatever you already have for a topic.',
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        title: 'AI turns it into notes',
                                        body: 'Get structured, revision-friendly notes generated from your content.',
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        title: 'Learn with quizzes',
                                        body: 'Generate a quiz for each note to test recall and improve retention.',
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M15 12h.01M10 16h4m-7 4h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        title: 'Organize and share when ready',
                                        body: 'Build playlists and publish notes publicly so others can revise too.',
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                                            </svg>
                                        ),
                                    },
                                ].map((card) => (
                                    <div key={card.title} className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 border border-surface-200/70 dark:border-surface-700/70">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-700 dark:text-primary-300 flex items-center justify-center border border-primary-500/20">
                                                {card.icon}
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-surface-900 dark:text-surface-100">{card.title}</div>
                                                <div className="text-surface-600 dark:text-surface-300 mt-1">{card.body}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Container>
                </section>

                <section className="py-16">
                    <Container>
                        <div className="max-w-6xl mx-auto bg-primary-600 rounded-3xl p-8 sm:p-10 text-white">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold">Start writing in minutes</h2>
                                    <p className="text-white/80 mt-2 max-w-xl">Create an account, upload audio, and get your structured notes ready.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link to="/signup">
                                        <Button textColor='text-slate-950' className="w-full sm:w-auto bg-white hover:bg-surface-100 px-7 py-3 rounded-xl font-semibold transition-colors duration-200">
                                            Sign up
                                        </Button>
                                    </Link>
                                    <Link to="/contact">
                                        <Button className="w-full sm:w-auto bg-transparent hover:bg-white/10 border border-white/30 text-white px-7 py-3 rounded-xl font-semibold transition-colors duration-200">
                                            Contact
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>
            </div>
        )
    }

    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-6 sm:py-10 transition-colors duration-200">
                <Container>
                    <div className="max-w-6xl mx-auto px-2 sm:px-0">
                        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-surface-900 dark:text-surface-50 transition-colors duration-200">
                                    Discover
                                </h1>
                                <p className="text-surface-600 dark:text-surface-300 text-base sm:text-lg transition-colors duration-200">
                                    Browse public notes and revise concepts faster.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => navigate('/create-note')}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-colors duration-200"
                                >
                                    Create note
                                </Button>
                                <Button
                                    onClick={() => navigate('/playlists')}
                                    className="bg-surface-200/70 dark:bg-surface-800/60 hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 px-5 py-2.5 rounded-xl transition-colors duration-200"
                                >
                                    Playlists
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
                            <div className="flex flex-col gap-4">
                                <div className="w-full">
                                    <div className="relative">
                                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-surface-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search public notes..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 sm:py-3 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base sm:text-sm transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-surface-600 dark:text-surface-400 mb-2 sm:hidden font-medium transition-colors duration-200">Filter by time</label>
                                        <select
                                            value={filterBy}
                                            onChange={(e) => setFilterBy(e.target.value)}
                                            className="w-full px-4 py-3 sm:py-2.5 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base sm:text-sm transition-all duration-200"
                                        >
                                            {filterOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-xs text-surface-600 dark:text-surface-400 mb-2 sm:hidden font-medium transition-colors duration-200">Sort by</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-4 py-3 sm:py-2.5 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base sm:text-sm transition-all duration-200"
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
                            <div className="space-y-6 sm:space-y-8">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <NoteCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 sm:py-20 px-4">
                                <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                                    <svg className="w-10 h-10 text-brand-red transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-brand-red mb-3 transition-colors duration-200">Couldn’t load notes</h3>
                                <p className="text-surface-600 dark:text-surface-400 mb-8 text-base sm:text-lg transition-colors duration-200">{error}</p>
                                <Button onClick={fetchPublicNotes} className="bg-primary-600 hover:bg-primary-700 px-8 py-3 font-medium text-white transition-colors duration-200">
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6 sm:space-y-8">
                                {notes.map((note) => (
                                    <NoteCard key={note._id || note.$id} {...note} />
                                ))}
                            </div>
                        )}
                        {hasMore && !loading && notes.length > 0 && (
                            <div className="text-center mt-12">
                                <Button 
                                    onClick={loadMoreNotes} 
                                    className="bg-surface-200/70 dark:bg-surface-800/60 hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 px-8 py-3 w-full sm:w-auto font-medium transition-all duration-200"
                                >
                                    Load More Notes
                                </Button>
                            </div>
                        )}

                        {loading && page > 1 && (
                            <div className="text-center mt-12">
                                <div className="space-y-6 sm:space-y-8">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <NoteCardSkeleton key={index} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {notes.length === 0 && !loading && !error && (
                            <div className="text-center py-16 sm:py-20 px-4">
                                <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-surface-200 dark:border-surface-700 transition-colors duration-200">
                                    <svg className="w-10 h-10 text-primary-700 dark:text-primary-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 mb-3 transition-colors duration-200">No notes found</h3>
                                <p className="text-surface-600 dark:text-surface-400 text-base sm:text-lg mb-8 transition-colors duration-200">Try a different search or broaden your filters.</p>
                                <Link to="/create-note">
                                    <Button className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-3 font-medium transition-colors duration-200">
                                        Create a note
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        )
    }

    return null
}

export default Home