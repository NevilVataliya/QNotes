import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import PropTypes from 'prop-types'
import Skeleton from '../ui/Skeleton'

export default function AuthLayout({children, authentication = true}) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        if (authentication && !authStatus) {
            // User needs to be authenticated but is not logged in
            navigate("/login")
        } else if (!authentication && authStatus) {
            // User should not be authenticated but is logged in
            navigate("/")
        }
        // If authentication requirements are met, don't navigate
        setLoader(false)
    }, [authStatus, navigate, authentication])

    if (loader) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" rounded="rounded-full" />
                    <Skeleton className="h-4 w-24" rounded="rounded" />
                </div>
            </div>
        )
    }

    return <>{children}</>
}

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
    authentication: PropTypes.bool
}

