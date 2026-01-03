import { useState, useRef } from 'react'
import { Container, Button, Input, Skeleton } from '../../components'
import { useNavigate } from 'react-router-dom'
import appwriteService from '../../appwrite/config'

function CreateNote() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Mode Selection, 2: Input, 3: Processing, 4: Success/Error
  const [selectedMode, setSelectedMode] = useState(null) // 'audio', 'text', 'file'
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [fileBlob, setFileBlob] = useState(null)
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [createdNote, setCreatedNote] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        setStep(3)
        setIsLoading(true)
        setError(null)

        try {
          // Call the backend API to process the audio and create the note
          const result = await appwriteService.createNote(blob)
          if (result) {
            setGeneratedTitle(result.title || 'Generated Note')
            const description = result.description || 'Note content processed successfully'
            setGeneratedContent(typeof description === 'string' ? description : JSON.stringify(description, null, 2))
            setCreatedNote(result)
            setStep(4)
          } else {
            throw new Error('Failed to create note')
          }
        } catch (error) {
          console.error('Error processing audio:', error)
          setError('Failed to process your audio and create the note. Please try again.')
          setStep(4)
        } finally {
          setIsLoading(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const handleAudioFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setAudioBlob(file)
      setStep(3)
      setIsLoading(true)
      setError(null)

      try {
        // Call the backend API to process the uploaded audio and create the note
        const result = await appwriteService.createNote(file)
        if (result) {
          setGeneratedTitle(result.title || 'Generated Note')
          const description = result.description || 'Note content processed successfully'
          setGeneratedContent(typeof description === 'string' ? description : JSON.stringify(description, null, 2))
          setCreatedNote(result)
          setStep(4)
        } else {
          throw new Error('Failed to create note')
        }
      } catch (error) {
        console.error('Error processing uploaded audio:', error)
        setError('Failed to process your uploaded audio and create the note. Please try again.')
        setStep(4)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      setError('Please enter some text content.')
      return
    }

    setStep(3)
    setIsLoading(true)
    setError(null)

    try {
      const result = await appwriteService.createNoteFromText(textContent, textTitle)
      if (result) {
        setGeneratedTitle(result.title || textTitle || 'Text Note')
        const description = result.description || textContent
        setGeneratedContent(typeof description === 'string' ? description : JSON.stringify(description, null, 2))
        setCreatedNote(result)
        setStep(4)
      } else {
        throw new Error('Failed to create note')
      }
    } catch (error) {
      console.error('Error processing text:', error)
      setError('Failed to process your text and create the note. Please try again.')
      setStep(4)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if it's a text file
      const allowedTypes = ['text/plain', 'application/pdf']
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf)$/i)) {
        setError('Please select a text file (txt, pdf).')
        return
      }

      setFileBlob(file)
      setStep(3)
      setIsLoading(true)
      setError(null)

      try {
        const result = await appwriteService.createNoteFromFile(file)
        if (result) {
          setGeneratedTitle(result.title || file.name || 'File Note')
          const description = result.description || 'File content processed successfully'
          setGeneratedContent(typeof description === 'string' ? description : JSON.stringify(description, null, 2))
          setCreatedNote(result)
          setStep(4)
        } else {
          throw new Error('Failed to create note')
        }
      } catch (error) {
        console.error('Error processing file:', error)
        setError('Failed to process your file and create the note. Please try again.')
        setStep(4)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTryAgain = () => {
    setStep(1)
    setSelectedMode(null)
    setAudioBlob(null)
    setTextContent('')
    setTextTitle('')
    setFileBlob(null)
    setGeneratedTitle('')
    setGeneratedContent('')
    setCreatedNote(null)
    setError(null)
    setIsLoading(false)
  }

  const selectMode = (mode) => {
    setSelectedMode(mode)
    setStep(2)
  }

  const goBackToModeSelection = () => {
    setStep(1)
    setSelectedMode(null)
    setAudioBlob(null)
    setTextContent('')
    setTextTitle('')
    setFileBlob(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50">
      <Container>
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-surface-900 dark:from-surface-50 to-primary-700 dark:to-primary-300 bg-clip-text text-transparent">
                Create New Note
              </h1>
              <p className="text-surface-600 dark:text-surface-400 text-lg">Transform your voice into organized notes with AI</p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-400'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-surface-900 dark:text-surface-50' : 'text-surface-600 dark:text-surface-400'}`}>
                  Choose Mode
                </span>
              </div>
              
              <div className={`w-12 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'}`}></div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 2 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-400'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-surface-900 dark:text-surface-50' : 'text-surface-600 dark:text-surface-400'}`}>
                  {selectedMode === 'audio' ? 'Record Audio' : selectedMode === 'text' ? 'Enter Text' : selectedMode === 'file' ? 'Upload File' : 'Input'}
                </span>
              </div>
              
              <div className={`w-12 h-0.5 transition-all duration-300 ${step >= 3 ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'}`}></div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 3 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-400'
                }`}>
                  {step > 3 ? '✓' : '3'}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-surface-900 dark:text-surface-50' : 'text-surface-600 dark:text-surface-400'}`}>
                  AI Processing
                </span>
              </div>
              
              <div className={`w-12 h-0.5 transition-all duration-300 ${step >= 4 ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'}`}></div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 4 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-400'
                }`}>
                  {step >= 4 ? '✓' : '4'}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= 4 ? 'text-surface-900 dark:text-surface-50' : 'text-surface-600 dark:text-surface-400'}`}>
                  Complete
                </span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-primary-500/10 dark:bg-primary-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/20">
                  <svg className="w-12 h-12 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-surface-900 dark:text-surface-50">Choose Your Input Method</h2>
                <p className="text-surface-600 dark:text-surface-400 text-lg">Select how you'd like to create your note</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div 
                  onClick={() => selectMode('audio')}
                  className="bg-surface-100 dark:bg-surface-900/40 hover:bg-surface-200 dark:hover:bg-surface-800/60 rounded-xl p-6 border border-surface-200 dark:border-surface-700 hover:border-primary-500 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary-600/10"
                >
                  <div className="w-16 h-16 bg-primary-500/10 dark:bg-primary-500/15 rounded-lg flex items-center justify-center mx-auto mb-4 border border-primary-500/20">
                    <svg className="w-8 h-8 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2 text-center">Voice Recording</h3>
                  <p className="text-surface-600 dark:text-surface-400 text-center text-sm">Record your voice or upload audio files for AI transcription</p>
                </div>

                <div 
                  onClick={() => selectMode('text')}
                  className="bg-surface-100 dark:bg-surface-900/40 hover:bg-surface-200 dark:hover:bg-surface-800/60 rounded-xl p-6 border border-surface-200 dark:border-surface-700 hover:border-brand-green cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brand-green/10"
                >
                  <div className="w-16 h-16 bg-brand-green/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-brand-green/20">
                    <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2 text-center">Text Input</h3>
                  <p className="text-surface-600 dark:text-surface-400 text-center text-sm">Type or paste your content directly for instant processing</p>
                </div>

                <div 
                  onClick={() => selectMode('file')}
                  className="bg-surface-100 dark:bg-surface-900/40 hover:bg-surface-200 dark:hover:bg-surface-800/60 rounded-xl p-6 border border-surface-200 dark:border-surface-700 hover:border-brand-orange cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brand-orange/10"
                >
                  <div className="w-16 h-16 bg-brand-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-brand-orange/20">
                    <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2 text-center">File Upload</h3>
                  <p className="text-surface-600 dark:text-surface-400 text-center text-sm">Upload text files (txt, pdf) for processing</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedMode === 'audio' && (
            <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-2xl">
              <div className="flex items-center mb-6">
                <Button
                  onClick={goBackToModeSelection}
                  className="mr-4 bg-surface-200 dark:bg-surface-900/40 hover:bg-surface-300 dark:hover:bg-surface-900/60 text-surface-900 dark:text-surface-50 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-surface-300 dark:border-surface-700 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                <div className="w-12 h-12 bg-primary-500/10 dark:bg-primary-500/15 rounded-lg flex items-center justify-center border border-primary-500/20">
                  <svg className="w-6 h-6 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50">Voice Recording</h3>
                  <p className="text-surface-600 dark:text-surface-400">Record your voice or upload an audio file</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex-1 ${
                    isRecording
                      ? 'bg-brand-red hover:bg-brand-red/90 shadow-lg shadow-brand-red/20 animate-pulse text-white'
                      : 'bg-brand-green hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="2"/>
                        <rect x="14" y="4" width="4" height="16" rx="2"/>
                      </svg>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Start Recording
                    </>
                  )}
                </Button>

                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl cursor-pointer inline-block text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary-600/20 w-full text-center"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Audio
                  </label>
                </div>
              </div>

              {isRecording && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center space-x-3 bg-brand-red/10 border border-brand-red/20 text-brand-red px-6 py-3 rounded-xl backdrop-blur-sm">
                    <div className="w-3 h-3 bg-brand-red rounded-full animate-pulse"></div>
                    <span className="font-medium">Recording in progress...</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-brand-red rounded-full animate-pulse"></div>
                      <div className="w-1 h-4 bg-brand-red rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-4 bg-brand-red rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedMode === 'text' && (
            <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-2xl">
              <div className="flex items-center mb-6">
                <Button
                  onClick={goBackToModeSelection}
                  className="mr-4 bg-surface-200 dark:bg-surface-900/40 hover:bg-surface-300 dark:hover:bg-surface-900/60 text-surface-900 dark:text-surface-50 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-surface-300 dark:border-surface-700 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center border border-brand-green/20">
                  <svg className="w-6 h-6 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50">Text Input</h3>
                  <p className="text-surface-600 dark:text-surface-400">Enter your content directly</p>
                </div>
              </div>

              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    placeholder="Type or paste your content here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    className="w-full bg-surface-100 dark:bg-surface-900/40 border border-surface-300 dark:border-surface-700 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-50 placeholder-surface-500 dark:placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none resize-vertical min-h-[200px] transition-all duration-300"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textContent.trim()}
                    className="bg-brand-green hover:bg-brand-green/90 disabled:bg-surface-300 dark:disabled:bg-surface-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-green/20 disabled:transform-none disabled:shadow-none"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Process Text
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedMode === 'file' && (
            <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-2xl">
              <div className="flex items-center mb-6">
                <Button
                  onClick={goBackToModeSelection}
                  className="mr-4 bg-surface-200 dark:bg-surface-900/40 hover:bg-surface-300 dark:hover:bg-surface-900/60 text-surface-900 dark:text-surface-50 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-surface-300 dark:border-surface-700 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center border border-brand-orange/20">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50">File Upload</h3>
                  <p className="text-surface-600 dark:text-surface-400">Upload a text file for processing</p>
                </div>
              </div>

              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <div className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-12 hover:border-primary-500 transition-all duration-300 bg-surface-100 dark:bg-surface-900/30 hover:bg-surface-200 dark:hover:bg-surface-900/45">
                    <svg className="w-16 h-16 text-brand-orange mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h4 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">Drop your file here</h4>
                    <p className="text-surface-600 dark:text-surface-400 mb-6">or click to browse</p>
                    
                    <input
                      type="file"
                      accept=".txt,.pdf,text/plain,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="text-file-upload"
                    />
                    <label
                      htmlFor="text-file-upload"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl cursor-pointer inline-block font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary-600/20"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choose File
                    </label>
                    
                    <p className="text-xs text-surface-500 dark:text-surface-500 mt-4">
                      Supported formats: TXT, PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-12 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-2xl text-center">
              <div className="w-32 h-32 bg-primary-500/10 dark:bg-primary-500/15 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
                <Skeleton className="w-16 h-16" rounded="rounded-full" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-surface-900 dark:from-surface-50 to-primary-700 dark:to-primary-300 bg-clip-text text-transparent">
                AI is working its magic
              </h2>
              <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg">
                {selectedMode === 'audio' && 'Transcribing your audio and generating a comprehensive note...'}
                {selectedMode === 'text' && 'Processing your text and generating insights...'}
                {selectedMode === 'file' && 'Reading your file and extracting key information...'}
              </p>
              
              <div className="w-full rounded-full h-3 mb-4 overflow-hidden">
                <Skeleton className="h-3 w-full" rounded="rounded-full" />
              </div>
              
              <div className="flex justify-center items-center space-x-2 text-sm text-surface-500 dark:text-surface-400">
                <Skeleton className="h-2 w-2" rounded="rounded-full" />
                <Skeleton className="h-2 w-2" rounded="rounded-full" />
                <Skeleton className="h-2 w-2" rounded="rounded-full" />
                <div className="ml-2">
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && !isLoading && (
            <div className="space-y-8">
              {error ? (
                <div className="bg-brand-red/10 backdrop-blur-xl rounded-2xl p-8 border border-brand-red/20 shadow-sm dark:shadow-2xl text-center">
                  <div className="w-24 h-24 bg-brand-red/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-red/25">
                    <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-brand-red mb-4">Oops! Something went wrong</h2>
                  <p className="text-surface-700 dark:text-surface-300 mb-8 text-lg">{error}</p>
                  <Button
                    onClick={handleTryAgain}
                    className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-red/20"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </Button>
                </div>
              ) : (
                /* Success State */
                <>
                  <div className="bg-brand-green/10 backdrop-blur-xl rounded-2xl p-8 border border-brand-green/20 shadow-sm dark:shadow-2xl text-center">
                    <div className="w-24 h-24 bg-brand-green/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-green/25">
                      <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-brand-green mb-4">Note Created Successfully!</h2>
                    <p className="text-surface-700 dark:text-surface-300 mb-6 text-lg">Your audio has been processed and your note is ready.</p>
                  </div>
                  <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-8 border border-surface-200 dark:border-surface-700 shadow-sm dark:shadow-2xl">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary-500/10 dark:bg-primary-500/15 rounded-lg flex items-center justify-center mr-4 border border-primary-500/20">
                        <svg className="w-6 h-6 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50">Your Generated Note</h3>
                        <p className="text-surface-600 dark:text-surface-400">AI-powered transcription and summarization</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Title
                      </h4>
                      <div className="bg-surface-100 dark:bg-surface-900/40 rounded-xl p-4 border border-surface-300 dark:border-surface-700">
                        <p className="text-surface-900 dark:text-surface-50 font-medium">{generatedTitle}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Content
                      </h4>
                      <div className="bg-surface-100 dark:bg-surface-900/40 rounded-xl p-4 border border-surface-300 dark:border-surface-700 max-h-80 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans text-surface-900 dark:text-surface-200 leading-relaxed">{generatedContent}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleTryAgain}
                      className="flex-1 bg-surface-200 dark:bg-surface-900/40 hover:bg-surface-300 dark:hover:bg-surface-900/60 text-surface-900 dark:text-surface-50 py-3 rounded-xl font-semibold transition-all duration-300 border border-surface-300 dark:border-surface-700 backdrop-blur-sm"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Another Note
                    </Button>
                    <Button
                      onClick={() => navigate('/my-notes')}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary-600/20"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View My Notes
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default CreateNote
