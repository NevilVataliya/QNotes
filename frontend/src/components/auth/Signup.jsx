import {useState} from 'react'
import authService from '../../appwrite/auth'
import {Link, useNavigate} from 'react-router-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Logo from '../ui/Logo'
import {useForm} from 'react-hook-form'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const {register, handleSubmit} = useForm()

        const handleSignup = async (formData) => {
        setError("")
        try {
                        if (formData.password !== formData.confirmPassword) {
                                setError("Passwords do not match")
                                return
                        }

            // Prepare files
            const signupData = {
                                ...formData,
                                avatar: formData.avatar?.[0] || null,
                                coverImage: formData.coverImage?.[0] || null
            }
                        const accountResponse = await authService.createAccount(signupData)
                        if (accountResponse) {
                // After successful registration, redirect to email verification page
                                navigate("/email-verification", { state: { email: formData.email } })
            }
        } catch (error) {
            setError(error.message)
        }
    }

return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-900 transition-colors duration-200">
            <div className='mx-auto w-full max-w-lg bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-10 border border-surface-200/70 dark:border-surface-800/70 shadow-2xl transition-colors duration-200'>
                    <div className="mb-6 flex justify-center">
                            <Logo width="120px" />
                    </div>
                    <h2 className="text-center text-3xl font-bold leading-tight text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">Join QNotes</h2>
                    <p className="text-center text-surface-600 dark:text-surface-300 mb-8 transition-colors duration-200">Create your account and start organizing your thoughts</p>

                    {error && <p className="text-red-600 dark:text-red-400 mt-4 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 p-3 rounded-lg transition-colors duration-200">{error}</p>}

                    <form
                            onSubmit={handleSubmit(handleSignup)}
                            className='space-y-6'
                    >
                            <Input
                                    label="Username"
                                    placeholder="Choose a username"
                                    {...register("username", {
                                            required: true,
                                    })}
                            />
                            <Input
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    {...register("fullname", {
                                            required: true,
                                    })}
                            />
                            <Input
                                    label="Email"
                                    placeholder="Enter your email"
                                    type="email"
                                    {...register("email", {
                                            required: true,
                                            validate: {
                                                    matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                                    "Email address must be a valid address",
                                            }
                                    })}
                            />
                            <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Create a password"
                                    {...register("password", {
                                            required: true,
                                    })}
                            />
                            <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...register("confirmPassword", {
                                            required: true,
                                    })}
                            />

                            <div className="space-y-4">
                                    <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2 transition-colors duration-200">Avatar Image (Optional)</label>
                                            <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full text-sm text-surface-700 dark:text-surface-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700 transition-colors duration-200"
                                                    {...register("avatar")}
                                            />
                                    </div>
                                    <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2 transition-colors duration-200">Cover Image (Optional)</label>
                                            <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full text-sm text-surface-700 dark:text-surface-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700 transition-colors duration-200"
                                                    {...register("coverImage")}
                                            />
                                    </div>
                            </div>

                            <Button type="submit" className="w-full py-3 shadow-sm transition-colors duration-200">
                                    Create Account
                            </Button>
                    </form>

                    <div className="mt-6 text-center">
                            <p className="text-sm text-surface-600 dark:text-surface-300 mb-4 transition-colors duration-200">
                                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                                    Email verification will be required to activate your account.
                            </p>
                            <p className="text-surface-600 dark:text-surface-300 transition-colors duration-200">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200">
                                            Sign in
                                    </Link>
                            </p>
                    </div>
            </div>
        </div>
    )
}

export default Signup