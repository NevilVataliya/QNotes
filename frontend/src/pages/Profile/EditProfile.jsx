import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Container, Button, Input } from '../../components'
import { useNavigate } from 'react-router-dom'
import authService from '../../appwrite/auth'

function EditProfile() {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const [formData, setFormData] = useState({
    fullname: userData?.fullname || '',
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null)
  const [coverPreview, setCoverPreview] = useState(userData?.coverImage || null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
    const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Update fullname if changed
      if (formData.fullname !== userData?.fullname) {
        await authService.updateAccount({ fullname: formData.fullname })
      }

      // Update avatar if selected
      if (avatarFile) {
        await authService.updateAvatar(avatarFile)
      }

      // Update cover image if selected
      if (coverFile) {
        await authService.updateCoverImage(coverFile)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } catch (error) {
      console.error('Update failed:', error)
      setError(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/profile')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 flex items-center justify-center transition-colors duration-200">
        <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-8 border border-surface-200/70 dark:border-surface-700/70 text-center shadow-sm transition-colors duration-200">
          <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2 transition-colors duration-200">Profile Updated!</h2>
          <p className="text-surface-600 dark:text-surface-300 transition-colors duration-200">Your profile has been successfully updated.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8 transition-colors duration-200">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl p-6 border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

            {error && (
              <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/30 rounded-xl">
                <p className="text-brand-red">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl">
                <p className="text-brand-green">Profile updated successfully! Redirecting...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-surface-200 dark:bg-surface-700/70 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden text-surface-700 dark:text-surface-200">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{formData.fullname?.charAt(0)?.toUpperCase() || userData?.fullname?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors"
                    >
                      Change Avatar
                    </label>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Cover Image
                </label>
                <div className="space-y-3">
                  <div className="h-32 bg-surface-200 dark:bg-surface-800/60 rounded-xl overflow-hidden border border-surface-300 dark:border-surface-700">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-surface-900 via-primary-800 to-primary-600 flex items-center justify-center">
                        <span className="text-surface-300">Cover Image Preview</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors"
                    >
                      Change Cover
                    </label>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">JPG, PNG up to 10MB</p>
                  </div>
                </div>
              </div>

              <Input
                label="Full Name"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="bg-white/80 dark:bg-surface-800/60 border-surface-300 dark:border-surface-700"
              />

              <div className="bg-surface-100/70 dark:bg-surface-900/40 backdrop-blur-sm p-4 rounded-xl border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200">
                <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-2 transition-colors duration-200">Current Profile Information</h3>
                <div className="space-y-2 text-sm text-surface-600 dark:text-surface-400 transition-colors duration-200">
                  <p><strong>Username:</strong> {userData?.username}</p>
                  <p><strong>Email:</strong> {userData?.email}</p>
                  <p><strong>Email Verified:</strong> {userData?.isEmailVerified ? 'Yes' : 'No'}</p>
                </div>
                <p className="text-xs text-surface-500 mt-2">
                  Username and email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-surface-200 dark:bg-surface-800/60 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-brand-green hover:bg-brand-green/90 disabled:opacity-50 text-white"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default EditProfile
