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

SVG and RDF
-----------
SVG has a powerful tool for element reuse: svg:symbol and svg:use, first an image is defined then it can be reused anywhere in the document. Here is an example of a simple component, a generic box with one input and one output:
```xml
	<symbol id='port'>
		<metadata>
			<rdf:RDF>
				<rf:Port rdf:about='#port'/>
			</rdf:RDF>
		</metadata>
		<circle r='3'/>
	</symbol>
	<symbol id='component'>
		<metadata>
			<rdf:RDF>
				<rdf:Description rdf:about='#component'>
					<rdfs:type rdf:resource='http://www.example.org/rf#Component'/>
					<rf:input rdf:resource='#in'/>
					<rf:output rdf:resource='#out'/>
				</rdf:Description>	
			</rdf:RDF>
		</metadata>
		<!-- now the graphical representation of the component -->
		<rect width="200" height="200" transform="translate(-100,-100)"/>
		<use xlink:href="#port" x="-100" id='in'/>
		<use xlink:href="#port" x="100" id='out'/>
	</symbol>
```

A few observations:

* resource #component uses 2 #port located in the middle of the left and right side
* rf:Port and rf:Component are rdfs classes defined in schematic.rdf
* size (200x200) is arbitrary, it can be scale in the svg:use transform statement

Let us now use the symbol:
```xml
	<g>
		<use xlink:href='#component' transform='translate(100,100) scale(0.5)' id='comp_0'/>
		<use xlink:href='#component' transform='translate(300,100) scale(0.5)' id='comp_1'/>
	</g>
```
The next stage is to connect those two components together through a line (the nature of the line, coax or waveguide is left undefined at this stage), the natural SVG elements to represent such a line are svg:line or, more powerful svg:path.   
Computing the origin and destination is fairly challenging, the 3x3 transform matrix needs to be taken into account:
```xml 
	<g>
		<use xlink:href='#component' transform='scale(0.5)' id='comp_0'/>
		<path d='M50,0L350,0' id='line_0_1'/>
		<use xlink:href='#component' transform='translate(300) scale(0.5)' id='comp_1'/>
	</g>
```
Better is to add the metadata and have a program create the SVG element for us:
```xml
	<g>
		<metadata>
			<rdf:RDF>
				<rf:Line rdf:about='#line_0_1'>
					<rf:port rdf:resource='#comp_0_output'/>
					<rf:port rdf:resource='#comp_1_input'/>
				</rf:Line>
			</rdf:RDF>
		</metadata>
		<use xlink:href='#component' transform='scale(0.5)' id='comp_0'/>
		<use xlink:href='#component' transform='translate(300) scale(0.5)' id='comp_1'/>
	</g>
```
Note the two resources #comp_0_output and #comp_1_output must exist before processing the statement, it is the responsibility of the program.   

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

It will scan the whole document for any rdf:RDF element and return all the triples.

Appendix
--------
When loading files from the local file system Chrome needs to be started with a special flag:

	google-chrome --allow-file-access-from-files & 2> /dev/null
