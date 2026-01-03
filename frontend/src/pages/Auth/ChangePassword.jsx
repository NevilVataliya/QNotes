import { useState } from 'react'
import { Container, Button, Input } from '../../components'
import { useNavigate } from 'react-router-dom'
import authService from '../../appwrite/auth'

function ChangePassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak' }
    if (password.length < 8) return { strength: 2, label: 'Fair' }
    if (password.length < 12) return { strength: 3, label: 'Good' }
    return { strength: 4, label: 'Strong' }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await authService.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } catch (error) {
      setErrors({ general: error.message || 'Failed to change password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-900 text-surface-50 flex items-center justify-center transition-colors duration-200">
        <div className="bg-surface-800 rounded-2xl p-8 border border-surface-700 shadow-sm text-center transition-colors duration-200">
          <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-surface-50 mb-2 transition-colors duration-200">Password Changed!</h2>
          <p className="text-surface-300 transition-colors duration-200">Your password has been successfully updated.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-900 text-surface-50 py-8 transition-colors duration-200">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700 shadow-sm transition-colors duration-200">
            <h1 className="text-2xl font-bold mb-6">Change Password</h1>

            {errors.general && (
              <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red px-4 py-3 rounded-lg mb-4 transition-colors duration-200">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                className="bg-surface-900 focus:bg-surface-900 border-surface-700 placeholder-surface-500"
                error={errors.currentPassword}
              />

              <div>
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className="bg-surface-900 focus:bg-surface-900 border-surface-700 placeholder-surface-500"
                  error={errors.newPassword}
                />
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-surface-200 dark:bg-surface-800 rounded-full h-2 transition-colors duration-200">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                            passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/4' :
                            passwordStrength.strength === 3 ? 'bg-blue-500 w-3/4' :
                            'bg-green-500 w-full'
                          }`}
                        ></div>
                      </div>
                      <span className={`text-sm ${
                        passwordStrength.strength === 1 ? 'text-red-600 dark:text-red-400' :
                        passwordStrength.strength === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                        passwordStrength.strength === 3 ? 'text-blue-600 dark:text-blue-400' :
                        'text-green-600 dark:text-green-400'
                      } transition-colors duration-200`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                className="bg-surface-900 focus:bg-surface-900 border-surface-700 placeholder-surface-500"
                error={errors.confirmPassword}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 transition-colors duration-200"
                  bgColor="bg-primary-600 hover:bg-primary-700"
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/profile')}
                className="text-primary-300 hover:text-primary-200 text-sm transition-colors duration-200"
              >
                ← Back to Profile
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ChangePassword
