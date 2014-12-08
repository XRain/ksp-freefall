
var flight = {
    //perfomance multiplier, higher value is more precise, may affect perfomance
    mpl: 10000,
    simulation: true,
    // initial flight conditions
    init: {
        'speed': 0,
        'time': 0,
        'alt': 0,
        'thrustPercent': 0
    },
    // mutable "realtime" values
    alt: 0,
    speed: 0,
    time: 0,
    status: '',
    g: 0,
    startG: 0,
    body: {},
    //ship thrust params
    ship: {
        currentThrust: 0,
        fullShipThrust: 0,
        emptyShipThrust: 0,
        thrustTime: 0, //seconds
        thrustChangePerSec: 0,
        timeThrusted: 0,
        simTimeThrusted: 0,
        thrustToPercent: function(percent, time) {
            if (percent > 0 && this.timeThrusted < this.thrustTime) {
                this.simTimeThrusted += (time / 100) * percent;

                this.currentThrust = this.fullShipThrust + (this.simTimeThrusted * (this.thrustChangePerSec));
                var actualThrustPerSec = (this.currentThrust / 100) * percent;
                return actualThrustPerSec / flight.mpl;
                if(flight.simulation == false) {
                    this.timeThrusted = this.simTimeThrusted;
                }
            } else {
                return 0
            }
        }
    },
    _reset: function() {
        this.status = 'flight';
        this.g =  0; // m/s
        this.startG = 0;// m/s
        this.time = 0; // s
        this.alt =  0; // m
        this.speed = 0; // m/s
    },
    setBody: function(selectedBody) {
        this.body = selectedBody;
    },
    setShipParams: function(params) {
        this.ship.currentThrust = Number(params.full);
        this.ship.fullShipThrust = Number(params.full);
        this.ship.emptyShipThrust = Number(params.empty);
        this.ship.thrustTime = Number(params.time);
        this.ship.simTimeThrusted = this.ship.timeThrusted;
        this.ship.thrustChangePerSec = (this.ship.emptyShipThrust - this.ship.fullShipThrust) / this.ship.thrustTime;
    },
    setInitialConditions: function(params) {
        this._reset();
        this.time = 0;
        this.alt = params.startAlt;
        this.speed = params.startSpeed;
        this.simulation = params.sim;
        this.init.speed = params.startSpeed;
        this.init.time = params.timeLimit;
        this.init.alt = params.startAlt;
        this.init.thrustPercent = params.thrustPercent;
    },
    calculate: function() {
        for (var i=this.init.time; i > 0; i--) {
            for (var j=0; j <= this.mpl; j++) {
                if(this.alt - this.speed > 0) {
                    var altRatio = (this.body.r + this.alt) * (this.body.r + this.alt);
                    this.g = window.bodies['G'] * (this.body.m / altRatio);

                    this.time = (this.init.time - i) + Number(j / this.mpl);
                    var shipThrust = this.ship.thrustToPercent(this.init.thrustPercent, 1 / this.mpl);
                    this.speed = this.speed + Number(this.g / this.mpl - shipThrust);
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

        $('#thrust-spent').val(Number(this.ship.thrustTime - this.ship.simTimeThrusted).toFixed(1));
        this.simulation = true;
        this.ship.simTimeThrusted = 0;
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
            drag: Number(this.init.thrustPercent)
        }
    }
};

$(document).ready(function() {
    var lastCalc = {};
    window.startCalculation = function(sim) {
        var body = window.bodies[$('#body option:selected').val()];
        var timeLimit = Number($('#time').val()) || 600;
        var startSpeed = Number($('#speed').val()) || 0;
        var startAlt = Number($('#alt').val()) || body.defaultStartAlt;
        var thrustPercent = Number($('#drag').val()) || 0;
        flight.setBody(body);
        flight.setInitialConditions({
            timeLimit: timeLimit,
            startSpeed: startSpeed,
            startAlt: startAlt,
            thrustPercent: thrustPercent,
            sim: sim
        });
        flight.setShipParams({
            full: $('#full-thrust').val(),
            empty: $('#empty-thrust').val(),
            time: $('#thrust-time').val()
        });
        var calc = flight.calculate(thrustPercent);

        calc.statusMsg = (calc.status === 'crash')?'Ситуация у поверхности (за 1 сек): ':'Ситуация: ';

        calc.statusTitle = (calc.status === 'crash')?'Падение на секунде ' + (Number(calc.time) + 1) + ' (~' + Math.round(calc.time / 60) + ' мин.)':'Падение продолжается на секунде ' + calc.time + ' (~' + Math.round(calc.time / 60) + ' мин.)';

        var formattedCalc = j.calcResult({'data': calc, 'init': {
            alt: startAlt,
            speed: startSpeed,
            timeLimit: timeLimit
        }});
        $('#flight').html(formattedCalc);

    };
    $('#calc').on('click', function() {
        window.startCalculation(true);
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
        $(this).closest('li').nextAll('li').remove();
        $(this).closest('li').remove();
    });

    $('div.plan').on('click', 'button.set', function() {
        var parent = $(this).closest('li');
        $('#speed').val(parent.find('input[name="speed"]').val());
        $('#alt').val(parent.find('input[name="alt"]').val());
        $('#drag').val(parent.find('input[name="drag"]').val());
        $('#time').val(parent.find('input[name="dragTime"]').val());
        window.startCalculation(false);
        $(this).closest('li').nextAll('li').remove();
    });

    $('div.plan').on('click', 'button.sim', function() {
        var parent = $(this).closest('li');
        $('#speed').val(parent.find('input[name="speed"]').val());
        $('#alt').val(parent.find('input[name="alt"]').val());
        $('#drag').val(parent.find('input[name="drag"]').val());
        $('#time').val(parent.find('input[name="dragTime"]').val());
        window.startCalculation(true);
    });

    $('#reset-ship').on('click', function() {
        $('#thrust-spent').val('0');
        flight.ship.timeThrusted = 0;
    });

    $('#time').on('change', function() {
        $('#time-in-m').html('сек. (~' + Math.round(Number($(this).val()) / 60) + ' мин)');
    });

    $('#body').on('change', function() {
        var selectedBody = window.bodies[$('#body option:selected').val()];
        $('#alt').val(selectedBody.defaultStartAlt);
    });

    $('#body').trigger('change');

});
