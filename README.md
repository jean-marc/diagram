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
This tool can be used to generate nice graphics (thanks to the power of CSS) but also offer an interactive display of the diagram: information can be displayed by hovering the mouse above an element, incremental views of components (look inside the box). Lastly the diagram can be queried as a database: which components are connected to component X, list all the couplers present in the system, etc...
We will investigate tools to edit the SVG document and its metadata.

SVG and RDF
-----------
SVG has a powerful tool for element reuse: svg:symbol and svg:use, first an image is defined then it can be reused anywhere in the document. 
Here is an example of a simple component, a generic box with one input and one output:
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
Note that the new instance has a different id `#comp_0' from the symbol `#component'.
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
		<use xlink:href='#component' transform='scale(0.5)' id='comp_0'/>
		<use xlink:href='#component' transform='translate(300) scale(0.5)' id='comp_1'/>
		<metadata>
			<rdf:RDF>
				<rf:Line rdf:about='#line_0_1'>
					<rf:port rdf:resource='#comp_0_output'/>
					<rf:port rdf:resource='#comp_1_input'/>
				</rf:Line>
			</rdf:RDF>
		</metadata>
	</g>
```
This scheme can only work if the resources #comp_0_output and #comp_1_output have been defined before processing the statement, here is how it is done:
1.	the SVG document is traversed to find svg:use statement	
2.	for each statement the corresponding svg:symbol is read to find metadata (this could be done recursively in case of subclasses see ...), if the symbol has a rf:input or rf:output property a new id is created by concatenating the instance's ID and the symbol's port ID. eg.:
```
	<rdf:Description rdf:about='#component'>
		<rf:input rdf:resource='#in'/>
	</rdf:Description>
		
Defining new symbols, inheritance vs composition
------------------------------------------------
When a new symbol is defined from existing symbols the parser assumes that the symbols inherits from the first used symbol, if it is not the intent metadata is to be added to define the class of the new symbol:
```xml
	<symbol id='a'>
		<metadata>
			<rdf:RDF>
				<rf:A rdf:about='#a'/>
			</rdf:RDF>
		</metadata>
		<!-- ... -->
	</symbol>
	<symbol id='b'>
		<use xlink:href='#a'/>
		<use/>
		<!-- more svg:use or svg:* -->
	</symbol>
```
So in this case symbol `b' is of class `rf:A' and the following statement will be added to the RDF store:
```xml
	<rf:A rdf:about='#b'/>
```
If the new symbol `b' is not of class `rf:A' it must be stated explicitly:
```
	<symbol id='b'>
		<metadata>
			<rdf:RDF>
				<rf:B rdf:about='#b'/>
			</rdf:RDF>
		</metadata>
		<use xlink:href='#a'/>
		<use/>
		<!-- more svg:use or svg:* -->
	</symbol>
```
Extracting Metadata
-------------------
Beside extracting explicit metadata (declared inside svg:metadata) implicit metadata can be created from the svg:use/svg:symbol relationships.

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

Part of the document is created at runtime (components get connected together), if the final document is to be consumed outside the browser, for instance it needs to be printed or included in another document as PS or PDF, it must be made available. There are several methods:
1. `save as' method in the browser (only works in Firefox?)
2. print to file in the browser
3. stand-alone rendering (Batik? ...)

Appendix
--------
When loading files from the local file system Chrome needs to be started with a special flag:

	google-chrome --allow-file-access-from-files & 2> /dev/null

xlink vs xinclude
-----------------
The svg:use statement uses xlink to refer to the symbol:
```xml
	<use xlink:href='#some_symbol'/>
	<use xlink:href='some_file.svg#some_symbol'/>
```
The second statement uses a symbol defined in another file, this makes it possible to have on-line repositories of symbols but it has a few drawbacks:
1.	inconsistent support in browsers
2.	the linked document is not fully part of the DOM, individual symbols can be read (through instanceRoot.correspondingElement property), but cannot be modified, making it impossible to add connecting lines. 

The workaround is to use xinclude (unfortunately not supported by any browser but implemented in xinclude.xsl):
```xml
	<xi:include href='some_file.svg'/>
	<use xlink:href='#some_symbol'/>
```


