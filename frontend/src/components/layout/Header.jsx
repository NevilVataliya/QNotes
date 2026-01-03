import { useState, useRef, useEffect } from 'react'
import Container from './Container'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import { updateSetting } from '../../store/settingsSlice'
import authService from '../../appwrite/auth'
import { 
  FaPlus, 
  FaUser, 
  FaCog, 
  FaFileAlt, 
  FaSignOutAlt, 
  FaBars,
  FaMoon,
  FaSun
} from 'react-icons/fa'

function Header() {
  const isAuthenticated = useSelector((state) => state.auth.status)
  const user = useSelector((state) => state.auth.userData)
  const theme = useSelector((state) => state.settings.settings.theme)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Toggle theme
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    dispatch(updateSetting({ key: 'theme', value: newTheme }))
    
    // Update HTML element for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false)
      await authService.logout() // Call server logout to clear httpOnly cookies
      dispatch(logout()) // Update Redux state
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if server logout fails, clear local state
      dispatch(logout())
      navigate('/')
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const preLoginNavItems = [
    { name: 'Features', slug: "/features", active: true },
    { name: "About", slug: "/about", active: true },
    { name: "Discover", slug: "/discover", active: true },
    { name: "Contact", slug: "/contact", active: true },
  ]

  const postLoginNavItems = [
    { name: 'Discover', slug: "/", active: true },
    { name: "My Notes", slug: "/my-notes", active: isAuthenticated },
    { name: "Playlists", slug: "/playlists", active: isAuthenticated },
    { name: "History", slug: "/history", active: isAuthenticated },
  ]

  const navItems = isAuthenticated ? postLoginNavItems : preLoginNavItems

  return (
    <header className='py-3 shadow-sm bg-white/80 dark:bg-surface-900/80 text-primary-900 dark:text-surface-50 sticky top-0 z-50 border-b border-surface-200/70 dark:border-surface-800/70 backdrop-blur-md transition-colors duration-200'>
      <Container>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Link to='/'>
              <Logo width='70px' />
            </Link>
          </div>

          <ul className='hidden md:flex space-x-6'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='px-4 py-2 duration-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-700 dark:text-surface-200 hover:text-primary-900 dark:hover:text-surface-50 transition-colors'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
          </ul>

          <div className='flex items-center space-x-4'>
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate('/create-note')}
                  className='flex items-center gap-2 shadow-sm'
                >
                  <FaPlus className='w-4 h-4' />
                  <span>Create</span>
                </Button>
                <button
                  onClick={handleThemeToggle}
                  className='relative w-12 h-7 bg-surface-200 dark:bg-surface-800 rounded-full transition-colors duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-surface-900 focus:ring-offset-white'
                  aria-label="Toggle dark/light mode"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <div className={`absolute inset-0 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-surface-700' : 'bg-primary-200'}`}></div>
                  
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                    {theme === 'dark' ? (
                      <FaMoon className='w-3 h-3 text-surface-700' />
                    ) : (
                      <FaSun className='w-3 h-3 text-primary-700' />
                    )}
                  </div>
                </button>
                <div className='relative' ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className='w-8 h-8 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors'
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                        {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </button>
                  {isUserMenuOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white/95 dark:bg-surface-900/95 border border-surface-200/80 dark:border-surface-800/80 rounded-xl shadow-xl py-1 z-50 backdrop-blur-md'>
                      <div className='px-4 py-3 border-b border-surface-200 dark:border-surface-800'>
                        <p className='text-sm font-medium text-primary-900 dark:text-surface-50'>
                          {user?.fullname || 'User'}
                        </p>
                        <p className='text-xs text-surface-600 dark:text-surface-300'>
                          @{user?.username || 'username'}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className='block px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 transition-colors'
                      >
                        <div className='flex items-center space-x-2'>
                          <FaUser className='w-4 h-4 text-primary-600 dark:text-primary-400' />
                          <span>Profile</span>
                        </div>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className='block px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 transition-colors'
                      >
                        <div className='flex items-center space-x-2'>
                          <FaCog className='w-4 h-4 text-primary-600 dark:text-primary-400' />
                          <span>Settings</span>
                        </div>
                      </Link>

                      <Link
                        to="/my-notes"
                        onClick={() => setIsUserMenuOpen(false)}
                        className='block px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 transition-colors'
                      >
                        <div className='flex items-center space-x-2'>
                          <FaFileAlt className='w-4 h-4 text-primary-600 dark:text-primary-400' />
                          <span>My Notes</span>
                        </div>
                      </Link>

                      <div className='border-t border-surface-200 dark:border-surface-800 my-1'></div>

                      <button
                        onClick={handleLogout}
                        className='block w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-brand-red/10 transition-colors'
                      >
                        <div className='flex items-center space-x-2'>
                          <FaSignOutAlt className='w-4 h-4' />
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleThemeToggle}
                  className='relative w-12 h-7 bg-surface-200 dark:bg-surface-800 rounded-full transition-colors duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-surface-900 focus:ring-offset-white'
                  aria-label="Toggle dark/light mode"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <div className={`absolute inset-0 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-surface-700' : 'bg-primary-200'}`}></div>
                  
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                    {theme === 'dark' ? (
                      <FaMoon className='w-3 h-3 text-surface-700' />
                    ) : (
                      <FaSun className='w-3 h-3 text-primary-700' />
                    )}
                  </div>
                </button>

                <Button
                  onClick={() => navigate('/login')}
                  bgColor='bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700'
                  textColor='text-surface-700 dark:text-surface-200'
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors'
            >
              <FaBars className='w-6 h-6 text-surface-700 dark:text-surface-200' />
            </button>
          </div>
        </nav>
        {isMenuOpen && (
          <div className='md:hidden mt-4 pb-4 border-t border-surface-200 dark:border-surface-800 pt-4'>
            <ul className='space-y-2'>
              {navItems.map((item) =>
                item.active ? (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        navigate(item.slug)
                        setIsMenuOpen(false)
                      }}
                      className='block w-full text-left px-4 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 rounded-lg transition-colors'
                    >
                      {item.name}
                    </button>
                  </li>
                ) : null
              )}
              {isAuthenticated && (
                <>
                  <div className='border-t border-surface-200 dark:border-surface-800 my-2'></div>
                  <li>
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setIsMenuOpen(false)
                      }}
                      className='block w-full text-left px-4 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 rounded-lg transition-colors'
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setIsMenuOpen(false)
                      }}
                      className='block w-full text-left px-4 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 rounded-lg transition-colors'
                    >
                      Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleThemeToggle()
                      }}
                      className='w-full text-left px-4 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-900 dark:hover:text-surface-50 rounded-lg transition-colors flex items-center justify-between'
                    >
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      {theme === 'dark' ? (
                        <FaSun className='w-4 h-4 text-primary-600' />
                      ) : (
                        <FaMoon className='w-4 h-4 text-surface-600' />
                      )}
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className='block w-full text-left px-4 py-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors'
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </Container>
    </header>
  )
}

export default Header