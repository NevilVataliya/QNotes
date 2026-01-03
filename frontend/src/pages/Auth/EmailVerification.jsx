import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Logo } from '../../components'
import authService from '../../appwrite/auth'
import { useDispatch } from 'react-redux'
import { login } from '../../store/authSlice'

function EmailVerification() {
  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const email = location.state?.email || ''

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerify = async () => {
    if (otp.length !== 6) return

    setIsLoading(true)
    setError('')

    try {
      const result = await authService.verifyEmail({ email, otp })
      if (result) {
        // After successful verification, try to get current user
        // The backend should have set httpOnly cookies during verification
        try {
          const userData = await authService.getCurrentUser()
          if (userData) {
            dispatch(login({ userData }))
            navigate('/')
          } else {
            // If getCurrentUser fails but verification succeeded, 
            // redirect to login to complete authentication
            setError('Email verified! Please log in with your credentials.')
            setTimeout(() => {
              navigate('/login', { state: { email } })
            }, 2000)
          }
        } catch (userError) {
          // If we can't get user but verification succeeded,
          // redirect to login
          setError('Email verified! Please log in with your credentials.')
          setTimeout(() => {
            navigate('/login', { state: { email } })
          }, 2000)
        }
      }
    } catch (error) {
      setError(error.message || 'Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError('')

    try {
      await authService.resendVerificationEmail({ email })
      setTimeLeft(900)
      setCanResend(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 text-surface-50 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-surface-800 rounded-2xl p-8 border border-surface-700 shadow-sm transition-colors duration-200">
        <div className="text-center mb-8">
          <Logo width="120px" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-surface-50 mb-2 transition-colors duration-200">Verify Your Email</h2>
          <p className="text-surface-300 transition-colors duration-200">
            We&apos;ve sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red/20 rounded-lg transition-colors duration-200">
            <p className="text-brand-red text-sm transition-colors duration-200">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2 text-center transition-colors duration-200">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-2xl font-mono bg-surface-900 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 placeholder-surface-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-surface-400 mb-2 transition-colors duration-200">
              Code expires in: <span className="text-primary-300 font-mono">{formatTime(timeLeft)}</span>
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-primary-300 hover:text-primary-200 text-sm underline disabled:opacity-50 transition-colors duration-200"
              >
                Resend verification code
              </button>
            ) : (
              <p className="text-sm text-surface-500 transition-colors duration-200">
                Resend available in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isLoading}
            className="w-full py-3 transition-colors duration-200"
            bgColor={otp.length === 6 && !isLoading ? 'bg-primary-600 hover:bg-primary-700' : 'bg-surface-200 dark:bg-surface-800 cursor-not-allowed'}
            textColor={otp.length === 6 && !isLoading ? 'text-white' : 'text-surface-600 dark:text-surface-400'}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-surface-400 transition-colors duration-200">
            Wrong email?{' '}
            <Link to="/signup" className="text-primary-300 hover:text-primary-200 transition-colors duration-200">
              Sign up again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
