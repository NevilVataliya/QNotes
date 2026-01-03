import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Container, Button, NoteCard, Skeleton } from '../../components'
import { Link, useNavigate } from 'react-router-dom'
import appwriteService from '../../appwrite/config'
import { debugLog } from '../../utils/logger.js'

function UserProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notes')
  const userData = useSelector((state) => state.auth.userData)
  const [userStats, setUserStats] = useState({
    notesCount: 0,
    clapsReceived: 0,
    playlistsCount: 0
  })
  const [notes, setNotes] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isOwnProfile = true // For now, assuming this is the current user's profile

  // Redirect if not authenticated
  useEffect(() => {
    if (!userData) {
      navigate('/login')
      return
    }
  }, [userData, navigate])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData) return
      
      try {
        setLoading(true)
        setError(null)

        // Fetch user profile data including notes using getUserProfile method
        // This is the same approach used in UserPublicProfile.jsx which works successfully
        const userProfileData = await appwriteService.getUserProfile(userData.username)
        debugLog('User profile data from getUserProfile:', userProfileData)
        
        if (userProfileData && userProfileData.notes) {
          debugLog('Found user notes:', userProfileData.notes)
          setNotes(userProfileData.notes)
          setUserStats(prev => ({
            ...prev,
            notesCount: userProfileData.notes.length
          }))
        } else {
          // Fallback: try getUserNotes method
          debugLog('Fallback: using getUserNotes method')
          let notesData = await appwriteService.getUserNotes()
          debugLog('User notes data from getUserNotes:', notesData)
          
          if (notesData && notesData.documents) {
            setNotes(notesData.documents)
            setUserStats(prev => ({
              ...prev,
              notesCount: notesData.documents.length
            }))
          } else {
            // Final fallback: fetch all notes and filter
            debugLog('Final fallback: fetching all notes and filtering for user')
            const allNotesData = await appwriteService.getNotes()
            debugLog('All notes data:', allNotesData)
            
            if (allNotesData && allNotesData.documents) {
              const userNotes = allNotesData.documents.filter(note => {
                const noteUserId = note.userId || note.owner?._id || note.owner?.id || note.ownerId
                const currentUserId = userData._id || userData.id
                debugLog('Comparing note user ID:', noteUserId, 'with current user ID:', currentUserId)
                return noteUserId === currentUserId
              })
              debugLog('Filtered user notes:', userNotes)
              setNotes(userNotes)
              setUserStats(prev => ({
                ...prev,
                notesCount: userNotes.length
              }))
            } else {
              setNotes([])
              setUserStats(prev => ({
                ...prev,
                notesCount: 0
              }))
            }
          }
        }

        // Fetch total claps received using the dedicated endpoint
        try {
          const clapsData = await appwriteService.getTotalClapsForUser(userData._id)
          debugLog('User claps data:', clapsData)
          setUserStats(prev => ({
            ...prev,
            clapsReceived: clapsData?.totalClaps || 0
          }))
        } catch (clapError) {
          console.warn('Failed to fetch claps data:', clapError)
          setUserStats(prev => ({
            ...prev,
            clapsReceived: 0
          }))
        }

        // Fetch user's playlists
        const playlistsData = await appwriteService.getPlaylists()
        debugLog('Playlists data:', playlistsData)
        
        if (playlistsData && playlistsData.documents) {
          setPlaylists(playlistsData.documents)
          setUserStats(prev => ({
            ...prev,
            playlistsCount: playlistsData.documents.length
          }))
        } else {
          // Handle case when no playlists are returned
          setPlaylists([])
          setUserStats(prev => ({
            ...prev,
            playlistsCount: 0
          }))
        }

      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load profile data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userData])

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
        <div className="h-48 relative overflow-hidden">
          <Skeleton className="w-full h-full" rounded="rounded-none" />
        </div>

        <Container>
          <div className="relative -mt-16 mb-8">
            <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 border border-surface-200/70 dark:border-surface-700/70 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Skeleton className="w-24 h-24" rounded="rounded-full" />

                <div className="flex-1 space-y-3">
                  <Skeleton className="h-7 w-56" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Skeleton className="h-16 w-28" rounded="rounded-xl" />
                    <Skeleton className="h-16 w-28" rounded="rounded-xl" />
                    <Skeleton className="h-16 w-28" rounded="rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <Skeleton className="h-10 w-48" rounded="rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
              <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} className="bg-primary-600 hover:bg-primary-700 text-white">
              Try Again
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-surface-200 hover:bg-surface-300 dark:bg-surface-800/60 dark:hover:bg-surface-700/80 text-surface-900 dark:text-surface-50">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
      <div className="h-48 relative overflow-hidden">
        {userData?.coverImage ? (
          <>
            <img
              src={userData.coverImage}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 dark:bg-opacity-40"></div>
          </>
        ) : (
          <>
            <div className="w-full h-full bg-gradient-to-r from-surface-900 via-primary-800 to-primary-600"></div>
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        )}
      </div>

      <Container>
        <div className="relative -mt-16 mb-8">
          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 border border-surface-200/70 dark:border-surface-700/70 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden border-4 border-white/80 dark:border-surface-800 shadow-lg">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-surface-700 dark:text-surface-200">{userData?.fullname?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{userData?.fullname || 'User Name'}</h1>
                <p className="text-surface-600 dark:text-surface-400 mb-4">@{userData?.username || 'username'}</p>
                <div className="flex space-x-6 mb-4 flex-wrap">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{userStats.notesCount}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">Notes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-brand-green">{userStats.clapsReceived}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">Claps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{userStats.playlistsCount}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">Playlists</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-700/70 shadow-lg">
            <div className="border-b border-surface-200 dark:border-surface-700">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'notes'
                      ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                      : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50'
                  }`}
                >
                  Public Notes ({userStats.notesCount})
                </button>
                <button
                  onClick={() => setActiveTab('playlists')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'playlists'
                      ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                      : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50'
                  }`}
                >
                  Playlists ({userStats.playlistsCount})
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'notes' && (
                <div>
                  {notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {notes.map((note) => (
                        <NoteCard key={note._id || note.$id} {...note} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-surface-800 dark:text-surface-200 mb-2">No public notes yet</h3>
                      <p className="text-surface-600 dark:text-surface-400 mb-4">Create your first note to share with others</p>
                      {isOwnProfile && (
                        <Link to="/create-note">
                          <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                            Create Note
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'playlists' && (
                <div>
                  {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {playlists.map((playlist) => (
                        <div key={playlist._id || playlist.id} className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 border border-surface-200/70 dark:border-surface-700/70 hover:bg-surface-200/70 dark:hover:bg-surface-700/80 transition-colors">
                          <h3 className="text-lg font-semibold mb-2">{playlist.name}</h3>
                          <p className="text-surface-600 dark:text-surface-400 mb-3">{playlist.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-surface-600 dark:text-surface-400">{playlist.notes?.length || playlist.noteCount || 0} notes</span>
                            <Link to={`/playlist/${playlist._id || playlist.id}`}>
                              <Button className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2">
                                View Playlist
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-surface-800 dark:text-surface-200 mb-2">No playlists yet</h3>
                      <p className="text-surface-600 dark:text-surface-400 mb-4">Create playlists to organize your notes</p>
                      {isOwnProfile && (
                        <Link to="/create-playlist">
                          <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                            Create Playlist
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default UserProfile
