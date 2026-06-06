import React, { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Order, User, OrderStatus } from '../types';
import { LaughDryDatabase } from '../data/mockDatabase';

interface LaundryQueueProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  currentUser: User;
  onShowToast: (msg: string) => void;
  loadDB: () => void;
  handleOpenEditOrderModal: (order: Order) => void;
  handleTransitionStatus: (orderId: string, currentStatus: OrderStatus) => void;
  setActiveInvoice: (order: Order) => void;
  setShowInvoiceChoiceModal: (show: boolean) => void;
  setShowOrderDetailModal: (order: Order | null) => void;
}

export const LaundryQueue: React.FC<LaundryQueueProps> = ({
  orders,
  setOrders,
  currentUser,
  onShowToast,
  loadDB,
  handleOpenEditOrderModal,
  handleTransitionStatus,
  setActiveInvoice,
  setShowInvoiceChoiceModal,
  setShowOrderDetailModal,
}) => {
  const [processGroupBy, setProcessGroupBy] = useState<'queue' | 'laundry' | 'ironing' | 'packing' | 'ready' | 'completed'>('queue');

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("apakah akan benar dihapus?")) {
      const updated = orders.filter(o => o.id !== orderId);
      LaughDryDatabase.saveOrders(updated);
      setOrders(updated);
      LaughDryDatabase.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'ORDER_DELETE',
        `Menghapus orderan id [${orderId}]`
      );
      onShowToast("Orderan berhasil dihapus secara permanen!");
      loadDB();
    }
  };

  const handleClearAllActiveQueue = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua antrean cucian aktif di cabang ini?")) {
      const remainingOrders = orders.filter(o => o.branchId !== currentUser.branchId || o.status === OrderStatus.SELESAI || o.status === OrderStatus.DIBATALKAN);
      LaughDryDatabase.saveOrders(remainingOrders);
      setOrders(remainingOrders);
      LaughDryDatabase.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'QUEUE_CLEAR_ALL',
        'Mengosongkan papan antrean kerja aktif cabang'
      );
      onShowToast("Papan antrean diclear!");
      loadDB();
    }
  };

  const branchOrders = orders.filter(o => o.branchId === currentUser.branchId);

  // In-process filters mapped from processGroupBy state
  const getFilteredInProcessOrders = () => {
    return branchOrders.filter(o => {
      if (processGroupBy === 'queue') return o.status === OrderStatus.ANTRI;
      if (processGroupBy === 'laundry') return o.status === OrderStatus.DICUCI;
      if (processGroupBy === 'ironing') return o.status === OrderStatus.DISETRIKA_DILIPAT;
      if (processGroupBy === 'packing') return o.status === OrderStatus.DIKEMAS;
      if (processGroupBy === 'ready') return o.status === OrderStatus.SIAP_DIAMBIL;
      if (processGroupBy === 'completed') return o.status === OrderStatus.SELESAI;
      return false;
    }).slice(0).reverse();
  };

  const displayOrders = getFilteredInProcessOrders();

  return (
    <div className="space-y-6 animate-fadeIn" id="menu-content-queue">
      {/* Workflow Orders List tracker section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              Papan Alur Proses Kerja & Siap Ambil
            </h3>
            <p className="text-[10.5px] text-slate-400 font-sans">Semua cucian aktif digabung dalam satu papan proses pengerjaan terintegrasi.</p>
          </div>
          <button
            type="button"
            onClick={handleClearAllActiveQueue}
            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-105 text-red-650 border border-red-205 rounded-xl text-[10px] font-black tracking-tight transition cursor-pointer flex items-center gap-1"
            id="btn-clear-active-queue"
          >
            🗑️ Kosongkan Antrean
          </button>
        </div>

        {/* Combined Process Table & Group Section */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                ⚙️ Proses Kerja & Siap Diambil
              </span>
              <span className="text-[9.5px] text-slate-450 font-mono">Alur: Antrean ➔ Cuci ➔ Setrika/Lipat ➔ Kemas ➔ Siap ➔ Selesai</span>
            </div>

            {/* Sub-group tabs to filter down the queue */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-1 pt-0.5">
              {[
                { key: 'queue', label: '🕒 Antrean', count: branchOrders.filter(o => o.status === OrderStatus.ANTRI).length },
                { key: 'laundry', label: '💦 Laundry (Cuci)', count: branchOrders.filter(o => o.status === OrderStatus.DICUCI).length },
                { key: 'ironing', label: '👔 Setrika/Lipat', count: branchOrders.filter(o => o.status === OrderStatus.DISETRIKA_DILIPAT).length },
                { key: 'packing', label: '📦 Packing (Kemas)', count: branchOrders.filter(o => o.status === OrderStatus.DIKEMAS).length },
                { key: 'ready', label: '✅ Siap Ambil', count: branchOrders.filter(o => o.status === OrderStatus.SIAP_DIAMBIL).length },
                { key: 'completed', label: '🏆 Selesai & Keluar', count: branchOrders.filter(o => o.status === OrderStatus.SELESAI).length },
              ].map(tab => {
                const isSelected = processGroupBy === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setProcessGroupBy(tab.key as any)}
                    className={`text-center flex flex-col items-center justify-center p-1.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold transition-all border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600'
                    }`}
                  >
                    <span className="truncate max-w-full px-0.5">{tab.label}</span>
                    <span className={`mt-0.5 px-1 rounded text-[8.5px] font-black ${
                      isSelected ? 'bg-sky-400 text-slate-905' : 'bg-slate-100 text-slate-500'
                    }`}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Row entries list */}
            <div className="space-y-2 mt-3 p-1 max-h-[380px] overflow-y-auto">
              {displayOrders.length === 0 ? (
                <div className="py-12 bg-white rounded-xl border border-slate-150 p-6 text-center space-y-1.5">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-[11.5px] font-bold text-slate-500">Antrean kosong pada tahap ini.</p>
                  <p className="text-[9.5px] text-slate-400 leading-normal max-w-xs mx-auto">Mulai layani pelanggan di menu "Basket Baru" untuk menambah cucian!</p>
                </div>
              ) : (
                displayOrders.map(o => {
                  let nextStepLabel = '';
                  if (o.status === OrderStatus.ANTRI) nextStepLabel = 'Cuci 💦';
                  else if (o.status === OrderStatus.DICUCI) nextStepLabel = 'Setrika/Lipat 👔';
                  else if (o.status === OrderStatus.DISETRIKA_DILIPAT) nextStepLabel = 'Kemas 📦';
                  else if (o.status === OrderStatus.DIKEMAS) nextStepLabel = 'Siap Ambil ✅';
                  else if (o.status === OrderStatus.SIAP_DIAMBIL) nextStepLabel = 'Serahkan 🎉';

                  return (
                    <div
                      key={o.id}
                      className="bg-white p-3 border border-slate-150 rounded-xl hover:border-sky-305 transition-all shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-2.5"
                    >
                      {/* Invoice & Customer info */}
                      <div className="flex items-start gap-2 min-w-[140px]">
                        <div className="space-y-0.5 shrink-0">
                          <span className="font-mono font-black text-slate-900 text-[11px] bg-slate-100 border border-slate-150 px-1.5 py-0.5 rounded-md block w-fit">
                            {o.invoiceNumber}
                          </span>
                          <span className={`inline-block px-1.5 py-0.25 rounded text-[8px] font-black text-white uppercase tracking-wider ${
                            o.status === OrderStatus.ANTRI ? 'bg-amber-500' :
                            o.status === OrderStatus.DICUCI ? 'bg-sky-500' :
                            o.status === OrderStatus.DISETRIKA_DILIPAT ? 'bg-violet-600' :
                            o.status === OrderStatus.DIKEMAS ? 'bg-fuchsia-500' :
                            o.status === OrderStatus.SIAP_DIAMBIL ? 'bg-teal-600' :
                            'bg-emerald-600'
                          }`}>
                            {o.status === OrderStatus.ANTRI ? '🕒 Antri' :
                             o.status === OrderStatus.DICUCI ? '💦 Cuci' :
                             o.status === OrderStatus.DISETRIKA_DILIPAT ? '👔 Setrika/Lipat' :
                             o.status === OrderStatus.DIKEMAS ? '📦 Kemas' :
                             o.status === OrderStatus.SIAP_DIAMBIL ? '✅ Siap Ambil' : '🏆 Selesai'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{o.customerName}</p>
                          <p className="text-slate-400 font-mono text-[9px] truncate">{o.customerPhone}</p>
                        </div>
                      </div>

                      {/* Service items & Estimation details */}
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[10.5px] text-slate-500 font-bold truncate">
                          {o.items.map(it => `${it.serviceName} (${it.quantity}${it.serviceName.toLowerCase().includes('kilo') ? 'kg' : 'pcs'})`).join(', ')}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-sans">
                          <span className="font-extrabold text-slate-850">Rp {o.totalAmount.toLocaleString()}</span>
                          <span className={`text-[8px] font-extrabold px-1 rounded-full ${
                            o.paymentStatus === 'Lunas' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {o.paymentStatus} ({o.paymentMethod})
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1.5 space-y-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">📥 Masuk:</span>
                            <span className="font-semibold text-slate-700">{new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">⏳ Estimasi:</span>
                            <span className="font-semibold text-slate-700">{new Date(o.estimatedCompletion).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          {o.perfume && (
                            <div className="flex items-center justify-between border-t border-slate-150 pt-0.5 mt-0.5">
                              <span className="text-slate-400">🌸 Parfum:</span>
                              <span className="font-black text-sky-700 uppercase bg-sky-50 px-1.5 rounded text-[8.5px]">{o.perfume}</span>
                            </div>
                          )}
                          {o.notes && (
                            <div className="text-[8.5px] text-slate-500 mt-0.5 leading-relaxed truncate" title={o.notes}>
                              📝 <span className="italic">{o.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Practical actions buttons panel */}
                      <div className="flex items-center gap-1.5 justify-end self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInvoice(o);
                            setShowInvoiceChoiceModal(true);
                          }}
                          className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-800 border border-slate-200 rounded-lg text-[9.5px] font-bold transition shadow-3xs flex items-center gap-1 cursor-pointer"
                        >
                          📄 Receipt
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditOrderModal(o)}
                          className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-150 rounded-lg text-[9.5px] font-bold transition shadow-3xs flex items-center gap-1 cursor-pointer"
                          title="Edit rincian order"
                        >
                          ✏️ Edit
                        </button>

                        {nextStepLabel && (
                          <button
                            type="button"
                            onClick={() => handleTransitionStatus(o.id, o.status)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-lg text-[10px] transition flex items-center gap-1 shadow-3xs cursor-pointer"
                          >
                            <span>Lanjut: {nextStepLabel}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(o.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 rounded-lg text-[9.5px] transition font-bold cursor-pointer"
                          title="Hapus order ini"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selesai & Diserahkan + Canceled sections side panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completed list */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
          <span className="font-extrabold text-[11px] text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            🎉 Selesai & Diserahkan ({branchOrders.filter(o => o.status === OrderStatus.SELESAI).length})
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-[10px]">
            {(() => {
              const compArr = branchOrders.filter(o => o.status === OrderStatus.SELESAI);
              if (compArr.length === 0) return <div className="p-4 text-center text-slate-400 font-bold bg-slate-50/50 rounded-xl">Tidak ada order selesai diserahkan hari ini.</div>;
              return compArr.map(o => (
                <div key={o.id} onClick={() => setShowOrderDetailModal(o)} className="p-2.5 border border-slate-150 hover:border-emerald-300 bg-[#FAFDF9] hover:bg-[#F2FAF0] rounded-xl flex items-center justify-between cursor-pointer transition shadow-3xs">
                  <div>
                    <span className="font-mono font-black text-slate-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[9.5px] border border-emerald-100">{o.invoiceNumber}</span>
                    <p className="font-bold text-slate-700 text-[10px] mt-1">{o.customerName}</p>
                  </div>
                  <div className="text-right flex items-center gap-1.5">
                    <div>
                      <p className="font-black text-slate-800">Rp {o.totalAmount.toLocaleString()}</p>
                      <p className="text-[8.5px] text-slate-450">{o.paymentMethod}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInvoice(o);
                        setShowInvoiceChoiceModal(true);
                      }}
                      className="p-1 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded font-black cursor-pointer text-[9px] text-slate-705 transition shadow-3xs"
                    >
                      📄 Receipt
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Canceled list */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
          <span className="font-extrabold text-[11px] text-rose-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            ❌ Dibatalkan Kasir / Sistem ({branchOrders.filter(o => o.status === OrderStatus.DIBATALKAN).length})
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-[10px]">
            {(() => {
              const cancelArr = branchOrders.filter(o => o.status === OrderStatus.DIBATALKAN);
              if (cancelArr.length === 0) return <div className="p-4 text-center text-slate-400 font-bold bg-slate-50/50 rounded-xl font-sans">Tidak ada order yang dibatalkan.</div>;
              return cancelArr.map(o => (
                <div key={o.id} onClick={() => setShowOrderDetailModal(o)} className="p-2.5 border border-slate-150 hover:border-rose-300 bg-[#FDF9F9] hover:bg-[#FFF5F5] rounded-xl flex items-center justify-between cursor-pointer transition shadow-3xs">
                  <div>
                    <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px] border border-slate-150 line-through">{o.invoiceNumber}</span>
                    <p className="font-bold text-slate-550 text-[10px] mt-1">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-500 line-through">Rp {o.totalAmount.toLocaleString()}</p>
                    <p className="text-[8.5px] font-bold text-red-500 uppercase mt-0.5 font-sans">Batal / Detail ✕</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
