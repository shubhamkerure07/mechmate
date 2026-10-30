import React from 'react'

export interface ZarionButtonProps {
  children: React.ReactNode
  variant?: 'blue' | 'dark' | 'light' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: React.ReactNode
  showArrow?: boolean
  title?: string
}

export const ZarionChevronArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M6 17L11 12L6 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 17L18 12L13 7"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const ZarionButton: React.FC<ZarionButtonProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  showArrow = true,
  title
}) => {
  const isString = typeof children === 'string'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`zarion-btn zarion-btn--${variant} zarion-btn--${size} ${className} ${disabled ? 'disabled' : ''}`}
    >
      <div className="zarion-btn-left">
        {icon && <span className="zarion-btn-icon">{icon}</span>}
        {isString ? (
          <div className="zarion-btn-text-wrap">
            <span className="zarion-btn-text one">{children}</span>
            <span className="zarion-btn-text two" aria-hidden="true">
              {children}
            </span>
          </div>
        ) : (
          <div className="zarion-btn-content">{children}</div>
        )}
      </div>

      {showArrow && (
        <div className="zarion-arrow-wrap">
          <span className="zarion-arrow one">
            <ZarionChevronArrow />
          </span>
          <span className="zarion-arrow two">
            <ZarionChevronArrow />
          </span>
        </div>
      )}
    </button>
  )
}
