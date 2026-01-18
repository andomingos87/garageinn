'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eraser, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  title?: string
  description?: string
  onSave?: (dataUrl: string) => void
  onClear?: () => void
  width?: number
  height?: number
  className?: string
  disabled?: boolean
  penColor?: string
  backgroundColor?: string
  required?: boolean
  value?: string | null
}

export function SignaturePad({
  title = 'Assinatura',
  description,
  onSave,
  onClear,
  width,
  height = 200,
  className,
  disabled = false,
  penColor = '#000000',
  backgroundColor = '#ffffff',
  required = false,
  value,
}: SignaturePadProps) {
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [canvasWidth, setCanvasWidth] = useState(width || 400)

  // Handle responsive width
  useEffect(() => {
    if (width) {
      setCanvasWidth(width)
      return
    }

    const updateWidth = () => {
      if (containerRef.current) {
        // Leave some padding
        const containerWidth = containerRef.current.offsetWidth - 32
        setCanvasWidth(Math.max(containerWidth, 200))
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [width])

  // Load existing signature if provided
  useEffect(() => {
    if (value && sigCanvasRef.current) {
      // Clear first
      sigCanvasRef.current.clear()
      // Load image
      const img = new Image()
      img.onload = () => {
        const canvas = sigCanvasRef.current?.getCanvas()
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            setIsEmpty(false)
          }
        }
      }
      img.src = value
    }
  }, [value, backgroundColor])

  const handleClear = useCallback(() => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setIsEmpty(true)
      onClear?.()
    }
  }, [onClear])

  const handleEnd = useCallback(() => {
    if (sigCanvasRef.current) {
      const empty = sigCanvasRef.current.isEmpty()
      setIsEmpty(empty)
      if (!empty && onSave) {
        const dataUrl = sigCanvasRef.current.toDataURL('image/png')
        onSave(dataUrl)
      }
    }
  }, [onSave])

  const handleSave = useCallback(() => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.toDataURL('image/png')
      onSave?.(dataUrl)
    }
  }, [onSave])

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {title}
              {required && <span className="text-destructive ml-1">*</span>}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={disabled || isEmpty}
            >
              <Eraser className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={containerRef} className="p-4 pt-0">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg overflow-hidden transition-colors',
            isEmpty ? 'border-muted-foreground/25' : 'border-primary/50',
            disabled && 'opacity-50 pointer-events-none'
          )}
          style={{ backgroundColor }}
        >
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor={penColor}
            backgroundColor={backgroundColor}
            canvasProps={{
              width: canvasWidth,
              height: height,
              className: 'touch-none',
              style: {
                width: '100%',
                height: `${height}px`,
              },
            }}
            onEnd={handleEnd}
          />
        </div>
        {isEmpty && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Desenhe sua assinatura acima
          </p>
        )}
        {!isEmpty && (
          <p className="text-xs text-success text-center mt-2 flex items-center justify-center gap-1">
            <Check className="h-3 w-3" />
            Assinatura capturada
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Simple inline signature for smaller spaces
interface InlineSignaturePadProps {
  label: string
  value?: string | null
  onChange: (dataUrl: string | null) => void
  height?: number
  disabled?: boolean
  required?: boolean
}

export function InlineSignaturePad({
  label,
  value,
  onChange,
  height = 150,
  disabled = false,
  required = false,
}: InlineSignaturePadProps) {
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(!value)
  const [canvasWidth, setCanvasWidth] = useState(300)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        setCanvasWidth(Math.max(containerWidth, 200))
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Load existing signature if provided
  useEffect(() => {
    if (value && sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      const img = new Image()
      img.onload = () => {
        const canvas = sigCanvasRef.current?.getCanvas()
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            setIsEmpty(false)
          }
        }
      }
      img.src = value
    }
  }, [value])

  const handleClear = useCallback(() => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setIsEmpty(true)
      onChange(null)
    }
  }, [onChange])

  const handleEnd = useCallback(() => {
    if (sigCanvasRef.current) {
      const empty = sigCanvasRef.current.isEmpty()
      setIsEmpty(empty)
      if (!empty) {
        const dataUrl = sigCanvasRef.current.toDataURL('image/png')
        onChange(dataUrl)
      }
    }
  }, [onChange])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled || isEmpty}
          className="h-7 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      </div>
      <div
        ref={containerRef}
        className={cn(
          'border-2 border-dashed rounded-lg overflow-hidden bg-white transition-colors',
          isEmpty ? 'border-muted-foreground/25' : 'border-primary/50',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="#000000"
          backgroundColor="#ffffff"
          canvasProps={{
            width: canvasWidth,
            height: height,
            className: 'touch-none',
            style: {
              width: '100%',
              height: `${height}px`,
            },
          }}
          onEnd={handleEnd}
        />
      </div>
      {isEmpty && (
        <p className="text-xs text-muted-foreground text-center">
          Toque ou clique para assinar
        </p>
      )}
    </div>
  )
}
