import * as el from './elements.js';

class Animation {
  cards() {
    // show line
    el.cardLine.classList.remove('hidden');
    el.cardLine.classList.add('show-card-line');

    // show cards after 500ms
    setTimeout(function () {
      el.cards.forEach(card => {
        const direction = card.dataset.direction;
        card.classList.remove('hidden');
        if (direction === 'bottom') {
          card.classList.add('show-from-bottom');
        } else {
          card.classList.add(`card-${direction}`);
        }
      });
    }, 500);
  }

  singleElement(element, direction) {
    element.classList.remove('hidden');
    element.classList.add(`show-from-${direction}`);
  }
}

export default new Animation();
