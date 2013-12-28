RDF annotation of SVG diagrams for RF systems
=============================================

Introduction
------------


Tools
-----
SVG files can be converted with Inkscape or librsvg (live.gnome.org/LibRsvg):

	rsvg-convert example.svg > example.png

Extracting the RDF metadata from SVG file can be done with the tool provided by librdf(http://librdf.org/raptor/)

	rapper -f scanForRDF=1 example.svg
