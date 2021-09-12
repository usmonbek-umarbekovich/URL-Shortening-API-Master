import '@babel/polyfill';
import '@babel/runtime/regenerator';
import linkView from './view.js';
import * as model from './model.js';

const shorten = async function (form) {
  try {
    // remove error message if there was any
    linkView.removeError();

    // render spinner while trying to load
    linkView.renderSpinner();

    const formData = new FormData(form);
    const longLink = formData.get('link');
    const shortLink = await model.shortenLink(longLink);
    linkView.render(shortLink);
  } catch (err) {
    linkView.renderError(err.message);
  } finally {
    linkView.removeSpinner();
  }
};

const loadSavedLinks = function () {
  if (model.links.length > 0) {
    model.links.forEach(link => linkView.render(link));
  }
};

const deleteLink = function (shortLink) {
  model.deleteLink(shortLink);
};

const init = function () {
  linkView.addHandlerShorten(shorten);
  linkView.addHandlerLoad(loadSavedLinks);
  linkView.addHandlerDelete(deleteLink);
  linkView.addHandlerHamburger();
  linkView.addHandlerCopy();
  linkView.addHandlerStart();
};

init();
