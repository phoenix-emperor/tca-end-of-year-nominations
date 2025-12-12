let ts;
const votes = JSON.parse(localStorage.getItem('staffVotes2025') || '{}');

function updateVoteCounts() {
  document.querySelectorAll('.vote-count').forEach(el => {
    const cat = el.parentElement.dataset.category;
    el.textContent = (votes[cat] || 0) + ' votes';
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

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    document.getElementById('selectedCategory').value = category;
    document.getElementById('categoryTitle').textContent = category;

    // Check if already voted
    if (votes[category]) {
      document.querySelector('#voteModal p').innerHTML = `<strong>You already voted for:</strong><br><big>${votes[category]}</big><br><br>You can only vote once per category.`;
      document.getElementById('voteForm').style.display = 'none';
    } else {
      document.querySelector('#voteModal p').innerHTML = `<strong>You have not voted in this category yet.</strong>`;
      document.getElementById('voteForm').style.display = 'block';
      ts && ts.clear();
    }
    modal.style.display = 'block';
  });
});

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Submit vote
document.getElementById('voteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const category = document.getElementById('selectedCategory').value;
  const nominee = ts.getValue();

  if (!nominee) return alert('Please select a name');

  // Save vote
  votes[category] = nominee;
  localStorage.setItem('staffVotes2025', JSON.stringify(votes));

  // Update live count
  updateVoteCounts();

  alert(`✅ Your vote for ${nominee} in "${category}" is recorded!`);
  modal.style.display = 'none';
});

// Init counts on load
updateVoteCounts();