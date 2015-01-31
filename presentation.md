
# Manylines
### in one line
web app to storify a network

---

![médialab's logo](resources/logo_medialab.png)

Research center led by Bruno Latour
specialized in studying society through digital traces.

[medialab.sciences-po.fr](http://www.medialab.sciences-po.fr)

---

### Speakers
- Paul Girard - *CTO*
- Mathieu Jacomy - *digital methods research engineer*
- Guillaume Plique - *développeur bonheur*

---

## We love networks
- We work with social scientists
- We love networks
- We do Visual Network Analysis

---
<!-- .slide: data-background="resources/our_tools.png" -->

Note: we help researchers play with data
- table2net
- sciencescape
- hyphe
- artoo.js
- ANTA

---
<!-- .slide: data-background="#F0F8F8" -->

## Visual Network Analysis
- Use a spatialization algorithm (structure)
- Visualize categories as colors (content)
- Search for structure-content matchings

---
<!-- .slide: data-background="#F0F8F8" -->

## Visual Network Analysis
Network Visualisation to do Exploratory Data Analysis!

- [gephi.org](http://gephi.org) : Java Desktop Application
- [sigma.js](http://sigmajs.org) : Javascript Network Visualisation library  
  => *attend Alexis' talk in an hour!*
- agent smith : to-be-released Neo4J visual admin webapp
- [manylines](http://tools.medialabs.sciences-po.fr/manylines) : a web application to storify a network



---
<!-- .slide: data-background="#F0F8F8" -->
## First problems
- How to visualize networks
- ...on the web
- ...without coding

---

<!-- .slide: data-background="#F0F8F8" -->
## Additionnal problem
Network storytelling

---

## let's explore the wikipedia *see-also* "sex behaviours" graph
- choose one or many wikipedia page, yes, manually
- follow the *see-also* links in wikipedia
- for as many depth as you want
- filter the results, yes, manually
- create a *see-also* network


---

<!-- .slide: data-background-iframe="http://tools.medialab.sciences-po.fr/manylines/embed#/narrative/290135dd-49a6-4a8e-a730-1e7c8c9c7bb2" -->

[manylines' slideshow](http://tools.medialab.sciences-po.fr/manylines/embed#/narrative/290135dd-49a6-4a8e-a730-1e7c8c9c7bb2)

---

# Disclaimer
Nothing I said here is sociology.  
It's a tool, let's use it together!

---

# How did we **do** that?

[let me give you a tour of the admin page](http://tools.medialab.sciences-po.fr/manylines/)

---

## How did we **build** that?
- Couchbase  
  *yep we loved their presentation at FOSDEM 2014*
- Node.js / express
- Domino.js + handlebars.js
- Sigma.js

---
<!-- .slide: data-background="#F0F8F8" -->

## Scaling graphs for the web is hard

---
<!-- .slide: data-background="#F0F8F8" -->

## ForceAtlas 2

- Live layout
- Efficient on 10 to 10,000 nodes
- Minimal settings
- Mathieu designed it ([PlosOne](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679))

---

### Scaling ForceAtlas for the web
#### Web workers

- Using [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/basic_usage) so the computations are not done in the UI thread.
- Using [transferables](https://developer.mozilla.org/fr/docs/Web/API/Transferable) to perform zero-copy data transfer between UI and worker.

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
<!-- .slide: data-background="#F0F8F8" -->

### Scaling ForceAtlas for the web
#### Barnes-Hut Optimization

- Repulsion from *n²* to *n.log(n)*
- Approximation disturbs the convergence (swinging)
- Relevant starting from ~250 nodes

---

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

### ForceAtlas 2

<a href="yeoldeforce.html" target="_blank"><h4>Before</h4></a>

---

### ForceAtlas 2

<a href="force.html" target="_blank"><h4>After</h4></a>

---
<!-- .slide: data-background="#F0F8F8" -->

## The future!

- Complete UI refactoring and redesign
- Impressed by [oddysey.js](http://cartodb.github.io/odyssey.js) storytelling and design
- Moving to react and baobab.js
- Any ideas?
