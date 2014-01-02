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
//parse svg metadata and store, should also load schema.rdf
function parse_rdf(){
	rdf=document.getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','RDF')[0];
	r = $.rdf().load({documentElement:rdf});	
	r.prefix('rf','http://www.example.org/rf#').where('?s a rf:Line').each(function(){
		//could be a blank node
		subject =this.s.value._string ? '<'+this.s.value._string+'>' : this.s.value;
		output=r.prefix('rf','http://www.example.org/rf#').where(subject+' rf:port ?p').where('?c rf:output ?p');
		input=r.prefix('rf','http://www.example.org/rf#').where(subject+' rf:port ?p').where('?c rf:input ?p');
		if(this.s.value._string)
			connect_path(output[0].c.value.fragment,input[0].c.value.fragment,this.s.value.fragment)
		else
			connect_path(output[0].c.value.fragment,input[0].c.value.fragment)
	}); 
}
//go through SVG and find all components input and output and create rdf:ID's
function gleane_svg(){

}
