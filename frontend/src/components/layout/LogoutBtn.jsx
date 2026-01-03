import {useDispatch} from 'react-redux'
import authService from '../../appwrite/auth'
import {logout} from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const handleLogout = () => {
        authService.logout().then(() => {
            dispatch(logout())
        })
    }
  return (
    <button
    className='inline-block px-6 py-2 duration-200 hover:bg-primary-50 rounded-full text-primary-700 hover:text-primary-900 transition-colors'
    onClick={handleLogout}
    >Logout</button>
  )
}

export default LogoutBtn