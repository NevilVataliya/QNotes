import { useState, useEffect } from 'react'
import { Container, Button, Skeleton } from '../../components'
import { useNavigate, useParams } from 'react-router-dom'
import appwriteService from '../../appwrite/config'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'

function NoteVersions() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const noteId = slug // Use slug as noteId for consistency

  const [note, setNote] = useState(null)
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState('')
  const [compareVersion, setCompareVersion] = useState('')
  const [viewMode, setViewMode] = useState('single') // single, compare, timeline
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false) // For syntax highlighting theme
  const [copiedCodeId, setCopiedCodeId] = useState(null) // For code copy feedback

  // Dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    
    const handleColorSchemeChange = (event) => setIsDarkMode(event.matches)
    mediaQuery.addEventListener('change', handleColorSchemeChange)
    
    return () => mediaQuery.removeEventListener('change', handleColorSchemeChange)
  }, [])

  useEffect(() => {
    const fetchNoteAndVersions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch note data
        const noteData = await appwriteService.getNote(noteId)

        if (noteData) {
          setNote(noteData)
        } else {
          setError('Note not found or you don\'t have permission to view it')
          return
        }

        // Fetch versions data
        const versionsData = await appwriteService.getNoteVersions(noteId)

        if (versionsData && versionsData.versions) {
          const versionsWithStar = versionsData.versions.map(v => ({
            ...v,
            isStarred: v._id === versionsData.starredVersionId
          }))
          setVersions(versionsWithStar)
          // Set the starred version as selected by default
          if (versionsData.starredVersionId) {
            setSelectedVersion(versionsData.starredVersionId)
          } else if (versionsData.versions.length > 0) {
            setSelectedVersion(versionsData.versions[0]._id)
          }
        } else {
          setVersions([])
        }
      } catch (err) {
        console.error('Error fetching note and versions:', err)
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          setError('You need to be logged in to view note versions')
        } else {
          setError(`Failed to load note versions: ${err.message || err}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (noteId) {
      fetchNoteAndVersions()
    }
  }, [noteId])



  const handleStarVersion = async (versionId) => {
    try {
      await appwriteService.starNoteVersion(noteId, versionId)
      // Refresh versions data to get updated star status
      const versionsData = await appwriteService.getNoteVersions(noteId)
      if (versionsData && versionsData.versions) {
        const versionsWithStar = versionsData.versions.map(v => ({
          ...v,
          isStarred: v._id === versionsData.starredVersionId
        }))
        setVersions(versionsWithStar)
        // Update the selected version to reflect the new star status
        const updatedVersion = versionsWithStar.find(v => v._id === versionId)
        if (updatedVersion) {
          setSelectedVersion(versionId)
        }
      }
    } catch (error) {
      console.error('Error starring version:', error)
      alert('Failed to star version. Please try again.')
    }
  }

  const handleDeleteVersion = async (versionId) => {
    if (!versions || versions.length <= 1) {
      alert('Cannot delete the last version of a note.')
      return
    }

    // Check if this is the starred version
    const versionToDelete = versions.find(v => v._id === versionId)
    if (versionToDelete && versionToDelete.isStarred) {
      alert('Cannot delete a starred version. Please star another version first.')
      return
    }

    if (confirm('Are you sure you want to delete this version?')) {
      try {
        await appwriteService.deleteNoteVersion(noteId, versionId)
        // Refresh versions data
        const updatedVersionsData = await appwriteService.getNoteVersions(noteId)
        if (updatedVersionsData && updatedVersionsData.versions) {
          const versionsWithStar = updatedVersionsData.versions.map(v => ({
            ...v,
            isStarred: v._id === updatedVersionsData.starredVersionId
          }))
          setVersions(versionsWithStar)
          // Update selected version if it was deleted
          if (selectedVersion === versionId) {
            const remainingVersions = versionsWithStar
            if (remainingVersions.length > 0) {
              // Select the starred version or the first available version
              const starredVersion = remainingVersions.find(v => v.isStarred)
              setSelectedVersion(starredVersion ? starredVersion._id : remainingVersions[0]._id)
            }
          }
        }
      } catch (error) {
        console.error('Error deleting version:', error)
        alert('Failed to delete version. Please try again.')
      }
    }
  }

  const handleCreateNewVersion = async () => {
    try {
      await appwriteService.createNoteVersion(noteId)
      // Refresh versions data
      const updatedVersionsData = await appwriteService.getNoteVersions(noteId)
      if (updatedVersionsData && updatedVersionsData.versions) {
        const versionsWithStar = updatedVersionsData.versions.map(v => ({
          ...v,
          isStarred: v._id === updatedVersionsData.starredVersionId
        }))
        setVersions(versionsWithStar)
      }
    } catch (error) {
      console.error('Error creating new version:', error)
      alert('Failed to create new version. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
        <Container>
          <div className="max-w-6xl mx-auto py-10 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-32" rounded="rounded-xl" />
              <Skeleton className="h-10 w-32" rounded="rounded-xl" />
              <Skeleton className="h-10 w-32" rounded="rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                <Skeleton className="h-10 w-full" rounded="rounded-xl" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-10 w-64" rounded="rounded-xl" />
                <Skeleton className="h-96 w-full" rounded="rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-surface-900 text-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Versions</h2>
          <p className="text-surface-400 mb-4">{error || 'Failed to load note versions.'}</p>
          <Button onClick={() => navigate(`/note/${noteId}`)} className="bg-primary-600 hover:bg-primary-700 text-white">
            Back to Note
          </Button>
        </div>
      </div>
    )
  }

  const filteredVersions = versions?.filter(version => {
    if (!searchQuery) return true
    const content = version.content || version.text || ''
    return content.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedVersionData = versions?.find(v => v._id === selectedVersion)
  const compareVersionData = versions?.find(v => v._id === compareVersion)

  const calculateWordCount = (text) => {
    if (!text || typeof text !== 'string') return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const calculateCharCount = (text) => {
    if (!text || typeof text !== 'string') return 0
    return text.length
  }

  const handleCopyCode = async (code, codeId) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodeId(codeId)
      setTimeout(() => setCopiedCodeId(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const preprocessMarkdown = (text) => {
    if (!text) return ''
    
    let processed = text
      // Fix lists that might have extra spaces
      .replace(/^\s*[\*\-\+]\s/gm, '* ')
      .replace(/^\s{2,}[\*\-\+]\s/gm, '  * ')
      // Fix code blocks
      .replace(/```(\w*)\n/g, '```$1\n')
      // Fix inline code
      .replace(/`([^`]+)`/g, '`$1`')
    
    return processed
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
      <Container>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => navigate(`/note/${noteId}`)}
                    className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 mr-4 inline-flex items-center text-sm font-medium transition-colors group"
                  >
                    <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Note
                  </button>
                </div>
                <h1 className="text-4xl font-bold mb-3 text-surface-900 dark:text-surface-50">
                  Version History
                </h1>
                <p className="text-surface-600 dark:text-surface-400 text-lg">
                  Manage and compare versions of "{note?.title || 'this note'}"
                </p>
                <div className="flex items-center space-x-6 mt-4 text-sm text-surface-600 dark:text-surface-400">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {versions?.length || 0} versions
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {versions?.filter(v => v.isStarred).length || 0} starred
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCreateNewVersion}
                  className="bg-primary-600 hover:bg-primary-700 px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-white"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Version
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search versions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder-surface-500 dark:placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="flex bg-surface-100 dark:bg-surface-900 rounded-xl p-1 border border-surface-300 dark:border-surface-700">
                  {[
                    { id: 'single', label: 'Single View', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { id: 'compare', label: 'Compare', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                        viewMode === mode.id
                          ? 'bg-primary-600 dark:bg-primary-600 text-white shadow-md dark:shadow-lg'
                          : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-surface-200 dark:hover:bg-surface-700/50'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.icon} />
                      </svg>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'single' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-1 order-2 xl:order-1">
                <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-xl overflow-hidden sticky top-8 transition-colors duration-200">
                  <div className="bg-surface-50 dark:bg-surface-900/60 px-6 py-4 border-b border-surface-200 dark:border-surface-700 transition-colors duration-200">
                    <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 flex items-center justify-between">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Versions
                      </span>
                      <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200">
                        {filteredVersions?.length || 0}
                      </span>
                    </h2>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {filteredVersions?.map((version, index) => {
                        const originalIndex = versions.findIndex(v => v._id === version._id)
                        return (
                          <div
                            key={version._id}
                            onClick={() => setSelectedVersion(version._id)}
                            className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                              selectedVersion === version._id
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700 shadow-md dark:shadow-lg text-surface-900 dark:text-surface-50'
                                : 'bg-surface-100 dark:bg-surface-900/40 hover:bg-surface-200 dark:hover:bg-surface-800/40 border-2 border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 text-surface-900 dark:text-surface-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                                  selectedVersion === version._id 
                                      ? 'bg-primary-600 text-white' 
                                      : 'bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                                }`}>
                                  {originalIndex + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    Version {originalIndex + 1}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {version.isStarred && (
                                  <div className="bg-brand-orange/10 dark:bg-brand-orange/20 p-1.5 rounded-lg transition-colors duration-200">
                                    <svg className="w-4 h-4 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  </div>
                                )}
                                {versions.length > 1 && !version.isStarred && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteVersion(version._id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-brand-red/10 dark:hover:bg-brand-red/20 text-brand-red transition-all duration-200"
                                    title="Delete version"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-surface-600 dark:text-surface-400 border-t border-surface-200 dark:border-surface-700 pt-3 transition-colors duration-200">
                              <span>{calculateWordCount(version.content || version.text)} words</span>
                              <span>{calculateCharCount(version.content || version.text)} chars</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-3 order-1 xl:order-2">
                {selectedVersionData ? (
                  <div className="space-y-6">
                    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-xl p-6 transition-colors duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {versions.findIndex(v => v._id === selectedVersion) + 1}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">
                                Version {versions.findIndex(v => v._id === selectedVersion) + 1}
                              </h2>

                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-surface-100 dark:bg-surface-900/40 rounded-lg p-3 transition-colors duration-200">
                              <div className="text-xs text-surface-600 dark:text-surface-400 mb-1">Words</div>
                              <div className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                                {calculateWordCount(selectedVersionData.content || selectedVersionData.text)}
                              </div>
                            </div>
                            <div className="bg-surface-100 dark:bg-surface-900/40 rounded-lg p-3 transition-colors duration-200">
                              <div className="text-xs text-surface-600 dark:text-surface-400 mb-1">Characters</div>
                              <div className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                                {calculateCharCount(selectedVersionData.content || selectedVersionData.text)}
                              </div>
                            </div>
                            <div className="bg-surface-100 dark:bg-surface-900/40 rounded-lg p-3 transition-colors duration-200">
                              <div className="text-xs text-surface-600 dark:text-surface-400 mb-1">Status</div>
                              <div className={`text-sm font-medium flex items-center transition-colors duration-200 ${
                                selectedVersionData.isStarred ? 'text-brand-orange' : 'text-surface-600 dark:text-surface-300'
                              }`}>
                                {selectedVersionData.isStarred ? (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Active
                                  </>
                                ) : (
                                  'Archived'
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => handleStarVersion(selectedVersion)}
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center ${
                              selectedVersionData.isStarred 
                                ? 'bg-brand-orange/10 dark:bg-brand-orange/20 border border-brand-orange/30 dark:border-brand-orange/40 text-brand-orange hover:bg-brand-orange/20 dark:hover:bg-brand-orange/30' 
                                : 'bg-surface-200 dark:bg-surface-900/40 border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-brand-orange/10 dark:hover:bg-brand-orange/20 hover:border-brand-orange/30 dark:hover:border-brand-orange/40 hover:text-brand-orange'
                            }`}
                          >
                            <svg className="w-5 h-5 mr-2" fill={selectedVersionData.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {selectedVersionData.isStarred ? 'Active Version' : 'Make Active'}
                          </Button>
                          
                          <Button
                            onClick={() => {
                              setViewMode('compare')
                              setCompareVersion(selectedVersion)
                            }}
                            className="bg-primary-100 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/30 hover:border-primary-400 dark:hover:border-primary-600 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
                      <div className="bg-surface-50 dark:bg-surface-900/60 px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                        <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 flex items-center transition-colors duration-200">
                          <svg className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Content Preview
                        </h3>
                      </div>
                      <div className="p-6 max-h-96 overflow-y-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
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
                            p: ({ children, ...props }) => (
                              <p className="mb-4 text-surface-700 dark:text-surface-300 leading-7 text-base text-left" {...props}>
                                {children}
                              </p>
                            ),
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
                            blockquote: ({ children, ...props }) => (
                              <blockquote 
                                className="border-l-4 border-primary-500 pl-6 py-2 my-6 bg-primary-50 dark:bg-primary-900/20 rounded-r-lg text-surface-700 dark:text-surface-300 italic text-left" 
                                {...props}
                              >
                                {children}
                              </blockquote>
                            ),
                            code: ({ inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '')
                              const language = match ? match[1] : ''
                              const codeContent = String(children).replace(/\n$/, '')
                              const blockId = `code-${Math.random().toString(36).substr(2, 9)}`
                              const hasNewlines = codeContent.includes('\n')
                              
                              if (!inline && language && className?.includes('language-') && language !== 'text' && language !== 'plain' && hasNewlines) {
                                return (
                                  <div className="relative my-6 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-800 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1.5">
                                          <div className="w-3 h-3 rounded-full bg-brand-red"></div>
                                          <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                                          <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                                        </div>
                                        <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider px-2 py-1 bg-white dark:bg-surface-700 rounded-md border border-surface-200 dark:border-surface-600">
                                          {language || 'code'}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => handleCopyCode(codeContent, blockId)}
                                        className={`group relative px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                          copiedCodeId === blockId 
                                            ? 'text-white bg-brand-green border-brand-green shadow-lg shadow-brand-green/30 animate-pulse'
                                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 bg-white dark:bg-surface-700 hover:bg-surface-50 dark:hover:bg-surface-600 border-surface-200 dark:border-surface-600 hover:shadow-md'
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
                                return (
                                  <p className="my-4 text-surface-900 dark:text-surface-50 leading-relaxed whitespace-pre-wrap">
                                    {codeContent}
                                  </p>
                                )
                              } else if (inline || !hasNewlines) {
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
                              return <span>{children}</span>
                            },
                            pre: ({ children, ...props }) => (
                              <pre className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg overflow-x-auto mb-4 text-sm border border-surface-200 dark:border-surface-700" {...props}>
                                {children}
                              </pre>
                            ),
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
                            hr: ({ ...props }) => (
                              <hr className="border-surface-300 dark:border-surface-700 my-8" {...props} />
                            ),
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
                            const content = selectedVersionData?.content || selectedVersionData?.text || 'No content available'
                            const processedContent = preprocessMarkdown(typeof content === 'string' ? content : String(content || ''))
                            return processedContent
                          })()}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/80 dark:bg-surface-900/60 backdrop-blur-sm rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm dark:shadow-xl p-12 text-center transition-colors duration-200">
                    <div className="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-surface-600 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-3">No Version Selected</h3>
                    <p className="text-surface-600 dark:text-surface-400 text-lg">Choose a version from the sidebar to view its content</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'compare' && (
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-surface-900/60 backdrop-blur-sm rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm dark:shadow-xl p-6 transition-colors duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center transition-colors duration-200">
                    <svg className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Compare Versions
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Version A:</label>
                      <select
                        value={compareVersion}
                        onChange={(e) => setCompareVersion(e.target.value)}
                        className="bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-lg px-3 py-2 text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none [&>option]:bg-white [&>option]:dark:bg-surface-900 [&>option]:text-surface-900 [&>option]:dark:text-surface-50 transition-colors duration-200"
                      >
                        <option value="">Select version...</option>
                        {versions?.map((version, index) => (
                          <option key={version._id} value={version._id}>
                            Version {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Version B:</label>
                      <select
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-lg px-3 py-2 text-surface-900 dark:text-surface-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none [&>option]:bg-white [&>option]:dark:bg-surface-900 [&>option]:text-surface-900 [&>option]:dark:text-surface-50 transition-colors duration-200"
                      >
                        <option value="">Select version...</option>
                        {versions?.map((version, index) => (
                          <option key={version._id} value={version._id}>
                            Version {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {compareVersion && selectedVersion && compareVersionData && selectedVersionData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/80 dark:bg-surface-900/60 backdrop-blur-sm rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
                    <div className="bg-surface-50 dark:bg-surface-900/40 px-6 py-4 border-b border-surface-200 dark:border-surface-800">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 flex items-center justify-between transition-colors duration-200">
                        <span>Version {versions.findIndex(v => v._id === compareVersion) + 1}</span>
                        <span className="text-sm text-primary-700 dark:text-primary-300">{calculateWordCount(compareVersionData.content || compareVersionData.text)} words</span>
                      </h3>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
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
                              <h4 className="text-lg sm:text-xl font-semibold mb-3 mt-5 text-surface-800 dark:text-surface-100" {...props}>
                                {children}
                              </h4>
                            ),
                            h5: ({ children, ...props }) => (
                              <h5 className="text-base sm:text-lg font-semibold mb-3 mt-4 text-surface-800 dark:text-surface-100" {...props}>
                                {children}
                              </h5>
                            ),
                            h6: ({ children, ...props }) => (
                              <h6 className="text-sm sm:text-base font-semibold mb-2 mt-3 text-surface-700 dark:text-surface-200" {...props}>
                                {children}
                              </h6>
                            ),
                            p: ({ children, ...props }) => (
                              <p className="mb-4 text-surface-700 dark:text-surface-300 leading-7 text-base text-left" {...props}>
                                {children}
                              </p>
                            ),
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
                            blockquote: ({ children, ...props }) => (
                              <blockquote 
                                className="border-l-4 border-primary-500 pl-6 py-2 my-6 bg-primary-50 dark:bg-primary-900/20 rounded-r-lg text-surface-700 dark:text-surface-300 italic text-left" 
                                {...props}
                              >
                                {children}
                              </blockquote>
                            ),
                            code: ({ inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '')
                              const language = match ? match[1] : ''
                              const codeContent = String(children).replace(/\n$/, '')
                              const blockId = `code-${Math.random().toString(36).substr(2, 9)}`
                              const hasNewlines = codeContent.includes('\n')
                              
                              if (!inline && language && className?.includes('language-') && language !== 'text' && language !== 'plain' && hasNewlines) {
                                return (
                                    <div className="relative my-6 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-900 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1.5">
                                          <div className="w-3 h-3 rounded-full bg-brand-red"></div>
                                          <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                                          <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                                        </div>
                                        <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider px-2 py-1 bg-white dark:bg-surface-900 rounded-md border border-surface-200 dark:border-surface-700">
                                          {language || 'code'}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => handleCopyCode(codeContent, blockId)}
                                        className={`group relative px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                          copiedCodeId === blockId 
                                            ? 'text-white bg-brand-green border-brand-green shadow-lg shadow-brand-green/30 animate-pulse'
                                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800 border-surface-200 dark:border-surface-700 hover:shadow-md'
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
                                      className="!m-0 !bg-transparent overflow-x-auto scrollbar-thin scrollbar-thumb-surface-300 dark:scrollbar-thumb-surface-700 scrollbar-track-transparent"
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
                                return (
                                  <p className="my-4 text-surface-900 dark:text-surface-100 leading-relaxed whitespace-pre-wrap">
                                    {codeContent}
                                  </p>
                                )
                              } else if (inline || !hasNewlines) {
                                return (
                                  <code 
                                    className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-sm font-mono text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700" 
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
                              return <span>{children}</span>
                            },
                            pre: ({ children, ...props }) => (
                              <pre className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg overflow-x-auto mb-4 text-sm border border-surface-200 dark:border-surface-700" {...props}>
                                {children}
                              </pre>
                            ),
                            a: ({ href, children, ...props }) => (
                              <a 
                                href={href} 
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline decoration-primary-600/30 hover:decoration-primary-600 transition-colors font-medium break-words" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                            hr: ({ ...props }) => (
                              <hr className="border-surface-300 dark:border-surface-700 my-8" {...props} />
                            ),
                            table: ({ children, ...props }) => (
                              <div className="overflow-x-auto my-6 rounded-lg border border-surface-200 dark:border-surface-700">
                                <table className="min-w-full bg-white dark:bg-surface-900 text-left" {...props}>
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children, ...props }) => (
                              <thead className="bg-surface-50 dark:bg-surface-800" {...props}>
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
                            const content = compareVersionData?.content || compareVersionData?.text || 'No content available'
                            const processedContent = preprocessMarkdown(typeof content === 'string' ? content : String(content || ''))
                            return processedContent
                          })()}
                        </ReactMarkdown>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-surface-900/60 backdrop-blur-sm rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
                    <div className="bg-surface-50 dark:bg-surface-900/40 px-6 py-4 border-b border-surface-200 dark:border-surface-800">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 flex items-center justify-between transition-colors duration-200">
                        <span>Version {versions.findIndex(v => v._id === selectedVersion) + 1}</span>
                        <span className="text-sm text-primary-700 dark:text-primary-300">{calculateWordCount(selectedVersionData.content || selectedVersionData.text)} words</span>
                      </h3>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
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
                              <h4 className="text-lg sm:text-xl font-semibold mb-3 mt-5 text-surface-900 dark:text-surface-100" {...props}>
                                {children}
                              </h4>
                            ),
                            h5: ({ children, ...props }) => (
                              <h5 className="text-base sm:text-lg font-semibold mb-3 mt-4 text-surface-900 dark:text-surface-100" {...props}>
                                {children}
                              </h5>
                            ),
                            h6: ({ children, ...props }) => (
                              <h6 className="text-sm sm:text-base font-semibold mb-2 mt-3 text-surface-800 dark:text-surface-200" {...props}>
                                {children}
                              </h6>
                            ),
                            p: ({ children, ...props }) => (
                              <p className="mb-4 text-surface-700 dark:text-surface-300 leading-7 text-base text-left" {...props}>
                                {children}
                              </p>
                            ),
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
                            blockquote: ({ children, ...props }) => (
                              <blockquote 
                                className="border-l-4 border-primary-500 pl-6 py-2 my-6 bg-primary-50 dark:bg-primary-900/20 rounded-r-lg text-surface-700 dark:text-surface-300 italic text-left" 
                                {...props}
                              >
                                {children}
                              </blockquote>
                            ),
                            code: ({ inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '')
                              const language = match ? match[1] : ''
                              const codeContent = String(children).replace(/\n$/, '')
                              const blockId = `code-${Math.random().toString(36).substr(2, 9)}`
                              const hasNewlines = codeContent.includes('\n')
                              
                              if (!inline && language && className?.includes('language-') && language !== 'text' && language !== 'plain' && hasNewlines) {
                                return (
                                  <div className="relative my-6 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-800 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1.5">
                                          <div className="w-3 h-3 rounded-full bg-brand-red"></div>
                                          <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                                          <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                                        </div>
                                        <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider px-2 py-1 bg-white dark:bg-surface-700 rounded-md border border-surface-200 dark:border-surface-600">
                                          {language || 'code'}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => handleCopyCode(codeContent, blockId)}
                                        className={`group relative px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                          copiedCodeId === blockId 
                                            ? 'text-white bg-brand-green border-brand-green shadow-lg shadow-brand-green/30 animate-pulse'
                                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 bg-white dark:bg-surface-700 hover:bg-surface-50 dark:hover:bg-surface-600 border-surface-200 dark:border-surface-600 hover:shadow-md'
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
                                return (
                                  <p className="my-4 text-surface-900 dark:text-surface-100 leading-relaxed whitespace-pre-wrap">
                                    {codeContent}
                                  </p>
                                )
                              } else if (inline || !hasNewlines) {
                                return (
                                  <code 
                                    className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-sm font-mono text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700" 
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
                              return <span>{children}</span>
                            },
                            pre: ({ children, ...props }) => (
                              <pre className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg overflow-x-auto mb-4 text-sm border border-surface-200 dark:border-surface-700" {...props}>
                                {children}
                              </pre>
                            ),
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
                            hr: ({ ...props }) => (
                              <hr className="border-surface-300 dark:border-surface-700 my-8" {...props} />
                            ),
                            table: ({ children, ...props }) => (
                              <div className="overflow-x-auto my-6 rounded-lg border border-surface-200 dark:border-surface-700">
                                <table className="min-w-full bg-white dark:bg-surface-900 text-left" {...props}>
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children, ...props }) => (
                              <thead className="bg-surface-50 dark:bg-surface-800" {...props}>
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
                            const content = selectedVersionData?.content || selectedVersionData?.text || 'No content available'
                            const processedContent = preprocessMarkdown(typeof content === 'string' ? content : String(content || ''))
                            return processedContent
                          })()}
                        </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 dark:bg-surface-900/60 backdrop-blur-sm rounded-2xl border border-surface-200/70 dark:border-surface-800/70 shadow-sm dark:shadow-xl p-12 text-center transition-colors duration-200">
                  <div className="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-surface-600 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-3">Select Two Versions to Compare</h3>
                  <p className="text-surface-600 dark:text-surface-400 text-lg">Choose versions from the dropdowns above to see a side-by-side comparison</p>
                </div>
              )}
            </div>
          )}

        </div>
      </Container>
    </div>
  )
}

export default NoteVersions
