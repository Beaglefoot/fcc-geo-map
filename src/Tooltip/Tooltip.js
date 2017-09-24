import { tooltip, show, hide } from './Tooltip.scss';

class Tooltip {
  constructor() {
    this.tooltip = document.createElement('div');
    this.tooltip.classList.add(tooltip, hide);
  }

  node() {
    return this.tooltip;
  }

  setContent(text) {
    this.tooltip.innerHTML = text;
    return this;
  }

  show(fadeDuration = 500) {
    this.tooltip.style.opacity = 0;
    this.tooltip.style.transition = `opacity ${fadeDuration}ms`;
    this.tooltip.classList.remove(hide);
    this.tooltip.classList.add(show);
    // Without setTimeout browser will try to optimize preventing transition
    setTimeout(() => this.tooltip.style.opacity = 'initial', 0);
    return this;
  }

  hide(fadeDuration = 500) {
    this.tooltip.style.transition = `opacity ${fadeDuration}ms`;
    this.tooltip.style.opacity = 0;
    setTimeout(() => {
      this.tooltip.classList.remove(show);
      this.tooltip.classList.add(hide);
    }, fadeDuration);
    return this;
  }
}

export default Tooltip;
