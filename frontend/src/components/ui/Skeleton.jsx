import PropTypes from 'prop-types'

function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div
      className={
        `animate-pulse bg-surface-200/70 dark:bg-surface-700/50 ${rounded} ${className}`
      }
      aria-hidden="true"
    />
  )
}

Skeleton.propTypes = {
  className: PropTypes.string,
  rounded: PropTypes.string,
}

export default Skeleton
