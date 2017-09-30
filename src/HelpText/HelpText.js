import { help } from './HelpText.scss';

class HelpText {
  constructor() {
    this.helpText = document.createElement('div');
    this.helpText.classList.add(help);
  }

  appendToNode(node) {
    node.appendChild(this.helpText);
    return this;
  }

  insertNextToNode(node) {
    node.parentNode.insertBefore(this.helpText, node.nextSibling);
    return this;
  }

  positionAbovePreviousSibling() {
    const { right, width, height, top } = this.helpText.previousSibling.getBoundingClientRect();
    const isParentFlex = getComputedStyle(this.helpText.parentNode).display === 'flex';
    if (!isParentFlex) {
      this.helpText.style.transform = `translate(calc(${right}px - 100%), calc(-100% - 0.3em))`;
    }
    else {
      this.helpText.style.transform = `translate(calc(${width / 2}px - 50%), calc(${height + top}px - 100%))`;
    }
    return this;
  }

  addTextLine(text) {
    const line = document.createElement('div');
    line.innerHTML = text;
    this.helpText.appendChild(line);
    return this;
  }

  addMultipleTextLines(lines) {
    lines.forEach(line => this.addTextLine(line));
    return this;
  }

  addClass(className) {
    this.helpText.classList.add(className);
    return this;
  }
}

export default HelpText;
