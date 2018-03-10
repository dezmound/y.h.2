class Gesture {
    constructor() {
        this.targets = [];
        this.event = 'ongesture';
        this.triggerOn = null;
        this.gestureZone = null;
        this.handlers = {};
    }
    _afterBind() {
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
                _self.gestureZone.addEventListener(e, _self._handleZoneEvent);
            });
        }
    }
    _handleZoneEvent(e) {
    }
    bind(targets, triggerOn, zone) {
        let _self = this;
        this.targets = this.targets.concat(targets);
        this.targets.forEach(e => {
            e.releaseGesture = function (event) {
                let __self = this;
                if(_self.event === event) {
                    Object.keys(_self.handlers).forEach(e => {
                        _self.targets[_self.targets.indexOf(__self)].removeEventListener(e, _self.handlers[e]);
                    });
                    delete _self.targets[_self.targets.indexOf(__self)];
                }
            }
        });
        this.triggerOn = triggerOn;
        this.gestureZone = zone;
        this._afterBind();
    }
    _trigger() {
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
    _afterBind(){
        super._afterBind();
        this.draggable = this.targets[0];
        this.dropable = this.targets[1];
        let initialRect = this.draggable.getBoundingClientRect();
        this.draggable.dragGesture = { isRelease: true, x: initialRect.left, y: initialRect.top, cx: initialRect.width / 2, cy: initialRect.height / 2 };
        let pointerDownHandler = this._pointerDownHandler.bind(this);
        let pointerUpHandler = this._pointerUpHandler.bind(this);
        let pointerMoveHandler = this._pointerMoveHandler.bind(this);
        this.draggable.addEventListener('pointerdown', pointerDownHandler);
        this.draggable.addEventListener('pointerup', pointerUpHandler);
        this.draggable.addEventListener('pointermove', pointerMoveHandler);
        this.handlers = {
            'pointerdown': pointerDownHandler,
            'pointerup': pointerUpHandler,
            'pointermove': pointerMoveHandler
        };
    }
    _pointerDownHandler(e){
        console.log('pointerDown');
        this.draggable.dragGesture.isRelease = false;
        // this.draggable.setPointerCapture(e.pointerId);
    }
    _pointerMoveHandler(e){
        if(!this.draggable.dragGesture.isRelease) {
            let x = e.clientX;
            let y = e.clientY;
            let diffX = x - this.draggable.dragGesture.x - this.draggable.dragGesture.cx;
            let diffY = y - this.draggable.dragGesture.y - this.draggable.dragGesture.cy;
            let draggableRect = this.draggable.getBoundingClientRect();
            let dropableRect = this.dropable.getBoundingClientRect();
            if(!this.onRelease && this._intersectRect(draggableRect, dropableRect)){
                console.log('INTERSECTION!');
                this._trigger();
            }
            this.draggable.style.transform = `translate( ${diffX}px, ${diffY}px )`;
        }
    }
    _pointerUpHandler(e){
        console.log('pointerUp');
        this.draggable.dragGesture.isRelease = true;
        this.draggable.releasePointerCapture(e.pointerId);
        let draggableRect = this.draggable.getBoundingClientRect();
        let dropableRect = this.dropable.getBoundingClientRect();
        if(this.onRelease) {
            if(this._intersectRect(draggableRect, dropableRect)){
                console.log('INTERSECTION!');
                this._trigger();
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
    _afterBind(){
        super._afterBind();
        this.rotatable = this.targets[0];
        this.rotatable.rotateGesture = { isRotate: false };
        let pointerDownHandler = this._pointerDownHandler.bind(this);
        let pointerUpHandler = this._pointerUpHandler.bind(this);
        let pointerMoveHandler = this._pointerMoveHandler.bind(this);
        this.rotatable.addEventListener('pointerdown', pointerDownHandler);
        this.rotatable.addEventListener('pointerup', pointerUpHandler);
        this.rotatable.addEventListener('pointermove', pointerMoveHandler);
        this.handlers = {
            'pointerdown': pointerDownHandler,
            'pointerup': pointerUpHandler,
            'pointermove': pointerMoveHandler
        };
    }
    _pointerDownHandler(e){
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
    _pointerMoveHandler(e){
        const RAD_TO_DEG = 57.2958;
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
                if(Math.abs(Math.atan(calculations) * RAD_TO_DEG - this.angle) > 5) {
                    this.angle += Math.atan(calculations) * RAD_TO_DEG;
                    this.rotatable.rotateGesture.isRotate = true;
                    this.destonation = destonation;
                    this.oldAlpha = alpha;
                    this._trigger();
                }
                this.pointers = {};
            }
        } else {
            this.pointers[e.pointerId] = {x: e.clientX, y: e.clientY};
        }
    }
    _pointerUpHandler(e){
        let keys = Object.keys(this.pointers);
        this.oldAlpha = 0;
        keys.forEach(e => {
            this.rotatable.releasePointerCapture(e);
        });
        this.pointers = {};
        console.log('pointerUp');
    }
}