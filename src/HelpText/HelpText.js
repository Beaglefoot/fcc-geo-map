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
    const { right } = this.helpText.previousSibling.getBoundingClientRect();
    this.helpText.style.transform = `translate(calc(${right}px - 100%), calc(-100% - 0.3em))`;
    return this;
  }

  addTextLine(text) {
    const line = document.createElement('div');
    line.appendChild(document.createTextNode(text));
    this.helpText.appendChild(line);
    return this;
  }

  addMultipleTextLines(lines) {
    lines.forEach(line => this.addTextLine(line));
    return this;
  }
}

export default HelpText;
