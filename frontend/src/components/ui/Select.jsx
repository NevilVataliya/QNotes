import {useId, forwardRef} from 'react'
import PropTypes from 'prop-types'

const Select = forwardRef(function Select({
    options,
    label,
    className,
    ...props
}, ref) {
    const id = useId()

    // Handle both string arrays and object arrays with value/label
    const renderOptions = () => {
        if (!options) return null;

        return options.map((option) => {
            if (typeof option === 'string') {
                return (
                    <option key={option} value={option}>
                        {option}
                    </option>
                );
            } else if (typeof option === 'object' && option.value && option.label) {
                return (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                );
            }
            return null;
        });
    };

  return (
    <div className='w-full'>
                {label && <label htmlFor={id} className='inline-block mb-1 pl-1 text-primary-700 dark:text-surface-200 font-medium'>{label}</label>}
        <select
        {...props}
        id={id}
        ref={ref}
                                className={`px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 text-primary-900 dark:text-surface-50 outline-none border border-surface-300 dark:border-surface-700 w-full focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm dark:shadow-none transition-[border-color,box-shadow,color,background-color] duration-200 min-h-12 ${className || ''}`}
        >
            {renderOptions()}
        </select>
    </div>
  )
})

Select.displayName = "Select"

Select.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            })
        ])
    ),
    label: PropTypes.string,
    className: PropTypes.string
}

export default Select