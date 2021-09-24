import * as el from './elements';
import { sleep } from './helpers';
import animation from './animation';
import removeIcon from 'url:../images/remove.svg'

class LinkView {
  #partObserver;
  #fullObserver;
  #topObserver;
  #btnCopied;
  #link;

  constructor() {
    this.#partObserver = this.#getPartObserver();
    this.#fullObserver = this.#getFullObserver();
    this.#topObserver = this.#getTopObserver();
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
            <use xlink:href="${removeIcon}#remove"></use>
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
    this.#topObserver.observe(el.shortenResults.firstElementChild);
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

  #revealItem(entries, observer) {
    entries = entries.filter(entry => entry.isIntersecting);
    if (entries.length === 0) return;

    const cardContainerID = entries.findIndex(
      entry => entry.target === el.cardContainer
    );
    if (cardContainerID !== -1) {
      animation.cards();
      entries.splice(cardContainerID, 1);
      observer.unobserve(el.cardContainer);
    }

    entries.forEach(entry => {
      const distFromTop = entry.boundingClientRect.top;
      const distFromBottom = window.innerHeight - distFromTop;

      // prettier-ignore
      if (entry.boundingClientRect.top > 0) {
        if (distFromTop > distFromBottom) {
          animation.singleElement(entry.target, 'bottom');
        }
        else {
          animation.singleElement(entry.target, 'top');
        }
      }

      else if (observer === this.#partObserver) {
        this.#partObserver.unobserve(entry.target);
      }
      
      else if (observer === this.#topObserver) {
        animation.singleElement(entry.target, 'top');
      }

      if (distFromTop > 0 || observer === this.#topObserver) {
        this.#partObserver.unobserve(entry.target);
        this.#topObserver.unobserve(entry.target);
      }
    });
  }

  #getPartObserver() {
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: 0.5,
    });
  }

  #getFullObserver() {
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: 1,
    });
  }

  #getTopObserver() {
    let thresholdValue = window.innerWidth > 300 ? 0.5 : 0;
    let rootMarginValue =
      window.innerHeight > 300
        ? `-${el.navbar.getBoundingClientRect().height}px`
        : `-${el.navbar.getBoundingClientRect().height - 20}px`;
    return new IntersectionObserver(this.#revealItem.bind(this), {
      threshold: thresholdValue,
      rootMargin: rootMarginValue,
    });
  }

  #observeElements() {
    if (window.innerWidth <= 660) {
      el.cardLine.classList.remove('hidden');
      [...el.cards].forEach(card => {
        this.#partObserver.observe(card);
        this.#topObserver.observe(card);
      });
    }

    if (window.innerWidth > 660) {
      this.#fullObserver.observe(el.cardContainer);
    }

    this.#partObserver.observe(el.shortenForm);
    this.#topObserver.observe(el.shortenForm);
  }

  #toggleNavbar() {
    el.linkContainer.classList.toggle('show-navbar');
  }
}

export default new LinkView();
