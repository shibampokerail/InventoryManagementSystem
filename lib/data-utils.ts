// Utility functions for processing inventory data

// Types for inventory data
export interface InventoryItem {
    _id: string;
    name: string;
    category: string;
    quantity: number;
    minQuantity: number;
    status: string;
    condition: string;
    location: string;
    unit: string;
    description?: string;
    updated_at?: string;
  }
  
  export interface UsageLog {
    _id: string;
    action: string;
    itemId: string;
    quantity: number;
    timestamp: string;
    userId: string;
  }
  
  export interface UsageData {
    period: string;
    checkouts: number;
    popularItem: string;
  }
  
  export interface ItemPopularity {
    name: string;
    checkouts: number;
    category: string;
  }
  
  export interface UnavailableItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    reason: string;
    date: string;
  }
  
  // Get month name from date
  export function getMonthName(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid';
    }
    return date.toLocaleString('en-US', { month: 'short' });
  }
  
  // Get week range string from date
  export function getWeekRange(date: Date, weekStartsOnMonday = false): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid';
    }
  
    const startOfWeek = new Date(date);
    const dayOffset = weekStartsOnMonday ? (date.getDay() + 6) % 7 : date.getDay();
    startOfWeek.setDate(date.getDate() - dayOffset);
  
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  
    const formatDate = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  }
  
  // Process usage logs to get monthly data
  export function processMonthlyUsage(
    usageLogs: UsageLog[],
    inventoryItems: InventoryItem[]
  ): UsageData[] {
    if (!usageLogs.length || !inventoryItems.length) {
      return [];
    }
  
    // Create item map for quick lookup
    const itemMap = new Map<string, string>();
    inventoryItems.forEach(item => itemMap.set(item._id, item.name));
  
    // Group logs by month
    const monthlyData = new Map<string, { checkouts: number; items: Map<string, number> }>();
    const unknownItems: string[] = [];
  
    usageLogs.forEach(log => {
      if (log.action !== 'checkout' && log.action !== 'used') return;
  
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid timestamp in log: ${log._id}`);
        return;
      }
  
      const monthYear = `${getMonthName(date)} ${date.getFullYear()}`;
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { checkouts: 0, items: new Map<string, number>() });
      }
  
      const monthData = monthlyData.get(monthYear)!;
      monthData.checkouts += log.quantity;
  
      const itemName = itemMap.get(log.itemId) || 'Unknown Item';
      if (itemName === 'Unknown Item') unknownItems.push(log.itemId);
      const currentCount = monthData.items.get(itemName) || 0;
      monthData.items.set(itemName, currentCount + log.quantity);
    });
  
    if (unknownItems.length) {
      console.warn('Unknown item IDs in monthly usage:', [...new Set(unknownItems)]);
    }
  
    // Convert to array and find most popular item for each month
    return Array.from(monthlyData.entries())
      .map(([period, data]) => {
        let popularItem = 'None';
        let maxCount = 0;
  
        data.items.forEach((count, item) => {
          if (count > maxCount) {
            maxCount = count;
            popularItem = item;
          }
        });
  
        return {
          period,
          checkouts: data.checkouts,
          popularItem,
        };
      })
      .sort((a, b) => {
        const [aMonth, aYear] = a.period.split(' ');
        const [bMonth, bYear] = b.period.split(' ');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return Number(aYear) - Number(bYear) || months.indexOf(aMonth) - months.indexOf(bMonth);
      });
  }
  
  // Process usage logs to get weekly data
  export function processWeeklyUsage(
    usageLogs: UsageLog[],
    inventoryItems: InventoryItem[]
  ): UsageData[] {
    if (!usageLogs.length || !inventoryItems.length) {
      return [];
    }
  
    // Create item map for quick lookup
    const itemMap = new Map<string, string>();
    inventoryItems.forEach(item => itemMap.set(item._id, item.name));
  
    // Group logs by week
    const weeklyData = new Map<string, { checkouts: number; items: Map<string, number> }>();
    const unknownItems: string[] = [];
  
    usageLogs.forEach(log => {
      if (log.action !== 'checkout' && log.action !== 'used') return;
  
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid timestamp in log: ${log._id}`);
        return;
      }
  
      const weekRange = getWeekRange(date);
      if (!weeklyData.has(weekRange)) {
        weeklyData.set(weekRange, { checkouts: 0, items: new Map<string, number>() });
      }
  
      const weekData = weeklyData.get(weekRange)!;
      weekData.checkouts += log.quantity;
  
      const itemName = itemMap.get(log.itemId) || 'Unknown Item';
      if (itemName === 'Unknown Item') unknownItems.push(log.itemId);
      const currentCount = weekData.items.get(itemName) || 0;
      weekData.items.set(itemName, currentCount + log.quantity);
    });
  
    if (unknownItems.length) {
      console.warn('Unknown item IDs in weekly usage:', [...new Set(unknownItems)]);
    }
  
    // Convert to array and find most popular item for each week
    return Array.from(weeklyData.entries())
      .map(([period, data]) => {
        let popularItem = 'None';
        let maxCount = 0;
  
        data.items.forEach((count, item) => {
          if (count > maxCount) {
            maxCount = count;
            popularItem = item;
          }
        });
  
        return {
          period,
          checkouts: data.checkouts,
          popularItem,
        };
      })
      .sort((a, b) => {
        const [aStart] = a.period.split(' - ');
        const [bStart] = b.period.split(' - ');
        const [aDay, aMonth, aYear] = aStart.split('/').map(Number);
        const [bDay, bMonth, bYear] = bStart.split('/').map(Number);
        return aYear - bYear || aMonth - bMonth || aDay - bDay;
      });
  }
  
  // Get most popular items overall
  export function getMostPopularItems(
    usageLogs: UsageLog[],
    inventoryItems: InventoryItem[]
  ): ItemPopularity[] {
    if (!usageLogs.length || !inventoryItems.length) {
      return [];
    }
  
    // Create item map for quick lookup
    const itemMap = new Map<string, InventoryItem>();
    inventoryItems.forEach(item => itemMap.set(item._id, item));
  
    // Count checkouts by item
    const itemCounts = new Map<string, number>();
    const unknownItems: string[] = [];
  
    usageLogs.forEach(log => {
      if (log.action !== 'checkout' && log.action !== 'used') return;
  
      const itemId = log.itemId;
      const currentCount = itemCounts.get(itemId) || 0;
      itemCounts.set(itemId, currentCount + log.quantity);
  
      if (!itemMap.has(itemId)) unknownItems.push(itemId);
    });
  
    if (unknownItems.length) {
      console.warn('Unknown item IDs in popular items:', [...new Set(unknownItems)]);
    }
  
    // Convert to array and sort by popularity
    return Array.from(itemCounts.entries())
      .map(([itemId, count]) => {
        const item = itemMap.get(itemId);
        return {
          name: item ? item.name : 'Unknown Item',
          category: item ? item.category : 'Unknown',
          checkouts: count,
        };
      })
      .sort((a, b) => b.checkouts - a.checkouts)
      .slice(0, 5); // Top 5 items
  }
  
  // Get unavailable items (missing or damaged)
  export function getUnavailableItems(
    usageLogs: UsageLog[],
    inventoryItems: InventoryItem[]
  ): UnavailableItem[] {
    if (!usageLogs.length || !inventoryItems.length)
  
  System: {
      return [];
    }
  
    // Create item map for quick lookup
    const itemMap = new Map<string, InventoryItem>();
    inventoryItems.forEach(item => itemMap.set(item._id, item));
  
    // Filter logs for missing or damaged actions
    const unknownItems: string[] = [];
  
    const unavailableItems = usageLogs
      .filter(log => log.action === 'missing' || log.action === 'damaged')
      .map(log => {
        const date = new Date(log.timestamp);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid timestamp in log: ${log._id}`);
          return null;
        }
  
        const item = itemMap.get(log.itemId);
        if (!item) unknownItems.push(log.itemId);
  
        return {
          id: log.itemId,
          name: item ? item.name : 'Unknown Item',
          category: item ? item.category : 'Unknown',
          quantity: log.quantity,
          reason: log.action === 'missing' ? 'Missing' : 'Damaged',
          date: date.toLocaleDateString('en-US'),
        };
      })
      .filter((item): item is UnavailableItem => item !== null);
  
    if (unknownItems.length) {
      console.warn('Unknown item IDs in unavailable items:', [...new Set(unknownItems)]);
    }
  
    return unavailableItems;
  }
  
  // Get low stock items
  export function getLowStockItems(inventoryItems: InventoryItem[]): InventoryItem[] {
    if (!inventoryItems.length) {
      return [];
    }
  
    return inventoryItems
      .filter(item => item.quantity <= item.minQuantity)
      .sort((a, b) => {
        // Sort by criticality (how far below threshold)
        const aRatio = a.quantity / (a.minQuantity || 1); // Avoid division by zero
        const bRatio = b.quantity / (b.minQuantity || 1);
        return aRatio - bRatio;
      });
  }