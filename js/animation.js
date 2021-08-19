class Animation {
  cards(intersection) {
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

  singleElement(intersection) {
    intersection[0].classList.remove('hidden');
    intersection[0].classList.add('show-from-bottom');
  }
}

export default new Animation();