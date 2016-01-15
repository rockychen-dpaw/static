(function(a){Type.registerNamespace("Telerik.Web.UI");
var b=Telerik.Web.UI;
Telerik.Web.UI.TouchScrollExtender=function(c){this._containerElements=a(c);
var d=arguments[1]||{};
this._autoScan="autoScan" in d?d.autoScan:false;
this._showScrollHints="showScrollHints" in d?d.showScrollHints:true;
this._useRoundedHints="useRoundedHints" in d?d.useRoundedHints:true;
this._hasHorizontalScrollHint=false;
this._hasVerticalScrollHint=false;
this._verticalScrollHint=false;
this._horizontalScrollHint=false;
this._lastAnimator=false;
this._dragCanceled=false;
this.containers=new Array();
this._enableTouchScroll=true;
};
Telerik.Web.UI.TouchScrollExtender._getNeedsScrollExtender=function(){return $telerik.isTouchDevice;
};
Telerik.Web.UI.TouchScrollExtender.prototype={initialize:function(){if(this._enableTouchScroll){if(this._autoScan){this._containerElements=this._containerElements.add(a("*",this._containerElements)).filter(function(){return(a(this).css("overflow")=="scroll"||a(this).css("overflow")=="auto");
});
}var c=this;
this._containerElements.each(function(){this.style.overflow="hidden";
var d=a(this).addClass("RadTouchExtender").css("-webkit-tap-highlight-color","rgba(0, 0, 0, 0);");
var e={element:d.stop(),horizontalScrollHint:a('<div id="horizontalScrollHint" style="position: absolute; display: none; z-index: 200000; font-size: 0; height: 3px; border: 1px solid #333; background: #777; " />').appendTo(this.parentNode),verticalScrollHint:a('<div id="verticalScrollHint" style="position: absolute; display: none; z-index: 200000; width: 3px; border: 1px solid #333; background: #777; " />').appendTo(this.parentNode)};
if(this._useRoundedHints){e.horizontalScrollHint.css({"-moz-border-radius":"3px","-webkit-border-radius":"3px","border-radius":"3px"});
e.verticalScrollHint.css({"-moz-border-radius":"3px","-webkit-border-radius":"3px","border-radius":"3px"});
}d.data("dragID",c.containers.push(e)-1);
});
this._startDragProxy=a.proxy(this._startDrag,this);
if(b.TouchScrollExtender._getNeedsScrollExtender()){this._onGestureStartProxy=a.proxy(this._onGestureStart,this);
this._onGestureEndProxy=a.proxy(this._onGestureEnd,this);
this._containerElements.bind("touchstart",this._startDragProxy);
this._containerElements.bind("gesturestart",this._onGestureStartProxy);
this._containerElements.bind("gestureend",this._onGestureEndProxy);
}else{this._containerElements.bind("mousedown",this._startDragProxy);
}this._storeLastLocation=a.throttle(100,function(d){this._lastAnimator.kX=d.x;
this._lastAnimator.kY=d.y;
});
this._alignScrollHints=a.throttle(20,function(){var g=0;
var h=0;
var e=this._lastAnimator.element[0];
var i=this._lastAnimator.horizontalScrollHint;
var j=this._lastAnimator.verticalScrollHint;
var d=this._getBorderBox(e);
var f=a(e).position();
if(this._hasHorizontalScrollHint&&i){g=Math.abs(e.scrollLeft)*this._widthConstant+f.left+d.left;
i.css({left:g});
}if(this._hasVerticalScrollHint&&j){h=Math.abs(e.scrollTop)*this._heightConstant+f.top+d.top;
j.css({top:h});
}});
this._throttleScroll=a.throttle(10,function(d){this._lastAnimator.element[0].scrollLeft=this._lastAnimator.dragStartX-d.x;
this._lastAnimator.element[0].scrollTop=this._lastAnimator.dragStartY-d.y;
});
}},dispose:function(){this.disable();
this._detachInitilalEvents();
this.containers=null;
this._containerElements=null;
this._events=null;
},_detachInitilalEvents:function(){if(this._containerElements){if(this._startDragProxy){this._containerElements.unbind("mousedown",this._startDragProxy);
}if(this._onGestureStartProxy){this._containerElements.unbind("gesturestart",this._onGestureStartProxy);
}if(this._onGestureEndProxy){this._containerElements.unbind("gestureend",this._onGestureEndProxy);
}}},_startDrag:function(f){if(this._dragCanceled){return;
}var c=a(f.target);
var d=c.parents(".RadTouchExtender");
if(c.hasClass("RadTouchExtender")){d=d.add(c);
}var g=this._lastAnimator=this.containers[d.data("dragID")];
var h=g.element[0];
this._hasHorizontalScrollHint=h.offsetWidth<h.scrollWidth;
this._hasVerticalScrollHint=h.offsetHeight<h.scrollHeight;
g.hasDragged=false;
if(this._hasHorizontalScrollHint||this._hasVerticalScrollHint){g.element.stop(true);
g.originalEvent=f.originalEvent;
if(!b.TouchScrollExtender._getNeedsScrollExtender()){this._cancelEvents(f);
}var j=$telerik.getTouchEventLocation(f);
g.kX=j.x;
g.kY=j.y;
var i=h.scrollLeft||0;
var k=h.scrollTop||0;
g.dragStartX=(i>0?i:0)+j.x;
g.dragStartY=(k>0?k:0)+j.y;
if(b.TouchScrollExtender._getNeedsScrollExtender()){a(document.body).bind({touchmove:a.proxy(this._compositeDragger,this),touchend:a.proxy(this._endDrag,this)});
}else{a(document.body).bind({mousemove:a.proxy(this._compositeDragger,this),mouseup:a.proxy(this._endDrag,this)});
}}},_getBorderBox:function(e){var c={left:0,top:0,right:0,bottom:0,horizontal:0,vertical:0};
if(window.getComputedStyle){var d=window.getComputedStyle(e,null);
c.left=parseInt(d.getPropertyValue("border-left-width"),10);
c.right=parseInt(d.getPropertyValue("border-right-width"),10);
c.top=parseInt(d.getPropertyValue("border-top-width"),10);
c.bottom=parseInt(d.getPropertyValue("border-bottom-width"),10);
}else{c.left=e.currentStyle.borderLeftWidth;
c.right=e.currentStyle.borderRightWidth;
c.top=e.currentStyle.borderTopWidth;
c.bottom=e.currentStyle.borderBottomWidth;
}c.horizontal=c.left+c.right;
c.vertical=c.top+c.bottom;
return c;
},_addScrollHints:function(){if(this._showScrollHints){var j=0;
var k=0;
var h=this._lastAnimator;
var d=h.element[0];
var c=this._getBorderBox(d);
var f=a(d).position();
if(this._hasHorizontalScrollHint){var g=h.element.innerWidth();
var l=~~((g/d.scrollWidth)*g)-2;
this._widthConstant=(l/g);
setTimeout(function(){j=Math.abs(d.scrollLeft)*(l/g)+f.left+c.left;
k=d.offsetHeight+f.top+c.top-7;
h.horizontalScrollHint.width(l).css({left:j,top:k});
},0);
h.horizontalScrollHint.fadeTo(200,0.5);
}if(this._hasVerticalScrollHint){var e=h.element.innerHeight();
var i=~~((e/d.scrollHeight)*e)-2;
this._heightConstant=(i/e);
setTimeout(function(){k=Math.abs(d.scrollTop)*(i/e)+f.top+c.top;
j=d.offsetWidth+f.left+c.left-7;
h.verticalScrollHint.height(i).css({left:j,top:k});
},0);
h.verticalScrollHint.fadeTo(200,0.5);
}}},_removeScrollHints:function(){if(this._showScrollHints){var c=this._lastAnimator.horizontalScrollHint;
var d=this._lastAnimator.verticalScrollHint;
if(this._hasHorizontalScrollHint&&c){c.hide();
}if(this._hasVerticalScrollHint&&d){d.hide();
}}},_simpleDragger:function(c){if(this._dragCanceled){return;
}this._cancelEvents(c);
var d=$telerik.getTouchEventLocation(c);
if(this._lastAnimator.element.length){this._throttleScroll(d);
this._alignScrollHints();
}this._storeLastLocation(d);
},_compositeDragger:function(c){if(this._dragCanceled){return;
}var g=$telerik.getTouchEventLocation(c);
var d=this._lastAnimator;
var f=d.element[0];
this._cancelEvents(c,d,g,"compositeDragger");
if(Math.abs(d.kX-g.x)>10||Math.abs(d.kY-g.y)>10){d.hasDragged=true;
this._addScrollHints();
if(b.TouchScrollExtender._getNeedsScrollExtender()){a(document.body).unbind("touchmove",this._compositeDragger).bind("touchmove",a.proxy(this._simpleDragger,this));
}else{a(document.body).unbind("mousemove",this._compositeDragger).bind("mousemove",a.proxy(this._simpleDragger,this));
}if($telerik.isIE){d.element.bind("click",this._cancelEvents);
f.setCapture(true);
}else{f.addEventListener("click",this._cancelEvents,true);
}}},disable:function(){this._detachEvents();
this._dragCanceled=true;
},enable:function(){this._dragCanceled=false;
},_onGestureStart:function(){this._detachEvents();
this._dragCanceled=true;
},_onGestureEnd:function(){this._dragCanceled=false;
},_endDrag:function(c){if(this._dragCanceled){return;
}this._cancelEvents(c);
this._detachEvents();
if(b.TouchScrollExtender._getNeedsScrollExtender()){if(this._lastAnimator.originalEvent.touches.length==1&&!this._lastAnimator.hasDragged){var h=this._lastAnimator.originalEvent;
var d=document.createEvent("MouseEvents");
d.initMouseEvent("click",h.bubbles,h.cancelable,h.view,h.detail,h.screenX,h.screenY,h.clientX,h.clientY,false,false,false,false,h.button,h.relatedTarget);
h.target.dispatchEvent(d);
}}var i=this;
var g=$telerik.getTouchEventLocation(c);
var f=this._lastAnimator;
if($telerik.isIE){setTimeout(function(){f.element.unbind("click",i._cancelEvents);
document.releaseCapture();
},10);
}else{setTimeout(function(){f.element[0].removeEventListener("click",i._cancelEvents,true);
},0);
}if(f.hasDragged){if(f.element.length){f.endX=g.x;
f.endY=g.y;
}this._finishDrag(f);
}},_detachEvents:function(){if(b.TouchScrollExtender._getNeedsScrollExtender()){a(document.body).unbind("touchmove",this._simpleDragger).unbind("touchmove",this._compositeDragger).unbind("touchend",this._endDrag);
}else{a(document.body).unbind("mousemove",this._simpleDragger).unbind("mousemove",this._compositeDragger).unbind("mouseup",this._endDrag);
}},_finishDrag:function(c){var e=c.element[0].scrollLeft+c.kX-c.endX;
var f=c.element[0].scrollTop+c.kY-c.endY;
c.kX=0;
c.kY=0;
var d=this;
c.element.stop(true).animate({scrollLeft:e,scrollTop:f},{duration:500,easing:"easeOutQuad",complete:function(){d._removeScrollHints();
},step:function(){d._alignScrollHints();
}});
if(this._hasHorizontalScrollHint&&c.horizontalScrollHint){c.horizontalScrollHint.stop().css("opacity",0.5).fadeTo(450,0);
}if(this._hasVerticalScrollHint&&c.verticalScrollHint){c.verticalScrollHint.stop().css("opacity",0.5).fadeTo(450,0);
}},_cancelEvents:function(c){c.stopPropagation();
c.preventDefault();
}};
Telerik.Web.UI.TouchScrollExtender.registerClass("Telerik.Web.UI.TouchScrollExtender",null,Sys.IDisposable);
})($telerik.$);
if(typeof(Sys)!=='undefined')Sys.Application.notifyScriptLoaded();
