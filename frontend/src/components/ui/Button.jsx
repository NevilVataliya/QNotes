import PropTypes from 'prop-types';

export default function Button({
    children,
    type = "button",
    bgColor = "bg-primary-600 hover:bg-primary-700",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-12 text-sm font-medium transition-[transform,colors,box-shadow] duration-150 ${bgColor} ${textColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.string,
    bgColor: PropTypes.string,
    textColor: PropTypes.string,
    className: PropTypes.string
};
