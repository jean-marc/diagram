function multiply(a,m){return {x:a.x*m.a+a.y*m.c+m.e, y:a.x*m.b+a.y*m.d+m.f}}
//will navigate the use->symbol relationship to find the symbol `port'
//draw a circle where the port is supposed to be
function test_port(elm){
	circle=document.createElementNS('http://www.w3.org/2000/svg','circle');	
	circle.setAttributeNS(null,'r','5');
	var m=elm.c.getTransformToElement(path);
	//there is another transform: from use 
	console.log(m)
	var n=elm.p.getTransformToElement(path)
	m=m.multiply(n);
	console.log(n)
	//elm.p is a use statement
	//console.log(elm.p.instanceRoot.correspondingElement.getAttribute('id'));
	//we need to access the line inside the symbol
	line=document.querySelectorAll('#port line')[0];
	console.log(line);
	o=multiply({x:line.x1.baseVal.value,y:line.y1.baseVal.value},m);
	circle.setAttributeNS(null,'cx',o.x);	
	circle.setAttributeNS(null,'cy',o.y);	
	
	document.getElementById('svg').appendChild(circle);

}
function connect_path(from,to,id){
	//we need to be able to deal with <use x= y=../>
	//we are looking for symbol with id='port' 
	path=document.createElementNS("http://www.w3.org/2000/svg","path");
	path.setAttributeNS(null,'class','Line');
	path.setAttributeNS(null,'style','marker-end:url(#head)')
	if(id) path.setAttributeNS(null,'id',id);
	//test_port(to);
	//test_port(from)
	console.log(from);
	console.log(to);
	var m=from.c.getTransformToElement(path).translate(from.p.x.baseVal.value,from.p.y.baseVal.value).multiply(from.p.getTransformToElement(path));
	//from.p might not be the actual port 
	if(from.p.instanceRoot.correspondingElement.getAttribute('id')!='port'){
		//let's get the first use element	
		s=from.p.instanceRoot.correspondingElement;
		use=s.getElementsByTagNameNS('http://www.w3.org/2000/svg','use')[0];
		console.log(use)
		m=m.multiply(use.getTransformToElement(path));
	}
	var n=to.c.getTransformToElement(path).translate(to.p.x.baseVal.value,to.p.y.baseVal.value).multiply(to.p.getTransformToElement(path));
	if(to.p.instanceRoot.correspondingElement.getAttribute('id')!='port'){
		//let's get the first use element	
		s=to.p.instanceRoot.correspondingElement;
		use=s.getElementsByTagNameNS('http://www.w3.org/2000/svg','use')[0];
		console.log(use)
		n=n.multiply(use.getTransformToElement(path));
	}
	line=document.querySelectorAll('#port line')[0];
	origin_out={x:line.x1,y:line.y1};
	origin_out_bezier={x:line.x2,y:line.y2};
	dest_in=origin_out;
	dest_in_bezier=origin_out_bezier;
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
	//should add to element that contents svg:metada so we can easily style
	document.getElementById('svg').appendChild(path);
}
//parse svg metadata and store, should also load schema.rdf
var r;
var subclass;
var ports=new Array();
var _ports=new Array();
var index=0;
function get_id(){return 'genid_'+index++;}
function get_rdfs_type(elm){
	return r.where('<'+elm.baseURI+'#'+elm.getAttribute('id')+'> a ?t');
}
function parse_rdf(){
	//xml:base must be defined in rdf:RDF
	rdf=document.getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','RDF');
	r=$.rdf();
	for(var i=0;i<rdf.length;++i){
		r.databank.load({documentElement:rdf[i]});	
	}
	//augment the dataset with info from use statement inside symbols
	symbols=document.getElementsByTagNameNS('http://www.w3.org/2000/svg','symbol');
	for(var i=0;i<symbols.length;++i){
		//do we know the type of that symbol?
		type=get_rdfs_type(symbols[i]);
		if(type.length==0){ 
			//get the type of first use statement
			uses=symbols[i].getElementsByTagNameNS('http://www.w3.org/2000/svg','use');
			if(uses.length){
				//look-up type of symbols	
				type=get_rdfs_type(uses[0].instanceRoot.correspondingElement);
			}else{
				console.log('`'+symbols[i].getAttribute('id')+"' unknown RDF type");
			}
		}
		//add statement to document
		type.each(function(){
			r.add('<'+symbols[i].baseURI+'#'+symbols[i].getAttribute('id')+'> a <'+this.t.value._string+'>');
			//console.log(this.t.value.toString());
		})
	}
	//we iterate again but now looking for ports
	for(var i=0;i<symbols.length;++i){
		symbol_id=symbols[i].baseURI+'#'+symbols[i].getAttribute('id');
		uses=symbols[i].getElementsByTagNameNS('http://www.w3.org/2000/svg','use');
		for(var j=0;j<uses.length;++j){
			get_rdfs_type(uses[j].instanceRoot.correspondingElement).filter(function(){
				return this.t.value._string=='http://www.example.org/rf#Port';	
			}).each(function(){
				use_id=uses[j].baseURI+'#'+uses[j].getAttribute('id');//probably not unique
				r.add('<'+symbol_id+'> <http://www.example.org/rf#port> <'+use_id+'>');
			});
		}	
	}
	//now let's add the ports
	uses=document.querySelectorAll('g use');
	for(var j=0;j<uses.length;++j){
		use_id=uses[j].baseURI+'#'+uses[j].getAttribute('id');
		symbol_id=uses[j].instanceRoot.correspondingElement.baseURI+'#'+uses[j].instanceRoot.correspondingElement.getAttribute('id');
		get_rdfs_type(uses[j].instanceRoot.correspondingElement).each(function(){
			r.add('<'+use_id+'> a <'+this.t.value._string+'>');
			//get all ports attached to symbol
		});
		r.prefix('rf','http://www.example.org/rf#').where('<'+symbol_id+'> rf:port ?p').each(function(){
			//console.log(this.p.value);
			port_id=use_id+'_'+this.p.value.fragment;
			//ports[port_id]={c:uses[j],p:document.getElementById(this.p.value.fragment)};
			//work around non unique ID by restricting scope
			ports[port_id]={c:uses[j],p:uses[j].instanceRoot.correspondingElement.querySelectorAll('[id='+this.p.value.fragment+']')[0]};
			r.add('<'+use_id+'> <http://www.example.org/rf#port> <'+port_id+'>')
		})

	}	
	//connect the ports	
	r.prefix('rf','http://www.example.org/rf#').where('?s a rf:Line').each(function(){
		subject=this.s.value._string ? '<'+this.s.value._string+'>': this.s.value;
		_ports=r.prefix('rf','http://www.example.org/rf#').where(subject+' rf:port ?p');
		if(_ports.length!=2)
			console.log('rf:Line `'+this.s.value+"' does not have 2 ports");
		else	
			connect_path(ports[_ports[0].p.value._string],ports[_ports[1].p.value._string],this.s.value.fragment)
	})
	//load schema.rdf
	/*
	xhttp=new XMLHttpRequest();
	xhttp.open("GET",'schema.rdf',false);
	xhttp.send("");
	r.databank.load(xhttp.responseXML);
	*/
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
	elm_id=elm.baseURI+'#'+elm.getAttribute('id');
	console.log($.toJSON($.rdf.dump(r.databank.describe(['<'+elm_id+'>']))))
}
