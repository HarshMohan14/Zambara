'use client'

import { useEffect, useRef, useState } from 'react'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  requiredInput?: {
    placeholder: string
    expectedValue: string
    label?: string
  }
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const theme = {
  border: '#d1a058',
  borderMuted: 'rgba(209, 160, 88, 0.4)',
  bg: 'rgba(10, 10, 10, 0.98)',
  gold: '#d1a058',
  danger: '#ef4444',
  dangerBorder: 'rgba(239, 68, 68, 0.6)',
  text: '#fff',
  textMuted: 'rgba(255, 255, 255, 0.8)',
  fontTitle: "'TheWalkyrDemo', serif",
  fontBody: "'BlinkerSemiBold', sans-serif",
  fontRegular: "'BlinkerRegular', sans-serif",
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  requiredInput,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const isDanger = variant === 'danger'

  useEffect(() => {
    if (open) {
      setInputValue('')
      if (requiredInput && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
  }, [open, requiredInput])

  if (!open) return null

  const handleConfirm = () => {
    if (requiredInput && inputValue.trim() !== requiredInput.expectedValue) return
    onConfirm()
  }

  const canConfirm = !requiredInput || inputValue.trim() === requiredInput.expectedValue

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg border-2 p-6 shadow-xl"
        style={{
          background: theme.bg,
          borderColor: isDanger ? theme.dangerBorder : theme.borderMuted,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px ${theme.borderMuted}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3
            className="text-xl uppercase mb-3"
            style={{
              fontFamily: theme.fontTitle,
              color: theme.gold,
              textShadow: '0 0 12px rgba(209, 160, 88, 0.3)',
            }}
          >
            {title}
          </h3>
        )}
        <div
          className="mb-6 whitespace-pre-line text-sm leading-relaxed"
          style={{
            fontFamily: theme.fontRegular,
            color: theme.textMuted,
          }}
        >
          {message}
        </div>
        {requiredInput && (
          <div className="mb-6">
            {requiredInput.label && (
              <label
                className="block mb-2 text-sm"
                style={{ fontFamily: theme.fontBody, color: theme.textMuted }}
              >
                {requiredInput.label}
              </label>
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder={requiredInput.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 bg-black/60 text-white placeholder-white/40 focus:outline-none focus:border-[#d1a058]"
              style={{
                fontFamily: theme.fontRegular,
                borderColor: theme.borderMuted,
              }}
            />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-50"
            style={{
              fontFamily: theme.fontBody,
              borderColor: theme.borderMuted,
              color: theme.text,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.border
              e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.borderMuted
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || (!!requiredInput && !canConfirm)}
            className="px-4 py-2 rounded-lg border-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: theme.fontBody,
              borderColor: isDanger ? theme.danger : theme.border,
              color: isDanger ? theme.danger : '#000',
              backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.2)' : theme.gold,
            }}
            onMouseEnter={(e) => {
              if (e.currentTarget.disabled) return
              e.currentTarget.style.boxShadow = isDanger
                ? '0 0 20px rgba(239, 68, 68, 0.4)'
                : '0 0 20px rgba(209, 160, 88, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
