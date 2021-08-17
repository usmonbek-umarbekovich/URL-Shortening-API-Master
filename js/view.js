class LinkView {
  #shortenForm = document.querySelector('.shortening-form');
  #inputField = document.querySelector('#raw-link');
  #shortenResults = document.querySelector('.shorten-result');
  #btnShorten = document.querySelector('.btn-shorten');
  #spinner = document.querySelector('.spinner');
  #errorContainer = document.querySelector('.error-message');
  #btnCopied;
  #link;

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
    this.#shortenResults.addEventListener('click', function (e) {
      const btnDelete = e.target.closest('.remove-link');
      if (!btnDelete) return;

      const container = e.target.closest('.result-container');
      const newLink = btnDelete.parentElement.querySelector('.new-link');
      container.classList.add('hide-link');
      handler(newLink.textContent);
      setTimeout(function () {
        container.remove();
      }, 1000);
    });
  }

  addHandlerStart() {
    const btnStart = document.querySelectorAll('.btn-start');
    btnStart.forEach(btn =>
      btn.addEventListener('click', this.#scrolToForm.bind(this))
    );
  }

  #scrolToForm() {
    const rect = this.#shortenForm.getBoundingClientRect();
    window.scroll({
      behavior: 'smooth',
      top: window.pageYOffset + rect.top - 20,
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
      <div class="result-container">
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
  }
}

export default new LinkView();
