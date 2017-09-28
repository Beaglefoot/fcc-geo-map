/* eslint no-unused-vars: off */
import {
  rangeSlider,
  valuesGroup,
  text as textClass,
  value as valueClass,
  track as trackClass,
  thumb as thumbClass,
  active
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

    this.lowValue = lowValue;
    this.highValue = highValue;
    this.valueRange = [min, max];
    this.callback = callback;
  }

  appendToNode(node) {
    node.appendChild(this.rangeSlider);

    const track = this.rangeSlider.getElementsByClassName(trackClass)[0];
    const {
      left: trackStartingX,
      width: trackWidth
    } = track.getBoundingClientRect();
    const trackEndingX = trackStartingX + trackWidth;
    const thumb1 = this.rangeSlider.getElementsByClassName(thumbClass)[0];
    const thumb2 = this.rangeSlider.getElementsByClassName(thumbClass)[1];
    const value1 = this.rangeSlider.getElementsByClassName(valueClass)[0];
    const value2 = this.rangeSlider.getElementsByClassName(valueClass)[1];


    const getThumbCenter = thumb => {
      const { left, width } = thumb.getBoundingClientRect();
      return left + width / 2;
    };

    const scaleValue = value => (
      (this.valueRange[1] - this.valueRange[0]) * value + this.valueRange[0]
    );

    const valueToPosition = (value, width) => (
      width * (value - this.valueRange[0]) / (this.valueRange[1] - this.valueRange[0])
    );

    const moveThumb = (() => {
      const argsHash = {};

      return (selectedThumb, selectedValue) => {
        const key = ''.concat(
          selectedThumb.getAttribute('id'),
          selectedValue.getAttribute('id')
        );

        if (argsHash[key]) return argsHash[key];

        argsHash[key] = event => {
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

        return argsHash[key];
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
    }));

    window.addEventListener('mouseup', () => {
      [thumb1, thumb2].forEach(thumb => thumb.classList.remove(active));
      [
        { thumb: thumb1, value: value1 },
        { thumb: thumb2, value: value2 }
      ].forEach(({ thumb, value }) => (
        window.removeEventListener('mousemove', moveThumb(thumb, value))
      ));
    });

    thumb1.style.left = `${valueToPosition(this.lowValue, trackWidth)}px`;
    value1.textContent = Math.round(
      scaleValue((getThumbCenter(thumb1) - trackStartingX) / trackWidth)
    );
    thumb2.style.left = `${valueToPosition(this.highValue, trackWidth)}px`;
    value2.textContent = Math.round(
      scaleValue((getThumbCenter(thumb2) - trackStartingX) / trackWidth)
    );


    return this;
  }
}

export default RangeSlider;
