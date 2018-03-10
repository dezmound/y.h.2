class Gesture {
    constructor() {
        this.targets = [];
        this.event = 'ongesture';
        this.triggerOn = null;
        this.gestureZone = null;
        this.handlers = {};
    }
    afterBind() {
        let _self = this;
        if(this.gestureZone) {
            [
                'pointerdown',
                'pointerenter',
                'pointerleave',
                'pointerup',
                'pointermove',
                'pointerclose'
            ].forEach(e => {
                _self.gestureZone.addEventListener(e, _self.handleZoneEvent);
            });
        }
    }
    handleZoneEvent(e) {
    }
    bind(targets, triggerOn, zone) {
        let _self = this;
        this.targets = this.targets.concat(targets);
        this.targets.forEach(e => {
            e.releaseGesture = function (event) {
                let __self = this;
                if(_self.event == event) {
                    Object.keys(_self.handlers).forEach(e => {
                        _self.targets[_self.targets.indexOf(__self)].removeEventListener(e, _self.handlers[e]);
                    });
                    delete _self.targets[_self.targets.indexOf(__self)];
                }
            }
        });
        this.triggerOn = triggerOn;
        this.gestureZone = zone;
        this.afterBind();
    }
    trigger() {
        if(this.triggerOn) {
            this.triggerOn.dispatchEvent(new Event(this.event));
        }
    }
}

class DragOnGesture extends Gesture {
    constructor(options){
        super();
        options = Object.assign({
            onRelease: false
        }, options);
        this.event = 'ondragon';
        this.onRelease = options.onRelease;
    }
    _intersectRect(r1, r2) {
        return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    }
    afterBind(){
        super.afterBind();
        this.draggable = this.targets[0];
        this.dropable = this.targets[1];
        let initialRect = this.draggable.getBoundingClientRect();
        this.draggable.dragGesture = { isRelease: true, x: initialRect.left, y: initialRect.top, cx: initialRect.width / 2, cy: initialRect.height / 2 };
        let pointerDownHandler = this.pointerdownHandler.bind(this);
        let pointerUpHandler = this.pointerupHandler.bind(this);
        let pointerMoveHandler = this.pointermoveHandler.bind(this);
        this.draggable.addEventListener('pointerdown', pointerDownHandler);
        this.draggable.addEventListener('pointerup', pointerUpHandler);
        this.draggable.addEventListener('pointermove', pointerMoveHandler);
        this.handlers = {
            'pointerdown': pointerDownHandler,
            'pointerup': pointerUpHandler,
            'pointermove': pointerMoveHandler
        };
    }
    pointerdownHandler(e){
        console.log('pointerDown');
        this.draggable.dragGesture.isRelease = false;
        this.draggable.setPointerCapture(e.pointerId);
    }
    pointermoveHandler(e){
        if(!this.draggable.dragGesture.isRelease) {
            console.log(e.clientX, e.clientY);
            let x = e.clientX;
            let y = e.clientY;
            let diffX = x - this.draggable.dragGesture.x - this.draggable.dragGesture.cx;
            let diffY = y - this.draggable.dragGesture.y - this.draggable.dragGesture.cy;
            let draggable_rect = this.draggable.getBoundingClientRect();
            let dropable_rect = this.dropable.getBoundingClientRect();
            if(!this.onRelease && this._intersectRect(draggable_rect, dropable_rect)){
                console.log('INTERSECTION!');
                this.trigger();
            }
            this.draggable.style.transform = `translate( ${diffX}px, ${diffY}px )`;
        }
    }
    pointerupHandler(e){
        console.log('pointerUp');
        this.draggable.dragGesture.isRelease = true;
        this.draggable.releasePointerCapture(e.pointerId);
        let draggable_rect = this.draggable.getBoundingClientRect();
        let dropable_rect = this.dropable.getBoundingClientRect();
        if(this.onRelease) {
            if(this._intersectRect(draggable_rect, dropable_rect)){
                console.log('INTERSECTION!');
                this.trigger();
            }
        }
        this.triggerOn.dispatchEvent(new Event('ondragstop'));
    }
}

class RotateGesture extends Gesture {
    constructor() {
        super();
        this.pointers = {};
        this.destonation = 0;
        this.delta = 50;
        this.angle = 0;
        this.oldAlpha = 0;
        this.event = 'onrotate';
    }
    afterBind(){
        super.afterBind();
        this.rotatable = this.targets[0];
        this.rotatable.rotateGesture = { isRotate: false };
        let pointerDownHandler = this.pointerdownHandler.bind(this);
        let pointerUpHandler = this.pointerupHandler.bind(this);
        let pointerMoveHandler = this.pointermoveHandler.bind(this);
        this.rotatable.addEventListener('pointerdown', pointerDownHandler);
        this.rotatable.addEventListener('pointerup', pointerUpHandler);
        this.rotatable.addEventListener('pointermove', pointerMoveHandler);
        this.handlers = {
            'pointerdown': pointerDownHandler,
            'pointerup': pointerUpHandler,
            'pointermove': pointerMoveHandler
        };
    }
    pointerdownHandler(e){
        console.log('pointerDown');
        this.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        if(Object.keys(this.pointers).length === 2) {
            let keys = Object.keys(this.pointers);
            keys.forEach(e => {
                this.rotatable.setPointerCapture(e);
            });
            this.destonation = Math.sqrt(
                Math.pow(this.pointers[keys[1]].x - this.pointers[keys[0]].x, 2)
                + Math.pow(this.pointers[keys[1]].y - this.pointers[keys[0]].y, 2)
            );
            this.oldAlpha = (this.pointers[keys[1]].y - this.pointers[keys[0]].y) /
                (this.pointers[keys[1]].x - this.pointers[keys[0]].x);
        }
    }
    pointermoveHandler(e){
        let keys = Object.keys(this.pointers);
        if(keys.length === 2) {
            let destonation = Math.sqrt(
                Math.pow(this.pointers[keys[1]].x - this.pointers[keys[0]].x, 2)
                + Math.pow(this.pointers[keys[1]].y - this.pointers[keys[0]].y, 2)
            );
            if(Math.abs(destonation - this.destonation) < this.delta) {
                let alpha = (this.pointers[keys[1]].y - this.pointers[keys[0]].y) /
                    (this.pointers[keys[1]].x - this.pointers[keys[0]].x);
                let calculations = (alpha - this.oldAlpha) / (1 + alpha * this.oldAlpha);
                console.log(calculations, Math.abs(Math.acos(calculations) - this.angle) * 57.2958);
                if(Math.abs(Math.atan(calculations) * 57.2958 - this.angle) > 5) {
                    this.angle += Math.atan(calculations) * 57.2958;
                    this.rotatable.rotateGesture.isRotate = true;
                    this.destonation = destonation;
                    this.oldAlpha = alpha;
                    this.trigger();
                    console.log(this.angle, calculations);
                }
                this.pointers = {};
            }
        } else {
            this.pointers[e.pointerId] = {x: e.clientX, y: e.clientY};
        }
    }
    pointerupHandler(e){
        let keys = Object.keys(this.pointers);
        this.oldAlpha = 0;
        keys.forEach(e => {
            this.rotatable.releasePointerCapture(e);
        });
        this.pointers = {};
        console.log('pointerUp');
    }
}