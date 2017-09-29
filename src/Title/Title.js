import { title as titleClass } from './Title.scss';

class Title {
  constructor(text) {
    this.title = document.createElement('h1');
    this.title.appendChild(document.createTextNode(text));
    this.title.classList.add(titleClass);
  }

  addClass(className) {
    this.title.classList.add(className);
    return this;
  }

  appendToNode(node) {
    node.appendChild(this.title);
    return this;
  }

  positionAboveNextSibling() {
    const { top } = this.title.nextSibling.getBoundingClientRect();
    this.title.style.transform = `translateY(calc(${top}px + 0.3em))`;
  }
}

export default Title;
