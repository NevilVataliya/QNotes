import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function formatShortDate(dateString) {
    if (!dateString) return null
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function NoteCard({
    $id,
    _id,
    title,
    description,
    excerpt,
    summary,
    createdAt,
    $createdAt,
    created_at,
    isPublic,
    tags,
    totalClaps,
    claps,
    author,
    username,
    fullname,
    name,
    avatar,
}) {
    const noteId = $id || _id
    const notePath = noteId ? `/note/${noteId}` : '/'

    const authorUsername = author?.username || username
    const authorName = author?.fullname || author?.name || fullname || name || authorUsername
    const authorAvatar = author?.avatar || avatar
    const authorVerified = Boolean(author?.isVerified)

    const dateLabel = formatShortDate(createdAt || $createdAt || created_at)
    const noteDescription = description || excerpt || summary
    const clapCount = totalClaps ?? claps
    const noteTags = Array.isArray(tags) ? tags : []
    const showAuthor = Boolean(authorUsername || authorName || authorAvatar)

    return (
        <Link
            to={notePath}
            className="block group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-50 dark:focus-visible:ring-offset-surface-900"
        >
            <div className="w-full bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-surface-200/70 dark:border-surface-700/70 hover:border-surface-300/70 dark:hover:border-surface-600/70 shadow-sm hover:shadow-lg transition-[transform,box-shadow,background-color,border-color] duration-200 hover:-translate-y-0.5">
                {(showAuthor || dateLabel || typeof isPublic === 'boolean') && (
                    <div className="flex items-start justify-between gap-3 mb-4">
                        {showAuthor ? (
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden">
                                    {authorAvatar ? (
                                        <img src={authorAvatar} alt={authorName || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white">{(authorName || 'U').charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <p className="font-medium text-sm sm:text-base truncate text-surface-900 dark:text-surface-50">{authorName || 'Anonymous'}</p>
                                        {authorVerified && (
                                            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    {authorUsername && <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 truncate">@{authorUsername}</p>}
                                </div>
                            </div>
                        ) : (
                            <div />
                        )}

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {dateLabel && <span className="text-xs sm:text-sm text-surface-600 dark:text-surface-300">{dateLabel}</span>}
                            {typeof isPublic === 'boolean' && (
                                <span
                                    className={
                                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors " +
                                        (isPublic
                                            ? 'bg-primary-600/10 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 border-primary-600/25'
                                            : 'bg-surface-200/70 dark:bg-surface-900/40 text-surface-700 dark:text-surface-200 border-surface-300/70 dark:border-surface-700/70')
                                    }
                                >
                                    {isPublic ? 'Public' : 'Private'}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="w-full h-28 sm:h-32 bg-surface-100 dark:bg-surface-900/40 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700 mb-4 group-hover:border-primary-300 dark:group-hover:border-primary-600 transition-colors duration-200">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                    </svg>
                </div>

                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-surface-900 dark:text-surface-50 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-200 line-clamp-2">
                    {title || 'Untitled'}
                </h2>

                {noteDescription && (
                    <p className="text-surface-700 dark:text-surface-200 mb-4 text-sm sm:text-base line-clamp-3 transition-colors duration-200">
                        {noteDescription}
                    </p>
                )}

                {(typeof clapCount === 'number' || noteTags.length > 0) && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center flex-wrap gap-3">
                            {typeof clapCount === 'number' && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                                        />
                                    </svg>
                                    <span className="text-xs sm:text-sm text-surface-700 dark:text-surface-200">{clapCount} claps</span>
                                </div>
                            )}

                            {noteTags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {noteTags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-surface-200/70 dark:bg-surface-900/40 text-surface-700 dark:text-surface-200 px-2 py-1 rounded text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                            <span className="text-xs sm:text-sm">Open</span>
                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    )
}

NoteCard.propTypes = {
    $id: PropTypes.string,
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    excerpt: PropTypes.string,
    summary: PropTypes.string,
    createdAt: PropTypes.string,
    $createdAt: PropTypes.string,
    created_at: PropTypes.string,
    isPublic: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    totalClaps: PropTypes.number,
    claps: PropTypes.number,
    author: PropTypes.shape({
        username: PropTypes.string,
        fullname: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
        isVerified: PropTypes.bool,
    }),
    username: PropTypes.string,
    fullname: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
}

export default NoteCard