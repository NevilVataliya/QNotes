import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { AuthLayout } from './components/index.js'
import Signup from './pages/Auth/Signup.jsx'
import Login from './pages/Auth/Login.jsx'
import EmailVerification from './pages/Auth/EmailVerification'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ChangePassword from './pages/Auth/ChangePassword'
import UserProfile from './pages/Profile/UserProfile'
import EditProfile from './pages/Profile/EditProfile'
import Settings from './pages/Profile/Settings'
import UserPublicProfile from './pages/Profile/UserPublicProfile'
import CreateNote from './pages/Notes/CreateNote.jsx'
import NoteView from './pages/Notes/NoteView.jsx'
import NotesList from './pages/Notes/NotesList.jsx'
import EditNote from './pages/Notes/EditNote.jsx'
import NoteVersions from './pages/Notes/NoteVersions.jsx'
import Playlists from './pages/Playlist/Playlists'
import PlaylistDetail from './pages/Playlist/PlaylistDetail'
import PublicNotesFeed from './pages/PublicNotesFeed'
import Features from './pages/Static/Features'
import About from './pages/Static/About'
import Contact from './pages/Static/Contact'
import WatchHistory from './pages/WatchHistory'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/login",
            element: (
                <AuthLayout authentication={false}>
                    <Login />
                </AuthLayout>
            ),
        },
        {
            path: "/signup",
            element: (
                <AuthLayout authentication={false}>
                    <Signup />
                </AuthLayout>
            ),
        },
        {
            path: "/email-verification",
            element: (
                <AuthLayout authentication={false}>
                    <EmailVerification />
                </AuthLayout>
            ),
        },
        {
            path: "/forgot-password",
            element: (
                <AuthLayout authentication={false}>
                    <ForgotPassword />
                </AuthLayout>
            ),
        },
        {
            path: "/profile",
            element: (
                <AuthLayout authentication>
                    <UserProfile />
                </AuthLayout>
            ),
        },
        {
            path: "/edit-profile",
            element: (
                <AuthLayout authentication>
                    <EditProfile />
                </AuthLayout>
            ),
        },
        {
            path: "/change-password",
            element: (
                <AuthLayout authentication>
                    <ChangePassword />
                </AuthLayout>
            ),
        },
        {
            path: "/my-notes",
            element: (
                <AuthLayout authentication>
                    <NotesList />
                </AuthLayout>
            ),
        },
        {
            path: "/create-note",
            element: (
                <AuthLayout authentication>
                    <CreateNote />
                </AuthLayout>
            ),
        },
        {
            path: "/edit-note/:slug",
            element: (
                <AuthLayout authentication>
                    <EditNote />
                </AuthLayout>
            ),
        },
        {
            path: "/note/:slug",
            element: (
                    <NoteView />
            ),
        },
        {
            path: "/features",
            element: <Features />,
        },
        {
            path: "/discover",
            element: <PublicNotesFeed />,
        },
        {
            path: "/about",
            element: <About />,
        },
        {
            path: "/contact",
            element: <Contact />,
        },
        {
            path: "/user/:username",
            element: <UserPublicProfile />,
        },
        {
            path: "/history",
            element: (
                <AuthLayout authentication>
                    <WatchHistory />
                </AuthLayout>
            ),
        },
        {
            path: "/settings",
            element: (
                <AuthLayout authentication>
                    <Settings />
                </AuthLayout>
            ),
        },
        {
            path: "/playlists",
            element: (
                <AuthLayout authentication>
                    <Playlists />
                </AuthLayout>
            ),
        },
        {
            path: "/playlist/:playlistId",
            element: (
                    <PlaylistDetail />
            ),
        },
        {
            path: "/note-versions/:slug",
            element: (
                <AuthLayout authentication>
                    <NoteVersions />
                </AuthLayout>
            ),
        },
    ],
},
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)
