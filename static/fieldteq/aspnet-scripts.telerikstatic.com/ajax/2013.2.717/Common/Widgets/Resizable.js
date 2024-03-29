Type.registerNamespace("Telerik.Web.UI.Widgets");
(function(b,a){var c=function(d){(function(){var f={};
a.extend(d,{trigger:function(j){var k=f[j];
if(!k){return;
}for(var l=0;
l<k.length;
l++){var h=Array.prototype.slice.call(arguments);
h.shift();
h.unshift(this);
k[l].handler.apply(k[l].context,h);
}},_bind:function(i,h){a.each(i,function(j,k){e(j,k,h);
});
},_unbind:function(i,h){a.each(i,function(j,k){g(j,k,h);
});
},_disposeEvents:function(){f=null;
}});
function e(i,j,h){var k=f[i]||[];
k.push({handler:j,context:h});
f[i]=k;
}function g(j,k,h){var l=f[j];
if(!l){return;
}var n=-1;
for(var m=0;
m<l.length;
m++){if(l[m].func==k&&l[m].context==h){n=m;
break;
}}if(n>-1){l=l.splice(n,1);
}f[j]=l;
}})();
};
b.Widgets.Resizable=function(d,e){this._element=d;
this._handlesCollection={};
this.options=a.extend({handleSize:7,liveResize:false,enableFrameOverlay:false,appendHandleToElement:false,constraints:{minWidth:null,minHeight:null,maxWidth:null,maxHeight:null},handles:[{direction:"W",element:null},{direction:"NW",element:null},{direction:"N",element:null},{direction:"NE",element:null},{direction:"E",element:null},{direction:"SE",element:null},{direction:"S",element:null},{direction:"SW",element:null}]},e||{});
c(this);
this.initialize();
};
b.Widgets.Resizable.prototype={initialize:function(){this._initHandles();
},add_resizeStart:function(d){this._bind({resizeStart:d});
},remove_resizeStart:function(d){this._unbind({resizeStart:d});
},add_resizing:function(d){this._bind({resizing:d});
},remove_resizing:function(d){this._unbind({resizing:d});
},add_resizeEnd:function(d){this._bind({resizeEnd:d});
},remove_resizeEnd:function(d){this._unbind({resizeEnd:d});
},get_constraints:function(){return this.options.constraints;
},set_constraints:function(d){if(d){if((d.minWidth&&d.maxWidth&&d.minWidth>d.maxWidth)||(d.minHeight&&d.maxHeight&&d.minHeight>d.maxHeight)){throw Error("Invalid Parameters");
}}a.extend(this.options.constraints,d||{maxWidth:null,minWidth:null,maxHeight:null,minHeight:null});
for(var e in this._handlesCollection){this._setHandleConstraints(this._handlesCollection[e]);
}},get_minWidth:function(){return this.options.constraints.minWidth;
},set_minWidth:function(f){var d=this.options.constraints;
if((isNaN(f)&&f!==null&&f!=="")||(d.maxWidth&&d.maxWidth<f)){throw Error("Invalid Parameters");
}d.minWidth=f;
for(var e in this._handlesCollection){this._setHandleConstraints(this._handlesCollection[e]);
}},get_maxWidth:function(){return this.options.constraints.maxWidth;
},set_maxWidth:function(f){var d=this.options.constraints;
if((isNaN(f)&&f!==null&&f!=="")||(d.minWidth&&d.minWidth>f)){throw Error("Invalid Parameters");
}d.maxWidth=f;
for(var e in this._handlesCollection){this._setHandleConstraints(this._handlesCollection[e]);
}},get_minHeight:function(){return this.options.constraints.minHeight;
},set_minHeight:function(f){var d=this.options.constraints;
if((isNaN(f)&&f!==null&&f!=="")||(d.maxHeight&&d.maxHeight<f)){throw Error("Invalid Parameters");
}d.minHeight=f;
for(var e in this._handlesCollection){this._setHandleConstraints(this._handlesCollection[e]);
}},get_maxHeight:function(){return this.options.constraints.maxHeight;
},set_maxHeight:function(f){var d=this.options.constraints;
if((isNaN(f)&&f!==null&&f!=="")||(d.minHeight&&d.minHeight>f)){throw Error("Invalid Parameters");
}d.maxHeight=f;
for(var e in this._handlesCollection){this._setHandleConstraints(this._handlesCollection[e]);
}},hideHandles:function(){for(var d in this._handlesCollection){var e=this._handlesCollection[d];
e._element.style.display="none";
}},showHandles:function(){for(var d in this._handlesCollection){var e=this._handlesCollection[d];
e._element.style.display="";
}},repaint:function(){this._configureHandles();
},_initHandles:function(){var e=this.options.handles;
for(var f=0;
f<e.length;
f++){var d=null;
if(e[f].element){d=this._initExternalHandle(e[f]);
}else{d=this._initHandle(e[f]);
}d.add_dragStart(a.proxy(this._handleDragStart,this));
d.add_dragging(a.proxy(this._handleDragging,this));
d.add_dragEnd(a.proxy(this._handleDragEnd,this));
this._handlesCollection[d._direction]=d;
}this._configureHandles();
},_initExternalHandle:function(e){var d=new b.Widgets.Handle(e.element,e.direction,{handle:e.element});
return d;
},_initHandle:function(f){var e=this._createHandleElement(f);
var d=new b.Widgets.Handle(e,f.direction,{cursorType:this._getCursorFromDirection(f.direction),enableFrameOverlay:this.options.enableFrameOverlay});
return d;
},_createHandleElement:function(e){var d=document.createElement("div");
d.style.position="absolute";
d.className="rrHandle rr"+e.direction;
return d;
},_configureHandles:function(){for(var d in this._handlesCollection){var e=this._handlesCollection[d];
if(e.get_useExternalHandle()){continue;
}this._appendHandleToDOM(e);
this._applyElementsZIndex(e);
this._sizeHandle(e);
this._positionHandle(e);
e._element.style.cssText=e._element.style.cssText;
this._setHandleConstraints(e);
}},_appendHandleToDOM:function(d){if(!this._element.parentNode){throw Error("Resizable element should be part of the DOM tree");
}if(this.options.appendHandleToElement){this._element.appendChild(d._element);
}else{var e=this._element.parentNode;
if(this._element.nextSibling){e.insertBefore(d._element,this._element.nextSibling);
}else{e.appendChild(d._element);
}}},_applyElementsZIndex:function(d){var e=this._element.style.zIndex||$telerik.getComputedStyle(this._element,"z-index");
d._element.style.zIndex=e||"";
},_setHandleConstraints:function(e){var d={minWidth:this.options.constraints.minWidth?this.options.constraints.minWidth-this._element.offsetWidth:null,maxWidth:this.options.constraints.maxWidth?this.options.constraints.maxWidth-this._element.offsetWidth:null,minHeight:this.options.constraints.minHeight?this.options.constraints.minHeight-this._element.offsetHeight:null,maxHeight:this.options.constraints.maxHeight?this.options.constraints.maxHeight-this._element.offsetHeight:null};
e.set_constraints(null);
if(e._direction=="E"||e._direction=="W"){e.set_minY(a(e._element).offset().top);
e.set_maxY(a(e._element).offset().top+a(e._element).height());
}else{if(e._direction=="N"||e._direction=="S"){e.set_minX(a(e._element).offset().left);
e.set_maxX(a(e._element).offset().left+a(e._element).width());
}}if(e._direction.indexOf("W")>-1){if(d.maxWidth!==null){e.set_minX(null);
e.set_minX(e.get_position().x-d.maxWidth);
}e.set_maxX(null);
if(d.minWidth!==null){e.set_maxX(e.get_position().x-d.minWidth+this.options.handleSize);
}else{e.set_maxX(this._getHandleOpositeConstraints(e._direction).x);
}}else{if(e._direction.indexOf("E")>-1){if(d.maxWidth!==null){e.set_maxX(null);
e.set_maxX(e.get_position().x+d.maxWidth+this.options.handleSize);
}e.set_minX(null);
if(d.minWidth!==null){e.set_minX(e.get_position().x+d.minWidth);
}else{e.set_minX(this._getHandleOpositeConstraints(e._direction).x);
}}}if(e._direction.indexOf("N")>-1){if(d.maxHeight!==null){e.set_minY(null);
e.set_minY(e.get_position().y-d.maxHeight);
}e.set_maxY(null);
if(d.minHeight!==null){e.set_maxY(e.get_position().y-d.minHeight+this.options.handleSize);
}else{e.set_maxY(this._getHandleOpositeConstraints(e._direction).y);
}}else{if(e._direction.indexOf("S")>-1){if(d.maxHeight!==null){e.set_maxY(null);
e.set_maxY(e.get_position().y+d.maxHeight+this.options.handleSize);
}e.set_minY(null);
if(d.minHeight!==null){e.set_minY(e.get_position().y+d.minHeight);
}else{e.set_minY(this._getHandleOpositeConstraints(e._direction).y);
}}}},_getHandleOpositeConstraints:function(d){var e={x:null,y:null};
if(d.toLowerCase().indexOf("w")>-1){e.x=a(this._element).offset().left+a(this._element).width()+this.options.handleSize/2;
}else{if(d.toLowerCase().indexOf("e")>-1){e.x=a(this._element).offset().left-this.options.handleSize/2;
}}if(d.toLowerCase().indexOf("n")>-1){e.y=a(this._element).offset().top+a(this._element).height()+this.options.handleSize/2;
}else{if(d.toLowerCase().indexOf("s")>-1){e.y=a(this._element).offset().top-this.options.handleSize/2;
}}return e;
},_sizeHandle:function(e){var d=e.get_direction();
if(d.indexOf("W")>-1||d.indexOf("E")>-1){e._element.style.width=this.options.handleSize+"px";
}else{e._element.style.width=Math.max(this.options.handleSize,parseInt(this._element.clientWidth)-this.options.handleSize)+"px";
}if(d.indexOf("N")>-1||d.indexOf("S")>-1){e._element.style.height=this.options.handleSize+"px";
}else{e._element.style.height=Math.max(this.options.handleSize,parseInt(this._element.clientHeight)-this.options.handleSize)+"px";
}},_positionHandle:function(g){var f=g.get_direction();
var h=f.indexOf("S")>-1?parseInt(this._element.clientHeight):0;
var i=f.indexOf("E")>-1?parseInt(this._element.clientWidth):0;
var e=parseInt(this._element.clientHeight)>this.options.handleSize/2&&(f=="E"||f=="W")?1:-1;
var d=parseInt(this._element.clientWidth)>this.options.handleSize/2&&(f=="N"||f=="S")?1:-1;
if(this.options.appendHandleToElement&&this._isRootPositioned()){g._element.style.top=(h+e*this.options.handleSize/2)+"px";
g._element.style.left=(i+d*this.options.handleSize/2)+"px";
}else{g._element.style.top=(this._element.offsetTop+h+e*this.options.handleSize/2)+"px";
g._element.style.left=(this._element.offsetLeft+i+d*this.options.handleSize/2)+"px";
}},_isRootPositioned:function(){var d=this._isRootIndirectlyPositioned()||$telerik.getComputedStyle(this._element,"position")!="static";
return d;
},_isRootIndirectlyPositioned:function(){var d=this._element;
return($telerik.getComputedStyle(d,"transform")!="none"&&$telerik.getComputedStyle(d,"MozTransform")!="none"&&$telerik.getComputedStyle(d,"webkitTransform")!="none"&&$telerik.getComputedStyle(d,"OTransform")!="none"&&$telerik.getComputedStyle(d,"msTransform")!="none");
},_toggleDocumentCursor:function(d){if(typeof(d)=="string"){document.body.style.cursor=this._getCursorFromDirection(d);
}else{document.body.style.cursor="";
}},_getCursorFromDirection:function(d){if(d){return d.toLowerCase()+"-resize";
}else{return null;
}},_handleDragStart:function(e,d){var f=new b.Widgets.Resizable.ResizeableEventArgs(e.get_direction(),null,d.get_domEvent());
this.trigger("resizeStart",f);
if(!f._cancel){this._toggleDocumentCursor(e.get_direction());
}d.set_cancel(f._cancel);
if(this.options.liveResize&&!f._cancel){this.resizeHelper={width:this._element.clientWidth,height:this._element.clientHeight,offset:a(this._element).offset()};
}},_handleDragging:function(g,d){var e={x:d._delta.x,y:d._delta.y},f=g.get_direction();
if(g.get_useExternalHandle()){if(f=="N"||f=="S"){e.x=0;
e.y=Math.min(e.y,this._element.clientHeight);
}if(f=="E"||f=="W"){e.x=Math.min(e.x,this._element.clientWidth);
e.y=0;
}}var h=new b.Widgets.Resizable.ResizeableEventArgs(f,e,d.get_domEvent());
this.trigger("resizing",h);
d.set_cancel(h._cancel);
if(this.options.liveResize&&!h._cancel){this._applyElementSizing(f,e);
}},_handleDragEnd:function(g,d){var e=d._delta,f=g.get_direction();
if(g.get_useExternalHandle()){if(f=="N"||f=="S"){e.x=0;
e.y=Math.min(e.y,this._element.clientHeight);
}if(f=="E"||f=="W"){e.x=Math.min(e.x,this._element.clientWidth);
e.y=0;
}}this._toggleDocumentCursor();
var h=new b.Widgets.Resizable.ResizeableEventArgs(g.get_direction(),e,d.get_domEvent());
this.trigger("resizeEnd",h);
this._configureHandles();
},_applyElementSizing:function(e,d){var f=1,g=1;
if(e.indexOf("W")>-1){g=-1;
$telerik.$(this._element).css("left",parseInt(this.resizeHelper.offset.left)+d.x);
}if(e.indexOf("N")>-1){f=-1;
$telerik.$(this._element).css("top",parseInt(this.resizeHelper.offset.top)+d.y);
}if(e.indexOf("W")>-1||e.indexOf("E")>-1){a(this._element).width(parseInt(this.resizeHelper.width)+g*d.x);
}if(e.indexOf("N")>-1||e.indexOf("S")>-1){a(this._element).height(parseInt(this.resizeHelper.height)+f*d.y);
}},dispose:function(){for(dir in this._handlesCollection){var d=this._handlesCollection[dir];
if(!d.get_useExternalHandle()){d._element.parentNode.removeChild(d._element);
}d.dispose();
}this._element=null;
this._handlesCollection=null;
this.options=null;
}};
b.Widgets.Resizable.ResizeableEventArgs=function(e,d,f){this._cancel=false;
this._delta=d;
this._direction=e;
this._domEvent=f;
},b.Widgets.Resizable.ResizeableEventArgs.prototype={get_delta:function(){return this._delta;
},get_direction:function(){return this._direction;
},get_domEvent:function(){return this._domEvent;
},get_cancel:function(){return this._cancel;
},set_cancel:function(d){this._cancel=(d===true||d==="true");
}};
b.Widgets.Handle=function(e,d,f){this._direction=d;
this.options=a.extend(this.options,f||{});
Telerik.Web.UI.Widgets.Handle.initializeBase(this,[e,f]);
};
b.Widgets.Handle.prototype={get_direction:function(){return this._direction;
}};
Telerik.Web.UI.Widgets.Draggable.registerClass("Telerik.Web.UI.Widgets.Draggable");
Telerik.Web.UI.Widgets.Handle.registerClass("Telerik.Web.UI.Widgets.Handle",Telerik.Web.UI.Widgets.Draggable);
})(Telerik.Web.UI,$telerik.$);
if(typeof(Sys)!=='undefined')Sys.Application.notifyScriptLoaded();