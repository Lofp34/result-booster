const chips = document.querySelectorAll('.metric-chip');
const primaryChoice = document.getElementById('primary-choice');
const secondaryChoice = document.getElementById('secondary-choice');
const secondaryToggle = document.getElementById('secondary-toggle');
const clearSelection = document.getElementById('clear-selection');
const sessionItems = document.querySelectorAll('.session-item');
const detailTitle = document.getElementById('detail-title');
const detailMeta = document.getElementById('detail-meta');
const detailScore = document.getElementById('detail-score');
const detailIntent = document.getElementById('detail-intent');
const detailSteps = document.getElementById('detail-steps');

let secondaryMode = false;
let primaryKey = null;
let secondaryKeys = [];

const sessionData = {
  'post-icp': {
    title: 'Post LinkedIn ICP',
    meta: '02:40 • 04 Jan 2026 • Niveau C',
    score: 'Score 1.4',
    intent: "Creer un signal d'interet sur un angle revenu recurrent.",
    steps: ['Initier 10 DM cibles', 'Obtenir 3 reponses positives', 'Planifier 1 RDV qualifie'],
  },
  'dm-outreach': {
    title: 'DM outreach cible',
    meta: '01:10 • 03 Jan 2026 • Niveau B',
    score: 'Score 3.2',
    intent: 'Transformer les vues en conversations qualifiees.',
    steps: ['Obtenir 1 RDV qualifie', 'Envoyer 1 proposition'],
  },
  'call-proposal': {
    title: 'Call + proposition',
    meta: '00:50 • 02 Jan 2026 • Niveau A',
    score: 'Score 6.8',
    intent: 'Basculer une opportunite chaude en proposition.',
    steps: ['Closer 1 deal'],
  },
  'case-study': {
    title: 'Case study court',
    meta: '01:30 • 31 Dec 2025 • Niveau A',
    score: 'Score 5.1',
    intent: 'Mettre en avant un resultat concret pour generer des leads.',
    steps: ['Planifier 1 RDV qualifie', 'Envoyer 1 proposition'],
  },
};

const updateSummary = () => {
  const primaryChip = [...chips].find((chip) => chip.dataset.key === primaryKey);
  primaryChoice.textContent = primaryChip ? primaryChip.dataset.label : 'Aucun';

  if (secondaryKeys.length === 0) {
    secondaryChoice.textContent = 'Aucun';
    return;
  }

  const labels = secondaryKeys
    .map((key) => [...chips].find((chip) => chip.dataset.key === key))
    .filter(Boolean)
    .map((chip) => chip.dataset.label);

  secondaryChoice.textContent = labels.join(', ');
};

const syncChipStates = () => {
  chips.forEach((chip) => {
    chip.classList.toggle('is-primary', chip.dataset.key === primaryKey);
    chip.classList.toggle('is-secondary', secondaryKeys.includes(chip.dataset.key));
  });
};

const toggleSecondaryMode = () => {
  secondaryMode = !secondaryMode;
  secondaryToggle.classList.toggle('ghost', !secondaryMode);
  secondaryToggle.textContent = secondaryMode ? 'Secondaire actif' : 'Mode secondaire';
};

secondaryToggle.addEventListener('click', toggleSecondaryMode);

clearSelection.addEventListener('click', () => {
  primaryKey = null;
  secondaryKeys = [];
  syncChipStates();
  updateSummary();
});

sessionItems.forEach((item) => {
  item.addEventListener('click', () => {
    const sessionKey = item.dataset.session;
    const session = sessionData[sessionKey];
    if (!session) return;

    sessionItems.forEach((node) => node.classList.remove('is-active'));
    item.classList.add('is-active');

    detailTitle.textContent = session.title;
    detailMeta.textContent = session.meta;
    detailScore.textContent = session.score;
    detailIntent.textContent = session.intent;
    detailSteps.innerHTML = session.steps.map((step) => `<li>${step}</li>`).join('');
  });
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const key = chip.dataset.key;

    if (secondaryMode) {
      if (secondaryKeys.includes(key)) {
        secondaryKeys = secondaryKeys.filter((item) => item !== key);
      } else if (secondaryKeys.length < 2 && key !== primaryKey) {
        secondaryKeys = [...secondaryKeys, key];
      }
    } else {
      primaryKey = key;
    }

    syncChipStates();
    updateSummary();
  });
});

updateSummary();
