// fuel-vos hosted under fitness-aos Firebase project (shared Firestore + Auth)
export const firebaseConfig = {
  apiKey:            "AIzaSyD1hvp2UYrvizLOzoSqOX-bwRWcCpJVAlg",
  authDomain:        "fitness-aos.firebaseapp.com",
  projectId:         "fitness-aos",
  storageBucket:     "fitness-aos.firebasestorage.app",
  messagingSenderId: "842575255284",
  appId:             "1:842575255284:web:65c4831683a893c110f0a1",
};

// Web Push certificate (VAPID Public Key) — dasselbe Firebase-Projekt wie
// fitness-app/vitalos, daher identischer Key (Firebase Console → Project
// Settings → Cloud Messaging → Web Push certificates).
export const VAPID_KEY = "BLO5LBXVHXR4HS5sHyHLwl5n3iXURypO3ZSCh4Ser-itoQTmO3bhnawqEWP913PzBx31cHExbkuodvIqLjPzvd0";
