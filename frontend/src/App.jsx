import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'
import Skeleton from './components/ui/Skeleton'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.settings?.settings?.theme || 'light')

  // Initialize theme on app load and apply to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [dispatch])
  
  return !loading ? (
    <div className='min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900 text-primary-900 dark:text-surface-50 transition-colors'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  ) : (
    <div className='min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900 text-primary-900 dark:text-surface-50 transition-colors'>
      <header className='border-b border-surface-200 dark:border-surface-700'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <Skeleton className='h-8 w-28' />
          <div className='flex items-center gap-3'>
            <Skeleton className='h-9 w-24' rounded='rounded-xl' />
            <Skeleton className='h-9 w-24' rounded='rounded-xl' />
          </div>
        </div>
      </header>
      <main className='flex-1'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6'>
          <Skeleton className='h-10 w-2/3' />
          <Skeleton className='h-5 w-1/2' />
          <div className='space-y-4'>
            <Skeleton className='h-24 w-full' rounded='rounded-2xl' />
            <Skeleton className='h-24 w-full' rounded='rounded-2xl' />
            <Skeleton className='h-24 w-full' rounded='rounded-2xl' />
          </div>
        </div>
      </main>
      <footer className='border-t border-surface-200 dark:border-surface-700'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6'>
          <Skeleton className='h-4 w-56' />
        </div>
      </footer>
    </div>
  )
}

export default App
