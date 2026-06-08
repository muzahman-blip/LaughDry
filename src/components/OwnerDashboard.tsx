/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Shield,
  Download,
  Upload,
  AlertTriangle,
  Play,
  RotateCcw,
  Coffee,
  Calendar,
  History,
  QrCode,
  Undo,
  Building,
  Phone,
  Smartphone
} from 'lucide-react';
import { LaughDryDatabase } from '../data/mockDatabase';
import { Service, Expense, Branch, Order, OrderStatus, AuditLog, WhatsAppTemplate, Customer, SettingsVersion } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface OwnerDashboardProps {
  onLogout?: () => void;
  onSwitchConsole?: (consoleType: any) => void;
}

export default function OwnerDashboard({ onLogout, onSwitchConsole }: OwnerDashboardProps = {}) {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [settings, setSettings] = useState(LaughDryDatabase.getSettings());
  const [settingsHistory, setSettingsHistory] = useState<SettingsVersion[]>(LaughDryDatabase.getSettingsHistory());
  const [newVersionNote, setNewVersionNote] = useState<string>('');
  const [expandedElementId, setExpandedElementId] = useState<string | null>(null);

  // Confirm states
  const [deleteConfirmService, setDeleteConfirmService] = useState<Service | null>(null);
  const [deleteConfirmCashier, setDeleteConfirmCashier] = useState<any | null>(null);
  const [deleteConfirmExpense, setDeleteConfirmExpense] = useState<Expense | null>(null);

  // Form states
  const [showAddService, setShowAddService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'kiloan' as 'kiloan' | 'satuan',
    price: 0,
    unit: 'kg',
    estimateHours: 48,
    workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'] as string[],
    promiseName: 'Reguler',
    promiseDurationVal: 2,
    promiseDurationUnit: 'Hari' as 'Hari' | 'Jam',
    sizeOption: 'Sedang' as string,
  });

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'Detergen/Softener' as any,
    amount: 0,
    branchId: 'br-1',
  });

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'services' | 'expenses' | 'bi' | 'settings' | 'audit' | 'cashiers' | 'branches' | 'report' | 'attendance'>('analytics');
  const [reportStartDate, setReportStartDate] = useState<string>('2026-05-01');
  const [reportEndDate, setReportEndDate] = useState<string>('2026-06-30');
  const [expandedServiceGroup, setExpandedServiceGroup] = useState<string | null>(null);
  const [activePopupField, setActivePopupField] = useState<'category' | 'unit' | 'promiseDurationUnit' | 'sizeOption' | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showTodayTransactionsModal, setShowTodayTransactionsModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceStaffFilter, setAttendanceStaffFilter] = useState<string>('all');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('all');

  // Owner form states
  const [showEditOwner, setShowEditOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState({
    name: 'Andi Owner',
    username: 'owner',
    password: 'owner'
  });

  const getOwnerName = () => {
    const owner = users.find(u => u.role === 'owner');
    return owner ? owner.name : 'Andi Owner';
  };

  // Branch form states
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<Branch | null>(null);

  // Cashier form states
  const [showAddCashier, setShowAddCashier] = useState(false);
  const [editingCashierId, setEditingCashierId] = useState<string | null>(null);
  const [cashierForm, setCashierForm] = useState({
    name: '',
    username: '',
    password: '',
    branchId: 'br-1',
  });

  const [expenseStartDate, setExpenseStartDate] = useState('2026-05-01');
  const [expenseEndDate, setExpenseEndDate] = useState('2026-05-30');
  const [selectedMonthlySummaryMonth, setSelectedMonthlySummaryMonth] = useState('2026-05');

  useEffect(() => {
    loadDatabaseState();
  }, []);

  const loadDatabaseState = () => {
    setServices(LaughDryDatabase.getServices());
    setExpenses(LaughDryDatabase.getExpenses());
    setOrders(LaughDryDatabase.getOrders());
    setCustomers(LaughDryDatabase.getCustomers());
    const dbUsers = LaughDryDatabase.getUsers();
    setUsers(dbUsers);

    // Find owner in the database and set form values
    const owner = dbUsers.find(u => u.role === 'owner');
    if (owner) {
      setOwnerForm({
        name: owner.name,
        username: owner.username,
        password: owner.password || 'owner'
      });
    }

    setBranches(LaughDryDatabase.getBranches());
    setAuditLogs(LaughDryDatabase.getAuditLogs());
    setTemplates(LaughDryDatabase.getTemplates());
    setSettings(LaughDryDatabase.getSettings());
    setSettingsHistory(LaughDryDatabase.getSettingsHistory());
    setAttendanceRecords(LaughDryDatabase.getAttendance());
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Service CRUD
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const currentServices = [...services];
    
    const isSatuan = serviceForm.category === 'satuan';
    const computedHours = isSatuan ? 0 : (serviceForm.promiseDurationUnit === 'Hari' 
      ? Number(serviceForm.promiseDurationVal) * 24 
      : Number(serviceForm.promiseDurationVal));

    const durationText = isSatuan ? '' : `${serviceForm.promiseDurationVal} ${serviceForm.promiseDurationUnit}`;
    const finalPromiseName = isSatuan ? serviceForm.sizeOption : serviceForm.promiseName;

    if (editingServiceId) {
      const idx = currentServices.findIndex(s => s.id === editingServiceId);
      if (idx !== -1) {
        currentServices[idx] = {
          ...currentServices[idx],
          name: serviceForm.name,
          category: serviceForm.category,
          price: Number(serviceForm.price),
          unit: serviceForm.unit,
          estimateHours: computedHours,
          workflowSteps: serviceForm.workflowSteps,
          promiseName: finalPromiseName,
          promiseDurationText: durationText,
        };
        LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'SERVICE_UPDATE', `Mengubah layanan [${serviceForm.name}] taraf Rp ${serviceForm.price}`);
      }
    } else {
      const newSrv: Service = {
        id: `srv-${Date.now()}`,
        name: serviceForm.name,
        category: serviceForm.category,
        price: Number(serviceForm.price),
        unit: serviceForm.unit,
        estimateHours: computedHours,
        isActive: true,
        workflowSteps: serviceForm.workflowSteps,
        promiseName: finalPromiseName,
        promiseDurationText: durationText,
      };
      currentServices.push(newSrv);
      LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'SERVICE_CREATE', `Membuat layanan baru [${serviceForm.name}] taraf Rp ${serviceForm.price}`);
    }

    LaughDryDatabase.saveServices(currentServices);
    setServices(currentServices);
    setShowAddService(false);
    setEditingServiceId(null);
    setServiceForm({ 
      name: '', 
      category: 'kiloan', 
      price: 0, 
      unit: 'kg', 
      estimateHours: 48, 
      workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'],
      promiseName: 'Reguler',
      promiseDurationVal: 2,
      promiseDurationUnit: 'Hari',
      sizeOption: 'Sedang'
    });
    loadDatabaseState();
    triggerToast("Layanan berhasil disimpan ke PostgreSQL!");
  };

  const startEditService = (srv: Service) => {
    setEditingServiceId(srv.id);
    
    let initialVal = 2;
    let initialUnit: 'Hari' | 'Jam' = 'Hari';
    if (srv.promiseDurationText) {
      const parts = srv.promiseDurationText.split(' ');
      const val = parseInt(parts[0]);
      if (!isNaN(val)) {
        initialVal = val;
        if (parts[1]?.toLowerCase().startsWith('jam')) {
          initialUnit = 'Jam';
        }
      }
    } else {
      if (srv.estimateHours % 24 === 0) {
        initialVal = srv.estimateHours / 24;
        initialUnit = 'Hari';
      } else {
        initialVal = srv.estimateHours;
        initialUnit = 'Jam';
      }
    }

    setServiceForm({
      name: srv.name,
      category: srv.category,
      price: srv.price,
      unit: srv.unit,
      estimateHours: srv.estimateHours,
      workflowSteps: srv.workflowSteps || ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'],
      promiseName: srv.category === 'satuan' ? 'Reguler' : (srv.promiseName || 'Reguler'),
      promiseDurationVal: initialVal,
      promiseDurationUnit: initialUnit,
      sizeOption: srv.category === 'satuan' ? (srv.promiseName || 'Sedang') : 'Sedang'
    });
    setShowAddService(true);
  };

  const executeDeleteService = (id: string) => {
    const srv = services.find(s => s.id === id);
    if (!srv) return;
    const updated = services.map(s => s.id === id ? { ...s, isActive: false } : s);
    LaughDryDatabase.saveServices(updated);
    setServices(updated);
    LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'SERVICE_DEACTIVATE', `Menonaktifkan layanan [${srv.name}]`);
    setDeleteConfirmService(null);
    loadDatabaseState();
    triggerToast("Layanan berhasil dinonaktifkan!");
  };

  const startEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({
      description: exp.description,
      category: exp.category as any,
      amount: exp.amount,
      branchId: exp.branchId || 'br-1',
    });
    setShowAddExpense(true);
  };

  const executeDeleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    const updated = expenses.filter(e => e.id !== id);
    LaughDryDatabase.saveExpenses(updated);
    setExpenses(updated);
    LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'EXPENSE_DELETE', `Menghapus pengeluaran [${exp.description}]`);
    setDeleteConfirmExpense(null);
    loadDatabaseState();
    triggerToast("Catatan pengeluaran berhasil dihapus!");
  };

  // Expense Create & Update
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentExpenses = [...expenses];
    
    if (editingExpenseId) {
      const idx = currentExpenses.findIndex(ex => ex.id === editingExpenseId);
      if (idx !== -1) {
        currentExpenses[idx] = {
          ...currentExpenses[idx],
          description: expenseForm.description,
          category: expenseForm.category,
          amount: Number(expenseForm.amount),
          branchId: expenseForm.branchId,
        };
        LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'EXPENSE_UPDATE', `Mengubah pengeluaran [${expenseForm.description}] sebesar Rp ${expenseForm.amount}`);
      }
      setEditingExpenseId(null);
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        description: expenseForm.description,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        branchId: expenseForm.branchId,
        date: new Date().toISOString(),
        recordedBy: 'Andi Owner',
      };
      currentExpenses.unshift(newExp);
      LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'EXPENSE_RECORD', `Mencatat pengeluaran [${expenseForm.description}] sebesar Rp ${expenseForm.amount}`);
    }

    LaughDryDatabase.saveExpenses(currentExpenses);
    setExpenses(currentExpenses);
    setShowAddExpense(false);
    setExpenseForm({ description: '', category: 'Detergen/Softener', amount: 0, branchId: 'br-1' });
    loadDatabaseState();
    triggerToast("Pengeluaran operasional berhasil disimpan!");
  };

  // Cashier CRUD
  const handleSaveCashier = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUsers = [...LaughDryDatabase.getUsers()];

    if (editingCashierId) {
      const idx = currentUsers.findIndex(u => u.id === editingCashierId);
      if (idx !== -1) {
        currentUsers[idx] = {
          ...currentUsers[idx],
          name: cashierForm.name,
          username: cashierForm.username,
          password: cashierForm.password,
          branchId: cashierForm.branchId,
        };
        LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'USER_UPDATE', `Mengubah akun kasir [${cashierForm.username}]`);
      }
    } else {
      if (currentUsers.some(u => u.username.toLowerCase() === cashierForm.username.toLowerCase())) {
        alert("Username kasir sudah digunakan!");
        return;
      }
      const newCashier = {
        id: `usr-${Date.now()}`,
        name: cashierForm.name,
        role: 'karyawan' as const,
        email: `${cashierForm.username}@laughdry.co.id`,
        username: cashierForm.username,
        password: cashierForm.password,
        branchId: cashierForm.branchId,
      };
      currentUsers.push(newCashier);
      LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'USER_CREATE', `Membuat akun kasir baru [${cashierForm.username}] untuk cabang ${cashierForm.branchId}`);
    }

    LaughDryDatabase.saveUsers(currentUsers);
    setUsers(currentUsers);
    setShowAddCashier(false);
    setEditingCashierId(null);
    setCashierForm({ name: '', username: '', password: '', branchId: 'br-1' });
    loadDatabaseState();
    triggerToast("Akun kasir berhasil disimpan!");
  };

  const startEditCashier = (u: any) => {
    setEditingCashierId(u.id);
    setCashierForm({
      name: u.name,
      username: u.username,
      password: u.password || '',
      branchId: u.branchId || 'br-1',
    });
    setShowAddCashier(true);
  };

  const executeDeleteCashier = (id: string) => {
    if (id === 'usr-1') {
      alert("Tidak dapat menghapus akun owner!");
      return;
    }
    const userToDel = users.find(u => u.id === id);
    if (!userToDel) return;
    const currentUsers = LaughDryDatabase.getUsers().filter(u => u.id !== id);
    LaughDryDatabase.saveUsers(currentUsers);
    setUsers(currentUsers);
    LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'USER_DELETE', `Menghapus akun kasir [${userToDel.username}]`);
    setDeleteConfirmCashier(null);
    loadDatabaseState();
    triggerToast("Akun kasir berhasil dihapus!");
  };

  const handleSaveOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerForm.name.trim() || !ownerForm.username.trim() || !ownerForm.password.trim()) {
      triggerToast("Semua kolom profil owner harus diisi!");
      return;
    }

    const currentUsers = [...users];
    const ownerIndex = currentUsers.findIndex(u => u.role === 'owner');
    
    if (ownerIndex !== -1) {
      const updatedOwner = {
        ...currentUsers[ownerIndex],
        name: ownerForm.name.trim(),
        username: ownerForm.username.trim().toLowerCase().replace(/\s/g, ''),
        password: ownerForm.password.trim()
      };
      currentUsers[ownerIndex] = updatedOwner;
      
      LaughDryDatabase.saveUsers(currentUsers);
      setUsers(currentUsers);
      
      LaughDryDatabase.logActivity('usr-1', updatedOwner.name, 'owner', 'OWNER_PROFILE_UPDATE', `Mengubah profil owner menjadi [${updatedOwner.name}]`);
      triggerToast("✅ Profil & Hak Akses Owner berhasil disimpan!");
      setShowEditOwner(false);
    } else {
      triggerToast("Gagal menemukan akun owner di database!");
    }
  };

  // Branch database event handlers
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !branchForm.address.trim() || !branchForm.phone.trim()) {
      triggerToast("Semua kolom harus diisi!");
      return;
    }

    let updatedBranches = [...branches];
    if (editingBranchId) {
      // Edit mode
      updatedBranches = updatedBranches.map(b => 
        b.id === editingBranchId ? { ...b, name: branchForm.name.trim(), address: branchForm.address.trim(), phone: branchForm.phone.trim() } : b
      );
      LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'BRANCH_UPDATE', `Mengubah informasi cabang [${branchForm.name}]`);
      triggerToast("✅ Informasi cabang berhasil diubah!");
    } else {
      // Create mode
      const newId = `br-${Date.now()}`;
      const newBranch: Branch = {
        id: newId,
        name: branchForm.name.trim(),
        address: branchForm.address.trim(),
        phone: branchForm.phone.trim(),
      };
      updatedBranches.push(newBranch);
      LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'BRANCH_CREATE', `Menambahkan cabang baru [${branchForm.name}]`);
      triggerToast("✅ Cabang baru berhasil ditambahkan!");
    }

    LaughDryDatabase.saveBranches(updatedBranches);
    setBranches(updatedBranches);
    setBranchForm({ name: '', address: '', phone: '' });
    setShowAddBranch(false);
    setEditingBranchId(null);
  };

  const startEditBranch = (b: Branch) => {
    setBranchForm({ name: b.name, address: b.address, phone: b.phone });
    setEditingBranchId(b.id);
    setShowAddBranch(true);
  };

  const executeDeleteBranch = () => {
    if (!deleteConfirmBranch) return;
    const updatedBranches = branches.filter(b => b.id !== deleteConfirmBranch.id);
    LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'BRANCH_DELETE', `Menghapus cabang [${deleteConfirmBranch.name}]`);
    
    LaughDryDatabase.saveBranches(updatedBranches);
    setBranches(updatedBranches);
    setDeleteConfirmBranch(null);
    triggerToast("🗑️ Cabang berhasil dihapus!");
  };

  // Reset Simulator Data State
  const [showResetDbConfirm, setShowResetDbConfirm] = useState(false);

  const executeResetDatabase = () => {
    LaughDryDatabase.resetToSeed();
    loadDatabaseState();
    LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'SYSTEM_RESET', 'Me-reset database ke kondisi awal (seed)');
    setShowResetDbConfirm(false);
    triggerToast("Database berhasil di-reset ke kondisi awal!");
  };

  // Backup file export simulator
  const handleExportBackup = () => {
    const backupStr = LaughDryDatabase.generateBackupJSONString();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(backupStr);
    const exportFileDefaultName = `laughdry_postgresql_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    LaughDryDatabase.logActivity('usr-1', getOwnerName(), 'owner', 'DATABASE_BACKUP', 'Melakukan ekspor backup database PostgreSQL (.json)');
    triggerToast("File Backup PostgreSQL berhasil diunduh!");
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      triggerToast("⚠️ Tidak ada data transaksi untuk diekspor!");
      return;
    }

    const headers = [
      "ID_Transaksi",
      "No_Nota",
      "ID_Pelanggan",
      "Nama_Pelanggan",
      "No_HP_Pelanggan",
      "ID_Cabang",
      "Total_Tagihan",
      "Metode_Pembayaran",
      "Status_Pembayaran",
      "Status_Cucian",
      "Catatan",
      "Dibuat_Pada",
      "Diubah_Pada",
      "Estimasi_Selesai",
      "Selesai_Pada",
      "Poin_Didapat",
      "Poin_Ditukar",
      "Aroma_Parfum",
      "ID_Kasir",
      "Nama_Kasir",
      "Rincian_Item_JSON"
    ];

    const escapeCSV = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(",")];

    orders.forEach(order => {
      const row = [
        escapeCSV(order.id),
        escapeCSV(order.invoiceNumber),
        escapeCSV(order.customerId),
        escapeCSV(order.customerName),
        escapeCSV(order.customerPhone),
        escapeCSV(order.branchId),
        order.totalAmount,
        escapeCSV(order.paymentMethod),
        escapeCSV(order.paymentStatus),
        escapeCSV(order.status),
        escapeCSV(order.notes),
        escapeCSV(order.createdAt),
        escapeCSV(order.updatedAt),
        escapeCSV(order.estimatedCompletion),
        escapeCSV(order.completedAt),
        order.pointsEarned,
        order.pointsRedeemed || 0,
        escapeCSV(order.perfume),
        escapeCSV(order.cashierId),
        escapeCSV(order.cashierName),
        escapeCSV(JSON.stringify(order.items))
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laughdry_transaksi_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();

    LaughDryDatabase.logActivity('usr-1', getOwnerName(), 'owner', 'EXPORT_CSV', `Mengekspor ${orders.length} riwayat transaksi ke format CSV`);
    triggerToast(`✅ Berhasil mengekspor ${orders.length} transaksi ke CSV!`);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          triggerToast("⚠️ File kosong atau tidak valid!");
          return;
        }
        
        const lines: string[] = [];
        let currentLine = "";
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            inQuotes = !inQuotes;
            currentLine += char;
          } else if (char === '\n' && !inQuotes) {
            lines.push(currentLine.trim());
            currentLine = "";
          } else {
            currentLine += char;
          }
        }
        if (currentLine) {
          lines.push(currentLine.trim());
        }

        if (lines.length < 2) {
          triggerToast("⚠️ Format CSV tidak valid (Kurang dari 2 baris)!");
          return;
        }

        const headerLine = lines[0];
        const splitRow = (rowStr: string): string[] => {
          const result: string[] = [];
          let cur = "";
          let inQ = false;
          for (let i = 0; i < rowStr.length; i++) {
            const c = rowStr[i];
            if (c === '"') {
              inQ = !inQ;
            } else if (c === ',' && !inQ) {
              result.push(cur.trim());
              cur = "";
            } else {
              cur += c;
            }
          }
          result.push(cur.trim());
          return result.map(col => {
            let cleaned = col;
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              cleaned = cleaned.substring(1, cleaned.length - 1);
            }
            return cleaned.replace(/""/g, '"');
          });
        };

        const headers = splitRow(headerLine);
        const idIdx = headers.indexOf("ID_Transaksi");
        const invIdx = headers.indexOf("No_Nota");
        const custIdIdx = headers.indexOf("ID_Pelanggan");
        const custNameIdx = headers.indexOf("Nama_Pelanggan");
        const custPhoneIdx = headers.indexOf("No_HP_Pelanggan");
        const branchIdIdx = headers.indexOf("ID_Cabang");
        const totalIdx = headers.indexOf("Total_Tagihan");
        const payMethodIdx = headers.indexOf("Metode_Pembayaran");
        const payStatusIdx = headers.indexOf("Status_Pembayaran");
        const statusIdx = headers.indexOf("Status_Cucian");
        const notesIdx = headers.indexOf("Catatan");
        const createdIdx = headers.indexOf("Dibuat_Pada");
        const updatedIdx = headers.indexOf("Diubah_Pada");
        const estIdx = headers.indexOf("Estimasi_Selesai");
        const complIdx = headers.indexOf("Selesai_Pada");
        const ptsEarnIdx = headers.indexOf("Poin_Didapat");
        const ptsRedIdx = headers.indexOf("Poin_Ditukar");
        const perfumeIdx = headers.indexOf("Aroma_Parfum");
        const cashierIdIdx = headers.indexOf("ID_Kasir");
        const cashierNameIdx = headers.indexOf("Nama_Kasir");
        const itemsJsonIdx = headers.indexOf("Rincian_Item_JSON");

        if (invIdx === -1 || custNameIdx === -1 || totalIdx === -1) {
          triggerToast("Format kolom CSV salah! Pastikan kolom 'No_Nota', 'Nama_Pelanggan', dan 'Total_Tagihan' tersedia.");
          return;
        }

        const importedOrders: Order[] = [];
        
        for (let k = 1; k < lines.length; k++) {
          if (!lines[k].trim()) continue;
          const cols = splitRow(lines[k]);
          
          if (cols.length < headers.length - 3) continue;

          const orderId = (idIdx !== -1 && cols[idIdx]) ? cols[idIdx] : `ord-${Date.now()}-${k}`;
          const invoiceNumber = cols[invIdx];
          const customerId = (custIdIdx !== -1 && cols[custIdIdx]) ? cols[custIdIdx] : `imported-cust-${k}`;
          const customerName = cols[custNameIdx];
          const customerPhone = (custPhoneIdx !== -1 && cols[custPhoneIdx]) ? cols[custPhoneIdx] : "";
          const branchId = (branchIdIdx !== -1 && cols[branchIdIdx]) ? cols[branchIdIdx] : "br-1";
          const totalAmount = Number(cols[totalIdx]) || 0;
          const paymentMethod = ((payMethodIdx !== -1 && cols[payMethodIdx]) ? cols[payMethodIdx] : "Cash") as any;
          const paymentStatus = ((payStatusIdx !== -1 && cols[payStatusIdx]) ? cols[payStatusIdx] : "Lunas") as any;
          const status = ((statusIdx !== -1 && cols[statusIdx]) ? cols[statusIdx] : "Selesai") as any;
          const notes = (notesIdx !== -1 && cols[notesIdx]) ? cols[notesIdx] : "";
          const createdAt = (createdIdx !== -1 && cols[createdIdx]) ? cols[createdIdx] : new Date().toISOString();
          const updatedAt = (updatedIdx !== -1 && cols[updatedIdx]) ? cols[updatedIdx] : new Date().toISOString();
          const estimatedCompletion = (estIdx !== -1 && cols[estIdx]) ? cols[estIdx] : new Date().toISOString();
          const completedAt = (complIdx !== -1 && cols[complIdx]) ? cols[complIdx] : undefined;
          const pointsEarned = ptsEarnIdx !== -1 ? (Number(cols[ptsEarnIdx]) || 0) : 0;
          const pointsRedeemed = ptsRedIdx !== -1 ? (Number(cols[ptsRedIdx]) || 0) : undefined;
          const perfume = (perfumeIdx !== -1 && cols[perfumeIdx]) ? cols[perfumeIdx] as any : undefined;
          const cashierId = (cashierIdIdx !== -1 && cols[cashierIdIdx]) ? cols[cashierIdIdx] : undefined;
          const cashierName = (cashierNameIdx !== -1 && cols[cashierNameIdx]) ? cols[cashierNameIdx] : undefined;
          
          let items: any[] = [];
          if (itemsJsonIdx !== -1 && cols[itemsJsonIdx]) {
            try {
              items = JSON.parse(cols[itemsJsonIdx]);
            } catch {
              items = [{
                id: `item-${Date.now()}-${k}`,
                serviceId: "srv-1",
                serviceName: "Layanan Hasil Import CSV",
                price: totalAmount,
                quantity: 1,
                subtotal: totalAmount
              }];
            }
          } else {
            items = [{
              id: `item-${Date.now()}-${k}`,
              serviceId: "srv-1",
              serviceName: "Cuci Satuan Kiloan",
              price: totalAmount,
              quantity: 1,
              subtotal: totalAmount
            }];
          }

          const newOrder: Order = {
            id: orderId,
            invoiceNumber,
            customerId,
            customerName,
            customerPhone,
            branchId,
            items,
            totalAmount,
            paymentMethod,
            paymentStatus,
            status,
            notes,
            createdAt,
            updatedAt,
            estimatedCompletion,
            completedAt,
            pointsEarned,
            pointsRedeemed,
            perfume,
            cashierId,
            cashierName
          };
          importedOrders.push(newOrder);
        }

        if (importedOrders.length === 0) {
          triggerToast("⚠️ Tidak ada data valid yang bisa diimpor.");
          return;
        }

        const currentOrders = [...orders];
        let importCount = 0;
        
        importedOrders.forEach(imp => {
          const existsIdx = currentOrders.findIndex(o => o.id === imp.id || o.invoiceNumber === imp.invoiceNumber);
          if (existsIdx !== -1) {
            currentOrders[existsIdx] = imp;
          } else {
            currentOrders.push(imp);
            importCount++;
          }
        });

        LaughDryDatabase.saveOrders(currentOrders);
        setOrders(currentOrders);

        const currentCustomers = [...customers];
        let addedCustomers = 0;
        importedOrders.forEach(imp => {
          const custExists = currentCustomers.some(c => c.id === imp.customerId || c.phone === imp.customerPhone);
          if (!custExists && imp.customerName) {
            const newCust: Customer = {
              id: imp.customerId,
              name: imp.customerName,
              phone: imp.customerPhone,
              address: "Hasil Import CSV",
              depositBalance: 0,
              loyaltyPoints: 0,
              createdAt: imp.createdAt,
              lastActive: imp.updatedAt
            };
            currentCustomers.push(newCust);
            addedCustomers++;
          }
        });
        if (addedCustomers > 0) {
          LaughDryDatabase.saveCustomers(currentCustomers);
          setCustomers(currentCustomers);
        }

        LaughDryDatabase.logActivity('usr-1', getOwnerName(), 'owner', 'IMPORT_CSV', `Mengimpor ${importedOrders.length} transaksi dari file CSV`);
        triggerToast(`🎉 Sukses memproses ${importedOrders.length} transaksi (${importCount} baru, ${importedOrders.length - importCount} update) & ${addedCustomers} pelanggan baru!`);
        
        if (e.target) {
          e.target.value = "";
        }
      } catch (err: any) {
        console.error(err);
        triggerToast(`⚠️ Gagal mengimpor file CSV: ${err.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  const handleTemplateChange = (id: string, body: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, body } : t);
    LaughDryDatabase.saveTemplates(updated);
    setTemplates(updated);
    triggerToast("Template WhatsApp berhasil disimpan!");
  };

  const handleSettingsChange = (field: string, val: any) => {
    const updated = { ...settings, [field]: val };
    LaughDryDatabase.saveSettings(updated);
    setSettings(updated);
  };

  // CALCULATIONS (with branch filters)
  const filteredOrders = orders.filter(o => selectedBranch === 'all' || o.branchId === selectedBranch);
  const filteredExpenses = expenses.filter(e => {
    const branchMatch = selectedBranch === 'all' || e.branchId === selectedBranch;
    if (!branchMatch) return false;
    
    // Check Date Range if set
    const expenseDateOnly = e.date.split('T')[0];
    if (expenseStartDate && expenseDateOnly < expenseStartDate) return false;
    if (expenseEndDate && expenseDateOnly > expenseEndDate) return false;
    
    return true;
  });

  // Core indicators
  const totalOmzet = filteredOrders
    .filter(o => o.paymentStatus === 'Lunas' && o.status !== OrderStatus.DIBATALKAN)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrdersCount = filteredOrders.filter(o => o.status !== OrderStatus.SELESAI && o.status !== OrderStatus.DIBATALKAN).length;
  const completedOrdersCount = filteredOrders.filter(o => o.status === OrderStatus.SELESAI).length;
  
  const totalOPEX = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const labaKotor = totalOmzet; // Revenue riil
  const labaBersih = totalOmzet - totalOPEX;

  const orderHariIniCount = filteredOrders.filter(o => o.createdAt.startsWith('2026-05-30')).length;
  const omzetHariIni = filteredOrders
    .filter(o => o.createdAt.startsWith('2026-05-30') && o.paymentStatus === 'Lunas' && o.status !== OrderStatus.DIBATALKAN)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Business Intelligence Forecasting (Linear Regression trend)
  // Let's analyze omzet of 28th, 29th, 30th May 2026 to output standard forecast
  const getOmzetByDate = (dateStr: string) => {
    return filteredOrders
      .filter(o => o.createdAt.startsWith(dateStr) && o.paymentStatus === 'Lunas' && o.status !== OrderStatus.DIBATALKAN)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const o28 = getOmzetByDate('2026-05-28');
  const o29 = getOmzetByDate('2026-05-29');
  const o30 = getOmzetByDate('2026-05-30');

  // Simple Trend Projection: y = ax + b
  // let x = 1 (28 May), 2 (29 May), 3 (30 May). Forecast for x = 4 (31 May)
  // Fit slope using linear trend of indices 1,2,3
  const meanX = 2;
  const meanY = (o28 + o29 + o30) / 3;
  const slopeNumerator = (1 - meanX) * (o28 - meanY) + (2 - meanX) * (o29 - meanY) + (3 - meanX) * (o30 - meanY);
  const slopeDenominator = (1 - meanX) ** 2 + (2 - meanX) ** 2 + (3 - meanX) ** 2;
  const slope = slopeDenominator !== 0 ? slopeNumerator / slopeDenominator : 0;
  const intercept = meanY - slope * meanX;
  const projectedOmzetEsok = Math.max(0, Math.round(slope * 4 + intercept));

  // Customer retention
  const inactiveCustomers = customers.filter(c => {
    const elapsedDays = (new Date('2026-05-30').getTime() - new Date(c.lastActive).getTime()) / (1000 * 60 * 60 * 24);
    return elapsedDays > 90; // > 3 months
  });

  const activeCustomersCount = customers.length - inactiveCustomers.length;

  // Group services by Name
  const groupedServices = React.useMemo(() => {
    const activeServices = services.filter(s => s.isActive);
    const groups: { [name: string]: Service[] } = {};
    activeServices.forEach(s => {
      if (!groups[s.name]) {
        groups[s.name] = [];
      }
      groups[s.name].push(s);
    });
    return groups;
  }, [services]);

  // Real-time Cashier Performance Calculation
  const cashierMetricsData = React.useMemo(() => {
    const cashierMap: { [key: string]: { id: string; name: string; username: string; totalRevenue: number; transactionCount: number; avatar: string } } = {};

    // 1. Initialise existing kasir users
    users.forEach(u => {
      if (u.role === 'karyawan') {
        cashierMap[u.id] = {
          id: u.id,
          name: u.name,
          username: u.username || u.name.split(' ')[0].toLowerCase(),
          totalRevenue: 0,
          transactionCount: 0,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.name)}`,
        };
      }
    });

    // 2. Aggregate from orders
    orders.forEach(o => {
      if (o.status !== OrderStatus.DIBATALKAN) {
        const cashierId = o.cashierId || 'usr-2'; // Default to Rian
        const cashierName = o.cashierName || 'Rian Karyawan';

        if (!cashierMap[cashierId]) {
          cashierMap[cashierId] = {
            id: cashierId,
            name: cashierName,
            username: cashierName.split(' ')[0].toLowerCase(),
            totalRevenue: 0,
            transactionCount: 0,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cashierName)}`,
          };
        }

        cashierMap[cashierId].totalRevenue += o.totalAmount;
        cashierMap[cashierId].transactionCount += 1;
      }
    });

    return Object.values(cashierMap);
  }, [orders, users]);

  // Real-time Monthly Financial Summary Data
  const monthlyRevenueData = React.useMemo(() => {
    const [year, month] = selectedMonthlySummaryMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const datePrefix = `${selectedMonthlySummaryMonth}-${dayStr}`;
      
      const dailyRevenue = filteredOrders
        .filter(o => o.createdAt.startsWith(datePrefix) && o.paymentStatus === 'Lunas' && o.status !== OrderStatus.DIBATALKAN)
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const dailyTrxCount = filteredOrders
        .filter(o => o.createdAt.startsWith(datePrefix) && o.status !== OrderStatus.DIBATALKAN)
        .length;

      data.push({
        day: `${day}`,
        date: datePrefix,
        revenue: dailyRevenue,
        transactions: dailyTrxCount,
      });
    }
    return data;
  }, [selectedMonthlySummaryMonth, filteredOrders]);

  const monthlyReportStats = React.useMemo(() => {
    let totalRevenue = 0;
    let totalTransactions = 0;
    let peakRevenue = 0;
    let peakDay = '';
    let lowestRevenue = Infinity;
    let lowestDay = '';
    let activeDaysCount = 0;

    monthlyRevenueData.forEach(d => {
      totalRevenue += d.revenue;
      totalTransactions += d.transactions;
      if (d.revenue > peakRevenue) {
        peakRevenue = d.revenue;
        peakDay = d.day;
      }
      if (d.revenue > 0 && d.revenue < lowestRevenue) {
        lowestRevenue = d.revenue;
        lowestDay = d.day;
      }
      if (d.revenue > 0) {
        activeDaysCount++;
      }
    });

    if (lowestRevenue === Infinity) {
      lowestRevenue = 0;
    }

    const averageRevenue = totalRevenue / monthlyRevenueData.length;

    return {
      totalRevenue,
      totalTransactions,
      peakRevenue,
      peakDay,
      lowestRevenue,
      lowestDay,
      averageRevenue,
      activeDaysCount
    };
  }, [monthlyRevenueData]);

  return (
    <div className="space-y-6" id="owner-dashboard-root">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 border border-slate-800 text-sky-400 px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-medium text-white">{showToast}</span>
        </div>
      )}

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            Hak Akses: <span className="text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full font-bold">Owner ({getOwnerName()})</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[10.5px] text-red-650 hover:text-red-700 hover:underline font-extrabold bg-red-50 px-2 py-0.5 rounded transition"
                title="Keluar dari sesi Owner"
              >
                Keluar (Logout)
              </button>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-500 animate-pulse" />
            Dasbor Analitik Bisnis & Konsol Kontrol
          </h2>
        </div>

        {/* Filters and Utilities */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-medium text-slate-700 border-none outline-none focus:ring-0"
              id="branch-selector"
            >
              <option value="all">Semua Cabang Laundry</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold tracking-tight transition"
            id="btn-backup-postgres"
            title="Download PostgreSQL schema content"
          >
            <Download className="w-3.5 h-3.5" />
            Backup DB
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-emerald-250 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold tracking-tight transition"
            id="btn-export-csv"
            title="Ekspor seluruh riwayat transaksi ke format CSV untuk audit"
          >
            <FileText className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>

          <label
            htmlFor="csv-import-file"
            className="flex items-center gap-1.5 px-3 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer"
            id="label-import-csv"
            title="Impor riwayat transaksi dari file CSV (Restore data)"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor CSV
            <input
              type="file"
              id="csv-import-file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowResetDbConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 text-red-650 hover:bg-red-100 rounded-xl text-xs font-semibold tracking-tight transition"
            id="btn-reset-db"
            title="Reset system database to seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Dashboard Sub Navigation */}
      <div className="flex gap-1 border-b border-slate-100 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'analytics' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-analytics"
        >
          Ringkasan Finansial
        </button>
        <button
          onClick={() => setActiveSubTab('bi')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'bi' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-bi"
        >
          📊 Business Intelligence (BI)
        </button>
        <button
          onClick={() => setActiveSubTab('report')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'report' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-report"
        >
          📈 Laporan Performa
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'services' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-services"
        >
          ⚙️ Kelola Layanan (Tarif)
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'expenses' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-expenses"
        >
          💸 Pengeluaran Usaha
        </button>
        <button
          onClick={() => setActiveSubTab('cashiers')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'cashiers' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-cashiers"
        >
          👥 Atur Kasir
        </button>
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'branches' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-branches"
        >
          🏢 Kelola Cabang
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'settings' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-settings"
        >
          🔧 Pengaturan & WA Templates
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'audit' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-audit"
        >
          🔐 Audit Log Keamanan
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'attendance' ? 'bg-indigo-650 text-white font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-100'
          }`}
          id="subtab-attendance"
        >
          📅 Rekap Absensi Karyawan
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. REALTIME KEY FINANCIAL PERFORMANCES */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Multi Grid KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div
              onClick={() => setShowTodayTransactionsModal(true)}
              className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              title="Klik untuk melihat detail transaksi hari ini"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-emerald-600 transition-colors">Omzet Hari Ini</span>
                <span className="p-1 px-1.5 rounded-full bg-emerald-50 text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Live
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">Rp {omzetHariIni.toLocaleString('id-ID')}</div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[10px] text-indigo-600 font-mono">{orderHariIniCount} Order terbuat</span>
                  <span className="text-[9px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Lihat Detail ➔</span>
                </div>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Omzet Akumulasi</span>
                <span className="p-1 bg-violet-50 text-violet-700 rounded-full">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-lg font-extrabold text-slate-800">Rp {totalOmzet.toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Pendapatan lunas terakumulasi</div>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Operasional (OPEX)</span>
                <span className="p-1 bg-red-50 text-red-700 rounded-full">
                  <TrendingDown className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-lg font-extrabold text-red-600">Rp {totalOPEX.toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sewa, Gaji, Air, Detergen</div>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Estimasi Laba Bersih</span>
                <span className={`p-1 rounded-full text-[10px] font-bold ${labaBersih >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {labaBersih >= 0 ? 'Surplus' : 'Defisit'}
                </span>
              </div>
              <div className="mt-2.5">
                <div className={`text-lg font-extrabold ${labaBersih >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  Rp {labaBersih.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Omzet dikurang total OPEX</div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Order Aktif Diproses</div>
              <div className="text-sm font-bold text-slate-800">{activeOrdersCount} Order</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Order Selesai</div>
              <div className="text-sm font-bold text-slate-800">{completedOrdersCount} Order</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Rasio Retensi CRM</div>
              <div className="text-sm font-bold text-slate-800">{Math.round((activeCustomersCount / (customers.length || 1)) * 105)}%</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Rata-rata Pendapatan / Order</div>
              <div className="text-sm font-bold text-slate-800">
                Rp {Math.round(totalOmzet / (filteredOrders.length || 1)).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue Trend 28-30 May */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-sm text-slate-800 mb-3 block">Grafik Omzet & Margin Usaha Hari Berjalan (Mei 2026)</h4>
              <div className="h-48 flex items-end justify-between gap-4 border-b border-slate-100 pb-2 relative font-sans">
                {/* Horizontal Guide Lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100/60 pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100/60 pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100/60 pointer-events-none"></div>

                {/* Day 28 */}
                <div className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="text-[10px] font-bold text-slate-900 mb-1 group-hover:block opacity-80">Rp {o28.toLocaleString()}</div>
                  <div className="w-full bg-slate-200 group-hover:bg-sky-500 rounded-t-lg transition-all" style={{ height: '70px' }}></div>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold">28 Mei (Real)</span>
                </div>

                {/* Day 29 */}
                <div className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="text-[10px] font-bold text-slate-900 mb-1 group-hover:block opacity-80">Rp {o29.toLocaleString()}</div>
                  <div className="w-full bg-slate-200 group-hover:bg-sky-500 rounded-t-lg transition-all" style={{ height: '95px' }}></div>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold">29 Mei (Real)</span>
                </div>

                {/* Day 30 */}
                <div className="flex-1 flex flex-col items-center group relative cursor-pointer text-indigo-700">
                  <div className="text-[10px] font-bold text-indigo-700 mb-1">Rp {o30.toLocaleString()}</div>
                  <div className="w-full bg-indigo-500 rounded-t-lg shadow-sm" style={{ height: '115px' }}></div>
                  <span className="text-[10px] text-indigo-700 font-bold mt-1">30 Mei (Hari Ini)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-200 rounded"></span> Omzet Reguler</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded"></span> Hari Terkini (Sabtu)</div>
              </div>
            </div>

            {/* Chart 2: Expense Proportions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-sm text-slate-800 mb-3 block">Bauran Pengeluaran Operasional (OPEX Breakdown)</h4>
              <div className="space-y-3.5 pt-1 text-xs">
                {/* Salary */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Gaji & Kesejahteraan Karyawan</span>
                    <span>Rp {expenses.filter(e => e.category === 'Gaji').reduce((s, e) => s + e.amount, 0).toLocaleString()} ({(Math.round((expenses.filter(e => e.category === 'Gaji').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100)) || 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${(expenses.filter(e => e.category === 'Gaji').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100}%` }}></div>
                  </div>
                </div>

                {/* Utilities (Listrik + Air) */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Utilitas Listrik, Gas & Air</span>
                    <span>Rp {expenses.filter(e => e.category === 'Listrik' || e.category === 'Air').reduce((s, e) => s + e.amount, 0).toLocaleString()} ({(Math.round((expenses.filter(e => e.category === 'Listrik' || e.category === 'Air').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100)) || 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(expenses.filter(e => e.category === 'Listrik' || e.category === 'Air').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100}%` }}></div>
                  </div>
                </div>

                {/* Detergents */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Detergen, Softener & Perlengkapan Harian</span>
                    <span>Rp {expenses.filter(e => e.category === 'Detergen/Softener' || e.category === 'Perlengkapan').reduce((s, e) => s + e.amount, 0).toLocaleString()} ({(Math.round((expenses.filter(e => e.category === 'Detergen/Softener' || e.category === 'Perlengkapan').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100)) || 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(expenses.filter(e => e.category === 'Detergen/Softener' || e.category === 'Perlengkapan').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100}%` }}></div>
                  </div>
                </div>

                {/* Maintenance / Transport */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Pemeliharaan Mesin & BBM Transport</span>
                    <span>Rp {expenses.filter(e => e.category === 'Maintenance' || e.category === 'Transportasi').reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-700 h-full rounded-full" style={{ width: `${(expenses.filter(e => e.category === 'Maintenance' || e.category === 'Transportasi').reduce((s, e) => s + e.amount, 0) / (totalOPEX || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== MODULE: FINANCIAL MONTHLY SUMMARY ==================== */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-sky-50 text-sky-600 rounded-lg text-xs leading-none">
                    📈
                  </span>
                  Laporan Ringkasan Bulanan (Financial Monthly Summary)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Pantau ringkasan arus kas, rata-rata pendapatan harian, dan visualisasi performa omzet harian Anda.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-sans">Pilih Periode:</span>
                <select
                  value={selectedMonthlySummaryMonth}
                  onChange={(e) => setSelectedMonthlySummaryMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-150 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 outline-none transition-colors cursor-pointer"
                >
                  <option value="2026-05">Mei 2026 (Demo Berisi Data)</option>
                  <option value="2026-06">Juni 2026 (Bulan Berjalan)</option>
                  <option value="2026-07">Juli 2026 (Mendatang)</option>
                </select>
              </div>
            </div>

            {/* Comprehensive KPI Widgets Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100/80 rounded-2xl space-y-1">
                <span className="text-[9.5px] font-black uppercase text-emerald-700 tracking-wider block">Total Omzet Bulan Ini</span>
                <div className="text-base font-extrabold text-slate-900 font-sans">
                  Rp {monthlyReportStats.totalRevenue.toLocaleString('id-ID')}
                </div>
                <p className="text-[9.5px] text-slate-500 font-medium">Semua pendapatan lunas untuk filter cabang terdaftar.</p>
              </div>

              {/* Stat 2 */}
              <div className="p-4 bg-sky-50/40 border border-sky-100/80 rounded-2xl space-y-1">
                <span className="text-[9.5px] font-black uppercase text-sky-700 tracking-wider block">Rata-Rata Omzet Harian</span>
                <div className="text-base font-extrabold text-slate-900 font-sans">
                  Rp {Math.round(monthlyReportStats.averageRevenue).toLocaleString('id-ID')}
                </div>
                <p className="text-[9.5px] text-slate-500 font-medium font-sans">Rata-rata pendapatan harian bersih.</p>
              </div>

              {/* Stat 3 */}
              <div className="p-4 bg-violet-50/40 border border-violet-100/80 rounded-2xl space-y-1">
                <span className="text-[9.5px] font-black uppercase text-violet-700 tracking-wider block">Volume Transaksi</span>
                <div className="text-base font-extrabold text-slate-900 font-sans">
                  {monthlyReportStats.totalTransactions} Order
                </div>
                <p className="text-[9.5px] text-slate-500 font-medium">Banyaknya pemesanan laundry terdaftar.</p>
              </div>

              {/* Stat 4 */}
              <div className="p-4 bg-amber-50/40 border border-amber-100/80 rounded-2xl space-y-1">
                <span className="text-[9.5px] font-black uppercase text-amber-800 tracking-wider block">Omzet Puncak (Peak Day)</span>
                <div className="text-base font-extrabold text-emerald-800 font-sans font-mono text-[11px] truncate" title={monthlyReportStats.peakRevenue > 0 ? `Hari ${monthlyReportStats.peakDay} (Rp ${monthlyReportStats.peakRevenue.toLocaleString('id-ID')})` : 'N/A'}>
                  {monthlyReportStats.peakRevenue > 0 ? `Hari ${monthlyReportStats.peakDay}: Rp ${monthlyReportStats.peakRevenue.toLocaleString('id-ID')}` : 'N/A'}
                </div>
                <p className="text-[9.5px] text-slate-500 font-medium">Hari dengan capaian pendapatan lunas tertinggi.</p>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-slate-50/40 border border-slate-150 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-700 font-sans uppercase tracking-wider">Diagram Pendapatan Harian Kumulatif</h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-sans">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Omzet Lunas (Harian)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Hari Omzet Puncak
                  </span>
                </div>
              </div>
              <div className="h-64 w-full text-[10.5px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRevenueData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                    <Tooltip
                      formatter={(value: any, name: any) => {
                        return [`Rp ${value.toLocaleString('id-ID')}`, "Pendapatan Lunas"];
                      }}
                      labelFormatter={(label) => `Hari ke-${label} (${selectedMonthlySummaryMonth})`}
                      contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}
                    />
                    <Bar dataKey="revenue" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={22}>
                      {monthlyRevenueData.map((entry, index) => {
                        const isPeak = entry.revenue === monthlyReportStats.peakRevenue && entry.revenue > 0;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={isPeak ? '#10B981' : '#0EA5E9'} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500 text-center leading-relaxed">
                💡 <span className="font-bold">Tips Analitik:</span> Batang berwarna <span className="font-bold text-emerald-500">Hijau</span> menandakan hari dengan omzet puncak yang diraih sepanjang bulan.
              </div>
            </div>
          </div>

          {/* ==================== MODULE: REAL-TIME CASHIER PERFORMANCE ==================== */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Dasbor Produktivitas Staf & Kasir (Real-Time)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Pantau omzet bersih, jumlah order, dan performa kasir di seluruh cabang terdaftar secara real-time.</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-3 rounded-full border border-slate-150">
                <span className="text-[10px] font-bold text-slate-500 font-sans">Total Kasir Aktif:</span>
                <span className="text-[10.5px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-sans">
                  {cashierMetricsData.length} Staff
                </span>
              </div>
            </div>

            {/* Cashier Scoreboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cashierMetricsData.map((cashier) => (
                <div key={cashier.id} className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl flex items-center gap-4 hover:border-sky-200 hover:bg-sky-50/10 transition-all duration-200">
                  <img src={cashier.avatar} alt={cashier.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-indigo-50" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{cashier.name}</h4>
                      <span className="text-[9px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded uppercase">@{cashier.username}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 text-[10.5px] pt-1">
                      <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Omzet Buku</span>
                        <strong className="text-slate-800 font-extrabold font-mono">Rp {cashier.totalRevenue.toLocaleString()}</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Qty Transaksi</span>
                        <strong className="text-slate-800 font-extrabold font-mono">{cashier.transactionCount} Order</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts Visual Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Chart 1: Revenue by Cashier */}
              <div className="p-4 bg-slate-50/30 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-755 font-sans uppercase tracking-wider">Perbandingan Pendapatan Bersih per Kasir</h4>
                  <span className="text-[9px] text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded-full font-bold uppercase">Bar Chart</span>
                </div>
                <div className="h-60 w-full text-[10.5px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cashierMetricsData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={10.5} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10.5} tickFormatter={(value) => `Rp ${value >= 1000000 ? (value / 1000000).toFixed(1) + 'jt' : value.toLocaleString()}`} />
                      <Tooltip
                        formatter={(value: any) => [`Rp ${value.toLocaleString()}`, "Total Omzet"]}
                        contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}
                      />
                      <Bar dataKey="totalRevenue" fill="#38BDF8" radius={[8, 8, 0, 0]} maxBarSize={45}>
                        {cashierMetricsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#0EA5E9'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Transaction Count Shares */}
              <div className="p-4 bg-slate-50/30 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-755 font-sans uppercase tracking-wider">Distribusi Volume Transaksi Kasir</h4>
                  <span className="text-[9px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold uppercase">Pie Chart</span>
                </div>
                
                {cashierMetricsData.some(c => c.transactionCount > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="h-60 md:col-span-7 w-full text-[10.5px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cashierMetricsData}
                            dataKey="transactionCount"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {cashierMetricsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#0EA5E9'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} Order`, "Volume Transaksi"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Index Kontribusi:</div>
                      {cashierMetricsData.map((entry, index) => (
                        <div key={entry.id} className="flex items-center gap-2 text-[10.5px]">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: index % 2 === 0 ? '#4F46E5' : '#0EA5E9' }}></span>
                          <span className="text-slate-650 truncate font-semibold">{entry.name}</span>
                          <span className="font-bold text-slate-800 ml-auto font-mono">({entry.transactionCount} trx)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-60 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    <span>Belum ada transaksi produktif yang diproses</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BUSINESS INTELLIGENCE TOOLS */}
      {activeSubTab === 'bi' && (
        <div className="space-y-6 animate-fadeIn text-xs" id="bi-sub-panel">
          
          {/* Trend Predictive Forecasting */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 text-white border border-slate-800">
            <div className="flex items-center gap-2 text-[#38BDF8] font-bold uppercase tracking-wider text-[10px] mb-1">
              <TrendingUp className="w-4 h-4 text-sky-405 text-sky-400" />
              Algoritma Proyeksi Tren Linear & Prediksi Omzet Esok Hari
            </div>
            <h3 className="text-base font-bold text-white">Trend Forecasting (Laju Omzet): Rp {projectedOmzetEsok.toLocaleString('id-ID')}</h3>
            <p className="text-slate-350 mt-1 leading-relaxed max-w-3xl">
              Model Linear Regression menganalisis historis pendapatan harian Laundry Kita dari tanggal <strong>28-29-30 Mei 2026</strong>. Berdasarkan kurva kecenderungan pertumbuhan mingguan, estimasi omzet yang akan diterima kasir besok, tanggal <strong>31 Mei 2026</strong> diproyeksikan berada pada angka di atas.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 border border-slate-800">
                <div className="opacity-70 text-[10px]">Nilai Slope (Laju):</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">+{slope >= 0 ? 'Rp ' + Math.abs(Math.round(slope)).toLocaleString() : 'Rp ' + Math.round(slope).toLocaleString()} / hari</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-slate-800">
                <div className="opacity-70 text-[10px]">Kurva Koefisien:</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">Kecepatan Regresi Positif</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-slate-800">
                <div className="opacity-70 text-[10px]">Strategi Kapasitas:</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">Optimalisasi Cuci 4 Operator</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cohort Customer Retention analysis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Analisis Kohort & loyalitas Langganan Laundry</h4>
              <p className="text-slate-500 leading-relaxed">
                Menyajikan visibilitas persentase pelanggan setia yang terus kembali melakukan order ulang (member retention) dari bulan mendaftarnya.
              </p>
              
              <div className="space-y-2 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-16 font-semibold text-slate-600 bg-slate-50 p-1 rounded text-center shrink-0">Nov 2025</span>
                  <div className="flex-1 bg-sky-500/10 border border-sky-500/10 text-sky-700 font-bold py-1 px-2.5 rounded flex justify-between" style={{ width: '85%' }}>
                    <span>85% Retained</span>
                    <span>Budi, Joko, dkk</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 font-semibold text-slate-600 bg-slate-50 p-1 rounded text-center shrink-0">Jan 2026</span>
                  <div className="flex-1 bg-sky-505/5 bg-sky-500/5 border border-sky-500/10 text-sky-600 py-1 px-2.5 rounded flex justify-between" style={{ width: '60%' }}>
                    <span>60% Retained</span>
                    <span>Diana Lestari, dkk</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 font-semibold text-slate-600 bg-slate-50 p-1 rounded text-center shrink-0">Feb 2026</span>
                  <div className="flex-1 bg-red-50 border border-red-200 text-red-700 py-1 px-2.5 rounded flex justify-between" style={{ width: '25%' }}>
                    <span>25% Retained (Atensi)</span>
                    <span>Amalia Siregar, dkk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inactive Custom Alert with "WhatsApp Reactivation" */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Targeting Pelanggan Tidak Aktif (&gt;90 Hari)</h4>
                <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]">{inactiveCustomers.length} Terdeteksi</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Gunakan kueri cerdas untuk mencatat pelanggan yang absen lebih dari 3 bulan agar dapat dikirimkan blast promosi re-aktivasi melalui integrasi WhatsApp.
              </p>

              <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto">
                {inactiveCustomers.map(c => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Absen Sejak: {new Date(c.lastActive).toLocaleDateString()} ({c.phone})</div>
                    </div>
                    <button
                      onClick={() => {
                        LaughDryDatabase.logActivity('usr-1', 'Andi Owner', 'owner', 'WHATSAPP_RE_ENGAGE', `Mengirimkan file pemberitahuan promo loyalitas khusus ke ${c.name} (${c.phone})`);
                        triggerToast(`Simulasi WhatsApp Re-Aktivasi berhasil terpancar ke ${c.name}!`);
                      }}
                      className="px-2.5 py-1 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition text-[10px] shrink-0"
                    >
                      Kirim Promo WA
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KELOLA LAYANAN & TARIF */}
      {activeSubTab === 'services' && (
        <div className="space-y-6 animate-fadeIn" id="services-settings-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Kelola Katalog Layanan, Estimasi, & Unit Pengukuran</h3>
            <button
              onClick={() => {
                setEditingServiceId(null);
                setServiceForm({ 
                  name: '', 
                  category: 'kiloan', 
                  price: 0, 
                  unit: 'kg', 
                  estimateHours: 48, 
                  workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'],
                  promiseName: 'Reguler',
                  promiseDurationVal: 2,
                  promiseDurationUnit: 'Hari'
                });
                setShowAddService(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              id="btn-add-service"
            >
              <Plus className="w-4 h-4" /> Tambah Layanan Baru
            </button>
          </div>

          {/* Form Add Service */}
          {showAddService && (
            <form onSubmit={handleSaveService} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 max-w-xl animate-scaleIn">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                {editingServiceId ? 'Edit Layanan Laundry' : 'Input Layanan Laundry Baru'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Nama Layanan:</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="Contoh: Bed Cover Large (Satuan)"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-emerald-600 focus:outline-none"
                    id="service-name-input"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Kategori Model:</label>
                  <button
                    type="button"
                    onClick={() => setActivePopupField('category')}
                    className="w-full bg-white border border-slate-200 hover:border-slate-350 rounded-lg p-2.5 text-left focus:outline-none transition cursor-pointer flex justify-between items-center text-xs text-slate-800 font-bold"
                    id="service-category-input-btn"
                  >
                    <span>{serviceForm.category === 'kiloan' ? '🧺 Laundry Kiloan (Berat kg)' : '🧥 Laundry Satuan (Per Biji)'}</span>
                    <span className="text-slate-400 text-[10px]">▼ Ubah</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Harga Layanan (IDR/Unit):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    placeholder="8000"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-emerald-600 focus:outline-none text-xs"
                    id="service-price-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Unit Pengukuran:</label>
                  <button
                    type="button"
                    onClick={() => setActivePopupField('unit')}
                    className="w-full bg-white border border-slate-200 hover:border-slate-350 rounded-lg p-2.5 text-left focus:outline-none transition cursor-pointer flex justify-between items-center text-xs text-slate-800 font-bold"
                    id="service-unit-input-btn"
                  >
                    <span>📦 Per {serviceForm.unit || 'kg'} ({serviceForm.category === 'kiloan' ? 'Kiloan' : 'Satuan'})</span>
                    <span className="text-slate-400 text-[10px]">▼ Ubah</span>
                  </button>
                </div>

                {serviceForm.category === 'satuan' ? (
                  <div className="space-y-1 md:col-span-2 bg-amber-50/55 p-3.5 rounded-2xl border border-amber-200/50">
                    <label className="text-amber-800 font-bold block text-xs">Ukuran / Klasifikasi Satuan:</label>
                    <p className="text-[10px] text-slate-400 mb-1.5">Klasifikasikan ukuran satuan ini (bukan estimasi waktu penyelesaian):</p>
                    <button
                      type="button"
                      onClick={() => setActivePopupField('sizeOption')}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 rounded-lg p-2.5 text-left focus:outline-none transition cursor-pointer flex justify-between items-center text-xs text-slate-800 font-bold"
                      id="service-size-option-input-btn"
                    >
                      <span>📏 Ukuran {serviceForm.sizeOption || 'Sedang'}</span>
                      <span className="text-slate-400 text-[10px]">▼ Ubah</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-semibold block">Nama Janji Penyelesaian:</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.promiseName}
                        onChange={(e) => setServiceForm({ ...serviceForm, promiseName: e.target.value })}
                        placeholder="Contoh: Reguler, Cepat, Express"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-emerald-600 focus:outline-none text-xs"
                        id="service-promise-name-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 font-semibold block">Waktu Penyelesaian:</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          min="1"
                          value={serviceForm.promiseDurationVal}
                          onChange={(e) => setServiceForm({ ...serviceForm, promiseDurationVal: Number(e.target.value) })}
                          placeholder="Contoh: 4"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-emerald-600 focus:outline-none text-xs flex-1"
                          id="service-promise-val-input"
                        />
                        <button
                          type="button"
                          onClick={() => setActivePopupField('promiseDurationUnit')}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 font-bold text-xs shrink-0 text-slate-800 transition cursor-pointer flex items-center gap-1.5"
                          id="service-promise-unit-input-btn"
                        >
                          <span>⏱️ {serviceForm.promiseDurationUnit}</span>
                          <span className="text-[9px] text-slate-400">▼</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2 md:col-span-2 bg-[#F8FAFC] border border-slate-150 p-4 rounded-2xl">
                  <label className="text-[#0F172A] font-bold block text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Workflow & Tahapan Kerja Operasional Layanan
                  </label>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Pilih tahapan kerja yang akan dilalui cucian untuk layanan ini. Anda bisa melewati beberapa proses (misal: "Setrika Saja" tidak perlu tahapan "Dicuci").
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'].map((step) => {
                      const isSelected = serviceForm.workflowSteps.includes(step);
                      return (
                        <button
                          key={step}
                          type="button"
                          onClick={() => {
                            let updatedSteps = [...serviceForm.workflowSteps];
                            if (updatedSteps.includes(step)) {
                              if (updatedSteps.length > 2) {
                                updatedSteps = updatedSteps.filter(s => s !== step);
                              }
                            } else {
                              updatedSteps.push(step);
                              const standardOrder = ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'];
                              updatedSteps.sort((a,b) => standardOrder.indexOf(a) - standardOrder.indexOf(b));
                            }
                            setServiceForm({ ...serviceForm, workflowSteps: updatedSteps });
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{step}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 border border-slate-200 text-transparent'
                          }`}>✓</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="text-[10px] text-emerald-700/80 font-mono mt-1 w-full bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                    Alur pengerjaan terpilih: <span className="font-extrabold text-[10.5px]">{serviceForm.workflowSteps.join(' ➔ ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-semibold transition"
                  id="btn-cancel-service"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                  id="btn-submit-service"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          )}

          {/* Grid Catalog Services (Grouped by Service Name) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.keys(groupedServices).map((serviceName) => {
              const groupItems = groupedServices[serviceName];
              const representative = groupItems[0];
              const isExpanded = expandedServiceGroup === serviceName;
              
              return (
                <div 
                  key={serviceName} 
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm ${
                    isExpanded 
                      ? 'ring-2 ring-sky-500 border-transparent shadow-lg scale-[1.01]' 
                      : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Service Group Header (Clickable) */}
                  <div 
                    onClick={() => setExpandedServiceGroup(isExpanded ? null : serviceName)}
                    className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors select-none space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${representative.category === 'kiloan' ? 'bg-cyan-50 text-cyan-700' : 'bg-pink-50 text-pink-700'}`}>
                        {representative.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold font-sans uppercase flex items-center gap-1">
                        📦 {groupItems.length} Variasi Jasa
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center justify-between gap-2 pr-1">
                        <span>{serviceName}</span>
                        <span className="text-[11px] text-slate-400 shrink-0 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-medium">
                        Unit: <span className="font-bold text-slate-800">/ {representative.unit}</span> • Klik untuk rincian detail tarif.
                      </p>
                    </div>
                  </div>

                  {/* Service Details Area (Render only when Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4 animate-fadeIn">
                      <h5 className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">
                        Rincian Detail {representative.category === 'kiloan' ? 'Janji Penyelesaian' : 'Ukuran / Klasifikasi Satuan'}:
                      </h5>
                      <div className="space-y-3.5">
                        {groupItems.map(s => (
                          <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-150/80 shadow-2xs space-y-3 flex flex-col justify-between hover:border-sky-300 transition-colors">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="space-y-0.5 animate-fadeIn">
                                <span className="px-2 py-0.5 rounded-md font-bold text-[9.5px] uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                  {s.promiseName || (s.category === 'kiloan' ? 'Reguler' : 'Sedang')}
                                </span>
                                {s.category === 'kiloan' && (
                                  <span className="text-[10.5px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                                    ⏱️ {s.promiseDurationText || `${s.estimateHours} jam`}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-900 block">
                                  Rp {s.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">per {s.unit}</span>
                              </div>
                            </div>

                            {/* Display Workflow Steps */}
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[9px] leading-relaxed">
                              <span className="text-slate-400 font-extrabold block uppercase tracking-wider text-[7.5px] mb-0.5">Alur Kerja (Workflow)</span>
                              <p className="text-emerald-700 font-mono font-bold">
                                {(s.workflowSteps || ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai']).join(' ➔ ')}
                              </p>
                            </div>

                            {/* Actions bar for detail */}
                            <div className="flex justify-end gap-1.5 border-t border-slate-50 pt-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditService(s);
                                }}
                                className="p-1 px-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                title="Edit Detail Layanan"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmService(s);
                                }}
                                className="p-1 px-2.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                title="Hapus Detail Layanan"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. OPERATIONAL EXPENSES (OPEX) */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6 animate-fadeIn" id="expense-accounting-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Pembukuan Pengeluaran Cabang (Operational Expenditure)</h3>
            <button
              onClick={() => {
                setShowAddExpense(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              id="btn-add-expense"
            >
              <Plus className="w-4 h-4" /> Catat Pengeluaran Baru
            </button>
          </div>

          {/* Date Picker Range Filter Bar */}
          <div className="bg-slate-100/50 p-4 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Filter Jangka Waktu Pengeluaran:</span>
              <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-black uppercase">Live Range Bound</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Dari:</span>
                <input
                  type="date"
                  value={expenseStartDate}
                  onChange={(e) => setExpenseStartDate(e.target.value)}
                  className="bg-white border border-slate-205 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Sampai:</span>
                <input
                  type="date"
                  value={expenseEndDate}
                  onChange={(e) => setExpenseEndDate(e.target.value)}
                  className="bg-white border border-slate-205 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-red-500"
                />
              </div>
              {(expenseStartDate !== '2026-05-01' || expenseEndDate !== '2026-05-30') && (
                <button
                  type="button"
                  onClick={() => {
                    setExpenseStartDate('2026-05-01');
                    setExpenseEndDate('2026-05-30');
                  }}
                  className="p-2 px-3 bg-slate-250 hover:bg-slate-300 rounded-xl font-bold transition text-slate-700 hover:text-slate-900"
                  title="Reset Filter Tanggal"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Form Add Expense */}
          {showAddExpense && (
            <form onSubmit={handleAddExpenseSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 max-w-xl animate-scaleIn">
              <h4 className="font-bold text-slate-800 text-xs">
                {editingExpenseId ? '✏️ Edit Catatan Pengeluaran Kas Operasional' : 'Catat Pengeluaran Kas Operasional'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Deskripsi Pengeluaran:</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Contoh: Beli Token Listrik Utama"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-red-600 focus:outline-none"
                    id="expense-desc-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Kategori OPEX:</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-red-600 focus:outline-none"
                    id="expense-category-input"
                  >
                    <option value="Gaji">Gaji</option>
                    <option value="Listrik">Listrik</option>
                    <option value="Air">Air</option>
                    <option value="Sewa">Sewa</option>
                    <option value="Perlengkapan">Perlengkapan</option>
                    <option value="Detergen/Softener">Detergen/Softener</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Jumlah Pengeluaran (Rp):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    placeholder="150000"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-red-600 focus:outline-none"
                    id="expense-amount-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Alokasi Cabang:</label>
                  <select
                    value={expenseForm.branchId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, branchId: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-red-600 focus:outline-none"
                    id="expense-branch-input"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false);
                    setEditingExpenseId(null);
                    setExpenseForm({ description: '', category: 'Detergen/Softener', amount: 0, branchId: 'br-1' });
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-semibold transition"
                  id="btn-cancel-expense"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm"
                  id="btn-submit-expense"
                >
                  {editingExpenseId ? '✏️ Simpan Perubahan' : 'Rekam Pengeluaran'}
                </button>
              </div>
            </form>
          )}

          {/* List Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-xs uppercase">Jurnal Jurnal Pengeluaran</span>
              <span className="text-[11px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">Total: Rp {totalOPEX.toLocaleString()}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Deskripsi</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Cabang</th>
                    <th className="p-3">Oleh</th>
                    <th className="p-3 text-right">Jumlah (OPEX)</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExpenses.slice(0).reverse().map(e => {
                    const branchMock = branches.find(b => b.id === e.branchId);
                    const isEditing = editingExpenseId === e.id;
                    return (
                      <tr key={e.id} className={`hover:bg-slate-50/50 ${isEditing ? 'bg-amber-50/70 border-y border-amber-200/50 animate-pulse' : ''}`}>
                        <td className="p-3 font-mono text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold">{e.description}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">
                            {e.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{branchMock ? branchMock.name : 'Cabang Utama'}</td>
                        <td className="p-3 text-slate-400">{e.recordedBy || 'Owner'}</td>
                        <td className="p-3 text-right font-black text-rose-600">Rp {e.amount.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditExpense(e)}
                              className="p-1 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                              title="Edit Pengeluaran"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmExpense(e)}
                              className="p-1 text-slate-600 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                              title="Hapus Pengeluaran"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTINGS, TEMPLATE WA & LOYALTY RULES */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6 animate-fadeIn" id="templates-wa-panel">
          
          {/* Points Rules Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              Skema Poin Loyalitas (System Loyalty Settings)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 block">Faktor Kelipatan Pencatatan Poin (IDR):</label>
                <input
                  type="number"
                  value={settings.pointsMultiplier}
                  onChange={(e) => handleSettingsChange('pointsMultiplier', Number(e.target.value))}
                  placeholder="10000"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-emerald-600 focus:outline-none"
                  id="points-multiplier-input"
                />
                <p className="text-[10px] text-slate-400">Contoh: 10,000 IDR di invoice lunas akan memicu perolehan 1 Poin.</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block">Nilai Tukar 1 Poin (IDR Potongan Biaya):</label>
                <input
                  type="number"
                  value={settings.pointsValue}
                  onChange={(e) => handleSettingsChange('pointsValue', Number(e.target.value))}
                  placeholder="100"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:border-emerald-600 focus:outline-none"
                  id="points-value-input"
                />
                <p className="text-[10px] text-slate-400">Contoh: Pelanggan menukar 100 Poin untuk memotong Rp 10.000 tagihan.</p>
              </div>
            </div>
          </div>

          {/* Kustomisasi Struk Nota Fisik / Thermal */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 font-sans text-xs">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500 animate-pulse" />
              Kustomisasi Tampilan Struk Fisik / Thermal (Receipt Thermal Layout)
            </h4>
            <p className="text-slate-500 text-[11px] leading-tight">
              Atur tampilan fisik nota cetak thermal kasir termasuk nama header kustom, catatan kaki, ukuran font teks, serta penjajaran konten:
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls & Element Row Options */}
              <div className="lg:col-span-7 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 block font-semibold">Teks Header Kustom (Header Nota):</label>
                    <input
                      type="text"
                      value={settings.customReceiptHeader || ''}
                      onChange={(e) => handleSettingsChange('customReceiptHeader', e.target.value)}
                      placeholder="KOSONG (Menggunakan Nama Toko Default)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-400">Judul utama di atas struk cetak. Kosongkan untuk memakai nama cabang.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 block font-semibold">Teks Footer Kustom (Catatan Kaki S&K):</label>
                    <input
                      type="text"
                      value={settings.customReceiptFooter || ''}
                      onChange={(e) => handleSettingsChange('customReceiptFooter', e.target.value)}
                      placeholder="KOSONG (Menggunakan Syarat & Ketentuan Default)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-400">Pesan penutup S&K di akhir struk nota.</p>
                  </div>

                  {/* UPLOADER LOGO HEADER */}
                  <div className="space-y-1 bg-sky-50/35 p-3.5 border border-dashed border-sky-300 rounded-2xl col-span-1 md:col-span-2 shadow-xs">
                    <label className="text-sky-850 block font-black text-[11px] uppercase tracking-wider flex items-center justify-between gap-1.5">
                      <span>🖼️ Logo Header Cetak Fisik:</span>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!settings.showHeaderLogoInReceipt}
                          onChange={(e) => handleSettingsChange('showHeaderLogoInReceipt', e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer ml-auto"
                        />
                        <span className="text-[10px] text-sky-800 font-bold normal-case">Tampilkan Logo di Header</span>
                      </label>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1 flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-550">Upload Logo Header Struk (Thermal Header Logo):</p>
                        <p className="text-[9px] text-slate-400">Gambar/foto ini akan dicetak di posisi paling atas (header) struk sebelum nama toko.</p>
                      </div>

                      <div className="space-y-2 border-l border-slate-100 pl-0 md:pl-4">
                        <div className="flex items-center gap-3">
                          {settings.customReceiptHeaderLogoImg ? (
                            <div className="relative group shrink-0">
                              <img 
                                src={settings.customReceiptHeaderLogoImg} 
                                alt="Receipt Header Logo" 
                                className="w-12 h-12 rounded-lg border border-slate-250 object-contain bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleSettingsChange('customReceiptHeaderLogoImg', '')}
                                className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold p-0.5 rounded-full text-[8px] h-4 w-4 flex items-center justify-center cursor-pointer shadow"
                                title="Hapus foto logo header"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="w-12 h-12 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-350 shrink-0">
                              <span className="text-lg">📷</span>
                            </div>
                          )}

                          <label className="flex-1">
                            <span className="p-2 px-3 bg-sky-500 hover:bg-sky-600 hover:shadow text-[10.5px] font-extrabold text-white rounded-xl cursor-pointer transition flex items-center justify-center gap-1">
                              📂 Pilih Logo...
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      handleSettingsChange('customReceiptHeaderLogoImg', event.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-[9px] text-slate-400">Gunakan file gambar kustom agar tercetak rapi di atas struk.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 bg-rose-50/20 p-2 border border-dashed border-rose-200 rounded-xl col-span-1 md:col-span-2">
                    <label className="text-rose-700 block font-bold text-[10.5px]">Pesan Iklan Promosi Footer:</label>
                    <input
                      type="text"
                      value={settings.customReceiptPromo || ''}
                      onChange={(e) => handleSettingsChange('customReceiptPromo', e.target.value)}
                      placeholder="KOSONG (Tanpa pesan promosi)"
                      className="w-full bg-white border border-rose-205 rounded-xl p-2.5 focus:outline-none focus:border-rose-500 text-xs"
                    />
                    <p className="text-[9px] text-rose-600">Pesan iklan promosi kustom (cth: "DISKON 15% MEMBER BARU!") di bawah S&K.</p>
                  </div>
                </div>

                {/* MS Word Real-time Receipt Elements Editor */}
                <div className="space-y-3.5 border-t border-slate-100 pt-5 mt-5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">📝 Microsoft Word Style Element Struk Fisik:</h5>
                      <p className="text-[10.5px] text-slate-500">Sesuaikan ukuran huruf, ketebalan, perataan teks, dan visibilitas dari masing-masing informasi struk secara presisi.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-150">
                    {(settings.receiptElements || [
                      { id: 'outlet_name', label: 'Nama Outlet / Cabang', fontSize: 13, alignment: 'center', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'invoice_number', label: 'Nomor Nota Transaksi', fontSize: 11, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'customer_name', label: 'Nama Lengkap Pelanggan', fontSize: 13, alignment: 'left', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'customer_phone', label: 'Nomor HP Pelanggan', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'order_date', label: 'Tanggal Transaksi', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'cashier_info', label: 'Informasi Kasir', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'order_status', label: 'Status Pembayaran', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'estimated_time', label: 'Estimasi Ambil Cucian', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'perfume_fragrance', label: 'Aroma Parfum Terpilih', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'item_list', label: 'Daftar Cucian & Harga', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'total_charge', label: 'Total Tagihan Biaya', fontSize: 12, alignment: 'right', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'member_points', label: 'Poin Member', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                      { id: 'footer_terms', label: 'Catatan & Ucapan Terima Kasih', fontSize: 9, alignment: 'center', isBold: false, isVisible: true, showPrefix: true, isItalic: false }
                    ]).map((el: any) => {
                      const updateElementOption = (id: string, key: string, val: any) => {
                        const currentElements = settings.receiptElements || [
                          { id: 'outlet_name', label: 'Nama Outlet / Cabang', fontSize: 13, alignment: 'center', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'invoice_number', label: 'Nomor Nota Transaksi', fontSize: 11, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'customer_name', label: 'Nama Lengkap Pelanggan', fontSize: 13, alignment: 'left', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'customer_phone', label: 'Nomor HP Pelanggan', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'order_date', label: 'Tanggal Transaksi', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'cashier_info', label: 'Informasi Kasir', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'order_status', label: 'Status Pembayaran', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'estimated_time', label: 'Estimasi Ambil Cucian', fontSize: 9, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'perfume_fragrance', label: 'Aroma Parfum Terpilih', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'item_list', label: 'Daftar Cucian & Harga', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'total_charge', label: 'Total Tagihan Biaya', fontSize: 12, alignment: 'right', isBold: true, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'member_points', label: 'Poin Member', fontSize: 10, alignment: 'left', isBold: false, isVisible: true, showPrefix: true, isItalic: false },
                          { id: 'footer_terms', label: 'Catatan & Ucapan Terima Kasih', fontSize: 9, alignment: 'center', isBold: false, isVisible: true, showPrefix: true, isItalic: false }
                        ];
                        const updated = currentElements.map((item: any) => item.id === id ? { ...item, [key]: val } : item);
                        handleSettingsChange('receiptElements', updated);
                      };

                      const isExpanded = expandedElementId === el.id;

                      return (
                        <div key={el.id} className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white mb-2 pb-0.5">
                          <div className={`flex flex-col sm:flex-row justify-between sm:items-center p-3 transition-all ${
                            el.isVisible ? 'bg-white' : 'bg-slate-100/60 text-slate-400 opacity-60'
                          }`}>
                            <div>
                              <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 capitalize">
                                <span className={`w-2 h-2 rounded-full ${el.isVisible ? 'bg-rose-500' : 'bg-slate-300'}`}></span>
                                {el.label}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Font: <span className="font-bold text-slate-600">{el.fontSize || 10}px</span> &bull; Align: <span className="font-bold text-slate-600 capitalize">{el.alignment}</span> &bull; Ketebalan: <span className="font-bold text-slate-600">{el.isBold ? 'Bold' : 'Regular'}</span>{el.showPrefix === false && " &bull; Tanpa Label"}{el.isItalic && " &bull; Italic"}
                              </div>
                            </div>

                            {/* Toolbar controls like MS Word */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-0 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0 font-sans">
                              {/* Accordion Detail Button */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedElementId(isExpanded ? null : el.id)}
                                  className={`p-1 px-2.5 rounded-lg transition text-[11px] font-black cursor-pointer flex items-center gap-1 ${
                                    isExpanded ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                                  }`}
                                  title="Edit Detail Format, Sembunyikan Label (Prefix), Teks Italic, dll"
                                >
                                  {isExpanded ? '✕ Tutup' : '🛠️ Sembunyikan Label / Ukuran'}
                                </button>

                              <span className="w-px h-5 bg-slate-200"></span>

                              {/* Visibility Toggle */}
                              <button
                                type="button"
                                onClick={() => updateElementOption(el.id, 'isVisible', !el.isVisible)}
                                className={`p-1 px-2 rounded-lg transition text-[11px] font-bold cursor-pointer ${
                                  el.isVisible ? 'bg-white text-slate-700 hover:bg-slate-100 shadow-xs border border-slate-150' : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200'
                                }`}
                                title={el.isVisible ? "Sembunyikan" : "Tampilkan"}
                              >
                                {el.isVisible ? '👁️ Muncul' : '🙈 Sembunyi'}
                              </button>

                              <span className="w-px h-5 bg-slate-200"></span>

                              {/* Font size adjustment */}
                              <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 border border-slate-200 shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => updateElementOption(el.id, 'fontSize', Math.max(7, (el.fontSize || 11) - 1))}
                                  className="p-1 px-1.5 rounded text-slate-700 hover:bg-slate-100 text-[10px] font-black cursor-pointer"
                                  title="Kecilkan Font (A-)"
                                >
                                  A-
                                </button>
                                <span className="text-[10px] font-black text-slate-800 px-1 font-mono min-w-[28px] text-center">
                                  {(el.fontSize || 11)}px
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateElementOption(el.id, 'fontSize', Math.min(26, (el.fontSize || 11) + 1))}
                                  className="p-1 px-1.5 rounded text-slate-700 hover:bg-slate-100 text-[10px] font-black cursor-pointer"
                                  title="Besarkan Font (A+)"
                                >
                                  A+
                                </button>
                              </div>

                              <span className="w-px h-5 bg-slate-200"></span>

                              {/* Bold Selector (B) */}
                              <button
                                type="button"
                                onClick={() => updateElementOption(el.id, 'isBold', !el.isBold)}
                                className={`px-2.5 py-1 rounded-lg transition-all font-serif text-[11px] font-black cursor-pointer ${
                                  el.isBold ? 'bg-slate-800 text-white shadow-sm scale-105 font-black' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-150'
                                }`}
                                title="Tebalkan Font (B)"
                              >
                                B
                              </button>

                              <span className="w-px h-5 bg-slate-200"></span>

                              {/* Alignment option */}
                              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-xs">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                  <button
                                    key={align}
                                    type="button"
                                    onClick={() => updateElementOption(el.id, 'alignment', align)}
                                    className={`p-1 px-1.5 rounded text-[10px] uppercase font-black transition cursor-pointer ${
                                      el.alignment === align ? 'bg-rose-500 text-white' : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                                    title={`Rata ${align === 'left' ? 'Kiri' : align === 'center' ? 'Tengah' : 'Kanan'}`}
                                  >
                                    {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Accordion Expansion Detail Menu */}
                          {isExpanded && (
                            <div className="border-t border-slate-150 p-3 bg-slate-50/75 space-y-3.5 animate-fadeIn text-xs">
                              <div className="text-[10px] font-black uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                                <span>⚙️ Editor Presisi Element: {el.label}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Hide Prefix Option */}
                                {['customer_name', 'invoice_number', 'order_date', 'perfume_fragrance'].includes(el.id) && (
                                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-xl">
                                    <input
                                      type="checkbox"
                                      checked={el.showPrefix !== false}
                                      onChange={(e) => updateElementOption(el.id, 'showPrefix', e.target.checked)}
                                      className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                                    />
                                    <div>
                                      <span className="font-extrabold text-slate-850 block text-[10.5px]">Tampilkan Teks Label / Prefiks</span>
                                      <span className="text-[8.5px] text-slate-450 leading-tight block mt-0.5">Centang agar label seperti "Cust:" tetap tercetak. Hilangkan centang agar tercetak datanya saja (misal: "Budi Hartono" saja).</span>
                                    </div>
                                  </label>
                                )}

                                {/* Italic Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-xl">
                                  <input
                                    type="checkbox"
                                    checked={!!el.isItalic}
                                    onChange={(e) => updateElementOption(el.id, 'isItalic', e.target.checked)}
                                    className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-extrabold text-slate-850 block text-[10.5px]">Cetak Tulisan Miring (Italic)</span>
                                    <span className="text-[8.5px] text-slate-450 leading-tight block mt-0.5">Aktifkan format italic khusus untuk memberikan efek estetika pada pratinjau struk.</span>
                                  </div>
                                </label>

                                {/* Fine-grain size slider */}
                                <div className="bg-white p-2.5 border border-slate-200 rounded-xl sm:col-span-2 space-y-1">
                                  <div className="flex justify-between items-center text-[10.5px]">
                                    <span className="font-extrabold text-slate-850">Ukuran Tinggi Huruf Elemen (Font Size)</span>
                                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-mono text-xs">{el.fontSize || 11}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="8"
                                    max="24"
                                    value={el.fontSize || 10}
                                    onChange={(e) => updateElementOption(el.id, 'fontSize', parseInt(e.target.value))}
                                    className="w-full accent-rose-600 cursor-pointer"
                                  />
                                  <p className="text-[8.5px] text-slate-400">Atur ukuran elemen ini (misal ingin nama pelanggan berukuran font 15 agar rata tengah dan menonjol).</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* QRIS PAYMENTS CONFIGURATION */}
                  <div className="space-y-4 border-t border-slate-100 pt-5 mt-5">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-sky-500 shrink-0" />
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">📲 QRIS INTEGRASI & ID MERCHANT:</h5>
                        <p className="text-[10.5px] text-slate-500">Konfigurasi visual scan kode QRIS otomatis di struk fisik thermal pelanggan.</p>
                      </div>
                    </div>

                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-150 space-y-4 font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-bold text-[10px] uppercase">Format Tipe Pembayaran QRIS:</label>
                          <select
                            value={settings.qrisType || 'none'}
                            onChange={(e) => handleSettingsChange('qrisType', e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-sky-500 text-xs font-bold text-slate-700"
                          >
                            <option value="none">Sembunyikan QRIS (None)</option>
                            <option value="static">QRIS Statis (Master Merchant Code Tetap)</option>
                            <option value="dynamic">QRIS Dinamis (Auto-Generated Midtrans API)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-600 block font-bold text-[10px] uppercase">Merchant ID Pembayaran (NMID / API ID):</label>
                          <input
                            type="text"
                            value={settings.qrisMerchantId || ''}
                            onChange={(e) => handleSettingsChange('qrisMerchantId', e.target.value)}
                            placeholder="Contoh: ID1020304050607"
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-sky-500 text-xs text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      {settings.qrisType === 'static' && (
                        <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-150">
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">🖼️ Link Foto QR Code QRIS Statis Usaha (Opsional):</span>
                          <div className="flex items-center gap-3">
                            {settings.qrisStaticQrUrl ? (
                              <div className="relative group shrink-0">
                                <img 
                                  src={settings.qrisStaticQrUrl} 
                                  alt="QRIS Static QR" 
                                  className="w-12 h-12 rounded-lg border border-slate-250 object-contain bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSettingsChange('qrisStaticQrUrl', '')}
                                  className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold p-0.5 rounded-full text-[8px] h-4 w-4 flex items-center justify-center cursor-pointer shadow"
                                  title="Hapus gambar QRIS"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-350 bg-slate-50 shrink-0">
                                <span className="text-lg">📱</span>
                              </div>
                            )}

                            <label className="flex-1">
                              <span className="p-2 px-3 bg-sky-500 hover:bg-sky-600 hover:shadow text-[10.5px] font-extrabold text-white rounded-xl cursor-pointer transition flex items-center justify-center gap-1 w-fit">
                                📂 Unggah Foto QRIS...
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        handleSettingsChange('qrisStaticQrUrl', event.target.result as string);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-[8.5px] text-slate-400">Pilih file gambar QR code toko Anda, atau biarkan kosong untuk secara otomatis men-generate Master QRIS berlogo resmi.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONFIGURATION VERSION HISTORY (UNDO / RESTORE) */}
                  <div className="space-y-4 border-t border-slate-100 pt-5 mt-5">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-rose-500 shrink-0 animate-spin-reverse" />
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">⏳ RIWAYAT VERSI STRUK (BACKUP & UNDO):</h5>
                        <p className="text-[10.5px] text-slate-500">Pencadangan konfigurasi & fitur pemulihan satu-klik (undo) apabila terjadi kesalahan pengaturan.</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/75 p-4 rounded-2xl border border-slate-200/80 space-y-4 font-sans">
                      {/* Form to commit new version */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-150">
                        <span className="text-[10.5px] font-bold text-slate-700 block">💾 Ambil Snapshot Konfigurasi Saat Ini:</span>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newVersionNote}
                            onChange={(e) => setNewVersionNote(e.target.value)}
                            placeholder="Deskripsi versi kustom (cth: Nota Sesudah Input Logo)"
                            className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-rose-500 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const note = newVersionNote.trim() || `Config Backup - ${new Date().toLocaleString('id-ID')}`;
                              const newVer: SettingsVersion = {
                                id: `ver-${Date.now()}`,
                                timestamp: new Date().toISOString(),
                                description: note,
                                settings: JSON.parse(JSON.stringify(settings))
                              };
                              const updated = [newVer, ...settingsHistory];
                              LaughDryDatabase.saveSettingsHistory(updated);
                              setSettingsHistory(updated);
                              setNewVersionNote('');
                              triggerToast("💾 Versi baru disimpan ke riwayat versi!");
                            }}
                            className="p-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>💾 Simpan Versi</span>
                          </button>
                        </div>
                      </div>

                      {/* Display historic versions */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {settingsHistory.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 italic text-[11px]">
                            Belum ada riwayat versi tersimpan.
                          </div>
                        ) : (
                          settingsHistory.map((h) => (
                            <div key={h.id} className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-slate-50/50 rounded-xl border border-slate-150 transition-all duration-150 group">
                              <div className="space-y-1 min-w-0 flex-1">
                                <span className="font-extrabold text-slate-800 text-[11px] block truncate leading-tight">{h.description}</span>
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                                  <span>{new Date(h.timestamp).toLocaleString('id-ID')}</span>
                                  <span>•</span>
                                  <span>ID: {h.id.substring(0, 8)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 select-none">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const rolled = JSON.parse(JSON.stringify(h.settings));
                                    LaughDryDatabase.saveSettings(rolled);
                                    setSettings(rolled);
                                    triggerToast(`🔄 Berhasil Mengembalikan: "${h.description}"!`);
                                  }}
                                  className="p-1 px-2.5 bg-sky-50 text-sky-700 hover:bg-sky-500 hover:text-white rounded-md text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                                  title="Kembalikan semua setelan struk ke versi ini"
                                >
                                  <Undo className="w-3 h-3" />
                                  <span>Revert</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = settingsHistory.filter(item => item.id !== h.id);
                                    LaughDryDatabase.saveSettingsHistory(updated);
                                    setSettingsHistory(updated);
                                    triggerToast("🗑️ Riwayat versi berhasil dihapus.");
                                  }}
                                  className="p-1 hover:bg-rose-50 rounded-md text-rose-500 hover:text-rose-600 transition cursor-pointer"
                                  title="Hapus permanen dari riwayat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SAVE BUTTON AS PER USER REQUEST */}
                  <div className="pt-4 flex justify-end border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        LaughDryDatabase.saveSettings(settings);
                        triggerToast("💾 Semua perubahan pratinjau struk fisik berhasil disimpan permanen ke database!");
                      }}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <span>💾 SIMPAN PRATINJAU STRUK FISIK</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Pratinjau Struk Cetak Fisik (58mm POS Simulation) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-150 to-slate-200 border border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-start text-xs min-h-[500px] shadow-inner relative overflow-hidden w-full">
                <div className="absolute top-0 inset-x-0 h-2 bg-slate-400/25 backdrop-blur-xs"></div>
                
                <div className="w-full text-center pb-2.5 border-b border-rose-100 mb-4">
                  <h5 className="font-extrabold text-[12px] text-slate-800 tracking-wider flex items-center justify-center gap-1.5 uppercase font-sans">
                    🖨️ Live Pratinjau Struk Fisik (58mm)
                  </h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">Berubah real-time sesuai preferensi Anda</p>
                </div>

                {/* Simulated printer feeder slot */}
                <div className="w-full max-w-[215px] bg-slate-800 h-5 rounded-t-xl shadow-md border border-slate-700 relative flex items-center justify-center">
                  <div className="w-[85%] h-1 bg-black rounded-full shadow-inner"></div>
                </div>

                {/* Realistic Thermal Receipt Roll Mockout */}
                <div className="bg-white text-slate-950 font-mono p-4 w-full max-w-[215px] border-x border-b border-slate-300 shadow-xl relative select-all animate-fadeIn" style={{
                  backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #fafafa 100%)'
                }}>
                  {/* Decorative receipt tear zig-zag bottom */}
                  <div className="absolute -bottom-1.5 inset-x-0 h-1.5 overflow-hidden flex">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-white border-b border-r border-slate-200 rotate-45 transform origin-top shrink-0 -mt-1.25 shadow-xs"></div>
                    ))}
                  </div>

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
                      <div className="space-y-1 science-receipt-text select-none w-full">
                        {/* Header logo */}
                        {settings.showHeaderLogoInReceipt && settings.customReceiptHeaderLogoImg && (
                          <div className="flex justify-center mb-2 animate-fade-in text-center">
                            <img 
                              src={settings.customReceiptHeaderLogoImg} 
                              alt="Receipt Header Logo" 
                              className="w-14 h-14 object-contain rounded border border-slate-200 p-0.5 bg-white bg-opacity-90"
                            />
                          </div>
                        )}

                        {/* Outlet name / header */}
                        {(() => {
                          const s = getElementStyle('outlet_name');
                          if (!s.isVisible) return null;
                          const active = expandedElementId === 'outlet_name';
                          return (
                            <div 
                              style={s.style} 
                              onClick={() => setExpandedElementId('outlet_name')}
                              className={`uppercase tracking-tight whitespace-pre-line mb-1.5 leading-tight p-1 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                              }`}
                              title="Klik untuk rubah nama header / nama outlet"
                            >
                              {settings.customReceiptHeader || 'LAUGHDRY EXPRESS'}
                            </div>
                          );
                        })()}

                        {settings.showBranchPhone && (
                          <div className="font-bold text-slate-700 text-center text-[8px] mb-1">
                            TELP BRANCH: 0812-3456-7890
                          </div>
                        )}

                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        {/* Invoice & order meta information */}
                        <div className="space-y-0.5 text-slate-800">
                          {(() => {
                            const s = getElementStyle('invoice_number');
                            if (!s.isVisible) return null;
                            const active = expandedElementId === 'invoice_number';
                            return (
                              <div 
                                style={s.style} 
                                onClick={() => setExpandedElementId('invoice_number')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit no nota"
                              >
                                {s.showPrefix ? 'Nota  : LD-20260604-0012' : 'LD-20260604-0012'}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('order_date');
                            if (!s.isVisible) return null;
                            const active = expandedElementId === 'order_date';
                            return (
                              <div 
                                style={s.style} 
                                onClick={() => setExpandedElementId('order_date')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit tanggal"
                              >
                                {s.showPrefix ? `Tgl   : ${new Date().toLocaleDateString('id-ID')}` : new Date().toLocaleDateString('id-ID')}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('customer_name');
                            if (!s.isVisible) return null;
                            const active = expandedElementId === 'customer_name';
                            return (
                              <div 
                                style={s.style} 
                                onClick={() => setExpandedElementId('customer_name')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit nama pelanggan"
                              >
                                {s.showPrefix ? 'Cust  : Budi Hartono' : 'Budi Hartono'}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('customer_phone');
                            if (!s.isVisible || !settings.showCustomerPhoneInReceipt) return null;
                            const active = expandedElementId === 'customer_phone';
                            return (
                              <div 
                                style={s.style} 
                                onClick={() => setExpandedElementId('customer_phone')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit bagian nama/kontak pelanggan"
                              >
                                {s.showPrefix ? 'Telp  : 0812-7788-9900' : '0812-7788-9900'}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('cashier_info');
                            if (!s.isVisible || !settings.showCashierNameInReceipt) return null;
                            const active = expandedElementId === 'cashier_info';
                            return (
                              <div 
                                style={s.style}
                                onClick={() => setExpandedElementId('cashier_info')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit info kasir"
                              >
                                {s.showPrefix ? 'Kasir : Amanda Kasir (POS)' : 'Amanda Kasir (POS)'}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('order_status');
                            if (!s.isVisible) return null;
                            const active = expandedElementId === 'order_status';
                            return (
                              <div 
                                style={s.style}
                                onClick={() => setExpandedElementId('order_status')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit status"
                              >
                                {s.showPrefix ? 'Status: LUNAS via QRIS' : 'LUNAS via QRIS'}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('estimated_time');
                            if (!s.isVisible || !settings.showEstimatedCompletion) return null;
                            const active = expandedElementId === 'estimated_time';
                            return (
                              <div 
                                style={s.style}
                                onClick={() => setExpandedElementId('estimated_time')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit estimasi"
                              >
                                {s.showPrefix ? 'Estim : 07/06/2026, 15:00' : '07/06/2026, 15:00'}
                              </div>
                            );
                          })()}

                          {(() => {
                            const s = getElementStyle('perfume_fragrance');
                            if (!s.isVisible) return null;
                            const active = expandedElementId === 'perfume_fragrance';
                            return (
                              <div 
                                style={s.style} 
                                onClick={() => setExpandedElementId('perfume_fragrance')}
                                className={`p-0.5 cursor-pointer transition-all duration-150 rounded ${s.className} ${
                                  active ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                }`}
                                title="Klik untuk edit aroma parfum"
                              >
                                {s.showPrefix ? 'Aroma : ✨ SWEET CANDY EXOTIC' : '✨ SWEET CANDY EXOTIC'}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Items list */}
                        {(() => {
                          const s = getElementStyle('item_list');
                          if (!s.isVisible) return null;
                          const active = expandedElementId === 'item_list';
                          return (
                            <div 
                              onClick={() => setExpandedElementId('item_list')}
                              className={`cursor-pointer transition-all duration-150 rounded ${
                                active ? 'ring-2 ring-rose-500 bg-rose-50/30 p-1' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350 p-0.5'
                              }`}
                              title="Klik untuk edit daftar item"
                            >
                              <div className="border-t border-dashed border-slate-400 my-2"></div>
                              <div style={s.style} className={`space-y-2 ${s.className}`}>
                                <div className="space-y-0.5 text-left">
                                  <div className="font-extrabold text-slate-950 leading-tight">Cuci Setrika Reguler - Kiloan</div>
                                  <div className="flex justify-between text-slate-600 text-[8.5px]">
                                    <span>3 KG x @Rp 8.000</span>
                                    <span className="font-black text-slate-950">Rp 24.000</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5 text-left">
                                  <div className="font-extrabold text-slate-950 leading-tight">Bedcover Large - Satuan</div>
                                  <div className="flex justify-between text-slate-600 text-[8.5px]">
                                    <span>1 PCS x @Rp 35.000</span>
                                    <span className="font-black text-slate-950">Rp 35.000</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Charges calculation */}
                        {(() => {
                          const s = getElementStyle('total_charge');
                          if (!s.isVisible) return null;
                          const active = expandedElementId === 'total_charge';
                          return (
                            <div 
                              onClick={() => setExpandedElementId('total_charge')}
                              className={`cursor-pointer transition-all duration-150 rounded ${
                                active ? 'ring-2 ring-rose-500 bg-rose-50/30 p-1' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350 p-0.5'
                              }`}
                              title="Klik untuk edit total biaya"
                            >
                              <div className="border-t border-dashed border-slate-400 my-2"></div>
                              <div style={s.style} className={`space-y-1 text-slate-950 ${s.className}`}>
                                <div className="flex justify-between font-black">
                                  {s.showPrefix ? (
                                    <>
                                      <span>TOTAL BIAYA:</span>
                                      <span>Rp 59.000</span>
                                    </>
                                  ) : (
                                    <span className="w-full text-center block">Rp 59.000</span>
                                  )}
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-700">
                                  {s.showPrefix ? (
                                    <>
                                      <span>PAID STATE:</span>
                                      <span>LUNAS (Rp 0)</span>
                                    </>
                                  ) : (
                                    <span className="w-full text-center block">LUNAS (Rp 0)</span>
                                  )}
                                </div>
                                {settings.showPointsInReceipt && (() => {
                                  const pm = getElementStyle('member_points');
                                  if (!pm.isVisible) return null;
                                  const pmActive = expandedElementId === 'member_points';
                                  return (
                                    <div 
                                      style={pm.style} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedElementId('member_points');
                                      }}
                                      className={`flex justify-between font-bold cursor-pointer transition-all duration-150 rounded p-0.5 mt-1 ${pm.className} ${
                                        pmActive ? 'ring-2 ring-rose-500 bg-rose-50/30' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350'
                                      }`}
                                      title="Klik untuk rubah poin member"
                                    >
                                      {pm.showPrefix ? (
                                        <>
                                          <span>POIN MEMBER:</span>
                                          <span>+1 Poin (+1 Stamp)</span>
                                        </>
                                      ) : (
                                        <span className="w-full text-center block">+1 Poin (+1 Stamp)</span>
                                      )}
                                    </div>
                                  );
                                })()}
                                {settings.showNotesInReceipt && (
                                  <div className="text-slate-650 italic text-[8.2px] mt-1 border-t border-slate-100 pt-1 text-left">
                                    Notes: "Wanginya dibanyakin ya kak, trims"
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Footer terms S&K Selesai */}
                        {(() => {
                          const s = getElementStyle('footer_terms');
                          if (!s.isVisible || !settings.showTermsInReceipt) return null;
                          const active = expandedElementId === 'footer_terms';
                          return (
                            <div 
                              onClick={() => setExpandedElementId('footer_terms')}
                              className={`cursor-pointer transition-all duration-150 rounded ${
                                active ? 'ring-2 ring-rose-500 bg-rose-50/30 p-1' : 'hover:bg-slate-100/80 hover:ring-1 hover:ring-rose-350 p-0.5'
                              }`}
                              title="Klik untuk edit syarat & ketentuan / catatan kaki"
                            >
                              <div className="border-t border-dashed border-slate-400 my-2"></div>
                              <div style={s.style} className={`whitespace-pre-line leading-tight text-slate-700 ${s.className}`}>
                                {settings.customReceiptFooter || `* KETENTUAN OPERASIONAL *
1. Serahkan nota asli saat ambil pakaian.
2. Kerusakan/hilang diganti 5x lipat.
3. Komplain maksimal 1x24 jam pasca ambil.`}
                              </div>
                            </div>
                          );
                        })()}

                        {/* CUSTOM RECEIPT PROMOTIONAL FOOTER BLOCK */}
                        {settings.customReceiptPromo && (
                          <>
                            <div className="border-t border-dashed border-slate-400 my-2 pt-1.5">
                              <div className="text-center font-black text-[9px] text-rose-600 uppercase tracking-wide leading-tight bg-rose-50 p-1.5 rounded-lg border border-dashed border-rose-200">
                                📣 PROMO: {settings.customReceiptPromo}
                              </div>
                            </div>
                          </>
                        )}

                        {/* QRIS PAYMENT AUTOPRINT ON RECEIPT */}
                        {settings.qrisType && settings.qrisType !== 'none' && (
                          <div className="border-t border-dashed border-slate-400 my-2 pt-2 flex flex-col items-center animate-fade-in">
                            <span className="text-[7.5px] font-black text-slate-800 tracking-wider">
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
                </div>

                {/* Simulated Feed and Status indicators */}
                <div className="w-full max-w-[215px] flex justify-between px-2 text-[9px] text-slate-400 font-bold mt-7">
                  <span>Paper Feed: 58mm POS</span>
                  <span className="text-emerald-500 animate-pulse flex items-center gap-1">● Online Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Templates Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 animate-bounce" />
                Template Isi Otomatis Notifikasi WhatsApp (CRM Automation)
              </h4>
              <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-500">Auto Variable Binder Ready</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-700">{tmpl.name}</span>
                      <span className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase">{tmpl.category}</span>
                    </div>
                    <textarea
                      rows={11}
                      defaultValue={tmpl.body}
                      onBlur={(e) => handleTemplateChange(tmpl.id, e.target.value)}
                      placeholder="Masukkan format pesan..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] font-mono leading-relaxed text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                    💡 Simpan dengan <strong>klik di luar kotak (blur target)</strong> untuk memperbarui template penanganan sistem.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Android Studio Export Guide Card */}
          <div className="bg-[#0F172A] text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Smartphone className="w-5 h-5 animate-bounce" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#38BDF8] text-sm">📱 Android Studio Export & Deployment Guide</h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Panduan menyatukan kode POS Karyawan & Dasbor Owner untuk dijalankan di HP/Tablet Android.</p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                Capacitor Native Configured
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-300">
              <div className="space-y-3.5">
                <p className="leading-relaxed">
                  Sistem **LaughDry Kita** telah dilengkapi dengan **CapacitorJS** (Android Wrapper modern sekelas Ionic). Konfigurasi native beserta direktori folder khusus Android (`/android`) sudah diinisialisasi dan tersinkronisasi dengan baik di workspace.
                </p>

                <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <strong className="font-extrabold text-slate-200">Bagaimana Cara Kerja 1 Database?</strong>
                  </div>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Sistem ini terhubung 100% secara langsung ke **Firebase Firestore**. Seluruh pesanan, absensi, kasir baru, atau log pengeluaran yang dicatat lewat perangkat Android POS di toko fisik akan seketika tersinkronisasi ke server pusat. Owner dapat memantau secara real-time lewat versi Web maupun Android, dan pelanggan pun bisa melacak status baju cucian mereka lewat situs tracking di browser.
                  </p>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl leading-relaxed text-[11px]">
                  💡 <strong>Keuntungan Desain:</strong> Di lingkungan Android (Capacitor), aplikasi akan mendeteksi platform secara otomatis untuk menyembunyikan "Situs Tracking" pelanggan sehingga mesin kasir POS Anda tetap aman, rapi, dan steril dari akses luar.
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <strong className="text-white text-[11px] uppercase tracking-wider block">Langkah Menjalankan di Android Studio:</strong>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1 leading-relaxed">
                  <li>
                    <span className="font-bold text-slate-200">Ekspor Kode Sumber:</span>
                    <span className="block text-slate-400 pl-4 mt-0.5">Klik tombol gerigi di kanan atas layar Google AI Studio dan pilih menu <strong>"Export to ZIP"</strong> (atau sambungkan ke direktori GitHub Anda).</span>
                  </li>
                  <li>
                    <span className="font-bold text-slate-200">Ekstrak & Pasang Dependensi:</span>
                    <span className="block text-slate-400 pl-4 mt-0.5">Ekstrak paket ZIP di komputer Anda, lalu jalankan terminal di dalam folder tersebut untuk memasang paket:</span>
                    <pre className="bg-slate-950 text-[#38BDF8] p-2 rounded-lg font-mono text-[10px] mt-1 ml-4 overflow-x-auto select-all">npm install</pre>
                  </li>
                  <li>
                    <span className="font-bold text-slate-200">Kompilasi & Sinkronisasi Folder Android:</span>
                    <span className="block text-slate-400 pl-4 mt-0.5">Jalankan script otomatis untuk merakit kode React POS dan memasukkannya ke folder native Android:</span>
                    <pre className="bg-slate-950 text-[#38BDF8] p-2 rounded-lg font-mono text-[10px] mt-1 ml-4 overflow-x-auto select-all">npm run cap:sync</pre>
                  </li>
                  <li>
                    <span className="font-bold text-slate-200">Buka Proyek di Android Studio:</span>
                    <span className="block text-slate-400 pl-4 mt-0.5">Buka folder proyek native `/android` dengan aplikasi Android Studio Anda menggunakan perintah:</span>
                    <pre className="bg-slate-950 text-[#38BDF8] p-2 rounded-lg font-mono text-[10px] mt-1 ml-4 overflow-x-auto select-all">npm run cap:open-android</pre>
                  </li>
                  <li>
                    <span className="font-bold text-slate-200">Jalankan di Handphone / Tablet:</span>
                    <span className="block text-slate-400 pl-4 mt-0.5">Colok tablet kasir Android Anda menggunakan kabel data (aktifkan USB Debugging di setelan developer HP), pilih perangkat Anda di Android Studio, lalu klik ikon <strong>Run (Segitiga Hijau Play)</strong> untuk memasang aplikasi digital LaughDry langsung di toko Anda!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. AUDIT LOG TRACKINGS */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4 animate-fadeIn" id="audit-log-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700" />
              Sistem Audit Log & Rekaman Jejak Keamanan Pengguna
            </h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">Wajib Dipatuhi Sesuai ISO 27001</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wide text-slate-500 text-[10px]">
              Jejak Audit Seluruh Pengguna
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.role === 'owner' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {log.role.toUpperCase()}
                      </span>
                      <strong className="text-slate-800 text-xs">{log.userName}</strong>
                      <span className="text-slate-400">({log.action})</span>
                    </div>
                    <div className="text-slate-600 text-xs font-sans mt-0.5">{log.details}</div>
                  </div>
                  <div className="text-[10.5px] text-slate-400 whitespace-nowrap text-right shrink-0">
                    {new Date(log.timestamp).toLocaleDateString()} &mdash; {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6.5. LAPORAN PERFORMA BULANAN (MONTHLY PERFORMANCE REPORT) */}
      {activeSubTab === 'report' && (
        <div className="space-y-6 animate-fadeIn text-xs" id="performance-report-panel">
          
          {/* Header Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-5 text-white border border-indigo-950/40 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-[10px] mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Laporan Performa & Ringkasan Bulanan (Monthly Performance Report)
            </div>
            <h3 className="text-base font-bold text-white">Analisis Pendapatan & Volume Transaksi</h3>
            <p className="text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Visualisasi metrik keuangan vital, laju order masuk, serta preferensi pembayaran pelanggan di seluruh cabang laundry terhitung berdasarkan opsi rentang tanggal pilihan Anda.
            </p>
          </div>

          {/* Date Picker & Filter Control Ribbon */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mulai Tanggal</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 font-sans">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 text-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Sampai Tanggal</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 font-sans">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 text-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Presets Button Links */}
            <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center font-sans">
              <button
                onClick={() => {
                  setReportStartDate('2026-05-01');
                  setReportEndDate('2026-05-31');
                  triggerToast("📅 Rentang diset ke: Mei 2026");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportStartDate === '2026-05-01' && reportEndDate === '2026-05-31'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mei 2026
              </button>
              <button
                onClick={() => {
                  setReportStartDate('2026-06-01');
                  setReportEndDate('2026-06-30');
                  triggerToast("📅 Rentang diset ke: Juni 2026");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportStartDate === '2026-06-01' && reportEndDate === '2026-06-30'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Juni 2026
              </button>
              <button
                onClick={() => {
                  setReportStartDate('2026-05-01');
                  setReportEndDate('2026-06-30');
                  triggerToast("📅 Rentang diset ke: Mei & Juni 2026");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportStartDate === '2026-05-01' && reportEndDate === '2026-06-30'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Transaksi
              </button>
            </div>
          </div>

          {/* Core Computations & Local Filter State */}
          {(() => {
            const reportOrders = orders.filter(o => {
              if (selectedBranch !== 'all' && o.branchId !== selectedBranch) return false;
              const datePart = o.createdAt.split('T')[0];
              return datePart >= reportStartDate && datePart <= reportEndDate;
            });

            const totalRev = reportOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const totalCount = reportOrders.length;
            const avgTicketSize = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;

            // Generate daily date chart details
            const getDaysArray = (startStr: string, endStr: string) => {
              const resArr = [];
              const currDt = new Date(startStr);
              const limitDt = new Date(endStr);
              let loopSafety = 0;
              while (currDt <= limitDt && loopSafety < 120) {
                resArr.push(currDt.toISOString().split('T')[0]);
                currDt.setDate(currDt.getDate() + 1);
                loopSafety++;
              }
              return resArr;
            };

            const dayList = getDaysArray(reportStartDate, reportEndDate);
            const daysReportData = dayList.map(eachDay => {
              const dayMatches = reportOrders.filter(o => o.createdAt.startsWith(eachDay));
              const rev = dayMatches.reduce((sum, o) => sum + o.totalAmount, 0);
              const cnt = dayMatches.length;

              const dateObj = new Date(eachDay);
              const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
              const labelDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;

              return {
                rawDate: eachDay,
                date: labelDate,
                "Pendapatan": rev,
                "Jumlah Order": cnt
              };
            });

            // Payment breakdown data
            const payMethodsTotals = reportOrders.reduce((acc, o) => {
              const mthd = o.paymentMethod || 'Cash';
              acc[mthd] = (acc[mthd] || 0) + o.totalAmount;
              return acc;
            }, {} as Record<string, number>);

            const paymentPieData = Object.entries(payMethodsTotals).map(([name, value]) => ({
              name,
              value
            }));

            const finalPieData = paymentPieData.length > 0 ? paymentPieData : [
              { name: 'Cash', value: 0 },
              { name: 'QRIS', value: 0 },
              { name: 'Transfer', value: 0 },
              { name: 'Deposit', value: 0 }
            ];

            const PIE_COLORS = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B'];

            return (
              <div className="space-y-6">
                
                {/* Micro Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Widget 1 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pendapatan (Revenue)</span>
                      <strong className="text-xl font-black text-slate-900 mt-1 block">Rp {totalRev.toLocaleString('id-ID')}</strong>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Pada rentang terpilih</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Widget 2 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Volume Transaksi (Lunas)</span>
                      <strong className="text-xl font-black text-slate-900 mt-1 block">{totalCount} Order masuk</strong>
                      <span className="text-[10px] text-indigo-600 font-semibold block mt-1">Status pembayaran & proses</span>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Widget 3 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rata-rata Nilai Order</span>
                      <strong className="text-xl font-black text-slate-900 mt-1 block">Rp {avgTicketSize.toLocaleString('id-ID')}</strong>
                      <span className="text-[10px] text-amber-600 font-semibold block mt-1">Average transaction value</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-650 font-bold flex items-center justify-center text-sm font-sans shrink-0">
                      Rp
                    </div>
                  </div>
                </div>

                {/* Charts Area Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart Card 1: Revenue Line/Area Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Tren Arus Pendapatan Laundry (IDR)
                      </h4>
                      <p className="text-slate-400 text-[10px] mt-0.5 mb-4">Grafik area menunjukkan laju peningkatan pendapatan harian laundry.</p>
                    </div>
                    
                    <div className="h-64 font-mono text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={daysReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" tickLine={false} tick={{ fill: '#64748B' }} />
                          <YAxis tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} tick={{ fill: '#64748B' }} />
                          <Tooltip 
                            formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                            contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '10px' }}
                          />
                          <Area type="monotone" dataKey="Pendapatan" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPendapatan)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart Card 2: Order Volume Bar Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-indigo-500" />
                        Volume Penerimaan Orderan (Harian)
                      </h4>
                      <p className="text-slate-400 text-[10px] mt-0.5 mb-4">Grafik batang mendetail banyaknya nota transaksi yang terbuat harian.</p>
                    </div>

                    <div className="h-64 font-mono text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={daysReportData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" tickLine={false} tick={{ fill: '#64748B' }} />
                          <YAxis tickLine={false} allowDecimals={false} tick={{ fill: '#64748B' }} />
                          <Tooltip 
                            formatter={(value: any) => [`${value} Nota`, 'Jumlah Order']}
                            contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '10px' }}
                          />
                          <Bar dataKey="Jumlah Order" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart Card 3: Payment Method Pie Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between col-span-1 lg:col-span-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-amber-500" />
                        Saluran Pembayaran Utama (Payment Share)
                      </h4>
                      <p className="text-slate-400 text-[10px] mt-0.5 mb-4">Analisis rasio kontribusi dari metode pembayaran (Cash, QRIS, Transfer, Deposit).</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                      {/* Pie chart itself */}
                      <div className="h-56 w-56 relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={finalPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {finalPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Volume']}
                              contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '10px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                          <span className="text-[9px] text-slate-400 uppercase font-black">Total Volume</span>
                          <span className="text-xs font-black text-slate-800 mt-0.5">Rp {totalRev.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {/* Customized detailed Legend */}
                      <div className="flex-1 space-y-3 font-sans w-full max-w-md">
                        {finalPieData.map((dataRow, idx) => {
                          const percentage = totalRev > 0 ? ((Number(dataRow.value) / totalRev) * 100).toFixed(1) : '0.0';
                          return (
                            <div key={dataRow.name} className="flex items-center justify-between border-b border-slate-50 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                                <span className="text-xs font-bold text-slate-700">{dataRow.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-slate-800 font-mono font-bold">Rp {Number(dataRow.value).toLocaleString('id-ID')}</span>
                                <span className="text-[10px] text-slate-400 font-bold block">Rasio: {percentage}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Transaksional Data Audit Table (Specific to range selection) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-xs">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs">Audit Transaksi Dalam Rentang Terpilih</h4>
                      <p className="text-slate-400 text-[10px] mt-0.5">Daftar baris data transaksi yang dicakup visualisasi grafik di atas.</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-black">
                      {reportOrders.length} Transaksi Tercakup
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                          <th className="p-3 text-left font-bold">No Nota</th>
                          <th className="p-3 text-left font-bold">Nama Pelanggan</th>
                          <th className="p-3 text-left font-bold">Rincian Layanan</th>
                          <th className="p-3 text-center font-bold">Status</th>
                          <th className="p-3 text-center font-bold">Metode</th>
                          <th className="p-3 text-right font-bold">Biaya Akhir</th>
                          <th className="p-3 text-right font-bold">Tanggal Transaksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                        {reportOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                              Tidak ada data transaksi yang tercakup dalam rentang tanggal dan cabang terpilih.
                            </td>
                          </tr>
                        ) : (
                          reportOrders.map(ord => (
                            <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-3 font-mono font-bold text-slate-900">{ord.invoiceNumber}</td>
                              <td className="p-3">
                                <div className="font-medium">{ord.customerName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</div>
                              </td>
                              <td className="p-3 text-slate-500 truncate max-w-[200px]" title={ord.items.map(it => `${it.serviceName} (${it.quantity}x)`).join(', ')}>
                                {ord.items.map(it => `${it.serviceName} (${it.quantity}x)`).join(', ')}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  ord.status === OrderStatus.SELESAI ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-3 text-center font-mono font-semibold">
                                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700`}>
                                  {ord.paymentMethod}
                                </span>
                              </td>
                              <td className="p-3 text-right font-black text-slate-800">Rp {ord.totalAmount.toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right text-slate-400 font-mono text-[10px] whitespace-nowrap">
                                {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* 7. CASHIER SETUP MANAGEMENT */}
      {activeSubTab === 'cashiers' && (
        <div className="space-y-6 animate-fadeIn" id="cashier-setup-panel">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500 animate-pulse" />
                Sistim Pengaturan & Pembagian Akun Kasir (Karyawan POS)
              </h3>
              <p className="text-[11px] text-slate-500">Mendaftarkan kasir baru, menetapkan password, serta alokasi cabang penugasan shift harian.</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {!showEditOwner && (
                <button
                  onClick={() => {
                    const owner = users.find(u => u.role === 'owner') || { name: 'Andi Owner', username: 'owner', password: 'owner' };
                    setOwnerForm({
                      name: owner.name,
                      username: owner.username,
                      password: owner.password || 'owner'
                    });
                    setShowEditOwner(true);
                    setShowAddCashier(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 text-sky-400 hover:text-sky-300 font-extrabold rounded-xl text-xs transition shadow-sm"
                  id="btn-edit-owner-profile"
                >
                  ⚙️ Atur Profil Owner
                </button>
              )}
              {!showAddCashier && (
                <button
                  onClick={() => {
                    setEditingCashierId(null);
                    setCashierForm({ name: '', username: '', password: '', branchId: 'br-1' });
                    setShowAddCashier(true);
                    setShowEditOwner(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-sm"
                  id="btn-add-cashier"
                >
                  <Plus className="w-4 h-4" /> Tambah Akun Kasir
                </button>
              )}
            </div>
          </div>

          {showEditOwner && (
            <form onSubmit={handleSaveOwner} className="bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans animate-scaleIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="font-bold text-sky-400 text-sm flex items-center gap-2">
                  <span>⚙️ Pengaturan Profil & Kredensial Database Owner</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowEditOwner(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded transition"
                >
                  ✕ Batal
                </button>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ubah informasi profil owner utama yang terdaftar dalam database pengguna. Perubahan nama akan otomatis menyesuaikan semua label izin/hak akses, riwayat aktivitas, serta otorisasi di seluruh modul kasir laundry.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Nama Lengkap Owner:</label>
                  <input
                    type="text"
                    required
                    value={ownerForm.name}
                    onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                    placeholder="Contoh: Andi Owner"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Username Login:</label>
                  <input
                    type="text"
                    required
                    value={ownerForm.username}
                    onChange={(e) => setOwnerForm({ ...ownerForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="owner"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Password Akun:</label>
                  <input
                    type="password"
                    required
                    value={ownerForm.password}
                    onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                    placeholder="Password Owner"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none animate-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditOwner(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-400 hover:bg-sky-500 text-slate-950 font-extrabold rounded-xl transition"
                >
                  Simpan Profil Owner
                </button>
              </div>
            </form>
          )}

          {showAddCashier && (
            <form onSubmit={handleSaveCashier} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs font-sans">
              <h4 className="font-bold text-slate-800 text-sm">{editingCashierId ? '✏️ Ubah Detail Akun Kasir' : '👥 Registrasi Akun Kasir Baru'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={cashierForm.name}
                    onChange={(e) => setCashierForm({ ...cashierForm, name: e.target.value })}
                    placeholder="Contoh: Rian Karyawan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Username Login:</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCashierId}
                    value={cashierForm.username}
                    onChange={(e) => setCashierForm({ ...cashierForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="rian"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Password:</label>
                  <input
                    type="password"
                    required
                    value={cashierForm.password}
                    onChange={(e) => setCashierForm({ ...cashierForm, password: e.target.value })}
                    placeholder="Min 4 karakter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Cabang Kelolaan:</label>
                  <select
                    value={cashierForm.branchId}
                    onChange={(e) => setCashierForm({ ...cashierForm, branchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none font-semibold text-slate-700"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCashier(false);
                    setEditingCashierId(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-xl"
                >
                  {editingCashierId ? 'Simpan Perubahan' : 'Daftarkan Kasir'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold uppercase text-slate-500 text-[10px]">
              Daftar Kasir & Cabang Yang Dikelola
            </div>

            <div className="divide-y divide-slate-100 font-sans">
              {users.filter(u => u.role === 'karyawan').map(u => {
                const br = branches.find(b => b.id === u.branchId);
                return (
                  <div key={u.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-[9px] font-extrabold uppercase">KASIR</span>
                        <strong className="text-slate-800 text-sm">{u.name}</strong>
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        Username: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{u.username}</span> &middot; Password: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{u.password || '●●●●●●'}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] space-y-0.5 mt-1">
                        <div>🏢 Bekerja di: <strong className="text-slate-700">{br ? br.name : 'Cabang Utama'}</strong></div>
                        <div>🔑 Hak Akses: <strong className="text-indigo-600 font-extrabold">{getOwnerName()}</strong></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEditCashier(u)}
                        className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (u.id === 'usr-1') {
                            alert("Tidak dapat menghapus akun owner!");
                          } else {
                            setDeleteConfirmCashier(u);
                          }
                        }}
                        className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7.5. BRANCH DATABASE MANAGEMENT */}
      {activeSubTab === 'branches' && (
        <div className="space-y-6 animate-fadeIn" id="branch-setup-panel">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-500 animate-pulse" />
                Sistem Database & Pengaturan Multi-Outlet Cabang Laundry
              </h3>
              <p className="text-[11px] text-slate-500">Mendaftarkan cabang outlet baru, memposisikan titik alamat fisik, serta merincikan nomor kontak operasional.</p>
            </div>
            {!showAddBranch && (
              <button
                onClick={() => {
                  setEditingBranchId(null);
                  setBranchForm({ name: '', address: '', phone: '' });
                  setShowAddBranch(true);
                }}
                className="px-4 py-2 bg-slate-950 text-sky-400 border border-slate-800 hover:bg-slate-900 hover:text-sky-300 font-extrabold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
                id="btn-add-branch-tab"
              >
                <Plus className="w-4 h-4" /> Tambah Cabang Baru
              </button>
            )}
          </div>

          {/* ADD / EDIT BRANCH PANEL */}
          {showAddBranch && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 animate-scaleIn font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {editingBranchId ? 'Formulir Sunting Cabang Laundry' : 'Formulir Pendaftaran Cabang Baru'}
                </h4>
                <button
                  onClick={() => {
                    setShowAddBranch(false);
                    setEditingBranchId(null);
                  }}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-550 text-[10.5px] rounded-lg transition"
                >
                  ✕ Batal
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block" htmlFor="branch-name-input">
                      Nama Cabang/Outlet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="branch-name-input"
                      required
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      placeholder="Contoh: Cabang Pondok Indah, Cabang Fatmawati"
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl text-xs outline-none focus:ring-1 focus:ring-sky-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block" htmlFor="branch-phone-input">
                      Nomor Telepon Hubungi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="branch-phone-input"
                      required
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      placeholder="Contoh: 081299887766 atau (021) 7654321"
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl text-xs outline-none focus:ring-1 focus:ring-sky-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block" htmlFor="branch-address-input">
                    Alamat Lengkap Outlet <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="branch-address-input"
                    required
                    rows={3}
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    placeholder="Contoh: Ruko Golden Boulevard Blok C No. 10, Jl. Pahlawan Seribu, BSD City, Tangerang Selatan"
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl text-xs outline-none focus:ring-1 focus:ring-sky-500 transition resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBranch(false);
                      setEditingBranchId(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-605 text-slate-950 font-black rounded-xl text-xs transition shadow-sm"
                  >
                    {editingBranchId ? 'Simpan Perubahan' : 'Daftarkan Cabang'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BRANCH LIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map(b => {
              const assignedCashiers = users.filter(u => u.branchId === b.id && u.role === 'karyawan');
              const totalBranchOrders = orders.filter(o => o.branchId === b.id).length;
              return (
                <div key={b.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 hover:shadow-md transition leading-relaxed relative overflow-hidden flex flex-col justify-between">
                  {/* Visual accent top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400"></div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider text-[9px]">OUTLET / CABANG</h4>
                        <span className="font-bold text-slate-800 text-sm block mt-0.5">{b.name}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-bold rounded">
                        ID: {b.id}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-600">{b.phone}</span>
                      </div>
                    </div>

                    {/* Stats counters */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-50">
                      <div className="text-center md:text-left">
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Staf Kasir</span>
                        <div className="flex items-center justify-center md:justify-start gap-1 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          <strong className="text-slate-800 text-xs font-mono">{assignedCashiers.length} Orang</strong>
                        </div>
                      </div>
                      <div className="text-center md:text-left border-l border-slate-150 pl-3">
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Riwayat Nota</span>
                        <div className="flex items-center justify-center md:justify-start gap-1 mt-0.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-slate-800 text-xs font-mono">{totalBranchOrders} Order</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-50 mt-auto">
                    <button
                      onClick={() => startEditBranch(b)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-lg text-[10px] flex items-center justify-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (branches.length <= 1) {
                          alert("Tidak dapat menghapus cabang terakhir Anda! Harus ada minimal 1 cabang laundry aktif.");
                        } else {
                          setDeleteConfirmBranch(b);
                        }
                      }}
                      className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'attendance' && (
        <div className="space-y-6 animate-fadeIn font-sans">
          {/* Header & Reload */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-850 flex items-center gap-2">
                <span className="p-1 px-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">📅</span>
                Rekap Presensi & Jam Kerja Karyawan
              </h2>
              <p className="text-xs text-slate-450 mt-0.5">Pantau kesiapan staf outlet, durasi shift kerja, koordinat presensi, dan rekapitulasi harian.</p>
            </div>
            <button
              onClick={() => {
                const records = LaughDryDatabase.getAttendance();
                setAttendanceRecords(records);
                triggerToast("🔄 Data Absensi Karyawan Diperbarui!");
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95"
            >
              🔄 Refresh Data
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Branch Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-500 uppercase">Saring Cabang Outlet</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setAttendanceStaffFilter('all'); // reset staff filter when branch changes
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="all">Semua Cabang (Seluruh Outlet)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Staff Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-500 uppercase">Nama Karyawan / Kasir</label>
              <select
                value={attendanceStaffFilter}
                onChange={(e) => setAttendanceStaffFilter(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="all">Semua Kasir</option>
                {users
                  .filter(u => u.role === 'karyawan' && (selectedBranch === 'all' || u.branchId === selectedBranch))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))
                }
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-500 uppercase">Status Kehadiran Sesi</label>
              <select
                value={attendanceStatusFilter}
                onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="all">Semua Status</option>
                <option value="Hadir">Aktif Bekerja (Check-In)</option>
                <option value="Selesai">Sudah Checkout (Selesai)</option>
              </select>
            </div>
          </div>

          {/* Metrics Summary Row */}
          {(() => {
            // Apply filtering logic
            const filteredRecords = attendanceRecords.filter(r => {
              const matchesBranch = selectedBranch === 'all' || r.branchId === selectedBranch;
              const matchesStaff = attendanceStaffFilter === 'all' || r.userId === attendanceStaffFilter;
              const matchesStatus = attendanceStatusFilter === 'all' || r.status === attendanceStatusFilter;
              return matchesBranch && matchesStaff && matchesStatus;
            });

            const activeWorkingCount = filteredRecords.filter(r => r.status === 'Hadir').length;
            const completedShiftsCount = filteredRecords.filter(r => r.status === 'Selesai').length;
            
            const totalMinutesWorked = filteredRecords
              .filter(r => r.status === 'Selesai')
              .reduce((sum, r) => sum + (r.workDuration || 0), 0);
            
            const totalHours = Math.floor(totalMinutesWorked / 60);
            const totalRemainingMinutes = totalMinutesWorked % 60;

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Metric 1 */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">staf aktif bekerja</span>
                      <div className="text-2xl font-black text-slate-800 mt-1">{activeWorkingCount} Orang</div>
                      <p className="text-[10.5px] text-slate-400 mt-1">Staf outlet yang saat ini sedang berada di shift aktif.</p>
                    </div>
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl animate-pulse">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">shif selesai</span>
                      <div className="text-2xl font-black text-slate-800 mt-1">{completedShiftsCount} Sesi</div>
                      <p className="text-[10.5px] text-slate-400 mt-1">Sesi kerja harian karyawan yang telah selesai checkout.</p>
                    </div>
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">total akumulasi durasi</span>
                      <div className="text-2xl font-black text-slate-800 mt-1">
                        {totalHours}j {totalRemainingMinutes}m
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1">Jumlah jam kerja produktif terakumulasi dari seluruh staf.</p>
                    </div>
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Table of Attendance Records */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-slate-800">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Tabel Log Absensi</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 select-none text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="p-4 pl-6">Nama Kasir</th>
                          <th className="p-4">Cabang Outlet</th>
                          <th className="p-4">Jam Check-In</th>
                          <th className="p-4">Jam Check-Out</th>
                          <th className="p-4">Durasi Shift</th>
                          <th className="p-4">Catatan Operasional</th>
                          <th className="p-4 pr-6 text-right">Lokasi GPS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                              Tidak ada log kehadiran karyawan yang cocok dengan kriteria saringan di atas.
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((r, idx) => {
                            const branchName = branches.find(b => b.id === r.branchId)?.name || 'Cabang Utama';
                            let checkInStr = '⏳--';
                            try { if (r.checkIn) checkInStr = new Date(r.checkIn).toLocaleString('id-ID') + ' WIB'; } catch(e) {}
                            let checkOutStr = '⏳--';
                            try { if (r.checkOut) checkOutStr = new Date(r.checkOut).toLocaleString('id-ID') + ' WIB'; } catch(e) {}
                            
                            return (
                              <tr key={r.id || idx} className="hover:bg-slate-50/50 transition border-b border-slate-50">
                                <td className="p-4 pl-6">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-600 border border-slate-200">
                                      {r.userName?.charAt(0) || 'K'}
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-800 block">{r.userName}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">ID: {r.userId}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 font-semibold text-slate-600">
                                  {branchName}
                                </td>
                                <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                                  {checkInStr}
                                </td>
                                <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                                  {r.status === 'Hadir' ? (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold rounded-lg animate-pulse inline-block">
                                      Sedang Berjalan
                                    </span>
                                  ) : (
                                    checkOutStr
                                  )}
                                </td>
                                <td className="p-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                                  {r.status === 'Hadir' ? '⏳ Aktif' : `${Math.floor((r.workDuration || 0) / 60)}j ${(r.workDuration || 0) % 60}m`}
                                </td>
                                <td className="p-4 max-w-xs text-slate-500 truncate italic" title={r.notes}>
                                  {r.notes || '-'}
                                </td>
                                <td className="p-4 pr-6 text-right font-mono text-[10.5px] text-rose-500 whitespace-nowrap">
                                  📍 {r.latLong || '-'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* TODAY TRANSACTIONS MODAL */}
      {showTodayTransactionsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn font-sans">
            
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400 animate-pulse" />
                  Rincian Transaksi Hari Ini (Sabtu, 30 Mei 2026)
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Menampilkan seluruh order masuk dan progres transaksi terhitung omzet hari ini.</p>
              </div>
              <button
                onClick={() => setShowTodayTransactionsModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Total Revenue Summary Bar */}
            <div className="p-4 bg-emerald-50 text-emerald-800 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span>Total Omzet Lunas Terhitung:</span>
                <strong className="text-emerald-900 text-sm">Rp {omzetHariIni.toLocaleString('id-ID')}</strong>
              </div>
              <div>
                <span>Total Cucian Hari Ini: {orderHariIniCount} Orderan</span>
              </div>
            </div>

            {/* Table Area */}
            <div className="p-6 overflow-y-auto flex-1">
              {filteredOrders.filter(o => o.createdAt.startsWith('2026-05-30')).length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ada transaksi yang tercatat hari ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-2">
                        <th className="pb-3 text-left">No Nota</th>
                        <th className="pb-3 text-left">Nama Pelanggan</th>
                        <th className="pb-3 text-left">Layanan Laundry</th>
                        <th className="pb-3 text-center">Status Cucian</th>
                        <th className="pb-3 text-center">Bayar</th>
                        <th className="pb-3 text-right">Biaya Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredOrders
                        .filter(o => o.createdAt.startsWith('2026-05-30'))
                        .map(order => {
                          return (
                            <tr key={order.id} className="hover:bg-slate-50/60 transition duration-150">
                              <td className="py-3 font-mono font-bold text-slate-900">{order.invoiceNumber}</td>
                              <td className="py-3 font-medium">
                                <div>{order.customerName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</div>
                              </td>
                              <td className="py-3">
                                <div className="max-w-[200px] truncate" title={order.items.map(it => `${it.serviceName} (${it.quantity}x)`).join(', ')}>
                                  {order.items.map(it => `${it.serviceName} (${it.quantity}x)`).join(', ')}
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700">
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${order.paymentStatus === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                  {order.paymentStatus}
                                </span>
                                <span className="text-[10px] block text-slate-400 mt-0.5">{order.paymentMethod}</span>
                              </td>
                              <td className="py-3 text-right font-bold text-slate-850">Rp {order.totalAmount.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTodayTransactionsModal(false)}
                className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Tutup Ringkasan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: SERVICE DEACTIVATION CONFIRMATION */}
      {deleteConfirmService && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 text-slate-800 animate-scaleIn">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                ⚠️
              </div>
              <h3 className="text-sm font-black text-slate-905">Apakah Anda ingin menonaktifkan layanan ini?</h3>
              <p className="text-xs text-slate-500 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
                Layanan: <strong className="text-slate-805 text-xs">{deleteConfirmService.name}</strong><br/>
                Kategori: <span className="capitalize">{deleteConfirmService.category}</span><br/>
                Tarif: <span>Rp {deleteConfirmService.price.toLocaleString()} / {deleteConfirmService.unit}</span>
              </p>
              <p className="text-[11px] text-rose-500 font-semibold text-left">
                *Layanan yang dinonaktifkan tidak akan muncul lagi pada menu input transaksi kasir, namun histori transaksi terdahulu akan tetap aman.
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirmService(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                onClick={() => executeDeleteService(deleteConfirmService.id)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Ya, Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CASHIER ACCOUNT DELETION CONFIRMATION */}
      {deleteConfirmCashier && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 text-slate-800 animate-scaleIn">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                👤
              </div>
              <h3 className="text-sm font-black text-slate-905">Apakah Anda ingin menghapus akun kasir ini?</h3>
              <p className="text-xs text-slate-500 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                Nama Kasir: <strong className="text-slate-805 text-xs font-mono">{deleteConfirmCashier.name}</strong><br/>
                Username: <span className="font-mono bg-slate-100 px-1 rounded text-red-600">{deleteConfirmCashier.username}</span><br/>
                Cabang: <span>{branches.find(b => b.id === deleteConfirmCashier.branchId)?.name || 'Cabang Utama'}</span>
              </p>
              <p className="text-[11px] text-rose-500 font-semibold text-left">
                *Akun ini tidak akan dapat login lagi ke sistem kasir karyawan POS Laugh Dry. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirmCashier(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                onClick={() => executeDeleteCashier(deleteConfirmCashier.id)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2.5: BRANCH DELETION CONFIRMATION */}
      {deleteConfirmBranch && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 text-slate-800 animate-scaleIn">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                🏢
              </div>
              <h3 className="text-sm font-black text-rose-600">Apakah data akan benar dihapus?</h3>
              <p className="text-xs text-slate-500 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                Nama Cabang: <strong className="text-slate-800 text-xs font-mono">{deleteConfirmBranch.name}</strong><br/>
                Alamat: <span className="text-slate-600">{deleteConfirmBranch.address}</span><br/>
                Telepon: <span className="font-mono text-slate-600">{deleteConfirmBranch.phone}</span>
              </p>
              <p className="text-[11px] text-rose-500 font-semibold text-left">
                *Peringatan: Menghapus cabang ini akan memutuskan integrasi dengan kasir POS atau transaksi yang sebelumnya ditugaskan ke cabang ini.
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirmBranch(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                onClick={executeDeleteBranch}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OPEX EXPENSE DELETION CONFIRMATION */}
      {deleteConfirmExpense && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 text-slate-800 animate-scaleIn">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                💸
              </div>
              <h3 className="text-sm font-black text-slate-905">Konfirmasi Hapus Catatan Pengeluaran</h3>
              <p className="text-xs text-slate-500 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                Deskripsi: <strong className="text-slate-805">{deleteConfirmExpense.description}</strong><br/>
                Jumlah: <span className="text-red-650 font-black">Rp {deleteConfirmExpense.amount.toLocaleString()}</span><br/>
                Kategori: <span className="font-mono">{deleteConfirmExpense.category}</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                Tindakan ini akan mengoreksi laporan keuangan owner dan mengembalikan alokasi kas terpakai pada jurnal pengeluaran cabang.
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirmExpense(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                onClick={() => executeDeleteExpense(deleteConfirmExpense.id)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Hapus Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL DATABASE RE-SEED/RESET CONFIRMATION */}
      {showResetDbConfirm && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl p-6 text-slate-800 animate-scaleIn border-t-4 border-t-red-600">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">
                🚨
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">🚨 Peringatan Keamanan Owner</h3>
              <h4 className="text-xs font-bold text-slate-700">Apakah Anda yakin ingin me-reset seluruh database?</h4>
              
              <div className="text-xs text-left text-slate-500 leading-relaxed space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                <p>Tindakan sistem ini akan:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Menghapus seluruh <strong className="text-rose-600">transaksi cucian baru</strong> yang telah diinput kasir.</li>
                  <li>Mengosongkan riwayat deposit saldo & poin member.</li>
                  <li>Mengembalikan setelan template WA & struk cetak ke data bawaan pabrik.</li>
                </ul>
              </div>
              <p className="text-[10px] text-red-600 font-black uppercase tracking-wide">
                *Tindakan ini mutlak bersifat IRREVERSIBLE (tidak bisa dikembalikan)!
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowResetDbConfirm(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal, Amankan DB
              </button>
              <button
                onClick={executeResetDatabase}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm font-mono"
              >
                Ya, Reset Total
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POP-UP SELECTOR FOR SERVICES FORM (CATEGORY, UNIT, ETC.) */}
      {/* ========================================================= */}
      {activePopupField && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4 animate-fadeIn relative">
            <button
              type="button"
              onClick={() => setActivePopupField(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 font-black text-xs cursor-pointer bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {activePopupField === 'category' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <span className="text-xl">🧺</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#0F172A] text-sm">Pilih Kategori Model</h4>
                  <p className="text-slate-500 font-semibold text-[10.5px] leading-tight">Tentukan format dasar pengukuran jasa:</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ ...serviceForm, category: 'kiloan', unit: 'kg' });
                      setActivePopupField(null);
                    }}
                    className={`p-3.5 border rounded-2xl text-left font-bold text-xs transition cursor-pointer flex gap-3 items-center ${
                      serviceForm.category === 'kiloan' ? 'border-emerald-600 bg-emerald-50/45 text-emerald-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-lg">🧺</span>
                    <div>
                      <span className="block font-black text-[11px]">Laundry Kiloan</span>
                      <span className="text-[9.5px] font-normal text-slate-400 block">Dihitung berdasarkan berat (kg) pakaian</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ ...serviceForm, category: 'satuan', unit: 'pcs' });
                      setActivePopupField(null);
                    }}
                    className={`p-3.5 border rounded-2xl text-left font-bold text-xs transition cursor-pointer flex gap-3 items-center ${
                      serviceForm.category === 'satuan' ? 'border-emerald-600 bg-emerald-50/45 text-emerald-950' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-lg">🧥</span>
                    <div>
                      <span className="block font-black text-[11px]">Laundry Satuan</span>
                      <span className="text-[9.5px] font-normal text-slate-400 block">Dihitung per biji/pcs pakaian atau karpet</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activePopupField === 'unit' && (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <span className="text-xl">📦</span>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-[#0F172A] text-sm">Pilih Unit Pengukuran</h4>
                  <p className="text-slate-500 font-semibold text-[10.5px] leading-tight">Gunakan standar ukuran pengali transaksi:</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {['kg', 'pcs', 'lembar', 'pasang', 'meter', 'lusin'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => {
                        setServiceForm({ ...serviceForm, unit: u });
                        setActivePopupField(null);
                      }}
                      className={`p-2.5 border rounded-xl text-center font-black text-[11px] transition cursor-pointer capitalize ${
                        serviceForm.unit === u ? 'border-emerald-650 bg-emerald-50/45 text-emerald-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-semibold text-slate-405 block">Masukkan unit kustom jika tidak ada di atas:</span>
                  <input
                    type="text"
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                    placeholder="Contoh: box / kg-dry"
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs focus:border-emerald-600 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActivePopupField(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setActivePopupField(null)}
                    className="w-full py-1.5 mt-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Simpan Unit Kustom
                  </button>
                </div>
              </div>
            )}

            {activePopupField === 'sizeOption' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                  <span className="text-xl">📏</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Pilih Klasifikasi Ukuran</h4>
                  <p className="text-slate-500 font-semibold text-[10.5px] leading-tight">Pilih ukuran barang satuan yang sesuai:</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 max-h-56 overflow-y-auto">
                  {['Kecil', 'Sedang', 'Besar', 'Tebal', 'Tipis', 'Panjang', 'Pendek'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setServiceForm({ ...serviceForm, sizeOption: opt });
                        setActivePopupField(null);
                      }}
                      className={`p-2.5 border rounded-xl text-center font-black text-[11px] transition cursor-pointer ${
                        serviceForm.sizeOption === opt ? 'border-amber-500 bg-amber-50/45 text-amber-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePopupField === 'promiseDurationUnit' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <span className="text-xl">⏱️</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#0F172A] text-sm">Pilih Satuan Estimasi</h4>
                  <p className="text-slate-500 font-semibold text-[10.5px] leading-tight">Pilih format estimasi durasi penyelesaian:</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ ...serviceForm, promiseDurationUnit: 'Jam' });
                      setActivePopupField(null);
                    }}
                    className={`p-3 border rounded-xl text-center font-black text-xs transition cursor-pointer ${
                      serviceForm.promiseDurationUnit === 'Jam' ? 'border-emerald-600 bg-emerald-55/35 text-emerald-950' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-lg">⚡</span>
                    <span>Jam (Hours)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ ...serviceForm, promiseDurationUnit: 'Hari' });
                      setActivePopupField(null);
                    }}
                    className={`p-3 border rounded-xl text-center font-black text-xs transition cursor-pointer ${
                      serviceForm.promiseDurationUnit === 'Hari' ? 'border-emerald-600 bg-emerald-55/35 text-emerald-950' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-lg">📅</span>
                    <span>Hari (Days)</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Global Help formatting function
const formatCompletionDate = (isoStr: string) => {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
