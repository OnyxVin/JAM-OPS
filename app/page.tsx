'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('home.title')}</h1>
        <p className="text-gray-500">{t('home.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/receivables"
          className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📄</span>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {t('nav.receivables')}
            </h2>
          </div>
          <p className="text-sm text-gray-500">{t('home.arDesc')}</p>
          <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:text-blue-800">
            {t('home.openReceivables')} →
          </span>
        </Link>

        <Link
          href="/canvas"
          className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🚗</span>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {t('nav.canvas')}
            </h2>
          </div>
          <p className="text-sm text-gray-500">{t('home.canvasDesc')}</p>
          <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:text-blue-800">
            {t('home.openCanvas')} →
          </span>
        </Link>

        <Link
          href="/inventory"
          className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📦</span>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {t('nav.inventory')}
            </h2>
          </div>
          <p className="text-sm text-gray-500">{t('home.inventoryDesc')}</p>
          <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:text-blue-800">
            {t('home.openInventory')} →
          </span>
        </Link>
      </div>
    </div>
  )
}
