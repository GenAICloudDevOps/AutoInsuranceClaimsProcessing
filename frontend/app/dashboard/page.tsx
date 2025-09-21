'use client'

import { useEffect, useState } from 'react'
import { auth } from '../../lib/auth'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userClaims, setUserClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        const userData = await auth.getCurrentUser()
        setUser(userData)
        
        // Fetch user claims
        const claimsData = await auth.api.get('/claims')
        setUserClaims(claimsData.data)
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    auth.logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Claims Dashboard</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user?.first_name} {user?.last_name}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Claims</h3>
            <p className="text-3xl font-bold text-blue-600">{userClaims.length}</p>
            <p className="text-sm text-gray-500">Total claims</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {userClaims.filter(c => ['submitted', 'under_review', 'assigned', 'investigating'].includes(c.status)).length}
            </p>
            <p className="text-sm text-gray-500">Awaiting review</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {userClaims.filter(c => ['approved', 'settled'].includes(c.status)).length}
            </p>
            <p className="text-sm text-gray-500">Settled claims</p>
          </div>
        </div>

        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user?.role === 'customer' || user?.role === 'agent') && (
              <button 
                onClick={() => router.push('/new-claim')}
                className="btn-primary text-left p-4"
              >
                <h4 className="font-medium">File New Claim</h4>
                <p className="text-sm opacity-75">Submit a new insurance claim</p>
              </button>
            )}
            <button 
              onClick={() => router.push('/claims')}
              className="btn-secondary text-left p-4"
            >
              <h4 className="font-medium">
                {user?.role === 'customer' ? 'View My Claims' : 'Manage Claims'}
              </h4>
              <p className="text-sm opacity-75">
                {user?.role === 'customer' ? 'See your claim history' : 'Process and approve claims'}
              </p>
            </button>
          </div>
        </div>

        {user?.role && ['agent', 'adjuster', 'manager', 'admin'].includes(user.role) && (
          <div className="mt-6 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Workflow
            </h3>
            <div className="text-sm text-gray-600">
              {user.role === 'agent' && (
                <p>• Review submitted claims and move them to review status<br/>• Reject obviously invalid claims</p>
              )}
              {user.role === 'adjuster' && (
                <p>• Investigate assigned claims<br/>• Assess damage and approve/reject claims<br/>• Set approved amounts</p>
              )}
              {user.role === 'manager' && (
                <p>• Assign claims to adjusters<br/>• Oversee the approval process<br/>• Settle approved claims</p>
              )}
              {user.role === 'admin' && (
                <p>• Full system access<br/>• Override any workflow step<br/>• Process final settlements</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}