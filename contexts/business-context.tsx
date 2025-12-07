'use client'

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react'
import {usePathname} from 'next/navigation'
import {Business} from '@/lib/api/businesses/types'
import {getBusinesses} from '@/lib/api/businesses'

interface BusinessContextType {
    selectedBusiness: Business | null
    businesses: Business[]
    setSelectedBusiness: (business: Business | null) => void
    refreshBusinesses: () => Promise<void>
    isLoading: boolean
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({children}: { children: ReactNode }) {
    const pathname = usePathname()
    const [selectedBusiness, setSelectedBusinessState] = useState<Business | null>(null)
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchBusinesses = async () => {
        if (typeof window === "undefined") {
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
                        setSelectedBusinessState(null)
                        localStorage.removeItem('selectedBusinessUuid')
                    }
                } else if (response.data.length > 0) {
                    setSelectedBusinessState(response.data[0])
                    localStorage.setItem('selectedBusinessUuid', response.data[0].uuid)
                } else {
                    setSelectedBusinessState(null)
                    localStorage.removeItem('selectedBusinessUuid')
                }
            } else {
                setBusinesses([])
            }
        } catch (error) {
            console.error('Failed to fetch businesses:', error)
            setBusinesses([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (pathname === '/login' || pathname === '/register') {
            setIsLoading(false)
            return
        }
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
