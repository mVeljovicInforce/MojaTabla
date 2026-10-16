const postId = new URLSearchParams(window.location.search).get('post');
const postEl = document.getElementById('post');
const commentsEl = document.getElementById('comments');
const commentsSection = document.getElementById('comments-section');
const commentForm = document.getElementById('comment-form');
const commentBody = document.getElementById('comment-body');
const commentError = document.getElementById('comment-error');
const commentButton = commentForm.querySelector('button');

const postPath = '/posts/' + encodeURIComponent(postId);

function renderPost(post) {
  const validity = !post.isExpired && post.expiresAt ? ' · Važi do ' + formatDate(post.expiresAt) : '';
  postEl.replaceChildren(
    ...(post.isExpired ? [element('span', 'badge badge-expired', EXPIRED_LABEL)] : []),
    ...(post.isImportant ? [element('span', 'badge badge-important', IMPORTANT_LABEL)] : []),
    element('span', 'badge badge-' + post.category, CATEGORY_LABELS[post.category] || post.category),
    element('h1', 'post-title', post.title),
    element('p', 'post-body', post.body),
    element('p', 'post-footer', (post.houseNumber ? 'Broj ' + post.houseNumber + ' \u00B7 ' : '') + formatDate(post.createdAt) + validity)
  );
  postEl.hidden = false;
}

function renderComments(comments) {
  commentsEl.replaceChildren();
  if (comments.length === 0) {
    const empty = element('div', 'comments-empty');
    empty.append(element('p', '', 'Još nema komentara.'), element('p', 'hint', 'Budi prvi koji će odgovoriti.'));
    commentsEl.append(empty);
    return;
  }
  const list = element('ul', 'comment-list');
  for (const comment of comments) {
    const item = element('li', 'comment');
    item.append(
      element('p', 'comment-author', 'Anonimni komšija'),
      element('p', 'comment-body', comment.body),
      element('p', 'comment-date', formatDate(comment.createdAt))
    );
    list.append(item);
  }
  commentsEl.append(list);
}

async function init() {
  try {
    const post = await api(postPath);
    document.title = post.title + ' – Moja tabla';
    document.getElementById('back-link').href = boardUrl(post.streetId);
    document.getElementById('street-context').textContent = post.streetName + ', ' + post.cityName;
    renderPost(post);
    renderComments(await api(postPath + '/comments'));
    commentForm.hidden = post.isExpired;
    document.getElementById('comments-closed').hidden = !post.isExpired;
    commentsSection.hidden = false;
  } catch (e) {
    document.getElementById('back-link').textContent = '\u2190 Izaberi ulicu';
    showMessage(e.message);
  }
}

// The comment is sent with fetch, so a page refresh never re-sends it.
commentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  commentError.hidden = true;
  commentButton.disabled = true;
  try {
    await api(postPath + '/comments', { body: { body: commentBody.value } });
    commentBody.value = '';
    renderComments(await api(postPath + '/comments'));
  } catch (e) {
    commentError.textContent = e.message;
    commentError.hidden = false;
  } finally {
    commentButton.disabled = false;
  }
});

init();
