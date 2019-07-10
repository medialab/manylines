const sqlite3 = require('sqlite3');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const DB = new sqlite3.Database('./manylines.sqlite');

fs.ensureDirSync('./dump');
fs.ensureDirSync('./dump/spaces');
fs.ensureDirSync('./dump/graphs');
fs.ensureDirSync('./dump/narratives');

function each(query, callback, complete) {
  DB.serialize(() => {
    DB.each(query, callback, complete);
  });
}

async.series({
  graphs(next) {
    console.log('Fetching graph data...');
    each(`SELECT key, val from cbb_msg WHERE val LIKE '%"type":"graph"%'`, (err, row) => {
      if (err)
        return next(err);

      fs.writeFileSync(path.join('./dump', 'graphs', row.key.toString('utf-8') + '.json'), row.val);
    }, next);
  },

  spaces(next) {
    console.log('Fetching space data...');
    each(`SELECT key, val from cbb_msg WHERE val LIKE '%"type":"space"%'`, (err, row) => {
      if (err)
        return next(err);

        fs.writeFileSync(path.join('./dump', 'spaces', row.key.toString('utf-8') + '.json'), row.val);
    }, next);
  },

  narratives(next) {
    console.log('Fetching narrative data...');
    each(`SELECT key, val from cbb_msg WHERE val LIKE '%"type":"narrative"%';`, (err, row) => {
      if (err)
        return next(err);

        fs.writeFileSync(path.join('./dump', 'narratives', row.key.toString('utf-8') + '.json'), row.val);
    }, next);
  }
}, err => {
  DB.close();

  if (err)
    return console.error(err);
});
