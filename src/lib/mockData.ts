export type ListingType = 'sell' | 'lend' | 'free';

export interface Listing {
  id: string;
  title: string;
  description: string;
  type: ListingType;
  category: string;
  price: number;
  condition: string;
  department: string;
  semester: string;
  courseCode?: string;
  imageUrl: string;
  sellerName: string;
  isVerified: boolean;
  returnDate?: string; // for lending
}

export const CATEGORIES = [
  '📚 Books', '🚲 Cycles', '🔬 Lab Kits', '📝 Notes', 
  '💻 Electronics', '🎒 Accessories', '👕 Clothing', 
  '🪑 Hostel Items', '📦 Miscellaneous'
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'DBMS Made Easy',
    description: 'Barely used textbook for Semester 3 CSE.',
    type: 'sell',
    category: '📚 Books',
    price: 350,
    condition: 'Like New',
    department: 'CSE',
    semester: 'Semester 3',
    courseCode: 'CS302',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Akshaya',
    isVerified: true,
  },
  {
    id: '2',
    title: 'Scientific Calculator',
    description: 'Casio fx-991EX. Fully working.',
    type: 'sell',
    category: '💻 Electronics',
    price: 500,
    condition: 'Good',
    department: 'All',
    semester: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Rahul',
    isVerified: true,
  },
  {
    id: '3',
    title: 'Hero Sprint Cycle',
    description: 'Great for getting around campus quickly. Negotiable.',
    type: 'sell',
    category: '🚲 Cycles',
    price: 3500,
    condition: 'Fair',
    department: 'All',
    semester: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Sneha',
    isVerified: false,
  },
  {
    id: '4',
    title: 'Arduino UNO Kit',
    description: 'Includes breadboard, jumper wires, LEDs, and resistors.',
    type: 'sell',
    category: '🔬 Lab Kits',
    price: 700,
    condition: 'Good',
    department: 'ECE',
    semester: 'Semester 4',
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Vikram',
    isVerified: true,
  },
  {
    id: '5',
    title: 'Engineering Mathematics Notes',
    description: 'Handwritten notes covering the entire syllabus. Giving away for free.',
    type: 'free',
    category: '📝 Notes',
    price: 0,
    condition: 'Used',
    department: 'All',
    semester: 'Semester 1',
    courseCode: 'MA101',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Priya',
    isVerified: true,
  },
  {
    id: '6',
    title: 'Lab Coat',
    description: 'Standard white lab coat, size M. Lending for the semester.',
    type: 'lend',
    category: '👕 Clothing',
    price: 100, // Deposit
    condition: 'Good',
    department: 'Chemistry',
    semester: 'Semester 2',
    imageUrl: 'https://images.unsplash.com/photo-1601614749298-6ce872aeb41d?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Aditi',
    isVerified: true,
    returnDate: '2026-12-15',
  }
];
