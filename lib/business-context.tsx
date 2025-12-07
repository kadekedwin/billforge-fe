'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Business } from '@/lib/api/businesses/types'
import { getBusinesses } from '@/lib/api/businesses'

interface BusinessContextType {
  selectedBusiness: Business | null
  businesses: Business[]
  setSelectedBusiness: (business: Business | null) => void
  refreshBusinesses: () => Promise<void>
  isLoading: boolean
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [selectedBusiness, setSelectedBusinessState] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBusinesses = async () => {
    // Check if user is authenticated before fetching
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await getBusinesses()
      if (response.success && response.data) {
        setBusinesses(response.data)

        const savedBusinessUuid = localStorage.getItem('selectedBusinessUuid')
        if (savedBusinessUuid) {
          const savedBusiness = response.data.find((b: Business) => b.uuid === savedBusinessUuid)
          if (savedBusiness) {
            setSelectedBusinessState(savedBusiness)
          } else if (response.data.length > 0) {
            setSelectedBusinessState(response.data[0])
            localStorage.setItem('selectedBusinessUuid', response.data[0].uuid)
          } else {
            // No businesses left, clear selection
            setSelectedBusinessState(null)
            localStorage.removeItem('selectedBusinessUuid')
          }
        } else if (response.data.length > 0) {
          setSelectedBusinessState(response.data[0])
          localStorage.setItem('selectedBusinessUuid', response.data[0].uuid)
        } else {
          // No businesses and no saved business, ensure state is cleared
          setSelectedBusinessState(null)
          localStorage.removeItem('selectedBusinessUuid')
        }
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const setSelectedBusiness = (business: Business | null) => {
    setSelectedBusinessState(business)
    if (business) {
      localStorage.setItem('selectedBusinessUuid', business.uuid)
    } else {
      localStorage.removeItem('selectedBusinessUuid')
    }
  }

  const refreshBusinesses = async () => {
    await fetchBusinesses()
  }

  return (
    <BusinessContext.Provider
      value={{
        selectedBusiness,
        businesses,
        setSelectedBusiness,
        refreshBusinesses,
        isLoading,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
