/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Branch,
  Service,
  Customer,
  Order,
  OrderStatus,
  Expense,
  DepositMutation,
  LoyaltyPointMutation,
  AuditLog,
  WhatsAppTemplate,
  SystemSettings,
  SettingsVersion,
  AttendanceRecord,
} from '../types';
import { LaundryService } from '../services/laundryService';

// Let's seed with rich initial data that demonstrates the platform's features instantly.
const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Andi Owner', role: 'owner', email: 'andi.owner@laughdry.co.id', username: 'owner', branchId: 'br-1', password: 'owner' },
  { id: 'usr-2', name: 'Rian Karyawan', role: 'karyawan', email: 'rian@laughdry.co.id', username: 'rian', branchId: 'br-1', password: 'rian123' },
  { id: 'usr-3', name: 'Siti Karyawan', role: 'karyawan', email: 'siti@laughdry.co.id', username: 'siti', branchId: 'br-2', password: 'siti123' },
];

const INITIAL_BRANCHES: Branch[] = [
  { id: 'br-1', name: 'Cabang Utama Bintaro', address: 'Jl. Boulevard Bintaro Sekse 7 No. 42, Tangerang Selatan', phone: '081234567890' },
  { id: 'br-2', name: 'Cabang Premium Kemang', address: 'Jl. Kemang Raya No. 12B, Jakarta Selatan', phone: '082345678901' },
  { id: 'br-3', name: 'Cabang Express Menteng', address: 'Jl. Teuku Umar No. 89, Jakarta Pusat', phone: '083456789012' },
];

const INITIAL_SERVICES: Service[] = [
  { id: 'srv-1', name: 'Cuci Setrika', category: 'kiloan', price: 8000, unit: 'kg', estimateHours: 48, isActive: true, workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'], promiseName: 'Reguler', promiseDurationText: '2 Hari' },
  { id: 'srv-2', name: 'Cuci Setrika', category: 'kiloan', price: 15000, unit: 'kg', estimateHours: 6, isActive: true, workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'], promiseName: 'Express', promiseDurationText: '6 Jam' },
  { id: 'srv-5', name: 'Jas / Tuxedo', category: 'satuan', price: 45000, unit: 'pcs', estimateHours: 72, isActive: true, workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'], promiseName: 'Reguler', promiseDurationText: '3 Hari' },
  { id: 'srv-6', name: 'Bed Cover Large', category: 'satuan', price: 35000, unit: 'pcs', estimateHours: 48, isActive: true, workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'], promiseName: 'Reguler', promiseDurationText: '2 Hari' },
  { id: 'srv-8', name: 'Premium Shoes Wash', category: 'satuan', price: 50000, unit: 'pcs', estimateHours: 96, isActive: true, workflowSteps: ['Antri', 'Dicuci', 'Disetrika/Dilipat', 'Dikemas', 'Siap Diambil', 'Selesai'], promiseName: 'Reguler', promiseDurationText: '4 Hari' }
];

const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_DEPOSITS: DepositMutation[] = [];

const INITIAL_LOYALTY: LoyaltyPointMutation[] = [];

const INITIAL_AUDIT: AuditLog[] = [];

const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Nota Layanan Baru',
    category: 'nota_layanan',
    body: `Halo Kak *{{customer_name}}*, terima kasih telah memesan layanan di *Laundry Kita*! 😊
Berikut rincian nota Anda:
📌 No. Nota: *{{invoice_number}}*
🧺 Layanan: *{{services_list}}*
⚖️ Berat / Jumlah: *{{total_quantity}}*
💰 Total Biaya: *{{total_amount}}*
💳 Pembayaran: *{{payment_method}}* ({{payment_status}})
🕒 Estimasi Selesai: *{{estimated_completion}}*

Pantau cucian Kakak secara real-time langsung melalui tautan di bawah ini:
🔗 {{tracking_url}}

Hormat kami,
*Laundry Kita*`
  },
  {
    id: 'tmpl-2',
    name: 'Laundry Siap Diambil',
    category: 'siap_diambil',
    body: `Kabar gembira Kak *{{customer_name}}*! 🎉

Cucian ceria Kakak untuk nota *{{invoice_number}}* telah SELESAI diproses dengan standar kebersihan paripurna kami.
Sudah rapi, wangi, higienis, dan dikemas dengan aman. ✨

Silakan datang mengambilnya di outlet kami:
📍 *{{branch_name}}*
🏢 Alamat: {{branch_address}}
📱 Sisa Tagihan: *{{payment_due}}*

Terima kasih telah mempercayakan laundry Kakak bersama kami!
🔥 *Jangan lupa tunjukkan link tracking atau halaman invoice untuk pengambilan ya!*`
  },
  {
    id: 'tmpl-3',
    name: 'Promo Bulanan Spesial',
    category: 'promo',
    body: `Halo Sahabat Setia *Laundry Kita*! 🌟

Jangan biarkan pakaian kotor menumpuk di musim hujan ini! Dapatkan *Cahback 20% Deposit / Potongan Rp 15.000* untuk laundry satuan khusus bed cover, jas mewah, dan sepatu premium!

💳 Saldo Deposit Anda saat ini: *{{deposit_balance}}*
⭐ Loyalty Coins Anda saat ini: *{{loyalty_points}}* Coins

Pakai kode promo: *BERSIHMANTAP* saat transaksi di kasir kesayangan Kakak!
Promo berlaku hingga akhir bulan ini.`
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

const INITIAL_SETTINGS: SystemSettings = {
  logoUrl: 'https://images.unsplash.com/photo-1545173168-9f1947e8017e?q=80&w=200&auto=format&fit=crop',
  pointsMultiplier: 10000, // 1 point per 10,000 IDR
  pointsValue: 100, // 1 point = 100 IDR discount
  bluetoothPrinterAddress: 'CC:3F:1D:9B:D2:4E (Thermal POS-58)',
  showNotesInReceipt: true,
  showPointsInReceipt: true,
  showBranchPhone: true,
  showEstimatedCompletion: true,
  showCustomerPhoneInReceipt: true,
  showCashierNameInReceipt: true,
  showTermsInReceipt: true,
  showLogoInReceipt: true,
  showHeaderLogoInReceipt: true,
  receiptFontSize: 'medium',
  receiptAlignment: 'center',
  customReceiptHeader: 'LAUGHDRY EXPRESS\nLAUNDRY KILOAN & SATUAN BINTARO',
  customReceiptHeaderLogoImg: 'https://images.unsplash.com/photo-1545173168-9f1947e8017e?q=80&w=200&auto=format&fit=crop',
  customReceiptFooter: 'TERIMA KASIH ATAS KUNJUNGAN ANDA!\nSIMPAN STRUK INI SEBAGAI PENJAMIN',
  receiptElements: [
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
  ],
  qrisType: 'static',
  qrisMerchantId: 'ID1020304050607',
  qrisStaticQrUrl: ''
};

const INITIAL_SETTINGS_HISTORY: SettingsVersion[] = [
  {
    id: 'ver-1',
    timestamp: '2026-06-01T08:00:00Z',
    description: 'Konfigurasi Awal Default Sektor 9',
    settings: { ...INITIAL_SETTINGS }
  },
  {
    id: 'ver-2',
    timestamp: '2026-06-03T14:20:00Z',
    description: 'Nota Promo Idul Adha (Teks Footer Kustom)',
    settings: {
      ...INITIAL_SETTINGS,
      customReceiptPromo: 'DISKON RAMADHAN 15% - KODE: BERKAH',
      customReceiptFooter: 'KASIH INFO KELUARGA YA KAK!\nSIMPAN SEBAGAI KUPON DI NEXT ORDER'
    }
  }
];

export class LaughDryDatabase {
  private static loadKey<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(`laughdry_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private static saveKey<T>(key: string, value: T): void {
    localStorage.setItem(`laughdry_${key}`, JSON.stringify(value));
  }

  // Firestore Synchronization static helper
  public static async syncFromFirestore(): Promise<void> {
    try {
      // Proactively purge historical sandbox trial data records from Firestore
      const mockCustomerIds = ['cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5', 'cust-6', 'cust-7'];
      const mockOrderIds = ['ord-1001', 'ord-1002', 'ord-1003', 'ord-1004', 'ord-1005'];
      const mockExpenseIds = ['exp-1', 'exp-2', 'exp-3', 'exp-4', 'exp-5', 'exp-6', 'exp-7'];

      for (const id of mockCustomerIds) {
        try { await LaundryService.deleteCustomer(id); } catch(e) {}
      }
      for (const id of mockOrderIds) {
        try { await LaundryService.deleteOrder(id); } catch(e) {}
      }
      for (const id of mockExpenseIds) {
        try { await LaundryService.deleteExpense(id); } catch(e) {}
      }

      // 1. Branches
      const branches = await LaundryService.getBranches();
      if (branches.length > 0) {
        this.saveKey('branches', branches);
      } else {
        for (const b of INITIAL_BRANCHES) {
          await LaundryService.saveBranch(b);
        }
        this.saveKey('branches', INITIAL_BRANCHES);
      }

      // 2. Services
      const services = await LaundryService.getServices();
      if (services.length > 0) {
        this.saveKey('services', services);
      } else {
        for (const s of INITIAL_SERVICES) {
          await LaundryService.saveService(s);
        }
        this.saveKey('services', INITIAL_SERVICES);
      }

      // 3. Customers
      const customers = await LaundryService.getCustomers();
      const cleanCustomers = customers.filter(c => !mockCustomerIds.includes(c.id));
      this.saveKey('customers', cleanCustomers);

      // 4. Orders
      const orders = await LaundryService.getOrders();
      const cleanOrders = orders.filter(o => !mockOrderIds.includes(o.id));
      this.saveKey('orders', cleanOrders);

      // 5. Expenses
      const expenses = await LaundryService.getExpenses();
      const cleanExpenses = expenses.filter(e => !mockExpenseIds.includes(e.id));
      this.saveKey('expenses', cleanExpenses);

      // 6. Settings
      const settings = await LaundryService.getSettings();
      if (settings) {
        this.saveKey('settings', settings);
      } else {
        await LaundryService.saveSettings(INITIAL_SETTINGS);
        this.saveKey('settings', INITIAL_SETTINGS);
      }

      // 7. Attendance
      const attendance = await LaundryService.getAttendanceRecords();
      if (attendance.length > 0) {
        this.saveKey('attendance', attendance);
      }
    } catch (e) {
      console.error("Gagal sinkronasi awal Firestore:", e);
    }
  }

  // State elements
  public static getUsers(): User[] { return this.loadKey('users', INITIAL_USERS); }
  public static saveUsers(data: User[]) { this.saveKey('users', data); }

  public static getBranches(): Branch[] { return this.loadKey('branches', INITIAL_BRANCHES); }
  public static saveBranches(data: Branch[]) { 
    const previous = this.getBranches();
    this.saveKey('branches', data); 
    
    // Differential Sync
    data.forEach(item => {
      const prevItem = previous.find(p => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        LaundryService.saveBranch(item).catch(err => console.error("Gagal save branch ke Firestore:", err));
      }
    });
    previous.forEach(prevItem => {
      const exists = data.some(d => d.id === prevItem.id);
      if (!exists) {
        LaundryService.deleteBranch(prevItem.id).catch(err => console.error("Gagal delete branch dari Firestore:", err));
      }
    });
  }

  public static getServices(): Service[] { return this.loadKey('services', INITIAL_SERVICES); }
  public static saveServices(data: Service[]) { 
    const previous = this.getServices();
    this.saveKey('services', data); 
    
    // Differential Sync
    data.forEach(item => {
      const prevItem = previous.find(p => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        LaundryService.saveService(item).catch(err => console.error("Gagal save service ke Firestore:", err));
      }
    });
    previous.forEach(prevItem => {
      const exists = data.some(d => d.id === prevItem.id);
      if (!exists) {
        LaundryService.deleteService(prevItem.id).catch(err => console.error("Gagal delete service dari Firestore:", err));
      }
    });
  }

  public static getCustomers(): Customer[] { return this.loadKey('customers', INITIAL_CUSTOMERS); }
  public static saveCustomers(data: Customer[]) { 
    const previous = this.getCustomers();
    this.saveKey('customers', data); 
    
    // Differential Sync
    data.forEach(item => {
      const prevItem = previous.find(p => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        LaundryService.saveCustomer(item).catch(err => console.error("Gagal save customer ke Firestore:", err));
      }
    });
    previous.forEach(prevItem => {
      const exists = data.some(d => d.id === prevItem.id);
      if (!exists) {
        LaundryService.deleteCustomer(prevItem.id).catch(err => console.error("Gagal delete customer dari Firestore:", err));
      }
    });
  }

  public static getOrders(): Order[] { return this.loadKey('orders', INITIAL_ORDERS); }
  public static saveOrders(data: Order[]) { 
    const previous = this.getOrders();
    this.saveKey('orders', data); 
    
    // Differential Sync
    data.forEach(item => {
      const prevItem = previous.find(p => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        LaundryService.addOrder(item).catch(err => console.error("Gagal save order ke Firestore:", err));
      }
    });
    previous.forEach(prevItem => {
      const exists = data.some(d => d.id === prevItem.id);
      if (!exists) {
        LaundryService.deleteOrder(prevItem.id).catch(err => console.error("Gagal delete order dari Firestore:", err));
      }
    });
  }

  public static getExpenses(): Expense[] { return this.loadKey('expenses', INITIAL_EXPENSES); }
  public static saveExpenses(data: Expense[]) { 
    const previous = this.getExpenses();
    this.saveKey('expenses', data); 
    
    // Differential Sync
    data.forEach(item => {
      const prevItem = previous.find(p => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        LaundryService.saveExpense(item).catch(err => console.error("Gagal save expense ke Firestore:", err));
      }
    });
    previous.forEach(prevItem => {
      const exists = data.some(d => d.id === prevItem.id);
      if (!exists) {
        LaundryService.deleteExpense(prevItem.id).catch(err => console.error("Gagal delete expense dari Firestore:", err));
      }
    });
  }

  public static getDeposits(): DepositMutation[] { return this.loadKey('deposits', INITIAL_DEPOSITS); }
  public static saveDeposits(data: DepositMutation[]) { this.saveKey('deposits', data); }

  public static getLoyalty(): LoyaltyPointMutation[] { return this.loadKey('loyalty', INITIAL_LOYALTY); }
  public static saveLoyalty(data: LoyaltyPointMutation[]) { this.saveKey('loyalty', data); }

  public static getAuditLogs(): AuditLog[] { return this.loadKey('audit_logs', INITIAL_AUDIT); }
  public static saveAuditLogs(data: AuditLog[]) { this.saveKey('audit_logs', data); }

  public static getTemplates(): WhatsAppTemplate[] { return this.loadKey('templates', INITIAL_TEMPLATES); }
  public static saveTemplates(data: WhatsAppTemplate[]) { this.saveKey('templates', data); }

  public static getAttendance(): AttendanceRecord[] { return this.loadKey('attendance', INITIAL_ATTENDANCE); }
  public static saveAttendance(data: AttendanceRecord[]) { 
    const previous = this.getAttendance();
    this.saveKey('attendance', data); 
    
    // Differential Sync
    data.forEach(item => {
      const prevItem = previous.find(p => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        LaundryService.saveAttendanceRecord(item).catch(err => console.error("Gagal save attendance ke Firestore:", err));
      }
    });
  }

  public static getSettings(): SystemSettings { 
    const settings = this.loadKey('settings', INITIAL_SETTINGS); 
    const hasNewEl = settings.receiptElements && settings.receiptElements.some(el => el.id === 'cashier_info');
    if (!settings.receiptElements || settings.receiptElements.length === 0 || !hasNewEl) {
      settings.receiptElements = INITIAL_SETTINGS.receiptElements;
      this.saveKey('settings', settings);
    }
    return settings; 
  }
  public static saveSettings(data: SystemSettings) { 
    this.saveKey('settings', data); 
    LaundryService.saveSettings(data).catch(err => console.error(err));
  }

  public static getSettingsHistory(): SettingsVersion[] {
    return this.loadKey('settings_history', INITIAL_SETTINGS_HISTORY);
  }
  public static saveSettingsHistory(data: SettingsVersion[]) {
    this.saveKey('settings_history', data);
  }

  // Transaction Wrappers
  public static logActivity(userId: string, userName: string, role: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.saveAuditLogs([newLog, ...logs]);
  }

  // Backup Sim
  public static generateBackupJSONString(): string {
    const backupContents = {
      users: this.getUsers(),
      branches: this.getBranches(),
      services: this.getServices(),
      customers: this.getCustomers(),
      orders: this.getOrders(),
      expenses: this.getExpenses(),
      deposits: this.getDeposits(),
      loyalty: this.getLoyalty(),
      audit_logs: this.getAuditLogs(),
      templates: this.getTemplates(),
      settings: this.getSettings(),
      version: "2026.1",
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(backupContents, null, 2);
  }

  public static restoreBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users && data.branches && data.services && data.orders) {
        this.saveUsers(data.users);
        this.saveBranches(data.branches);
        this.saveServices(data.services);
        this.saveCustomers(data.customers || []);
        this.saveOrders(data.orders);
        this.saveExpenses(data.expenses || []);
        this.saveDeposits(data.deposits || []);
        this.saveLoyalty(data.loyalty || []);
        this.saveAuditLogs(data.audit_logs || []);
        if (data.templates) this.saveTemplates(data.templates);
        if (data.settings) this.saveSettings(data.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public static resetToSeed() {
    localStorage.removeItem('laughdry_users');
    localStorage.removeItem('laughdry_branches');
    localStorage.removeItem('laughdry_services');
    localStorage.removeItem('laughdry_customers');
    localStorage.removeItem('laughdry_orders');
    localStorage.removeItem('laughdry_expenses');
    localStorage.removeItem('laughdry_deposits');
    localStorage.removeItem('laughdry_loyalty');
    localStorage.removeItem('laughdry_audit_logs');
    localStorage.removeItem('laughdry_templates');
    localStorage.removeItem('laughdry_settings');
    localStorage.removeItem('laughdry_attendance');
  }
}
