/* eslint no-unused-vars: off */
import {
  svg as svgClass,
  water,
  globe as globeClass,
  land as landClass,
  meteorite,
  graticule as graticuleClass
} from './index.scss';

const d3 = require('d3');
window.d3 = d3;
const topojson = require('topojson');

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
const width = d3.min([window.innerWidth, 1200]);
const height = d3.min([window.innerHeight - 5, 800]);
const radius = height / 2 - 5;
const scale = radius;
const rotationModifier = 0.15;
const graticuleStep = 30;

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



const app = document.getElementById('app');
const svg = d3.select(
  document.createElementNS('http://www.w3.org/2000/svg', 'svg')
);

svg
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', `0 0 ${width} ${height}`)
  .classed(svgClass, true);

app.appendChild(svg.node());

const projection = d3.geoOrthographic()
  .translate([width / 2, height / 2])
  .scale(scale)
  .clipAngle(90);

const path = d3.geoPath(projection);
const circle = d3.geoCircle();
const graticule = d3.geoGraticule().step([graticuleStep, graticuleStep]);



fetch(url)
  .then(response => response.json())
  .then(({ features: meteorites }) => (
    meteorites = meteorites.filter(({ geometry }) => geometry).filter((_, i) => !(i % 6))
  ))
  .then(meteorites => new Promise(resolve => (
    import('./world-110m').then(world => resolve({ meteorites, world }))
  )))
  .then(({ meteorites, world }) => {
    const land = topojson.feature(world, world.objects.countries);
    const masses = meteorites.map(m => parseInt(m.properties.mass));

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

      globe.datum(land)
        .append('path')
        .attr('d', path)
        .classed(landClass, true);

      globe
        .selectAll().data(meteorites)
        .enter().append('path')
        .classed(meteorite, true)
        .attr('d', d => path(
          circle.center(d.geometry.coordinates)
            .radius(radiusScale(d.properties.mass))()
        ));

      globe.selectAll()
        .data(graticule.lines)
        .enter().append('path')
        .attr('d', path)
        .classed(graticuleClass, true);

      return globe;
    };

    let globe = drawWorld();

    const rotate = (x, y) => {
      const accumulatedRotation = projection.rotate();
      accumulatedRotation[0] += x * rotationModifier;
      accumulatedRotation[1] -= y * rotationModifier;

      const accumulatedZoom = globe.select(':first-child').attr('transform');
      globe.remove();
      projection.rotate(accumulatedRotation);
      globe = drawWorld();

      globe.selectAll('*').attr('transform', accumulatedZoom);
    };

    const move = ((accumulatedOffset = [0, 0]) => (x, y) => {
      accumulatedOffset[0] -= x;
      accumulatedOffset[1] -= y;
      svg.attr('viewBox', `${accumulatedOffset[0]} ${accumulatedOffset[1]} ${width} ${height}`);
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
  });
