import { useState, useEffect } from 'react'
import { Container, Button, Input, Skeleton } from '../../components'
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
import { useSelector } from 'react-redux'
import { getNoteId } from '../../utils/noteUtils'

function EditNote() {
  const { slug } = useParams()
  const noteId = slug // Map slug to noteId for consistency
  const navigate = useNavigate()
  
  // Redux theme hook - moved to top level
  const theme = useSelector((state) => state.settings?.settings?.theme || 'light')
  const isDark = theme === 'dark'
  
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    isPublic: false
  })
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode for consistency
  const [copiedCodeId, setCopiedCodeId] = useState(null)
  const [isScrollSyncing, setIsScrollSyncing] = useState(false)
  const [splitPosition, setSplitPosition] = useState(50) // Percentage for split position
  const [isResizing, setIsResizing] = useState(false)
  const [editorMaximized, setEditorMaximized] = useState(false)
  const [previewMaximized, setPreviewMaximized] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true)
        const noteData = await appwriteService.getNote(noteId)

        // Support both legacy array response and normalized object response
        let noteInfo = null
        if (!noteData) {
          noteInfo = null
        } else if (Array.isArray(noteData) && noteData.length > 0) {
          noteInfo = noteData[0]
        } else if (typeof noteData === 'object') {
          noteInfo = noteData
        }

        if (noteInfo) {
          setNote(noteInfo)
          setFormData({
            title: noteInfo.title || '',
            description: noteInfo.description || '',
            content: noteInfo.note || noteInfo.content || '',
            isPublic: Boolean(noteInfo.isPublic)
          })
        } else {
          setError('Note not found')
        }
      } catch (err) {
        console.error('Error fetching note:', err)
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          setError('You need to be logged in to edit this note')
        } else if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          setError('Note not found')
        } else {
          setError(`Failed to load note: ${err.message || err}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (noteId) {
      fetchNote()
    }
  }, [noteId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVisibilityChange = (isPublic) => {
    setFormData(prev => ({
      ...prev,
      isPublic
    }))
  }

  const handleSave = async () => {
    if (!note) return

    setSaving(true)
    try {
      // Prepare update data with content
      const updateData = {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        content: formData.content // Also update content field for compatibility
      }
      
      const resolvedNoteId = getNoteId(note) ?? noteId
      await appwriteService.updateNote(resolvedNoteId, updateData)
      navigate(`/note/${noteId}`)
    } catch (error) {
      console.error('Failed to update note:', error)
      alert('Failed to update note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(`/note/${noteId}`)
  }

  // Undo/Redo functionality
  const saveStateForUndo = (currentContent) => {
    setUndoStack(prev => {
      const newStack = [...prev, currentContent].slice(-50) // Keep last 50 states
      setCanUndo(newStack.length > 0)
      return newStack
    })
    setRedoStack([]) // Clear redo stack when new action is performed
    setCanRedo(false)
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    
    const previousState = undoStack[undoStack.length - 1]
    const currentState = formData.content
    
    setRedoStack(prev => {
      const newStack = [...prev, currentState]
      setCanRedo(true)
      return newStack
    })
    
    setUndoStack(prev => {
      const newStack = prev.slice(0, -1)
      setCanUndo(newStack.length > 0)
      return newStack
    })
    
    setFormData(prev => ({ ...prev, content: previousState }))
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    
    const nextState = redoStack[redoStack.length - 1]
    const currentState = formData.content
    
    setUndoStack(prev => {
      const newStack = [...prev, currentState]
      setCanUndo(true)
      return newStack
    })
    
    setRedoStack(prev => {
      const newStack = prev.slice(0, -1)
      setCanRedo(newStack.length > 0)
      return newStack
    })
    
    setFormData(prev => ({ ...prev, content: nextState }))
  }

  // Markdown editor helper functions
  const insertMarkdown = (before, after = '', saveUndo = true) => {
    const textarea = document.getElementById('content-editor')
    if (!textarea) return

    if (saveUndo) {
      saveStateForUndo(formData.content)
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const beforeText = formData.content.substring(0, start)
    const afterText = formData.content.substring(end)

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`
    
    setFormData(prev => ({ ...prev, content: newText }))
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Enhanced list functions for multiple lines
  const formatMultiLineList = (prefix, saveUndo = true) => {
    const textarea = document.getElementById('content-editor')
    if (!textarea) return

    if (saveUndo) {
      saveStateForUndo(formData.content)
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    
    if (!selectedText) {
      // No selection, just insert at cursor
      insertMarkdown(prefix, '', false)
      return
    }

    // Split selected text into lines and format each
    const lines = selectedText.split('\n')
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine === '') return line // Keep empty lines as-is
      
      if (prefix === '- ') {
        // Bullet list
        return `- ${trimmedLine}`
      } else {
        // Numbered list
        return `${index + 1}. ${trimmedLine}`
      }
    })
    
    const beforeText = formData.content.substring(0, start)
    const afterText = formData.content.substring(end)
    const newText = `${beforeText}${formattedLines.join('\n')}${afterText}`
    
    setFormData(prev => ({ ...prev, content: newText }))
    
    // Restore selection
    setTimeout(() => {
      textarea.focus()
      const newEndPos = start + formattedLines.join('\n').length
      textarea.setSelectionRange(start, newEndPos)
    }, 0)
  }

  const formatBold = () => insertMarkdown('**', '**')
  const formatItalic = () => insertMarkdown('*', '*')
  const formatCode = () => insertMarkdown('`', '`')
  const formatCodeBlock = () => insertMarkdown('\n```\n', '\n```\n')
  const formatHeading = (level) => insertMarkdown(`${'#'.repeat(level)} `)
  const formatList = () => formatMultiLineList('- ')
  const formatNumberedList = () => formatMultiLineList('1. ')
  const formatQuote = () => insertMarkdown('> ')
  const formatLink = () => insertMarkdown('[', '](url)')

  const handleContentChange = (e) => {
    setFormData(prev => ({ ...prev, content: e.target.value }))
  }

  // Save state for undo on significant changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.content !== '' && undoStack.length === 0) {
        // Initial content load
        return
      }
      // Auto-save state every 3 seconds of typing
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [formData.content])

  // Code copy functionality for preview
  const handleCopyCode = async (code, blockId) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodeId(blockId)
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

  // Resizer functionality
  const handleMouseDown = (e) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isResizing) return
    
    const container = document.getElementById('editor-container')
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    
    // Limit the split position between 10% and 90%
    const clampedPosition = Math.min(Math.max(newPosition, 10), 90)
    setSplitPosition(clampedPosition)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  // Add global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  // Maximize/minimize handlers
  const handleMaximizeEditor = () => {
    setEditorMaximized(!editorMaximized)
    setPreviewMaximized(false)
  }

  const handleMaximizePreview = () => {
    setPreviewMaximized(!previewMaximized)
    setEditorMaximized(false)
  }

  // Synchronized scrolling functionality
  const handleEditorScroll = (e) => {
    if (isScrollSyncing || editorMaximized || previewMaximized) return
    
    setIsScrollSyncing(true)
    const editor = e.target
    const preview = document.getElementById('preview-container')
    
    if (preview) {
      const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
      const previewScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
      preview.scrollTop = previewScrollTop
    }
    
    setTimeout(() => setIsScrollSyncing(false), 100)
  }

  const handlePreviewScroll = (e) => {
    if (isScrollSyncing || editorMaximized || previewMaximized) return
    
    setIsScrollSyncing(true)
    const preview = e.target
    const editor = document.getElementById('content-editor')
    
    if (editor) {
      const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
      const editorScrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight)
      editor.scrollTop = editorScrollTop
    }
    
    setTimeout(() => setIsScrollSyncing(false), 100)
  }

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          formatBold()
          break
        case 'i':
          e.preventDefault()
          formatItalic()
          break
        case '`':
          e.preventDefault()
          formatCode()
          break
        case 's':
          e.preventDefault()
          handleSave()
          break
        default:
          break
      }
    }
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      
      // Insert tab character
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      setFormData(prev => ({ ...prev, content: newValue }))
      
      // Move cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8">
        <Container>
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-40" rounded="rounded-xl" />
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-xl space-y-6">
              <Skeleton className="h-11 w-full" rounded="rounded-xl" />
              <Skeleton className="h-11 w-full" rounded="rounded-xl" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[420px] w-full" rounded="rounded-2xl" />
                <Skeleton className="h-[420px] w-full" rounded="rounded-2xl" />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Skeleton className="h-10 w-32" rounded="rounded-xl" />
                <Skeleton className="h-10 w-32" rounded="rounded-xl" />
                <Skeleton className="h-10 w-32" rounded="rounded-xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Note Not Found</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error || 'The note you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Button onClick={() => navigate('/my-notes')} className="bg-primary-600 hover:bg-primary-700 text-white">
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <button
              onClick={() => navigate(`/note/${noteId}`)}
              className="group text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 mb-6 inline-flex items-center transition-all duration-200 hover:translate-x-1 bg-surface-200/60 dark:bg-surface-800/50 hover:bg-surface-300/60 dark:hover:bg-surface-800/70 px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-700 hover:border-primary-500/30 backdrop-blur-sm"
            >
              <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Note
            </button>
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-surface-900 dark:from-surface-50 to-primary-700 dark:to-primary-300 bg-clip-text text-transparent">Edit Note</h1>
            </div>
            <p className="text-surface-600 dark:text-surface-400 ml-6">Craft your ideas with our powerful markdown editor</p>
          </div>

          <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-600/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Title
                  </span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging title for your note..."
                  className="bg-surface-100 dark:bg-surface-900/40 border-surface-300 dark:border-surface-700 placeholder-surface-500 dark:placeholder-surface-400 backdrop-blur-sm focus:bg-white/80 dark:focus:bg-surface-900/60 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-300 text-lg font-medium text-surface-900 dark:text-surface-50"
                />
              </div>
            </div>

            <div className="relative z-10">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add a brief description to help readers understand your note..."
                className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-900/40 border border-surface-300 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-50 placeholder-surface-500 dark:placeholder-surface-400 focus:border-primary-500 dark:focus:border-primary-400 focus:bg-white/80 dark:focus:bg-surface-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500/25 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-surface-900/55 transition-all duration-300 resize-none"
              />
            </div>

            <div className="relative z-10">
              <div className="bg-surface-100 dark:bg-surface-900/30 backdrop-blur-sm rounded-xl p-6 border border-surface-300 dark:border-surface-700">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Visibility
                    </label>
                    <p className="text-xs text-surface-500 dark:text-surface-400 ml-6">Choose who can see this note</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.isPublic}
                        onChange={() => handleVisibilityChange(true)}
                        className="mr-3 w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-surface-50 transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-1 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Public
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.isPublic}
                        onChange={() => handleVisibilityChange(false)}
                        className="mr-3 w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-surface-50 transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-1 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="bg-surface-100 dark:bg-surface-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-surface-300 dark:border-surface-700 shadow-lg dark:shadow-2xl">
                <div className="border-b border-surface-300 dark:border-surface-700 bg-white/60 dark:bg-surface-900/30">
                  <div className="flex items-center justify-between p-6">
                    <h3 className="text-lg font-bold text-surface-800 dark:text-surface-200 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Markdown Editor
                    </h3>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={handleMaximizeEditor}
                          className={`group px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                            editorMaximized
                              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                              : 'text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-50 bg-surface-200/60 dark:bg-surface-900/30 hover:bg-surface-300/60 dark:hover:bg-surface-900/50 border border-surface-300/60 dark:border-surface-700 hover:border-primary-500/30'
                          }`}
                          title="Maximize Editor"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{editorMaximized ? 'Restore' : 'Edit Mode'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleMaximizePreview}
                          className={`group px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                            previewMaximized
                              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                              : 'text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-50 bg-surface-200/60 dark:bg-surface-900/30 hover:bg-surface-300/60 dark:hover:bg-surface-900/50 border border-surface-300/60 dark:border-surface-700 hover:border-primary-500/30'
                          }`}
                          title="Maximize Preview"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{previewMaximized ? 'Restore' : 'Preview'}</span>
                        </button>
                      </div>
                      <div className="hidden sm:flex items-center text-xs text-surface-600 dark:text-surface-400 bg-surface-200/50 dark:bg-surface-900/40 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-700">
                        <svg className="w-4 h-4 mr-2 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                        <span>Keyboard shortcuts: Ctrl+B/I, Ctrl+Z/Y (native undo/redo), Ctrl+S to save</span>
                      </div>
                    </div>
                </div>
                
                  {!previewMaximized && (
                    <div className="bg-surface-200/60 dark:bg-surface-900/30 backdrop-blur-sm border-b border-surface-300 dark:border-surface-700">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-1 flex-wrap">
                          <div className="flex items-center space-x-1 mr-4">
                            <button
                              type="button"
                              onClick={handleUndo}
                              disabled={!canUndo}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              title="Undo Formatting"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={handleRedo}
                              disabled={!canRedo}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              title="Redo Formatting"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="w-px h-8 bg-gradient-to-b from-transparent via-surface-400/60 dark:via-surface-600/40 to-transparent mx-3"></div>
                          
                          <div className="flex items-center space-x-1 mr-4">
                            <button
                              type="button"
                              onClick={formatBold}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Bold (Ctrl+B)"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={formatItalic}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Italic (Ctrl+I)"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:skew-x-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={formatCode}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Inline Code"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={formatCodeBlock}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Code Block"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="w-px h-8 bg-gradient-to-b from-transparent via-surface-400/60 dark:via-surface-600/40 to-transparent mx-3"></div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => formatHeading(1)}
                              className="group px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30 text-xs font-bold"
                              title="Heading 1"
                            >
                              H1
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading(2)}
                              className="group px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30 text-xs font-bold"
                              title="Heading 2"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading(3)}
                              className="group px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30 text-xs font-bold"
                              title="Heading 3"
                            >
                              H3
                            </button>
                          </div>
                          
                          <div className="w-px h-8 bg-gradient-to-b from-transparent via-surface-400/60 dark:via-surface-600/40 to-transparent mx-3"></div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={formatList}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Bullet List"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={formatNumberedList}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Numbered List"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={formatQuote}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Quote"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={formatLink}
                              className="group p-2.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-primary-600/10 rounded-lg transition-all duration-200 transform hover:scale-110 border border-transparent hover:border-primary-500/30"
                              title="Link"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="hidden lg:block">
                          <div className="text-xs text-surface-600 dark:text-surface-400 bg-surface-200/50 dark:bg-surface-900/40 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-700">
                            <span className="text-primary-700 dark:text-primary-300 font-medium">Pro tip:</span> Use Markdown shortcuts for faster editing
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              </div>
              
              <div id="editor-container" className="flex h-[500px] relative">
                {!previewMaximized && (
                  <div 
                    className="overflow-hidden"
                    style={{ 
                      width: editorMaximized ? '100%' : `${splitPosition}%`,
                      borderRight: !editorMaximized ? `1px solid rgba(${isDark ? '107 114 128' : '209 213 219'})` : 'none'
                    }}
                  >
                    <textarea
                      id="content-editor"
                      value={formData.content}
                      onChange={handleContentChange}
                      onKeyDown={handleKeyDown}
                      onScroll={handleEditorScroll}
                      placeholder="Write your note content in markdown...&#10;&#10;Keyboard shortcuts:&#10;• Ctrl/Cmd + B: Bold&#10;• Ctrl/Cmd + I: Italic&#10;• Ctrl/Cmd + `: Code&#10;• Ctrl/Cmd + S: Save&#10;• Tab: Indent"
                      className="w-full h-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm leading-relaxed border-0 block overflow-auto bg-white/80 dark:bg-surface-900 text-surface-900 dark:text-surface-50"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                        minHeight: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                )}
                
                {!editorMaximized && !previewMaximized && (
                  <div
                    className="absolute top-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center group transition-all duration-200 hover:bg-primary-600/10 z-20"
                    onMouseDown={handleMouseDown}
                    style={{ 
                      left: `${splitPosition}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="w-1 h-12 bg-gradient-to-b from-surface-400 dark:from-surface-500 to-surface-500 dark:to-surface-600 group-hover:from-primary-400 group-hover:to-primary-600 rounded-full transition-all duration-200 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                      <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent rounded-full"></div>
                    </div>
                    {isResizing && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-surface-900 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap pointer-events-none shadow-xl border border-surface-700 backdrop-blur-sm">
                        <div className="text-primary-300">{Math.round(splitPosition)}%</div>
                        <div className="text-surface-300 text-xs">|</div>
                        <div className="text-primary-300">{Math.round(100 - splitPosition)}%</div>
                      </div>
                    )}
                  </div>
                )}
                
                {!editorMaximized && (
                  <div 
                    id="preview-container"
                    className="bg-surface-50 dark:bg-surface-900 overflow-auto h-full"
                    style={{ 
                      width: previewMaximized ? '100%' : `${100 - splitPosition}%`
                    }}
                    onScroll={handlePreviewScroll}
                  >
                    <div className="bg-white/90 dark:bg-surface-900/60 backdrop-blur-md rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden m-4">
                      <div className="px-6 sm:px-8 py-6 sm:py-8">
                        <div className="prose prose-gray dark:prose-invert max-w-none prose-lg text-left">
                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm, 
                            remarkBreaks,
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
                                className="border-l-4 border-primary-600 pl-6 py-2 my-6 bg-primary-500/10 rounded-r-lg text-surface-700 dark:text-surface-300 italic text-left" 
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
                              
                              // Only render as code block if there's a valid language specification
                              if (!inline && language && className?.includes('language-') && language !== 'text' && language !== 'plain') {
                                return (
                                  <div className="relative my-6 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between bg-white/70 dark:bg-surface-900/40 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1.5">
                                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider px-2 py-1 bg-white/80 dark:bg-surface-900/40 rounded-md border border-surface-200 dark:border-surface-700">
                                          {language || 'code'}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => handleCopyCode(codeContent, blockId)}
                                        className={`group relative px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                          copiedCodeId === blockId 
                                            ? 'text-white bg-brand-green border-brand-green shadow-lg shadow-brand-green/25 animate-pulse'
                                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 bg-white/80 dark:bg-surface-900/40 hover:bg-white dark:hover:bg-surface-900/60 border-surface-200 dark:border-surface-700 hover:shadow-md'
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
                                      className="!m-0 !bg-transparent overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
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
                              } else if (!inline) {
                                // Render code blocks without language specification as regular text
                                return (
                                  <p className="my-4 text-surface-900 dark:text-surface-100 leading-relaxed whitespace-pre-wrap">
                                    {codeContent}
                                  </p>
                                )
                              } else if (inline || !codeContent.includes('\n')) {
                                // For inline code or code without newlines, render as inline
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
                            const content = formData.content || 'No content available'
                            const processedContent = preprocessMarkdown(typeof content === 'string' ? content : String(content || ''))
                            return processedContent || '*No content to preview*'
                          })()}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            <div className="flex space-x-6 pt-8 relative z-10">
              <Button
                onClick={handleCancel}
                className="flex-1 bg-surface-200/70 dark:bg-surface-800/60 hover:bg-surface-300/70 dark:hover:bg-surface-800/80 text-surface-900 dark:text-surface-50 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-surface-300/60 dark:border-surface-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-green hover:bg-brand-green/90 disabled:bg-surface-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-brand-green/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <Skeleton className="w-5 h-5" rounded="rounded-full" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default EditNote