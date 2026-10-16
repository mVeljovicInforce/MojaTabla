const streetId = getStreetId();
const titleEl = document.getElementById('board-title');
const postsEl = document.getElementById('posts');
const newPostLink = document.getElementById('new-post-link');
const filterEl = document.getElementById('category-filter');
const postsSection =document.getElementById('posts-section');

const newPostUrl = '/new-post.html?street=' + encodeURIComponent(streetId);

function commentCountLabel(count) {
  if (!count) return 'Nema komentara';
  return count === 1 ? '1 komentar' : count + ' komentara';
}

// The title is a real link; CSS stretches it over the whole card.
function renderTitle(post) {
  const link = element('a', '', post.title);
  link.href = '/post.html?post=' + encodeURIComponent(post.id);
  const heading = element('h3', 'post-title');
  heading.append(link);
  return heading;
}

function renderPost(post) {
  const article = element('article', post.isImportant ? 'post post-important' : 'post');
  const badge = element('span', 'badge badge-' + post.category, CATEGORY_LABELS[post.category] || post.category);

  const footerText =
    (post.houseNumber ? 'Broj ' + post.houseNumber + ' · ' : '') +
    formatDate(post.createdAt) +
    ' · ' +
    commentCountLabel(post.commentCount);

  article.append(
    ...(post.isImportant ? [element('span', 'badge badge-important', IMPORTANT_LABEL)] : []),
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

const ALL_LABEL = 'Sve';
const EMPTY_CATEGORY_TEXT = 'Nema objava u ovoj kategoriji.';

let allPosts = [];
let activeCategory = null; // null = all

function renderPosts() {
  postsEl.replaceChildren();
  if (allPosts.length === 0) {
    postsEl.append(renderEmptyState());
    return;
  }
  const visible = activeCategory ? allPosts.filter((p) => p.category === activeCategory) : allPosts;
  if (visible.length === 0) {
    const box = element('div', 'empty-state');
    box.append(element('p', '', EMPTY_CATEGORY_TEXT));
    postsEl.append(box);
    return;
  }
  for (const post of visible) postsEl.append(renderPost(post));
}

function renderFilter() {
  const options = [[null, ALL_LABEL], ...Object.entries(CATEGORY_LABELS)];
  filterEl.replaceChildren();
  for (const [category, label] of options) {
    const button = element('button', 'filter-chip', label);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category === activeCategory));
    button.addEventListener('click', () => {
      activeCategory = category;
      for (const chip of filterEl.children) {
        chip.setAttribute('aria-pressed', String(chip === button));
      }
      renderPosts();
    });
    filterEl.append(button);
  }
  filterEl.hidden = allPosts.length === 0;
}

async function init() {
  try {
    const street = await api('/streets/' + encodeURIComponent(streetId));
    titleEl.textContent = street.name;
    document.getElementById('board-city').textContent = street.cityName;
    document.title = street.name + ' – Moja tabla';
    newPostLink.href = newPostUrl;
    newPostLink.hidden = false;
    allPosts = await api('/streets/' + encodeURIComponent(streetId) + '/posts');
    activeCategory = null;
    renderFilter();
    renderPosts();
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
