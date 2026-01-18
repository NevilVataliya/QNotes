import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Logo } from '../../components'
import authService from '../../appwrite/auth'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: OTP and new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [timeLeft, setTimeLeft] = useState(900)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const raw = params.get('token')
    return raw ? raw.trim() : ''
  }, [location.search])

  const isTokenFlow = Boolean(token)

  useEffect(() => {
    if (isTokenFlow) {
      setStep(2)
    }
  }, [isTokenFlow])

  useEffect(() => {
    if (isTokenFlow) return

    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === 2) {
      setCanResend(true)
    }
  }, [timeLeft, step, isTokenFlow])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEmailSubmit = async () => {
    if (!email) return

    setIsLoading(true)
    setError('')

    try {
      await authService.initiateForgotPassword(email)
      setStep(2)
      setTimeLeft(900)
      setCanResend(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (isTokenFlow) {
      if (!(newPassword === confirmPassword && newPassword.length >= 6)) return
    } else {
      if (!(otp.length === 6 && newPassword === confirmPassword && newPassword.length >= 6)) return
    }

    setIsLoading(true)
    setError('')

    try {
      if (isTokenFlow) {
        await authService.forgotPassword({ token, newPassword })
      } else {
        await authService.forgotPassword({ email, otp, newPassword })
      }
      navigate('/login')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email first.')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      await authService.initiateForgotPassword(email)
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
      <div className="max-w-md w-full bg-surface-800 rounded-2xl p-8 border border-surface-700 shadow-sm">
        <div className="text-center mb-8">
          <Logo width="120px" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-surface-50 mb-2">
            {step === 1 ? 'Reset Your Password' : (isTokenFlow ? 'Set New Password' : 'Enter Verification Code')}
          </h2>
          <p className="text-surface-300">
            {step === 1
              ? 'Enter your email address and we\'ll send you a verification code.'
              : (isTokenFlow
                ? 'You opened a password reset link. Set a new password below.'
                : 'We\'ve sent a 6-digit code to your email. Enter it below along with your new password.')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red/20 rounded-lg">
            <p className="text-brand-red text-sm">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-surface-900 focus:bg-surface-900 border-surface-700 placeholder-surface-500"
              disabled={isLoading}
            />

            <Button
              onClick={handleEmailSubmit}
              className="w-full py-3 disabled:opacity-50 transition-colors"
              disabled={!email || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {!isTokenFlow && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-mono bg-surface-900 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="bg-surface-900 focus:bg-surface-900 border-surface-700 placeholder-surface-500"
              disabled={isLoading}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="bg-surface-900 focus:bg-surface-900 border-surface-700 placeholder-surface-500"
              disabled={isLoading}
            />

            {!isTokenFlow && (
              <div className="text-center">
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                  Code expires in: <span className="text-primary-700 dark:text-primary-300 font-mono">{formatTime(timeLeft)}</span>
                </p>
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 text-sm underline disabled:opacity-50 transition-colors"
                  >
                    Resend verification code
                  </button>
                ) : (
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Resend available in {formatTime(timeLeft)}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handlePasswordReset}
              className="w-full py-3 transition-colors"
              bgColor={
                (isTokenFlow
                  ? (newPassword === confirmPassword && newPassword.length >= 6)
                  : (otp.length === 6 && newPassword === confirmPassword && newPassword.length >= 6)) && !isLoading
                  ? 'bg-primary-600 hover:bg-primary-700'
                  : 'bg-surface-200 dark:bg-surface-800 cursor-not-allowed'
              }
              textColor={
                (isTokenFlow
                  ? (newPassword === confirmPassword && newPassword.length >= 6)
                  : (otp.length === 6 && newPassword === confirmPassword && newPassword.length >= 6)) && !isLoading
                  ? 'text-white'
                  : 'text-surface-600 dark:text-surface-400'
              }
              disabled={
                (isTokenFlow
                  ? !(newPassword === confirmPassword && newPassword.length >= 6)
                  : !(otp.length === 6 && newPassword === confirmPassword && newPassword.length >= 6)) || isLoading
              }
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 text-sm transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
