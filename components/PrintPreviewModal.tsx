'use client'

import { useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface PrintPreviewModalProps {
  url: string
  title: string
  onClose: () => void
}

export default function PrintPreviewModal({ url, title, onClose }: PrintPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { t } = useLanguage()

  function handlePrint() {
    iframeRef.current?.contentWindow?.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 print:hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t('print.btn.print')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        src={url}
        className="flex-1 w-full bg-white"
        title={title}
      />
    </div>
  )
}
