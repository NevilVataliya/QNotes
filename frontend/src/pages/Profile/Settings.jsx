import React, { useState, useEffect } from 'react'
import { Container, Button, Input, Skeleton } from '../../components'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { updateUser } from '../../store/authSlice'
import authService from '../../appwrite/auth'
import { 
  FaUser, 
  FaKey, 
  FaImage, 
  FaCamera,
  FaTrash,
  FaSave 
} from 'react-icons/fa'

function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null)
  const [pendingCoverFile, setPendingCoverFile] = useState(null)

  const user = useSelector((state) => state.auth.userData)
  const dispatch = useDispatch()

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile }
  } = useForm({
    defaultValues: {
      fullname: user?.fullname || ''
    }
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword }
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const clearMessages = () => {
    setSuccess('')
    setError('')
  }

  // Cleanup URL objects to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }
    }
  }, [avatarPreview, coverPreview])

  const handleProfileUpdate = async (data) => {
    try {
      clearMessages()
      const updatedUser = await authService.updateAccount({ fullname: data.fullname })
      dispatch(updateUser(updatedUser))
      setSuccess('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error.message || 'Failed to update profile')
    }
  }

  const handlePasswordChange = async (data) => {
    try {
      clearMessages()
      
      if (data.newPassword !== data.confirmPassword) {
        setError('New password and confirm password do not match')
        return
      }

      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      })
      
      resetPassword()
      setSuccess('Password changed successfully!')
    } catch (error) {
      console.error('Password change error:', error)
      setError(error.message || 'Failed to change password')
    }
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    clearMessages()
    
    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setPendingAvatarFile(file)
  }

  const handleAvatarUpdate = async () => {
    if (!pendingAvatarFile) return

    try {
      clearMessages()
      const updatedUser = await authService.updateAvatar(pendingAvatarFile)
      dispatch(updateUser(updatedUser))
      setAvatarPreview(null)
      setPendingAvatarFile(null)
      setSuccess('Avatar updated successfully!')
    } catch (error) {
      console.error('Avatar upload error:', error)
      setError(error.message || 'Failed to upload avatar')
    }
  }

  const handleCoverUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    clearMessages()
    
    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setCoverPreview(previewUrl)
    setPendingCoverFile(file)
  }

  const handleCoverUpdate = async () => {
    if (!pendingCoverFile) return

    try {
      clearMessages()
      const updatedUser = await authService.updateCoverImage(pendingCoverFile)
      dispatch(updateUser(updatedUser))
      setCoverPreview(null)
      setPendingCoverFile(null)
      setSuccess('Cover image updated successfully!')
    } catch (error) {
      console.error('Cover upload error:', error)
      setError(error.message || 'Failed to upload cover image')
    }
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your avatar?')) return

    try {
      clearMessages()
      await authService.removeAvatar()
      dispatch(updateUser({ ...user, avatar: null }))
      setAvatarPreview(null)
      setSuccess('Avatar removed successfully!')
    } catch (error) {
      console.error('Remove avatar error:', error)
      setError(error.message || 'Failed to remove avatar')
    }
  }

  const handleRemoveCover = async () => {
    if (!window.confirm('Are you sure you want to remove your cover image?')) return

    try {
      clearMessages()
      await authService.removeCoverImage()
      dispatch(updateUser({ ...user, coverImage: null }))
      setCoverPreview(null)
      setSuccess('Cover image removed successfully!')
    } catch (error) {
      console.error('Remove cover error:', error)
      setError(error.message || 'Failed to remove cover image')
    }
  }

  const sidebarItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: FaUser,
      description: 'Update your personal information'
    },
    {
      id: 'password',
      label: 'Password',
      icon: FaKey,
      description: 'Change your password'
    },
    {
      id: 'images',
      label: 'Images',
      icon: FaImage,
      description: 'Manage your avatar and cover image'
    }
  ]

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 py-8 transition-colors duration-200">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-surface-900 dark:text-surface-50 mb-2 transition-colors duration-200">
              Settings
            </h1>
            <p className="text-surface-600 dark:text-surface-300 transition-colors duration-200">Manage your account and preferences</p>
          </div>
          {success && (
            <div className="mb-6 p-4 bg-brand-green/10 border border-brand-green/20 rounded-lg">
              <p className="text-brand-green flex items-center text-sm">
                <FaSave className="mr-2" size={14} />
                {success}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 rounded-lg">
              <p className="text-brand-red text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-700/70 p-6 sticky top-8 shadow-sm transition-colors duration-200">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id)
                          clearMessages()
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                          activeSection === item.id
                            ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20'
                            : 'text-surface-700 dark:text-surface-200 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-surface-100/70 dark:hover:bg-surface-800/60'
                        }`}
                      >
                        <Icon className="flex-shrink-0" size={16} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-md rounded-2xl border border-surface-200/70 dark:border-surface-700/70 shadow-sm transition-colors duration-200">

                {activeSection === 'profile' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">
                        Profile Information
                      </h2>
                      <p className="text-surface-600 dark:text-surface-300 text-sm transition-colors duration-200">Update your personal details</p>
                    </div>

                    <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-6">
                      <div>
                        <Input
                          label="Full Name"
                          placeholder="Enter your full name"
                          {...registerProfile('fullname', {
                            required: 'Full name is required',
                            minLength: {
                              value: 2,
                              message: 'Full name must be at least 2 characters'
                            }
                          })}
                          error={errorsProfile.fullname?.message}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmittingProfile}
                          className="px-6 py-2.5"
                        >
                          {isSubmittingProfile ? (
                            <div className="flex items-center">
                              <Skeleton className="h-4 w-4 mr-2" rounded="rounded-full" />
                              Updating...
                            </div>
                          ) : (
                            'Update Profile'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                {activeSection === 'password' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">
                        Change Password
                      </h2>
                      <p className="text-surface-600 dark:text-surface-300 text-sm transition-colors duration-200">Update your account password</p>
                    </div>

                    <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="space-y-6">
                      <div>
                        <Input
                          label="Current Password"
                          type="password"
                          placeholder="Enter your current password"
                          {...registerPassword('oldPassword', {
                            required: 'Current password is required'
                          })}
                          error={errorsPassword.oldPassword?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="New Password"
                          type="password"
                          placeholder="Enter your new password"
                          {...registerPassword('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            }
                          })}
                          error={errorsPassword.newPassword?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Confirm New Password"
                          type="password"
                          placeholder="Confirm your new password"
                          {...registerPassword('confirmPassword', {
                            required: 'Please confirm your new password'
                          })}
                          error={errorsPassword.confirmPassword?.message}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmittingPassword}
                          className="px-6 py-2.5"
                        >
                          {isSubmittingPassword ? (
                            <div className="flex items-center">
                              <Skeleton className="h-4 w-4 mr-2" rounded="rounded-full" />
                              Updating...
                            </div>
                          ) : (
                            'Change Password'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                {activeSection === 'images' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">
                        Profile Images
                      </h2>
                      <p className="text-surface-600 dark:text-surface-300 text-sm transition-colors duration-200">Manage your avatar and cover image</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/70 dark:border-surface-700/70 rounded-2xl p-6 transition-colors duration-200">
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">
                            Avatar
                          </h3>
                          <p className="text-surface-600 dark:text-surface-300 text-sm transition-colors duration-200">Your profile picture</p>
                        </div>

                        <div className="mb-6 flex justify-center">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-surface-200 dark:bg-surface-800 border-2 border-surface-300 dark:border-surface-700 overflow-hidden transition-colors duration-200">
                              {(avatarPreview || user?.avatar) ? (
                                <img
                                  src={avatarPreview || user.avatar}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaUser className="text-surface-500 dark:text-surface-400 text-xl" />
                                </div>
                              )}
                            </div>
                            {pendingAvatarFile && (
                              <div className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                •
                              </div>
                            )}
                          </div>
                        </div>

                        {pendingAvatarFile ? (
                          <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg text-center">
                            <div className="text-primary-700 dark:text-primary-300 font-medium text-sm transition-colors duration-200">New avatar selected</div>
                          </div>
                        ) : null}

                        <div className="space-y-3">
                          <label className="w-full flex items-center justify-center px-4 py-2 bg-white/80 dark:bg-surface-900/60 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg cursor-pointer transition-colors duration-200 text-sm font-medium text-surface-700 dark:text-surface-200">
                            <FaCamera className="mr-2" size={14} />
                            Choose Avatar
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          
                          {pendingAvatarFile && (
                            <div className="flex gap-2">
                              <Button
                                onClick={handleAvatarUpdate}
                                className="flex-1"
                              >
                                Update
                              </Button>
                              <Button
                                onClick={() => {
                                  setAvatarPreview(null)
                                  setPendingAvatarFile(null)
                                }}
                                bgColor='bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700'
                                textColor='text-surface-700 dark:text-surface-200'
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          
                          {(user?.avatar || avatarPreview) && !pendingAvatarFile && (
                            <Button
                              onClick={handleRemoveAvatar}
                              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Remove Avatar
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/70 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/70 dark:border-surface-700/70 rounded-2xl p-6 transition-colors duration-200">
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">
                            Cover Image
                          </h3>
                          <p className="text-surface-600 dark:text-surface-300 text-sm transition-colors duration-200">Banner for your profile</p>
                        </div>

                        <div className="mb-6">
                          <div className="relative">
                            <div className="w-full h-32 bg-surface-200 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg overflow-hidden transition-colors duration-200">
                              {(coverPreview || user?.coverImage) ? (
                                <img
                                  src={coverPreview || user.coverImage}
                                  alt="Cover"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <FaImage className="text-surface-500 dark:text-surface-400 text-2xl mx-auto mb-1 transition-colors duration-200" />
                                    <p className="text-surface-500 dark:text-surface-400 text-xs transition-colors duration-200">No cover image</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            {pendingCoverFile && (
                              <div className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                •
                              </div>
                            )}
                          </div>
                        </div>

                        {pendingCoverFile ? (
                          <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg text-center">
                            <div className="text-primary-700 dark:text-primary-300 font-medium text-sm transition-colors duration-200">New cover selected</div>
                          </div>
                        ) : null}

                        <div className="space-y-3">
                          <label className="w-full flex items-center justify-center px-4 py-2 bg-white/80 dark:bg-surface-900/60 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg cursor-pointer transition-colors duration-200 text-sm font-medium text-surface-700 dark:text-surface-200">
                            <FaCamera className="mr-2" size={14} />
                            Choose Cover
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="hidden"
                            />
                          </label>
                          
                          {pendingCoverFile && (
                            <div className="flex gap-2">
                              <Button
                                onClick={handleCoverUpdate}
                                className="flex-1"
                              >
                                Update
                              </Button>
                              <Button
                                onClick={() => {
                                  setCoverPreview(null)
                                  setPendingCoverFile(null)
                                }}
                                bgColor='bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700'
                                textColor='text-surface-700 dark:text-surface-200'
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          
                          {(user?.coverImage || coverPreview) && !pendingCoverFile && (
                            <Button
                              onClick={handleRemoveCover}
                              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Remove Cover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Settings
