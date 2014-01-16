function connect_line(from,to){
	origin=document.getElementById(from);
	dest=document.getElementById(to);
	line=document.createElementNS("http://www.w3.org/2000/svg","line");
	line.setAttributeNS(null,'class','Line');
	var m=origin.getTransformToElement(line);
	var n=dest.getTransformToElement(line);
	origin_out=origin.instanceRoot.correspondingElement.querySelector('.output');
	dest_in=dest.instanceRoot.correspondingElement.querySelector('.input');//does not work if multiple svg:use
	line.setAttributeNS(null,"x1",origin_out.cx.baseVal.value*m.a+origin_out.cy.baseVal.value*m.c+m.e);
	line.setAttributeNS(null,"y1",origin_out.cx.baseVal.value*m.b+origin_out.cy.baseVal.value*m.d+m.f);
	line.setAttributeNS(null,"x2",dest_in.cx.baseVal.value*n.a+dest_in.cy.baseVal.value*n.c+n.e);
	line.setAttributeNS(null,"y2",dest_in.cx.baseVal.value*n.b+dest_in.cy.baseVal.value*n.d+n.f);
	document.getElementById('svg').appendChild(line);
}
function multiply(a,m){return {x:a.x*m.a+a.y*m.c+m.e, y:a.x*m.b+a.y*m.d+m.f}}
function connect_path(from,to,id){
	origin=document.getElementById(from);
	origin_out=origin.instanceRoot.correspondingElement.querySelector('.output');
	dest=document.getElementById(to);
	path=document.createElementNS("http://www.w3.org/2000/svg","path");
	path.setAttributeNS(null,'class','Line');
	if(id) path.setAttributeNS(null,'id',id);
	var m=origin.getTransformToElement(path);
	var n=dest.getTransformToElement(path);
	origin_out=origin.instanceRoot.correspondingElement.querySelector('.output');
	origin_out_bezier=origin.instanceRoot.correspondingElement.querySelector('.output_bezier');
	dest_in=dest.instanceRoot.correspondingElement.querySelector('.input');//does not work if multiple svg:use
	dest_in_bezier=dest.instanceRoot.correspondingElement.querySelector('.input_bezier');//does not work if multiple svg:use
	origin=multiply({x:origin_out.cx.baseVal.value,y:origin_out.cy.baseVal.value},m);
	dest=multiply({x:dest_in.cx.baseVal.value,y:dest_in.cy.baseVal.value},n);
	if(origin_out_bezier){
		origin_ctl=multiply({x:origin_out_bezier.cx.baseVal.value,y:origin_out_bezier.cy.baseVal.value},m);
		if(dest_in_bezier){//cubic Bezier
			dest_ctl=multiply({x:dest_in_bezier.cx.baseVal.value,y:dest_in_bezier.cy.baseVal.value},n);
			path.setAttributeNS(null,'d','M'+origin.x+' '+origin.y+'C'+origin_ctl.x+' '+origin_ctl.y+' '+dest_ctl.x+' '+dest_ctl.y+' '+dest.x+' '+dest.y);
		}else{//quadratic Bezier
			path.setAttributeNS(null,'d','M'+origin.x+' '+origin.y+'Q'+origin_ctl.x+' '+origin_ctl.y+' '+dest.x+' '+dest.y);
		}
	}else{
		path.setAttributeNS(null,'d','M'+origin.x+' '+origin.y+'L'+dest.x+' '+dest.y);
	}	
	document.getElementById('svg').appendChild(path);
}
function connect_path_(from,to,id){
	path=document.createElementNS("http://www.w3.org/2000/svg","path");
	path.setAttributeNS(null,'class','Line');
	if(id) path.setAttributeNS(null,'id',id);
	var m=from.c.getTransformToElement(path);
	var n=to.c.getTransformToElement(path);
	origin_out=from.p;
	origin_out_bezier=from.ctl;
	dest_in=to.p;
	dest_in_bezier=to.ctl;
	origin=multiply({x:origin_out.x.baseVal.value,y:origin_out.y.baseVal.value},m);
	dest=multiply({x:dest_in.x.baseVal.value,y:dest_in.y.baseVal.value},n);
	if(origin_out_bezier){
		origin_ctl=multiply({x:origin_out_bezier.x.baseVal.value,y:origin_out_bezier.y.baseVal.value},m);
		if(dest_in_bezier){//cubic Bezier
			dest_ctl=multiply({x:dest_in_bezier.x.baseVal.value,y:dest_in_bezier.y.baseVal.value},n);
			path.setAttributeNS(null,'d','M'+origin.x+' '+origin.y+'C'+origin_ctl.x+' '+origin_ctl.y+' '+dest_ctl.x+' '+dest_ctl.y+' '+dest.x+' '+dest.y);
		}else{//quadratic Bezier
			path.setAttributeNS(null,'d','M'+origin.x+' '+origin.y+'Q'+origin_ctl.x+' '+origin_ctl.y+' '+dest.x+' '+dest.y);
		}
	}else{
		path.setAttributeNS(null,'d','M'+origin.x+' '+origin.y+'L'+dest.x+' '+dest.y);
	}	
	document.getElementById('svg').appendChild(path);
}
//parse svg metadata and store, should also load schema.rdf
var r;
var subclass;
var ports=new Array();
function parse_rdf(){
	//xml:base must be defined in rdf:RDF
	rdf=document.getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','RDF')[0];
	r = $.rdf().load({documentElement:rdf});	
	//load schema.rdf
	xhttp=new XMLHttpRequest();
	xhttp.open("GET",'schema.rdf',false);
	xhttp.send("");
	r.databank.load(xhttp.responseXML);
	//console.log(r)	
	//console.log($.toJSON($.rdf.dump(r.databank)))
	//console.log($.rdf.dump(r,{format:'application/json'}))
	//get all subclasses of rf:Component
	subclass=r
	.prefix('rf','http://www.example.org/rf#')
	.prefix('rdfs','http://www.w3.org/2000/01/rdf-schema#')
	.where('?s rdfs:subClassOf rf:Component')
	.map(function(){ return this.s.value; })
	.toArray();
	//how can I add a resource?
	subclass.push($.rdf.resource('<http://www.example.org/rf#Component>').value);
	//subclass.push($.uri.absolute('<http://www.example.org/rf#Component>'));
	//console.log(subclass)
	glean_svg();
	r.prefix('rf','http://www.example.org/rf#').where('?s a rf:Line').each(function(){
		//test if blank node
		subject=this.s.value._string ? '<'+this.s.value._string+'>': this.s.value;
		output=r.prefix('rf','http://www.example.org/rf#').where(subject+' rf:port ?p').where('?c rf:output ?p');
		input=r.prefix('rf','http://www.example.org/rf#').where(subject+' rf:port ?p').where('?c rf:input ?p');
		//connect_path(output[0].c.value.fragment,input[0].c.value.fragment,this.s.value.fragment)
		try{
			//connect_path_(ports[output[0].p.value._string],ports[input[0].p.value._string],this.s.value.fragment)
		}catch(e){
			console.log(e);
			//console.log(output[0].p.value._string)
			//console.log(input[0].p.value._string)
		}
	}); 
}
//add events to run query when hovering element
function mouse_event(){
	document.documentElement.addEventListener("mouseover",handle_event,false);
}
var current_element=null;
function handle_event(e){
	elm=e.target;
    if(elm.correspondingUseElement)//not supported in FF, ok in chrome
		elm = elm.correspondingUseElement;
	if(elm==current_element||elm==document.documentElement) return false;
	if(current_element) current_element.classList.remove('selected');
	current_element=elm;
	current_element.classList.add('selected');	
	//query database
	id=elm.getAttribute('id');
	console.log($.toJSON($.rdf.dump(r.databank.describe(['<http://www.example.org/rf#'+id+'>']))))
}
//go through SVG and find all components input and output and create rdf:ID's
//there should be a simple rule to define input: component id+'_'+output class(es)
//we need to augment the RDF document with some rules but dangerous: a lot of rules could be added, better: filter
function is_subClassOf_rf_Component(){return subclass.indexOf(this.c.value)>-1;}
/*
 * go through the document and extract all the metadata, inference is used	
 */
function glean_svg_(){
	use=document.getElementsByTagNameNS('http://www.w3.org/2000/svg','use');
	for(var i=0;i<use.length;++i){
		//is any metadata available in the instanceRoot.correspondingElement?
		symbol=use[i].instanceRoot.correspondingElement;
		symbol_metadata(symbol);
	}
}
function symbol_metadata(s){
	symbol_id=s.baseURI+'#'+s.getAttribute('id');
	console.log(symbol_id)
	rdf=s.getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','RDF');
	if(rdf.length){
		local = $.rdf().load({documentElement:rdf[0]});//gets confused about baseURI
		//is the symbol type defined?
		local.prefix('rf','http://www.example.org/rf#').where('<'+symbol_id+'> a ?p').each(function(){
			console.log(this.p+'')
		})
	}else{ //get metadata from first used symbol
		var use=s.getElementsByTagNameNS('http://www.w3.org/2000/svg','use');
		if(use.length) symbol_metadata(use[0].instanceRoot.correspondingElement);
	}
}
function glean_svg(){
	r.where('?s a ?c').filter(is_subClassOf_rf_Component).each(function(){
		//query SVG document
		if(this.s.value._string){ //no blank nodes for now
			elm=document.getElementById(this.s.value.fragment);
			if(elm&&elm.instanceRoot){//only svg:use elements
				_elm=elm.instanceRoot.correspondingElement;
				output=_elm.querySelectorAll('.output:not(.bezier)');
				//add statements
				for(var i=0;i<output.length;++i){
					id='http://www.example.org/rf#'+this.s.value.fragment+'_'+output[i].className.baseVal.replace(/ /g,'')
					r.add('<http://www.example.org/rf#'+this.s.value.fragment+'> rf:output <'+id+'>');
					ports[id]={c:elm,p:output[i],ctl:_elm.getElementsByClassName(output[i].className.baseVal+' bezier')[0]};
				}
				input=_elm.querySelectorAll('.input:not(.bezier)');
				for(var i=0;i<input.length;++i){
					id='http://www.example.org/rf#'+this.s.value.fragment+'_'+input[i].className.baseVal.replace(/ /g,'')
					r.add('<http://www.example.org/rf#'+this.s.value.fragment+'> rf:input <'+id+'>');
					ports[id]={c:elm,p:input[i],ctl:_elm.getElementsByClassName(input[i].className.baseVal+' bezier')[0]};
				}
			}
		}
	})
}
