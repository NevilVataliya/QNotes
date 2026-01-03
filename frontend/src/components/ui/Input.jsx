import React, {useId} from 'react'
import PropTypes from 'prop-types'

const Input = React.forwardRef( function Input({
    label,
    type = "text",
    error,
    className = "",
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label
            className='inline-block mb-1 pl-1 text-primary-700 dark:text-surface-200 font-medium'
            htmlFor={id}>
                {label}
            </label>
            }
            <input
            type={type}
            aria-invalid={Boolean(error)}
            className={`px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 text-primary-900 dark:text-surface-50 placeholder:text-surface-400 dark:placeholder:text-surface-500 outline-none border w-full shadow-sm dark:shadow-none transition-[background-color,border-color,box-shadow,color] duration-200 min-h-12 ${
                error
                    ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/20'
                    : 'border-surface-300 dark:border-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            } focus:bg-white dark:focus:bg-surface-900 ${className}`}
            ref={ref}
            {...props}
            id={id}
            />

            {error ? (
                <p className='mt-1 pl-1 text-sm text-brand-red'>
                    {error}
                </p>
            ) : null}
        </div>
    )
})

Input.displayName = "Input"

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string
}

export default Input