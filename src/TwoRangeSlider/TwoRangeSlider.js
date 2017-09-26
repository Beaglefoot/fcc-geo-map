class TwoRangeSlider {
  constructor({
    lowValue = 1800,
    highValue = 2010,
    min = 0,
    max = 2000
  } = {}) {
    this.rangeSlider = document.createElement('div');

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

    [lowNumber, highNumber].forEach(el => el.setAttribute('type', 'number'));
    [lowSlider, highSlider].forEach(el => el.setAttribute('type', 'range'));

    [lowNumber, lowSlider].forEach((el, i, all) => {
      el.setAttribute('value', lowValue);
      el.oninput = () => {
        el.value = [
          parseInt(el.value),
          highNumber.value
        ].reduce((min, val) => min < val ? min : val, undefined);

        all.find((_, j) => j !== i).setAttribute('value', el.value);
      };
    });

    [highNumber, highSlider].forEach((el, i, all) => {
      el.setAttribute('value', highValue);
      el.oninput = () => {
        el.value = [
          parseInt(el.value),
          lowNumber.value
        ].reduce((max, val) => max > val ? max : val, undefined);

        all.find((_, j) => j !== i).setAttribute('value', el.value);
      };
    });

    [lowNumber, highNumber, lowSlider, highSlider].forEach(el => (
      this.rangeSlider.appendChild(el)
    ));
  }

  appendToNode(node) {
    node.appendChild(this.rangeSlider);
    return this;
  }
}

export default TwoRangeSlider;
