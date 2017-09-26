import { rangeSlider, slider, number, sliderGroup, numberGroup } from './TwoRangeSlider.scss';

class TwoRangeSlider {
  constructor({
    lowValue = 1800,
    highValue = 2010,
    min = 0,
    max = 2010
  } = {}) {
    this.rangeSlider = document.createElement('div');
    this.rangeSlider.classList.add(rangeSlider);

    const [
      lowNumber,
      highNumber,
      lowSlider,
      highSlider
    ] = new Array(5).fill().map(() => {
      const el = document.createElement('input');
      el.setAttribute('min', min);
      el.setAttribute('max', max);
      return el;
    });

    [lowNumber, highNumber].forEach(el => {
      el.setAttribute('type', 'number');
      el.classList.add(number);
    });
    [lowSlider, highSlider].forEach(el => {
      el.setAttribute('type', 'range');
      el.classList.add(slider);
    });

    const findMin = (min, val) => min < val ? min : val;
    const findMax = (max, val) => max > val ? max : val;

    [lowSlider, lowNumber].forEach(el => el.setAttribute('value', lowValue));

    lowSlider.oninput = ({ target }) => {
      target.value = [
        parseInt(target.value),
        highNumber.value
      ].reduce(findMin, undefined);
      lowNumber.value = target.value;
    };

    lowNumber.onchange = ({ target }) => {
      target.value = findMax(
        [
          parseInt(target.value),
          highNumber.value
        ].reduce(findMin, undefined),
        target.min
      );
      lowSlider.value = target.value;
    };

    [highNumber, highSlider].forEach(el => el.setAttribute('value', highValue));

    highSlider.oninput = ({ target }) => {
      target.value = [
        parseInt(target.value),
        lowNumber.value
      ].reduce(findMax, undefined);
      highNumber.value = target.value;
    };
    highNumber.onchange = ({ target }) => {
      target.value = findMin(
        [
          parseInt(target.value),
          lowNumber.value
        ].reduce(findMax, undefined),
        target.max
      );
      highSlider.value = target.value;
    };

    const numbers = document.createElement('div');
    numbers.classList.add(numberGroup);
    [
      document.createTextNode('from: '),
      lowNumber,
      document.createTextNode('to: '),
      highNumber
    ].forEach(el => numbers.appendChild(el));

    const sliders = document.createElement('div');
    sliders.classList.add(sliderGroup);
    sliders.appendChild(lowSlider);
    sliders.appendChild(highSlider);

    [numbers, sliders].forEach(el => this.rangeSlider.appendChild(el));
  }

  appendToNode(node) {
    node.appendChild(this.rangeSlider);
    return this;
  }
}

export default TwoRangeSlider;
