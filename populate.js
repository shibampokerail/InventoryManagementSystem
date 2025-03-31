const { MongoClient } = require('mongodb');

async function populateDatabase() {
  const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('union_involvement');

    // Insert Vendors
    const vendors = [
      { name: 'Office Supplies Inc.', contact: 'contact@officesupplies.com' },
      { name: 'Tech Gadgets Ltd.', contact: 'sales@techgadgets.com' }
    ];
    const vendorResult = await db.collection('Vendors').insertMany(vendors);
    const vendorIds = vendorResult.insertedIds;

    // Insert InventoryItems
    const inventoryItems = [
      { name: 'Stapler', description: 'Standard office stapler', category: 'Office Supplies', quantity: 10, minQuantity: 5, unit: 'pieces', location: 'Student Union', status: 'available' },
      { name: 'Projector', description: 'HD projector for presentations', category: 'Electronics', quantity: 2, minQuantity: 1, unit: 'pieces', location: 'RecCenter', status: 'available' },
      { name: 'Basketball', description: 'Standard basketball', category: 'Sports Equipment', quantity: 5, minQuantity: 3, unit: 'pieces', location: 'RecCenter', status: 'available' }
    ];
    const itemResult = await db.collection('InventoryItems').insertMany(inventoryItems);
    const itemIds = itemResult.insertedIds;

    // Insert Users
    const users = [
      { name: 'Admin User', email: 'admin@union.edu', role: 'admin', slackId: 'U12345' },
      { name: 'Employee User', email: 'employee@union.edu', role: 'employee', slackId: 'U67890' }
    ];
    const userResult = await db.collection('Users').insertMany(users);
    const userIds = userResult.insertedIds;

    // Insert VendorItems
    const vendorItems = [
      { vendorId: vendorIds[0], itemId: itemIds[0] },
      { vendorId: vendorIds[1], itemId: itemIds[1] },
      { vendorId: vendorIds[0], itemId: itemIds[2] }
    ];
    await db.collection('VendorItems').insertMany(vendorItems);

    // Insert Orders
    const orders = [
      { itemId: itemIds[0], vendorId: vendorIds[0], quantity: 20, orderDate: new Date('2023-10-01'), expectedDelivery: new Date('2023-10-10'), status: 'received' },
      { itemId: itemIds[1], vendorId: vendorIds[1], quantity: 1, orderDate: new Date('2023-10-15'), expectedDelivery: new Date('2023-10-20'), status: 'pending' }
    ];
    await db.collection('Orders').insertMany(orders);

    // Insert Notifications
    const notifications = [
      { type: 'lowStock', message: 'Stapler quantity is below minimum threshold.', timestamp: new Date('2023-09-25'), recipient: 'general_channel' },
      { type: 'orderPlaced', message: 'Order placed for 20 Staplers.', timestamp: new Date('2023-10-01'), recipient: 'orders_channel' }
    ];
    await db.collection('Notifications').insertMany(notifications);

    // Insert Logs
    const logs = [
      { action: 'itemAdded', userId: userIds[0], timestamp: new Date('2023-09-01'), details: { itemId: itemIds[0], name: 'Stapler' } },
      { action: 'quantityUpdated', userId: userIds[1], timestamp: new Date('2023-09-20'), details: { itemId: itemIds[0], oldQuantity: 15, newQuantity: 10 } }
    ];
    await db.collection('Logs').insertMany(logs);

    // Insert InventoryUsage
    const inventoryUsage = [
      { itemId: itemIds[1], userId: userIds[1], action: 'checkedOut', timestamp: new Date('2023-10-05'), quantity: 1 },
      { itemId: itemIds[1], userId: userIds[1], action: 'returned', timestamp: new Date('2023-10-10'), quantity: 1 },
      { itemId: itemIds[2], userId: userIds[1], action: 'reportedBroken', timestamp: new Date('2023-10-12'), quantity: 1 }
    ];
    await db.collection('InventoryUsage').insertMany(inventoryUsage);

    console.log('Database populated with dummy data.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

populateDatabase();
