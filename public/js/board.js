const streetId = getStreetId();
const titleEl = document.getElementById('board-title');
const postsEl = document.getElementById('posts');
const newPostLink = document.getElementById('new-post-link');
const postsSection = document.getElementById('posts-section');

const newPostUrl = '/new-post.html?street=' + encodeURIComponent(streetId);

// The title is a real link; CSS stretches it over the whole card.
function renderTitle(post) {
  const link = element('a', '', post.title);
  link.href = '/post.html?post=' + encodeURIComponent(post.id);
  const heading = element('h3', 'post-title');
  heading.append(link);
  return heading;
}

function renderPost(post) {
  const article = element('article', 'post');
  const badge = element('span', 'badge badge-' + post.category, CATEGORY_LABELS[post.category] || post.category);

  const footerText = (post.houseNumber ? 'Broj ' + post.houseNumber + ' · ' : '') + formatDate(post.createdAt);

  article.append(
    badge,
    renderTitle(post),
    element('p', 'post-body', post.body),
    element('p', 'post-footer', footerText)
  );
  return article;
}

function renderEmptyState() {
  const box = element('div', 'empty-state');
  const link = element('a', 'button', 'Napiši prvu objavu');
  link.href = newPostUrl;
  box.append(element('p', '', 'Još nema objava u ovoj ulici.'), link);
  return box;
}

function renderPosts(posts) {
  postsEl.replaceChildren();
  if (posts.length === 0) {
    postsEl.append(renderEmptyState());
    return;
  }
  for (const post of posts) postsEl.append(renderPost(post));
}

async function init() {
  try {
    const street = await api('/streets/' + encodeURIComponent(streetId));
    titleEl.textContent = street.name;
    document.getElementById('board-city').textContent = street.cityName;
    document.title = street.name + ' – Moja tabla';
    newPostLink.href = newPostUrl;
    newPostLink.hidden = false;
    renderPosts(await api('/streets/' + encodeURIComponent(streetId) + '/posts'));
    postsSection.hidden = false;
  } catch (e) {
    titleEl.textContent = 'Ulica nije pronađena';
    showMessage(e.message);
  }
}

// Back/forward may restore a cached copy of this page; refresh so posts are current.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) init();
});

init();
