import { useState, useEffect } from 'react'
import { Container, Button, PlaylistCardSkeleton, Skeleton } from '../../components'
import { Link, useNavigate } from 'react-router-dom'
import playlistService from '../../services/playlistService'

function Playlists() {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: false
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const result = await playlistService.getPlaylistsByUser()
      if (result && result.data) {
        setPlaylists(result.data)
      }
    } catch (err) {
      console.error('Error fetching playlists:', err)
      setError('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!newPlaylist.name.trim() || !newPlaylist.description.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      setIsCreating(true)
      const result = await playlistService.createPlaylist(newPlaylist)
      if (result && result.data) {
        setPlaylists([result.data, ...playlists])
        setNewPlaylist({ name: '', description: '', isPublic: false })
        setShowCreateModal(false)
      }
    } catch (err) {
      console.error('Error creating playlist:', err)
      alert(err.message || 'Failed to create playlist')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return
    }

    try {
      await playlistService.deletePlaylist(playlistId)
      setPlaylists(playlists.filter(p => p._id !== playlistId))
    } catch (err) {
      console.error('Error deleting playlist:', err)
      alert(err.message || 'Failed to delete playlist')
    }
  }

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-12 transition-colors duration-200">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-10 w-52" rounded="rounded-xl" />
                <Skeleton className="h-5 w-44" />
              </div>
              <Skeleton className="h-11 w-44" rounded="rounded-xl" />
            </div>

            <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-10 border border-surface-200/70 dark:border-surface-700/70 shadow-sm">
              <Skeleton className="h-12 w-full" rounded="rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <PlaylistCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-12 transition-colors duration-200">
        <Container>
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-20 h-20 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-red/25">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-brand-red">Error loading playlists</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6">{error}</p>
            <Button
              onClick={fetchPlaylists}
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-surface-900 dark:text-surface-50">My Playlists</h1>
              <p className="text-surface-600 dark:text-surface-400 text-lg">{playlists.length} total playlists</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 mt-4 sm:mt-0 shadow-lg shadow-primary-600/20 text-white"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Playlist
            </Button>
          </div>

          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-10 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200"
              />
            </div>
          </div>

          {filteredPlaylists.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredPlaylists.map((playlist) => (
                  <div key={playlist._id} className="relative group">
                    <Link to={`/playlist/${playlist._id}`}>
                      <div className='w-full bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/90 dark:hover:bg-surface-800/80 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg border border-surface-200/70 dark:border-surface-700/70 hover:border-surface-300/70 dark:hover:border-surface-600/70'>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            playlist.isPublic
                              ? 'bg-brand-green/10 dark:bg-brand-green/15 text-brand-green border border-brand-green/30'
                              : 'bg-surface-200/70 dark:bg-surface-800/60 text-surface-700 dark:text-surface-300 border border-surface-300/70 dark:border-surface-700/70'
                          }`}>
                            {playlist.isPublic ? 'Public' : 'Private'}
                          </span>
                          <span className="text-xs text-surface-600 dark:text-surface-400 bg-surface-200/70 dark:bg-surface-800/60 px-2 py-1 rounded-full">
                            {formatDate(playlist.createdAt)}
                          </span>
                        </div>

                        <div className='w-full h-32 bg-surface-100 dark:bg-surface-800/40 rounded-xl flex items-center justify-center mb-4 border border-surface-200 dark:border-surface-700 group-hover:border-primary-300 dark:group-hover:border-primary-600 transition-colors duration-200'>
                          <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>

                        <div className="space-y-3">
                          <h2 className='text-xl font-bold text-surface-900 dark:text-surface-50 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-200 line-clamp-2'>
                            {playlist.name || 'Untitled Playlist'}
                          </h2>
                          {playlist.description && (
                            <p className='text-surface-600 dark:text-surface-400 text-sm line-clamp-3 leading-relaxed'>
                              {playlist.description}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-surface-600 dark:text-surface-400 bg-surface-200/70 dark:bg-surface-800/60 px-2 py-1 rounded-full">
                            {playlist.notes?.length || 0} notes
                          </span>
                          <svg className='w-5 h-5 text-surface-600 dark:text-surface-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 group-hover:translate-x-1 transition-all duration-200' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePlaylist(playlist._id)
                        }}
                        className="bg-brand-red/90 hover:bg-brand-red text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-surface-600 dark:text-surface-400 bg-surface-200/50 dark:bg-surface-800/50 backdrop-blur-sm px-6 py-3 rounded-xl inline-block transition-colors duration-200">
                  Showing {filteredPlaylists.length} of {playlists.length} playlists
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-surface-100 dark:bg-surface-800/40 rounded-full flex items-center justify-center mx-auto mb-8 border border-surface-200 dark:border-surface-700 shadow-sm">
                <svg className="w-12 h-12 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
                {searchQuery ? 'No playlists found' : 'No playlists yet'}
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first playlist to organize your notes'
                }
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 px-8 py-4 text-lg text-white"
              >
                Create Your First Playlist
              </Button>
            </div>
          )}
        </div>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-200">
            <div className="bg-white dark:bg-surface-900/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-surface-200 dark:border-surface-800 shadow-2xl transition-colors duration-200">
              <h2 className="text-2xl font-bold mb-6 text-surface-900 dark:text-surface-50">Create New Playlist</h2>
              
              <form onSubmit={handleCreatePlaylist} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200"
                    placeholder="Enter playlist name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200 resize-none"
                    placeholder="Describe your playlist"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newPlaylist.isPublic}
                    onChange={(e) => setNewPlaylist({...newPlaylist, isPublic: e.target.checked})}
                    className="w-4 h-4 text-primary-600 bg-surface-200 dark:bg-surface-800 border-surface-400 dark:border-surface-700 rounded focus:ring-primary-600 focus:ring-2"
                  />
                  <label htmlFor="isPublic" className="ml-3 text-sm text-surface-700 dark:text-surface-300">
                    Make this playlist public
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-200 transition-colors duration-200"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Playlist'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

export default Playlists
