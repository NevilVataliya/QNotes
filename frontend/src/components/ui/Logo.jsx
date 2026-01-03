import PropTypes from 'prop-types'

function Logo({width = '100px'}) {
  return (
    <div className='text-2xl font-bold tracking-tight text-primary-700 dark:text-primary-300' style={{width}}>
      QNotes
    </div>
  )
}

Logo.propTypes = {
    width: PropTypes.string
}

export default Logo