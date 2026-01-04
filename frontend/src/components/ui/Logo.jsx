import PropTypes from 'prop-types'

function Logo({ width = '100px' }) {
  return (
    <div
      role="img"
      aria-label="QNotes"
      className="inline-flex items-end gap-1 select-none font-extrabold tracking-tight"
      style={{ width }}
    >
      <span className="text-3xl leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 drop-shadow-sm">
        Q
      </span>

      <span className="text-2xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
        Notes
      </span>
    </div>
  )
}

Logo.propTypes = {
    width: PropTypes.string
}

export default Logo