RDF annotation of SVG diagrams for RF systems
=============================================

Introduction
------------
The SVG standard allows for RDF metadata to be inserted inside a document (inside svg:metadata), this project aims at adding a consistent description to a schematic representing an RF (Radio Frequency) system. 
The first stage is to define a schema to represent all the building blocks of a system (source, sink, filter,...).
We will investigate tools to edit the SVG document and its metadata.

RDF Schema
----------

Lines vs components
-------------------
Once components are put into place they need to be connected with lines, the natural candidates are svg:line or svg:path but unfortunately SVG does not allow URI's to be used as location (see http://tavmjong.free.fr/SVG/CONNECTORS/index.xhtml for how that feature could be added to SVG), so a SVG renderer must be used to deteremine the absolute location of rf:Port and draw the paths.

Tools
-----
SVG files can be converted with Inkscape or librsvg (live.gnome.org/LibRsvg):

	rsvg-convert example.svg > example.png

Extracting the RDF metadata from SVG file can be done with the tool provided by librdf(http://librdf.org/raptor/)

	rapper -f scanForRDF=1 example.svg
