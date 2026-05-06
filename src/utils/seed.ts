import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function seedDemoData() {
  console.log("Seeding demo data...");

  // Seed Settings
  await setDoc(doc(db, 'settings', 'core'), {
    siteName: 'Berrionaire',
    logo: '',
    vision: 'To be the world’s leading hub for strategic innovation and global team synergy.',
    mission1: 'Cultivate a diverse ecosystem of professionals who push boundaries.',
    mission2: 'Leverage tactical efficiency through modern collaboration tools.',
    mission3: 'Drive sustainable organizational growth through inclusive leadership.',
    gmeetEnabled: true,
    zoomEnabled: true,
    contactEmail: 'contact@berrionaire.com',
    allowRegistration: true,
    updatedAt: serverTimestamp()
  });

  // Seed Users
  const demoUsers = [
    {
      uid: 'admin123',
      data: {
        name: 'Alex Berrionaire',
        email: 'admin@berrionaire.com',
        role: 'superadmin',
        department: 'Executive',
        isActive: true,
        createdAt: serverTimestamp()
      }
    },
    {
      uid: 'ceo456',
      data: {
        name: 'Sarah Chief',
        email: 'ceo@berrionaire.com',
        role: 'ceo',
        department: 'Executive',
        isActive: true,
        createdAt: serverTimestamp()
      }
    }
  ];

  for (const user of demoUsers) {
    await setDoc(doc(db, 'users', user.uid), user.data);
  }

  // Seed Departments
  const depts = [
    { id: 'mktg', name: 'Marketing', color: '#6B21A8', managerId: 'mktg_mgr_1' },
    { id: 'exec', name: 'Executive', color: '#D97706', managerId: 'ceo456' },
  ];

  for (const dept of depts) {
    await setDoc(doc(db, 'departments', dept.id), dept);
  }

  console.log("Seeding completed!");
}
