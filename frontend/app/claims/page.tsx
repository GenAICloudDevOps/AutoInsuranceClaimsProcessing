'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'

export default function ClaimsPage() {
  const [user, setUser] = useState<any>(null)
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        const userData = await auth.getCurrentUser()
        setUser(userData)
        
        const claimsData = await auth.api.get('/claims')
        setClaims(claimsData.data)
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      case 'investigating': return 'bg-orange-100 text-orange-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'settled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Claims History</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user?.first_name} {user?.last_name}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/new-claim')}
                className="btn-primary"
              >
                New Claim
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {claims.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any claims yet.</p>
            <button
              onClick={() => router.push('/new-claim')}
              className="btn-primary"
            >
              File Your First Claim
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div 
                key={claim.id} 
                className="card cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => router.push(`/claim-detail?id=${claim.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.claim_number}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Incident Date:</strong> {formatDate(claim.incident_date)}</p>
                        <p><strong>Location:</strong> {claim.incident_location}</p>
                      </div>
                      <div>
                        <p><strong>Submitted:</strong> {formatDate(claim.created_at)}</p>
                        <p><strong>Last Updated:</strong> {formatDate(claim.updated_at)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong> {claim.incident_description}
                      </p>
                    </div>

                    {claim.estimated_damage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          <strong>Estimated Damage:</strong> ${claim.estimated_damage.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {claim.approved_amount && (
                      <div className="mt-2">
                        <p className="text-sm text-green-700">
                          <strong>Approved Amount:</strong> ${claim.approved_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}