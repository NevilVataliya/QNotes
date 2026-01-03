import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { login as authLogin } from '../../store/authSlice'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Logo from '../ui/Logo'
import {useDispatch} from "react-redux"
import authService from "../../appwrite/auth"
import {useForm} from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (formData) => {
        setError("")
        setLoading(true)
        try {
            // Determine if input is email or username
            const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
            const loginData = isEmail
                ? { email: formData.email, password: formData.password }
                : { username: formData.email, password: formData.password }

            const session = await authService.login(loginData)
            if (session && session.data) {
                // Try to get user data from login response first
                let userData = session.data.user || session.data.userData
                
                // If not available, try getCurrentUser
                if (!userData) {
                    userData = await authService.getCurrentUser()
                }
                
                if (userData) {
                    dispatch(authLogin({userData}))
                    navigate("/")
                } else {
                    // If we can't get user data, still navigate but show a warning
                    console.warn("Could not retrieve user data after login")
                    navigate("/")
                }
            } else {
                setError("Login failed: Invalid response from server");
            }
        } catch (error) {
            setError(JSON.stringify(error.message || 'Login failed'))
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className='flex items-center justify-center w-full min-h-screen bg-gradient-to-b from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-900 transition-colors duration-200'>
        <div className='mx-auto w-full max-w-lg bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-10 border border-surface-200/70 dark:border-surface-800/70 shadow-2xl transition-colors duration-200'>
            <div className="mb-6 flex justify-center">
                <Logo width="120px" />
            </div>
            <h2 className="text-center text-3xl font-bold leading-tight text-primary-900 dark:text-surface-50 mb-2 transition-colors duration-200">Welcome Back</h2>
            <p className="text-center text-surface-600 dark:text-surface-300 mb-8 transition-colors duration-200">Sign in to your QNotes account</p>

            {error && <p className="text-red-600 dark:text-red-400 mt-4 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 p-3 rounded-lg transition-colors duration-200">{error}</p>}

            <form onSubmit={handleSubmit(handleLogin)} className='space-y-6'>
                <Input
                    label="Email or Username"
                    placeholder="Enter your email or username"
                    type="text"
                    {...register("email", {
                        required: true,
                    })}
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password", {
                        required: true,
                    })}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2 accent-primary-500" />
                        <span className="text-sm text-surface-600 dark:text-surface-300 transition-colors duration-200">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full py-3 shadow-sm transition-colors duration-200"
                    disabled={loading}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-surface-600 dark:text-surface-300 transition-colors duration-200">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default Login