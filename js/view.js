import * as el from './elements.js';
import { sleep } from './helpers.js';
import animation from './animation.js';

class LinkView {
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
    el.shortenForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handler(this);
    });
  }

  addHandlerLoad(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerCopy() {
    el.shortenResults.addEventListener('click', this.#copy.bind(this));
  }

  addHandlerDelete(handler) {
    el.shortenResults.addEventListener('click', async function (e) {
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
    el.btnStart.forEach(btn =>
      btn.addEventListener('click', this.#scrolToForm.bind(this))
    );
  }

  addHandlerHamburger() {
    el.hamburger.addEventListener('click', this.#toggleNavbar);
  }

  #scrolToForm() {
    const rect = el.shortenForm.getBoundingClientRect();
    const navHeight = el.navbar.getBoundingClientRect().height;
    window.scroll({
      behavior: 'smooth',
      top: window.pageYOffset + rect.top - navHeight,
    });
    setTimeout(function () {
      el.inputField.focus();
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
    el.inputField.value = '';
    this.#link = link;
    const markup = this.#generateMarkup();
    el.shortenResults.insertAdjacentHTML('afterbegin', markup);
    this.#partObserver.observe(el.shortenResults.firstElementChild);
  }

  renderSpinner() {
    el.btnShorten.style.background = 'hsl(180, 66%, 70%)';
    el.btnShorten.style.cursor = 'not-allowed';
    el.btnShorten.disabled = true;
    el.spinner.classList.remove('hide-spinner');
  }

  removeSpinner() {
    el.spinner.classList.add('hide-spinner');
    el.btnShorten.style.background = 'hsl(180, 66%, 49%)';
    el.btnShorten.style.cursor = 'pointer';
    el.btnShorten.disabled = false;
  }

  renderError(msg) {
    el.inputField.value = '';
    el.inputField.style.border = '2px solid hsl(0, 87%, 67%)';
    el.errorContainer.textContent = msg;
  }

  removeError() {
    el.inputField.style.border = 'none';
    el.errorContainer.textContent = '';
  }

  async #revealItem(entries, observer) {
    const intersection = entries
      .filter(entry => entry.isIntersecting)
      .map(entry => entry.target);
    if (intersection.length === 0) return;

    // prettier-ignore
    if (intersection.length === 1) {
      // console.log('single');
      // animation.singleElement(intersection[0]);
      animation.cards();
    }
    
    else if (
      intersection.length === 3 &&
      intersection.every(el => Array.from(el.cards).includes(el))
      ) {
      console.log('cards');
      animation.cards(intersection);
    }

    else if (
      intersection.length === 2 &&
      (intersection.every(el => [el.heading, el.subHeading].includes(el)) ||
        intersection.every(el => [el.lHeading, el.headingDetail].includes(el)))
    ) {
      console.log('headings');
      animation.headings(intersection);
    }

    else if (intersection.length > 3) {
      intersection.forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('show-from-center');
      });
    }

    intersection.forEach(el => observer.unobserve(el));
  }

  #getPartObserver() {
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: 0.3,
    });
  }

  #getFullObserver() {
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: 1,
      rootMargin: '5px',
    });
  }

  #observeElements() {
    [...el.cards, el.shortenForm].forEach(el => this.#partObserver.observe(el));
    [
      el.heading,
      el.lHeading,
      el.subHeading,
      el.headingDetail,
      el.cardContainer,
    ].forEach(el => this.#fullObserver.observe(el));
  }

  #toggleNavbar() {
    el.linkContainer.classList.toggle('show-navbar');
  }
}

export default new LinkView();
