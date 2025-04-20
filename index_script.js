function saveItemState(type, id, isOpen) {
    localStorage.setItem(`${type}_${id}`, isOpen.toString());
  }

  function isItemOpen(type, id) {
    const state = localStorage.getItem(`${type}_${id}`);
    return state === 'true';
  }

  function addClickEventToItem(item, type, id) {
    const label = item.querySelector('.toggle-label');
    if (!label) return;

    label.addEventListener('click', function (e) {
      e.stopPropagation();
      item.classList.toggle('open');
      saveItemState(type, id, item.classList.contains('open'));
    });
  }

  function renderItems(parts) {
    const partsList = document.getElementById('parts-list');
    parts.forEach(part => {
      const li = document.createElement('li');
      li.classList.add('part');

      const labelSpan = document.createElement('span');
      labelSpan.classList.add('toggle-label');
      labelSpan.textContent = part.title ? `${part.part} - ${part.title}` : `${part.part}`;
      li.appendChild(labelSpan);

      const partId = `${part.part}-${part.title || ''}`;
      if (isItemOpen('part', partId)) li.classList.add('open');
      addClickEventToItem(li, 'part', partId);

      const nested = document.createElement('ul');
      nested.classList.add('nested');

      if (part.chapters.length > 0) {
        part.chapters.forEach(chapter => {
          const chapLi = document.createElement('li');
          chapLi.classList.add('chapter');

          const chapLabel = document.createElement('span');
          chapLabel.classList.add('toggle-label');
          chapLabel.textContent = chapter.chapter;
          chapLi.appendChild(chapLabel);

          const chapterId = `${part.part}-${chapter.chapter}`;
          if (isItemOpen('chapter', chapterId)) chapLi.classList.add('open');
          addClickEventToItem(chapLi, 'chapter', chapterId);

          const chapNested = document.createElement('ul');
          chapNested.classList.add('nested');

          if (chapter.headings?.length > 0) {
            chapter.headings.forEach(heading => {
              const headLi = document.createElement('li');
              headLi.classList.add('heading');

              const headLabel = document.createElement('span');
              headLabel.classList.add('toggle-label');
              headLabel.textContent = heading.heading;
              headLi.appendChild(headLabel);

              const headingId = `${part.part}-${chapter.chapter}-${heading.heading}`;
              if (isItemOpen('heading', headingId)) headLi.classList.add('open');
              addClickEventToItem(headLi, 'heading', headingId);

              const headNested = document.createElement('ul');
              headNested.classList.add('nested');
              heading.articles.forEach(article => {
                const artLi = document.createElement('li');
                artLi.classList.add('article');

                const label = /^\d/.test(article.id) ? `Article ${article.id}` : article.id;
                const display = article.title ? `${label}: ${article.title}` : label;

                const link = document.createElement('span');
                link.classList.add('link');
                link.textContent = display;
                link.onclick = () => goToArticle(part.part, article.id);

                artLi.appendChild(link);
                headNested.appendChild(artLi);
              });

              headLi.appendChild(headNested);
              chapNested.appendChild(headLi);
            });
          } else {
            chapter.articles.forEach(article => {
              const artLi = document.createElement('li');
              artLi.classList.add('article');

              const label = /^\d/.test(article.id) ? `Article ${article.id}` : article.id;
              const display = article.title ? `${label}: ${article.title}` : label;

              const link = document.createElement('span');
              link.classList.add('link');
              link.textContent = display;
              link.onclick = () => goToArticle(part.part, article.id);

              artLi.appendChild(link);
              chapNested.appendChild(artLi);
            });
          }

          chapLi.appendChild(chapNested);
          nested.appendChild(chapLi);
        });
      } else {
        if (part.articles.length === 0) {
          const omitted = document.createElement('li');
          omitted.textContent = 'Omitted';
          nested.appendChild(omitted);
        } else {
          part.articles.forEach(article => {
            const artLi = document.createElement('li');
            artLi.classList.add('article');

            const label = /^\d/.test(article.id) ? `Article ${article.id}` : article.id;
            const display = article.title ? `${label}: ${article.title}` : label;

            const link = document.createElement('span');
            link.classList.add('link');
            link.textContent = display;
            link.onclick = () => goToArticle(part.part, article.id);

            artLi.appendChild(link);
            nested.appendChild(artLi);
          });
        }
      }

      li.appendChild(nested);
      partsList.appendChild(li);
    });
  }

  function goToArticle(part, article) {
    const partSlug = encodeURIComponent(part);
    const articleSlug = encodeURIComponent(article);
    window.location.href = `article.html?part=${partSlug}&article=${articleSlug}`;
  }

  async function loadParts() {
    const response = await fetch('./data/parts.json');
    const parts = await response.json();
    renderItems(parts);
  }

  window.addEventListener('load', loadParts);