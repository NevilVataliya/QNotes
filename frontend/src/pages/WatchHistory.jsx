import { useState } from 'react'
import { Container, Button } from '../components'
import { useNavigate } from 'react-router-dom'

function WatchHistory() {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')

  const [watchHistory, setWatchHistory] = useState([])

  const filteredAndSortedHistory = watchHistory
    .filter(item => {
      if (filterBy === 'all') return true
      const watchDate = new Date(item.watchedAt)
      const now = new Date()
      const diffTime = now - watchDate
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      switch (filterBy) {
        case 'today': return diffDays < 1
        case 'week': return diffDays < 7
        case 'month': return diffDays < 30
        default: return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.watchedAt) - new Date(a.watchedAt)
        case 'oldest':
          return new Date(a.watchedAt) - new Date(b.watchedAt)
        case 'most-viewed':
          return b.progress - a.progress
        default:
          return 0
      }
    })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays < 1) {
      return 'Today'
    } else if (diffDays < 2) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleContinueWatching = (noteId) => {
    navigate(`/note/${noteId}`)
  }

  const handleRemoveFromHistory = (historyId) => {
    setWatchHistory(prev => prev.filter(item => item.$id !== historyId))
  }

  const handleClearHistory = () => {
    setWatchHistory([])
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8 transition-colors duration-200">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Watch History</h1>
                <p className="text-surface-600 dark:text-surface-400 transition-colors duration-200">Continue where you left off</p>
              </div>
              <Button
                onClick={handleClearHistory}
                className="bg-brand-red hover:bg-brand-red/90 text-white text-sm"
              >
                Clear History
              </Button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-2 transition-colors duration-200">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 bg-white/80 dark:bg-surface-900/60 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-viewed">Most Viewed</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-2 transition-colors duration-200">Filter by</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-2 bg-white/80 dark:bg-surface-900/60 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAndSortedHistory.map((item) => (
              <div key={item.$id} className="bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl p-6 border border-surface-200/70 dark:border-surface-700/70 hover:border-surface-300/70 dark:hover:border-surface-600/70 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-surface-200/70 dark:bg-surface-900/40 rounded-lg flex items-center justify-center relative transition-colors duration-200 border border-surface-300/70 dark:border-surface-700/70">
                          <svg className="w-8 h-8 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3a1 1 0 100-2 1 1 0 000 2z" />
                          </svg>
                          <svg className="absolute inset-0 w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-primary-500/25"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={`${item.progress}, 100`}
                              className="text-primary-500"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-semibold mb-1 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer transition-colors duration-200"
                          onClick={() => navigate(`/note/${item.note.$id}`)}
                        >
                          {item.note.title}
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-300 mb-2 transition-colors duration-200">
                          by {item.note.author.name} • {formatDate(item.watchedAt)}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-surface-600 dark:text-surface-300 transition-colors duration-200">
                          <span>Duration: {formatDuration(item.duration)}</span>
                          <span>Progress: {item.progress}%</span>
                          {item.isCompleted && (
                            <span className="text-brand-green">Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      onClick={() => handleContinueWatching(item.note.$id)}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 transition-colors duration-200"
                    >
                      {item.isCompleted ? 'Watch Again' : 'Continue'}
                    </Button>
                    <Button
                      onClick={() => handleRemoveFromHistory(item.$id)}
                      className="bg-surface-200/80 dark:bg-surface-900/40 hover:bg-surface-200 dark:hover:bg-surface-900/60 border border-surface-300/70 dark:border-surface-700/70 text-surface-900 dark:text-surface-50 text-sm px-4 py-2 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedHistory.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-surface-200/70 dark:bg-surface-900/40 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 border border-surface-300/70 dark:border-surface-700/70">
                <svg className="w-10 h-10 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-surface-800 dark:text-surface-200 mb-2 transition-colors duration-200">No watch history</h3>
              <p className="text-surface-600 dark:text-surface-300 mb-6 transition-colors duration-200">Your watched notes will appear here</p>
              <Button
                onClick={() => navigate('/discover')}
                className="bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
              >
                Browse Notes
              </Button>
            </div>
          )}

          {filteredAndSortedHistory.length > 0 && (
            <div className="mt-12 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl p-6 border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200">
              <h3 className="text-lg font-semibold mb-4">Your Watching Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-200">{filteredAndSortedHistory.length}</div>
                  <div className="text-sm text-surface-600 dark:text-surface-300 transition-colors duration-200">Total Watched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-green transition-colors duration-200">
                    {filteredAndSortedHistory.filter(item => item.isCompleted).length}
                  </div>
                  <div className="text-sm text-surface-600 dark:text-surface-300 transition-colors duration-200">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-orange transition-colors duration-200">
                    {Math.round(filteredAndSortedHistory.reduce((acc, item) => acc + item.progress, 0) / filteredAndSortedHistory.length)}%
                  </div>
                  <div className="text-sm text-surface-600 dark:text-surface-300 transition-colors duration-200">Avg Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-purple transition-colors duration-200">
                    {Math.round(filteredAndSortedHistory.reduce((acc, item) => acc + item.duration, 0) / 60)}m
                  </div>
                  <div className="text-sm text-surface-600 dark:text-surface-300 transition-colors duration-200">Total Time</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default WatchHistory
