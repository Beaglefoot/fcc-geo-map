import {
  rangeSlider,
  valuesGroup,
  text as textClass,
  value as valueClass,
  track as trackClass,
  thumb as thumbClass,
  active,
  hide
} from './RangeSlider.scss';

const createDivWithGivenClass = className => {
  const div = document.createElement('div');
  div.classList.add(className);
  return div;
};

class RangeSlider {
  constructor({
    lowValue = 1800,
    highValue = 1950,
    min = 1600,
    max = 2010,
    callback = () => {}
  } = {}) {
    this.rangeSlider = createDivWithGivenClass(rangeSlider);
    this.rangeSlider.innerHTML = ''.concat(
      `<div class="${valuesGroup}">`,
      `  <div class="${textClass}"><strong>Years:</strong>`,
      `  <span class="${valueClass}" id="value1">0</span>`,
      '  <span> - </span>',
      `  <span class="${valueClass}" id="value2">0</span>`,
      '  </div>',
      '</div>',
      `<div class="${trackClass}">`,
      `  <div class="${thumbClass}" id="thumb1"></div>`,
      `  <div class="${thumbClass}" id="thumb2"></div>`,
      '</div>'
    );

    Object.assign(this, {
      lowValue,
      highValue,
      callback,
      valueRange: [min, max],
      scaleValue: this.scaleValue.bind(this),
      valueToPosition: this.valueToPosition.bind(this),
      getThumbCenter: this.getThumbCenter.bind(this),
      setThumbs: this.setThumbs.bind(this)
    });
  }

  scaleValue(value) {
    const { valueRange } = this;
    return (valueRange[1] - valueRange[0]) * value + valueRange[0];
  }

  valueToPosition(value, width) {
    const { valueRange } = this;
    return width * (value - valueRange[0]) / (valueRange[1] - valueRange[0]);
  }


  getThumbCenter(thumb) {
    const { left, width } = thumb.getBoundingClientRect();
    return left + width / 2;
  }

  setThumbs() {
    const {
      thumb1,
      thumb2,
      value1,
      value2,
      lowValue,
      highValue,
      trackWidth,
      trackStartingX,
      scaleValue,
      getThumbCenter,
      valueToPosition
    } = this;

    const [int1, int2] = [value1, value2].map(v => parseInt(v.textContent));

    thumb1.style.left = `${valueToPosition(int1 || lowValue, trackWidth)}px`;
    value1.textContent = Math.round(
      scaleValue((getThumbCenter(thumb1) - trackStartingX) / trackWidth)
    );

    thumb2.style.left = `${valueToPosition(int2 || highValue, trackWidth)}px`;
    value2.textContent = Math.round(
      scaleValue((getThumbCenter(thumb2) - trackStartingX) / trackWidth)
    );
  }

  appendToNode(node) {
    const {
      rangeSlider,
      getThumbCenter,
      setThumbs,
      scaleValue,
      valueRange
    } = this;

    node.appendChild(rangeSlider);

    const track = rangeSlider.getElementsByClassName(trackClass)[0];
    const { left, width } = track.getBoundingClientRect();

    const trackStartingX = left;
    const trackWidth = width;
    const trackEndingX = trackStartingX + trackWidth;
    const thumb1 = rangeSlider.getElementsByClassName(thumbClass)[0];
    const thumb2 = rangeSlider.getElementsByClassName(thumbClass)[1];
    const value1 = rangeSlider.getElementsByClassName(valueClass)[0];
    const value2 = rangeSlider.getElementsByClassName(valueClass)[1];

    Object.assign(this, {
      trackStartingX,
      trackWidth,
      trackEndingX,
      thumb1,
      thumb2,
      value1,
      value2
    });

    const moveThumb = (() => {
      const argsCache = {};

      return (selectedThumb, selectedValue) => {
        const key = ''.concat(
          selectedThumb.getAttribute('id'),
          selectedValue.getAttribute('id')
        );

        if (argsCache[key]) return argsCache[key];

        argsCache[key] = event => {
          let newX = event.clientX - trackStartingX;
          if (event.clientX > trackEndingX) newX = trackWidth;
          else if (event.clientX < trackStartingX) newX = 0;
          if (
            selectedThumb.getAttribute('id') === 'thumb1' &&
            event.clientX > trackStartingX + thumb2.offsetLeft
          ) newX = getThumbCenter(thumb2) - trackStartingX;
          else if (
            selectedThumb.getAttribute('id') === 'thumb2' &&
            event.clientX < trackStartingX + thumb1.offsetLeft
          ) newX = getThumbCenter(thumb1) - trackStartingX;

          selectedThumb.style.left = `${newX}px`;
          selectedValue.textContent = Math.round(
            scaleValue(newX / trackWidth)
          );

          this.callback([parseInt(value1.textContent), parseInt(value2.textContent)]);
        };

        return argsCache[key];
      };
    })();

    [
      { thumb: thumb1, value: value1 },
      { thumb: thumb2, value: value2 }
    ].forEach(({ thumb, value }) => thumb.addEventListener('mousedown', event => {
      // To get rid of occasional drag behavior
      event.preventDefault();
      thumb.classList.add(active);
      window.addEventListener('mousemove', moveThumb(thumb, value));

      // In case when both thumbs are on max
      if (thumb2.classList.contains(hide)) thumb2.classList.remove(hide);
    }));

    window.addEventListener('mouseup', () => {
      [thumb1, thumb2].forEach(thumb => thumb.classList.remove(active));
      [
        { thumb: thumb1, value: value1 },
        { thumb: thumb2, value: value2 }
      ].forEach(({ thumb, value }) => (
        window.removeEventListener('mousemove', moveThumb(thumb, value))
      ));

      // In case when both thumbs are on max
      if (parseInt(value1.textContent) === valueRange[1]) thumb2.classList.add(hide);
    });

    setThumbs();

    return this;
  }

  reinit() {
    const parent = this.rangeSlider.parentNode;
    parent.removeChild(this.rangeSlider);
    this.appendToNode(parent);
  }
}

export default RangeSlider;
