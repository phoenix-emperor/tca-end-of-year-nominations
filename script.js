let ts;
let unsubscribe; // For real-time listener

const categories = [
  'Most Punctual Staff', 'Team Player of the Year', 'Office Comedian Award',
  'Rising Star Award (New Staff Showing Rapid Growth)', 'Best Dressed Employee',
  'Top Facilitator', 'Employee of the Year', 'Mr/Ms Dependable'
];

// Real-time listener: Syncs counts across all devices
function startRealTimeUpdates() {
  const votesRef = window.collection(window.db, 'votes');
  unsubscribe = window.onSnapshot(votesRef, (snapshot) => {
    const totalVotes = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      categories.forEach(cat => {
        if (data[cat]) totalVotes[cat] = (totalVotes[cat] || 0) + 1;
      });
    });
    updateVoteCounts(totalVotes);
  }, (error) => console.error('Sync error:', error));
}

// Update display with live data
function updateVoteCounts(voteData = {}) {
  document.querySelectorAll('.vote-count').forEach(el => {
    const cat = el.closest('.category-card').dataset.category;
    const count = voteData[cat] || 0;
    el.textContent = count + (count === 1 ? ' vote' : ' votes');
  });
}

// Load employees and init TomSelect
fetch('employees.json')
  .then(r => r.json())
  .then(employees => {
    ts = new TomSelect('#nomineeName', {
      valueField: 'name',
      labelField: 'name',
      searchField: 'name',
      options: employees,
      create: false,
      placeholder: 'Type name...',
      maxOptions: 150
    });
  });

// Modal handling
const modal = document.getElementById('voteModal');
const closeBtn = document.querySelector('.close');
const voteStatus = document.getElementById('voteStatus');
const voteForm = document.getElementById('voteForm');

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', async () => {
    const category = card.dataset.category;
    document.getElementById('selectedCategory').value = category;
    document.getElementById('categoryTitle').textContent = category;

    // Check if user voted (local check for speed, cloud for truth)
    const userVotesRef = window.doc(window.db, 'userVotes', 'anonymousUser'); // Simple anon tracking—upgrade to UUID later
    const userDoc = await window.getDoc(userVotesRef);
    const userVoted = userDoc.exists() ? userDoc.data()[category] : null;

    if (userVoted) {
      voteStatus.innerHTML = `<p><strong>You already voted for:</strong><br><big>${userVoted}</big></p>`;
      voteForm.style.display = 'none';
    } else {
      voteStatus.innerHTML = '<p><strong>Who deserves your vote?</strong></p>';
      voteForm.style.display = 'block';
      ts && ts.clear();
    }
    modal.style.display = 'block';
  });
});

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Submit vote to cloud
voteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const category = document.getElementById('selectedCategory').value;
  const nominee = ts.getValue();

  if (!nominee) return alert('Please select a name');

  try {
    // Save vote to central votes doc (increments count)
    const votesRef = window.doc(window.db, 'votes', category);
    await window.setDoc(votesRef, { [nominee]: true }, { merge: true });

    // Save user's vote (prevents duplicates)
    const userVotesRef = window.doc(window.db, 'userVotes', 'anonymousUser');
    const userData = (await window.getDoc(userVotesRef)).data() || {};
    userData[category] = nominee;
    await window.setDoc(userVotesRef, userData, { merge: true });

    alert(`✅ Your vote for ${nominee} in "${category}" is live!`);
    modal.style.display = 'none';
    voteForm.reset();
    ts.clear();
  } catch (error) {
    alert('Vote failed—check console and try again.');
    console.error(error);
  }
});

// Cleanup listener on unload
window.addEventListener('beforeunload', () => unsubscribe && unsubscribe());

// Start real-time sync on load
startRealTimeUpdates();
updateVoteCounts(); // Initial load