(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{Azqq:function(e,t,n){"use strict";n.d(t,"a",function(){return s}),n.d(t,"b",function(){return d});var i=n("CcnG"),o=(n("uGex"),n("Ip0R")),l=n("eDkP"),r=n("Fzqc"),s=(n("M2Lx"),n("4c35"),n("dWZg"),n("qAlS"),n("Wf4p"),n("seP3"),n("gIcY"),i["\u0275crt"]({encapsulation:2,styles:[".mat-select{display:inline-block;width:100%;outline:0}.mat-select-trigger{display:inline-table;cursor:pointer;position:relative;box-sizing:border-box}.mat-select-disabled .mat-select-trigger{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}.mat-select-value{display:table-cell;max-width:0;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mat-select-value-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mat-select-arrow-wrapper{display:table-cell;vertical-align:middle}.mat-form-field-appearance-fill .mat-select-arrow-wrapper,.mat-form-field-appearance-standard .mat-select-arrow-wrapper{transform:translateY(-50%)}.mat-form-field-appearance-outline .mat-select-arrow-wrapper{transform:translateY(-25%)}.mat-select-arrow{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid;margin:0 4px}.mat-select-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;padding-top:0;padding-bottom:0;max-height:256px;min-width:100%}.mat-select-panel:not([class*=mat-elevation-z]){box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12)}@media screen and (-ms-high-contrast:active){.mat-select-panel{outline:solid 1px}}.mat-select-panel .mat-optgroup-label,.mat-select-panel .mat-option{font-size:inherit;line-height:3em;height:3em}.mat-form-field-type-mat-select:not(.mat-form-field-disabled) .mat-form-field-flex{cursor:pointer}.mat-form-field-type-mat-select .mat-form-field-label{width:calc(100% - 18px)}.mat-select-placeholder{transition:color .4s .133s cubic-bezier(.25,.8,.25,1)}._mat-animation-noopable .mat-select-placeholder{transition:none}.mat-form-field-hide-placeholder .mat-select-placeholder{color:transparent;-webkit-text-fill-color:transparent;transition:none;display:block}"],data:{animation:[{type:7,name:"transformPanel",definitions:[{type:0,name:"void",styles:{type:6,styles:{transform:"scaleY(0)",minWidth:"100%",opacity:0},offset:null},options:void 0},{type:0,name:"showing",styles:{type:6,styles:{opacity:1,minWidth:"calc(100% + 32px)",transform:"scaleY(1)"},offset:null},options:void 0},{type:0,name:"showing-multiple",styles:{type:6,styles:{opacity:1,minWidth:"calc(100% + 64px)",transform:"scaleY(1)"},offset:null},options:void 0},{type:1,expr:"void => *",animation:{type:3,steps:[{type:11,selector:"@fadeInContent",animation:{type:9,options:null},options:null},{type:4,styles:null,timings:"150ms cubic-bezier(0.25, 0.8, 0.25, 1)"}],options:null},options:null},{type:1,expr:"* => void",animation:[{type:4,styles:{type:6,styles:{opacity:0},offset:null},timings:"250ms 100ms linear"}],options:null}],options:{}},{type:7,name:"fadeInContent",definitions:[{type:0,name:"showing",styles:{type:6,styles:{opacity:1},offset:null},options:void 0},{type:1,expr:"void => showing",animation:[{type:6,styles:{opacity:0},offset:null},{type:4,styles:null,timings:"150ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)"}],options:null}],options:{}}]}}));function a(e){return i["\u0275vid"](0,[(e()(),i["\u0275eld"](0,0,null,null,1,"span",[["class","mat-select-placeholder"]],null,null,null,null,null)),(e()(),i["\u0275ted"](1,null,["",""]))],null,function(e,t){e(t,1,0,t.component.placeholder||"\xa0")})}function c(e){return i["\u0275vid"](0,[(e()(),i["\u0275eld"](0,0,null,null,1,"span",[],null,null,null,null,null)),(e()(),i["\u0275ted"](1,null,["",""]))],null,function(e,t){e(t,1,0,t.component.triggerValue||"\xa0")})}function p(e){return i["\u0275vid"](0,[i["\u0275ncd"](null,0),(e()(),i["\u0275and"](0,null,null,0))],null,null)}function u(e){return i["\u0275vid"](0,[(e()(),i["\u0275eld"](0,0,null,null,5,"span",[["class","mat-select-value-text"]],null,null,null,null,null)),i["\u0275did"](1,16384,null,0,o.r,[],{ngSwitch:[0,"ngSwitch"]},null),(e()(),i["\u0275and"](16777216,null,null,1,null,c)),i["\u0275did"](3,16384,null,0,o.t,[i.ViewContainerRef,i.TemplateRef,o.r],null,null),(e()(),i["\u0275and"](16777216,null,null,1,null,p)),i["\u0275did"](5,278528,null,0,o.s,[i.ViewContainerRef,i.TemplateRef,o.r],{ngSwitchCase:[0,"ngSwitchCase"]},null)],function(e,t){e(t,1,0,!!t.component.customTrigger),e(t,5,0,!0)},null)}function h(e){return i["\u0275vid"](0,[(e()(),i["\u0275eld"](0,0,[[2,0],["panel",1]],null,3,"div",[],[[24,"@transformPanel",0],[4,"transformOrigin",null],[2,"mat-select-panel-done-animating",null],[4,"font-size","px"]],[[null,"@transformPanel.done"],[null,"keydown"]],function(e,t,n){var i=!0,o=e.component;return"@transformPanel.done"===t&&(i=!1!==o._panelDoneAnimatingStream.next(n.toState)&&i),"keydown"===t&&(i=!1!==o._handleKeydown(n)&&i),i},null,null)),i["\u0275did"](1,278528,null,0,o.l,[i.IterableDiffers,i.KeyValueDiffers,i.ElementRef,i.Renderer2],{klass:[0,"klass"],ngClass:[1,"ngClass"]},null),(e()(),i["\u0275eld"](2,0,null,null,1,"div",[["class","mat-select-content"]],[[24,"@fadeInContent",0]],[[null,"@fadeInContent.done"]],function(e,t,n){var i=!0;return"@fadeInContent.done"===t&&(i=!1!==e.component._onFadeInDone()&&i),i},null,null)),i["\u0275ncd"](null,1)],function(e,t){var n=t.component;e(t,1,0,i["\u0275inlineInterpolate"](1,"mat-select-panel ",n._getPanelTheme(),""),n.panelClass)},function(e,t){var n=t.component;e(t,0,0,n.multiple?"showing-multiple":"showing",n._transformOrigin,n._panelDoneAnimating,n._triggerFontSize),e(t,2,0,"showing")})}function d(e){return i["\u0275vid"](2,[i["\u0275qud"](402653184,1,{trigger:0}),i["\u0275qud"](671088640,2,{panel:0}),i["\u0275qud"](402653184,3,{overlayDir:0}),(e()(),i["\u0275eld"](3,0,[[1,0],["trigger",1]],null,9,"div",[["aria-hidden","true"],["cdk-overlay-origin",""],["class","mat-select-trigger"]],null,[[null,"click"]],function(e,t,n){var i=!0;return"click"===t&&(i=!1!==e.component.toggle()&&i),i},null,null)),i["\u0275did"](4,16384,[["origin",4]],0,l.b,[i.ElementRef],null,null),(e()(),i["\u0275eld"](5,0,null,null,5,"div",[["class","mat-select-value"]],null,null,null,null,null)),i["\u0275did"](6,16384,null,0,o.r,[],{ngSwitch:[0,"ngSwitch"]},null),(e()(),i["\u0275and"](16777216,null,null,1,null,a)),i["\u0275did"](8,278528,null,0,o.s,[i.ViewContainerRef,i.TemplateRef,o.r],{ngSwitchCase:[0,"ngSwitchCase"]},null),(e()(),i["\u0275and"](16777216,null,null,1,null,u)),i["\u0275did"](10,278528,null,0,o.s,[i.ViewContainerRef,i.TemplateRef,o.r],{ngSwitchCase:[0,"ngSwitchCase"]},null),(e()(),i["\u0275eld"](11,0,null,null,1,"div",[["class","mat-select-arrow-wrapper"]],null,null,null,null,null)),(e()(),i["\u0275eld"](12,0,null,null,0,"div",[["class","mat-select-arrow"]],null,null,null,null,null)),(e()(),i["\u0275and"](16777216,null,null,1,function(e,t,n){var i=!0,o=e.component;return"backdropClick"===t&&(i=!1!==o.close()&&i),"attach"===t&&(i=!1!==o._onAttached()&&i),"detach"===t&&(i=!1!==o.close()&&i),i},h)),i["\u0275did"](14,671744,[[3,4]],0,l.a,[l.d,i.TemplateRef,i.ViewContainerRef,l.k,[2,r.b]],{origin:[0,"origin"],positions:[1,"positions"],offsetY:[2,"offsetY"],minWidth:[3,"minWidth"],backdropClass:[4,"backdropClass"],scrollStrategy:[5,"scrollStrategy"],open:[6,"open"],hasBackdrop:[7,"hasBackdrop"],lockPosition:[8,"lockPosition"]},{backdropClick:"backdropClick",attach:"attach",detach:"detach"})],function(e,t){var n=t.component;e(t,6,0,n.empty),e(t,8,0,!0),e(t,10,0,!1),e(t,14,0,i["\u0275nov"](t,4),n._positions,n._offsetY,null==n._triggerRect?null:n._triggerRect.width,"cdk-overlay-transparent-backdrop",n._scrollStrategy,n.panelOpen,"","")},null)}},uGex:function(e,t,n){"use strict";n.d(t,"d",function(){return k}),n.d(t,"a",function(){return O}),n.d(t,"b",function(){return w}),n.d(t,"c",function(){return C}),n("ihYY");var i=n("mrSG"),o=n("lLAP"),l=n("n6gG"),r=n("YlbQ"),s=n("YSh2"),a=(n("eDkP"),n("CcnG")),c=n("Wf4p"),p=n("K9Ia"),u=n("lYZG"),h=n("p0ib"),d=n("t9fZ"),f=n("15JJ"),g=n("VnD/"),m=n("67Y/"),_=n("ad02"),y=n("ny24"),b=n("p0Sj"),v=0,O=new a.InjectionToken("mat-select-scroll-strategy");function w(e){return function(){return e.scrollStrategies.reposition()}}var C=function(e){function t(t,n,i,o,l,r,s,c,_,y,b,O){var w=e.call(this,l,o,s,c,y)||this;return w._viewportRuler=t,w._changeDetectorRef=n,w._ngZone=i,w._dir=r,w._parentFormField=_,w.ngControl=y,w._scrollStrategyFactory=O,w._panelOpen=!1,w._required=!1,w._scrollTop=0,w._multiple=!1,w._compareWith=function(e,t){return e===t},w._uid="mat-select-"+v++,w._destroy=new p.a,w._triggerFontSize=0,w._onChange=function(){},w._onTouched=function(){},w._optionIds="",w._transformOrigin="top",w._panelDoneAnimating=!1,w._panelDoneAnimatingStream=new p.a,w._scrollStrategy=w._scrollStrategyFactory(),w._offsetY=0,w._positions=[{originX:"start",originY:"top",overlayX:"start",overlayY:"top"},{originX:"start",originY:"bottom",overlayX:"start",overlayY:"bottom"}],w._disableOptionCentering=!1,w._focused=!1,w.controlType="mat-select",w.ariaLabel="",w.optionSelectionChanges=Object(u.a)(function(){return w.options?h.a.apply(void 0,w.options.map(function(e){return e.onSelectionChange})):w._ngZone.onStable.asObservable().pipe(Object(d.a)(1),Object(f.a)(function(){return w.optionSelectionChanges}))}),w.openedChange=new a.EventEmitter,w._openedStream=w.openedChange.pipe(Object(g.a)(function(e){return e}),Object(m.a)(function(){})),w._closedStream=w.openedChange.pipe(Object(g.a)(function(e){return!e}),Object(m.a)(function(){})),w.selectionChange=new a.EventEmitter,w.valueChange=new a.EventEmitter,w.ngControl&&(w.ngControl.valueAccessor=w),w.tabIndex=parseInt(b)||0,w.id=w.id,w}return Object(i.c)(t,e),Object.defineProperty(t.prototype,"focused",{get:function(){return this._focused||this._panelOpen},set:function(e){this._focused=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"placeholder",{get:function(){return this._placeholder},set:function(e){this._placeholder=e,this.stateChanges.next()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"required",{get:function(){return this._required},set:function(e){this._required=Object(l.b)(e),this.stateChanges.next()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"multiple",{get:function(){return this._multiple},set:function(e){if(this._selectionModel)throw Error("Cannot change `multiple` mode of select after initialization.");this._multiple=Object(l.b)(e)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"disableOptionCentering",{get:function(){return this._disableOptionCentering},set:function(e){this._disableOptionCentering=Object(l.b)(e)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"compareWith",{get:function(){return this._compareWith},set:function(e){if("function"!=typeof e)throw Error("`compareWith` must be a function.");this._compareWith=e,this._selectionModel&&this._initializeSelection()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"value",{get:function(){return this._value},set:function(e){e!==this._value&&(this.writeValue(e),this._value=e)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"id",{get:function(){return this._id},set:function(e){this._id=e||this._uid,this.stateChanges.next()},enumerable:!0,configurable:!0}),t.prototype.ngOnInit=function(){var e=this;this._selectionModel=new r.a(this.multiple),this.stateChanges.next(),this._panelDoneAnimatingStream.pipe(Object(_.a)(),Object(y.a)(this._destroy)).subscribe(function(){e.panelOpen?(e._scrollTop=0,e.openedChange.emit(!0)):(e.openedChange.emit(!1),e._panelDoneAnimating=!1,e.overlayDir.offsetX=0,e._changeDetectorRef.markForCheck())})},t.prototype.ngAfterContentInit=function(){var e=this;this._initKeyManager(),this._selectionModel.onChange.pipe(Object(y.a)(this._destroy)).subscribe(function(e){e.added.forEach(function(e){return e.select()}),e.removed.forEach(function(e){return e.deselect()})}),this.options.changes.pipe(Object(b.a)(null),Object(y.a)(this._destroy)).subscribe(function(){e._resetOptions(),e._initializeSelection()})},t.prototype.ngDoCheck=function(){this.ngControl&&this.updateErrorState()},t.prototype.ngOnChanges=function(e){e.disabled&&this.stateChanges.next()},t.prototype.ngOnDestroy=function(){this._destroy.next(),this._destroy.complete(),this.stateChanges.complete()},t.prototype.toggle=function(){this.panelOpen?this.close():this.open()},t.prototype.open=function(){var e=this;!this.disabled&&this.options&&this.options.length&&!this._panelOpen&&(this._triggerRect=this.trigger.nativeElement.getBoundingClientRect(),this._triggerFontSize=parseInt(getComputedStyle(this.trigger.nativeElement)["font-size"]),this._panelOpen=!0,this._keyManager.withHorizontalOrientation(null),this._calculateOverlayPosition(),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this._ngZone.onStable.asObservable().pipe(Object(d.a)(1)).subscribe(function(){e._triggerFontSize&&e.overlayDir.overlayRef&&e.overlayDir.overlayRef.overlayElement&&(e.overlayDir.overlayRef.overlayElement.style.fontSize=e._triggerFontSize+"px")}))},t.prototype.close=function(){this._panelOpen&&(this._panelOpen=!1,this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched())},t.prototype.writeValue=function(e){this.options&&this._setSelectionByValue(e)},t.prototype.registerOnChange=function(e){this._onChange=e},t.prototype.registerOnTouched=function(e){this._onTouched=e},t.prototype.setDisabledState=function(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next()},Object.defineProperty(t.prototype,"panelOpen",{get:function(){return this._panelOpen},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"selected",{get:function(){return this.multiple?this._selectionModel.selected:this._selectionModel.selected[0]},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"triggerValue",{get:function(){if(this.empty)return"";if(this._multiple){var e=this._selectionModel.selected.map(function(e){return e.viewValue});return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue},enumerable:!0,configurable:!0}),t.prototype._isRtl=function(){return!!this._dir&&"rtl"===this._dir.value},t.prototype._handleKeydown=function(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e))},t.prototype._handleClosedKeydown=function(e){var t=e.keyCode;t===s.d||t===s.j||(this.multiple||e.altKey)&&(t===s.b||t===s.l||t===s.g||t===s.i)?(e.preventDefault(),this.open()):this.multiple||this._keyManager.onKeydown(e)},t.prototype._handleOpenKeydown=function(e){var t=e.keyCode,n=t===s.b||t===s.l,i=this._keyManager;if(t===s.f||t===s.c)e.preventDefault(),t===s.f?i.setFirstItemActive():i.setLastItemActive();else if(n&&e.altKey)e.preventDefault(),this.close();else if(t!==s.d&&t!==s.j||!i.activeItem)if(this._multiple&&t===s.a&&e.ctrlKey){e.preventDefault();var o=this.options.some(function(e){return!e.disabled&&!e.selected});this.options.forEach(function(e){e.disabled||(o?e.select():e.deselect())})}else{var l=i.activeItemIndex;i.onKeydown(e),this._multiple&&n&&e.shiftKey&&i.activeItem&&i.activeItemIndex!==l&&i.activeItem._selectViaInteraction()}else e.preventDefault(),i.activeItem._selectViaInteraction()},t.prototype._onFadeInDone=function(){this._panelDoneAnimating=this.panelOpen,this._changeDetectorRef.markForCheck()},t.prototype._onFocus=function(){this.disabled||(this._focused=!0,this.stateChanges.next())},t.prototype._onBlur=function(){this._focused=!1,this.disabled||this.panelOpen||(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next())},t.prototype._onAttached=function(){var e=this;this.overlayDir.positionChange.pipe(Object(d.a)(1)).subscribe(function(){e._changeDetectorRef.detectChanges(),e._calculateOverlayOffsetX(),e.panel.nativeElement.scrollTop=e._scrollTop})},t.prototype._getPanelTheme=function(){return this._parentFormField?"mat-"+this._parentFormField.color:""},Object.defineProperty(t.prototype,"empty",{get:function(){return!this._selectionModel||this._selectionModel.isEmpty()},enumerable:!0,configurable:!0}),t.prototype._initializeSelection=function(){var e=this;Promise.resolve().then(function(){e._setSelectionByValue(e.ngControl?e.ngControl.value:e._value)})},t.prototype._setSelectionByValue=function(e){var t=this;if(this.multiple&&e){if(!Array.isArray(e))throw Error("Value must be an array in multiple-selection mode.");this._selectionModel.clear(),e.forEach(function(e){return t._selectValue(e)}),this._sortValues()}else{this._selectionModel.clear();var n=this._selectValue(e);n&&this._keyManager.setActiveItem(n)}this._changeDetectorRef.markForCheck()},t.prototype._selectValue=function(e){var t=this,n=this.options.find(function(n){try{return null!=n.value&&t._compareWith(n.value,e)}catch(e){return Object(a.isDevMode)()&&console.warn(e),!1}});return n&&this._selectionModel.select(n),n},t.prototype._initKeyManager=function(){var e=this;this._keyManager=new o.b(this.options).withTypeAhead().withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._keyManager.tabOut.pipe(Object(y.a)(this._destroy)).subscribe(function(){e.focus(),e.close()}),this._keyManager.change.pipe(Object(y.a)(this._destroy)).subscribe(function(){e._panelOpen&&e.panel?e._scrollActiveOptionIntoView():e._panelOpen||e.multiple||!e._keyManager.activeItem||e._keyManager.activeItem._selectViaInteraction()})},t.prototype._resetOptions=function(){var e=this,t=Object(h.a)(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(Object(y.a)(t)).subscribe(function(t){e._onSelect(t.source,t.isUserInput),t.isUserInput&&!e.multiple&&e._panelOpen&&(e.close(),e.focus())}),h.a.apply(void 0,this.options.map(function(e){return e._stateChanges})).pipe(Object(y.a)(t)).subscribe(function(){e._changeDetectorRef.markForCheck(),e.stateChanges.next()}),this._setOptionIds()},t.prototype._onSelect=function(e,t){var n=this._selectionModel.isSelected(e);null!=e.value||this._multiple?(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e),t&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),t&&this.focus())):(e.deselect(),this._selectionModel.clear(),this._propagateChanges(e.value)),n!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next()},t.prototype._sortValues=function(){if(this.multiple){var e=this.options.toArray();this._selectionModel.sort(function(t,n){return e.indexOf(t)-e.indexOf(n)}),this.stateChanges.next()}},t.prototype._propagateChanges=function(e){var t;t=this.multiple?this.selected.map(function(e){return e.value}):this.selected?this.selected.value:e,this._value=t,this.valueChange.emit(t),this._onChange(t),this.selectionChange.emit(new function(e,t){this.source=e,this.value=t}(this,t)),this._changeDetectorRef.markForCheck()},t.prototype._setOptionIds=function(){this._optionIds=this.options.map(function(e){return e.id}).join(" ")},t.prototype._highlightCorrectOption=function(){this._keyManager&&(this.empty?this._keyManager.setFirstItemActive():this._keyManager.setActiveItem(this._selectionModel.selected[0]))},t.prototype._scrollActiveOptionIntoView=function(){var e=this._keyManager.activeItemIndex||0,t=Object(c.y)(e,this.options,this.optionGroups);this.panel.nativeElement.scrollTop=Object(c.z)(e+t,this._getItemHeight(),this.panel.nativeElement.scrollTop,256)},t.prototype.focus=function(){this._elementRef.nativeElement.focus()},t.prototype._getOptionIndex=function(e){return this.options.reduce(function(t,n,i){return void 0===t?e===n?i:void 0:t},void 0)},t.prototype._calculateOverlayPosition=function(){var e=this._getItemHeight(),t=this._getItemCount(),n=Math.min(t*e,256),i=t*e-n,o=this.empty?0:this._getOptionIndex(this._selectionModel.selected[0]);o+=Object(c.y)(o,this.options,this.optionGroups);var l=n/2;this._scrollTop=this._calculateOverlayScroll(o,l,i),this._offsetY=this._calculateOverlayOffsetY(o,l,i),this._checkOverlayWithinViewport(i)},t.prototype._calculateOverlayScroll=function(e,t,n){var i=this._getItemHeight();return Math.min(Math.max(0,i*e-t+i/2),n)},t.prototype._getAriaLabel=function(){return this.ariaLabelledby?null:this.ariaLabel||this.placeholder},t.prototype._getAriaLabelledby=function(){return this.ariaLabelledby?this.ariaLabelledby:this._parentFormField&&this._parentFormField._hasFloatingLabel()&&!this._getAriaLabel()&&this._parentFormField._labelId||null},t.prototype._getAriaActiveDescendant=function(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null},t.prototype._calculateOverlayOffsetX=function(){var e,t=this.overlayDir.overlayRef.overlayElement.getBoundingClientRect(),n=this._viewportRuler.getViewportSize(),i=this._isRtl(),o=this.multiple?60:32;if(this.multiple)e=44;else{var l=this._selectionModel.selected[0]||this.options.first;e=l&&l.group?32:16}i||(e*=-1);var r=0-(t.left+e-(i?o:0)),s=t.right+e-n.width+(i?0:o);r>0?e+=r+8:s>0&&(e-=s+8),this.overlayDir.offsetX=Math.round(e),this.overlayDir.overlayRef.updatePosition()},t.prototype._calculateOverlayOffsetY=function(e,t,n){var i,o=this._getItemHeight(),l=(o-this._triggerRect.height)/2,r=Math.floor(256/o);return this._disableOptionCentering?0:(i=0===this._scrollTop?e*o:this._scrollTop===n?(e-(this._getItemCount()-r))*o+(o-(this._getItemCount()*o-256)%o):t-o/2,Math.round(-1*i-l))},t.prototype._checkOverlayWithinViewport=function(e){var t=this._getItemHeight(),n=this._viewportRuler.getViewportSize(),i=this._triggerRect.top-8,o=n.height-this._triggerRect.bottom-8,l=Math.abs(this._offsetY),r=Math.min(this._getItemCount()*t,256)-l-this._triggerRect.height;r>o?this._adjustPanelUp(r,o):l>i?this._adjustPanelDown(l,i,e):this._transformOrigin=this._getOriginBasedOnOption()},t.prototype._adjustPanelUp=function(e,t){var n=Math.round(e-t);this._scrollTop-=n,this._offsetY-=n,this._transformOrigin=this._getOriginBasedOnOption(),this._scrollTop<=0&&(this._scrollTop=0,this._offsetY=0,this._transformOrigin="50% bottom 0px")},t.prototype._adjustPanelDown=function(e,t,n){var i=Math.round(e-t);if(this._scrollTop+=i,this._offsetY+=i,this._transformOrigin=this._getOriginBasedOnOption(),this._scrollTop>=n)return this._scrollTop=n,this._offsetY=0,void(this._transformOrigin="50% top 0px")},t.prototype._getOriginBasedOnOption=function(){var e=this._getItemHeight(),t=(e-this._triggerRect.height)/2;return"50% "+(Math.abs(this._offsetY)-t+e/2)+"px 0px"},t.prototype._getItemCount=function(){return this.options.length+this.optionGroups.length},t.prototype._getItemHeight=function(){return 3*this._triggerFontSize},t.prototype.setDescribedByIds=function(e){this._ariaDescribedby=e.join(" ")},t.prototype.onContainerClick=function(){this.focus(),this.open()},Object.defineProperty(t.prototype,"shouldLabelFloat",{get:function(){return this._panelOpen||!this.empty},enumerable:!0,configurable:!0}),t}(Object(c.B)(Object(c.E)(Object(c.C)(Object(c.D)(function(e,t,n,i,o){this._elementRef=e,this._defaultErrorStateMatcher=t,this._parentForm=n,this._parentFormGroup=i,this.ngControl=o}))))),k=function(){}}}]);