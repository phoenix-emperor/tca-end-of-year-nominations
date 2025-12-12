let ts;
const votes = JSON.parse(localStorage.getItem('staffVotes2025') || '{}');

// INLINE EMPLOYEES - No fetch fails! Edit here for your 30+ names
const employees = [
  {"name": "Adebayo Tunde"},
  {"name": "Chioma Okeke"},
  {"name": "Fatima Yusuf"},
  {"name": "Ibrahim Musa"},
  {"name": "Ngozi Eze"},
  {"name": "Oluwaseun Adebayo"},
  {"name": "Tunde Balogun"},
  {"name": "Zainab Abdullahi"},
  {"name": "Emeka Chukwu"},
  {"name": "Funmi Oladele"},
  // Add ALL your real names here - comma separated, up to 200 no problem
  {"name": "Aisha Bello"},
  {"name": "Chukwudi Okeke"},
  {"name": "Jennifer Osagie"},
  {"name": "Kemi Adeyemi"},
  {"name": "Michael Balogun"},
  {"name": "Precious Nwachukwu"},
  {"name": "Rita Eke"},
  {"name": "Sola Akinwumi"},
  {"name": "Umar Danjuma"},
  {"name": "Victoria Agbo"},
  {"name": "Wale Shittu"},
  {"name": "Yemi Ojo"},
  {"name": "Zara Ibrahim"},
  {"name": "David Okonkwo"},
  {"name": "Grace Adekunle"},
  {"name": "Hassan Bello"},
  {"name": "Ify Nwosu"},
  {"name": "Jide Ogunleye"},
  {"name": "Kehinde Taiwo"},
  {"name": "Lara Adewale"},
  {"name": "Mohammed Sani"},
  {"name": "Nkechi Obi"},
  {"name": "Ola Fajobi"},
  {"name": "Patience Udo"},
  {"name": "Quadri Ahmed"},
  {"name": "Titi Bello"}
  // Keep adding - this loads instantly
];

function updateVoteCounts() {
  document.querySelectorAll('.vote-count').forEach(el => {
    const cat = el.parentElement.dataset.category;
    const count = Object.keys(votes[cat] || {}).length;
    el.textContent = count + (count === 1 ? ' vote' : ' votes');
  });
}

// Init TomSelect IMMEDIATELY - no fetch
ts = new TomSelect('#nomineeName', {
  valueField: 'name',
  labelField: 'name',
  searchField: 'name',
  options: employees,
  create: false,
  placeholder: 'Start typing a name... (e.g., Adebayo)',
  maxOptions: 150,
  render: {
    no_results: () => '<div>No matching name—check spelling?</div>'
  }
});
console.log('TomSelect loaded with', employees.length, 'names'); // Debug in console

// Modal handling
const modal = document.getElementById('voteModal');
const closeBtn = document.querySelector('.close');
const voteStatus = document.getElementById('voteStatus');
const voteForm = document.getElementById('voteForm');

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    document.getElementById('selectedCategory').value = category;
    document.getElementById('categoryTitle').textContent = category;

    if (votes[category]) {
      voteStatus.innerHTML = `<p><strong>You already voted for:</strong><br><big>${Object.keys(votes[category])[0]}</big></p>`;
      voteForm.style.display = 'none';
    } else {
      voteStatus.innerHTML = '<p><strong>Who deserves your vote?</strong></p>';
      voteForm.style.display = 'block';
      ts.clear();
    }
    modal.style.display = 'block';
  });
});

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Submit vote
voteForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const category = document.getElementById('selectedCategory').value;
  const nominee = ts.getValue();

  if (!nominee) return alert('Please select a name from the list!');

  // Save vote with nominee tracking
  if (!votes[category]) votes[category] = {};
  votes[category][nominee] = true;
  localStorage.setItem('staffVotes2025', JSON.stringify(votes));

  updateVoteCounts();
  alert(`✅ Vote for ${nominee} recorded! Refresh others to see.`);
  modal.style.display = 'none';
  this.reset();
  ts.clear();
});

// Export to CSV - Central sync hack!
document.getElementById('exportVotes').addEventListener('click', () => {
  let csv = 'Category,Nominee,Votes\n';
  Object.entries(votes).forEach(([cat, noms]) => {
    Object.keys(noms).forEach(nom => {
      csv += `${cat},"${nom}",1\n`;
    });
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'staff-votes-2025.csv';
  a.click();
  alert('📥 CSV downloaded—open in Google Sheets & share!');
});

// Load counts
updateVoteCounts();