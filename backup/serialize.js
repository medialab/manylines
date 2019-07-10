// NOTE: you should dump before!
const path = require('path');
const glob = require('glob');
const keyBy = require('lodash/keyBy');
const fs = require('fs-extra');

fs.ensureDirSync(path.join('dump', 'payloads'));

function isNarrativeOfAnyInterest(data) {
  if (!data.slides || !data.slides.length)
    return false;

  if (data.slides.every(slide => !slide.text.trim() && slide.title === 'Slide Title'))
    return false;

  return true;
}

let n = 0;
glob.sync(path.join('dump', 'narratives', '*.json')).forEach(p => {
  const data = fs.readJSONSync(p);

  if (!isNarrativeOfAnyInterest(data))
    return;

  const payload = {
    narrative: data
  };

  const version = data.version;

  const spaceData = fs.readJSONSync(path.join('dump', 'spaces', `${data.space}.json`));

  payload.meta = spaceData.graphs[version].meta;

  const graphId = spaceData.graphs[version].id;

  const graphData = fs.readJSONSync(path.join('dump', 'graphs', `${graphId}.json`));

  payload.graph = {
    nodes: graphData.nodes,
    edges: graphData.edges
  };

  payload.snapshots = keyBy(spaceData.graphs[version].snapshots, 'id');

  fs.writeJSONSync(path.join('dump', 'payloads', path.basename(p)), payload);

  n += 1;
});

console.log(n);
