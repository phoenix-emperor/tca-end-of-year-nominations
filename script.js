// Firebase config - paste your actual config here
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnXrnjdNUKa3jil3H7I9XZSPsbvaXbCdM",
  authDomain: "staff-awards-2025.firebaseapp.com",
  projectId: "staff-awards-2025",
  storageBucket: "staff-awards-2025.firebasestorage.app",
  messagingSenderId: "364044970466",
  appId: "1:364044970466:web:602f0f2247b52fd63ff1bb",
  measurementId: "G-BV3LM3XKJY"
};

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  // Auth: Sign in anonymously on load
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log('User signed in:', user.uid);
    } else {
      signInAnonymously(auth).catch(console.error);
    }
  });

  // Load employee names (same as before)
  fetch('employees.json')
    .then(response => response.json())
    .then(data => {
      let names = Array.isArray(data) ? data : (data.employees || data.data || []);
      const datalist = document.getElementById('employees');
      datalist.innerHTML = '';
      names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading employees:', error));

  // Category button clicks (same)
  const buttons = document.querySelectorAll('.category-btn');
  const form = document.getElementById('nomination-form');
  const title = document.getElementById('category-title');
  const input = document.getElementById('employee-name');
  const submitBtn = document.getElementById('submit-btn');
  let currentCategory = '';

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      currentCategory = button.dataset.category;
      title.textContent = `Nominate for: ${currentCategory}`;

      // Check if user already voted for this category
      if (currentUser) {
        const q = query(collection(db, 'nominations'), where('userId', '==', currentUser.uid), where('category', '==', currentCategory));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          alert('You already nominated for this category!');
          return;
        }
      }

      form.style.display = 'block';
      input.value = '';
    });
  });

  // Submit nomination
  submitBtn.addEventListener('click', async () => {
    if (!input.value || !currentUser) {
      alert('Please select an employee and ensure you\'re signed in.');
      return;
    }

    try {
      await addDoc(collection(db, 'nominations'), {
        category: currentCategory,
        employeeName: input.value,
        userId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      alert('Nomination submitted!');
      form.style.display = 'none';
    } catch (e) {
      console.error('Error submitting:', e);
      alert('Submission failed. Try again.');
    }
  });
});