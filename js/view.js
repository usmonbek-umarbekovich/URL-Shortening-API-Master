const sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

class LinkView {
  #shortenForm = document.querySelector('.shortening-form');
  #inputField = document.querySelector('#raw-link');
  #shortenResults = document.querySelector('.shorten-result');
  #btnShorten = document.querySelector('.btn-shorten');
  #spinner = document.querySelector('.spinner');
  #errorContainer = document.querySelector('.error-message');
  #cards = document.querySelectorAll('.card');
  #heading = document.querySelector('.heading');
  #subHeading = document.querySelector('.sub-heading');
  #lHeading = document.querySelector('.l-heading');
  #headingDetail = document.querySelector('.heading-detail');
  #partObserver;
  #fullObserver;
  #btnCopied;
  #link;

  constructor() {
    this.#partObserver = this.#getPartObserver();
    this.#fullObserver = this.#getFullObserver();
    this.#observeElements();
  }

  addHandlerShorten(handler) {
    this.#shortenForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handler(this); // this -> form
    });
  }

  addHandlerLoad(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerCopy() {
    this.#shortenResults.addEventListener('click', this.#copy.bind(this));
  }

  addHandlerDelete(handler) {
    this.#shortenResults.addEventListener('click', async function (e) {
      const btnDelete = e.target.closest('.remove-link');
      if (!btnDelete) return;

      const container = e.target.closest('.result-container');
      const newLink = btnDelete.parentElement.querySelector('.new-link');
      container.classList.add('hide-link');
      handler(newLink.textContent);
      await sleep(1000);
      container.remove();
    });
  }

  addHandlerStart() {
    const btnStart = document.querySelectorAll('.btn-start');
    btnStart.forEach(btn =>
      btn.addEventListener('click', this.#scrolToForm.bind(this))
    );
  }

  addHandlerHamburger() {
    document
      .querySelector('.hamburger')
      .addEventListener('click', this.#toggleNavbar);
  }

  #scrolToForm() {
    const rect = this.#shortenForm.getBoundingClientRect();
    const navbar = document.querySelector('#navbar');
    const navHeight = navbar.getBoundingClientRect().height;
    window.scroll({
      behavior: 'smooth',
      top: window.pageYOffset + rect.top - navHeight,
    });
    setTimeout(function () {
      this.#inputField.focus();
    }, 0);
  }

  #copy(e) {
    const btnCopy = e.target.closest('.btn-copy');
    if (!btnCopy) return;

    const newLink = btnCopy.parentElement.querySelector('.new-link');
    navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
      if (result.state == 'granted' || result.state == 'prompt') {
        navigator.clipboard.writeText(newLink.textContent).then(
          () => {
            if (this.#btnCopied) {
              this.#btnCopied.classList.remove('btn-dark');
              this.#btnCopied.textContent = 'Copy';
            }
            this.#btnCopied = btnCopy;
            btnCopy.classList.add('btn-dark');
            btnCopy.textContent = 'Copied!';
          },
          () => {}
        );
      }
    });
  }

  renderSpinner() {
    this.#btnShorten.style.background = 'hsl(180, 66%, 70%)';
    this.#btnShorten.style.cursor = 'not-allowed';
    this.#btnShorten.disabled = true;
    this.#spinner.classList.remove('hide-spinner');
  }

  removeSpinner() {
    this.#spinner.classList.add('hide-spinner');
    this.#btnShorten.style.background = 'hsl(180, 66%, 49%)';
    this.#btnShorten.style.cursor = 'pointer';
    this.#btnShorten.disabled = false;
  }

  renderError(msg) {
    this.#inputField.value = '';
    this.#inputField.style.border = '2px solid hsl(0, 87%, 67%)';
    this.#errorContainer.textContent = msg;
  }

  removeError() {
    this.#inputField.style.border = 'none';
    this.#errorContainer.textContent = '';
  }

  #generateMarkup() {
    return `
      <div class="result-container hidden">
        <p class="old-link">${this.#link.originalLink}</p>
        <div class="new-link-field">
          <a
            href="${this.#link.shortLink}"
            class="new-link"
            target="_blank"
          >
            ${this.#link.shortLink}
          </a>
          <button class="btn btn-secondary btn-copy">Copy</button>
          <svg class="remove-link">
            <use href="./images/remove.svg#remove"></use>
          </svg>
        </div>
      </div>`;
  }

  render(link) {
    this.#inputField.value = '';
    this.#link = link;
    const markup = this.#generateMarkup();
    this.#shortenResults.insertAdjacentHTML('afterbegin', markup);
    this.#partObserver.observe(this.#shortenResults.firstElementChild);
  }

  async #revealItem(entries, observer) {
    const intersection = entries
      .filter(entry => entry.isIntersecting)
      .map(entry => entry.target);
    if (intersection.length === 0) return;

    intersection.forEach(el => {
      observer.unobserve(el);
    });

    if (intersection.length === 1) {
      intersection[0].classList.remove('hidden');
      intersection[0].classList.add('show-from-bottom');
    }

    const cards = Array.from(this.#cards);
    if (
      intersection.length === 3 &&
      intersection.every(el => cards.includes(el))
    ) {
      intersection.forEach(card => {
        const direction = card.dataset.direction;
        card.classList.remove('hidden');
        if (direction === 'bottom') {
          card.classList.add('show-from-bottom');
        } else {
          card.classList.add(`card-${direction}`);
        }
      });
    }

    const headerHeadings = [this.#heading, this.#subHeading];
    const statsHeadings = [this.#lHeading, this.#headingDetail];
    if (
      intersection.length === 2 &&
      (intersection.every(el => headerHeadings.includes(el)) ||
        intersection.every(el => statsHeadings.includes(el)))
    ) {
      let intervalId;
      let index = 0;
      const showText = function () {
        const el = intersection[index];
        const direction = el.dataset.direction;
        el.classList.remove('hidden');
        el.classList.add(`show-from-${direction}`);
        index++;
      };
      showText();
      intervalId = setInterval(function () {
        showText();
        if (index === 2) clearInterval(intervalId);
      }, 500);
    }

    if (intersection.length > 3) {
      intersection.forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('show-from-center');
      });
    }
  }

  #getPartObserver() {
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: 0.5,
    });
  }

  #getFullObserver() {
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: 1,
      rootMargin: '5px',
    });
  }

  #observeElements() {
    [...this.#cards, this.#shortenForm].forEach(el =>
      this.#partObserver.observe(el)
    );
    [
      this.#heading,
      this.#lHeading,
      this.#subHeading,
      this.#headingDetail,
    ].forEach(el => this.#fullObserver.observe(el));
  }

  #toggleNavbar() {
    const linkContainer = document.querySelector('.link-container');
    linkContainer.classList.toggle('show-navbar');
  }
}

export default new LinkView();
