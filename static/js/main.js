
var flight = {
    //perfomance multiplier, higher value is more precise, may affect perfomance
    mpl: 10000,
    // initial flight conditions
    init: {
        'speed': 0,
        'time': 0,
        'alt': 0
    },
    // mutable "realtime" values
    alt: 0,
    speed: 0,
    time: 0,
    status: '',
    g: 0,
    startG: 0,
    drag: 0,
    body: {},
    //ship drag params
    ship: {
        currentThrust: 0,
        fullShipThrust: 0,
        emptyShipThrust: 0,
        thrustTime: 0, //seconds
        thrustChangePerSec: 0
    },
    _reset: function() {
        this.status = 'flight';
        this.g =  0; // m/s
        this.startG = 0;// m/s
        this.time = 0; // s
        this.alt =  0; // m
        this.speed = 0; // m/s
        this.drag = 0; // m/s
    },
    setBody: function(selectedBody) {
        this.body = selectedBody;
    },
    setShip: function(params) {
        this.ship.currentThrust = this.ship.fullShipThrust = options.full;
        this.ship.emptyShipThrust = options.empty;
        this.ship.thrustTime = options.time;
        this.ship.thrustChangePerSec =
    },
    setInitialConditions: function(timeLimit, startSpeed, startAlt) {
        this._reset();
        this.time = 0;
        this.alt = startAlt;
        this.speed = startSpeed;
        this.init.speed = startSpeed;
        this.init.time = timeLimit;
        this.init.alt = startAlt;
    },
    calculate: function(drag) {
        this.drag = drag;
        console.log(this);

        for (var i=this.init.time; i >= 0; i--) {
            for (var j=0; j <= this.mpl; j++) {
                if(this.alt - this.speed > 0) {
                    var altRatio = (this.body.r + this.alt) * (this.body.r + this.alt);
                    this.g = window.bodies['G'] * (this.body.m / altRatio);

                    this.time = (this.init.time - i) + Number(j / this.mpl);
                    this.speed = this.speed + (Number(this.g - this.drag) / this.mpl);
                    this.alt = this.alt - (this.speed / this.mpl);

                } else {
                    this.status = 'crash';
                    return this._roundResults();
                }
            }
            if(i == this.init.time) {
                this.startG  = this.g;
            }
            j = 0;
        }

        return this._roundResults();
    },
    _roundResults: function() {
        return {
            status: this.status,
            g: Number(this.g).toFixed(4),
            startG: Number(this.startG).toFixed(4),
            timeLimit: Number(this.init.time).toFixed(0),
            time: Number(this.time).toFixed(0),
            alt: Number(this.alt).toFixed(4),
            speed: Number(this.speed).toFixed(4),
            drag: this.drag
        }
    }
};

$(document).ready(function() {
    var lastCalc = {};
    $('#calc').on('click', function() {
        var body = window.bodies[$('#body option:selected').val()];
        var timeLimit = Number($('#time').val()) || 600;
        var startSpeed = Number($('#speed').val()) || 0;
        var startAlt = Number($('#alt').val()) || body.defaultStartAlt;
        var drag = Number($('#drag').val());

        flight.setBody(body);
        flight.setInitialConditions(timeLimit, startSpeed, startAlt);
        var calc = flight.calculate(drag);

        console.log(calc);
        calc.statusMsg = (calc.status === 'crash')?'Ситуация у поверхности (за 1 сек): ':'Ситуация: ';

        calc.statusTitle = (calc.status === 'crash')?'Падение на секунде ' + (Number(calc.time) + 1) + ' (~' + Math.round(calc.time / 60) + ' мин.)':'Падение продолжается на секунде ' + calc.time + ' (~' + Math.round(calc.time / 60) + ' мин.)';

        var formattedCalc = j.calcResult({'data': calc, 'init': {
            alt: startAlt,
            speed: startSpeed,
            timeLimit: timeLimit
        }});
        $('#flight').html(formattedCalc);

    });

    $('div.calculation').on('click', 'button#add',function() {
        lastCalc = {
            alt: $('#calcAlt').val(),
            speed: $('#calcSpeed').val(),
            time: $('#calcTime').val(),
            misc: {
                drag: $('#nextDrag').val(),
                dragTime: $('#nextDragTime').val(),
                note: $('#nextComment').val()
            }
        };
        var planNode = j.planNode({'data': lastCalc});
        $('div.plan ol').append(planNode);
    });

    $('div.plan').on('click', 'button.remove', function() {
        $(this).closest('li').remove();
    });

    $('div.plan').on('click', 'button.set', function() {
        var parent = $(this).closest('li');
        $('#speed').val(parent.find('input[name="speed"]').val());
        $('#alt').val(parent.find('input[name="alt"]').val());
        $('#drag').val(parent.find('input[name="drag"]').val());
        $('#time').val(parent.find('input[name="dragTime"]').val());

        $('#calc').trigger('click');
    });

    $('#time').on('change', function() {
        $('#time-in-m').html('сек. (~' + Math.round(Number($(this).val()) / 60) + ' мин)');
    })

});
