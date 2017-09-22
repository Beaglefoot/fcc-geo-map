/* eslint no-unused-vars: off */
const d3 = require('d3');
const topojson = require('topojson');

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
const width = d3.min([window.innerWidth, 1200]);
const height = d3.min([window.innerHeight - 5, 800]);
const radius = height / 2 - 5;
const scale = radius;
const rotationModifier = 0.15;



const app = document.getElementById('app');
const canvas = d3.select('#app').append('canvas')
  .attr('width', width)
  .attr('height', height);

const context = canvas.node().getContext('2d');

const projection = d3.geoOrthographic()
  .translate([width / 2, height / 2])
  .scale(scale)
  .clipAngle(90);

const path = d3.geoPath()
  .projection(projection)
  .context(context);



import('./world-110m').then(world => {
  const land = topojson.feature(world, world.objects.land);

  const drawWorld = () => {
    context.beginPath();
    path(land);
    context.fill();
  };

  const drawBorder = () => {
    context.beginPath();
    context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
    context.lineWidth = 2.5;
    context.stroke();
  };

  context.clearRect(0, 0, width, height);
  drawWorld();
  drawBorder();

  const rotate = (() => {
    let accumulatedRotation = 0;

    return x => {
      accumulatedRotation += x * rotationModifier;

      context.clearRect(0, 0, width, height);
      projection.rotate([accumulatedRotation, 0]);

      drawWorld();
      drawBorder();
    };
  })();

  canvas.call(
    d3.drag()
      .on('start', () => console.log('drag start'))
      .on('drag', () => rotate(d3.event.dx))
      .on('end', () => console.log('drag end'))
  );
});
