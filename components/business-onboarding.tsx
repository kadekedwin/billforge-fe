'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Loader2 } from 'lucide-react'
import { createBusiness } from '@/lib/api/businesses'
import { useBusiness } from '@/lib/business-context'
import type { CreateBusinessRequest } from '@/lib/api'

export function BusinessOnboarding() {
  const { refreshBusinesses } = useBusiness()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateBusinessRequest>({
    name: '',
    address: null,
    phone: null,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    let processedValue: string | null = value

    if ((name === 'address' || name === 'phone') && value === '') {
      processedValue = null
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})
    setError(null)

    try {
      const response = await createBusiness(formData)
      if (response.success) {
        await refreshBusinesses()
      } else {
        const errorData = response as unknown as {
          success: false
          message: string
          errors?: Record<string, string[]>
        }
        if (errorData.errors) {
          const errors: Record<string, string> = {}
          Object.keys(errorData.errors).forEach((key) => {
            if (errorData.errors) {
              errors[key] = errorData.errors[key][0]
            }
          })
          setFormErrors(errors)
        } else if (errorData.message) {
          setError(errorData.message)
        } else {
          setError('Failed to create business')
        }
      }
    } catch (err) {
      setError('An error occurred while creating business')
      console.error('Error creating business:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to BillForge</h1>
          <p className="mt-2 text-muted-foreground">
            Get started by creating your first business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Business"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
              className={formErrors.name ? 'border-destructive' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1234567890"
              value={formData.phone || ''}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={formErrors.phone ? 'border-destructive' : ''}
            />
            {formErrors.phone && (
              <p className="text-sm text-destructive">{formErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="123 Main St, City, State, ZIP"
              value={formData.address || ''}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={formErrors.address ? 'border-destructive' : ''}
              rows={3}
            />
            {formErrors.address && (
              <p className="text-sm text-destructive">{formErrors.address}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Business
          </Button>
        </form>
      </div>
    </div>
  )
}
