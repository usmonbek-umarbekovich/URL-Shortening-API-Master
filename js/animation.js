import * as el from './elements.js';
import { sleep } from './helpers.js';

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

  headings(intersection) {
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

  singleElement(element) {
    element.classList.remove('hidden');
    if (
      element.classList.contains('card') &&
      element.dataset.direction !== 'bottom'
    ) {
      const direction = element.dataset.direction;
      element.classList.add(`card-${direction}-bottom`);
    } else {
      element.classList.add('show-from-bottom');
    }
  }
}

export default new Animation();
