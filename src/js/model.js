import '@babel/polyfill';
import '@babel/runtime/regenerator';
import { API_URL } from './config.js';
import { AJAX } from './helpers.js';

export let links = [];

const saveLink = function () {
  localStorage.setItem('links', JSON.stringify(links));
};

const getSavedLinks = function () {
  return JSON.parse(localStorage.getItem('links'));
};

export const shortenLink = async function (longLink) {
  try {
    const { result } = await AJAX(`${API_URL}/shorten?url=${longLink}`);
    const { full_short_link, original_link } = result;
    const newLink = { shortLink: full_short_link, originalLink: original_link };
    links.push(newLink);
    saveLink();
    return newLink;
  } catch (err) {
    throw err;
  }
};

export const deleteLink = function (shortLink) {
  const linkIndex = links.findIndex(link => link.shortLink === shortLink);
  links.splice(linkIndex, 1);

  saveLink();
};

const init = function () {
  const savedLink = getSavedLinks();
  if (savedLink && savedLink.length > 0) {
    links = savedLink;
  }
};

init();
