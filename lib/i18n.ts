export type Lang = 'en' | 'id'

export const translations = {
  // Navigation
  'nav.receivables':    { en: 'AR Tracker',       id: 'Pelacak Piutang' },
  'nav.canvas':         { en: 'Canvas Tracker',   id: 'Pelacak Canvas' },
  'nav.inventory':      { en: 'Inventory',        id: 'Daftar Barang' },
  'nav.home':           { en: 'Home',             id: 'Beranda' },

  // Home page
  'home.title':         { en: 'JAM Receipt Tracker', id: 'Pelacak Tanda Terima JAM' },
  'home.subtitle':      { en: 'Select a module to get started', id: 'Pilih modul untuk memulai' },
  'home.openReceivables': { en: 'Open AR Tracker',  id: 'Buka Pelacak Piutang' },
  'home.openCanvas':    { en: 'Open Canvas Tracker', id: 'Buka Pelacak Canvas' },
  'home.openInventory': { en: 'Open Inventory',      id: 'Buka Daftar Barang' },
  'home.arDesc':        { en: 'Monitor unpaid, partial, and paid customer invoices', id: 'Pantau invoice pelanggan yang belum, sebagian, dan sudah dibayar' },
  'home.canvasDesc':    { en: 'Track sales rep field runs and on-the-spot item sales', id: 'Lacak perjalanan sales dan penjualan item di lapangan' },
  'home.inventoryDesc': { en: 'Browse, add, and manage spare parts and product inventory', id: 'Lihat, tambah, dan kelola stok suku cadang dan produk' },

  // Common actions
  'common.save':        { en: 'Save',             id: 'Simpan' },
  'common.cancel':      { en: 'Cancel',           id: 'Batal' },
  'common.close':       { en: 'Close',            id: 'Tutup' },
  'common.add':         { en: 'Add',              id: 'Tambah' },
  'common.edit':        { en: 'Edit',             id: 'Edit' },
  'common.delete':      { en: 'Delete',           id: 'Hapus' },
  'common.confirm':     { en: 'Confirm',          id: 'Konfirmasi' },
  'common.sync':        { en: 'Sync',             id: 'Sinkron' },
  'common.syncing':     { en: 'Syncing...',       id: 'Menyinkron...' },
  'common.loading':     { en: 'Loading...',       id: 'Memuat...' },
  'common.saving':      { en: 'Saving...',        id: 'Menyimpan...' },
  'common.lastSynced':  { en: 'Last synced:',     id: 'Terakhir disinkron:' },
  'common.never':       { en: 'Never',            id: 'Belum pernah' },
  'common.notes':       { en: 'Notes',            id: 'Catatan' },
  'common.actions':     { en: 'Actions',          id: 'Aksi' },
  'common.noData':      { en: 'No data yet',      id: 'Belum ada data' },
  'common.error':       { en: 'Something went wrong. Please try again.', id: 'Terjadi kesalahan. Silakan coba lagi.' },
  'common.optional':    { en: 'Optional',         id: 'Opsional' },
  'common.remove':      { en: 'Remove',           id: 'Hapus' },
  'common.generating':  { en: 'Generating...',    id: 'Membuat...' },
  'common.search':      { en: 'Search...',        id: 'Cari...' },
  'common.filter':      { en: 'Filter',           id: 'Filter' },
  'common.resetFilters':{ en: 'Reset all filters',id: 'Reset semua filter' },
  'common.resetAll':    { en: 'Reset all',        id: 'Reset semua' },
  'common.noResults':   { en: 'No results match your current filters.', id: 'Tidak ada hasil yang cocok dengan filter Anda.' },
  'common.allFields':   { en: 'All Fields',       id: 'Semua Kolom' },
  'common.month':       { en: 'Month',            id: 'Bulan' },
  'common.status':      { en: 'Status',           id: 'Status' },

  // Status badges
  'status.unpaid':      { en: 'Unpaid',           id: 'Belum Bayar' },
  'status.partial':     { en: 'Partial',          id: 'Sebagian' },
  'status.paid':        { en: 'Paid',             id: 'Lunas' },
  'status.overdue':     { en: 'Overdue',          id: 'Jatuh Tempo' },
  'status.open':        { en: 'Open',             id: 'Aktif' },
  'status.closed':      { en: 'Closed',           id: 'Selesai' },

  // AR Tracker — page
  'ar.title':           { en: 'Accounts Receivable', id: 'Piutang Dagang' },
  'ar.addInvoice':      { en: 'Add Invoice',      id: 'Tambah Invoice' },
  'ar.addPayment':      { en: 'Add Payment',      id: 'Tambah Pembayaran' },

  // AR Tracker — summary bar
  'ar.summary.outstanding': { en: 'Total Outstanding', id: 'Total Belum Dibayar' },
  'ar.summary.overdue':     { en: 'Overdue',           id: 'Jatuh Tempo' },
  'ar.summary.dueSoon':     { en: 'Due in 7 Days',     id: 'Jatuh Tempo 7 Hari' },
  'ar.summary.invoices':    { en: 'invoices',           id: 'invoice' },

  // AR Tracker — table headers
  'ar.col.invoiceCode': { en: 'Invoice Code',     id: 'Kode Invoice' },
  'ar.col.customer':    { en: 'Customer',         id: 'Pelanggan' },
  'ar.col.invoiceDate': { en: 'Invoice Date',     id: 'Tgl Invoice' },
  'ar.col.dueDate':     { en: 'Due Date',         id: 'Tgl Jatuh Tempo' },
  'ar.col.total':       { en: 'Net Total',        id: 'Total Bersih' },
  'ar.col.grossTotal':  { en: 'Gross Total',      id: 'Total Kotor' },
  'ar.col.discount':    { en: 'Discount',         id: 'Diskon' },
  'ar.col.address':     { en: 'Address',          id: 'Alamat' },
  'ar.col.paid':        { en: 'Paid',             id: 'Dibayar' },
  'ar.col.remaining':   { en: 'Remaining',        id: 'Sisa' },
  'ar.col.status':      { en: 'Status',           id: 'Status' },

  // AR Tracker — payment history
  'ar.payments.title':  { en: 'Payment History',  id: 'Riwayat Pembayaran' },
  'ar.payments.none':   { en: 'No payments recorded yet.', id: 'Belum ada pembayaran tercatat.' },
  'ar.payments.date':   { en: 'Payment Date',     id: 'Tanggal Bayar' },
  'ar.payments.amount': { en: 'Amount Paid',      id: 'Jumlah Bayar' },
  'ar.payments.status': { en: 'Invoice Status',   id: 'Status Invoice' },

  // AR Tracker — Add Invoice modal
  'ar.modal.addInvoice.title':    { en: 'Add New Invoice',       id: 'Tambah Invoice Baru' },
  'ar.modal.addInvoice.code':     { en: 'Invoice Code',          id: 'Kode Invoice' },
  'ar.modal.addInvoice.customer': { en: 'Customer Name',         id: 'Nama Pelanggan' },
  'ar.modal.addInvoice.invoiceDate': { en: 'Invoice Date',       id: 'Tanggal Invoice' },
  'ar.modal.addInvoice.dueDate':  { en: 'Due Date',              id: 'Tanggal Jatuh Tempo' },
  'ar.modal.addInvoice.dueDays':  { en: 'Payment Term (days)',   id: 'Jangka Waktu (hari)' },
  'ar.modal.addInvoice.total':    { en: 'Total Amount',          id: 'Total Tagihan' },
  'ar.modal.addInvoice.address':  { en: 'Address',               id: 'Alamat' },
  'ar.modal.addInvoice.discount': { en: 'Discount (%)',          id: 'Diskon (%)' },
  'ar.modal.addInvoice.ph.code':  { en: 'e.g. INV-001',         id: 'misal INV-001' },
  'ar.modal.addInvoice.ph.customer': { en: 'Customer name',      id: 'Nama pelanggan' },
  'ar.modal.addInvoice.ph.address': { en: 'Street, City',        id: 'Jalan, Kota' },
  'ar.modal.addInvoice.ph.discount': { en: '0',                  id: '0' },
  'ar.modal.addInvoice.ph.total': { en: '1500000',               id: '1500000' },
  'ar.modal.addInvoice.ph.dueDays': { en: 'e.g. 30',            id: 'misal 30' },

  // AR Tracker — Edit Invoice modal
  'ar.modal.editInvoice.title':   { en: 'Edit Invoice',          id: 'Edit Invoice' },

  // AR Tracker — Add Payment modal
  'ar.modal.addPayment.title':    { en: 'Add Payment',      id: 'Tambah Pembayaran' },
  'ar.modal.addPayment.for':      { en: 'for Invoice',      id: 'untuk Invoice' },
  'ar.modal.addPayment.date':     { en: 'Payment Date',     id: 'Tanggal Pembayaran' },
  'ar.modal.addPayment.amount':   { en: 'Amount Paid',      id: 'Jumlah Dibayar' },
  'ar.modal.addPayment.ph.amount':{ en: '500000',           id: '500000' },
  'ar.modal.addPayment.ph.notes': { en: 'Optional notes',  id: 'Catatan opsional' },

  // AR Tracker — states
  'ar.empty':           { en: 'No invoices yet. Click "Add Invoice" to create one.', id: 'Belum ada invoice. Klik "Tambah Invoice" untuk membuat.' },
  'ar.error':           { en: 'Failed to load invoices. Check your connection and try again.', id: 'Gagal memuat invoice. Periksa koneksi Anda dan coba lagi.' },
  'ar.saveError':       { en: 'Failed to save. Check your connection and try again.', id: 'Gagal menyimpan. Periksa koneksi dan coba lagi.' },
  'ar.deleteInvoice':   { en: 'Delete Invoice',  id: 'Hapus Invoice' },
  'ar.confirmDelete':   { en: 'Delete this invoice and all its payments? This cannot be undone.', id: 'Hapus invoice ini beserta semua pembayarannya? Tindakan ini tidak dapat dibatalkan.' },
  'ar.deleteError':     { en: 'Failed to delete. Check your connection and try again.', id: 'Gagal menghapus. Periksa koneksi dan coba lagi.' },

  // Canvas Tracker — page
  'canvas.title':       { en: 'Canvas Tracker',   id: 'Pelacak Canvas' },
  'canvas.newRun':      { en: 'New Canvas Run',   id: 'Canvas Run Baru' },
  'canvas.openRuns':    { en: 'Open Runs',        id: 'Run Aktif' },
  'canvas.closedRuns':  { en: 'Closed Runs',      id: 'Run Selesai' },
  'canvas.noOpenRuns':  { en: 'No open canvas runs. Click "New Canvas Run" to start.', id: 'Tidak ada run canvas aktif. Klik "Canvas Run Baru" untuk memulai.' },
  'canvas.noClosedRuns':{ en: 'No closed canvas runs yet.', id: 'Belum ada run canvas selesai.' },
  'canvas.closeRun':    { en: 'Close Canvas',     id: 'Selesaikan Canvas' },
  'canvas.showClosed':  { en: 'Show Closed Runs', id: 'Tampilkan Run Selesai' },
  'canvas.hideClosed':  { en: 'Hide Closed Runs', id: 'Sembunyikan Run Selesai' },

  // Canvas Tracker — table/card headers
  'canvas.col.canvasId':    { en: 'Canvas ID',       id: 'ID Canvas' },
  'canvas.col.salesRep':    { en: 'Sales Rep',        id: 'Sales' },
  'canvas.col.dateOut':     { en: 'Date Out',         id: 'Tgl Keluar' },
  'canvas.col.dateClosed':  { en: 'Date Closed',      id: 'Tgl Selesai' },
  'canvas.col.status':      { en: 'Status',           id: 'Status' },
  'canvas.col.itemCount':   { en: 'Items',            id: 'Item' },
  'canvas.col.totalBrought':{ en: 'Total Brought',    id: 'Total Dibawa' },

  // Canvas Tracker — items table
  'canvas.item.name':       { en: 'Item Name',        id: 'Nama Item' },
  'canvas.item.brought':    { en: 'Qty Brought',      id: 'Jml Dibawa' },
  'canvas.item.returned':   { en: 'Qty Returned',     id: 'Jml Dikembalikan' },
  'canvas.item.sold':       { en: 'Qty Sold',         id: 'Jml Terjual' },
  'canvas.item.addRow':     { en: 'Add Item',         id: 'Tambah Item' },
  'canvas.item.noItems':    { en: 'No items recorded.', id: 'Tidak ada item tercatat.' },

  // Canvas Tracker — New Run modal
  'canvas.modal.newRun.title':    { en: 'New Canvas Run',    id: 'Canvas Run Baru' },
  'canvas.modal.newRun.salesRep': { en: 'Sales Rep',         id: 'Sales' },
  'canvas.modal.newRun.dateOut':  { en: 'Date Out',          id: 'Tanggal Keluar' },
  'canvas.modal.newRun.items':    { en: 'Items to Bring',    id: 'Daftar Item Dibawa' },
  'canvas.modal.newRun.ph.item':  { en: 'Item name',         id: 'Nama item' },
  'canvas.modal.newRun.ph.qty':   { en: 'Qty',              id: 'Jml' },
  'canvas.modal.newRun.selectRep':{ en: 'Select sales rep',  id: 'Pilih sales' },
  'canvas.modal.newRun.minItems': { en: 'Add at least one item.', id: 'Tambahkan minimal satu item.' },

  // Canvas Tracker — Close Run modal
  'canvas.modal.closeRun.title':      { en: 'Close Canvas Run',  id: 'Selesaikan Canvas Run' },
  'canvas.modal.closeRun.dateClosed': { en: 'Date Closed',       id: 'Tanggal Selesai' },
  'canvas.modal.closeRun.returnQty':  { en: 'Quantity Sold',     id: 'Jumlah Terjual' },
  'canvas.modal.closeRun.items':      { en: 'Sale Quantities',   id: 'Jumlah Penjualan' },

  // Canvas Tracker — edit/delete
  'canvas.editRun':              { en: 'Edit Run',         id: 'Edit Run' },
  'canvas.deleteRun':            { en: 'Delete Run',       id: 'Hapus Run' },
  'canvas.confirmDeleteRun':     { en: 'Delete this canvas run and all its items? This cannot be undone.', id: 'Hapus canvas run ini beserta semua itemnya? Tindakan ini tidak dapat dibatalkan.' },
  'canvas.deleteError':          { en: 'Failed to delete. Check your connection and try again.', id: 'Gagal menghapus. Periksa koneksi dan coba lagi.' },
  'canvas.modal.editRun.title':  { en: 'Edit Canvas Run',  id: 'Edit Canvas Run' },

  // Canvas Tracker — states
  'canvas.empty':       { en: 'No canvas runs yet. Click "New Canvas Run" to start.', id: 'Belum ada canvas run. Klik "Canvas Run Baru" untuk memulai.' },
  'canvas.error':       { en: 'Failed to load canvas runs. Check your connection and try again.', id: 'Gagal memuat canvas run. Periksa koneksi Anda dan coba lagi.' },
  'canvas.saveError':   { en: 'Failed to save. Check your connection and try again.', id: 'Gagal menyimpan. Periksa koneksi dan coba lagi.' },

  // 404 page
  'notFound.title':     { en: 'Page Not Found',    id: 'Halaman Tidak Ditemukan' },
  'notFound.message':   { en: 'The page you are looking for does not exist.', id: 'Halaman yang Anda cari tidak ada.' },
  'notFound.home':      { en: 'Back to Home',      id: 'Kembali ke Beranda' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang]
}
