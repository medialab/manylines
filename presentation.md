
# Manylines
### in one line
web app to storify a network

---
<!-- .slide: data-background="9C291A" -->
![médialab's logo](resources/logo_medialab.png)

Research center led by Bruno Latour
specialized in studying society through digital traces.

[medialab.sciences-po.fr](http://www.medialab.sciences-po.fr)

---
<!-- .slide: data-background="9C291A" -->
### Speakers
- Paul Girard - *CTO*
- Mathieu Jacomy - *digital methods research engineer*
- Guillaume Plique - *développeur bonheur a.k.a. superhero developer*

---
<!-- .slide: data-background="9C291A" -->>
## We love networks
- We work with social scientists
- We love networks
- We do Visual Network Analysis

---
<!-- .slide: data-background="9C291A" -->
Note: we help researchers play with data
- table2net
- sciencescape
- hyphe
- artoo.js
- ANTA

---
<!-- .slide: data-background="9C291A" -->
## Visual Network Analysis
Network Visualisation to do Exploratory Data Analysis!

- [gephi.org](http://gephi.org) : Java Desktop Application
- [sigma.js](http://sigmajs.org) : Javascript Network Visualisation library
  => *attend Alexis' talk in an hour!*
- agent smith : to-be-released Neo4J visual admin webapp
- [manylines](http://tools.medialabs.sciences-po.fr/manylines) : a web application to storify a network

---
<!-- .slide: data-background="9C291A" -->
## Visual Network Analysis
- Key is spatialization algorithm
- Mathieu designed ForceAtlas 2 ([PlosOne](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679))

---
<!-- .slide: data-background="9C291A" -->
## First problems
- How to visualize networks
- ...on the web
- ...without coding

---
<!-- .slide: data-background="9C291A" -->
## Additionnal problem
Network storytelling

---
<!-- .slide: data-background="9C291A" -->
## let's explore the wikipedia *see-also* "sex behaviours" graph
- choose one or many wikipedia page, yes, manually
- follow the *see-also* links in wikipedia
- for as many depth as you want
- filter the results, yes, manually
- create a *see-also* network


---

<!-- .slide: data-background-iframe="http://tools.medialab.sciences-po.fr/manylines/embed#/narrative/290135dd-49a6-4a8e-a730-1e7c8c9c7bb2" -->

---
<!-- .slide: data-background="9C291A" -->
# Disclaimer
Nothing I said here is sociology.  
It's a tool, let's use it together !

---
<!-- .slide: data-background="9C291A" -->
# How did we **do** that ?

[let me give you a tour of the admin page](http://tools.medialab.sciences-po.fr/manylines/)

---

<!-- .slide: data-background="792F21" -->
## How did we **build** that
- Couchbase (yep we loved their presentation at FOSDEM 2014)
- Node.js / express
- Domino.js + handlebars.js
- Sigma.js

---

<!-- .slide: data-background="792F21" -->
## Scaling graphs for the web is hard

---

<!-- .slide: data-background="792F21" -->
## ForceAtlas 2
- Live layout
- Efficient on 10 to 10,000 nodes
- Minimal settings

---

<!-- .slide: data-background="C12B18" -->
### Scaling ForceAtlas for the web
#### Web workers

- Using [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/basic_usage) so the computations are not done in the UI thread.
- Using [transferables](https://developer.mozilla.org/fr/docs/Web/API/Transferable) to perform zero-copy data transfer between UI and worker.

Note: To be able to use transferables, we need to pass byte arrays. Good, this will lead us to our second point: low-level coding.

---

<!-- .slide: data-background="C12B18" -->
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

<!-- .slide: data-background="C12B18" -->
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

<!-- .slide: data-background="C12B18" -->
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
<!-- .slide: data-background="C12B18" -->
### Scaling ForceAtlas for the web
#### Barnes-Hut Optimization

- Repulsion from *n²* to *n.log(n)*
- Approximation disturbs the convergence (swinging)
- Relevant starting from ~250 nodes

---
<!-- .slide: data-background="792F21" -->

### Scaling ForceAtlas for the web
#### Iterative Barnes-Hut

```js
// Building the Barnes-Hut root region
RegionMatrix[rp(0, 'node')] = -1;
RegionMatrix[rp(0, 'centerX')] = (minX + maxX) / 2;
RegionMatrix[rp(0, 'centerY')] = (minY + maxY) / 2;
RegionMatrix[rp(0, 'size')] = Math.max(maxX - minX, maxY - minY);
RegionMatrix[rp(0, 'nextSibling')] = -1;
RegionMatrix[rp(0, 'firstChild')] = -1;
RegionMatrix[rp(0, 'mass')] = 0;
RegionMatrix[rp(0, 'massCenterX')] = 0;
RegionMatrix[rp(0, 'massCenterY')] = 0;
```

---
<!-- .slide: data-background="792F21" -->
### ForceAtlas 2

<a href="yeoldeforce.html" target="_blank"><h4>Before</h4></a>

---
<!-- .slide: data-background="792F21" -->
### ForceAtlas2

<a href="force.html" target="_blank"><h4>After</h4></a>

---
<!-- .slide: data-background="9C291A" -->
## The future!

- Complete UI refactoring and redesign
- Impressed by [oddysey.js](http://cartodb.github.io/odyssey.js) storytelling and design
- Moving to react and baobab.js
- Any ideas?
