const streetId = getStreetId();
const form = document.getElementById('post-form');
const categorySelect = document.getElementById('category');

async function init() {
  for (const [code, label] of Object.entries(CATEGORY_LABELS)) {
    categorySelect.append(new Option(label, code));
  }
  categorySelect.selectedIndex = -1;

  try {
    const street = await api('/streets/' + encodeURIComponent(streetId));
    document.getElementById('street-name').textContent = street.name + ', ' + street.cityName;
    document.getElementById('back-link').href = boardUrl(street.id);
    document.getElementById('cancel-link').href = boardUrl(street.id);
    form.hidden = false;
  } catch (e) {
    document.getElementById('back-link').textContent = '← Izaberi ulicu';
    showMessage(e.message);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('/streets/' + encodeURIComponent(streetId) + '/posts', {
      body: {
        category: categorySelect.value,
        title: document.getElementById('title').value,
        body: document.getElementById('body').value,
        houseNumber: document.getElementById('house-number').value,
      },
    });
    // replace() keeps the finished form out of the back-button history.
    window.location.replace(boardUrl(streetId));
  } catch (e) {
    showMessage(e.message);
  }
});

init();
