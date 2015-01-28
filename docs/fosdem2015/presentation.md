# Manylines
###in one line
a web application to storify a network
---
## médialab Sciences Po
Research center led by Bruno Latour specialized in studying society through digital traces.

[medialab.sciences-po.fr](http://www.medialab.sciences-po.fr)
#### speakers
- Paul Girard, technical director
- Mathieu Jacomy, research engineer specialized in web mining
- Guillaume Plique, full stack developer

---
<!-- .slide: data-background="#f0f0f0" -->
## we love networks
- we work with social scientists
- we love networks
- we do Visual Network Analysis
---
<!-- .slide: data-background="#f0f0f0" -->
## we help researchers play with data
- table2net
- sciencescape
- hyphe
- artoo.js
- ANTA

tools map?

---
## Visual Network Analysis
Network Visualisation to do exploratory data analysis!

- using Gephi
- using sigma.js (see Alexis' talk in one hour)
- agent smith
- manylines
---
## Visual Network Analysis
Key is spacialisation algorithm
Mathieu designed ForceAtlas 2 (PlosOne)

---
## First problem manylines solves
visualize networks on the web...
...without coding
---
## Second problem manylines solves
network visualisation is great for people who build the network
How to share your findings on a network visually?

And without showing the whole complexity at once!
---
## let's explore the wikipedia seealso "sexual deviance" graph

---
## Stack
- couchbase (yep we loved their presentation at FOSDEM 2014)
- node.js / express
- domino.js + handlebars.js
- sigma.js
---
### Scaling ForceAtlas 2 for the web
#### Web workers
workers
- using **web workers** so the computations are not done by the UI thread
- using **transferables** to perform zero-copy data transfer between UI and worker
---
### Scaling ForceAtlas 2 for the web
#### low-level
- working over a byte array representation of nodes and edges
- avoiding the **new** keyword to dodge browser implementation's quirks
- dropping any dynamic structures and functions
---
### Scaling ForceAtlas 2 for the web
#### Iterative Barnes-Hut
- building an iterative version of the Barnes-Hut optimization
---
## future
- complete web interface refacto and redesign
- impressed by odyssey.js storytelling design
- moving to react and baobab.js
- any ideas?
