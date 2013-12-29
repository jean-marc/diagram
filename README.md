RDF annotation of SVG diagrams for RF systems
=============================================
<!--
does not work, should use <object data=''/> instead
<img src='example.svg' alt='example.svg'/>
-->
<object type='svg+xml' data='example.svg' height='1000' width='1000'/>
Introduction
------------
The SVG standard allows for RDF metadata to be inserted inside a document (inside svg:metadata), this project aims at adding a consistent description to a schematic representing an RF (Radio Frequency) system. 
The first stage is to define a schema to represent all the building blocks of a system (source, sink, filter,...).
We will investigate tools to edit the SVG document and its metadata.

RDF Schema
----------

Lines vs components
-------------------
Once components are put into place they need to be connected with lines, the natural candidates are svg:line or svg:path but unfortunately SVG does not allow URI's to be used as location (see http://tavmjong.free.fr/SVG/CONNECTORS/index.xhtml for how that feature could be added to SVG), so a SVG renderer must be used to determine the absolute location of rf:Port and draw the paths.
The RDF document must be queried to find all the rf:Line and their respective rf:Port.

	PREFIX rf:<http://www.example.org/rf#> 
	SELECT * WHERE { ?s a rf:Line;rf:port ?p }

At this stage there is no sanity check on the result (there should be one input and one output).


Tools
-----
SVG files can be converted with Inkscape or librsvg (http://live.gnome.org/LibRsvg):

	rsvg-convert example.svg > example.png

Extracting the RDF metadata from SVG file can be done with the tool provided by librdf(http://librdf.org/raptor/)

	rapper -f scanForRDF=1 example.svg

Appendix
--------
When loading files from the local file system Chrome needs to be started with a special flag:

	google-chrome --allow-file-access-from-files & 2> /dev/null
