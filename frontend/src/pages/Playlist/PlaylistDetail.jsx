import { useState, useEffect } from 'react'
import { Container, Button, NoteCard, NoteCardSkeleton, Skeleton } from '../../components'
import { Link, useParams, useNavigate } from 'react-router-dom'
import playlistService from '../../services/playlistService'
import appwriteService from '../../appwrite/config'
import { extractNotesFromResult, normalizeNote } from '../../utils/noteUtils'

function PlaylistDetail() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [notes, setNotes] = useState([])
  const [allNotes, setAllNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', description: '', isPublic: false })

  useEffect(() => {
    fetchPlaylistData()
    fetchAllNotes()
  }, [playlistId])

  const fetchPlaylistData = async () => {
    try {
      setLoading(true)
      const result = await playlistService.getNotesByPlaylistId(playlistId)
      if (result && result.data) {
        const playlistData = result.data
        setPlaylist({
          _id: playlistData._id,
          name: playlistData.name,
          description: playlistData.description,
          isPublic: playlistData.isPublic,
          createdAt: playlistData.createdAt,
          owner: playlistData.owner
        })
        setNotes(playlistData.notes || [])
        setEditData({
          name: playlistData.name,
          description: playlistData.description,
          isPublic: playlistData.isPublic
        })
      } else {
        setError('Playlist not found')
      }
    } catch (err) {
      console.error('Error fetching playlist:', err)
      setError(err.message || 'Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllNotes = async () => {
    try {
      const result = await appwriteService.getNotes()
      const rawNotes = extractNotesFromResult(result)
      if (rawNotes.length > 0) {
        setAllNotes(rawNotes.map(normalizeNote))
      }
    } catch (err) {
      console.error('Error fetching all notes:', err)
    }
  }

  const handleAddNote = async (noteId) => {
    try {
      await playlistService.addNote(playlistId, noteId)
      fetchPlaylistData() // Refresh playlist data
      setShowAddNoteModal(false)
    } catch (err) {
      console.error('Error adding note:', err)
      alert(err.message || 'Failed to add note to playlist')
    }
  }

  const handleRemoveNote = async (noteId) => {
    if (!confirm('Are you sure you want to remove this note from the playlist?')) {
      return
    }

    try {
      await playlistService.removeNote(playlistId, noteId)
      setNotes(notes.filter(note => note._id !== noteId))
    } catch (err) {
      console.error('Error removing note:', err)
      alert(err.message || 'Failed to remove note from playlist')
    }
  }

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault()
    try {
      await playlistService.updatePlaylistInfo(playlistId, editData)
      setPlaylist({ ...playlist, ...editData })
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating playlist:', err)
      alert(err.message || 'Failed to update playlist')
    }
  }

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      return
    }

    try {
      await playlistService.deletePlaylist(playlistId)
      navigate('/playlists')
    } catch (err) {
      console.error('Error deleting playlist:', err)
      alert(err.message || 'Failed to delete playlist')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const availableNotes = allNotes.filter(note => 
    !notes.some(playlistNote => playlistNote._id === note.$id) &&
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-12 transition-colors duration-200">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-8 gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" rounded="rounded" />
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-8 mb-10 border border-surface-200/70 dark:border-surface-700/70 shadow-sm">
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3" rounded="rounded-xl" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-28" rounded="rounded-xl" />
                  <Skeleton className="h-10 w-28" rounded="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {Array.from({ length: 5 }).map((_, index) => (
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
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-12 transition-colors duration-200">
        <Container>
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-20 h-20 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-red/25 transition-colors duration-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-brand-red transition-colors duration-200">Error loading playlist</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 transition-colors duration-200">{error}</p>
            <Button
              onClick={() => navigate('/playlists')}
              className="bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
            >
              Back to Playlists
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
          <div className="flex items-center mb-8 text-surface-600 dark:text-surface-400 transition-colors duration-200">
            <Link to="/playlists" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Playlists
            </Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-surface-900 dark:text-surface-50 transition-colors duration-200">{playlist?.name}</span>
          </div>

          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-8 mb-10 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
            {isEditing ? (
              <form onSubmit={handleUpdatePlaylist} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-4xl font-bold bg-transparent border border-surface-300 dark:border-surface-700 rounded-xl px-4 py-2 w-full text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,color] duration-200"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="text-surface-700 dark:text-surface-200 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-xl px-4 py-2 w-full focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none transition-[border-color,box-shadow,background-color,color] duration-200"
                    rows="3"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editData.isPublic}
                      onChange={(e) => setEditData({...editData, isPublic: e.target.checked})}
                      className="w-4 h-4 text-primary-600 bg-surface-200 dark:bg-surface-900 border-surface-400 dark:border-surface-700 rounded focus:ring-primary-600 focus:ring-2 mr-3 transition-colors duration-200"
                    />
                    <span className="text-surface-700 dark:text-surface-300 transition-colors duration-200">Public playlist</span>
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-200 transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-3 text-surface-900 dark:text-surface-50 transition-colors duration-200">
                      {playlist?.name}
                    </h1>
                    <p className="text-surface-700 dark:text-surface-200 text-lg mb-4 transition-colors duration-200">{playlist?.description}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        playlist?.isPublic
                          ? 'bg-brand-green/10 dark:bg-brand-green/15 text-brand-green border border-brand-green/30'
                          : 'bg-surface-200/70 dark:bg-surface-800/60 text-surface-700 dark:text-surface-300 border border-surface-300/70 dark:border-surface-700/70'
                      }`}>
                        {playlist?.isPublic ? 'Public' : 'Private'}
                      </span>
                      <span className="text-surface-600 dark:text-surface-400 transition-colors duration-200">
                        Created {formatDate(playlist?.createdAt)}
                      </span>
                      <span className="text-surface-600 dark:text-surface-400 transition-colors duration-200">
                        {notes.length} notes
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      onClick={() => setShowAddNoteModal(true)}
                      className="bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Note
                    </Button>
                    <Button
                      onClick={handleDeletePlaylist}
                      className="bg-brand-red hover:bg-brand-red/90 text-white transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {notes.map((note) => (
                <div key={note._id} className="relative group">
                  <NoteCard {...note} />

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemoveNote(note._id)
                      }}
                      className="bg-brand-red/90 hover:bg-brand-red text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-surface-100 dark:bg-surface-800/40 rounded-full flex items-center justify-center mx-auto mb-8 border border-surface-200 dark:border-surface-700 shadow-sm transition-colors duration-200">
                <svg className="w-12 h-12 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4 transition-colors duration-200">No notes in this playlist</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg leading-relaxed max-w-md mx-auto transition-colors duration-200">
                Add your first note to get started
              </p>
              <Button
                onClick={() => setShowAddNoteModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 px-8 py-4 text-lg transition-colors duration-200"
              >
                Add Your First Note
              </Button>
            </div>
          )}

          {showAddNoteModal && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-200">
              <div className="bg-white dark:bg-surface-900/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-2xl border border-surface-200 dark:border-surface-800 shadow-2xl max-h-[80vh] overflow-y-auto transition-colors duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 transition-colors duration-200">Add Note to Playlist</h2>
                  <button
                    onClick={() => setShowAddNoteModal(false)}
                    className="text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-[border-color,box-shadow,background-color,color] duration-200"
                  />
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableNotes.length > 0 ? (
                    availableNotes.map((note) => (
                      <div
                        key={note.$id}
                        onClick={() => handleAddNote(note.$id)}
                        className="bg-surface-100/80 dark:bg-surface-800/40 hover:bg-surface-100 dark:hover:bg-surface-800/60 rounded-xl p-4 cursor-pointer transition-colors duration-200 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-surface-900 dark:text-surface-50 font-semibold mb-2 transition-colors duration-200">{note.title}</h3>
                            {note.description && (
                              <p className="text-surface-600 dark:text-surface-400 text-sm line-clamp-2 transition-colors duration-200">{note.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs transition-colors duration-200 ${
                                note.isPublic
                                  ? 'bg-brand-green/10 dark:bg-brand-green/15 text-brand-green'
                                  : 'bg-surface-200/70 dark:bg-surface-800/60 text-surface-700 dark:text-surface-300'
                              }`}>
                                {note.isPublic ? 'Public' : 'Private'}
                              </span>
                              <span className="text-xs text-surface-600 dark:text-surface-400 transition-colors duration-200">
                                {formatDate(note.$createdAt)}
                              </span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-surface-600 dark:text-surface-400 transition-colors duration-200">
                        {searchQuery ? 'No notes found matching your search' : 'All available notes are already in this playlist'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default PlaylistDetail
