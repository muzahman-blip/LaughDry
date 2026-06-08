import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from '../lib/firebase';
import { Order, OrderStatus, Customer, Service, Expense, Branch, SystemSettings, AttendanceRecord } from '../types';

export class LaundryService {
  /**
   * Add a new order or update an existing one in Firestore
   */
  static async addOrder(order: Order): Promise<void> {
    const path = `orders/${order.id}`;
    try {
      const sanitizedData = sanitizeFirestoreData({
        ...order,
        updatedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'orders', order.id), sanitizedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Update order status in Firestore and log the update details
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Fetch orders from Firestore
   */
  static async getOrders(): Promise<Order[]> {
    const path = 'orders';
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      return orders;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  }

  /**
   * Fetch services from Firestore
   */
  static async getServices(): Promise<Service[]> {
    const path = 'services';
    try {
      const snapshot = await getDocs(collection(db, 'services'));
      const services: Service[] = [];
      snapshot.forEach((doc) => {
        services.push(doc.data() as Service);
      });
      return services;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  }

  /**
   * Save a service to Firestore
   */
  static async saveService(service: Service): Promise<void> {
    const path = `services/${service.id}`;
    try {
      await setDoc(doc(db, 'services', service.id), sanitizeFirestoreData(service));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Fetch customers from Firestore
   */
  static async getCustomers(): Promise<Customer[]> {
    const path = 'customers';
    try {
      const snapshot = await getDocs(collection(db, 'customers'));
      const customers: Customer[] = [];
      snapshot.forEach((doc) => {
        customers.push(doc.data() as Customer);
      });
      return customers;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  }

  /**
   * Save a customer to Firestore
   */
  static async saveCustomer(customer: Customer): Promise<void> {
    const path = `customers/${customer.id}`;
    try {
      await setDoc(doc(db, 'customers', customer.id), sanitizeFirestoreData(customer));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete a customer from Firestore
   */
  static async deleteCustomer(customerId: string): Promise<void> {
    const path = `customers/${customerId}`;
    try {
      await deleteDoc(doc(db, 'customers', customerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Delete an order from Firestore
   */
  static async deleteOrder(orderId: string): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Delete a service from Firestore
   */
  static async deleteService(serviceId: string): Promise<void> {
    const path = `services/${serviceId}`;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Delete a branch from Firestore
   */
  static async deleteBranch(branchId: string): Promise<void> {
    const path = `branches/${branchId}`;
    try {
      await deleteDoc(doc(db, 'branches', branchId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Fetch expenses from Firestore
   */
  static async getExpenses(): Promise<Expense[]> {
    const path = 'expenses';
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      const expenses: Expense[] = [];
      snapshot.forEach((doc) => {
        expenses.push(doc.data() as Expense);
      });
      return expenses;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  }

  /**
   * Save an expense to Firestore
   */
  static async saveExpense(expense: Expense): Promise<void> {
    const path = `expenses/${expense.id}`;
    try {
      await setDoc(doc(db, 'expenses', expense.id), sanitizeFirestoreData(expense));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete an expense from Firestore
   */
  static async deleteExpense(expenseId: string): Promise<void> {
    const path = `expenses/${expenseId}`;
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Fetch branches from Firestore
   */
  static async getBranches(): Promise<Branch[]> {
    const path = 'branches';
    try {
      const snapshot = await getDocs(collection(db, 'branches'));
      const branches: Branch[] = [];
      snapshot.forEach((doc) => {
        branches.push(doc.data() as Branch);
      });
      return branches;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  }

  /**
   * Save a branch to Firestore
   */
  static async saveBranch(branch: Branch): Promise<void> {
    const path = `branches/${branch.id}`;
    try {
      await setDoc(doc(db, 'branches', branch.id), sanitizeFirestoreData(branch));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Fetch settings from Firestore
   */
  static async getSettings(): Promise<SystemSettings | null> {
    const path = 'settings/system';
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'system'));
      if (docSnap.exists()) {
        return docSnap.data() as SystemSettings;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  /**
   * Save settings to Firestore
   */
  static async saveSettings(settings: SystemSettings): Promise<void> {
    const path = 'settings/system';
    try {
      await setDoc(doc(db, 'settings', 'system'), sanitizeFirestoreData(settings));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Fetch all attendance records from Firestore
   */
  static async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const path = 'attendance';
    try {
      const snapshot = await getDocs(collection(db, 'attendance'));
      const records: AttendanceRecord[] = [];
      snapshot.forEach((doc) => {
        records.push(doc.data() as AttendanceRecord);
      });
      // Sort by checkIn descending in memory
      records.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
      return records;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  }

  /**
   * Save an attendance record to Firestore
   */
  static async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    const path = `attendance/${record.id}`;
    try {
      await setDoc(doc(db, 'attendance', record.id), sanitizeFirestoreData(record));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Generate complex reporting metrics directly from Firestore collections
   */
  static async fetchReports(): Promise<{
    totalRevenue: number;
    orderCount: number;
    completionRate: number;
    activeQueueCount: number;
    expenseSum: number;
    netProfit: number;
    revenueByCategory: { name: string; value: number }[];
    statusCounts: Record<string, number>;
  }> {
    try {
      const orders = await this.getOrders();
      const expenses = await this.getExpenses();

      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'Lunas')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const expenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
      const orderCount = orders.length;

      const completedOrders = orders.filter(o => o.status === OrderStatus.SELESAI).length;
      const completionRate = orderCount > 0 ? (completedOrders / orderCount) * 100 : 0;

      const activeQueueCount = orders.filter(o => 
        o.status !== OrderStatus.SELESAI && o.status !== OrderStatus.DIBATALKAN
      ).length;

      // Status aggregations
      const statusCounts: Record<string, number> = {};
      orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      // Simple category breakdown
      const kiloanRev = orders
        .filter(o => o.paymentStatus === 'Lunas')
        .reduce((sum, o) => {
          const kiloanItems = o.items.filter(item => item.serviceName.toLowerCase().includes('kiloan') || item.serviceName.toLowerCase().includes('kg'));
          return sum + kiloanItems.reduce((s, i) => s + i.subtotal, 0);
        }, 0);

      const satuanRev = totalRevenue - kiloanRev;

      return {
        totalRevenue,
        orderCount,
        completionRate,
        activeQueueCount,
        expenseSum,
        netProfit: totalRevenue - expenseSum,
        statusCounts,
        revenueByCategory: [
          { name: 'Kiloan', value: kiloanRev || (totalRevenue * 0.6) },
          { name: 'Satuan', value: satuanRev || (totalRevenue * 0.4) }
        ]
      };
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return {
        totalRevenue: 0,
        orderCount: 0,
        completionRate: 0,
        activeQueueCount: 0,
        expenseSum: 0,
        netProfit: 0,
        revenueByCategory: [],
        statusCounts: {}
      };
    }
  }
}
