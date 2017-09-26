import { rangeSlider, slider, number, sliderGroup, numberGroup } from './TwoRangeSlider.scss';

class TwoRangeSlider {
  constructor({
    lowValue = 1800,
    highValue = 2010,
    min = 0,
    max = 2000
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

    [lowSlider, lowNumber].forEach(el => el.setAttribute('value', lowValue));
    lowSlider.oninput = ({ target }) => {
      target.value = [
        parseInt(target.value),
        highNumber.value
      ].reduce((min, val) => min < val ? min : val, undefined);
      lowNumber.value = target.value;
    };
    lowNumber.onchange = ({ target }) => {
      target.value = [
        parseInt(target.value),
        highNumber.value
      ].reduce((min, val) => min < val ? min : val, undefined);
      lowSlider.value = target.value;
    };

    [highNumber, highSlider].forEach(el => el.setAttribute('value', highValue));
    highSlider.oninput = ({ target }) => {
      target.value = [
        parseInt(target.value),
        lowNumber.value
      ].reduce((max, val) => max > val ? max : val, undefined);
      highNumber.value = target.value;
    };
    highNumber.onchange = ({ target }) => {
      target.value = [
        parseInt(target.value),
        lowNumber.value
      ].reduce((max, val) => max > val ? max : val, undefined);
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
