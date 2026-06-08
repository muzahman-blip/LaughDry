/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Search,
  UserPlus,
  Plus,
  Minus,
  ShoppingCart,
  Receipt,
  Printer,
  Share2,
  Trash2,
  CheckCircle,
  Clock,
  QrCode,
  MapPin,
  Camera,
  DollarSign,
  ArrowRight,
  Info,
  Calendar,
  XCircle,
  FileCheck2,
  Phone,
  Bluetooth,
  Gift,
  Award,
  Shirt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LaughDryDatabase } from '../data/mockDatabase';
import { Customer, Service, Order, OrderItem, OrderStatus, Expense, ExpenseCategory, WhatsAppTemplate, Branch, AttendanceRecord } from '../types';
import { CustomerManagement } from './CustomerManagement';
import { ExpenseManagement } from './ExpenseManagement';

interface EmployeeConsoleProps {
  loggedInUser?: any;
  onLogout?: () => void;
}

export default function EmployeeConsole({ loggedInUser, onLogout }: EmployeeConsoleProps = {}) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (loggedInUser) return loggedInUser;
    const users = LaughDryDatabase.getUsers();
    const stored = localStorage.getItem('laughdry_logged_in_cashier');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const match = users.find(u => u.id === parsed.id);
        if (match) return match;
      } catch (e) {}
    }
    return users.find(u => u.role === 'karyawan') || users[1];
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Search, selection, and transaction building states
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Custom item select
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Transfer' | 'Deposit'>('Cash');
  const [paidStatus, setPaidStatus] = useState<'Lunas' | 'Belum Lunas'>('Belum Lunas');

  // Interactive Payment Choice Popup (Cash, Transfer, Deposit)
  const [showPaymentChoiceModal, setShowPaymentChoiceModal] = useState(false);

  // Pop-up input untuk jumlah pakaian saat transisi ke proses Cuci (Dicuci)
  const [washTransitionOrderId, setWashTransitionOrderId] = useState<string | null>(null);
  const [washTransitionCurrentStatus, setWashTransitionCurrentStatus] = useState<OrderStatus | null>(null);
  const [showWashInputModal, setShowWashInputModal] = useState(false);
  const [washClothesCountInput, setWashClothesCountInput] = useState<string>('');

  // Post-submit Choice Popup (print / send WA)
  const [showInvoiceChoiceModal, setShowInvoiceChoiceModal] = useState(false);
  const [showThermalReceiptModal, setShowThermalReceiptModal] = useState(false);
  const [isAutoPrintEnabled, setIsAutoPrintEnabled] = useState<boolean>(() => {
    return localStorage.getItem('laughdry_autoprint_enabled') !== 'false';
  });

  // New Customer Profile Form
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // Deposit Top Up Form
  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);

  // Status order filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Operational Process Queue granular filters
  const [processGroupBy, setProcessGroupBy] = useState<'queue' | 'laundry' | 'ironing' | 'packing' | 'ready' | 'completed'>('queue');
  
  // Modals / Dialog states
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState<Order | null>(null);

  // --- STATE-STATE ENHANCEMENT ATTENDANCE (CAMERA & RECONCILIATION) ---
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [attendanceMode, setAttendanceMode] = useState<'checkin' | 'checkout'>('checkin');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedCoordinates, setCapturedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [gpsStatusText, setGpsStatusText] = useState<string>('Mendeteksi GPS...');
  const [startingCashBalanceInput, setStartingCashBalanceInput] = useState<string>('200000');
  const [endingCashDrawerInputVal, setEndingCashDrawerInputVal] = useState<string>('');
  const [expectedCashDrawerValue, setExpectedCashDrawerValue] = useState<number>(0);
  const [reconciliationVariance, setReconciliationVariance] = useState<number>(0);
  const [reconciliationNotesVal, setReconciliationNotesVal] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showStampCardModal, setShowStampCardModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBluetoothPrint, setShowBluetoothPrint] = useState(false);
  const [showScannerSim, setShowScannerSim] = useState(false);
  const [scannerInput, setScannerInput] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paymentTransitionOrderId, setPaymentTransitionOrderId] = useState<string | null>(null);
  const [showPaymentPopUp, setShowPaymentPopUp] = useState(false);
  const [confirmPaymentMethodName, setConfirmPaymentMethodName] = useState<string | null>(null);
  const [kiloanWeightModalService, setKiloanWeightModalService] = useState<Service | null>(null);
  const [kiloanWeightInputText, setKiloanWeightInputText] = useState<string>("3.0");

  // New Catalog Service details and real-time Midtrans QRIS status tracking states
  const [selectedCatalogService, setSelectedCatalogService] = useState<Service | null>(null);
  const [activeServiceGroupName, setActiveServiceGroupName] = useState<string | null>(null);
  const [midtransQrCodeUrl, setMidtransQrCodeUrl] = useState<string | null>(null);
  const [midtransTransactionId, setMidtransTransactionId] = useState<string | null>(null);
  const [midtransStatus, setMidtransStatus] = useState<'idle' | 'generating' | 'pending' | 'settlement' | 'expired'>('idle');
  const [midtransTimerSec, setMidtransTimerSec] = useState<number>(0);

  // Perfume option state
  const [perfumeSelection, setPerfumeSelection] = useState<'floral' | 'fresh' | 'sweet' | 'woody'>('floral');

  // NEW: Custom Entry and Completion date picker state variables
  const toDateTimeLocalString = (date: Date): string => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  };

  const [customEntryDate, setCustomEntryDate] = useState<string>('');
  const [customCompletionDate, setCustomCompletionDate] = useState<string>('');
  const [isLoyaltyRedeemed, setIsLoyaltyRedeemed] = useState<boolean>(false);

  // Automatically reset customEntryDate / customCompletionDate on items change
  useEffect(() => {
    if (cartItems.length > 0) {
      if (!customEntryDate) {
        setCustomEntryDate(toDateTimeLocalString(new Date()));
      }
    } else {
      setCustomEntryDate('');
      setCustomCompletionDate('');
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (customEntryDate) {
      const entryDateObj = new Date(customEntryDate);
      const maxEstHours = cartItems.reduce((max, item) => {
        const srvCheck = services.find(s => s.id === item.serviceId);
        return Math.max(max, srvCheck ? srvCheck.estimateHours : 48);
      }, 48);
      
      // Calculate completion date: Tanggal Masuk + estimated max hours
      const completionDateObj = new Date(entryDateObj.getTime() + maxEstHours * 3600000);
      setCustomCompletionDate(toDateTimeLocalString(completionDateObj));
    }
  }, [customEntryDate, cartItems]);

  // NEW: Loyalty Point redemption for free 3kg wash
  const handleRedeemLoyalty = () => {
    if (!selectedCustomer) {
      alert("Harap pilih pelanggan terlebih dahulu untuk mengklaim poin loyalitas!");
      return;
    }
    if (selectedCustomer.loyaltyPoints < 10) {
      alert(`Poin stamp belum mencukupi! Butuh minimal 10 stamp (Poin Stamp saat ini: ${selectedCustomer.loyaltyPoints}).`);
      return;
    }

    let kiloanItem = cartItems.find(it => {
      const srvCheck = services.find(s => s.id === it.serviceId);
      return srvCheck && srvCheck.category === 'kiloan';
    });

    if (!kiloanItem) {
      const defaultKiloanService = services.find(s => s.category === 'kiloan');
      if (!defaultKiloanService) {
        alert("Tidak ada layanan kategori kiloan reguler yang tersedia di sistem untuk ditukarkan!");
        return;
      }
      
      const formattedName = defaultKiloanService.category === 'kiloan'
        ? `${defaultKiloanService.name}-${defaultKiloanService.promiseName || 'Reguler'}`
        : `${defaultKiloanService.name}-${defaultKiloanService.promiseName || 'Sedang'}`;

      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        serviceId: defaultKiloanService.id,
        serviceName: formattedName,
        price: defaultKiloanService.price,
        quantity: 3.0,
        subtotal: parseFloat((3.0 * defaultKiloanService.price).toFixed(2))
      };
      
      const newCart = [...cartItems, newItem];
      setCartItems(newCart);
      kiloanItem = newItem;
    }

    setIsLoyaltyRedeemed(true);
    showToast("🎉 Klaim Poin Sukses! Gratis Cuci 3KG setara Rp " + (kiloanItem.price * 3).toLocaleString() + " telah diterapkan.");
    setShowStampCardModal(false);
  };

  // Catalog filter by category tab (Kiloan / Satuan)
  const [serviceCategoryTab, setServiceCategoryTab] = useState<'all' | 'kiloan' | 'satuan'>('kiloan');

  // Edit in-progress order states
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingOrderPerfume, setEditingOrderPerfume] = useState<'floral' | 'fresh' | 'sweet' | 'woody'>('floral');
  const [editingOrderNotes, setEditingOrderNotes] = useState('');
  const [editingOrderItemsQty, setEditingOrderItemsQty] = useState<{[itemId: string]: number}>({});
  const [editingOrderItems, setEditingOrderItems] = useState<OrderItem[]>([]);
  const [settings, setSettings] = useState<any>(LaughDryDatabase.getSettings());

  // Delete & Transition Confirm Modals
  const [showDeleteConfirmOrderModal, setShowDeleteConfirmOrderModal] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [readyOrderToNotify, setReadyOrderToNotify] = useState<Order | null>(null);

  // 5 Menu POS Navigation State
  const [activeMenuTab, setActiveMenuTab] = useState<'input_transaksi' | 'antrean_cucian' | 'manajemen_pelanggan' | 'input_pengeluaran' | 'absensi_harian'>('input_transaksi');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // Haversine formula to compute distance in meters between two geolocations
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
  };

  const calculateExpectedCashBalanceForShift = () => {
    const records = LaughDryDatabase.getAttendance();
    const active = records.find(r => r.userId === currentUser.id && r.status === 'Hadir');
    if (!active) {
      setExpectedCashDrawerValue(0);
      setReconciliationVariance(0);
      return;
    }
    
    const checkInTime = new Date(active.checkIn);
    const startingCash = active.startingCashDrawer || 0;
    
    // Fetch Cash orders made by this cashier since checkIn
    const filteredOrders = orders.filter(o => 
      o.branchId === currentUser.branchId &&
      o.createdAt &&
      new Date(o.createdAt) >= checkInTime &&
      o.paymentMethod === 'Cash' &&
      o.paymentStatus === 'Lunas'
    );
    const totalCashRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Subtract all expenses recorded by this cashier in this branch since checkIn
    const filteredExpenses = expenses.filter(e => 
      e.branchId === currentUser.branchId &&
      e.date &&
      new Date(e.date) >= checkInTime
    );
    const totalCashExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const expectedValue = startingCash + totalCashRevenue - totalCashExpenses;
    setExpectedCashDrawerValue(expectedValue);
    
    // Recalculate variance with current ending cash input
    const endingCash = parseFloat(endingCashDrawerInputVal) || 0;
    setReconciliationVariance(endingCash - expectedValue);
  };

  const startCameraStream = async () => {
    try {
      setCameraPermissionGranted(null);
      const constraints = {
        video: { facingMode: 'user', width: 400, height: 300 }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setCameraPermissionGranted(true);
      
      // Assign stream to video tag
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.warn("Kamera tidak dapat diakses (Melanjutkan lewat simulasi selfie default):", err);
      setCameraPermissionGranted(false);
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const captureSelfieSnapshot = () => {
    if (videoRef.current && cameraStream) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 400, 300);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedPhotoUrl(dataUrl);
          stopCameraStream();
          showToast("📸 Foto selfie wajah berhasil terekam!");
        }
      } catch (err) {
        console.error("Gagal capture via canvas, fallback ke simulasi:", err);
        triggerMockSelfie();
      }
    } else {
      triggerMockSelfie();
    }
  };

  const triggerMockSelfie = () => {
    const mockPhotos = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", 
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", 
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
    ];
    const idx = currentUser.name.charCodeAt(0) % mockPhotos.length;
    setCapturedPhotoUrl(mockPhotos[idx]);
    stopCameraStream();
    showToast("📸 Selfie Presensi berhasil disimulasikan!");
  };

  const initiateAttendanceFlow = (mode: 'checkin' | 'checkout') => {
    setAttendanceMode(mode);
    setCapturedPhotoUrl(null);
    setCapturedCoordinates(null);
    setGpsDistance(null);
    setGpsStatusText('Mengambil koordinat GPS Anda...');
    
    if (mode === 'checkout') {
      setEndingCashDrawerInputVal('');
      setReconciliationNotesVal('');
      // We will calculate Expected Cash live in a hook or right away
      setTimeout(() => calculateExpectedCashBalanceForShift(), 100);
    } else {
      setStartingCashBalanceInput('200000');
    }
    
    setShowAttendanceModal(true);
    
    // GPS Geolocation Query
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCapturedCoordinates({ lat, lng });
          
          const curBranches = LaughDryDatabase.getBranches();
          const branchObj = curBranches.find(b => b.id === currentUser.branchId);
          if (branchObj && branchObj.latitude && branchObj.longitude) {
            const distance = getDistanceFromLatLonInMeters(
              lat, 
              lng, 
              branchObj.latitude, 
              branchObj.longitude
            );
            setGpsDistance(distance);
            if (distance <= 150) {
              setGpsStatusText(`✅ GPS Terverifikasi: Di dalam radius cabang (${Math.round(distance)}m dari outlet)`);
            } else {
              setGpsStatusText(`⚠️ Perhatian: Anda berada di luar radius cabang (${Math.round(distance)}m). Diperlukan konfirmasi.`);
            }
          } else {
            setGpsStatusText(`ℹ️ Lokasi GPS Anda: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Cabang belum mengaktifkan geofencing koordinat)`);
          }
        },
        (error) => {
          console.warn("Gagal deteksi GPS, fallback ke simulasi:", error);
          const curBranches = LaughDryDatabase.getBranches();
          const branchObj = curBranches.find(b => b.id === currentUser.branchId);
          if (branchObj && branchObj.latitude && branchObj.longitude) {
            setCapturedCoordinates({ lat: branchObj.latitude, lng: branchObj.longitude });
            setGpsDistance(0);
            setGpsStatusText(`✅ GPS Disimulasikan: ${branchObj.latitude.toFixed(6)}, ${branchObj.longitude.toFixed(6)} (Auto-cocok Cabang)`);
          } else {
            setCapturedCoordinates({ lat: -6.273, lng: 106.726 });
            setGpsStatusText(`ℹ️ GPS Disimulasikan (Mock): -6.27300, 106.72600`);
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsStatusText("❌ Geolocation dilarang peramban. Menggunakan koordinat cabang.");
      const curBranches = LaughDryDatabase.getBranches();
      const branchObj = curBranches.find(b => b.id === currentUser.branchId);
      if (branchObj && branchObj.latitude && branchObj.longitude) {
        setCapturedCoordinates({ lat: branchObj.latitude, lng: branchObj.longitude });
      } else {
        setCapturedCoordinates({ lat: -6.273, lng: 106.726 });
      }
    }
    
    startCameraStream();
  };

  const handleCheckIn = () => {
    const records = LaughDryDatabase.getAttendance();
    const active = records.find(r => r.userId === currentUser.id && r.status === 'Hadir');
    if (active) {
      showToast("⚠️ Anda terdeteksi sudah Check-In! Silakan Check-Out terlebih dahulu.");
      return;
    }
    initiateAttendanceFlow('checkin');
  };

  const handleCheckOut = () => {
    const records = LaughDryDatabase.getAttendance();
    const activeIndex = records.findIndex(r => r.userId === currentUser.id && r.status === 'Hadir');
    if (activeIndex === -1) {
      showToast("⚠️ Tidak menemukan riwayat Check-In aktif Anda!");
      return;
    }
    initiateAttendanceFlow('checkout');
  };

  const executeSubmitAttendance = () => {
    if (!capturedPhotoUrl) {
      showToast("⚠️ Silakan ambil foto selfie wajah terlebih dahulu!");
      return;
    }

    if (attendanceMode === 'checkin') {
      const startCash = parseFloat(startingCashBalanceInput);
      if (isNaN(startCash) || startCash < 0) {
        showToast("⚠️ Saldo awal kas kasir harus berupa angka positif!");
        return;
      }
      
      const records = LaughDryDatabase.getAttendance();
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        branchId: currentUser.branchId || 'br-1',
        checkIn: new Date().toISOString(),
        status: 'Hadir',
        notes: attendanceNotes || 'Check-in Shift Kerja Baru',
        latLong: capturedCoordinates ? `${capturedCoordinates.lat.toFixed(6)}, ${capturedCoordinates.lng.toFixed(6)}` : '-6.255, 106.715',
        photoUrl: capturedPhotoUrl,
        startingCashDrawer: startCash
      };
      
      const updated = [newRecord, ...records];
      LaughDryDatabase.saveAttendance(updated);
      setAttendanceRecords(updated);
      setAttendanceNotes('');
      setShowAttendanceModal(false);
      showToast("🟢 Check-In Harian dengan Selfie & GPS Berhasil!");
      LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'Check-In', `Kasir melakukan check-in selfie di cabang ${currentUser.branchId || 'br-1'} dengan kas drawer awal: Rp ${startCash.toLocaleString('id-ID')}`);
    } else {
      const endCash = parseFloat(endingCashDrawerInputVal);
      if (isNaN(endCash) || endCash < 0) {
        showToast("⚠️ Nominal fisik uang tunai di laci harus berupa angka positif!");
        return;
      }
      
      const records = LaughDryDatabase.getAttendance();
      const activeIdx = records.findIndex(r => r.userId === currentUser.id && r.status === 'Hadir');
      if (activeIdx === -1) {
        showToast("⚠️ Tidak menemukan riwayat Check-In aktif Anda!");
        return;
      }
      
      const activeRecord = records[activeIdx];
      const checkOutTime = new Date();
      const durationMinutes = Math.round((checkOutTime.getTime() - new Date(activeRecord.checkIn).getTime()) / 60000);
      const variance = endCash - expectedCashDrawerValue;
      
      if (variance !== 0 && !reconciliationNotesVal.trim()) {
        showToast("⚠️ Terdeteksi selisih keuangan kasir! Silakan tulis alasan/keterangan selisih pada kolom catatan.");
        return;
      }
      
      const updatedRecord: AttendanceRecord = {
        ...activeRecord,
        checkOut: checkOutTime.toISOString(),
        workDuration: durationMinutes,
        status: 'Selesai',
        photoUrl: capturedPhotoUrl,
        endingCashDrawerInput: endCash,
        expectedCashBalance: expectedCashDrawerValue,
        cashDifference: variance,
        reconciliationNotes: reconciliationNotesVal,
        notes: attendanceNotes ? `${activeRecord.notes} | Checkout notes: ${attendanceNotes}` : activeRecord.notes
      };
      
      const updated = [...records];
      updated[activeIdx] = updatedRecord;
      
      LaughDryDatabase.saveAttendance(updated);
      setAttendanceRecords(updated);
      setAttendanceNotes('');
      setShowAttendanceModal(false);
      
      if (variance === 0) {
        alert(`🔴 CHECK-OUT SHIFT SUKSES!\n\n📋 Hasil Cash Reconciliation:\n👍 Keuangan COCOK (0 Selisih)!\n• Cash Drawer Fisik: Rp ${endCash.toLocaleString('id-ID')}\n• Cash Buku Sistem: Rp ${expectedCashDrawerValue.toLocaleString('id-ID')}\n• Durasi Kerja Shift: ${durationMinutes} menit.\n\nSelamat beristirahat!`);
      } else {
        const type = variance > 0 ? "SURPLUS" : "DEFISIT / KURANG";
        alert(`⚠️ ATTENTION: CHECK-OUT SELESAI DENGAN SELISIH KEUANGAN!\n\n📋 Hasil Cash Reconciliation:\n• Status: Terjadi SELISIH (${type})!\n• Nominal Selisih: Rp ${variance.toLocaleString('id-ID')}\n• Cash Drawer Fisik: Rp ${endCash.toLocaleString('id-ID')}\n• Cash Buku Sistem: Rp ${expectedCashDrawerValue.toLocaleString('id-ID')}\n• Catatan Kasir: ${reconciliationNotesVal}\n\nLaporan rekonsiliasi kas terekam permanen dan telah di-submit ke Owner.`);
      }
      
      LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'Check-Out', `Kasir check-out selfie. Rekonsiliasi Kas: Fisik=Rp ${endCash}, Sistem=Rp ${expectedCashDrawerValue}, Selisih=Rp ${variance}`);
    }
    
    stopCameraStream();
  };
  
  // Discount states
  const [manualDiscountVal, setManualDiscountVal] = useState<number>(0);
  const [manualDiscountType, setManualDiscountType] = useState<'percentage' | 'nominal'>('nominal');
  const [carrierBagDiscountChecked, setCarrierBagDiscountChecked] = useState<boolean>(false);

  // Customer Management active dialog / states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerModalForm, setCustomerModalForm] = useState({ name: '', phone: '', address: '' });
  const [topUpCustomer, setTopUpCustomer] = useState<Customer | null>(null);
  const [topUpModalAmount, setTopUpModalAmount] = useState<string>('');

  // Expenses management state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'Lainnya' as ExpenseCategory,
    amount: ''
  });

  useEffect(() => {
    loadDB();
  }, []);

  const loadDB = () => {
    setCustomers(LaughDryDatabase.getCustomers());
    setServices(LaughDryDatabase.getServices().filter(s => s.isActive));
    setOrders(LaughDryDatabase.getOrders());
    setBranches(LaughDryDatabase.getBranches());
    setExpenses(LaughDryDatabase.getExpenses());
    setSettings(LaughDryDatabase.getSettings());
    setAttendanceRecords(LaughDryDatabase.getAttendance());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBluetoothConnect = async () => {
    showToast("⚙️ Mengalihkan ke pengaturan Bluetooth HP...");
    
    // Web Bluetooth API attempt
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true
        });
      } catch (err) {
        console.log("Web Bluetooth request cancelled or unsupported", err);
      }
    }
    
    // Redirect to Android bluetooth settings intent scheme
    try {
      window.open("intent://#Intent;action=android.settings.BLUETOOTH_SETTINGS;end", "_blank");
    } catch (e) {
      try {
        window.location.href = "intent://#Intent;action=android.settings.BLUETOOTH_SETTINGS;end";
      } catch (e2) {}
    }
    
    // Open instructions modal as fallback/guidance
    setShowBluetoothPrint(true);
  };

  const redirectToWhatsApp = (order: Order) => {
    const textContent = getSimulatedMessageBody(order.status === OrderStatus.SIAP_DIAMBIL ? 'siap_diambil' : 'nota_layanan', order);
    const encodedText = encodeURIComponent(textContent);
    // Remove non-digit characters from customer phone
    let cleanPhone = order.customerPhone.replace(/\D/g, '');
    
    // Convert local zero-prefixed Indonesian number to standard international 62
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    }
    
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  // Filter customers by input search
  const filteredCustomers = customers.filter(c =>
    (c.name && c.name.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (c.phone && c.phone.includes(customerSearch))
  );

  const selectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    setSelectedCustomer(cust);
    setCustomerSearch('');
    setIsLoyaltyRedeemed(false);
  };

  // Add customer submit
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) {
      alert("Lengkapi nama dan nomor telepon pelanggan!");
      return;
    }

    const exists = customers.find(c => c.phone === customerForm.phone);
    if (exists) {
      alert("Nomor telepon ini sudah terdaftar!");
      return;
    }

    const currentCusts = [...customers];
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: customerForm.name,
      phone: customerForm.phone,
      address: customerForm.address,
      depositBalance: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    currentCusts.push(newCust);
    LaughDryDatabase.saveCustomers(currentCusts);
    setCustomers(currentCusts);
    setSelectedCustomerId(newCust.id);
    setSelectedCustomer(newCust);
    setShowAddCustomer(false);
    setCustomerForm({ name: '', phone: '', address: '' });
    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'CUSTOMER_CREATE', `Mendaftarkan pelanggan baru ${newCust.name} (${newCust.phone})`);
    showToast("Pelanggan baru berhasil didaftarkan!");
  };

  // Top up deposit simulation
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || topUpAmount <= 0) return;

    const currentCusts = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          depositBalance: c.depositBalance + Number(topUpAmount),
          lastActive: new Date().toISOString()
        };
      }
      return c;
    });

    LaughDryDatabase.saveCustomers(currentCusts);
    setCustomers(currentCusts);

    // Mutation
    const mutations = LaughDryDatabase.getDeposits();
    const newMutation = {
      id: `mut-${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      type: 'top_up' as 'top_up',
      amount: Number(topUpAmount),
      balanceAfter: selectedCustomer.depositBalance + Number(topUpAmount),
      date: new Date().toISOString()
    };
    LaughDryDatabase.saveDeposits([newMutation, ...mutations]);

    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'DEPOSIT_TOP_UP', `Melakukan Top Up Deposit ${selectedCustomer.name} sebesar Rp ${topUpAmount.toLocaleString()}`);

    setSelectedCustomer({
      ...selectedCustomer,
      depositBalance: selectedCustomer.depositBalance + Number(topUpAmount)
    });
    setShowTopUpForm(false);
    setTopUpAmount(0);
    showToast(`Deposit berhasil di Top-Up sebesar Rp ${Number(topUpAmount).toLocaleString()}!`);
  };

  // Cart operations
  const addToCart = (service: Service, predeterminedQty?: number) => {
    const isKiloan = service.category === 'kiloan';
    let inputQty = 1;

    if (isKiloan) {
      if (predeterminedQty === undefined) {
        // Open custom non-blocking modal to safely enter kiloan weight
        setKiloanWeightInputText("3.0");
        setKiloanWeightModalService(service);
        return;
      }
      inputQty = predeterminedQty;
    }

    const billingQty = isKiloan ? Math.max(inputQty, 3.0) : inputQty;
    
    const existing = cartItems.find(item => item.serviceId === service.id);
    if (existing) {
      const newWeight = existing.quantity + inputQty;
      const billingWeight = isKiloan ? Math.max(newWeight, 3.0) : newWeight;
      const updated = cartItems.map(item =>
        item.serviceId === service.id
          ? { 
              ...item, 
              quantity: parseFloat(newWeight.toFixed(2)), 
              subtotal: parseFloat((billingWeight * item.price).toFixed(2)) 
            }
          : item
      );
      setCartItems(updated);
      if (isKiloan && newWeight < 3.0) {
        showToast(`Berat diakumulasi menjadi ${newWeight.toFixed(2)} kg. Masuk minimal berat 3.0 kg.`);
      } else {
        showToast(`Layanan [${service.name}] diperbarui di keranjang.`);
      }
    } else {
      const formattedName = service.category === 'kiloan'
        ? `${service.name}-${service.promiseName || 'Reguler'}`
        : `${service.name}-${service.promiseName || 'Sedang'}`;

      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        serviceId: service.id,
        serviceName: formattedName,
        price: service.price,
        quantity: parseFloat(inputQty.toFixed(2)),
        subtotal: parseFloat((billingQty * service.price).toFixed(2))
      };
      setCartItems([...cartItems, newItem]);
      if (isKiloan && inputQty < 3.0) {
        showToast(`⚠️ Berat ${inputQty} kg < 3 kg. Sistem otomatis menetapkan minimal berat 3.0 kg.`);
      } else {
        showToast(`[${service.name}] berhasil ditambahkan.`);
      }
    }
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
      return;
    }
    const item = cartItems.find(it => it.id === id);
    if (!item) return;

    const srv = services.find(s => s.id === item.serviceId);
    const isKiloan = srv ? srv.category === 'kiloan' : false;
    const billingQty = isKiloan ? Math.max(qty, 3.0) : qty;

    const updated = cartItems.map(it =>
      it.id === id 
        ? { 
            ...it, 
            quantity: parseFloat(qty.toFixed(2)), 
            subtotal: parseFloat((billingQty * it.price).toFixed(2)) 
          } 
        : it
    );
    setCartItems(updated);
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Transaction Total Calculator with discount rules
  const cartSubtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const manualDiscountAmount = manualDiscountType === 'percentage' 
    ? (cartSubtotal * (Number(manualDiscountVal) || 0) / 100) 
    : (Number(manualDiscountVal) || 0);
  const carrierBagDiscountAmount = carrierBagDiscountChecked 
    ? (cartSubtotal * 0.05) 
    : 0;

  // Find first laundry kiloan item in cart to apply the Free 3KG wash
  const firstKiloanItemInCart = cartItems.find(it => {
    const srvCheck = services.find(s => s.id === it.serviceId);
    return srvCheck && srvCheck.category === 'kiloan';
  });

  const loyaltyDiscountAmount = (isLoyaltyRedeemed && firstKiloanItemInCart)
    ? (firstKiloanItemInCart.price * 3)
    : 0;

  const totalDiscountAmount = manualDiscountAmount + carrierBagDiscountAmount + loyaltyDiscountAmount;
  const totalCartAmount = Math.max(cartSubtotal - totalDiscountAmount, 0);

  // Complete Order Checkout
  const checkoutOrder = () => {
    if (!selectedCustomer) {
      alert("Harap pilih atau daftar pelanggan terlebih dahulu!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Keranjang belanja masih kosong!");
      return;
    }

    // If payment method is deposit, verify limits
    if (paymentMethod === 'Deposit' && selectedCustomer.depositBalance < totalCartAmount) {
      alert(`Saldo deposit pelanggan tidak cukup! Saldo saat ini: Rp ${selectedCustomer.depositBalance.toLocaleString()}`);
      return;
    }

    // Calculate completion estimated date based on service max estimation hours or custom date picker choices
    const entryDate = customEntryDate ? new Date(customEntryDate) : new Date();
    const maxEstHours = cartItems.reduce((max, item) => {
      const srvMock = services.find(s => s.id === item.serviceId);
      return Math.max(max, srvMock ? srvMock.estimateHours : 48);
    }, 48);

    const completionDate = customCompletionDate 
      ? new Date(customCompletionDate) 
      : new Date(entryDate.getTime() + maxEstHours * 3600000);

    // Loyalty point earnings calculater (1 transaction = 1 loyalty point)
    const earnedPoints = 1;

    const invoiceNum = `LK-${orders.length + 1}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      branchId: currentUser.branchId, // Rian's active branch
      items: cartItems,
      totalAmount: totalCartAmount,
      paymentMethod,
      paymentStatus: (paymentMethod === 'Deposit' || paidStatus === 'Lunas') ? 'Lunas' : 'Belum Lunas',
      status: OrderStatus.ANTRI,
      notes,
      perfume: perfumeSelection,
      createdAt: entryDate.toISOString(),
      updatedAt: entryDate.toISOString(),
      estimatedCompletion: completionDate.toISOString(),
      pointsEarned: earnedPoints,
      cashierId: currentUser.id,
      cashierName: currentUser.name
    };

    // Save and Deduct Deposit balance if paymentMethod === Deposit
    const updatedCustomers = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        let depositVal = c.depositBalance;
        if (paymentMethod === 'Deposit') {
          depositVal -= totalCartAmount;
        }
        return {
          ...c,
          depositBalance: depositVal,
          loyaltyPoints: Math.max(0, c.loyaltyPoints - (isLoyaltyRedeemed ? 10 : 0) + earnedPoints),
          lastActive: new Date().toISOString()
        };
      }
      return c;
    });

    LaughDryDatabase.saveCustomers(updatedCustomers);
    setCustomers(updatedCustomers);

    if (paymentMethod === 'Deposit') {
      const activeMutations = LaughDryDatabase.getDeposits();
      const usageMut = {
        id: `mut-${Date.now()}`,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        type: 'use' as 'use',
        amount: totalCartAmount,
        balanceAfter: selectedCustomer.depositBalance - totalCartAmount,
        date: new Date().toISOString(),
        invoiceReference: invoiceNum
      };
      LaughDryDatabase.saveDeposits([usageMut, ...activeMutations]);
    }

    // Save Order List
    const activeOrders = [...orders, newOrder];
    LaughDryDatabase.saveOrders(activeOrders);
    setOrders(activeOrders);

    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'ORDER_CREATE', `Membuat transaksi kasir ${invoiceNum} sebesar Rp ${totalCartAmount.toLocaleString()} via ${paymentMethod}`);

    // Set Active invoice for printer / whatsapp receipt modals
    setActiveInvoice(newOrder);
    if (isAutoPrintEnabled) {
      setShowThermalReceiptModal(true);
      setShowInvoiceChoiceModal(false);
      showToast(`🖨️ [AUTO-PRINT] Mengirim ${invoiceNum} ke printer termal POS-58 mm!`);
    } else {
      setShowInvoiceChoiceModal(true);
    }

    // Reset Form Input
    setCartItems([]);
    setNotes('');
    setManualDiscountVal(0);
    setManualDiscountType('nominal');
    setCarrierBagDiscountChecked(false);
    setIsLoyaltyRedeemed(false);
    setSelectedCustomer(updatedCustomers.find(c => c.id === selectedCustomer.id) || null);
    loadDB();
    showToast(`Order ${invoiceNum} Sukses Terrekam!`);
  };

  // Midtrans Dynamic QRIS Payment generator & status tracker
  const midtransPollingRef = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (midtransPollingRef.current) {
        clearInterval(midtransPollingRef.current);
      }
    };
  }, []);

  const generateMidtransQRIS = async () => {
    if (midtransPollingRef.current) {
      clearInterval(midtransPollingRef.current);
    }

    setMidtransStatus('generating');
    setMidtransQrCodeUrl(null);
    setMidtransTransactionId(null);
    
    // Total Amount must be positive
    const amountToCharge = totalCartAmount;

    try {
      const parentOrderId = `LD-${Date.now()}`;
      const res = await fetch('/api/midtrans/qris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: parentOrderId,
          amount: amountToCharge,
          customerName: selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum',
          customerEmail: selectedCustomer?.phone ? `${selectedCustomer.phone}@example.com` : 'laundry.user@example.com'
        })
      });

      const responseData = await res.json();
      if (responseData.success) {
        setMidtransQrCodeUrl(responseData.qrCodeUrl);
        setMidtransTransactionId(responseData.orderId);
        setMidtransStatus('pending');

        // Silently use the alternative fallback channel if setup keys are missing, as requested for production clean release.

        const intervalId = setInterval(async () => {
          try {
            const cleanUrl = `/api/midtrans/status/${responseData.orderId}`;
            const checkRes = await fetch(cleanUrl);
            const checkData = await checkRes.json();
            
            if (checkData.isPaid) {
              setMidtransStatus('settlement');
              setPaymentMethod('Transfer');
              setPaidStatus('Lunas');
              showToast("🟢 Pembayaran QRIS Berhasil Terverifikasi Otomatis!");
              
              clearInterval(intervalId);
              midtransPollingRef.current = null;
              
              setTimeout(() => {
                setShowPaymentChoiceModal(false);
                setMidtransStatus('idle');
              }, 2000);
            }
          } catch (stErr) {
            console.error("Error polling payment status from custom server:", stErr);
          }
        }, 2200);

        midtransPollingRef.current = intervalId;
      } else {
        throw new Error(responseData.message || "Endpoint error");
      }
    } catch (apiError: any) {
      console.error(apiError);
      setMidtransStatus('idle');
      showToast(`❌ Gagal terhubung ke modul Midtrans: ${apiError.message || apiError}`);
    }
  };

  // Status transition handler
  const handleTransitionStatus = (orderId: string, currentStatus: OrderStatus) => {
    // Default standard laundry workflow transitions:
    let statuses: OrderStatus[] = [
      OrderStatus.ANTRI,
      OrderStatus.DICUCI,
      OrderStatus.DISETRIKA_DILIPAT,
      OrderStatus.DIKEMAS,
      OrderStatus.SIAP_DIAMBIL,
      OrderStatus.SELESAI
    ];

    // Check if the order has custom workflow steps defined on its primary service
    const orderObj = orders.find(o => o.id === orderId);
    if (orderObj && orderObj.items.length > 0) {
      const primaryItem = orderObj.items[0];
      const databaseServices = LaughDryDatabase.getServices();
      const associatedService = databaseServices.find(s => s.id === primaryItem.serviceId || s.name === primaryItem.serviceName);
      if (associatedService && associatedService.workflowSteps && associatedService.workflowSteps.length > 0) {
        statuses = associatedService.workflowSteps as OrderStatus[];
      }
    }

    const curIdx = statuses.indexOf(currentStatus);
    let nextStatus: OrderStatus | null = null;
    
    if (curIdx === -1 || curIdx === statuses.length - 1) {
      // Fallback: If not found in custom steps, try standard statuses
      const fallbackStatuses = [
        OrderStatus.ANTRI,
        OrderStatus.DICUCI,
        OrderStatus.DISETRIKA_DILIPAT,
        OrderStatus.DIKEMAS,
        OrderStatus.SIAP_DIAMBIL,
        OrderStatus.SELESAI
      ];
      const fbIdx = fallbackStatuses.indexOf(currentStatus);
      if (fbIdx !== -1 && fbIdx < fallbackStatuses.length - 1) {
        nextStatus = fallbackStatuses[fbIdx + 1];
      }
    } else {
      nextStatus = statuses[curIdx + 1];
    }

    if (!nextStatus) return;

    // INTERCEPT transition to Dicuci (proses cuci) to prompt for clothes count!
    if (nextStatus === OrderStatus.DICUCI) {
      setWashTransitionOrderId(orderId);
      setWashTransitionCurrentStatus(currentStatus);
      setWashClothesCountInput(orderObj?.clothesCount?.toString() || '');
      setShowWashInputModal(true);
      return;
    }

    if (nextStatus === OrderStatus.SELESAI) {
      setPaymentTransitionOrderId(orderId);
      setShowPaymentPopUp(true);
      return;
    }
    
    updateOrderStatus(orderId, nextStatus, currentStatus);
  };

  const submitWashTransitionWithClothes = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(washClothesCountInput, 10);
    if (isNaN(count) || count <= 0) {
      showToast("⚠️ Jumlah pakaian harus berupa angka dan lebih dari 0!");
      return;
    }

    if (!washTransitionOrderId || !washTransitionCurrentStatus) return;
    
    const currentOrders = orders.map(o => {
      if (o.id === washTransitionOrderId) {
        return {
          ...o,
          clothesCount: count,
          status: OrderStatus.DICUCI,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    LaughDryDatabase.saveOrders(currentOrders);
    setOrders(currentOrders);
    LaughDryDatabase.logActivity(
      currentUser.id, 
      currentUser.name, 
      currentUser.role, 
      'STATUS_TRANSITION', 
      `Mengubah status order ord-${washTransitionOrderId.substring(4)} dari [${washTransitionCurrentStatus}] ke [Dicuci] dengan pencatatan jumlah pakaian: ${count} pcs`
    );
    loadDB();
    showToast(`Status Order berhasil diubah ke [Dicuci] (Jumlah: ${count} pcs)`);

    // Reset transition states
    setShowWashInputModal(false);
    setWashTransitionOrderId(null);
    setWashTransitionCurrentStatus(null);
    setWashClothesCountInput('');
  };

  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus, currentStatus: OrderStatus) => {
    const currentOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          completedAt: nextStatus === OrderStatus.SELESAI ? new Date().toISOString() : undefined
        };
      }
      return o;
    });

    LaughDryDatabase.saveOrders(currentOrders);
    setOrders(currentOrders);
    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'STATUS_TRANSITION', `Mengubah status order ord-${orderId.substring(4)} dari [${currentStatus}] ke [${nextStatus}]`);
    loadDB();
    showToast(`Status Order berhasil diubah ke [${nextStatus}]`);

    // WhatsApp notification confirm pop-up if passing packing (moving to Ready / Siap)
    if (nextStatus === OrderStatus.SIAP_DIAMBIL) {
      const orderObj = currentOrders.find(o => o.id === orderId);
      if (orderObj) {
        setReadyOrderToNotify(orderObj);
      }
    }
  };

  const executeReadyToSelesai = (orderId: string, chosenMethod: 'Cash' | 'QRIS' | 'Transfer' | 'Deposit') => {
    const orderToPaid = orders.find(o => o.id === orderId);
    if (!orderToPaid) return false;

    // Save and Deduct Deposit balance if paymentMethod === Deposit
    if (chosenMethod === 'Deposit') {
      const custId = orderToPaid.customerId;
      const currentCustomers = LaughDryDatabase.getCustomers();
      const customerToUpdate = currentCustomers.find(c => c.id === custId);
      if (customerToUpdate) {
        if (customerToUpdate.depositBalance < orderToPaid.totalAmount) {
          alert(`Saldo Deposit pelanggan tidak mencukupi! Saldo saat ini: Rp ${customerToUpdate.depositBalance.toLocaleString('id-ID')}, Total Tagihan: Rp ${orderToPaid.totalAmount.toLocaleString('id-ID')}`);
          return false;
        }
        customerToUpdate.depositBalance -= orderToPaid.totalAmount;
        LaughDryDatabase.saveCustomers(currentCustomers);
      } else {
        alert("Pelanggan tidak ditemukan untuk melakukan pembayaran deposit!");
        return false;
      }
    }

    const currentOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: OrderStatus.SELESAI,
          paymentStatus: 'Lunas' as const,
          paymentMethod: chosenMethod,
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };
      }
      return o;
    });

    LaughDryDatabase.saveOrders(currentOrders);
    setOrders(currentOrders);
    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'STATUS_TRANSITION', `Menyelesaikan order ord-${orderId.substring(4)} dari [SIAP_DIAMBIL] ke [SELESAI] dengan metode pembayaran [${chosenMethod}]`);
    loadDB();
    showToast(`Status Order berhasil diselesaikan via ${chosenMethod}`);
    
    // Clear state
    setPaymentTransitionOrderId(null);
    setShowPaymentPopUp(false);
    setConfirmPaymentMethodName(null);
    return true;
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Apakah anda yakin ingin membatalkan orderan ini?")) {
      const currentOrders = orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: OrderStatus.DIBATALKAN,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      });
      LaughDryDatabase.saveOrders(currentOrders);
      setOrders(currentOrders);
      LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'ORDER_CANCEL', `Membatalkan orderan id [${orderId}]`);
      loadDB();
      showToast("Orderan telah ditandai Dibatalkan!");
    }
  };

  const handleOpenEditOrderModal = (order: Order) => {
    setEditingOrder(order);
    setEditingOrderPerfume(order.perfume || 'floral');
    setEditingOrderNotes(order.notes || '');
    setEditingOrderItems(order.items || []);
    
    // Build quantities map (legacy support if needed)
    const qtyMap: {[itemId: string]: number} = {};
    order.items.forEach(it => {
      qtyMap[it.id] = it.quantity;
    });
    setEditingOrderItemsQty(qtyMap);
    setShowEditOrderModal(true);
  };

  const handleSaveEditedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    if (editingOrderItems.length === 0) {
      alert("Setidaknya harus ada 1 rincian layanan dalam pesanan!");
      return;
    }

    const updatedOrders = orders.map(o => {
      if (o.id === editingOrder.id) {
        const newTotalAmount = editingOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
        return {
          ...o,
          perfume: editingOrderPerfume,
          notes: editingOrderNotes,
          items: editingOrderItems,
          totalAmount: newTotalAmount,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    LaughDryDatabase.saveOrders(updatedOrders);
    setOrders(updatedOrders);
    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'ORDER_EDIT', `Mengedit rincian order ${editingOrder.invoiceNumber}`);
    loadDB();
    setShowEditOrderModal(false);
    setEditingOrder(null);
    showToast(`Order ${editingOrder.invoiceNumber} berhasil diperbarui!`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeletingOrderId(orderId);
    setShowDeleteConfirmOrderModal(true);
  };

  const executeDeleteOrder = (orderId: string) => {
    const remainingOrders = orders.filter(o => o.id !== orderId);
    LaughDryDatabase.saveOrders(remainingOrders);
    setOrders(remainingOrders);
    LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'ORDER_DELETE', `Menghapus orderan id [${orderId}]`);
    loadDB();
    showToast("Pesanan cucian berhasil dihapus!");
    setDeletingOrderId(null);
    setShowDeleteConfirmOrderModal(false);
  };

  const handleClearAllActiveQueue = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua antrean cucian aktif di cabang ini?")) {
      const remainingOrders = orders.filter(o => 
        o.branchId !== currentUser.branchId || 
        [OrderStatus.SELESAI, OrderStatus.DIBATALKAN].includes(o.status)
      );
      LaughDryDatabase.saveOrders(remainingOrders);
      setOrders(remainingOrders);
      LaughDryDatabase.logActivity(currentUser.id, currentUser.name, currentUser.role, 'QUEUE_CLEAR_ALL', `Menghapus semua antrean cucian aktif di Cabang Utama`);
      loadDB();
      showToast("Semua antrean cucian aktif berhasil dihapus!");
    }
  };

  // Filter processes orders lists
  const processedOrders = orders
    .filter(o => o.branchId === currentUser.branchId) // Employee only sees their branch orders
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .slice(0).reverse();

  // Load WhatsApp mock content with compiled template values
  const getSimulatedMessageBody = (category: 'nota_layanan' | 'siap_diambil', order: Order) => {
    const defaultTemplate = LaughDryDatabase.getTemplates().find(t => t.category === category);
    if (!defaultTemplate) return '';

    const currentBranch = branches.find(b => b.id === order.branchId) || branches[0];

    return defaultTemplate.body
      .replace(/\{\{customer_name\}\}/g, order.customerName)
      .replace(/\{\{invoice_number\}\}/g, order.invoiceNumber)
      .replace(/\{\{services_list\}\}/g, order.items.map(i => i.serviceName).join(', '))
      .replace(/\{\{total_quantity\}\}/g, order.items.map(i => `${i.quantity}`).join(' + '))
      .replace(/\{\{total_amount\}\}/g, `Rp ${order.totalAmount.toLocaleString()}`)
      .replace(/\{\{payment_method\}\}/g, order.paymentMethod)
      .replace(/\{\{payment_status\}\}/g, order.paymentStatus)
      .replace(/\{\{estimated_completion\}\}/g, new Date(order.estimatedCompletion).toLocaleString())
      .replace(/\{\{branch_name\}\}/g, currentBranch.name)
      .replace(/\{\{branch_address\}\}/g, currentBranch.address)
      .replace(/\{\{payment_due\}\}/g, order.paymentStatus === 'Lunas' ? 'Lunas / Rp 0' : `Rp ${order.totalAmount.toLocaleString()}`)
      .replace(/\{\{tracking_url\}\}/g, `https://laughdry.co.id/track/${order.invoiceNumber}`);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6" id="employee-console-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#0F172A] border border-slate-800 text-[#38BDF8] px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle className="w-5 h-5 text-[#38BDF8]" />
          <span className="text-xs font-semibold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Operator Info strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-sky-600 animate-pulse" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-800 text-sm">Kasir: {currentUser.name}</div>
            <div className="text-slate-500 font-mono">Bekerja di: <span className="text-sky-800 font-bold">{branches.find(b => b.id === currentUser.branchId)?.name || 'Laundry Kita Sumbawa'} ({currentUser.branchId || 'br-1'})</span></div>
          </div>
        </div>

        {/* Scan Barcode sim header button */}
        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition shadow-sm"
              id="btn-cashier-logout"
              title="Logout dari shift kasir"
            >
              Keluar Shift (Logout)
            </button>
          )}

          <button
            onClick={handleBluetoothConnect}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            id="btn-bluetooth-connect"
            title="Mengkoneksikan printer bluetooth HP untuk print struk"
          >
            <Bluetooth className="w-4 h-4 text-blue-200" />
            Sambungkan Bluetooth HP
          </button>

          <button
            onClick={() => {
              setScannerInput('');
              setShowScannerSim(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F172A] border border-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
            id="btn-scan-qr-sim"
          >
            <QrCode className="w-4 h-4 text-sky-400" />
            Scan QR Nota Pelanggan
          </button>
        </div>
      </div>

      {/* 5 MENU TAB NAV BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-100 p-2 rounded-2xl border border-slate-205">
        {[
          { key: 'input_transaksi', icon: <ShoppingCart className="w-4 h-4" />, label: '📥 Input Transaksi', desc: 'Nota & kasir baru' },
          { key: 'antrean_cucian', icon: <Clock className="w-4 h-4" />, label: '📋 Antrean Cucian', desc: 'Proses kerja & siap ambil', badge: orders.filter(o => o.branchId === currentUser.branchId && o.status !== OrderStatus.SELESAI && o.status !== OrderStatus.DIBATALKAN).length },
          { key: 'manajemen_pelanggan', icon: <UserCheck className="w-4 h-4" />, label: '👥 Data Pelanggan', desc: 'Loyalitas, saldo & edit', badge: customers.length },
          { key: 'input_pengeluaran', icon: <DollarSign className="w-4 h-4" />, label: '💸 Pengeluaran Rutin', desc: 'Sewa, listrik & detergen' },
          { key: 'absensi_harian', icon: <FileCheck2 className="w-4 h-4" />, label: '📅 Absensi Harian', desc: 'Check-In/Out & Log' }
        ].map((menu) => {
          const isActive = activeMenuTab === menu.key;
          return (
            <button
              key={menu.key}
              type="button"
              onClick={() => setActiveMenuTab(menu.key as any)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border cursor-pointer relative group ${
                isActive 
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl transition ${isActive ? 'bg-sky-500 text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                {menu.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold truncate">{menu.label}</div>
                <div className="text-[9.5px] truncate text-slate-400">{menu.desc}</div>
              </div>
              {menu.badge !== undefined && menu.badge > 0 && (
                <span className={`absolute top-2.5 right-2 text-center px-1.5 py-0.5 rounded-full text-[8.5px] font-black leading-none ${
                  isActive ? 'bg-sky-400 text-slate-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {menu.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeMenuTab === 'input_transaksi' && (
          <motion.div
            key="input_transaksi"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
            id="laundry-checkout-grid"
          >
          
          {/* Left column (8 cols): Cashier Entry / Customer Card & Services selector */}
          <div className="lg:col-span-8 space-y-6">
          
          {/* Customer Lookup Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Langkah 1: Identifikasi & Pilih Pelanggan</h3>
            
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari nama atau nomor HP pelanggan..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
                  id="customer-search-input"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-sm"
                  id="btn-trigger-add-customer"
                >
                  <UserPlus className="w-4 h-4" /> Daftar Cust Baru
                </button>
              </div>
            </div>

            {/* Customer dropdown lists filter if typing */}
            {customerSearch.length >= 2 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y p-1 max-h-40 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Pelanggan tidak ditemukan. Silakan klik tombol &quot;Daftar Cust Baru&quot; di atas.</div>
                ) : (
                  filteredCustomers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => selectCustomer(c)}
                      className="p-2.5 hover:bg-sky-50 text-xs text-slate-700 cursor-pointer flex justify-between items-center transition"
                    >
                      <div>
                        <strong>{c.name}</strong> &mdash; <span>{c.phone}</span>
                      </div>
                      <span className="text-[10px] bg-sky-100 text-sky-850 font-bold px-2 py-0.5 rounded">
                        Pilih
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Active Customer Profile Details */}
            {selectedCustomer && (
              <div className="p-4 bg-sky-500/5 border border-sky-500/15 rounded-2xl text-xs space-y-3 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedCustomer.name}</h4>
                    <p className="text-slate-500 mt-0.5 flex items-center gap-1 font-semibold">
                      <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Alamat: {selectedCustomer.address || 'Kamar drop-off standard'}</p>
                  </div>
                  
                  {/* Actions & Balance indicators */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-sky-500/15 shadow-sm text-center shrink-0 min-w-[100px]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Saldo Deposit</div>
                      <div className="text-sky-700 font-extrabold text-sm">Rp {selectedCustomer.depositBalance.toLocaleString()}</div>
                    </div>

                    <div
                      onClick={() => setShowStampCardModal(true)}
                      className="bg-white hover:bg-amber-50 border border-sky-500/15 hover:border-amber-400 p-2.5 rounded-xl shadow-sm text-center shrink-0 min-w-[100px] cursor-pointer transition-all duration-200 hover:scale-[1.03] group"
                      title="Klik untuk membuka 10 Kartu Stamp Loyalti"
                      id="loyalty-points-trigger-card"
                    >
                      <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                        <Gift className="w-3 h-3 text-amber-500 group-hover:animate-bounce" />
                        Poin Loyalti
                      </div>
                      <div className="text-amber-700 font-extrabold text-sm flex items-center justify-center gap-1 mt-0.5">
                        <span>{selectedCustomer.loyaltyPoints} Poin</span>
                        <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-black tracking-tight animate-pulse">LIHAT ⭐</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <button
                        onClick={() => setShowTopUpForm(true)}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition"
                        id="btn-trigger-topup"
                      >
                        + Top Up Deposit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Create Customer Modal */}
          {showAddCustomer && (
            <form onSubmit={handleAddCustomerSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">Daftar Akun Pelanggan CRM Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Nama Pelanggan:</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    id="new-cust-name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Nomor HP (WhatsApp):</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    id="new-cust-phone"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Alamat Rumah:</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    id="new-cust-address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold"
                  id="btn-cancel-add-customer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-lg"
                  id="btn-submit-add-customer"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          )}

          {/* Form Deposit Top Up Modal */}
          {showTopUpForm && (
            <form onSubmit={handleTopUpSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs max-w-sm animate-scaleIn">
              <h4 className="font-bold text-slate-800">Top Up Saldo Deposit Cepat</h4>
              <div className="space-y-1">
                <label className="text-slate-500 block">Jumlah Uang (IDR):</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={topUpAmount || ''}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  placeholder="Contoh: 100000"
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  id="topup-amount-input"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTopUpForm(false)}
                  className="px-3 py-1.5 bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
                  id="btn-submit-topup"
                >
                  Proses Top Up
                </button>
              </div>
            </form>
          )}

          {/* Catalog Services (Step 2) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              Langkah 2: Katalog Jasa Layanan Laundry
            </h3>
            <p className="text-[10.5px] text-slate-400">Silakan pilih jasa layanan di bawah untuk melihat detail rincian tarif, estimasi penyelesaian, dan mendaftarkannya.</p>
            
            {/* Tabbed Navigation for Service Categories */}
            <div className="flex border-b border-slate-150 pb-1 gap-1">
              {(['kiloan', 'satuan'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setServiceCategoryTab(tab)}
                  className={`flex-1 py-2 px-3 text-center border-b-2 text-[11px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                    serviceCategoryTab === tab
                      ? 'border-sky-500 text-sky-700 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                  }`}
                >
                  {tab === 'kiloan' ? '🧺 Jasa Kiloan' : '🧥 Jasa Satuan'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 max-h-56 overflow-y-auto pt-1">
              {(() => {
                const displayedServices = services.filter(s => s.isActive && s.category === serviceCategoryTab);
                if (displayedServices.length === 0) {
                  return (
                    <div className="col-span-2 text-center p-6 text-slate-400 text-[11px] font-bold bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <p>🚫 Belum ada katalog layanan laundry {serviceCategoryTab !== 'all' ? `kategori ${serviceCategoryTab}` : ''} aktif di sistem.</p>
                      <p className="text-[9.5px] font-normal text-slate-400 mt-1 font-sans">Silakan masuk ke Dashboard Owner untuk mengelola daftar jasa!</p>
                    </div>
                  );
                }

                const groupedServices: Record<string, Service[]> = {};
                displayedServices.forEach(s => {
                  if (!groupedServices[s.name]) {
                    groupedServices[s.name] = [];
                  }
                  groupedServices[s.name].push(s);
                });

                return Object.keys(groupedServices).map(groupName => {
                  const groupItems = groupedServices[groupName];
                  const firstItem = groupItems[0];
                  return (
                    <button
                      key={groupName}
                      type="button"
                      onClick={() => setActiveServiceGroupName(groupName)}
                      className="p-3 bg-slate-50/80 hover:bg-sky-50 hover:text-sky-900 border border-slate-100 hover:border-sky-200 rounded-xl text-left cursor-pointer transition flex items-center justify-between group font-bold text-xs text-slate-700 hover:scale-[1.01]"
                    >
                      <div className="flex flex-col">
                        <span>✨ {groupName}</span>
                        <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {groupItems.length} Janji Penyelesaian ({firstItem.category === 'kiloan' ? 'Kiloan' : 'Satuan'})
                        </span>
                      </div>
                      <span className="text-[9.5px] bg-sky-100/65 text-sky-850 group-hover:bg-sky-200 group-hover:text-sky-900 px-2 py-1 rounded-lg transition font-black tracking-tight shrink-0">
                        BUKA ⚡
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Right column (4 cols): Checkout cart */}
        <div className="lg:col-span-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Langkah 3: Ringkasan Keranjang</span>
              <ShoppingCart className="w-4 h-4 text-sky-500" />
            </h3>

            {/* Selected active customers card */}
            {selectedCustomer ? (
              <div className="p-2.5 bg-sky-50 text-sky-800 text-xs rounded-lg font-semibold border border-sky-150">
                👤 Pembeli aktif: {selectedCustomer.name}
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 text-amber-800 text-[11px] rounded-lg leading-relaxed flex items-start gap-1.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Harap pilih atau cari pelanggan di sebelah kiri terlebih dahulu sebelum melanjutkan checkout.</span>
              </div>
            )}

            {/* Cart Items list */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Keranjang masih kosong. Klik tarif layanan untuk menambahkan.</div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="py-2.5 flex justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-800">{item.serviceName}</div>
                      <div className="text-[10px] text-slate-400">@Rp {item.price.toLocaleString()}</div>
                      
                      {/* Qty counters */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity - 0.5)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-[10px]"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity + 0.5)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-[10px]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-bold text-slate-900">Rp {item.subtotal.toLocaleString()}</div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form inputs */}
            {cartItems.length > 0 && (
              <div className="space-y-3.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                
                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Catatan Khusus Operator:</label>
                  <textarea
                    rows={2}
                    placeholder="Saku kanan jas di cek, flanel dilipat lipat halus dll"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Perfume Selection */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Pilihan Aroma Parfum:</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-150">
                    {(['floral', 'fresh', 'sweet', 'woody'] as const).map((perfume) => (
                      <button
                        key={perfume}
                        type="button"
                        onClick={() => setPerfumeSelection(perfume)}
                        className={`py-2 px-1 text-center rounded-xl font-extrabold uppercase text-[9px] border transition ${
                          perfumeSelection === perfume
                            ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {perfume === 'floral' ? '🌸 Floral' : perfume === 'fresh' ? '🍃 Fresh' : perfume === 'sweet' ? '🍬 Sweet' : '🪵 Woody'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NEW: Date Picker Inputs (Tanggal Masuk & Estimasi Selesai) */}
                <div className="grid grid-cols-2 gap-2 bg-amber-50/40 p-3 rounded-2xl border border-amber-200/50">
                  <div className="space-y-1">
                    <label className="text-amber-800 font-bold block text-[9px] uppercase tracking-wider">📅 Tanggal Masuk:</label>
                    <input
                      type="datetime-local"
                      value={customEntryDate}
                      onChange={(e) => setCustomEntryDate(e.target.value)}
                      className="w-full bg-white border border-amber-200 p-1.5 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-slate-800 text-xs shadow-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-amber-800 font-bold block text-[9px] uppercase tracking-wider">⏳ Estimasi Selesai:</label>
                    <input
                      type="datetime-local"
                      value={customCompletionDate}
                      onChange={(e) => setCustomCompletionDate(e.target.value)}
                      className="w-full bg-white border border-amber-200 p-1.5 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-slate-800 text-xs shadow-xs"
                    />
                  </div>
                </div>

                {/* NEW: Discount Inputs Panel */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <label className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Diskon Tambahan:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Nominal / %"
                      value={manualDiscountVal || ''}
                      onChange={(e) => setManualDiscountVal(Math.max(0, Number(e.target.value)))}
                      className="flex-1 bg-white border border-slate-250 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                    />
                    <select
                      value={manualDiscountType}
                      onChange={(e) => setManualDiscountType(e.target.value as 'percentage' | 'nominal')}
                      className="bg-white border border-slate-250 px-2 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-bold"
                    >
                      <option value="nominal">Rp Nominal</option>
                      <option value="percentage">% Persen</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 mt-2 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-sky-200 cursor-pointer hover:bg-sky-50/40 transition">
                    <input
                      type="checkbox"
                      checked={carrierBagDiscountChecked}
                      onChange={(e) => setCarrierBagDiscountChecked(e.target.checked)}
                      className="rounded border-slate-350 text-sky-600 focus:ring-sky-500 h-4 w-4"
                    />
                    <div className="text-[10.5px] leading-tight">
                      <span className="font-bold text-slate-800">Membawa Tas Laundry Sendiri</span>
                      <span className="block text-[9px] text-slate-400">Dapatkan diskon otomatis 5%</span>
                    </div>
                  </label>
                </div>

                {/* Clickable Payment Status Mechanism */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <label className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Status Pembayaran:</label>
                  
                  {paidStatus === 'Belum Lunas' ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPaymentChoiceModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-dashed border-rose-300 rounded-xl text-xs font-black transition cursor-pointer text-center animate-pulse shadow-sm"
                        id="payment-status-unpaid-trigger"
                      >
                        🔴 BELUM LUNAS (Klik untuk Melunasi)
                      </button>
                      <p className="text-[10px] text-slate-400 text-center font-normal leading-normal">
                        Sistem mencatat transaksi sebagai <strong>Piutang/Belum Lunas</strong> secara bawaan. Klik tombol merah berkedip di atas untuk memproses pelunasan instan.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div 
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sky-50 text-sky-800 border border-sky-300 rounded-xl text-xs font-black text-center"
                        >
                          🟢 LUNAS (Metode: {paymentMethod === 'Transfer' ? '📩 Transfer' : paymentMethod === 'Deposit' ? '💳 Deposit' : '💵 Cash'})
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPaidStatus('Belum Lunas');
                            setPaymentMethod('Cash');
                          }}
                          className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 border border-slate-300 rounded-xl text-[10.5px] font-bold text-slate-700 transition"
                          title="Batalkan pelunasan"
                        >
                          Reset
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPaymentChoiceModal(true)}
                        className="w-full text-center text-[10.5px] text-sky-600 hover:text-sky-700 font-extrabold hover:underline cursor-pointer pt-0.5"
                      >
                        Ubah Metode Pelunasan (Cash / Transfer / Deposit)
                      </button>
                    </div>
                  )}
                </div>

                {/* Pricing summary */}
                <div className="pt-2 bg-slate-55 p-3 rounded-2xl border border-slate-100 space-y-2 font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal cucian:</span>
                    <span>Rp {cartSubtotal.toLocaleString()}</span>
                  </div>
                  {manualDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-650 font-bold">
                      <span>Diskon Tambahan ({manualDiscountType === 'percentage' ? `${manualDiscountVal}%` : 'Nominal'}):</span>
                      <span>- Rp {manualDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {carrierBagDiscountChecked && (
                    <div className="flex justify-between text-emerald-650 font-bold">
                      <span>Diskon Bawa Tas (5%):</span>
                      <span>- Rp {carrierBagDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {isLoyaltyRedeemed && loyaltyDiscountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 font-extrabold bg-amber-50 rounded-lg p-2 border border-amber-200 text-xs">
                      <span className="flex items-center gap-1">🎁 Poin Claim Reward (Gratis 3KG):</span>
                      <span className="flex items-center gap-1 text-right">
                        - Rp {loyaltyDiscountAmount.toLocaleString()}
                        <button
                          type="button"
                          onClick={() => setIsLoyaltyRedeemed(false)}
                          className="text-[9px] text-red-500 hover:underline uppercase tracking-tight font-black shrink-0 px-1 ml-1.5 bg-white border border-red-200 rounded cursor-pointer"
                          title="Batalkan Klaim Poin"
                        >
                          ✕ Batal
                        </button>
                      </span>
                    </div>
                  )}
                  {paymentMethod === 'Deposit' && selectedCustomer && (
                    <div className="flex justify-between text-indigo-700 text-[11px] font-bold">
                      <span>Bayar via Deposit Pelanggan:</span>
                      <span>- Rp {totalCartAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-800 text-sm">
                    <span>Total Tagihan:</span>
                    <span className="text-slate-900 font-black">Rp {totalCartAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Auto-Print Thermal Printer Toggle as per USER requirement */}
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-left space-y-1 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
                      🖨️ Cetak Otomatis (Auto-Print)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !isAutoPrintEnabled;
                        setIsAutoPrintEnabled(nextVal);
                        localStorage.setItem('laughdry_autoprint_enabled', String(nextVal));
                        showToast(nextVal ? "🟢 Auto-Print Cetak Thermal Diaktifkan!" : "🔴 Auto-Print Dinonaktifkan.");
                      }}
                      className={`text-[9.5px] font-black px-2 py-1 rounded transition-all cursor-pointer ${
                        isAutoPrintEnabled 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-200 text-slate-650 border border-slate-300'
                      }`}
                    >
                      {isAutoPrintEnabled ? 'AKTIF' : 'MATI'}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                    Ketika AKTIF, transaksi yang terselesaikan akan otomatis langsung dicetak tanpa popup konfirmasi pilihan.
                  </p>
                </div>

                {/* Action checkout */}
                <button
                  type="button"
                  onClick={checkoutOrder}
                  className="w-full py-3 bg-[#1E293B] hover:bg-slate-800 text-sky-450 border border-slate-800 shadow-md font-extrabold text-[#38BDF8] text-xs rounded-xl transition uppercase tracking-wider"
                  id="btn-checkout-laundry"
                >
                  Proses Nota & Kirim Ke WA
                </button>

              </div>
            )}
          </div>

        </div>

      </motion.div>
      )}

      {/* ==================== TAB 2: DAFTAR ANTREAN CUCIAN ==================== */}
      {activeMenuTab === 'antrean_cucian' && (
        <motion.div
          key="antrean_cucian"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4 w-full"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
                Daftar Antrean Cucian (Cabang Utama)
              </h3>
              <p className="text-[10.5px] text-slate-400">Semua cucian aktif dalam pengerjaan dan siap ambil oleh pelanggan.</p>
            </div>
            <button
              type="button"
              onClick={handleClearAllActiveQueue}
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-655 border border-red-200 rounded-xl text-[10px] font-black tracking-tight transition cursor-pointer flex items-center gap-1"
              id="btn-clear-active-queue"
            >
              🗑️ Kosongkan Antrean
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  ⚙️ Proses Kerja & Siap Diambil
                </span>
                <span className="text-[9.5px] text-slate-400 font-mono">Alur: Antrean ➔ Cuci ➔ Setrika/Lipat ➔ Kemas ➔ Siap ➔ Selesai</span>
              </div>

              {/* Sub-group tabs */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-1 pt-0.5">
                {[
                  { key: 'queue', label: '🕒 Antrean', count: orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.ANTRI).length },
                  { key: 'laundry', label: '💦 Laundry (Cuci)', count: orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.DICUCI).length },
                  { key: 'ironing', label: '👔 Ironing/Folding (Setrika/Lipat)', count: orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.DISETRIKA_DILIPAT).length },
                  { key: 'packing', label: '📦 Packing (Kemas)', count: orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.DIKEMAS).length },
                  { key: 'ready', label: '✅ Ready (Siap)', count: orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.SIAP_DIAMBIL).length },
                  { key: 'completed', label: '🏆 Selesai', count: orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.SELESAI).length },
                ].map(tab => {
                  const isSelected = processGroupBy === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setProcessGroupBy(tab.key as any)}
                      className={`text-center flex flex-col items-center justify-center p-1.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 border-slate-200/60 text-slate-600'
                      }`}
                    >
                      <span className="truncate max-w-full px-0.5">{tab.label}</span>
                      <span className={`mt-0.5 px-1 rounded text-[8.5px] font-black ${
                        isSelected ? 'bg-sky-400 text-slate-900' : 'bg-slate-100 text-slate-500'
                      }`}>{tab.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tableless In-progress lists */}
              <div className="max-h-[440px] overflow-y-auto space-y-2 pr-1 pt-1">
                {(() => {
                  const activeBranchOrders = orders.filter(o => o.branchId === currentUser.branchId);
                  
                  const inProcessOrders = activeBranchOrders.filter(o => {
                    const s = o.status;
                    if (processGroupBy === 'queue') return s === OrderStatus.ANTRI;
                    if (processGroupBy === 'laundry') return s === OrderStatus.DICUCI;
                    if (processGroupBy === 'ironing') return s === OrderStatus.DISETRIKA_DILIPAT;
                    if (processGroupBy === 'packing') return s === OrderStatus.DIKEMAS;
                    if (processGroupBy === 'ready') return s === OrderStatus.SIAP_DIAMBIL;
                    if (processGroupBy === 'completed') return s === OrderStatus.SELESAI;
                    return false;
                  });

                  if (inProcessOrders.length === 0) {
                    return (
                      <div className="p-8 text-center text-xs text-slate-400 font-bold bg-white border border-slate-150 rounded-xl">
                        Tidak ada antrean dalam filter ini.
                      </div>
                    );
                  }

                  return inProcessOrders.map(o => {
                    let nextStepLabel = '';
                    if (o.status === OrderStatus.ANTRI) nextStepLabel = 'Cuci 💦';
                    else if (o.status === OrderStatus.DICUCI) nextStepLabel = 'Setrika/Lipat 👔';
                    else if (o.status === OrderStatus.DISETRIKA_DILIPAT) nextStepLabel = 'Kemas 📦';
                    else if (o.status === OrderStatus.DIKEMAS) nextStepLabel = 'Siap Ambil ✅';
                    else if (o.status === OrderStatus.SIAP_DIAMBIL) nextStepLabel = 'Serahkan 🎉';

                    return (
                      <div className="relative overflow-hidden rounded-xl bg-rose-500 w-full" key={o.id}>
                        {/* Swipe indicator background */}
                        <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6 text-white text-[10px] font-black rounded-xl select-none">
                          <span className="flex items-center gap-1 font-sans animate-pulse">
                            🗑️ Lepas Untuk Hapus
                          </span>
                        </div>

                        <motion.div
                          drag="x"
                          dragDirectionLock
                          dragConstraints={{ left: -140, right: 0 }}
                          dragElastic={{ left: 0.3, right: 0.05 }}
                          onDragEnd={(event, info) => {
                            if (info.offset.x < -80) {
                              handleDeleteOrder(o.id);
                            }
                          }}
                          className="bg-white p-3 border border-slate-150 rounded-xl hover:border-sky-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-slate-750 relative z-10 w-full touch-pan-y cursor-grab active:cursor-grabbing"
                        >
                          {/* Col 1: Invoice & Status */}
                          <div className="flex items-start gap-2 min-w-[140px] pointer-events-none select-none">
                            <div className="space-y-0.5">
                              <span className="font-mono font-black text-slate-900 text-[11px] bg-slate-100 border border-slate-150 px-1.5 py-0.5 rounded-md block w-fit">
                                {o.invoiceNumber}
                              </span>
                              <span className={`inline-block px-1.5 py-0.25 rounded text-[8px] font-black text-white uppercase tracking-wider ${
                                o.status === OrderStatus.ANTRI ? 'bg-amber-500' :
                                o.status === OrderStatus.DICUCI ? 'bg-sky-500' :
                                o.status === OrderStatus.DISETRIKA_DILIPAT ? 'bg-violet-550' :
                                o.status === OrderStatus.DIKEMAS ? 'bg-fuchsia-500' :
                                o.status === OrderStatus.SIAP_DIAMBIL ? 'bg-teal-600' : 'bg-emerald-600'
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

                          {/* Col 2: Services & Pricing */}
                          <div className="flex-1 min-w-0 pr-2 pointer-events-none select-none">
                            <p className="text-[10.5px] text-slate-500 font-bold truncate">
                              {o.items.map(it => it.serviceName).join(', ')}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                              <span className="font-extrabold text-slate-800">Rp {o.totalAmount.toLocaleString()}</span>
                              <span className={`text-[8px] font-extrabold px-1 rounded-full ${
                                o.paymentStatus === 'Lunas' ? 'bg-sky-50 text-sky-705' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {o.paymentStatus} ({o.paymentMethod})
                              </span>
                              {o.clothesCount !== undefined && o.clothesCount > 0 && (
                                <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 border border-indigo-150 px-1 py-0.25 rounded-md flex items-center gap-0.5">
                                  👕 {o.clothesCount} Pcs
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-500 mt-1 space-y-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-sans">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">📥 Masuk:</span>
                                <span className="font-semibold text-slate-700">{new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">⏳ Estimasi:</span>
                                <span className="font-semibold text-slate-700">{new Date(o.estimatedCompletion).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Actions */}
                          <div className="flex items-center gap-1.5 justify-end self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveInvoice(o);
                                setShowInvoiceChoiceModal(true);
                              }}
                              className="px-2 py-1 bg-white hover:bg-sky-50 border border-slate-200 text-sky-850 rounded-lg text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              📄 Struk
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditOrderModal(o)}
                              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-150 rounded-lg text-[9.5px] font-extrabold transition cursor-pointer"
                            >
                              ✏️ Edit Jasa
                            </button>

                            {nextStepLabel && (
                              <button
                                type="button"
                                onClick={() => handleTransitionStatus(o.id, o.status)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-lg text-[10px] transition cursor-pointer"
                              >
                                <span>👉 {nextStepLabel}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[9.5px] font-black transition flex items-center gap-1 cursor-pointer"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Separated Today Completed and Cancelled Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="antrean-history-grid">
              {/* Selesai Hari Ini */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                <span className="font-extrabold text-[11px] text-emerald-855 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Selesai & Diserahkan Hari Ini
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(() => {
                    const todayCompleted = orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.SELESAI);
                    if (todayCompleted.length === 0) return <div className="text-center text-[10.5px] text-slate-400 py-6 font-bold">Belum ada penyelesaian hari ini.</div>;
                    return todayCompleted.map(o => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setActiveInvoice(o);
                          setShowInvoiceModal(true);
                        }}
                        className="p-2.5 bg-emerald-50/20 rounded-xl border border-emerald-100 text-[11px] flex justify-between items-center hover:bg-emerald-50 transition cursor-pointer text-slate-755"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-600 bg-emerald-100 px-1.5 py-0.5 rounded text-[9.5px] border border-emerald-200">{o.invoiceNumber}</span>
                          <p className="font-bold text-slate-800 text-[10.5px] mt-1">{o.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-800">Rp {o.totalAmount.toLocaleString()}</p>
                          <p className="text-[8.5px] font-bold text-emerald-600">Selesai &bull; Detail 📄</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Dibatalkan */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                <span className="font-extrabold text-[11px] text-red-855 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Pesanan Dibatalkan (Draf Batal)
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(() => {
                    const canceledOrders = orders.filter(o => o.branchId === currentUser.branchId && o.status === OrderStatus.DIBATALKAN);
                    if (canceledOrders.length === 0) return <div className="text-center text-[10.5px] text-slate-400 py-6 font-bold">Tidak ada draf dibatalkan.</div>;
                    return canceledOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setActiveInvoice(o);
                          setShowInvoiceModal(true);
                        }}
                        className="p-2.5 bg-red-50/20 rounded-xl border border-red-100 text-[11px] flex justify-between items-center hover:bg-red-50 transition cursor-pointer text-slate-755"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-550 bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px] border border-slate-150 line-through">{o.invoiceNumber}</span>
                          <p className="font-bold text-slate-600 text-[10.5px] mt-1">{o.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-500 line-through">Rp {o.totalAmount.toLocaleString()}</p>
                          <p className="text-[8.5px] font-bold text-red-500">Batal / Detail ✕</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==================== TAB 3: MANAJEMEN PELANGGAN ==================== */}
      {activeMenuTab === 'manajemen_pelanggan' && (
        <motion.div
          key="manajemen_pelanggan"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm w-full"
        >
          <CustomerManagement
            customers={customers}
            setCustomers={setCustomers}
            currentUser={currentUser}
            onShowToast={showToast}
            loadDB={loadDB}
          />
        </motion.div>
      )}

      {/* ==================== TAB 4: INPUT PENGELUARAN ==================== */}
      {activeMenuTab === 'input_pengeluaran' && (
        <motion.div
          key="input_pengeluaran"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm w-full"
        >
          <ExpenseManagement
            expenses={expenses}
            setExpenses={setExpenses}
            currentUser={currentUser}
            onShowToast={showToast}
            loadDB={loadDB}
          />
        </motion.div>
      )}

      {/* ==================== TAB 5: ABSENSI HARIAN KASIR ==================== */}
      {activeMenuTab === 'absensi_harian' && (
        <motion.div
          key="absensi_harian"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-2 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-850 flex items-center gap-2 animate-fadeIn">
                <span className="p-1 px-1.5 rounded-lg bg-sky-500/10 text-sky-600">📅</span>
                Absensi Kehadiran & Shift Kerja Kasir
              </h2>
              <p className="text-xs text-slate-450 mt-0.5">Catat kehadiran awal shift dan akhir waktu kerja operasional Anda.</p>
            </div>
            
            <div className="p-2.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Operator Aktif: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Check-In/Out Panel */}
            <div className="lg:col-span-5 space-y-4 animate-scaleIn">
              {(() => {
                const activeRecord = attendanceRecords.find(r => r.userId === currentUser.id && r.status === 'Hadir');
                const isCheckedIn = !!activeRecord;

                return (
                  <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                    isCheckedIn 
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-emerald-50/20' 
                      : 'bg-amber-50/50 border-amber-200 shadow-amber-50/20'
                  } shadow-md`}>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Status Shift Sekarang</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        isCheckedIn 
                          ? 'bg-emerald-500 text-white animate-pulse' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {isCheckedIn ? '● AKTIF BEKERJA (HADIR)' : '● BELUM UTAS SHIFT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className={`p-3.5 rounded-2xl ${isCheckedIn ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        {isCheckedIn ? (
                          <>
                            <h3 className="font-extrabold text-[13px] text-emerald-950">Sedang Berjalan</h3>
                            <p className="text-[10.5px] text-emerald-800 font-mono mt-0.5">
                              Check-In: <strong>{new Date(activeRecord.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) || '--:--'} WIB</strong>
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-extrabold text-[13px] text-amber-950">Shift Berhenti</h3>
                            <p className="text-[10.5px] text-amber-800 mt-0.5">Silakan lakukan Check-In untuk membuka sesi kerja Anda di POS.</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Worksite Realism Detail */}
                    <div className="bg-white/80 p-3 rounded-2xl border border-slate-150 mb-4 text-[10.5px] space-y-1.5 text-slate-655 font-mono">
                      <div className="flex justify-between">
                        <span>Cabang Outlet:</span>
                        <span className="font-extrabold text-slate-800">
                          {branches.find(b => b.id === currentUser.branchId)?.name || 'BINTARO UTAMA'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Koordinat Lokasi GPS:</span>
                        <span className="font-black text-rose-500">
                          {isCheckedIn ? activeRecord.latLong : '-6.2550, 106.7150 (SIMULATED Store)'}
                        </span>
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1.5 mb-5">
                      <label className="block text-[10.5px] font-black uppercase text-slate-500">
                        {isCheckedIn ? 'Catatan Serah Terima / Checkout' : 'Catatan Checklist Check-In'}
                      </label>
                      <textarea
                        rows={3}
                        value={attendanceNotes}
                        onChange={(e) => setAttendanceNotes(e.target.value)}
                        placeholder={
                          isCheckedIn 
                            ? 'Masukkan laporan serah terima kasir, jumlah uang kas kecil akhir, dll.' 
                            : 'Kondisi mesin cuci bersih, stok detergen aman, siap melayani.'
                        }
                        className="w-full p-3 text-xs bg-white border border-slate-250 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition placeholder:text-slate-350"
                      />
                    </div>

                    {/* Trigger Button */}
                    {isCheckedIn ? (
                      <button
                        type="button"
                        onClick={handleCheckOut}
                        className="w-full py-3 bg-rose-500 hover:bg-rose-600 font-extrabold text-xs text-white rounded-2xl shadow-md hover:shadow-rose-500/10 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        🔴 CHECK-OUT & TUTUP SHIFT SEKARANG
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs text-white rounded-2xl shadow-md hover:shadow-emerald-500/10 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        🟢 MULAI CHECK-IN & BUKA SHIFT MAKSIMAL
                      </button>
                    )}

                  </div>
                );
              })()}
            </div>

            {/* Right Column: Historical Shift Log List */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="bg-slate-50 p-4.5 rounded-3xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Riwayat Presensi Terbaru (Karyawan Cabang)</h3>
                  <span className="font-mono text-[9.5px] font-bold text-slate-400 font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">Total: {attendanceRecords.length} Riwayat</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {attendanceRecords.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Belum ada data riwayat presensi kehadiran tercatat.
                    </div>
                  ) : (
                     attendanceRecords.map((r) => {
                      const branchName = branches.find(b => b.id === r.branchId)?.name || 'Cabang Utama';
                      return (
                        <div key={r.id} className="p-3 bg-white border border-slate-205 rounded-2xl shadow-xs text-xs space-y-2 hover:border-slate-350 transition">
                          
                          <div className="flex gap-2.5 items-start">
                            {r.photoUrl && (
                              <img src={r.photoUrl} alt="Selfie" className="w-[38px] h-[38px] rounded-full object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-extrabold text-slate-800 block truncate">{r.userName}</span>
                                  <span className="text-[9.5px] text-slate-400 font-medium leading-none">{branchName}</span>
                                </div>
                                <span className={`p-1 px-2 py-0.5 rounded-full text-[8.5px] font-black ${
                                  r.status === 'Hadir' 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-150 animate-pulse' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {r.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/70 text-[9.5px] font-mono text-slate-500">
                            <div>
                              <span className="text-slate-400">Masuk:</span> <br />
                              <strong className="text-slate-655">{new Date(r.checkIn).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} ({new Date(r.checkIn).toLocaleDateString('id-ID', {day:'numeric', month:'short'})})</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">Keluar:</span> <br />
                              <strong className="text-slate-655">
                                {r.checkOut ? `${new Date(r.checkOut).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} (${new Date(r.checkOut).toLocaleDateString('id-ID', {day:'numeric', month:'short'})})` : '⏳ Bekerja...'}
                              </strong>
                            </div>
                          </div>

                          {/* Cash Reconciliation Summary details on card */}
                          {(r.startingCashDrawer !== undefined || r.endingCashDrawerInput !== undefined) && (
                            <div className="bg-slate-50/70 p-2 rounded-xl text-[9.5px] font-mono grid grid-cols-2 gap-1.5 text-slate-550 border border-slate-100/50">
                              {r.startingCashDrawer !== undefined && (
                                <div>
                                  <span className="text-slate-400 text-[8.5px] block">KAS DRIFT MASUK:</span>
                                  <strong className="text-slate-700">Rp {r.startingCashDrawer.toLocaleString('id-ID')}</strong>
                                </div>
                              )}
                              {r.endingCashDrawerInput !== undefined && (
                                <div>
                                  <span className="text-slate-400 text-[8.5px] block">KAS DRAWER FISIK CO:</span>
                                  <strong className="text-slate-700">Rp {r.endingCashDrawerInput.toLocaleString('id-ID')}</strong>
                                </div>
                              )}
                              {r.expectedCashBalance !== undefined && (
                                <div className="col-span-2 pt-1 mt-0.5 border-t border-slate-200/50 flex justify-between items-center text-[9px]">
                                  <span>Hitungan Sistem: <strong className="text-slate-600 font-bold">Rp {r.expectedCashBalance.toLocaleString('id-ID')}</strong></span>
                                  <span className="font-extrabold uppercase">
                                    Selisih:{' '}
                                    <span className={r.cashDifference === 0 ? "text-emerald-600 bg-emerald-50 px-1 py-0.25 rounded" : "text-rose-600 bg-rose-50 px-1 py-0.25 rounded"}>
                                      {r.cashDifference === 0 ? "COCOK" : `Rp ${r.cashDifference?.toLocaleString('id-ID')}`}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {r.reconciliationNotes && (
                                <div className="col-span-2 text-[9px] text-rose-600 italic leading-snug pt-0.5">
                                  ⚠️ Catatan: {r.reconciliationNotes}
                                </div>
                              )}
                            </div>
                          )}

                          {r.workDuration !== undefined && (
                            <div className="text-[10px] text-slate-500 font-mono bg-slate-50/50 p-1.5 px-2 rounded-xl flex justify-between">
                              <span>Durasi Sesi Kerja:</span>
                              <strong className="text-slate-700 font-extrabold">
                                {Math.floor(r.workDuration / 60)} Jam {r.workDuration % 60} Menit
                              </strong>
                            </div>
                          )}

                          {r.notes && (
                            <p className="text-[10.5px] text-slate-450 italic bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200">
                              💌 {r.notes}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* MOBILE QUICK ACCESS FLOAT ACTION BUTTON (FAB) FOR NEW ORDERS */}
      {activeMenuTab !== 'input_transaksi' && (
        <div className="fixed bottom-20 right-5 z-[45] md:hidden animate-bounce" style={{ animationDuration: '3s' }}>
          <button
            type="button"
            onClick={() => {
              setActiveMenuTab('input_transaksi');
              showToast("⚡ Silakan Pilih Pelanggan untuk mulai pesanan baru!");
            }}
            className="p-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold rounded-full shadow-xl flex items-center justify-center gap-1.5 border-2 border-white hover:scale-105 active:scale-[0.93] transition-all text-[11px] uppercase tracking-wide cursor-pointer"
            id="mobile-fab-new-order"
          >
            <Plus className="w-4 h-4" />
            <span>Pesanan Baru</span>
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR BAR TAB MENU */}
      <div className="fixed bottom-0 left-0 right-0 z-45 bg-white/95 backdrop-blur-md border-t border-slate-150 shadow-2xl py-2 px-3 md:hidden flex justify-around items-center select-none" id="mobile-bottom-nav">
        {[
          { key: 'input_transaksi', icon: <ShoppingCart className="w-5 h-5" />, label: 'Transaksi' },
          { key: 'antrean_cucian', icon: <Clock className="w-5 h-5" />, label: 'Antrean', badge: orders.filter(o => o.branchId === currentUser.branchId && o.status !== OrderStatus.SELESAI && o.status !== OrderStatus.DIBATALKAN).length },
          { key: 'manajemen_pelanggan', icon: <UserCheck className="w-5 h-5" />, label: 'Pelanggan' },
          { key: 'input_pengeluaran', icon: <DollarSign className="w-5 h-5" />, label: 'Pengeluaran' },
          { key: 'absensi_harian', icon: <FileCheck2 className="w-5 h-5" />, label: 'Presensi' }
        ].map((item) => {
          const isActive = activeMenuTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveMenuTab(item.key as any);
              }}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 relative transition-all duration-150 active:scale-90 text-center cursor-pointer"
              id={`mob-nav-btn-${item.key}`}
            >
              <div className={`p-1.5 rounded-full relative transition-all duration-200 ${
                isActive 
                  ? 'bg-sky-500/10 text-sky-600 scale-110' 
                  : 'text-slate-450 hover:text-slate-750'
              }`}>
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-0.5 font-bold tracking-tight transition-all duration-200 ${
                isActive ? 'text-sky-600 font-extrabold' : 'text-slate-450'
              }`}>
                {item.label}
              </span>
              
              {/* Subtle active underline dot */}
              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-sky-500 animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>

      {/* 1. COMPREHENSIVE INVOICE & WHATSAPP MOCK RECEIPT DIALOG MODAL */}
      {showInvoiceModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-scaleIn">
            
            {/* Split Left: Simulated Printed Thermal Receipt */}
            <div className="p-6 bg-slate-950 text-white font-mono text-[10px] space-y-3 md:w-5/12 overflow-y-auto max-h-[480px]">
              <div className="text-center font-bold">
                <div className="text-xs uppercase text-emerald-400">LAUGHDRY EXPRESS</div>
                <div>LAUNDRY KITA - BINTARO</div>
                <div className="text-[9px] text-slate-400"> Boulevard Sektor 7 No.42</div>
                <div className="border-b border-dashed border-slate-600 my-2"></div>
              </div>

              <div>
                <div>Nota: {activeInvoice.invoiceNumber}</div>
                <div>Cust: {activeInvoice.customerName}</div>
                <div>Tgl: {new Date(activeInvoice.createdAt).toLocaleDateString()}</div>
                <div>Status: {activeInvoice.paymentStatus} ({activeInvoice.paymentMethod})</div>
                <div className="border-b border-dashed border-slate-600 my-2"></div>
              </div>

              <div className="space-y-1.5">
                {activeInvoice.items.map(it => (
                  <div key={it.id} className="flex justify-between">
                    <div>
                      <div>{it.serviceName}</div>
                      <div>{it.quantity} x @Rp {it.price.toLocaleString()}</div>
                    </div>
                    <span>Rp {it.subtotal.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-b border-dashed border-slate-600 my-2"></div>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>TOTAL BIAYA:</span>
                  <span>Rp {activeInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>Poin Dapat:</span>
                  <span>+{activeInvoice.pointsEarned} Poin</span>
                </div>
                <div className="border-b border-dashed border-slate-600 my-2"></div>
              </div>

              <div className="text-center text-[8.5px] text-slate-400 leading-relaxed block">
                Pakaian hilang diganti maks 5x lipat harga layanan. Simpan link nota dari kasir. Terima kasih!
                <div className="flex justify-center mt-3 p-1 bg-white inline-block mx-auto rounded">
                  {/* Mock barcode grid representing QR code link */}
                  <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white text-[8px] border-2 border-white">
                    LAUGHDRY
                  </div>
                </div>
              </div>
            </div>

            {/* Split Right: Simulated WhatsApp Direct Broadcast Message Notification */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-slate-50">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-xs text-slate-800 uppercase">Notifikasi WhatsApp</span>
                  <Phone className="w-4 h-4 text-sky-500 animate-bounce" />
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Draf pesan konfirmasi otomatis untuk WhatsApp pelanggan {activeInvoice.customerPhone}:
                </p>

                {/* Message display bubble */}
                <div className="bg-emerald-100 p-3.5 rounded-2xl rounded-tr-none text-slate-800 text-[11.5px] font-mono leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto shadow-sm border border-emerald-200">
                  {getSimulatedMessageBody(activeInvoice.status === OrderStatus.SIAP_DIAMBIL ? 'siap_diambil' : 'nota_layanan', activeInvoice)}
                </div>
              </div>

              {/* Action utilities */}
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const textContent = getSimulatedMessageBody(activeInvoice.status === OrderStatus.SIAP_DIAMBIL ? 'siap_diambil' : 'nota_layanan', activeInvoice);
                    navigator.clipboard.writeText(textContent);
                    showToast("Draf notifikasi berhasil disalin ke clipboard!");
                  }}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Share2 className="w-4 h-4" /> Copy Pesan & Kirim WA
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Mencetak struk ke printer thermal Bluetooth: ${LaughDryDatabase.getSettings().bluetoothPrinterAddress}`);
                    }}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-[10px] flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" /> Cetak Bluetooth
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 font-bold transition text-[10px]"
                  >
                    Selesai & Keluar
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 2. BARCODE SCANNER AND CAMERA PORT WORKSPACE */}
      {showScannerSim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-scaleIn">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <QrCode className="w-5 h-5 text-sky-500 animate-pulse" />
              Kamera Pemindai QR & Kode Nota
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Pindai QR code pada struk fisik atau pilih nomor invoice aktif di bawah ini untuk pemrosesan status pengambilan instan:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="LD-20260530-1003"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
                id="scanner-invoice-id"
              />

              <div className="bg-slate-50 p-2 text-[10px] rounded-lg space-y-1 max-h-32 overflow-y-auto">
                <span className="font-bold text-slate-400 tracking-wide uppercase">Pilih nota aktif cepat:</span>
                {orders.map(o => (
                  <div
                    key={o.id}
                    onClick={() => setScannerInput(o.invoiceNumber)}
                    className="p-1 hover:bg-sky-50 rounded cursor-pointer font-mono font-semibold"
                  >
                    {o.invoiceNumber} ({o.customerName})
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowScannerSim(false)}
                className="flex-1 py-2 bg-slate-200 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const match = orders.find(o => o.invoiceNumber === scannerInput);
                  if (match) {
                    setShowScannerSim(false);
                    setActiveInvoice(match);
                    setShowInvoiceModal(true);
                  } else {
                    alert("Nomor invoice tidak ditemukan di PostgreSQL!");
                  }
                }}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-lg"
                id="btn-trigger-scannow"
              >
                Tembak Scan & Show
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL GEOFENCED CAMERA ATTENDANCE & CASH RECONCILIATION */}
      {/* ========================================================= */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-attendance-camera-reconciliation">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col font-sans max-h-[92vh]">
            
            {/* Modal Title Banner */}
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
                  <Camera className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight border-none">
                    {attendanceMode === 'checkin' ? '🟢 Presensi Masuk (Check-In Shift)' : '🔴 Presensi Keluar (Check-Out Shift)'}
                  </h4>
                  <p className="text-[10px] text-slate-400 tracking-wider font-mono">ID: {currentUser.id} • {currentUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowAttendanceModal(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer select-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 leading-relaxed text-xs text-slate-600">
              
              {/* Geofencing Location Verification indicator */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Validasi Geofencing Outlet Cabang</div>
                  <strong className="text-slate-800 block leading-tight text-[11px]">{gpsStatusText}</strong>
                  {gpsDistance !== null && (
                    <div className="text-[9.5px] font-mono text-slate-400">
                      Koordinat terdeteksi: {capturedCoordinates?.lat.toFixed(6)}, {capturedCoordinates?.lng.toFixed(6)}
                      {gpsDistance > 150 ? (
                        <span className="text-amber-600 font-bold ml-1.5">(⚠️ Berada diluar radius 150 meter cabang)</span>
                      ) : (
                        <span className="text-emerald-600 font-bold ml-1.5">(✓ Lokasi valid)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Flex Grid divided into Camera and Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Visual Camera feed block */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">FOTO SELFIE WAJAH KASIR</span>
                  
                  <div className="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center group shadow-inner">
                    {capturedPhotoUrl ? (
                      <img src={capturedPhotoUrl} alt="Selfie captured" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : cameraPermissionGranted === false ? (
                      <div className="p-4 text-center space-y-2 text-slate-400">
                        <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-[10px] leading-snug">Deteksi kamera tidak aktif / diblokir di sandbox.</p>
                        <button
                          type="button"
                          onClick={triggerMockSelfie}
                          className="px-3 py-1 bg-sky-600 text-white rounded-lg text-[9.5px] font-black hover:bg-sky-500 transition-all cursor-pointer"
                        >
                          Simulasikan Webcam Selfie
                        </button>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <div className="absolute inset-0 border-2 border-dashed border-sky-450/40 rounded-2xl pointer-events-none animate-pulse"></div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    {!capturedPhotoUrl && cameraPermissionGranted !== false && (
                      <button
                        type="button"
                        onClick={captureSelfieSnapshot}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 text-[10.5px] font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        📷 Ambil Foto Selfie
                      </button>
                    )}
                    {capturedPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedPhotoUrl(null);
                          startCameraStream();
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-550 text-[10.5px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        🔄 Ambil Ulang Foto
                      </button>
                    )}
                  </div>
                </div>

                {/* Cash Drawer inputs section */}
                <div className="space-y-4">
                  
                  {attendanceMode === 'checkin' ? (
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                      <span className="text-[11px] font-extrabold text-emerald-800 block">💰 Cash Drawer Awal</span>
                      <p className="text-[10px] text-emerald-600 leading-snug">
                        Input isi uang tunai fisik yang ada di laci saat memulai shift kerja hari ini.
                      </p>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] font-black uppercase text-slate-500 block">Saldo Kas Awal (IDR):</label>
                        <input
                          type="number"
                          value={startingCashBalanceInput}
                          onChange={(e) => setStartingCashBalanceInput(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none text-slate-850"
                          placeholder="Masukkan saldo kas kasir"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
                      <span className="text-[11px] font-extrabold text-rose-800 block">💼 Cash Reconciliation Shift</span>
                      <p className="text-[10px] text-rose-600 leading-snug">
                        Mencocokkan uang fisik di laci dengan hitungan sistem untuk mendeteksi selisih.
                      </p>
                      
                      <div className="space-y-1.5 bg-white/70 p-2.5 rounded-xl border border-rose-100 text-slate-700 leading-normal">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span>Kas Buku (Sistem):</span>
                          <strong className="text-slate-900 font-mono">Rp {expectedCashDrawerValue.toLocaleString('id-ID')}</strong>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-black border-t border-rose-100/50 pt-1 mt-1 text-slate-850">
                          <span>Selisih Keuangan:</span>
                          <span className={reconciliationVariance === 0 ? "text-emerald-700" : reconciliationVariance > 0 ? "text-sky-700" : "text-rose-700 animate-pulse bg-rose-50 px-1 py-0.25 rounded"}>
                            {reconciliationVariance === 0 ? "✓ Sesuai (Rp 0)" : `Rp ${reconciliationVariance.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9.5px] font-black uppercase text-slate-500 block">Uang Fisik Di Laci Tunai (IDR):</label>
                        <input
                          type="number"
                          value={endingCashDrawerInputVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEndingCashDrawerInputVal(val);
                            const endingCash = parseFloat(val) || 0;
                            setReconciliationVariance(endingCash - expectedCashDrawerValue);
                          }}
                          className="w-full p-2.5 bg-white border border-slate-250 focus:border-rose-500 rounded-xl text-xs font-bold outline-none text-slate-850 text-center text-sm font-black"
                          placeholder="Fisik uang drawer"
                        />
                      </div>

                      {reconciliationVariance !== 0 && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="text-[9.5px] font-black uppercase text-rose-700 block text-[9px]">Keterangan Alasan Selisih Kas *Wajib:</label>
                          <textarea
                            rows={2}
                            value={reconciliationNotesVal}
                            onChange={(e) => setReconciliationNotesVal(e.target.value)}
                            placeholder="Contoh: Selisih uang kas receh kembalian..."
                            className="w-full p-2 bg-white border border-rose-250 focus:border-rose-500 rounded-xl text-[11px] outline-none text-rose-800 font-medium placeholder-rose-300"
                          />
                        </div>
                      )}

                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase text-slate-500 block">KETERANGAN OPERASIONAL (OPSIONAL)</span>
                    <input
                      type="text"
                      value={attendanceNotes}
                      onChange={(e) => setAttendanceNotes(e.target.value)}
                      placeholder="Catatan tambahan harian..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:border-slate-400 rounded-xl text-xs outline-none text-slate-800"
                    />
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowAttendanceModal(false);
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-extrabold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSubmitAttendance}
                className={`px-5 py-2.5 font-black text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${
                  capturedPhotoUrl 
                  ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer' 
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
                }`}
                title={!capturedPhotoUrl ? "Silakan ambil foto selfie untuk memverifikasi wajah" : "Kirim presensi"}
              >
                Kirim Presensi {attendanceMode === 'checkin' ? 'Check-In' : 'Check-Out'} ➔
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP INPUT JUMLAH PAKAIAN SEBELUM PROSES CUCI */}
      {/* ========================================================= */}
      {showWashInputModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-wash-input">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
                <Shirt className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">💦 Konfirmasi Proses Cuci</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Anda akan memulai proses pencucian untuk cucian ini. Silakan masukkan <strong>jumlah pakaian</strong> saat ini untuk memastikan keakuratan pelacakan item.
              </p>
            </div>

            <form onSubmit={submitWashTransitionWithClothes} className="space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-500 font-bold block">
                  Jumlah Pakaian (Pcs) <span className="text-rose-500 font-black">*Wajib</span>:
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={washClothesCountInput}
                  onChange={(e) => setWashClothesCountInput(e.target.value)}
                  placeholder="Contoh: 12"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl p-3 focus:outline-none font-bold text-slate-800 text-center text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWashInputModal(false);
                    setWashTransitionOrderId(null);
                    setWashTransitionCurrentStatus(null);
                    setWashClothesCountInput('');
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-xs transition active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition active:scale-[0.98] shadow-md"
                >
                  Mulai Cuci ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW: POPUP PILIHAN METODE PEMBAYARAN KETERANGAN "KLIK" */}
      {/* ========================================================= */}
      {showPaymentChoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-payment-method-choice">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            
            {midtransStatus === 'idle' ? (
              <>
                <div className="text-center">
                  <span className="text-3xl text-center block">💰</span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-2">Pilih Metode Pelunasan Pembayaran</h4>
                  <p className="text-slate-500 text-[11.5px] mt-1">Silakan klik salah satu opsi metode pembayaran lunas di bawah ini:</p>
                </div>

                <div className="space-y-2 pt-2">
                  {[
                    { m: 'Cash', label: '💵 CASH / TUNAI', desc: 'Pembayaran fisik langsung ke kasir' },
                    { m: 'Transfer', label: '📩 TRANSFER / QRIS DYNAMIC (MIDTRANS)', desc: 'Generate QRIS dinamis & verifikasi transaksi otomatis real-time' },
                    { m: 'Deposit', label: '💳 SALDO DEPOSIT', desc: 'Potong dari saldo deposit member aktif' }
                  ].map(opt => {
                    const isDeposit = opt.m === 'Deposit';
                    const hasZeroDeposit = isDeposit && selectedCustomer && selectedCustomer.depositBalance <= 0;
                    return (
                      <button
                        key={opt.m}
                        type="button"
                        disabled={hasZeroDeposit}
                        onClick={() => {
                          if (opt.m === 'Transfer') {
                            generateMidtransQRIS();
                          } else {
                            setPaymentMethod(opt.m as any);
                            setPaidStatus('Lunas');
                            setShowPaymentChoiceModal(false);
                            showToast(`🟢 Status diubah LUNAS via ${opt.m}`);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                          hasZeroDeposit
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-slate-50 hover:bg-sky-50 border-slate-150 hover:border-sky-300 font-bold text-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt.label}</span>
                          {isDeposit && selectedCustomer && (
                            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full">
                              Saldo: Rp {selectedCustomer.depositBalance.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-450 font-normal mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentChoiceModal(false);
                    }}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-xs text-slate-700 transition"
                  >
                    Batal (Tetap Belum Lunas)
                  </button>
                </div>
              </>
            ) : (
              // Midtrans Dynamic QRIS Processing and Polling Screen
              <div className="text-center space-y-4 py-2 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-extrabold text-[10px] bg-sky-50 text-sky-800 px-2 py-1 rounded-md uppercase tracking-wider">Midtrans QRIS Engine</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>
                    <span className="text-[9px] text-slate-400 font-mono">Real-time Hook</span>
                  </div>
                </div>

                {midtransStatus === 'generating' && (
                  <div className="py-8 space-y-3 flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-sky-400 border-t-white/0 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-700">Menghubungi API Gateway Midtrans...</p>
                    <p className="text-[10px] text-slate-400">Membuat order ID dan QRIS dinamis real-time...</p>
                  </div>
                )}

                {(midtransStatus === 'pending' || midtransStatus === 'settlement') && (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 relative">
                      {midtransQrCodeUrl ? (
                        <img 
                          src={midtransQrCodeUrl} 
                          alt="Midtrans Dynamic QRIS" 
                          referrerPolicy="no-referrer"
                          className={`w-48 h-48 rounded object-contain transition-all duration-300 ${midtransStatus === 'settlement' ? 'opacity-20 blur-xs' : ''}`}
                        />
                      ) : (
                        <div className="w-48 h-48 bg-slate-150 flex items-center justify-center font-bold text-xs text-slate-400">QR Gagal Dimuat</div>
                      )}

                      {/* Success Check overlay */}
                      {midtransStatus === 'settlement' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-black shadow-lg animate-bounce">
                            ✓
                          </div>
                          <p className="text-emerald-700 font-extrabold text-[11px] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                            Lunas Terverifikasi
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Tagihan Kasir (Gross Amount):</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">Rp {totalCartAmount.toLocaleString()}</p>
                    </div>

                    <div className="w-full bg-[#FAFBFD] p-2 rounded-xl text-left border border-slate-100 space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Invoice No:</span>
                        <span className="font-bold text-slate-650">{midtransTransactionId || "Generating..."}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Pelanggan:</span>
                        <span className="font-bold text-slate-650">{selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum'}</span>
                      </div>
                    </div>

                    {midtransStatus === 'pending' ? (
                      <div className="space-y-2 w-full">
                        <div className="w-full py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10.5px] font-bold animate-pulse flex items-center justify-center gap-1.5">
                          <span>⏳ Menunggu scan & penyelesaian pembayaran...</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (midtransPollingRef.current) {
                              clearInterval(midtransPollingRef.current);
                              midtransPollingRef.current = null;
                            }
                            setMidtransStatus('settlement');
                            setPaymentMethod('Transfer');
                            setPaidStatus('Lunas');
                            showToast("🟢 Pembayaran QRIS Berhasil Terverifikasi Instan!");
                            setTimeout(() => {
                              setShowPaymentChoiceModal(false);
                            }, 2000);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 font-extrabold text-[10.5px] text-white rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                          title="Simulasikan pembayaran lunas instan sbg alternatif scan QRIS fisik"
                        >
                          ⚡ KONFIRMASI BAYAR INSTAN (CEPAT)
                        </button>
                      </div>
                    ) : (
                      <div className="w-full py-2 bg-emerald-500 text-white rounded-xl text-[10.5px] font-extrabold flex items-center justify-center gap-1.5 animate-pulse">
                        <span>🎉 Transaksi berhasil otomatis diselesaikan!</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (midtransPollingRef.current) {
                        clearInterval(midtransPollingRef.current);
                        midtransPollingRef.current = null;
                      }
                      setMidtransStatus('idle');
                    }}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                  >
                    Batal & Reset QRIS
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW: POPUP PILIHAN PRINT NOTA ATAU KIRIM WHATSAPP */}
      {/* ========================================================= */}
      {showInvoiceChoiceModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="modal-invoice-options-choice">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="text-3xl">🎉</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Pesanan Sukses Dibuat!</h4>
              <p className="text-slate-500 font-mono text-[10px]">No. Nota: {activeInvoice.invoiceNumber}</p>
              <p className="text-slate-500 text-[11px]">Silakan pilih langkah lanjutan berikutnya untuk struk pelanggan ini:</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {/* WhatsApp direct redirect option */}
              <button
                type="button"
                onClick={() => {
                  redirectToWhatsApp(activeInvoice);
                  setShowInvoiceChoiceModal(false);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl transition shadow-xs text-left cursor-pointer"
                id="btn-invoice-choice-wa"
              >
                <div>
                  <div className="text-xs font-black">📩 KIRIM WHATSAPP (Automatis)</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Mengalihkan langsung ke WhatsApp HP</div>
                </div>
                <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
              </button>

              {/* Physical Thermal Printer option */}
              <button
                type="button"
                onClick={() => {
                  setShowThermalReceiptModal(true);
                  setShowInvoiceChoiceModal(false);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl transition shadow-xs text-left cursor-pointer"
                id="btn-invoice-choice-print"
              >
                <div>
                  <div className="text-xs font-black text-sky-400">🖨️ PRINT NOTA (POS 58mm)</div>
                  <div className="text-[10px] text-slate-350 font-normal mt-0.5">Tampilan struk fisik printer bluetooth termal HP</div>
                </div>
                <Printer className="w-5 h-5 text-sky-400 shrink-0" />
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceModal(true);
                  setShowInvoiceChoiceModal(false);
                }}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-center text-[10px] transition"
              >
                Buka Detail
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceChoiceModal(false);
                }}
                className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-350 text-slate-800 font-extrabold rounded-xl text-center text-[10px] transition"
              >
                Tutup Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW: PHYSICAL THERMAL RECEIPT PREVIEW (58MM PRINTER WIDTH) */}
      {/* ========================================================= */}
      {showThermalReceiptModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="modal-thermal-58mm-preview">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 my-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">🖨️ Template Print POS-58 mm</h4>
                <p className="text-[9px] text-slate-400">Dimensi presisi 58mm printer bluetooth kasir HP</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowThermalReceiptModal(false);
                  setActiveMenuTab('input_transaksi');
                }}
                className="text-slate-400 hover:text-white font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Interactive editing instruction banner */}
            <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-3 space-y-1">
              <span className="text-[9.5px] uppercase tracking-wider font-black text-amber-400 flex items-center gap-1">
                ✍️ Mode Ketik & Edit Aktif
              </span>
              <p className="text-[10px] text-slate-300 leading-normal font-semibold">
                Anda bisa mengetik atau mengubah langsung teks apa saja di dalam kwitansi putih di bawah sebelum melakukan pencetakan fisik!
              </p>
            </div>

            {/* Realistic 58mm POS physical viewport simulation */}
            {(() => {
              const getElementStyle = (elementId: string) => {
                const defaultStyles: {[key: string]: { fontSize: number, alignment: 'left' | 'center' | 'right', isBold: boolean, isVisible: boolean, showPrefix?: boolean, isItalic?: boolean }} = {
                  outlet_name: { fontSize: 13, alignment: 'center', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                  invoice_number: { fontSize: 11, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  customer_name: { fontSize: 13, alignment: 'left', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                  customer_phone: { fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  order_date: { fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  cashier_info: { fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  order_status: { fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  estimated_time: { fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  perfume_fragrance: { fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  item_list: { fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  total_charge: { fontSize: 12, alignment: 'right', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                  member_points: { fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                  footer_terms: { fontSize: 9, alignment: 'center', isBold: false, isVisible: true, showPrefix: true, isItalic: false }
                };

                const config = (settings.receiptElements || []).find((el: any) => el.id === elementId) || defaultStyles[elementId] || defaultStyles.invoice_number;
                const alignClass = config.alignment === 'center' ? 'text-center' : config.alignment === 'right' ? 'text-right' : 'text-left';
                const weightClass = config.isBold ? 'font-black' : 'font-semibold';
                const italicClass = config.isItalic ? 'italic' : '';
                
                return {
                  style: {
                    fontSize: `${config.fontSize || 10}px`,
                  },
                  className: `${alignClass} ${weightClass} ${italicClass}`,
                  isVisible: config.isVisible !== false,
                  showPrefix: config.showPrefix !== false
                };
              };

              return (
                <div className="bg-white text-slate-950 font-mono p-4 mx-auto max-w-[245px] border border-slate-300 shadow-inner rounded-md select-all">
                  {/* Header logo */}
                  {settings.showHeaderLogoInReceipt && settings.customReceiptHeaderLogoImg && (
                    <div className="flex justify-center mb-2 text-center">
                      <img 
                        src={settings.customReceiptHeaderLogoImg} 
                        alt="Receipt Header Logo" 
                        className="w-14 h-14 object-contain rounded border border-slate-200 p-0.5 bg-white bg-opacity-90"
                      />
                    </div>
                  )}

                  {/* Outlet & Header Name - Directly Editable */}
                  {(() => {
                    const s = getElementStyle('outlet_name');
                    if (!s.isVisible) return null;
                    return (
                      <div 
                        style={s.style} 
                        className={`uppercase tracking-tight whitespace-pre-line mb-1.5 border border-transparent hover:border-slate-300 hover:bg-slate-50 p-0.5 rounded cursor-text ${s.className}`}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                      >
                        {settings.customReceiptHeader || 'LAUGHDRY EXPRESS'}
                      </div>
                    );
                  })()}

                  {settings.showBranchPhone && (
                    <div 
                      className="font-bold text-slate-700 text-center text-[8.5px] mb-1 border border-transparent hover:border-slate-300 hover:bg-slate-50 p-0.5 rounded cursor-text"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      TELP BRANCH: 0812-3456-7890
                    </div>
                  )}
                  
                  <div className="border-t border-dashed border-slate-400 my-2"></div>
                  
                  {/* Transaction info block - Fully Editable */}
                  <div 
                    className="space-y-0.5 text-slate-800 border border-transparent hover:border-slate-300 hover:bg-slate-50 p-0.5 rounded cursor-text"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                  >
                    {(() => {
                      const s = getElementStyle('invoice_number');
                      if (!s.isVisible) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Nota  : ${activeInvoice.invoiceNumber}` : activeInvoice.invoiceNumber}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('order_date');
                      if (!s.isVisible) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Tgl   : ${new Date(activeInvoice.createdAt).toLocaleDateString()}` : new Date(activeInvoice.createdAt).toLocaleDateString()}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('customer_name');
                      if (!s.isVisible) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Cust  : ${activeInvoice.customerName}` : activeInvoice.customerName}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('customer_phone');
                      if (!s.isVisible || !settings.showCustomerPhoneInReceipt) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Telp  : ${activeInvoice.customerPhone || 'N/A'}` : (activeInvoice.customerPhone || 'N/A')}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('cashier_info');
                      if (!s.isVisible || !settings.showCashierNameInReceipt) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Kasir : ${currentUser.name}` : currentUser.name}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('order_status');
                      if (!s.isVisible) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Status: ${activeInvoice.paymentStatus.toUpperCase()} via ${activeInvoice.paymentMethod}` : `${activeInvoice.paymentStatus.toUpperCase()} via ${activeInvoice.paymentMethod}`}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('estimated_time');
                      if (!s.isVisible || !settings.showEstimatedCompletion || !activeInvoice.estimatedCompletion) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Estim : ${new Date(activeInvoice.estimatedCompletion).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}` : new Date(activeInvoice.estimatedCompletion).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      );
                    })()}

                    {(() => {
                      const s = getElementStyle('perfume_fragrance');
                      if (!s.isVisible || !activeInvoice.perfume) return null;
                      return (
                        <div style={s.style} className={s.className}>
                          {s.showPrefix ? `Aroma : ✨ ${activeInvoice.perfume.toUpperCase()}` : `✨ ${activeInvoice.perfume.toUpperCase()}`}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Compact items list for 58mm printer constraints - Fully Editable */}
                  {(() => {
                    const s = getElementStyle('item_list');
                    if (!s.isVisible) return null;
                    return (
                      <>
                        <div className="border-t border-dashed border-slate-400 my-2"></div>
                        <div 
                          style={s.style} 
                          className={`space-y-2 border border-transparent hover:border-slate-300 hover:bg-slate-50 p-0.5 rounded cursor-text ${s.className}`}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                        >
                          {activeInvoice.items.map(it => (
                            <div key={it.id} className="space-y-0.5 text-left">
                              <div className="font-extrabold text-slate-900 leading-tight">{it.serviceName}</div>
                              <div className="flex justify-between text-slate-600">
                                <span>{it.quantity} {it.unit || 'X'} x @Rp {it.price.toLocaleString()}</span>
                                <span className="font-black text-slate-950">Rp {it.subtotal.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}

                  {/* Total Tagihan Biaya - Fully Editable */}
                  {(() => {
                    const s = getElementStyle('total_charge');
                    if (!s.isVisible) return null;
                    return (
                      <>
                        <div className="border-t border-dashed border-slate-400 my-2"></div>
                        <div 
                          style={s.style} 
                          className={`space-y-1 text-slate-950 border border-transparent hover:border-slate-300 hover:bg-slate-50 p-0.5 rounded cursor-text ${s.className}`}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                        >
                          <div className="flex justify-between font-black">
                            <span>TOTAL BIAYA:</span>
                            <span>Rp {activeInvoice.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-700">
                            <span>PAID STATE:</span>
                            <span>{activeInvoice.paymentStatus === 'Lunas' ? 'LUNAS (Rp 0)' : `BILL (Rp ${activeInvoice.totalAmount.toLocaleString()})`}</span>
                          </div>
                          {settings.showPointsInReceipt && (() => {
                            const pm = getElementStyle('member_points');
                            if (!pm.isVisible) return null;
                            return (
                              <div style={pm.style} className={`flex justify-between font-bold ${pm.className}`}>
                                {pm.showPrefix ? (
                                  <>
                                    <span>POIN MEMBER:</span>
                                    <span>+{activeInvoice.pointsEarned} Poin</span>
                                  </>
                                ) : (
                                  <span className="w-full text-center block font-black">+{activeInvoice.pointsEarned} Poin</span>
                                )}
                              </div>
                            );
                          })()}
                          {settings.showNotesInReceipt && activeInvoice.notes && (
                            <div className="text-slate-650 italic text-[8.2px] mt-1 border-t border-slate-100 pt-1 text-left">
                              Notes: "{activeInvoice.notes}"
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  {/* Catatan S&K Foot - Fully Editable */}
                  {(() => {
                    const s = getElementStyle('footer_terms');
                    if (!s.isVisible || !settings.showTermsInReceipt) return null;
                    return (
                      <>
                        <div className="border-t border-dashed border-slate-400 my-2"></div>
                        <div 
                          style={s.style} 
                          className={`whitespace-pre-line leading-tight text-slate-750 border border-transparent hover:border-slate-300 hover:bg-slate-50 p-0.5 rounded cursor-text ${s.className}`}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                        >
                          {settings.customReceiptFooter || `* KETENTUAN OPERASIONAL *
1. Serahkan nota asli saat ambil pakaian.
2. Kerusakan/hilang diganti 5x lipat.
3. Komplain maksimal 1x24 jam pasca ambil.`}
                        </div>
                      </>
                    );
                  })()}

                  {/* CUSTOM RECEIPT PROMOTIONAL FOOTER BLOCK */}
                  {settings.customReceiptPromo && (
                    <>
                      <div className="border-t border-dashed border-slate-400 my-2 pt-1.5">
                        <div 
                          className="text-center font-black text-[9px] text-rose-600 uppercase tracking-wide leading-tight bg-rose-50 p-1 rounded-lg border border-dashed border-rose-200 cursor-text hover:bg-rose-100 transition"
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                        >
                          📣 PROMO: {settings.customReceiptPromo}
                        </div>
                      </div>
                    </>
                  )}

                  {/* QRIS PAYMENT AUTOPRINT ON RECEIPT */}
                  {settings.qrisType && settings.qrisType !== 'none' && (
                    <div className="border-t border-dashed border-slate-400 my-2 pt-2 flex flex-col items-center">
                      <span className="text-[7.5px] font-black text-slate-850 tracking-wider">
                        {settings.qrisType === 'static' ? 'SCAN QRIS STATIS' : 'SCAN QRIS DINAMIS'}
                      </span>
                      {settings.qrisMerchantId && (
                        <span className="text-[6px] text-slate-500 font-mono tracking-wider mb-1">
                          NMID: {settings.qrisMerchantId}
                        </span>
                      )}
                      
                      <div className="p-1 bg-white border border-slate-350 rounded flex flex-col items-center shadow-xs">
                        {settings.qrisType === 'static' && settings.qrisStaticQrUrl ? (
                          <img 
                            src={settings.qrisStaticQrUrl} 
                            alt="QRIS Static QR"
                            className="w-16 h-16 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-16 h-16 text-slate-900 bg-white p-0.5">
                            <rect x="0" y="0" width="10" height="10" fill="currentColor" />
                            <rect x="2" y="2" width="6" height="6" fill="white" />
                            <rect x="3" y="3" width="4" height="4" fill="currentColor" />
                            
                            <rect x="90" y="0" width="10" height="10" fill="currentColor" />
                            <rect x="92" y="2" width="6" height="6" fill="white" />
                            <rect x="93" y="3" width="4" height="4" fill="currentColor" />
                            
                            <rect x="0" y="90" width="10" height="10" fill="currentColor" />
                            <rect x="2" y="92" width="6" height="6" fill="white" />
                            <rect x="3" y="93" width="4" height="4" fill="currentColor" />
                            
                            <rect x="20" y="5" width="15" height="4" fill="currentColor" />
                            <text x="50" y="25" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">QRIS</text>
                            <rect x="15" y="15" width="4" height="20" fill="currentColor" />
                            <rect x="40" y="30" width="25" height="5" fill="currentColor" />
                            <rect x="75" y="12" width="8" height="30" fill="currentColor" />
                            <rect x="22" y="45" width="12" height="12" fill="currentColor" />
                            <rect x="50" y="40" width="10" height="25" fill="currentColor" />
                            <rect x="10" y="65" width="25" height="6" fill="currentColor" />
                            <rect x="45" y="70" width="30" height="8" fill="currentColor" />
                            <rect x="80" y="60" width="12" height="12" fill="currentColor" />
                            <rect x="15" y="80" width="15" height="5" fill="currentColor" />
                            <rect x="90" y="45" width="6" height="20" fill="currentColor" />
                            
                            <rect x="42" y="42" width="16" height="16" fill="white" rx="1" />
                            <text x="50" y="53" fill="#0c4a6e" fontSize="7" fontWeight="black" textAnchor="middle">Q</text>
                          </svg>
                        )}
                      </div>
                      
                      <span className="text-[5.5px] font-extrabold tracking-wider mt-1 text-[#0284c7] uppercase leading-none text-center">
                        {settings.qrisType === 'static' ? 'Merchant: LAUGHDRY EXPRESS' : 'API DYNAMIC VERIFIED'}
                      </span>
                    </div>
                  )}


                </div>
              );
            })()}

            {/* Actions for Bluetooth physical mock connection - Redirects to POS main view on click */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`🖨️ Mengirim data cetak POS-58 mm ke printer termal bluetooth di ${LaughDryDatabase.getSettings().bluetoothPrinterAddress}! HP Android berhasil membroadcast struk.`);
                  setShowThermalReceiptModal(false);
                  setActiveMenuTab('input_transaksi');
                }}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition"
                id="btn-thermal-confirm-print"
              >
                <Printer className="w-4 h-4" /> Mulai Cetak Fisik HP
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    redirectToWhatsApp(activeInvoice);
                    setShowThermalReceiptModal(false);
                    setActiveMenuTab('input_transaksi');
                  }}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-[10px] transition flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Kirim WA Juga
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowThermalReceiptModal(false);
                    setActiveMenuTab('input_transaksi');
                  }}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-center text-[10px] transition"
                >
                  Tutup Struk
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW: POPUP RINCIAN DETAIL KATALOG JASA LAYANAN KLIK */}
      {/* ========================================================= */}
      {selectedCatalogService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-catalog-service-details">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap whitespace-normal break-words">
              <div>
                <span className="text-[10px] bg-sky-50 text-sky-800 font-bold uppercase py-0.5 px-2 rounded-md">Detail Jasa Layanan</span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-1">{selectedCatalogService.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCatalogService(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Turnaround speed / estimate hours details */}
              {selectedCatalogService.category === 'satuan' ? (
                <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-amber-700 font-bold text-[8px] uppercase tracking-wide block">1. Jenis Layanan & Klasifikasi Ukuran</span>
                  <p className="font-extrabold text-amber-900 text-[11.5px] leading-snug flex items-center gap-1.5">
                    <span>📏 Ukuran: {selectedCatalogService.promiseName || 'Sedang'}</span>
                  </p>
                  <p className="text-[9.5px] text-amber-600 font-normal leading-normal">
                    Layanan laundry satuan tidak membutuhkan janji estimasi selesai manual per item, melainkan disesuaikan terpusat pada antrean cabang.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[8px] uppercase tracking-wide block">1. Jenis Layanan & Waktu Penyelesaian</span>
                  <p className="font-extrabold text-[#0F172A] text-[11.5px] leading-snug flex items-center gap-1.5">
                    <span>🚀 {selectedCatalogService.estimateHours} Jam Selesai</span>
                    <span className="text-slate-400 font-normal">({Math.ceil(selectedCatalogService.estimateHours / 24)} Hari Kerja)</span>
                  </p>
                  <p className="text-[9.5px] text-slate-400 font-normal leading-normal">
                    Sistem otomatis menghitung batas janji pengerjaan dari waktu penerimaan kasir, memastikan keterlambatan terpantau di dashboard branch.
                  </p>
                </div>
              )}

              {/* Sizing/Unit detail */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold text-[8px] uppercase tracking-wide block">2. Ukuran Barang & Tipe Satuan</span>
                <p className="font-extrabold text-[#0F172A] text-[11.5px] leading-snug uppercase tracking-wide flex items-center gap-1.5">
                  <span>📦 Per {selectedCatalogService.unit}</span>
                  <span className="text-slate-400 font-normal font-mono">({selectedCatalogService.category === 'kiloan' ? 'Kiloan / Berat' : 'Satuan / Pcs'})</span>
                </p>
                <p className="text-[9.5px] text-slate-400 font-normal leading-normal">
                  Satuan ukuran {selectedCatalogService.unit} digunakan sebagai pengali timbangan fisik pakaian kotor saat didaftarkan kasir karyawan.
                </p>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-bold text-[8px] uppercase tracking-wide block">3. Tarif Terpilih (PostgreSQL)</span>
                  <span className="text-sm font-black text-[#0F172A]">Rp {selectedCatalogService.price.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-slate-400 font-normal"> / {selectedCatalogService.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded">Aktif</span>
                </div>
              </div>

              {/* Workflow details */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold text-[8px] uppercase tracking-wide block">4. Alur Kerja (Custom Workflow)</span>
                <p className="text-[10px] text-emerald-700 font-bold font-mono leading-normal break-all">
                  {(selectedCatalogService.workflowSteps || ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai']).join(' ➔ ')}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCatalogService(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Kembali
              </button>
              
              <button
                type="button"
                onClick={() => {
                  addToCart(selectedCatalogService);
                  setSelectedCatalogService(null);
                }}
                className="flex-1 py-2.5 bg-sky-550 hover:bg-sky-600 text-white rounded-xl font-black text-xs transition shadow-sm"
              >
                + Tambah ke Cucian
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DETAIL MODAL UNTUK LAYANAN SELESAI / LAYANAN BATAL */}
      {/* ========================================================= */}
      {showOrderDetailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="order-detail-popup-modal">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-150 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 border border-slate-150 px-2 py-0.5 rounded-md">
                  {showOrderDetailModal.invoiceNumber}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-1.5 font-sans">Detail Rincian Layanan</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderDetailModal(null)}
                className="text-slate-400 hover:text-slate-650 font-bold p-1 rounded-full text-base transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 font-sans">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block">Nama Pelanggan:</span>
                  <span className="font-extrabold text-slate-800">{showOrderDetailModal.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">No. Telepon:</span>
                  <span className="font-mono text-slate-700 font-semibold">{showOrderDetailModal.customerPhone}</span>
                </div>
              </div>

              {/* Status and payment details */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Status Alur Cucian:</span>
                  <span className={`inline-block font-black text-[10px] uppercase tracking-wider mt-0.5 ${
                    showOrderDetailModal.status === OrderStatus.SELESAI ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'
                  }`}>
                    {showOrderDetailModal.status === OrderStatus.SELESAI ? '🎉 Selesai' : '❌ Dibatalkan'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Status Pembayaran:</span>
                  <span className={`inline-block font-bold text-[10px] mt-0.5 ${
                    showOrderDetailModal.paymentStatus === 'Lunas' ? 'text-sky-700 font-bold' : 'text-amber-600 font-bold'
                  }`}>
                    {showOrderDetailModal.paymentStatus} ({showOrderDetailModal.paymentMethod})
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">📅 Tanggal Masuk:</span>
                  <span className="font-semibold text-slate-700">{new Date(showOrderDetailModal.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">⏳ Estimasi Selesai:</span>
                  <span className="font-semibold text-slate-700">{new Date(showOrderDetailModal.estimatedCompletion).toLocaleString('id-ID')}</span>
                </div>
                {showOrderDetailModal.perfume && (
                  <div className="flex justify-between border-t border-slate-150 pt-1.5 mt-1.5">
                    <span className="text-slate-400">🌸 Parfum Aroma:</span>
                    <span className="font-black text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded text-[9px]">
                      {showOrderDetailModal.perfume === 'floral' ? '🌸 Floral' : showOrderDetailModal.perfume === 'fresh' ? '🍃 Fresh' : showOrderDetailModal.perfume === 'sweet' ? '🍬 Sweet' : '🪵 Woody'}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List Table */}
              <div className="space-y-1.5">
                <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Layanan yang Diambil:</span>
                <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {showOrderDetailModal.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex justify-between items-center hover:bg-slate-50 transition-all">
                      <div>
                        <span className="font-extrabold text-slate-800 text-[11px] block">✨ {item.serviceName}</span>
                        <span className="text-slate-400 text-[10px] font-medium block mt-0.5">Rp {item.price.toLocaleString()} x {item.quantity}</span>
                      </div>
                      <span className="font-black text-slate-900 text-xs text-right animate-pulse">Rp {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {showOrderDetailModal.notes && (
                <div className="p-2.5 bg-yellow-50 text-yellow-800 border border-yellow-150 rounded-xl">
                  <span className="font-black block uppercase text-[8.5px] tracking-wider mb-0.5">📌 Catatan Khusus Operator:</span>
                  <p className="italic text-[10px]">{showOrderDetailModal.notes}</p>
                </div>
              )}

              {/* Total Payment & Point info */}
              <div className="bg-slate-950 text-white p-3.5 rounded-2xl flex items-center justify-between border border-slate-950">
                <div>
                  <span className="text-slate-400 text-[9px] block uppercase tracking-wider font-semibold">Total Tagihan</span>
                  <span className="text-base font-black text-[#56C5FC]">Rp {showOrderDetailModal.totalAmount.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[9px] block uppercase tracking-wider font-semibold">Poin Diperoleh</span>
                  <span className="text-xs font-extrabold text-amber-400">+{showOrderDetailModal.pointsEarned} Poin Loyalty</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowOrderDetailModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-755 font-black rounded-2xl transition-all cursor-pointer text-center text-xs"
              >
                Tutup Jendela Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POP-UP PILIHAN JANJI PENYELESAIAN & HARGA LAYANAN */}
      {/* ========================================================= */}
      {activeServiceGroupName && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="service-promise-variants-modal">
          <div className="bg-white rounded-3xl p-6 max-w-sm or max-w-md w-full border border-slate-150 shadow-2xl relative overflow-hidden font-sans">
            
            {/* Top decorative badge */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-sky-400 to-blue-500"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap whitespace-normal break-words mt-1.5 ">
              <div>
                <span className="text-[10px] bg-sky-55 text-sky-850 font-bold uppercase py-0.5 px-2 rounded-md">Pilih Kecepatan Penyelesaian</span>
                <h4 className="font-extrabold text-slate-950 text-base mt-1">{activeServiceGroupName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceGroupName(null)}
                className="text-slate-400 hover:text-slate-650 font-black text-sm p-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of active promises (group options) */}
            <div className="space-y-3 my-4 max-h-[350px] overflow-y-auto pr-1">
              {(() => {
                const variants = services.filter(s => s.isActive && s.name === activeServiceGroupName);
                if (variants.length === 0) {
                  return (
                    <div className="text-center py-6 text-slate-400 font-medium text-xs">
                      Tidak ada opsi janji penyelesaian untuk layanan ini.
                    </div>
                  );
                }
                return variants.map(variant => {
                  const isSrvSatuan = variant.category === 'satuan';
                  const estText = variant.promiseDurationText || `${variant.estimateHours} Jam`;
                  const pName = variant.promiseName || "Standar";
                  return (
                    <div 
                      key={variant.id} 
                      className="bg-slate-50 hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200 hover:border-sky-300 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all duration-200"
                    >
                      <div className="flex-1">
                        {/* Promise Name / Size Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSrvSatuan ? (
                            <span className="bg-rose-50 text-rose-700 font-black px-2 py-0.5 rounded-lg border border-rose-200 text-[10px] tracking-tight uppercase">
                              📏 Ukuran {pName}
                            </span>
                          ) : (
                            <>
                              <span className="font-black text-[#0F172A] text-sm tracking-tight">{pName}</span>
                              <span className="bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded text-[9px] tracking-tight uppercase flex items-center gap-0.5 whitespace-nowrap">
                                ⏳ {estText}
                              </span>
                            </>
                          )}
                        </div>
                        {/* Category & measurement info */}
                        <div className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1 flex-wrap">
                          <span className="capitalize bg-slate-100 px-1 rounded text-slate-600">{variant.category}</span>
                          <span>&bull;</span>
                          <span>Per {variant.unit}</span>
                          {!isSrvSatuan && (
                            <>
                              <span>&bull;</span>
                              <span>Estimasi {variant.estimateHours} jam</span>
                            </>
                          )}
                        </div>
                        {/* Price Display */}
                        <div className="text-sm font-black text-sky-700 mt-2">
                          Rp {variant.price.toLocaleString('id-ID')} <span className="text-[10px] text-slate-500 font-normal">/ {variant.unit}</span>
                        </div>
                      </div>

                      {/* Action buttons inside variant card */}
                      <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCatalogService(variant);
                            setActiveServiceGroupName(null);
                          }}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 font-extrabold rounded-xl text-[10px] transition cursor-pointer"
                        >
                          Rincian
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(variant);
                            setActiveServiceGroupName(null);
                          }}
                          className="px-4 py-1.5 bg-sky-550 hover:bg-sky-600 text-white font-black rounded-xl text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          + Pilih Jasa
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveServiceGroupName(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition cursor-pointer text-center text-xs shadow-md"
              >
                Tutup Pilihan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POP-UP CUSTOM INPUT BERAT LAUNDRY KILOAN */}
      {/* ========================================================= */}
      {kiloanWeightModalService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="kiloan-weight-input-modal">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl relative overflow-hidden font-sans">
            
            {/* Top decorative badge */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-teal-400 to-sky-500"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap whitespace-normal break-words mt-1.5 ">
              <div>
                <span className="text-[10px] bg-teal-50 text-teal-800 font-bold uppercase py-0.5 px-2 rounded-md">⚖️ Timbangan Kiloan</span>
                <h4 className="font-extrabold text-slate-950 text-base mt-0.5">Masukkan Berat Cucian</h4>
              </div>
              <button
                type="button"
                onClick={() => setKiloanWeightModalService(null)}
                className="text-slate-400 hover:text-slate-650 font-black text-sm p-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Service & price info summary */}
            <div className="my-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
              <div className="font-bold text-slate-850 text-xs">{kiloanWeightModalService.name}</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                {kiloanWeightModalService.promiseName || 'Standar'} &bull; Tarif Rp {kiloanWeightModalService.price.toLocaleString('id-ID')} / {kiloanWeightModalService.unit}
              </div>
            </div>

            {/* Weight Input Field */}
            <div className="space-y-2 my-4">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block">Timbangan Fisik (kg):</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={kiloanWeightInputText}
                  onChange={(e) => setKiloanWeightInputText(e.target.value)}
                  placeholder="3.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-950 font-black text-lg focus:bg-white focus:border-teal-500 focus:outline-none transition pr-12"
                  id="kiloan-weight-field"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">KG</span>
              </div>
              
              {/* Quick weight selector buttons */}
              <div className="pt-1.5">
                <span className="text-[9.5px] font-bold text-slate-400 block mb-1">Pilihan Cepat:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {['3.0', '4.0', '5.0', '6.0', '8.0', '10.0'].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setKiloanWeightInputText(w)}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                        kiloanWeightInputText === w 
                          ? 'bg-teal-500 border-teal-600 text-white shadow-xs font-black' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {parseFloat(w)} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimal weight info banner */}
              <div className="mt-3 bg-amber-50/50 border border-amber-200 p-3 rounded-2xl text-[9.5px] text-amber-800 leading-relaxed font-sans">
                ⚠️ <strong className="font-extrabold text-amber-900">Batas Minimal Kiloan:</strong> Minimal berat kiloan adalah <strong>3.0 kg</strong>. Jika berat di bawah 3.0 kg, sistem otomatis membulatkannya tarifnya setara 3.0 kg (Rp {(kiloanWeightModalService.price * 3).toLocaleString('id-ID')}).
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setKiloanWeightModalService(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition text-xs cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const weightVal = parseFloat(kiloanWeightInputText);
                  if (isNaN(weightVal) || weightVal <= 0) {
                    alert("Harap masukkan angka berat kg yang valid!");
                    return;
                  }
                  addToCart(kiloanWeightModalService, weightVal);
                  setKiloanWeightModalService(null);
                }}
                className="flex-1 py-2.5 bg-sky-550 hover:bg-sky-600 text-white rounded-2xl font-black transition text-xs cursor-pointer text-center shadow-md animate-pulse-subtle"
              >
                + Pilih & Masukkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POP-UP KARTU STAMP LOYALTI PELANGGAN (10 STAMPS) */}
      {/* ========================================================= */}
      {showStampCardModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="stamp-loyalty-modal">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl relative overflow-hidden font-sans">
            
            {/* Top decorative badge */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-400 to-yellow-500"></div>

            {/* Modal Header */}
            <div className="text-center pb-3 border-b border-slate-100 space-y-1 mt-1.5">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 shadow-sm">
                <Gift className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Kartu Stamp Loyalitas</h4>
              <p className="text-[10.5px] text-slate-400">Poin Pelanggan Terintegrasi LaughDry</p>
            </div>

            {/* Customer Information Box */}
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl text-xs space-y-1.5 mt-4">
              <div className="flex justify-between items-center text-slate-500">
                <span>Pelanggan:</span>
                <span className="font-extrabold text-slate-800">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>ID/No HP:</span>
                <span className="font-mono text-slate-700 font-semibold">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5 mt-1 text-slate-500">
                <span>Total Akumulasi:</span>
                <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                  ⭐ {selectedCustomer.loyaltyPoints} Poin
                </span>
              </div>
            </div>

            {/* Stamp Progress card label */}
            <div className="text-center mt-4">
              <div className="text-xs font-black text-slate-700 uppercase tracking-widest text-[9.5px]">
                STAMP CARD PROGRESS &bull; {selectedCustomer.loyaltyPoints % 10}/10 STAMPS
              </div>
            </div>

            {/* Visual 10 Stamps Grid */}
            <div className="grid grid-cols-5 gap-3.5 py-4 max-w-sm mx-auto">
              {Array.from({ length: 10 }).map((_, i) => {
                const activeStampsCount = selectedCustomer.loyaltyPoints % 10;
                // If point is completely positive and multiple of 10, fill all 10 stamps
                const finalStampsFilled = (selectedCustomer.loyaltyPoints > 0 && activeStampsCount === 0) ? 10 : activeStampsCount;
                const isFilled = i < finalStampsFilled;
                
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isFilled 
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-600 text-slate-950 scale-105 shadow-md shadow-amber-500/20' 
                        : 'bg-slate-50 border-slate-200/60 text-slate-350 border-dashed'
                    }`}
                    title={isFilled ? `Stamp ${i+1} Terisi` : `Stamp ${i+1} Kosong`}
                    >
                      {isFilled ? (
                        <span className="text-sm font-black animate-scaleIn">🧼</span>
                      ) : (
                        <span className="text-[10px] font-black font-mono text-slate-300">{i + 1}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Extra reward progress note */}
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-[10.5px] text-amber-900 leading-normal space-y-1">
              <div className="font-extrabold flex items-center gap-1 text-[11px]">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                Ketentuan Loyalitas Stamp:
              </div>
              <p className="font-sans">
                Setiap 1 transaksi lunas otomatis terhitung sebagai <strong className="font-black">1 stamp</strong>. Lengkapi 10 stamp untuk menukarkan dengan <strong className="font-extrabold text-amber-800">1x Cuci Setrika GRATIS</strong> di gerai LaughDry terdekat!
              </p>
              {Math.floor(selectedCustomer.loyaltyPoints / 10) > 0 && (
                <div className="border-t border-amber-200/60 pt-1.5 mt-1 font-black text-amber-700 text-center animate-pulse">
                  🏆 Anda memiliki {Math.floor(selectedCustomer.loyaltyPoints / 10)} voucher cuci gratis siap dipakai!
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2 mt-4 space-y-2">
              {selectedCustomer.loyaltyPoints >= 10 && (
                <button
                  type="button"
                  onClick={handleRedeemLoyalty}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl transition-all cursor-pointer text-center text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 animate-bounce-subtle"
                >
                  <Gift className="w-4 h-4 font-black" />
                  Klaim Gratis Cuci 3KG Sekarang!
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowStampCardModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-850 font-extrabold rounded-2xl transition-all cursor-pointer text-center text-xs border border-slate-200"
              >
                Tutup Kartu Stamp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. POPUP EDIT JASA DETAIL MODAL (LAUGHDRY PREMIUM) */}
      {/* ========================================================= */}
      {showEditOrderModal && editingOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-100 shadow-2xl space-y-4 my-8 animate-scaleIn select-none">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <span className="text-[9px] bg-sky-50 text-sky-850 font-extrabold uppercase py-0.5 px-2 rounded-md">Edit Detail Layanan & Transaksi</span>
                <h4 className="font-extrabold text-slate-950 text-sm mt-0.5">Nota: {editingOrder.invoiceNumber}</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditOrderModal(false);
                  setEditingOrder(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block pb-0.5">Nama Pelanggan:</span>
                <strong className="text-slate-800 font-bold">{editingOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block pb-0.5">No. HP Pelanggan:</span>
                <strong className="text-slate-700 font-mono">{editingOrder.customerPhone || 'N/A'}</strong>
              </div>
            </div>

            {/* Perfume Selektor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-tight block">Wewangian Parfum:</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {['floral', 'fresh', 'sweet', 'woody'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditingOrderPerfume(p as any)}
                    className={`py-2 px-1 rounded-xl border text-center font-bold capitalize transition cursor-pointer text-[11px] ${
                      editingOrderPerfume === p
                        ? 'bg-sky-500 border-sky-600 text-white shadow-xs font-black'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650'
                    }`}
                  >
                    {p === 'floral' ? '🌸 Floral' : p === 'fresh' ? '🍃 Fresh' : p === 'sweet' ? '🍭 Sweet' : '🌲 Woody'}
                  </button>
                ))}
              </div>
            </div>

            {/* List Item & Services Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-tight block">Daftar Layanan pada Transaksi:</label>
                
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const selSrv = services.find(s => s.id === e.target.value);
                      if (selSrv) {
                        const exists = editingOrderItems.find(it => it.serviceId === selSrv.id);
                        if (exists) {
                          alert("Layanan ini sudah diinput pada keranjang transaksi!");
                        } else {
                          const formattedName = selSrv.category === 'kiloan'
                            ? `${selSrv.name}-${selSrv.promiseName || 'Reguler'}`
                            : `${selSrv.name}-${selSrv.promiseName || 'Sedang'}`;

                          const newItem: OrderItem = {
                            id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                            serviceId: selSrv.id,
                            serviceName: formattedName,
                            price: selSrv.price,
                            quantity: 1,
                            subtotal: selSrv.price
                          };
                          setEditingOrderItems([...editingOrderItems, newItem]);
                        }
                      }
                      e.target.value = "";
                    }
                  }}
                  className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-extrabold p-1 px-2.5 rounded-lg text-[10px] focus:outline-none cursor-pointer"
                >
                  <option value="">➕ Tambah Jasa Cucian...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - Rp {s.price.toLocaleString()}/{s.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[9.5px] uppercase font-bold">
                      <th className="p-2.5">Layanan</th>
                      <th className="p-2.5">Tarif</th>
                      <th className="p-2.5 text-center">Jumlah / Qty</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {editingOrderItems.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">{it.serviceName}</td>
                        <td className="p-2.5 text-slate-500 font-mono">Rp {it.price.toLocaleString()}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newQty = Math.max(0.1, it.quantity - 0.5);
                                const updated = [...editingOrderItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  quantity: Number(newQty.toFixed(2)),
                                  subtotal: Math.round(updated[idx].price * newQty)
                                };
                                setEditingOrderItems(updated);
                              }}
                              className="w-4.5 h-4.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold rounded flex items-center justify-center text-[10px]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              value={it.quantity}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...editingOrderItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  quantity: val,
                                  subtotal: Math.round(updated[idx].price * val)
                                };
                                setEditingOrderItems(updated);
                              }}
                              className="w-10 bg-slate-50 text-center rounded border border-slate-200 font-bold text-[11px] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newQty = it.quantity + 0.5;
                                const updated = [...editingOrderItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  quantity: Number(newQty.toFixed(2)),
                                  subtotal: Math.round(updated[idx].price * newQty)
                                };
                                setEditingOrderItems(updated);
                              }}
                              className="w-4.5 h-4.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold rounded flex items-center justify-center text-[10px]"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-black text-slate-900 font-mono">
                          Rp {it.subtotal.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingOrderItems.filter((_, i) => i !== idx);
                              setEditingOrderItems(updated);
                            }}
                            className="p-1 text-red-600 hover:text-red-800 transition rgb"
                            title="Hapus Item"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                    {editingOrderItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 font-medium font-semibold">Belum ada layanan di keranjang ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summary Row */}
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-2xl">
                <span className="font-extrabold text-red-700 tracking-wider text-[10px] uppercase">Rincian Estimasi Total Transaksi Baru:</span>
                <strong className="text-red-600 font-black text-xs font-mono">
                  Rp {editingOrderItems.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Catatan Operasional Kasir:</label>
              <textarea
                value={editingOrderNotes}
                onChange={(e) => setEditingOrderNotes(e.target.value)}
                placeholder="Misal: Customer membawa hanger sendiri..."
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-red-500"
                rows={2}
              />
            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-105 pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditOrderModal(false);
                  setEditingOrder(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditedOrder}
                className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white text-xs font-black rounded-2xl shadow-sm transition"
              >
                Konfirmasi Perubahan Data
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. POPUP KONFIRMASI HAPUS TRANSAKSI (LAUNDRY QUEUE) */}
      {/* ========================================================= */}
      {showDeleteConfirmOrderModal && deletingOrderId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 animate-scaleIn text-center select-none animate-fadeIn">
            <div className="space-y-2">
              <span className="text-3xl block">⚠️</span>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Hapus Data Transaksi</h4>
              <p className="text-slate-500 font-semibold text-[11.5px] leading-relaxed">
                apakah ingin menghapus data transaksi ini?
              </p>
            </div>
            <div className="flex gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmOrderModal(false);
                  setDeletingOrderId(null);
                }}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteOrder(deletingOrderId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition shadow-md cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. POPUP PILIHAN METODE PEMBAYARAN SAAT SERAHKAN */}
      {/* ========================================================= */}
      {showPaymentPopUp && paymentTransitionOrderId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-5 text-center select-none animate-fadeIn">
            
            {!confirmPaymentMethodName ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                  <span className="text-xl">💳</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Metode Pembayaran Serah Terima</h4>
                  <p className="text-slate-500 font-semibold text-xs leading-relaxed">
                    Cucian akan diserahkan ke pelanggan. Harap tentukan metode pembayaran untuk melunasi tagihan:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmPaymentMethodName('Cash')}
                    className="p-3 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-2xl text-[11px] font-black text-slate-800 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="text-xl">💵</span>
                    <span>Bayar Tunai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmPaymentMethodName('QRIS')}
                    className="p-3 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-2xl text-[11px] font-black text-slate-800 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="text-xl">📲</span>
                    <span>QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmPaymentMethodName('Transfer')}
                    className="p-3 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-2xl text-[11px] font-black text-slate-800 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="text-xl">📩</span>
                    <span>Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmPaymentMethodName('Deposit')}
                    className="p-3 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-2xl text-[11px] font-black text-slate-800 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="text-xl">💳</span>
                    <span>Potong Deposit</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentPopUp(false);
                      setPaymentTransitionOrderId(null);
                      setConfirmPaymentMethodName(null);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-50">
                  <span className="text-xl">❓</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">Konfirmasi Pembayaran</h4>
                  <p className="text-slate-650 font-bold text-xs bg-amber-50/50 p-4 rounded-2xl border border-amber-105 leading-relaxed">
                    apakah benar transaksi menggunakan {confirmPaymentMethodName}?
                  </p>
                  <p className="text-slate-400 text-[10.5px]">
                    Setelah dikonfirmasi, status pesanan akan dipindahkan ke Selesai dan status pembayaran diset menjadi Lunas.
                  </p>
                </div>

                <div className="flex gap-2 text-xs pt-3">
                  <button
                    type="button"
                    onClick={() => setConfirmPaymentMethodName(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      executeReadyToSelesai(paymentTransitionOrderId, confirmPaymentMethodName as any);
                    }}
                    className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-xl transition shadow-md cursor-pointer"
                  >
                    Benar, Proses!
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. POPUP KONFIRMASI WA NOTIFICATION SIAP / READY */}
      {/* ========================================================= */}
      {readyOrderToNotify && (
        <div className="fixed inset-0 bg-slate-951/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 text-center select-none animate-fadeIn">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Cucian Siap Diambil! ✅</h4>
              <p className="text-slate-500 font-semibold text-xs leading-relaxed">
                Pakaian pada nota <strong>{readyOrderToNotify.invoiceNumber}</strong> milik pelanggan {readyOrderToNotify.customerName} sudah berada di rak Siap Ambil / Ready.
              </p>
              <p className="text-emerald-700 text-[10.5px] font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-105 leading-normal">
                Kirim chat WA bahwa cucian sudah siap untuk diambil?
              </p>
            </div>

            <div className="flex gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setReadyOrderToNotify(null)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-255 text-slate-750 font-bold rounded-xl transition cursor-pointer"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={() => {
                  redirectToWhatsApp(readyOrderToNotify);
                  setReadyOrderToNotify(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                💬 Kirim Notif (WA)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
