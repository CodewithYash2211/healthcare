import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import fs from 'fs';

// Read config dynamically mapped relative to dist target or src runtime
const configPath = new URL('../../firebase-applet-config.json', import.meta.url).pathname;

// Node.js Windows path formatting 
const cleanPath = configPath.replace(/^\/([a-zA-Z]:)/, '$1');
const firebaseConfig = JSON.parse(fs.readFileSync(cleanPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HOSPITALS = [
  {
    name: "City Central Hospital",
    type: "Multi-Specialty",
    distance: "2.5 km",
    rating: 4.8,
    location: "123 Healthcare Ave, Downtown",
    address: "123 Healthcare Ave, Downtown",
    phone: "+91 98765 43210",
    status: "Open 24/7",
    specialists: ["Cardiology", "Neurology", "Orthopedics"]
  },
  {
    name: "Sunrise Care Clinic",
    type: "General Hospital",
    distance: "5.1 km",
    rating: 4.5,
    location: "45 West Side Road, District 4",
    address: "45 West Side Road, District 4",
    phone: "+91 98765 43211",
    status: "Open 24/7",
    specialists: ["Pediatrics", "General Medicine", "Dermatology"]
  },
  {
    name: "Metro Heart Institute",
    type: "Specialty Center",
    distance: "8.3 km",
    rating: 4.9,
    location: "78 Medical City Blvd, North Zone",
    address: "78 Medical City Blvd, North Zone",
    phone: "+91 98765 43212",
    status: "Open 24/7",
    specialists: ["Cardiac Surgery", "Cardiology", "Emergency"]
  },
  {
    name: "Hope Women & Child Care",
    type: "Maternity",
    distance: "12.0 km",
    rating: 4.7,
    location: "212 Family Lane, East District",
    address: "212 Family Lane, East District",
    phone: "+91 98765 43213",
    status: "Open 8 AM - 10 PM",
    specialists: ["Maternity", "Pediatrics", "Gynecology"]
  }
];

async function seed() {
  console.log("Seeding Hospitals to Firestore...");
  let count = 0;
  for (const h of HOSPITALS) {
    const newRef = doc(collection(db, 'hospitals'));
    await setDoc(newRef, h);
    count++;
  }
  console.log(`Successfully seeded ${count} hospitals.`);
  process.exit(0);
}

seed().catch(console.error);
