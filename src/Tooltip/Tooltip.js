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

  show(fadeDuration = 250) {
    this.tooltip.style.opacity = 0;
    this.tooltip.style.transition = `opacity ${fadeDuration}ms`;
    this.tooltip.classList.remove(hide);
    this.tooltip.classList.add(show);
    document.body.appendChild(this.tooltip);

    // Without setTimeout browser will try to optimize preventing transition
    setTimeout(() => this.tooltip.style.opacity = 'initial', 10);
    return this;
  }

  hide(settings = {}) {
    const { remove = true, fadeDuration = 250 } = settings;
    this.tooltip.style.transition = `opacity ${fadeDuration}ms`;
    this.tooltip.style.opacity = 0;

    setTimeout(() => {
      if (remove) this.tooltip.parentNode.removeChild(this.tooltip);
      else {
        this.tooltip.classList.remove(show);
        this.tooltip.classList.add(hide);
      }
    }, fadeDuration);

    return this;
  }

  setPosition(x = 0, y = 0) {
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
    return this;
  }
}

export default Tooltip;
