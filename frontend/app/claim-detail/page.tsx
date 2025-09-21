'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '../../lib/auth'

export default function ClaimDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [claim, setClaim] = useState<any>(null)
  const [adjusters, setAdjusters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimId = searchParams.get('id')

  useEffect(() => {
    const loadData = async () => {
      if (!auth.isAuthenticated() || !claimId) {
        router.push('/login')
        return
      }

      try {
        const userData = await auth.getCurrentUser()
        setUser(userData)
        
        const claimData = await auth.api.get(`/claims/${claimId}`)
        setClaim(claimData.data)

        // Load adjusters if user is manager/admin
        if (['manager', 'admin'].includes(userData.role)) {
          const adjustersData = await auth.api.get('/users/adjusters')
          setAdjusters(adjustersData.data)
        }
      } catch (error) {
        router.push('/claims')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, claimId])

  const updateStatus = async (newStatus: string, additionalData: any = {}) => {
    setUpdating(true)
    try {
      await auth.api.put(`/claims/${claimId}/status`, {
        new_status: newStatus,
        ...additionalData
      })
      
      // Reload claim data
      const claimData = await auth.api.get(`/claims/${claimId}`)
      setClaim(claimData.data)
      
      alert('Status updated successfully!')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const getAvailableActions = () => {
    if (!claim || !user) return []

    const actions = []
    const role = user.role
    const status = claim.status

    // Define available transitions based on role and current status
    if (role === 'agent') {
      if (status === 'submitted') {
        actions.push({ label: 'Move to Review', status: 'under_review' })
        actions.push({ label: 'Reject', status: 'rejected' })
      }
      if (status === 'under_review') {
        actions.push({ label: 'Reject', status: 'rejected' })
      }
    }

    if (role === 'manager') {
      if (status === 'submitted') {
        actions.push({ label: 'Move to Review', status: 'under_review' })
      }
      if (status === 'under_review') {
        actions.push({ label: 'Assign to Adjuster', status: 'assigned', needsAdjuster: true })
        actions.push({ label: 'Reject', status: 'rejected' })
      }
      if (status === 'approved') {
        actions.push({ label: 'Settle', status: 'settled' })
      }
    }

    if (role === 'adjuster') {
      if (status === 'assigned' && claim.assigned_adjuster_id === user.id) {
        actions.push({ label: 'Start Investigation', status: 'investigating' })
        actions.push({ label: 'Reject', status: 'rejected' })
      }
      if (status === 'investigating' && claim.assigned_adjuster_id === user.id) {
        actions.push({ label: 'Approve', status: 'approved', needsAmount: true })
        actions.push({ label: 'Reject', status: 'rejected' })
      }
    }

    if (role === 'admin') {
      // Admin can do any transition
      const allStatuses = ['under_review', 'assigned', 'investigating', 'approved', 'rejected', 'settled']
      allStatuses.forEach(s => {
        if (s !== status) {
          actions.push({ 
            label: `Move to ${s.replace('_', ' ').toUpperCase()}`, 
            status: s,
            needsAdjuster: s === 'assigned',
            needsAmount: s === 'approved'
          })
        }
      })
    }

    return actions
  }

  const handleActionClick = (action: any) => {
    if (action.needsAdjuster) {
      const adjusterId = prompt('Select adjuster ID:')
      if (adjusterId) {
        updateStatus(action.status, { assigned_adjuster_id: parseInt(adjusterId) })
      }
    } else if (action.needsAmount) {
      const amount = prompt('Enter approved amount:')
      if (amount) {
        updateStatus(action.status, { approved_amount: parseFloat(amount) })
      }
    } else {
      updateStatus(action.status)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Not Found</h2>
          <button onClick={() => router.push('/claims')} className="btn-primary">
            Back to Claims
          </button>
        </div>
      </div>
    )
  }

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

  const availableActions = getAvailableActions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user?.first_name} {user?.last_name}</span>
              </div>
            </div>
            <button onClick={() => router.push('/claims')} className="btn-secondary">
              Back to Claims
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{claim.claim_number}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                {claim.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><strong>Created:</strong> {new Date(claim.created_at).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(claim.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Incident Details</h3>
              <p><strong>Date:</strong> {new Date(claim.incident_date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {claim.incident_location}</p>
              <p className="mt-2"><strong>Description:</strong></p>
              <p className="text-gray-700">{claim.incident_description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
              {claim.estimated_damage && (
                <p><strong>Estimated Damage:</strong> ${claim.estimated_damage.toLocaleString()}</p>
              )}
              {claim.approved_amount && (
                <p><strong>Approved Amount:</strong> ${claim.approved_amount.toLocaleString()}</p>
              )}
              {claim.assigned_adjuster_id && (
                <p><strong>Assigned Adjuster ID:</strong> {claim.assigned_adjuster_id}</p>
              )}
            </div>
          </div>

          {availableActions.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h3>
              <div className="flex flex-wrap gap-3">
                {availableActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    disabled={updating}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      action.status === 'rejected' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : action.status === 'approved' || action.status === 'settled'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {updating ? 'Updating...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}