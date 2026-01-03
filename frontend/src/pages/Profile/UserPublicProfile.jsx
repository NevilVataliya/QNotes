import { useState, useEffect } from 'react'
import { Container, Button, NoteCard, Skeleton } from '../../components'
import { useNavigate, useParams } from 'react-router-dom'
import appwriteService from '../../appwrite/config'
import playlistService from '../../services/playlistService'
import { debugLog } from '../../utils/logger.js'

function UserPublicProfile() {
  const navigate = useNavigate()
  const { username } = useParams()

  const [activeTab, setActiveTab] = useState('notes')
  const [user, setUser] = useState(null)
  const [userNotes, setUserNotes] = useState([])
  const [userPlaylists, setUserPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notesFetched, setNotesFetched] = useState(false)
  const [userStats, setUserStats] = useState({
    notesCount: 0,
    clapsReceived: 0,
    playlistsCount: 0,
  })

  const formatJoinedDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const userData = await appwriteService.getUserProfile(username)
        if (userData) {
          // Set user data
          setUser({
            ...userData,
            name: userData.fullname || userData.name
          })
          
          // If notes are included in userData, use them
          if (userData.notes && userData.notes.length > 0) {
            debugLog('User notes from getUserProfile:', userData.notes)
            setUserNotes(userData.notes)
            setNotesFetched(true)
            setUserStats(prev => ({
              ...prev,
              notesCount: userData.notes.length
            }))
          }
          
          // Fetch total claps received using the dedicated endpoint
          try {
            const clapsData = await appwriteService.getTotalClapsForUser(userData._id || userData.id)
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
          
          // Fetch user's public playlists
          try {
            // Try the existing method first
            let playlistsData = await playlistService.getPlaylistByUsername(username)
            debugLog('Playlists data from getPlaylistByUsername:', playlistsData)
            
            if (playlistsData && playlistsData.data) {
              setUserPlaylists(playlistsData.data)
              setUserStats(prev => ({
                ...prev,
                playlistsCount: playlistsData.data.length
              }))
            } else {
              // Fallback: try appwriteService.getPlaylists() and filter
              debugLog('Fallback: trying appwriteService.getPlaylists()')
              const allPlaylistsData = await appwriteService.getPlaylists()
              debugLog('All playlists data:', allPlaylistsData)
              
              if (allPlaylistsData && allPlaylistsData.documents) {
                // Filter playlists for the specific user
                const filteredUserPlaylists = allPlaylistsData.documents.filter(playlist => 
                  playlist.owner?.username === username || 
                  playlist.createdBy?.username === username ||
                  playlist.username === username
                )
                debugLog('Filtered user playlists:', filteredUserPlaylists)
                setUserPlaylists(filteredUserPlaylists)
                setUserStats(prev => ({
                  ...prev,
                  playlistsCount: filteredUserPlaylists.length
                }))
              } else {
                setUserPlaylists([])
                setUserStats(prev => ({
                  ...prev,
                  playlistsCount: 0
                }))
              }
            }
          } catch (playlistError) {
            console.error('Error fetching user playlists:', playlistError)
            setUserPlaylists([])
            setUserStats(prev => ({
              ...prev,
              playlistsCount: 0
            }))
          }
          
        } else {
          setError('User not found')
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchUserProfile()
    }
  }, [username])



  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
        <div className="h-48 relative overflow-hidden">
          <Skeleton className="w-full h-full" rounded="rounded-none" />
        </div>

        <Container>
          <div className="max-w-4xl mx-auto -mt-16 relative z-10">
            <div className="bg-white/90 dark:bg-surface-800/90 backdrop-blur-md rounded-2xl p-6 border border-surface-200 dark:border-surface-700 mb-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Skeleton className="w-24 h-24" rounded="rounded-full" />

                <div className="flex-1 space-y-3">
                  <Skeleton className="h-7 w-56" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex flex-wrap gap-6 pt-2">
                    <Skeleton className="h-14 w-24" rounded="rounded-xl" />
                    <Skeleton className="h-14 w-24" rounded="rounded-xl" />
                    <Skeleton className="h-14 w-24" rounded="rounded-xl" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>

            <div className="space-y-6 pb-10">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24" rounded="rounded-xl" />
                <Skeleton className="h-10 w-24" rounded="rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
                <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-6">{error || 'The user you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/')} className="bg-primary-600 hover:bg-primary-700 text-white">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
      <div className="h-48 bg-gradient-to-r from-surface-900 via-primary-800 to-primary-600 relative">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <Container>
        <div className="max-w-4xl mx-auto -mt-16 relative z-10">
          <div className="bg-white/90 dark:bg-surface-800/90 backdrop-blur-md rounded-2xl p-6 border border-surface-200 dark:border-surface-700 mb-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/80 dark:border-surface-800 text-surface-700 dark:text-surface-200 shadow-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || user.fullname} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (user.name || user.fullname || 'U').charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{user.name || user.fullname}</h1>
                <p className="text-surface-600 dark:text-surface-400 mb-2">@{user.username}</p>
                <div className="flex flex-wrap gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{userStats.notesCount || userNotes.length}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">Notes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-brand-orange">{userStats.clapsReceived || 0}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">Claps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-brand-green">{userStats.playlistsCount || userPlaylists.length}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">Playlists</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-surface-600 dark:text-surface-400">Joined {formatJoinedDate(user.createdAt || user.joinedDate)}</span>
                </div>
              </div>


            </div>
          </div>
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md rounded-2xl border border-surface-200 dark:border-surface-700 mb-8 shadow-lg">
            <div className="flex border-b border-surface-200 dark:border-surface-700">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'text-primary-700 dark:text-primary-300 border-b-2 border-primary-600'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50'
                }`}
              >
                Notes ({userStats.notesCount || userNotes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('playlists')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'playlists'
                    ? 'text-primary-700 dark:text-primary-300 border-b-2 border-primary-600'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50'
                }`}
              >
                Playlists ({userStats.playlistsCount || userPlaylists?.length || 0})
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {userNotes?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-surface-600 dark:text-surface-400">No public notes available</p>
                    </div>
                  ) : (
                    userNotes.map((note) => <NoteCard key={note._id || note.$id} {...note} />)
                  )}
                </div>
              )}

              {activeTab === 'playlists' && (
                <div>
                  {userPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userPlaylists.map((playlist) => (
                        <div key={playlist._id || playlist.id} className="bg-surface-100 dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 hover:bg-surface-200/70 dark:hover:bg-surface-700/80 transition-colors">
                          <h3 className="text-lg font-semibold mb-2 text-surface-900 dark:text-surface-50">{playlist.name}</h3>
                          <p className="text-surface-600 dark:text-surface-400 mb-3">{playlist.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-surface-600 dark:text-surface-400">{playlist.notes?.length || playlist.noteCount || 0} notes</span>
                            <Button 
                              onClick={() => navigate(`/playlist/${playlist._id || playlist.id}`)}
                              className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2"
                            >
                              View Playlist
                            </Button>
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
                      <h3 className="text-lg font-medium text-surface-800 dark:text-surface-200 mb-2">No public playlists</h3>
                      <p className="text-surface-600 dark:text-surface-400 mb-4">This user hasn't created any public playlists yet.</p>
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

export default UserPublicProfile
