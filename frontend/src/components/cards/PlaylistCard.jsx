import { Link } from 'react-router-dom'

function PlaylistCard({ playlist, showOwner = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="relative group">
      <Link
        to={`/playlist/${playlist._id}`}
        className='block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-50 dark:focus-visible:ring-offset-surface-900'
      >
        <div className='w-full bg-surface-900/90 backdrop-blur-sm rounded-2xl p-6 hover:bg-surface-800/90 transition-[transform,box-shadow,background-color,border-color] duration-300 transform-gpu hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-2xl border border-surface-800/80 hover:border-surface-700/80'>
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              playlist.isPublic
                ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                : 'bg-surface-800 text-surface-300 border border-surface-700'
            }`}>
              {playlist.isPublic ? 'Public' : 'Private'}
            </span>
            <span className="text-xs text-surface-400 bg-surface-800 px-2 py-1 rounded-full">
              {formatDate(playlist.createdAt)}
            </span>
          </div>
          <div className='w-full h-32 bg-gradient-to-br from-primary-700 to-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:from-primary-700/40 group-hover:to-primary-600/30 transition-all duration-300'>
            <svg className="w-12 h-12 text-surface-100 group-hover:text-brand-green transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="space-y-3">
            <h2 className='text-xl font-bold text-surface-50 group-hover:text-brand-green transition-colors duration-300 line-clamp-2'>
              {playlist.name || 'Untitled Playlist'}
            </h2>
            {playlist.description && (
              <p className='text-surface-300 text-sm line-clamp-3 leading-relaxed'>
                {playlist.description}
              </p>
            )}
            {showOwner && playlist.owner && (
              <p className='text-surface-400 text-xs'>
                by {playlist.owner.username || playlist.owner.fullname || 'Unknown'}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-surface-400 bg-surface-800 px-2 py-1 rounded-full">
              {playlist.notes?.length || 0} notes
            </span>
            <svg className='w-5 h-5 text-surface-300 group-hover:text-brand-green group-hover:translate-x-1 transition-all duration-300' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PlaylistCard
