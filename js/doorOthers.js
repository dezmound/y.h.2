// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door0(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttons = [
        this.popup.querySelector('.door-riddle__button_0'),
        this.popup.querySelector('.door-riddle__button_1'),
        this.popup.querySelector('.door-riddle__button_2')
    ];

    buttons.forEach(function(b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.classList.add('door-riddle__button_pressed');
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
    }

    /**
     * Проверяем, можно ли теперь открыть дверь
     */
    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function(b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });

        // Если все три кнопки зажаты одновременно, то откроем эту дверь
        if (isOpened) {
            this.unlock();
        }
    }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================

/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1(number, onUnlock) {
    DoorBase.apply(this, arguments);


    this.popup.addEventListener('onpopupopen', e => {
        this.popup.querySelector('.hint').classList.add('hint_1');
    });

    // ==== Напишите свой код для открытия второй двери здесь ====
    // Для примера дверь откроется просто по клику на неё
    let cart = 0x0;
    let dragGesture = new DragOnGesture();
    let dragGesture2 = new DragOnGesture();
    let button0 = this.popup.querySelector('.door-riddle__button_0');
    let drop0 = this.popup.querySelector('.drop-zone_1');
    let button1 = this.popup.querySelector('.door-riddle__button_1');
    let drop1 = this.popup.querySelector('.drop-zone_2');
    dragGesture.bind([
        button0,
        drop0
    ], drop0);
    drop0.addEventListener('ondragon', e => {
        cart |= 0x1;
        if(cart === 0x3 && this.isLocked){
            this.unlock();
        }
    });
    drop0.addEventListener('ondragstop', e => {
        cart &= 0x2;
        button0.style.transform = 'translate(0, 0)';
    });
    dragGesture2.bind([
        button1,
        drop1
    ], drop1);
    drop1.addEventListener('ondragon', e => {
        cart |= 0x2;
        if(cart === 0x3 && this.isLocked){
            this.unlock();
        }
    });
    drop1.addEventListener('ondragstop', e => {
        cart &= 0x1;
        button1.style.transform = 'translate(0, 0)';
    });

    // ==== END Напишите свой код для открытия второй двери здесь ====
}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2(number, onUnlock) {
    DoorBase.apply(this, arguments);


    this.popup.addEventListener('onpopupopen', e => {
        this.popup.querySelector('.hint').classList.add('hint_2');
    });
    // ==== Напишите свой код для открытия третей двери здесь ====
    // Для примера дверь откроется просто по клику на неё
    let lock = 0x0;
    let dragGesture = new DragOnGesture({onRelease: true});
    let dragGesture2 = new DragOnGesture({onRelease: true});
    let dragGesture3 = new DragOnGesture({onRelease: true});
    let gear_purple = this.popup.querySelector('.gear-c_purple');
    let gear_yellow = this.popup.querySelector('.gear-c_yellow');
    let gear_gray = this.popup.querySelector('.gear-c_gray');
    let drop_purple = this.popup.querySelector('.drop-zone_gear_3');
    let drop_yellow = this.popup.querySelector('.drop-zone_gear_1');
    let drop_gray = this.popup.querySelector('.drop-zone_gear_2');

    dragGesture.bind([
        gear_purple,
        drop_purple
    ], drop_purple);
    dragGesture2.bind([
        gear_yellow,
        drop_yellow
    ], drop_yellow);
    dragGesture3.bind([
        gear_gray,
        drop_gray
    ], drop_gray);

    drop_purple.addEventListener('ondragon', e => {
        lock |= 0x1;
        gear_purple.releaseGesture('ondragon');
        gear_purple.querySelector('.gear').classList.add('spin');
        if(lock === 0x7 && this.isLocked) {
            setTimeout(e => this.unlock(), 0);
        }
    });
    drop_yellow.addEventListener('ondragon', e => {
        lock |= 0x2;
        gear_yellow.releaseGesture('ondragon');
        gear_yellow.querySelector('.gear').classList.add('spin');
        if(lock === 0x7 && this.isLocked) {
            setTimeout(e => this.unlock(), 0);
        }
    });
    drop_gray.addEventListener('ondragon', e => {
        lock |= 0x4;
        gear_gray.releaseGesture('ondragon');
        gear_gray.querySelector('.gear').classList.add('spin');
        if(lock === 0x7 && this.isLocked) {
            setTimeout(e => this.unlock(), 0);
        }
    });

    // ==== END Напишите свой код для открытия третей двери здесь ====
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box(number, onUnlock) {
    DoorBase.apply(this, arguments);


    this.popup.addEventListener('onpopupopen', e => {
        this.popup.querySelector('.hint').classList.add('hint_3');
    });

    // ==== Напишите свой код для открытия сундука здесь ====
    // Для примера сундук откроется просто по клику на него
    let rotateGesture = new RotateGesture();
    let rotateGesture1 = new RotateGesture();
    let rotateGesture2 = new RotateGesture();
    let lock_1 = document.querySelector('.lock_1');
    let lock_2 = document.querySelector('.lock_2');
    let lock_3 = document.querySelector('.lock_3');
    let lock = 0x0;
    rotateGesture.bind([lock_1], lock_1);
    lock_1.addEventListener('onrotate', e => {
        lock_1.style.transform = `rotate(${ rotateGesture.angle }deg)`;
        if(Math.abs(90 - Math.abs(rotateGesture.angle)) < 20) {
            lock_1.releaseGesture('onrotate');
            lock_1.classList.add('blink');
            lock |= 0x1;
            if(lock === 0x7 && this.isLocked) {
                this.unlock();
            }
        }
    });
    rotateGesture1.bind([lock_2], lock_2);
    lock_2.addEventListener('onrotate', e => {
        lock_2.style.transform = `rotate(${ rotateGesture1.angle }deg)`;
        if(Math.abs(90 - Math.abs(rotateGesture1.angle)) < 20) {
            lock_2.releaseGesture('onrotate');
            lock_2.classList.add('blink');
            lock |= 0x2;
            if(lock === 0x7 && this.isLocked) {
                this.unlock();
            }
        }
    });
    rotateGesture2.bind([lock_3], lock_3);
    lock_3.addEventListener('onrotate', e => {
        lock_3.style.transform = `rotate(${ rotateGesture2.angle }deg)`;
        if(Math.abs(180 - Math.abs(rotateGesture2.angle)) < 20) {
            lock_3.releaseGesture('onrotate');
            lock_3.classList.add('blink');
            lock |= 0x4;
            if(lock === 0x7 && this.isLocked) {
                this.unlock();
            }
        }
    });
    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function() {
        alert('Поздравляю! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;
