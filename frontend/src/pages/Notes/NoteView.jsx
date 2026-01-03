import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Button, Skeleton } from '../../components/index.js'
import { useSelector } from 'react-redux'
import appwriteService from '../../appwrite/config.js'
import playlistService from '../../services/playlistService.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import cookieService from '../../utils/cookieService.js'
import { getNoteCreatedAt, getNoteId, getNoteIsPublic } from '../../utils/noteUtils.js'
import 'katex/dist/katex.min.css'

function NoteView() {
  const params = useParams()
  // Handle both parameter names: slug (new route) and noteId (legacy route)
  const noteId = params.slug || params.noteId
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  


  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [hasClapped, setHasClapped] = useState(false)
  const [totalClapCount, setTotalClapCount] = useState(0)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [userClapCount, setUserClapCount] = useState(0)
  const [pendingClaps, setPendingClaps] = useState(0)
  const [isClapping, setIsClapping] = useState(false)
  const [clapInterval, setClapInterval] = useState(null)
  const [versions, setVersions] = useState([])
  const [currentVersion, setCurrentVersion] = useState(null)
  const [owner, setOwner] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false) // For syntax highlighting theme
  const [playlists, setPlaylists] = useState([])
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)
  const [addingToPlaylist, setAddingToPlaylist] = useState(false)
  const [creatingVersion, setCreatingVersion] = useState(false)
  const [versionCreated, setVersionCreated] = useState(false)
  const [sharingNote, setSharingNote] = useState(false)
  const [exportingNote, setExportingNote] = useState(false)
  const [copyingLink, setCopyingLink] = useState(false)
  const [actionFeedback, setActionFeedback] = useState(null)
  const [copiedCodeId, setCopiedCodeId] = useState(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState('note') // 'note' or 'quiz'
  
  // Quiz state
  const [quiz, setQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState(null)
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [userAnswers, setUserAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(null)
  const [quizQuantity, setQuizQuantity] = useState(10)
  const [deletingQuiz, setDeletingQuiz] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    
    const handleColorSchemeChange = (event) => setIsDarkMode(event.matches)
    mediaQuery.addEventListener('change', handleColorSchemeChange)
    
    return () => mediaQuery.removeEventListener('change', handleColorSchemeChange)
  }, [])

  // Fetch user playlists when modal opens
  const fetchUserPlaylists = async () => {
    if (!userData) {
      navigate('/login')
      return
    }
    
    try {
      setLoadingPlaylists(true)
      const playlistsData = await playlistService.getPlaylistsByUser()
      
      if (playlistsData && playlistsData.data) {
        setPlaylists(playlistsData.data)
      } else {
        setPlaylists([])
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
      setPlaylists([])
    } finally {
      setLoadingPlaylists(false)
    }
  }

  // Handle adding note to playlist
  const handleAddToPlaylist = async (playlistId) => {
    if (!userData) {
      navigate('/login')
      return
    }
    
    try {
      setAddingToPlaylist(true)
      await playlistService.addNote(playlistId, noteId)
      
      // Find playlist name for success message
      const playlist = playlists.find(p => p._id === playlistId || p.id === playlistId)
      const playlistName = playlist?.name || 'playlist'
      
      alert(`Note added to "${playlistName}" successfully!`)
      setShowPlaylistModal(false)
    } catch (error) {
      console.error('Error adding note to playlist:', error)
      alert('Failed to add note to playlist. Please try again.')
    } finally {
      setAddingToPlaylist(false)
    }
  }

  useEffect(() => {
    const fetchNoteAndVersions = async () => {
      try {
        setLoading(true)
        setError(null)

        const noteData = await appwriteService.getNote(noteId);

        if (noteData) {
          // More robust data normalization
          const normalizedNote = {
            ...noteData,
            _id: getNoteId(noteData) || noteId,
            title: noteData.title || noteData.name || 'Untitled Note',
            content: (() => {
              // Handle different content field names and ensure it's a string
              const content = noteData.content || noteData.note || noteData.text || noteData.description || ''
              if (typeof content === 'string') {
                return content
              } else if (typeof content === 'object' && content !== null) {
                return JSON.stringify(content, null, 2)
              } else {
                return String(content || '')
              }
            })(),
            description: noteData.description || noteData.summary || '',
            url: noteData.url || noteData.audioUrl || noteData.audio_url || '',
            createdAt: getNoteCreatedAt(noteData),
            isPublic: getNoteIsPublic(noteData),
            userId: noteData.owner?._id || noteData.userId || noteData.owner?.id
          }

          // Extract owner information
          const ownerInfo = noteData.owner ? {
            id: noteData.owner._id || noteData.owner.id,
            username: noteData.owner.username || noteData.owner.name || '',
            fullname: noteData.owner.fullname || noteData.owner.name || '',
            avatar: noteData.owner.avatar || noteData.owner.profileImage || null
          } : null


          
          setNote(normalizedNote)
          setOwner(ownerInfo)
          setCurrentVersion(normalizedNote) // Always start with the main note content
        } else {
          setError('Note not found or you don\'t have permission to view it')
          return
        }

        // Fetch versions (optional - don't fail if versions don't exist)
        try {
          const versionsData = await appwriteService.getNoteVersions(noteId)
          if (versionsData && versionsData.versions) {
            // Add isStarred property to each version based on starredVersionId
            const versionsWithStar = versionsData.versions.map(v => ({
              ...v,
              isStarred: v._id === versionsData.starredVersionId
            }))
            setVersions(versionsWithStar)
            // Don't automatically switch to starred version - let user choose
          }
        } catch (versionError) {
          setVersions([])
        }

        // Fetch clap data
        try {

          const clapData = await appwriteService.getClaps(noteId)
          if (clapData) {
            setTotalClapCount(clapData.totalClaps || 0)
            // Only set user-specific clap data if user is authenticated
            if (userData) {
              setUserClapCount(clapData.userClaps || 0)
              setHasClapped((clapData.userClaps || 0) > 0)

            } else {
              setUserClapCount(0)
              setHasClapped(false)

            }
          }
        } catch (clapError) {
          // Reset clap state on error
          if (!userData) {
            setTotalClapCount(0);
          }
          setUserClapCount(0);
          setHasClapped(false);
        }
      } catch (err) {
        console.error('Error fetching note:', err);
        
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          setError('You need to be logged in to view this note')
        } else if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          setError('You don\'t have permission to view this note')
        } else if (err.message?.includes('404') || err.message?.includes('Not found')) {
          setError('Note not found')
        } else if (err.message?.includes('timeout')) {
          setError('Request timed out - please try again')
        } else {
          setError(err.message || 'Failed to load note')
        }
      } finally {
        setLoading(false)
      }
    }

    if (noteId) {
      fetchNoteAndVersions()
    } else {
      setError('No note ID provided')
      setLoading(false)
    }
  }, [noteId])

  // Fetch quiz when tab is switched to quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      if (activeTab === 'quiz' && noteId && !quiz) {
        try {
          setQuizLoading(true)
          setQuizError(null)
          const quizData = await appwriteService.getQuiz(noteId)
          setQuiz(quizData)
        } catch (error) {
          setQuizError('No quiz available for this note')
        } finally {
          setQuizLoading(false)
        }
      }
    }

    fetchQuiz()
  }, [activeTab, noteId, quiz])

  useEffect(() => {
    return () => {
      if (clapInterval) {
        clearInterval(clapInterval)
      }
    }
  }, [clapInterval])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Quiz functions
  const handleCreateQuiz = async () => {
    if (!userData) {
      navigate('/login')
      return
    }
    
    try {
      setCreatingQuiz(true)
      setQuizError(null)
      const newQuiz = await appwriteService.createQuiz(noteId, quizQuantity)
      setQuiz(newQuiz)
    } catch (error) {
      console.error('Error creating quiz:', error)
      setQuizError('Failed to create quiz. Please try again.')
    } finally {
      setCreatingQuiz(false)
    }
  }

  const handleAnswerChange = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmitQuiz = () => {
    if (!quiz || !quiz.quize) return
    
    let correct = 0
    quiz.quize.forEach(question => {
      if (userAnswers[question._id] === question.answer) {
        correct++
      }
    })
    
    setQuizScore({
      correct,
      total: quiz.quize.length,
      percentage: Math.round((correct / quiz.quize.length) * 100)
    })
    setQuizSubmitted(true)
  }

  const resetQuiz = () => {
    setUserAnswers({})
    setQuizSubmitted(false)
    setQuizScore(null)
  }

  const handleDeleteQuiz = async () => {
    try {
      setDeletingQuiz(true)
      await appwriteService.deleteQuiz(noteId)
      setQuiz(null)
      setUserAnswers({})
      setQuizSubmitted(false)
      setQuizScore(null)
      setShowDeleteConfirm(false)
      setActionFeedback({ type: 'success', message: 'Quiz deleted successfully!' })
      setTimeout(() => setActionFeedback(null), 3000)
    } catch (error) {
      console.error('Error deleting quiz:', error)
      setActionFeedback({ type: 'error', message: 'Failed to delete quiz. Only the quiz owner can delete it.' })
      setTimeout(() => setActionFeedback(null), 3000)
    } finally {
      setDeletingQuiz(false)
    }
  }

  const handleStarVersion = async (versionId) => {
    if (!userData) {
      navigate('/login')
      return
    }
    
    try {
      await appwriteService.starNoteVersion(noteId, versionId)
      
      // Refresh versions data to get updated star status
      const versionsData = await appwriteService.getNoteVersions(noteId)
      if (versionsData && versionsData.versions) {
        // Add isStarred property to each version based on starredVersionId
        const versionsWithStar = versionsData.versions.map(v => ({
          ...v,
          isStarred: v._id === versionsData.starredVersionId
        }))
        setVersions(versionsWithStar)
        
        // Update current version if the starred version was selected
        const starredVersion = versionsWithStar.find(v => v._id === versionId)
        if (starredVersion) {
          setCurrentVersion(starredVersion)
          setSelectedVersion(versionId)
        }
      }
    } catch (error) {
      console.error('Error starring version:', error)
      alert('Failed to star version. Please try again.')
    }
  }

  const startClap = () => {
    // Check if user is authenticated
    if (!userData) {
      navigate('/login');
      return;
    }
    
    if (userClapCount >= 50) return
    setIsClapping(true)
    setPendingClaps(1)
    const interval = setInterval(() => {
      setPendingClaps(prev => {
        const newTotal = userClapCount + prev + 1
        if (newTotal >= 50) {
          clearInterval(interval)
          return Math.min(prev + 1, 50 - userClapCount)
        }
        return prev + 1
      })
    }, 50) // Increment every 50ms
    setClapInterval(interval)
  }

  const stopClap = async () => {
    if (!isClapping) return
    clearInterval(clapInterval)
    setClapInterval(null)
    setIsClapping(false)
    
    // Check if user is authenticated before making API call
    if (!userData) {
      setPendingClaps(0);
      return;
    }
    
    try {
      const finalClaps = Math.min(pendingClaps, 50 - userClapCount)

      await appwriteService.increaseClap(noteId, finalClaps)
      setTotalClapCount(prev => prev + finalClaps)
      setUserClapCount(prev => prev + finalClaps)
      setHasClapped(true)
    } catch (error) {
      console.error('Error clapping:', error)
    }
    setPendingClaps(0)
  }

  const handleClap = async () => {
    // Check if user is authenticated
    if (!userData) {
      navigate('/login');
      return;
    }
    
    if (userClapCount >= 50) return

    try {
      await appwriteService.increaseClap(noteId, 1)
      setTotalClapCount(prev => prev + 1)
      setUserClapCount(prev => prev + 1)
      setHasClapped(true)
    } catch (error) {
      console.error('Error clapping:', error)
    }
  }

  const handleUnclapOnce = async () => {
    if (!userData) {
      navigate('/login')
      return
    }

    if (userClapCount <= 0) return

    try {
      await appwriteService.decreaseClap(noteId, 1)
      setTotalClapCount(prev => Math.max(0, prev - 1))
      setUserClapCount(prev => {
        const next = Math.max(0, prev - 1)
        if (next <= 0) setHasClapped(false)
        return next
      })
    } catch (error) {
      console.error('Error unclapping:', error)
    }
  }


  const handleDeleteNote = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await appwriteService.deleteNote(note._id)
        navigate('/my-notes')
      } catch (error) {
        console.error('Failed to delete note:', error)
        // You might want to show an error message to the user here
      }
    }
  }

  // Quick Actions Functions
  const handleShareNote = async () => {
    setSharingNote(true)
    try {
      const shareUrl = `${window.location.origin}/note/${noteId}`
      
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: `Check out this note: ${note.title}`,
          url: shareUrl
        })
        setActionFeedback({ type: 'success', message: 'Note shared successfully!' })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setActionFeedback({ type: 'success', message: 'Share link copied to clipboard!' })
      }
    } catch (error) {
      console.error('Error sharing note:', error)
      setActionFeedback({ type: 'error', message: 'Failed to share note' })
    } finally {
      setSharingNote(false)
      setTimeout(() => setActionFeedback(null), 3000)
    }
  }

  const handleExportNote = async () => {
    setExportingNote(true)
    try {
      // Create markdown content
      const markdownContent = `# ${note.title}\n\n${note.content || currentVersion?.content || ''}`
      
      // Create and download file
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setActionFeedback({ type: 'success', message: 'Note exported successfully!' })
    } catch (error) {
      console.error('Error exporting note:', error)
      setActionFeedback({ type: 'error', message: 'Failed to export note' })
    } finally {
      setExportingNote(false)
      setTimeout(() => setActionFeedback(null), 3000)
    }
  }

  const handleCopyLink = async () => {
    setCopyingLink(true)
    try {
      const noteUrl = `${window.location.origin}/note/${noteId}`
      await navigator.clipboard.writeText(noteUrl)
      setActionFeedback({ type: 'success', message: 'Note link copied to clipboard!' })
    } catch (error) {
      console.error('Error copying link:', error)
      setActionFeedback({ type: 'error', message: 'Failed to copy link' })
    } finally {
      setCopyingLink(false)
      setTimeout(() => setActionFeedback(null), 3000)
    }
  }

  // Code copy function with feedback and visual effects
  const handleCopyCode = (event, code, blockId) => {
    // Immediately prevent all default behavior and event bubbling
    event.preventDefault()
    event.stopPropagation()
    
    // Preserve current scroll position
    const currentScrollY = window.scrollY
    const currentScrollX = window.scrollX
    
    // Handle async copy operation separately to avoid any timing issues
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCodeId(blockId)
        
        // Show floating notification
        setShowCopyNotification(true)
        setTimeout(() => setShowCopyNotification(false), 2000)
        
        // Clear copied state after animation
        setTimeout(() => setCopiedCodeId(null), 3000)
        
        // Restore scroll position if it changed
        if (window.scrollY !== currentScrollY || window.scrollX !== currentScrollX) {
          window.scrollTo(currentScrollX, currentScrollY)
        }
      })
      .catch((error) => {
        console.error('Failed to copy code:', error)
        // Restore scroll position on error too
        if (window.scrollY !== currentScrollY || window.scrollX !== currentScrollX) {
          window.scrollTo(currentScrollX, currentScrollY)
        }
      })
    
    // Explicitly return false to prevent any navigation
    return false
  }

  // Function to preprocess content to handle dollar signs properly while preserving code blocks
  const preprocessMarkdown = (content) => {
    if (!content || typeof content !== 'string') return content
    
    // First, preserve code blocks and inline code
    const codeBlocks = []
    let codeIndex = 0
    let processed = content
    
    // Preserve fenced code blocks (```...```)
    processed = processed.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match)
      return `__CODE_BLOCK_${codeIndex++}__`
    })
    
    // Preserve inline code (`...`) - match backticks even with newlines in between if they're part of same element
    processed = processed.replace(/`([^`]+)`/g, (match) => {
      codeBlocks.push(match)
      return `__INLINE_CODE_${codeIndex++}__`
    })
    
    // Now handle math expressions in the remaining content
    const mathExpressions = []
    let mathIndex = 0
    
    // Handle block math ($$...$$)
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, expr) => {
      mathExpressions.push(match)
      return `__MATH_BLOCK_${mathIndex++}__`
    })
    
    // Handle inline math that looks like actual math (contains math symbols)
    processed = processed.replace(/\$([^$\n]*[+\-*/=^_{}\\\[\]()a-zA-Z][^$\n]*)\$/g, (match, expr) => {
      // Only treat as math if it contains mathematical symbols or patterns
      if (/[+\-*/=^_{}\\\[\]()\\]|[a-zA-Z]{2,}|\\[a-zA-Z]+/.test(expr.trim())) {
        mathExpressions.push(match)
        return `__MATH_INLINE_${mathIndex++}__`
      }
      return match // Keep as regular text if not mathematical
    })
    
    // Now escape remaining dollar signs (these are likely currency)
    processed = processed.replace(/\$/g, '\\$')
    
    // Restore math expressions
    mathIndex = 0
    processed = processed.replace(/__MATH_BLOCK_(\d+)__/g, () => mathExpressions[mathIndex++])
    processed = processed.replace(/__MATH_INLINE_(\d+)__/g, () => mathExpressions[mathIndex++])
    
    // Restore code blocks
    codeIndex = 0
    processed = processed.replace(/__CODE_BLOCK_(\d+)__/g, () => codeBlocks[codeIndex++])
    processed = processed.replace(/__INLINE_CODE_(\d+)__/g, () => codeBlocks[codeIndex++])
    
    return processed
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
        <Container>
          <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-12 w-full" rounded="rounded-2xl" />
                <Skeleton className="h-96 w-full" rounded="rounded-2xl" />
                <Skeleton className="h-10 w-48" rounded="rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
                <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Unable to Load Note</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
          {error.includes('logged in') ? (
            <Button onClick={() => navigate('/login')} className="bg-primary-600 hover:bg-primary-700 text-white mr-4">
              Login
            </Button>
          ) : (
            <Button onClick={() => navigate('/my-notes')} className="bg-primary-600 hover:bg-primary-700 text-white mr-4">
              Back to Notes
            </Button>
          )}
          <Button onClick={() => window.location.reload()} className="bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-50">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Container>
        <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <button
              onClick={() => navigate('/my-notes')}
              className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 mb-6 inline-flex items-center text-sm font-medium transition-colors group"
            >
              <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Notes
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 break-words text-surface-900 dark:text-surface-50 leading-tight">
                  {note.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm sm:text-base">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden ring-2 ring-white/80 dark:ring-surface-800 shadow-lg">
                      {owner?.avatar ? (
                        <img 
                          src={owner.avatar} 
                          alt={owner.fullname || 'Owner'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{owner?.fullname?.charAt(0) || owner?.username?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-surface-900 dark:text-surface-50">
                        {owner?.fullname || owner?.username || 'Unknown Owner'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {userData && (userData._id === owner?.id || userData.$id === owner?.id || userData._id === note.userId || userData.$id === note.userId) && (
                  <>
                    <Button
                      onClick={() => navigate(`/edit-note/${note._id}`)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      onClick={handleDeleteNote}
                      className="bg-brand-red hover:bg-brand-red/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 xl:col-span-9 space-y-8">
              <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-xl overflow-hidden">
                <div className="border-b border-surface-200 dark:border-surface-700">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('note')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'note'
                          ? 'border-primary-500 text-primary-700 dark:text-primary-300'
                          : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50 hover:border-surface-300 dark:hover:border-surface-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Note Content
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'quiz'
                          ? 'border-primary-500 text-primary-700 dark:text-primary-300'
                          : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50 hover:border-surface-300 dark:hover:border-surface-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Quiz
                        {quiz && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                            {quiz.quize?.length || 0}
                          </span>
                        )}
                      </div>
                    </button>
                  </nav>
                </div>

                <div>
                  {activeTab === 'note' ? (
                    <div className="px-6 sm:px-8 py-6 sm:py-8">
                      <div className="prose prose-gray dark:prose-invert max-w-none prose-lg text-left">
                    <ReactMarkdown
                      remarkPlugins={[
                        remarkGfm, 
                        remarkMath // Keep math parsing enabled
                      ]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        // Headings with GitHub-style anchors
                        h1: ({ children, ...props }) => (
                          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-surface-900 dark:text-surface-50 border-b border-surface-200 dark:border-surface-700 pb-3" {...props}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children, ...props }) => (
                          <h2 className="text-2xl sm:text-3xl font-bold mb-5 mt-8 text-surface-900 dark:text-surface-50 border-b border-surface-200 dark:border-surface-700 pb-2" {...props}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children, ...props }) => (
                          <h3 className="text-xl sm:text-2xl font-semibold mb-4 mt-6 text-surface-900 dark:text-surface-50" {...props}>
                            {children}
                          </h3>
                        ),
                        h4: ({ children, ...props }) => (
                          <h4 className="text-lg sm:text-xl font-semibold mb-3 mt-5 text-surface-900 dark:text-surface-50" {...props}>
                            {children}
                          </h4>
                        ),
                        h5: ({ children, ...props }) => (
                          <h5 className="text-base sm:text-lg font-semibold mb-3 mt-4 text-surface-900 dark:text-surface-50" {...props}>
                            {children}
                          </h5>
                        ),
                        h6: ({ children, ...props }) => (
                          <h6 className="text-sm sm:text-base font-semibold mb-2 mt-3 text-surface-700 dark:text-surface-200" {...props}>
                            {children}
                          </h6>
                        ),
                        
                        // Paragraphs with better spacing
                        p: ({ children, ...props }) => (
                          <p className="mb-4 text-surface-700 dark:text-surface-300 leading-7 text-base text-left" {...props}>
                            {children}
                          </p>
                        ),
                        
                        // Lists with GitHub styling
                        ul: ({ children, ...props }) => (
                          <ul className="mb-4 ml-6 space-y-1 text-surface-700 dark:text-surface-300 list-disc text-left" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children, ...props }) => (
                          <ol className="mb-4 ml-6 space-y-1 text-surface-700 dark:text-surface-300 list-decimal text-left" {...props}>
                            {children}
                          </ol>
                        ),
                        li: ({ children, ...props }) => (
                          <li className="mb-1 leading-6 text-left" {...props}>
                            {children}
                          </li>
                        ),
                        
                        // Task lists
                        input: ({ type, checked, ...props }) => (
                          type === 'checkbox' ? (
                            <input 
                              type="checkbox" 
                              checked={checked} 
                              className="mr-2 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                              disabled
                              {...props}
                            />
                          ) : <input {...props} />
                        ),
                        
                        // Blockquotes with modern styling
                        blockquote: ({ children, ...props }) => (
                          <blockquote 
                            className="border-l-4 border-primary-500 pl-6 py-2 my-6 bg-primary-50 dark:bg-primary-900/20 rounded-r-lg text-surface-700 dark:text-surface-300 italic text-left" 
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),
                        
                        // Code blocks with syntax highlighting
                        code: ({ inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : ''
                          const codeContent = String(children).replace(/\n$/, '')
                          const blockId = `code-${Math.random().toString(36).substr(2, 9)}`
                          
                          // Check if it's actually inline code by looking for newlines
                          const hasNewlines = codeContent.includes('\n')
                          
                          // Only render as code block if there's a valid language specification AND it's not inline
                          if (!inline && language && className?.includes('language-') && language !== 'text' && language !== 'plain' && hasNewlines) {
                            return (
                              <div className="relative my-6 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-900/60 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1.5">
                                      <div className="w-3 h-3 rounded-full bg-brand-red"></div>
                                      <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                                      <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                                    </div>
                                    <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider px-2 py-1 bg-white/90 dark:bg-surface-800 rounded-md border border-surface-200 dark:border-surface-700">
                                      {language || 'code'}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={(e) => handleCopyCode(e, codeContent, blockId)}
                                    className={`group relative px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                      copiedCodeId === blockId 
                                        ? 'text-white bg-brand-green border-brand-green shadow-lg shadow-brand-green/30 animate-pulse'
                                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 bg-white/90 dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 border-surface-200 dark:border-surface-700 hover:shadow-md'
                                    }`}
                                    title={copiedCodeId === blockId ? "Copied successfully!" : "Copy code"}
                                    type="button"
                                  >
                                    <div className="flex items-center space-x-1.5">
                                      {copiedCodeId === blockId ? (
                                        <>
                                          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          <span className="font-semibold">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 group-hover:rotate-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                          <span className="group-hover:translate-x-0.5 transition-transform duration-200">Copy</span>
                                        </>
                                      )}
                                    </div>
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={isDarkMode ? oneDark : oneLight}
                                  language={language || 'text'}
                                  PreTag="div"
                                  className="!m-0 !bg-transparent overflow-x-auto scrollbar-thin scrollbar-thumb-surface-300 dark:scrollbar-thumb-surface-600 scrollbar-track-transparent"
                                  customStyle={{
                                    margin: 0,
                                    padding: '1.25rem',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", "JetBrains Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                    borderRadius: '0 0 0.75rem 0.75rem'
                                  }}
                                  codeTagProps={{
                                    style: {
                                      fontSize: '14px',
                                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", "JetBrains Mono", Consolas, "Liberation Mono", Menlo, monospace'
                                    }
                                  }}
                                  showLineNumbers={codeContent.split('\n').length > 3}
                                  lineNumberStyle={{
                                    minWidth: '3em',
                                    paddingRight: '1em',
                                    textAlign: 'right',
                                    userSelect: 'none',
                                    opacity: 0.5
                                  }}
                                  {...props}
                                >
                                  {codeContent}
                                </SyntaxHighlighter>
                              </div>
                            )
                          } else if (!inline && hasNewlines && !language) {
                            // Render code blocks without language specification as regular text, only if has newlines
                            return (
                              <p className="my-4 text-surface-900 dark:text-surface-50 leading-relaxed whitespace-pre-wrap">
                                {codeContent}
                              </p>
                            )
                          } else if (inline || !hasNewlines) {
                            // For inline code or code without newlines, render as inline
                            return (
                              <code 
                                className="bg-surface-100 dark:bg-surface-900 px-1.5 py-0.5 rounded text-sm font-mono text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700" 
                                style={{
                                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", "JetBrains Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                  fontSize: '0.875rem',
                                  display: 'inline'
                                }}
                                {...props}
                              >
                                {children}
                              </code>
                            )
                          }
                          
                          // Fallback for edge cases
                          return <span>{children}</span>
                        },
                        
                        // Pre blocks (fallback for code without language)
                        pre: ({ children, ...props }) => (
                          <pre className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg overflow-x-auto mb-4 text-sm border border-surface-200 dark:border-surface-700" {...props}>
                            {children}
                          </pre>
                        ),
                        
                        // Links with modern styling
                        a: ({ href, children, ...props }) => (
                          <a 
                            href={href} 
                            className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 underline decoration-primary-600/30 hover:decoration-primary-600 transition-colors font-medium break-words" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                        
                        // Horizontal rules
                        hr: ({ ...props }) => (
                          <hr className="border-surface-300 dark:border-surface-700 my-8" {...props} />
                        ),
                        
                        // Tables with GitHub styling
                        table: ({ children, ...props }) => (
                          <div className="overflow-x-auto my-6 rounded-lg border border-surface-200 dark:border-surface-700">
                            <table className="min-w-full bg-white/90 dark:bg-surface-900 text-left" {...props}>
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children, ...props }) => (
                          <thead className="bg-surface-50 dark:bg-surface-900" {...props}>
                            {children}
                          </thead>
                        ),
                        tbody: ({ children, ...props }) => (
                          <tbody className="divide-y divide-surface-200 dark:divide-surface-700" {...props}>
                            {children}
                          </tbody>
                        ),
                        tr: ({ children, ...props }) => (
                          <tr className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors" {...props}>
                            {children}
                          </tr>
                        ),
                        th: ({ children, ...props }) => (
                          <th className="px-6 py-3 text-left text-xs font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700" {...props}>
                            {children}
                          </th>
                        ),
                        td: ({ children, ...props }) => (
                          <td className="px-6 py-4 text-left text-sm text-surface-700 dark:text-surface-300 border-b border-surface-200 dark:border-surface-700" {...props}>
                            {children}
                          </td>
                        ),
                        
                        // Text formatting
                        strong: ({ children, ...props }) => (
                          <strong className="font-semibold text-surface-900 dark:text-surface-50" {...props}>
                            {children}
                          </strong>
                        ),
                        em: ({ children, ...props }) => (
                          <em className="italic text-surface-700 dark:text-surface-300" {...props}>
                            {children}
                          </em>
                        ),
                        del: ({ children, ...props }) => (
                          <del className="line-through text-surface-500 dark:text-surface-400" {...props}>
                            {children}
                          </del>
                        ),
                        
                        // Images with modern styling
                        img: ({ src, alt, ...props }) => (
                          <div className="my-6 text-left">
                            <img 
                              src={src} 
                              alt={alt} 
                              className="max-w-full h-auto rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm"
                              {...props}
                            />
                            {alt && (
                              <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 italic text-left">
                                {alt}
                              </p>
                            )}
                          </div>
                        ),
                      }}
                    >
                      {(() => {
                        const content = currentVersion?.content || note?.content || 'No content available'
                        const processedContent = preprocessMarkdown(typeof content === 'string' ? content : String(content || ''))
                        return processedContent
                      })()}
                    </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    /* Quiz Content */
                  <div className="px-6 sm:px-8 py-6 sm:py-8">
                    {!userData ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-surface-100 dark:bg-surface-900/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-surface-200 dark:border-surface-700">
                          <svg className="w-10 h-10 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-3">Access Restricted</h2>
                        <p className="text-surface-600 dark:text-surface-400 mb-2 max-w-sm mx-auto">
                          You need to be logged in to access and take quizzes.
                        </p>
                        <p className="text-sm text-surface-500 dark:text-surface-500 mb-8 max-w-sm mx-auto">
                          Sign in to your account to test your knowledge and track your progress.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            onClick={() => navigate('/login')}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In
                          </Button>
                          <Button
                            onClick={() => navigate('/signup')}
                            className="bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-50 font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-surface-300 dark:border-surface-600 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Create Account
                          </Button>
                        </div>

                        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-700">
                          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Why sign in?</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-700">
                              <div className="text-2xl mb-2">📝</div>
                              <p className="text-sm font-medium text-surface-900 dark:text-surface-50">Take Quizzes</p>
                              <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">Test your knowledge</p>
                            </div>
                            <div className="bg-brand-green/10 dark:bg-brand-green/15 rounded-lg p-4 border border-brand-green/20 dark:border-brand-green/30">
                              <div className="text-2xl mb-2">📊</div>
                              <p className="text-sm font-medium text-surface-900 dark:text-surface-50">Track Progress</p>
                              <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">Monitor your scores</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : quizLoading ? (
                      <div className="py-8 flex flex-col items-center">
                        <Skeleton className="w-16 h-16 mb-4" rounded="rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    ) : quizError ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-4">No Quiz Available</h3>
                        <p className="text-surface-600 dark:text-surface-400 mb-6 max-w-md mx-auto">
                          This note doesn't have a quiz yet. Create one to help test understanding of the content.
                        </p>
                        {userData ? (
                          <div className="w-full max-w-md space-y-5">
                            <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-xl p-6 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-xl">
                              <div className="mb-6">
                                <label className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-surface-900 dark:text-surface-50">Number of Questions</span>
                                  <span className="text-lg font-bold text-primary-700 dark:text-primary-300">{quizQuantity}</span>
                                </label>
                                <p className="text-xs text-surface-600 dark:text-surface-400">Estimated time: ~{Math.ceil(quizQuantity)} mins</p>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="25"
                                value={quizQuantity}
                                onChange={(e) => setQuizQuantity(parseInt(e.target.value))}
                                disabled={creatingQuiz}
                                className="w-full h-2 bg-surface-300 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex gap-2 mt-4">
                                {[5, 10, 15, 20, 25].map((value) => (
                                  <button
                                    key={value}
                                    onClick={() => setQuizQuantity(value)}
                                    disabled={creatingQuiz}
                                    className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      quizQuantity === value
                                        ? 'bg-primary-600 dark:bg-primary-600 text-white shadow-md'
                                        : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    {value}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <Button
                              onClick={handleCreateQuiz}
                              disabled={creatingQuiz}
                              className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center ${
                                creatingQuiz 
                                  ? 'bg-surface-300 dark:bg-surface-700 cursor-not-allowed text-surface-700 dark:text-surface-300' 
                                  : 'bg-brand-green hover:bg-brand-green/90 hover:scale-105 hover:shadow-2xl text-white'
                              } text-white`}
                            >
                              {creatingQuiz ? (
                                <>
                                  <Skeleton className="w-5 h-5 mr-2" rounded="rounded-full" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Generate Quiz with {quizQuantity} Questions
                                </>
                              )}
                            </Button>

                            {creatingQuiz && (
                              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-sm w-full border border-surface-200 dark:border-surface-700 shadow-2xl">
                                  <div className="flex justify-center mb-8">
                                    <Skeleton className="w-24 h-24" rounded="rounded-full" />
                                  </div>

                                  <div className="text-center">
                                    <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-2">
                                      Generating Quiz
                                    </h3>
                                    <p className="text-surface-600 dark:text-surface-400 text-sm mb-4">
                                      Creating {quizQuantity} questions...
                                    </p>

                                    <div className="w-full rounded-full h-2 overflow-hidden mb-4">
                                      <Skeleton className="h-2 w-full" rounded="rounded-full" />
                                    </div>

                                    <div className="flex justify-center gap-2 mb-4">
                                      <Skeleton className="w-2 h-2" rounded="rounded-full" />
                                      <Skeleton className="w-2 h-2" rounded="rounded-full" />
                                      <Skeleton className="w-2 h-2" rounded="rounded-full" />
                                    </div>

                                    <p className="text-xs text-surface-500 dark:text-surface-500">
                                      This may take a few seconds...
                                    </p>
                                  </div>

                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-surface-600 dark:text-surface-400">
                            <button 
                              onClick={() => navigate('/login')}
                              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                            >
                              Log in
                            </button> to create a quiz
                          </p>
                        )}
                      </div>
                    ) : quiz && quiz.quize ? (
                      <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">Knowledge Check Quiz</h2>
                              <p className="text-surface-600 dark:text-surface-400">Test your understanding of this note's content</p>
                            </div>
                            {quizSubmitted && quizScore && (
                              <div className="text-right">
                                <div className={`text-3xl font-bold mb-1 ${
                                  quizScore.percentage >= 80 ? 'text-brand-green' :
                                  quizScore.percentage >= 60 ? 'text-brand-orange' :
                                  'text-brand-red'
                                }`}>
                                  {quizScore.percentage}%
                                </div>
                                <div className="text-sm text-surface-600 dark:text-surface-400">
                                  {quizScore.correct}/{quizScore.total} correct
                                </div>
                              </div>
                            )}
                          </div>

                          {quizSubmitted && quizScore && (
                            <div className={`mb-6 p-4 rounded-xl border ${
                              quizScore.percentage >= 80 ? 'bg-brand-green/10 dark:bg-brand-green/15 border-brand-green/20 dark:border-brand-green/30' :
                              quizScore.percentage >= 60 ? 'bg-brand-orange/10 dark:bg-brand-orange/15 border-brand-orange/20 dark:border-brand-orange/30' :
                              'bg-brand-red/10 dark:bg-brand-red/15 border-brand-red/20 dark:border-brand-red/30'
                            }`}>
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                  quizScore.percentage >= 80 ? 'bg-brand-green' :
                                  quizScore.percentage >= 60 ? 'bg-brand-orange' :
                                  'bg-brand-red'
                                }`}>
                                  {quizScore.percentage >= 80 ? (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  ) : quizScore.percentage >= 60 ? (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className={`font-semibold ${
                                    quizScore.percentage >= 80 ? 'text-brand-green' :
                                    quizScore.percentage >= 60 ? 'text-brand-orange' :
                                    'text-brand-red'
                                  }`}>
                                    {quizScore.percentage >= 80 ? 'Excellent!' :
                                     quizScore.percentage >= 60 ? 'Good job!' :
                                     'Keep studying!'}
                                  </div>
                                  <div className={`text-sm ${
                                    quizScore.percentage >= 80 ? 'text-surface-700 dark:text-surface-300' :
                                    quizScore.percentage >= 60 ? 'text-surface-700 dark:text-surface-300' :
                                    'text-surface-700 dark:text-surface-300'
                                  }`}>
                                    {quizScore.percentage >= 80 ? 'You have a great understanding of the content.' :
                                     quizScore.percentage >= 60 ? 'You understand most of the content well.' :
                                     'Consider reviewing the note content again.'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          {quiz.quize.map((question, index) => (
                            <div key={question._id} className="bg-surface-50 dark:bg-surface-900/40 rounded-xl p-6 border border-surface-200 dark:border-surface-700">
                              <div className="mb-4">
                                <div className="flex items-start">
                                  <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
                                      {question.question}
                                    </h3>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 ml-12">
                                {question.options.map((option, optionIndex) => {
                                  const isSelected = userAnswers[question._id] === optionIndex
                                  const isCorrect = question.answer === optionIndex
                                  const showAnswer = quizSubmitted
                                  
                                  return (
                                    <label 
                                      key={optionIndex}
                                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                        showAnswer ? (
                                          isCorrect ? 
                                            'border-brand-green/30 dark:border-brand-green/30 bg-brand-green/10 dark:bg-brand-green/15' :
                                            isSelected && !isCorrect ?
                                              'border-brand-red/30 dark:border-brand-red/30 bg-brand-red/10 dark:bg-brand-red/15' :
                                              'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900'
                                        ) : (
                                          isSelected ?
                                            'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20' :
                                            'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-primary-200 dark:hover:border-primary-700'
                                        )
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${question._id}`}
                                        value={optionIndex}
                                        checked={isSelected}
                                        onChange={() => !quizSubmitted && handleAnswerChange(question._id, optionIndex)}
                                        disabled={quizSubmitted}
                                        className="sr-only"
                                      />
                                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                        showAnswer ? (
                                          isCorrect ?
                                            'border-brand-green bg-brand-green' :
                                            isSelected && !isCorrect ?
                                              'border-brand-red bg-brand-red' :
                                              'border-surface-300 dark:border-surface-600'
                                        ) : (
                                          isSelected ?
                                            'border-primary-600 dark:border-primary-400 bg-primary-600' :
                                            'border-surface-300 dark:border-surface-600'
                                        )
                                      }`}>
                                        {showAnswer && isCorrect && (
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                        {showAnswer && isSelected && !isCorrect && (
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        )}
                                        {!showAnswer && isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-left ${
                                        showAnswer ? (
                                          isCorrect ?
                                            'text-brand-green font-medium' :
                                            isSelected && !isCorrect ?
                                              'text-brand-red' :
                                              'text-surface-700 dark:text-surface-300'
                                        ) : (
                                          'text-surface-900 dark:text-surface-50'
                                        )
                                      }`}>
                                        {option}
                                      </span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 flex justify-center space-x-4">
                          {!quizSubmitted ? (
                            <Button
                              onClick={handleSubmitQuiz}
                              disabled={Object.keys(userAnswers).length !== quiz.quize.length}
                              className={`font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg ${
                                Object.keys(userAnswers).length === quiz.quize.length
                                  ? 'bg-primary-600 hover:bg-primary-700 hover:scale-105 hover:shadow-2xl text-white'
                                  : 'bg-surface-300 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed'
                              }`}
                            >
                              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Submit Quiz ({Object.keys(userAnswers).length}/{quiz.quize.length})
                            </Button>
                          ) : (
                            <Button
                              onClick={resetQuiz}
                              className="bg-surface-700 hover:bg-surface-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-2xl"
                            >
                              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Retake Quiz
                            </Button>
                          )}
                          
                          {userData && (userData._id === owner?.id || userData.$id === owner?.id || userData._id === note.userId || userData.$id === note.userId) && (
                            <div className="relative group">
                              <Button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={deletingQuiz}
                                className="bg-brand-red hover:bg-brand-red/90 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {deletingQuiz ? (
                                  <>
                                    <Skeleton className="w-5 h-5 mr-2" rounded="rounded-full" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Quiz
                                  </>
                                )}
                              </Button>
                              
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                                <div className="bg-surface-900 text-surface-50 text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-surface-700">
                                  Permanently delete this quiz
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-surface-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="xl:col-span-3 lg:col-span-4 space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 lg:block lg:space-y-6">
              {note.url && (
                <div className="bg-white/70 dark:bg-surface-900/70 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm overflow-hidden">
                  <div className="bg-surface-50 dark:bg-surface-900/40 px-5 py-3 border-b border-surface-200 dark:border-surface-800">
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M12 6.586V21m0-14.414l2.05-2.05M12 6.586L9.95 4.536" />
                      </svg>
                      Original recording
                    </h3>
                  </div>
                  <div className="p-5">
                    <audio controls className="w-full h-12 rounded-lg">
                      <source src={note.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              <div className="bg-white/70 dark:bg-surface-900/70 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm overflow-hidden md:col-span-1">
                <div className="bg-surface-50 dark:bg-surface-900/40 px-4 sm:px-5 py-3 border-b border-surface-200 dark:border-surface-800">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Engagement
                  </h3>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onMouseDown={userData ? startClap : () => navigate('/login')}
                          onMouseUp={userData ? stopClap : undefined}
                          onMouseLeave={userData ? stopClap : undefined}
                          onTouchStart={userData ? startClap : undefined}
                          onTouchEnd={userData ? stopClap : undefined}
                          onKeyDown={(e) => {
                            if (!userData) return
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleClap()
                            }
                          }}
                          disabled={userData ? (isClapping || userClapCount >= 50) : false}
                          type="button"
                          aria-label={!userData ? 'Login to clap' : 'Clap'}
                          title={!userData ? 'Login to clap' : userClapCount >= 50 ? 'Max 50 claps' : 'Tap or press & hold to clap'}
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors duration-200 active:scale-[0.98] ${
                            !userData
                              ? 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800'
                              : isClapping
                              ? 'bg-primary-600 border-primary-500'
                              : userClapCount >= 50
                              ? 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 cursor-not-allowed'
                              : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800'
                          } disabled:opacity-60`}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              !userData
                                ? 'text-surface-700 dark:text-surface-200'
                                : isClapping
                                ? 'text-white'
                                : userClapCount >= 50
                                ? 'text-surface-400'
                                : 'text-primary-600 dark:text-primary-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                          </svg>
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-surface-900 dark:text-surface-50 tabular-nums">
                              {totalClapCount + (isClapping ? pendingClaps : 0)}
                            </span>
                            <span className="text-xs font-medium text-surface-600 dark:text-surface-400">claps</span>
                            {userData && userClapCount >= 50 && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-200">
                                Max
                              </span>
                            )}
                          </div>
                          {!userData && (
                            <div className="mt-1 text-[11px] text-surface-600 dark:text-surface-400">
                              Log in to clap
                            </div>
                          )}
                        </div>
                      </div>

                      {userData && userClapCount > 0 && (
                        <button
                          type="button"
                          onClick={handleUnclapOnce}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-50 transition-colors"
                          title="Undo one clap"
                          aria-label="Undo one clap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v6h6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 17a9 9 0 00-15-6l-3 2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        if (!userData) {
                          navigate('/login')
                          return
                        }
                        setShowPlaylistModal(true)
                        fetchUserPlaylists()
                      }}
                      className={`w-full font-medium px-4 py-2.5 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center ${
                        !userData
                          ? 'bg-surface-100 dark:bg-surface-900 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 text-primary-600 dark:text-primary-400'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {!userData ? 'Login to add to playlist' : 'Add to playlist'}
                    </Button>
                  </div>
                </div>
              </div>

              {userData && (userData._id === owner?.id || userData.$id === owner?.id || userData._id === note.userId || userData.$id === note.userId) && (
                <div className="bg-white/70 dark:bg-surface-900/70 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm overflow-hidden md:col-span-1">
                  <div className="bg-surface-50 dark:bg-surface-900/40 px-4 sm:px-5 py-3 border-b border-surface-200 dark:border-surface-800">
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center justify-between">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Versions
                      </span>
                      <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full text-xs font-medium">
                        {versions.length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-4 sm:p-5">
                    {versionCreated && (
                      <div className="mb-4 p-3 bg-brand-green/10 dark:bg-brand-green/15 border border-brand-green/30 rounded-lg flex items-center">
                        <svg className="w-5 h-5 text-brand-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-brand-green text-sm font-medium">
                          New version created and selected successfully!
                        </span>
                      </div>
                    )}
                    
                    {versions.length > 0 ? (
                      <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                        {versions.map((version, index) => (
                          <div
                            key={version._id}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 border ${
                              selectedVersion === version._id
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                                : 'bg-surface-50 dark:bg-surface-900/40 hover:bg-surface-100 dark:hover:bg-surface-800/60 border-surface-200 dark:border-surface-700'
                            }`}
                            onClick={() => {
                              setSelectedVersion(version._id)
                              setCurrentVersion(version)
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-semibold text-surface-600 dark:text-surface-300">
                                V{index + 1}
                              </span>
                              {version.isStarred && (
                                <span className="text-brand-orange" title="Starred">★</span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStarVersion(version._id)
                              }}
                              className={`p-1.5 rounded-md transition-colors duration-200 ${
                                version.isStarred
                                  ? 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/15'
                                  : 'text-surface-400 hover:text-brand-orange hover:bg-brand-orange/10 dark:hover:bg-brand-orange/15'
                              }`}
                              title={version.isStarred ? 'Unstar' : 'Star'}
                              type="button"
                            >
                              <svg className="w-4 h-4" fill={version.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-surface-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-surface-600 dark:text-surface-400 font-medium">No versions available</p>
                        <p className="text-surface-500 dark:text-surface-500 text-sm mt-2">Create versions to see them here</p>
                      </div>
                    )}
                    <Button
                      onClick={async () => {
                        if (!userData) {
                          navigate('/login')
                          return
                        }
                        
                        setCreatingVersion(true)
                        try {
                          const newVersionResponse = await appwriteService.createNoteVersion(noteId)
                          
                          const versionsData = await appwriteService.getNoteVersions(noteId)
                          if (versionsData && versionsData.versions) {
                            const versionsWithStar = versionsData.versions.map(v => ({
                              ...v,
                              isStarred: v._id === versionsData.starredVersionId
                            }))
                            setVersions(versionsWithStar)
                            
                            const newestVersion = versionsWithStar[0] || versionsWithStar.find(v => 
                              new Date(v.createdAt || v.timestamp) === Math.max(...versionsWithStar.map(ver => new Date(ver.createdAt || ver.timestamp)))
                            )
                            
                            if (newestVersion) {
                              setSelectedVersion(newestVersion._id)
                              setCurrentVersion(newestVersion)
                            }
                            
                            setVersionCreated(true)
                            setTimeout(() => setVersionCreated(false), 3000)
                          }
                        } catch (error) {
                          console.error('Error creating new version:', error)
                          alert('Failed to create new version. Please try again.')
                        } finally {
                          setCreatingVersion(false)
                        }
                      }}
                      disabled={creatingVersion}
                      className={`w-full mt-4 font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-sm ${
                        creatingVersion 
                          ? 'bg-surface-300 dark:bg-surface-700 cursor-not-allowed' 
                          : 'bg-primary-600 hover:bg-primary-700'
                      } text-white`}
                    >
                      {creatingVersion ? (
                        <>
                          <Skeleton className="w-5 h-5 mr-2" rounded="rounded-full" />
                          Creating Version...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create New Version
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-white/70 dark:bg-surface-900/70 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="bg-surface-50 dark:bg-surface-900/40 px-4 sm:px-5 py-3 border-b border-surface-200 dark:border-surface-800">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 sm:p-5 space-y-3">
                  {actionFeedback && (
                    <div className={`px-3 py-2 rounded-lg border flex items-center ${
                      actionFeedback.type === 'success' 
                        ? 'bg-brand-green/10 dark:bg-brand-green/15 border-brand-green/30 text-brand-green'
                        : 'bg-brand-red/10 dark:bg-brand-red/15 border-brand-red/30 text-brand-red'
                    }`}>
                      <svg className={`w-5 h-5 mr-2 ${
                        actionFeedback.type === 'success' ? 'text-brand-green' : 'text-brand-red'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {actionFeedback.type === 'success' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        )}
                      </svg>
                      <span className="text-xs font-medium">{actionFeedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleShareNote}
                      disabled={sharingNote}
                      className="h-10 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-700 dark:text-surface-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title={sharingNote ? 'Sharing…' : 'Share'}
                      type="button"
                    >
                      {sharingNote ? (
                        <Skeleton className="w-4 h-4" rounded="rounded-full" />
                      ) : (
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={handleExportNote}
                      disabled={exportingNote}
                      className="h-10 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-700 dark:text-surface-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title={exportingNote ? 'Exporting…' : 'Export'}
                      type="button"
                    >
                      {exportingNote ? (
                        <Skeleton className="w-4 h-4" rounded="rounded-full" />
                      ) : (
                        <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={handleCopyLink}
                      disabled={copyingLink}
                      className="h-10 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-700 dark:text-surface-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title={copyingLink ? 'Copying…' : 'Copy link'}
                      type="button"
                    >
                      {copyingLink ? (
                        <Skeleton className="w-4 h-4" rounded="rounded-full" />
                      ) : (
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-surface-600 dark:text-surface-400">
                    Share • Export • Copy link
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </Container>
      
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="bg-surface-50 dark:bg-surface-900/40 px-6 py-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Add to Playlist
                </h3>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {loadingPlaylists ? (
                <div className="py-2 space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-16 w-full" rounded="rounded-xl" />
                  <Skeleton className="h-16 w-full" rounded="rounded-xl" />
                  <Skeleton className="h-16 w-full" rounded="rounded-xl" />
                </div>
              ) : playlists.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">Select a playlist to add this note:</p>
                  {playlists.map((playlist) => (
                    <button
                      key={playlist._id || playlist.id}
                      onClick={() => handleAddToPlaylist(playlist._id || playlist.id)}
                      disabled={addingToPlaylist}
                      className="w-full text-left p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-surface-900 dark:text-surface-50 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors truncate">
                            {playlist.name}
                          </h4>
                          {playlist.description && (
                            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                              {playlist.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-surface-500 dark:text-surface-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {playlist.notes?.length || playlist.noteCount || 0} notes
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-surface-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-2">No playlists found</h4>
                  <p className="text-surface-600 dark:text-surface-400 mb-4">Create your first playlist to organize your notes.</p>
                  <Button
                    onClick={() => {
                      setShowPlaylistModal(false)
                      navigate('/create-playlist')
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                  >
                    Create Playlist
                  </Button>
                </div>
              )}
              
              {addingToPlaylist && (
                <div className="absolute inset-0 bg-white dark:bg-surface-900 bg-opacity-90 flex items-center justify-center rounded-2xl">
                  <div className="text-center space-y-3">
                    <Skeleton className="h-8 w-8 mx-auto" rounded="rounded-full" />
                    <Skeleton className="h-4 w-40 mx-auto" />
                  </div>
                </div>
              )}
            </div>
            
            {!loadingPlaylists && playlists.length > 0 && (
              <div className="bg-surface-50 dark:bg-surface-800 px-6 py-4 border-t border-surface-200 dark:border-surface-700">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => {
                      setShowPlaylistModal(false)
                      navigate('/create-playlist')
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Playlist
                  </Button>
                  <Button
                    onClick={() => setShowPlaylistModal(false)}
                    className="bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl max-w-sm w-full">
            <div className="bg-surface-50 dark:bg-surface-900/40 px-6 py-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Quiz
                </h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="mb-4 p-4 bg-brand-red/10 dark:bg-brand-red/15 border border-brand-red/30 rounded-lg">
                <p className="text-sm text-brand-red font-medium">⚠️ This action cannot be undone</p>
              </div>
              
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Are you sure you want to delete this quiz? {quiz?.quize?.length || 0} questions will be permanently removed.
              </p>
              
              <p className="text-sm text-surface-500 dark:text-surface-500">
                This will only delete the quiz. The note content will remain intact.
              </p>
            </div>
            
            <div className="bg-surface-50 dark:bg-surface-800 px-6 py-4 border-t border-surface-200 dark:border-surface-700 flex items-center justify-end gap-3 rounded-b-2xl">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteQuiz}
                disabled={deletingQuiz}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                  deletingQuiz
                    ? 'bg-brand-red text-white cursor-not-allowed opacity-60'
                    : 'bg-brand-red hover:bg-brand-red/90 text-white hover:scale-105 shadow-lg shadow-brand-red/30'
                }`}
              >
                {deletingQuiz ? (
                  <>
                    <Skeleton className="w-5 h-5 mr-2" rounded="rounded-full" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCopyNotification && (
        <div className="fixed top-20 right-4 z-50 bg-brand-green text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-bounce">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Code copied successfully!
        </div>
      )}
    </div>
  )
}

export default NoteView
