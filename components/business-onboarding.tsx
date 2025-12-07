'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Loader2, X } from 'lucide-react'
import { createBusiness, updateBusiness } from '@/lib/api/businesses'
import { useBusiness } from '@/contexts/business-context'
import { uploadImage } from '@/lib/images/operations'
import { getFileSizeBytes } from '@/lib/images/utils'
import type { CreateBusinessRequest } from '@/lib/api'

export function BusinessOnboarding() {
  const { refreshBusinesses } = useBusiness()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateBusinessRequest>({
    name: '',
    address: null,
    phone: null,
    image_size_bytes: null,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setError('Image size must be less than 1MB')
        e.target.value = '' // Clear the input
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
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
        const createdBusinessUuid = response.data.uuid
        let imageSizeBytes: number | null = null

        if (selectedImage && createdBusinessUuid) {
          setIsUploadingImage(true)
          const uploadResult = await uploadImage({
            file: selectedImage,
            folder: 'businesses',
            uuid: createdBusinessUuid,
          })

          if (uploadResult.success) {
            imageSizeBytes = getFileSizeBytes(selectedImage)
          }
          setIsUploadingImage(false)
        }

        if (imageSizeBytes !== null) {
          await updateBusiness(createdBusinessUuid, {
            image_size_bytes: imageSizeBytes,
          })
        }

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

          <div className="space-y-2">
            <Label htmlFor="logo">Business Logo (Optional)</Label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={imagePreview} alt="Business logo preview" />
                    <AvatarFallback>Logo</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting || isUploadingImage}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: JPG, JPEG, PNG, GIF, WEBP. Max size: 1MB
                </p>
              </div>
            </div>
            {isUploadingImage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading logo...
              </div>
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
