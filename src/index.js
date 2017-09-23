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



const app = document.getElementById('app');
const svg = d3.select(
  document.createElementNS('http://www.w3.org/2000/svg', 'svg')
);

svg
  .attr('width', width)
  .attr('height', height)
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

      globe.append('circle')
        .classed(water, true)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
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
    };

    drawWorld();

    const rotate = (() => {
      let accumulatedRotation = { x: 0, y: 0 };

      return (x, y) => {
        accumulatedRotation.x += x * rotationModifier;
        accumulatedRotation.y -= y * rotationModifier;

        svg.select(`.${globeClass}`).remove();
        projection.rotate([accumulatedRotation.x, accumulatedRotation.y]);
        drawWorld();
      };
    })();

    svg.call(
      d3.drag()
        .on('drag', () => rotate(d3.event.dx, d3.event.dy))
    );
  });
