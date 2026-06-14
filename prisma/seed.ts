import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'];
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Rudra', 'Diya', 'Isha', 'Sanya', 'Ananya', 'Aaradhya', 'Priya', 'Riya', 'Aanya', 'Kavya', 'Neha', 'Rohan', 'Kabir', 'Aryan', 'Dhruv', 'Siddharth'];
const LAST_NAMES = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Jain', 'Das', 'Shah', 'Nair', 'Bose', 'Menon', 'Iyer', 'Desai', 'Joshi', 'Chopra', 'Kapoor', 'Mehta'];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Starting DB seed...');

  // Clean existing
  await prisma.communication.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.customer.deleteMany({});

  const customers = [];

  // 1. Generate 500 Customers
  for (let i = 0; i < 500; i++) {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const city = getRandomItem(CITIES);
    
    customers.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `+91${getRandomInt(6000000000, 9999999999)}`,
      city: city,
      totalSpend: 0, // Will update later
      lastOrderDate: null // Will update later
    });
  }

  const createdCustomers = await prisma.customer.createManyAndReturn({
    data: customers
  });

  console.log(`Created ${createdCustomers.length} customers.`);

  // 2. Generate 1500 Orders
  const orders = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const now = new Date();

  for (let i = 0; i < 1500; i++) {
    const customer = getRandomItem(createdCustomers);
    
    // Realistic spending: mostly smaller amounts, some large
    let amount = 0;
    const spendCategory = Math.random();
    if (spendCategory < 0.6) {
      amount = getRandomInt(500, 2500); // 60% standard
    } else if (spendCategory < 0.9) {
      amount = getRandomInt(2500, 8000); // 30% premium
    } else {
      amount = getRandomInt(8000, 25000); // 10% high-value
    }

    orders.push({
      customerId: customer.id,
      amount,
      createdAt: getRandomDate(oneYearAgo, now)
    });
  }

  await prisma.order.createMany({
    data: orders
  });

  console.log(`Created ${orders.length} orders.`);

  // 3. Update Customers with totalSpend and lastOrderDate
  const allOrders = await prisma.order.findMany();
  
  const customerStats: Record<string, { totalSpend: number; lastOrderDate: Date }> = {};
  
  for (const order of allOrders) {
    if (!customerStats[order.customerId]) {
      customerStats[order.customerId] = { totalSpend: 0, lastOrderDate: order.createdAt };
    }
    
    customerStats[order.customerId].totalSpend += order.amount;
    
    if (order.createdAt > customerStats[order.customerId].lastOrderDate) {
      customerStats[order.customerId].lastOrderDate = order.createdAt;
    }
  }

  for (const customerId of Object.keys(customerStats)) {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpend: customerStats[customerId].totalSpend,
        lastOrderDate: customerStats[customerId].lastOrderDate
      }
    });
  }

  console.log('Updated customers with spend and last order date stats.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
