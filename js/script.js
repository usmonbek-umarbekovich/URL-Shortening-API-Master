import linkView from './view.js';
import { shortenLink, links } from './model.js';

const shorten = async function (form) {
  try {
    // remove error message if there was any
    linkView.removeError();

    // render spinner while trying to load
    linkView.renderSpinner();

    const formData = new FormData(form);
    const longLink = formData.get('link');
    const shortLink = await shortenLink(longLink);
    linkView.render(shortLink);
  } catch (err) {
    linkView.renderError(err.message);
  } finally {
    linkView.removeSpinner();
  }
};

const loadSavedLinks = function() {
  if (links.length > 0) {
    links.forEach(link => linkView.render(link));
  }
}

const init = function () {
  linkView.addHandlerShorten(shorten);
  linkView.addHandlerLoad(loadSavedLinks);
  linkView.addHandlerCopy();
};

init();
