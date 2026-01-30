'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          className: 'admin-panel-toast',
          style: {
            background: 'rgba(10, 10, 10, 0.98)',
            border: '2px solid rgba(209, 160, 88, 0.4)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(209, 160, 88, 0.1)',
            fontFamily: "'BlinkerSemiBold', sans-serif",
          },
        }}
      />
    </div>
  )
}
