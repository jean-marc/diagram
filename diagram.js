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
function connect_path(from,to){
	origin=document.getElementById(from);
	dest=document.getElementById(to);
	path=document.createElementNS("http://www.w3.org/2000/svg","path");
	path.setAttributeNS(null,'class','Line');
	var m=origin.getTransformToElement(path);
	var n=dest.getTransformToElement(path);
	origin_out=origin.instanceRoot.correspondingElement.querySelector('.output');
	origin_out_bezier=origin.instanceRoot.correspondingElement.querySelector('.output_bezier');
	dest_in=dest.instanceRoot.correspondingElement.querySelector('.input');//does not work if multiple svg:use
	dest_in_bezier=dest.instanceRoot.correspondingElement.querySelector('.input_bezier');//does not work if multiple svg:use
	if(origin_out_bezier){
		if(dest_in_bezier){//cubic Bezier
		path.setAttributeNS(null,'d',
			'M'+(origin_out.cx.baseVal.value*m.a+origin_out.cy.baseVal.value*m.c+m.e)+' '+(origin_out.cx.baseVal.value*m.b+origin_out.cy.baseVal.value*m.d+m.f)+
			'C'+(origin_out_bezier.cx.baseVal.value*m.a+origin_out_bezier.cy.baseVal.value*m.c+m.e)+' '+(origin_out_bezier.cx.baseVal.value*m.b+origin_out_bezier.cy.baseVal.value*m.d+m.f)+' '+(dest_in_bezier.cx.baseVal.value*n.a+dest_in_bezier.cy.baseVal.value*n.c+n.e)+' '+(dest_in_bezier.cx.baseVal.value*n.b+dest_in_bezier.cy.baseVal.value*n.d+n.f)+' '+(dest_in.cx.baseVal.value*n.a+dest_in.cy.baseVal.value*n.c+n.e)+' '+(dest_in.cx.baseVal.value*n.b+dest_in.cy.baseVal.value*n.d+n.f));
		}else{//quadratic Bezier
		path.setAttributeNS(null,'d',
			'M'+(origin_out.cx.baseVal.value*m.a+origin_out.cy.baseVal.value*m.c+m.e)+' '+(origin_out.cx.baseVal.value*m.b+origin_out.cy.baseVal.value*m.d+m.f)+
			'Q'+(origin_out_bezier.cx.baseVal.value*m.a+origin_out_bezier.cy.baseVal.value*m.c+m.e)+' '+(origin_out_bezier.cx.baseVal.value*m.b+origin_out_bezier.cy.baseVal.value*m.d+m.f)+' '+(dest_in.cx.baseVal.value*n.a+dest_in.cy.baseVal.value*n.c+n.e)+' '+(dest_in.cx.baseVal.value*n.b+dest_in.cy.baseVal.value*n.d+n.f));
		}
	}else{
		path.setAttributeNS(null,'d',
			'M'+(origin_out.cx.baseVal.value*m.a+origin_out.cy.baseVal.value*m.c+m.e)+' '+(origin_out.cx.baseVal.value*m.b+origin_out.cy.baseVal.value*m.d+m.f)+
			'L'+(dest_in.cx.baseVal.value*n.a+dest_in.cy.baseVal.value*n.c+n.e)+' '+(dest_in.cx.baseVal.value*n.b+dest_in.cy.baseVal.value*n.d+n.f));
	}	
	document.getElementById('svg').appendChild(path);
}
