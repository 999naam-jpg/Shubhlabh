require('dotenv').config()
const mongoose = require('mongoose')

// Firebase
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyAbwHfimHs-RLGugvSNc9o00YNRnpN9GYY",
  authDomain: "shuh-labh.firebaseapp.com",
  projectId: "shuh-labh",
  storageBucket: "shuh-labh.firebasestorage.app",
  messagingSenderId: "274479947020",
  appId: "1:274479947020:web:139a60906156b250f3bd29",
}

const fbApp = initializeApp(firebaseConfig)
const db = getFirestore(fbApp)

// MongoDB Models
const Order    = require('./models/Order')
const Product  = require('./models/Product')
const Backdrop = require('./models/Backdrop')
const Cutout   = require('./models/Cutout')
const Category = require('./models/Category')
const Review   = require('./models/Review')

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ MongoDB connected')

  const collections = [
    { name: 'orders',     Model: Order },
    { name: 'products',   Model: Product },
    { name: 'backdrops',  Model: Backdrop },
    { name: 'cutouts',    Model: Cutout },
    { name: 'categories', Model: Category },
    { name: 'reviews',    Model: Review },
  ]

  for (const { name, Model } of collections) {
    try {
      const snap = await getDocs(collection(db, name))
      if (snap.empty) { console.log(`⚠️  ${name}: empty, skipping`); continue }

      const docs = snap.docs.map(d => d.data())
      // Deduplicate by name for categories
      const seen = new Set()
      const unique = docs.filter(d => {
        if (!d.name || seen.has(d.name)) return false
        seen.add(d.name); return true
      })
      await Model.deleteMany({})
      await Model.insertMany(unique, { ordered: false })
      console.log(`✅ ${name}: migrated ${unique.length} documents`)
    } catch (err) {
      console.error(`❌ ${name}: ${err.message}`)
    }
  }

  console.log('\n🎉 Migration complete!')
  process.exit(0)
}

migrate().catch(err => { console.error(err); process.exit(1) })
