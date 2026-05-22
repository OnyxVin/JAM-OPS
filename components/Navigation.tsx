'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function Navigation() {
  const { t, lang, toggleLang } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/login') return null

  const navLinks = [
    { href: '/receivables', label: t('nav.receivables') },
    { href: '/canvas', label: t('nav.canvas') },
  ]

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-blue-800 font-bold text-lg tracking-tight hover:text-blue-600 transition-colors">
            JAM OPS
          </Link>

          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-700 border-b-2 border-blue-700 pb-0.5'
                    : 'text-gray-600 hover:text-blue-700'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={toggleLang}
              className="text-xs font-semibold px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'EN' : 'ID'}
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-medium px-2.5 py-1 rounded border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
