const citySelect = document.getElementById('city');
const streetsSection = document.getElementById('streets-section');
const newStreetSection = document.getElementById('new-street-section');
const streetList = document.getElementById('street-list');
const streetForm = document.getElementById('street-form');
const streetNameInput = document.getElementById('street-name');

async function loadStreets() {
  showMessage('');
  streetList.replaceChildren();
  const streets = await api('/cities/' + citySelect.value + '/streets');

  if (streets.length === 0) {
    const li = document.createElement('li');
    li.className = 'street-empty';
    li.textContent = 'Još nema unetih ulica.';
    streetList.append(li);
  }
  for (const street of streets) {
    const link = document.createElement('a');
    link.className = 'street-row';
    link.href = boardUrl(street.id);

    const name = document.createElement('span');
    name.textContent = street.name;
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '›';
    link.append(name, chevron);

    const li = document.createElement('li');
    li.append(link);
    streetList.append(li);
  }
  streetsSection.hidden = false;
  newStreetSection.hidden = false;
}

async function init() {
  const cities = await api('/cities');
  for (const city of cities) {
    const option = document.createElement('option');
    option.value = city.id;
    option.textContent = city.name;
    citySelect.append(option);
  }
  if (cities.length > 0) await loadStreets();
}

citySelect.addEventListener('change', () => loadStreets().catch((e) => showMessage(e.message)));

// The server returns the existing street if the name matches, otherwise creates it.
streetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const street = await api('/cities/' + citySelect.value + '/streets', {
      body: { name: streetNameInput.value },
    });
    window.location.href = boardUrl(street.id);
  } catch (e) {
    showMessage(e.message);
  }
});

init().catch((e) => showMessage(e.message));
