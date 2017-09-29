import round from 'lodash/round';
import debounce from 'lodash/debounce';

import {
  svg as svgClass,
  water,
  globe as globeClass,
  land as landClass,
  meteorite,
  graticule as graticuleClass,
  helpText,
  slider
} from './index.scss';

import Loading from './Loading/Loading';
import Tooltip from './Tooltip/Tooltip';
import RangeSlider from './RangeSlider/RangeSlider';
import HelpText from './HelpText/HelpText';
import Footer from './Footer/Footer';

const d3 = require('d3');
const topojson = require('topojson');

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
const getWidth  = () => d3.min([window.innerWidth, 1200]);
const getHeight = () => d3.min([window.innerHeight - 5, 800]);
const radius = getHeight() / 2 - 5;
const scale = radius;
const rotationModifier = 0.15;
const graticuleStep = 30;
const initialYearFilter = [1960, (new Date).getFullYear()];

const ctrlKey = (() => {
  let isHoldingCtrlKey = false;

  return {
    isHeld: () => isHoldingCtrlKey,
    setState: isHeld => isHoldingCtrlKey = isHeld
  };
})();

const handleCtrlKey = event => ctrlKey.setState(event.ctrlKey);

addEventListener('keydown', handleCtrlKey);
addEventListener('keyup', handleCtrlKey);


const tooltipCache = {};
const clearTooltipCache = () => (
  Object.keys(tooltipCache).forEach(name => {
    tooltipCache[name].hide();
    delete tooltipCache[name];
  })
);



const app = document.getElementById('app');
const loading = new Loading();
loading.appendToNode(app).startAnimation();
new Footer().appendToDocument();

const svg = d3.select(
  document.createElementNS('http://www.w3.org/2000/svg', 'svg')
);

svg
  .attr('width', getWidth())
  .attr('height', getHeight())
  .attr('viewBox', `0 0 ${getWidth()} ${getHeight()}`)
  .classed(svgClass, true);


const projection = d3.geoOrthographic()
  .translate([getWidth() / 2, getHeight() / 2])
  .scale(scale)
  .clipAngle(90);

const path = d3.geoPath(projection);
const circle = d3.geoCircle();
const graticule = d3.geoGraticule().step([graticuleStep, graticuleStep]);



const buildMappedGlobe = ({ meteorites, world }) => {
  loading.removeFromNode(app);
  app.appendChild(svg.node());

  const land = topojson.feature(world, world.objects.countries);
  const masses = meteorites.map(m => parseInt(m.properties.mass));

  const filterMeteorites = (yearsRange = [0, (new Date).getFullYear()]) => (
    meteorites.filter(
      ({ properties: { year }}) => year >= yearsRange[0] && year <= yearsRange[1]
    )
  );

  let filteredMeteorites = filterMeteorites(initialYearFilter);

  const radiusScale = d3.scalePow()
    .domain([d3.min(masses), d3.max(masses)])
    .range([0.4, 10])
    .exponent(0.55);

  const drawWorld = () => {
    const globe = svg.append('g').classed(globeClass, true);
    const translation = projection.translate();

    globe.append('circle')
      .classed(water, true)
      .attr('cx', translation[0])
      .attr('cy', translation[1])
      .attr('r', radius);

    globe
      .append('path')
      .attr('d', path(land))
      .classed(landClass, true);

    globe
      .selectAll().data(filteredMeteorites)
      .enter().append('path')
      .classed(meteorite, true)
      .attr('d', d => path(
        circle.center(d.geometry.coordinates)
          .radius(radiusScale(d.properties.mass))()
      ))
      .on('mouseover', ({ properties: {
        mass,
        name,
        recclass,
        reclat,
        reclong,
        year
      }}) => {
        const { x, y } = d3.event;
        if (!tooltipCache[name]) {
          tooltipCache[name] = new Tooltip()
            .setPosition(x + 15, y)
            .setContent([
              `<strong>Location:</strong> ${name}`,
              `<strong>Class:</strong> ${recclass}`,
              `<strong>Coordinates:</strong> ${round(reclat, 3)}°, ${round(reclong, 3)}°`,
              `<strong>Mass:</strong> ${mass}`,
              `<strong>Year:</strong> ${year}`
            ].join('<br>'))
            .show();
        }
      })
      .on('mouseout', ({ properties: { name }}) => {
        tooltipCache[name].hide();
        delete tooltipCache[name];
      });

    globe.selectAll()
      .data(graticule.lines)
      .enter().append('path')
      .attr('d', path)
      .classed(graticuleClass, true);

    return globe;
  };

  let globe = drawWorld();

  const redrawWorld = () => {
    const accumulatedZoom = globe.select(':first-child').attr('transform');
    globe.remove();
    globe = drawWorld();
    globe.selectAll('*').attr('transform', accumulatedZoom);
  };

  const rotate = (x, y) => {
    clearTooltipCache();

    const accumulatedRotation = projection.rotate();
    accumulatedRotation[0] += x * rotationModifier;
    accumulatedRotation[1] -= y * rotationModifier;

    projection.rotate(accumulatedRotation);
    redrawWorld();
  };

  const move = ((accumulatedOffset = [0, 0]) => (x, y) => {
    accumulatedOffset[0] -= x;
    accumulatedOffset[1] -= y;
    svg.attr('viewBox', `${accumulatedOffset[0]} ${accumulatedOffset[1]} ${getWidth()} ${getHeight()}`);
  })();

  svg.call(
    d3.drag()
      .on('drag', () => (
        ctrlKey.isHeld() ? move(d3.event.dx, d3.event.dy) : rotate(d3.event.dx, d3.event.dy)
      ))
  );

  svg.call(
    d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', () => globe.selectAll('*').attr('transform', d3.event.transform))
  );

  const onYearsChange = yearsRange => {
    filteredMeteorites = filterMeteorites(yearsRange);
    redrawWorld();
  };

  const rangeSlider = new RangeSlider({
    lowValue: initialYearFilter[0],
    highValue: initialYearFilter[1],
    min: d3.min(meteorites.map(m => m.properties.year)),
    max: (new Date).getFullYear(),
    callback: debounce(onYearsChange, 50)
  })
    .appendToNode(app)
    .addClass(slider);

  const help = new HelpText()
    .insertNextToNode(svg.node())
    .addMultipleTextLines([
      'Rotate with Left Mouse Button',
      'Zoom with Scroll',
      'Drag with Left Mouse Button holding Ctrl'
    ])
    .positionAbovePreviousSibling()
    .addClass(helpText);

  window.addEventListener('resize', () => {
    svg.attr('width', getWidth()).attr('height', getHeight());
    help.positionAbovePreviousSibling();
    rangeSlider.reinit();
  });
};



fetch(url)
  .then(response => {
    if (response.status >= 200 && response.status < 300) return response;
    else {
      const error = new Error(`${response.status} ${response.statusText}`);
      throw error;
    }
  })
  .then(response => response.json())
  .then(({ features: meteorites }) => (
    meteorites.filter(m => m.geometry && m.properties.year && m.properties.mass)
    // Prevent overlapping of small meteorites by big ones
      .sort((a, b) => b.properties.mass - a.properties.mass)
      .map(m => {
        m.properties.year = parseInt(m.properties.year.substr(0, 4));
        m.properties.mass = parseInt(m.properties.mass);
        return m;
      })
  ))
  .then(meteorites => new Promise(resolve => (
    import('./world-110m').then(world => resolve({ meteorites, world }))
  )))
  .then(buildMappedGlobe)
  .catch(({ message }) => app.textContent = message);
