
# Manylines
###in one line
a web application to storify a network

---

![médialab's logo](resources/logo_medialab.png)

Research center led by Bruno Latour  
specialized in studying society through digital traces.

[medialab.sciences-po.fr](http://www.medialab.sciences-po.fr)

---

### speakers
- Paul Girard - *CTO*
- Mathieu Jacomy - *digital methods research engineer*
- Guillaume Plique - *superhero developer*

---

<!-- .slide: data-background="#f0f0f0" -->
## we love networks
- we work with social scientists
- we love networks
- we do Visual Network Analysis

---

<!-- .slide: data-background="resources/our_tools.png" -->

Note: we help researchers play with data
- table2net
- sciencescape
- hyphe
- artoo.js
- ANTA

---

## Visual Network Analysis
Network Visualisation to do exploratory data analysis!

- [gephi.org](http://gephi.org) : Java Desktop Application
- [sigma.js](http://sigmajs.org) : Javascript Network Visualisation library  
  => *attend Alexis's talk in an hour!* 
- agent smith : to-be-released Neo4J visual admin webapp
- [manylines](http://tools.medialabs.sciences-po.fr/manylines) : a web application to storify a network

---

## Visual Network Analysis
Key is spacialisation algorithm
Mathieu designed ForceAtlas 2 (PlosOne)

---

## First problem
visualize networks

on the web

without coding

---

## Second problem
network storytelling

---

## let's explore the wikipedia seealso "sexual deviance" graph

---

## network story telling

---

## Stack

- couchbase (yep we loved their presentation at FOSDEM 2014)
- node.js / express
- domino.js + handlebars.js
- sigma.js

---

## Scaling graphs for the web is hard

---

## ForceAtlas 2

---

### Scaling ForceAtlas for the web
#### Web workers

- using [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/basic_usage) so the computations are not done in the UI thread.
- using [transferables](https://developer.mozilla.org/fr/docs/Web/API/Transferable) to perform zero-copy data transfer between UI and worker.

Note: To be able to use transferables, we need to pass byte arrays. Good, this will lead us to our second point: low-level coding.

---

### Scaling ForceAtlas for the web
#### low-level

*Working over a byte array representation of nodes and edges*

```js
var nodesByteArray = new Float32Array(nbytes);

for (i = j = 0, l = nodes.length; i < l; i++) {
  nodesByteArray[j] = nodes[i].x;
  nodesByteArray[j + 1] = nodes[i].y;
  nodesByteArray[j + 2] = 0;
  nodesByteArray[j + 3] = 0;
  nodesByteArray[j + 4] = 0;
  nodesByteArray[j + 5] = 0;
  nodesByteArray[j + 6] = 1 + graph.degree(nodes[i].id);
  nodesByteArray[j + 7] = 1;
  nodesByteArray[j + 8] = nodes[i].size;
  nodesByteArray[j + 9] = 0;
  j += propertiesCount;
}
```

---

### Scaling ForceAtlas for the web
#### low-level

*Repressing from instantiating too much*

```js
if (adjustBySize) {
  if (logAttr) {
    if (distributedAttr) {
      return new this.logAttr_degreeDistributed_antiCollision(c);
    } else {
      return new this.logAttr_antiCollision(c);
    }
  } else {
    if (distributedAttr) {
      return new this.linAttr_degreeDistributed_antiCollision(c);
    } else {
      return new this.linAttr_antiCollision(c);
    }
  }
}
```

---

### Scaling ForceAtlas for the web
#### low-level

*Dynamic structures and functions considered harmful*

```js
// Accessing matrices with some sugar was slowing us down
NodeMatrix[np(n, 'dx')] += xDist * factor;
NodeMatrix[np(n, 'dy')] += yDist * factor;

// So let's crush that!
function crush(fnString) {
  for (var i = 0, l = np.length; i < l; i++) {
    var p = new RegExp('np\\(([^,]*), \'' + np[i] + '\'\\)', 'g');
    fnString = fnString.replace(
      p,
      (i === 0) ? '$1' : '$1 + ' + i
    );
  }
  return fnString;
}
```

Note: Here the new problem was that our Barnes-Hut optimization is recursive and cannot work without functions. This meant that running the algorithm with the optimizations was actually slowing it down. Time for an iterative version of the algorithm.

---

### Scaling ForceAtlas for the web
#### Iterative Barnes-Hut

- Barnes-Hut optimization presentation: Matthieu?
- building an iterative version of the Barnes-Hut optimization

---

### ForceAtlas 2

<a href="yeoldeforce.html" target="_blank"><h4>Before</h4></a>

---

### ForceAtlas2

<a href="force.html" target="_blank"><h4>After</h4></a>

---

## The future!

- Complete UI refactoring and redesign
- Impressed by oddysey.js storytelling and design
- Moving to react and baobab.js
- Any ideas?
