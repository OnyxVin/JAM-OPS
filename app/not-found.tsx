'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl font-bold text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('notFound.title')}</h1>
      <p className="text-gray-500 mb-8">{t('notFound.message')}</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
      >
        {t('notFound.home')}
      </Link>
    </div>
  )
}
