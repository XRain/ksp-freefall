function Flight() {
    if (this instanceof Flight) {
        return this;
    } else {
        return new Flight();
    }
}

Flight.prototype = {
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
    body: {}
};

Flight.prototype.setBody = function(selectedBody) {
    this.body = selectedBody;
};
Flight.prototype.setShipParams = function(params) {
    this.ship.simulation = this.simulation;
    this.ship.mpl = this.mpl;
    this.ship.currentThrust = Number(params.full);
    this.ship.fullShipThrust = Number(params.full);
    this.ship.emptyShipThrust = Number(params.empty);
    this.ship.thrustTime = Number(params.time);
    this.ship.simTimeThrusted = this.ship.timeThrusted;
    this.ship.thrustChangePerSec = (this.ship.emptyShipThrust - this.ship.fullShipThrust) / this.ship.thrustTime;
};
Flight.prototype.setInitialConditions = function(params) {
    this._reset();
    this.time = 0;
    this.mpl = params.mpl;
    this.alt = params.startAlt;
    this.surfaceAlt = params.surfaceAlt;
    this.speed = params.startSpeed;
    this.simulation = params.sim;
    this.init.speed = params.startSpeed;
    this.init.time = params.timeLimit;
    this.init.alt = params.startAlt;
    this.init.thrustPercent = params.thrustPercent;
};
Flight.prototype.calculate = function(initialBurn) {
    for (var i=this.init.time; i > 0; i--) {
        for (var j=0; j <= this.mpl; j++) {
            if(this.alt - this.speed > this.surfaceAlt) {
                var altRatio = (this.body.r + this.alt) * (this.body.r + this.alt);
                this.g = window.bodies['G'] * (this.body.m / altRatio);

                this.time = (this.init.time - i) + Number(j / this.mpl);
                var shipThrust = this.ship.thrustToPercent(this.init.thrustPercent, 1 / this.mpl);
                if(initialBurn) {
                    this.speed = this.speed + (Number(this.g / this.mpl) / 2);
                } else {
                    this.speed = this.speed + Number(this.g / this.mpl - shipThrust);
                }
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
    var timeToShow = (!!this.simulation)?this.ship.simTimeThrusted:this.ship.timeThrusted;
    $('#thrust-spent').val(Number(this.ship.thrustTime - timeToShow).toFixed(1));
    this.simulation = true;
    return this._roundResults();
};
Flight.prototype._roundResults = function() {
    return {
        status: this.status,
        g: Number(this.g).toFixed(4),
        startG: Number(this.startG).toFixed(4),
        timeLimit: Number(this.init.time).toFixed(0),
        time: Number(this.time).toFixed(0),
        alt: Number(this.alt).toFixed(4),
        realAlt: Number(this.alt - this.surfaceAlt).toFixed(4),
        speed: Number(this.speed).toFixed(4),
        drag: Number(this.init.thrustPercent)
    }
};
Flight.prototype._reset = function() {
    this.status = 'flight';
    this.g =  0; // m/s
    this.startG = 0;// m/s
    this.time = 0; // s
    this.alt =  0; // m
    this.speed = 0; // m/s
};

function Ship() {
    if (this instanceof Ship) {
        return this;
    } else {
        return new Ship();
    }
}

//ship thrust params
Ship.prototype = {
    currentThrust: 0,
        mpl:0,
        sim: 0,
        fullShipThrust: 0,
        emptyShipThrust: 0,
        thrustTime: 0, //seconds
        thrustChangePerSec: 0,
        timeThrusted: 0,
        simTimeThrusted: 0
};
Ship.prototype.thrustToPercent = function(percent, time) {
    if (percent > 0 && this.timeThrusted < this.thrustTime) {
        this.simTimeThrusted += (time / 100) * percent;

        this.currentThrust = this.fullShipThrust + (this.simTimeThrusted * (this.thrustChangePerSec));
        var actualThrustPerSec = (this.currentThrust / 100) * percent;

        if(this.simulation == false) {
            this.timeThrusted += (time / 100) * percent;
        }
        return actualThrustPerSec / this.mpl;
    } else {
        return 0;
    }
};

$(document).ready(function () {
    var lastCalc = {};
    var flight = new Flight();
    flight.ship = new Ship();
    if(!!window.localStorage.getItem('body')) {
        var opt = $('#body').find('option[value="' + window.localStorage.getItem('body') + '"]');
        opt.attr('selected', 'selected')
    }

    $('.storeable').each(function() {
        var inp = $(this);
        if(!!window.localStorage.getItem(inp.attr('id'))) {
            inp.val(window.localStorage.getItem(inp.attr('id')));
        }
        inp.on('change', function() {
            window.localStorage.setItem($(this).attr('id'), $(this).val());
        });
    });

    function calculateShipThrust() {
        var totalMass = Number($('#ship-mass').val()); //кг
        var fuelMass = (Number($('#fuel-amount').val()) + Number($('#oxidizer-amount').val())) * 5; //кг
        var thrust = Number($('#total-thrust').val()) * 1000;
        var fullAccel = thrust / totalMass;
        var emptyAccel = thrust / (totalMass - fuelMass);
        console.log(thrust, totalMass)
        $('#full-thrust').val(fullAccel);
        $('#empty-thrust').val(emptyAccel);
    }

    function startCalculation (sim, initial) {
        var body = window.bodies[$('#body').find('option:selected').val()];
        var timeLimit = Number($('#time').val()) || 600;
        var startSpeed = Number($('#speed').val()) || 0;
        var startAlt = Number($('#alt').val()) || body.defaultStartAlt;
        var surfaceAlt = Number($('#start-alt').val()) - Number($('#real-alt').val());
        var thrustPercent = Number($('#drag').val()) || 0;
        var selectedMpl = Number($('#precision').val()) || 10000;

        if(!!initial) {
            timeLimit = $('#thrust-initial').val();
            thrustPercent = 100;
        }

        flight.setBody(body);
        flight.setInitialConditions({
            timeLimit: timeLimit,
            mpl: selectedMpl,
            startSpeed: startSpeed,
            startAlt: startAlt,
            surfaceAlt: surfaceAlt,
            thrustPercent: thrustPercent,
            sim: sim
        });
        flight.setShipParams({
            full: $('#full-thrust').val(),
            empty: $('#empty-thrust').val(),
            time: $('#thrust-time').val()
        });
        var calc = flight.calculate(initial);

        calc.statusMsg = (calc.status === 'crash')?'Ситуация у поверхности (за 1 сек): ':'Ситуация: ';

        calc.statusTitle = (calc.status === 'crash')?'Падение на секунде ' + (Number(calc.time) + 1) + ' (~' + Math.round(calc.time / 60) + ' мин.)':'Падение продолжается на секунде ' + calc.time + ' (~' + Math.round(calc.time / 60) + ' мин.)';

        var formattedCalc = j.calcResult({'data': calc, 'init': {
            alt: startAlt,
            speed: startSpeed,
            timeLimit: timeLimit
        }});
        $('#flight').html(formattedCalc);

    };
    $('#calc').on('click', function () {
        startCalculation(true);
    });

    $('#execute-0').on('click', function () {
        calculateShipThrust();
        $('#alt').val($('#start-alt').val());
        startCalculation(false, true);
        $('#add').trigger('click');
    });

    $('div.calculation').on('click', 'button#add',function () {
        var lastNodeTime = $('.flight-time').last().val();
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
        if(lastNodeTime !== undefined) {
            lastCalc.lastTime = Number(lastNodeTime) + Number(lastCalc.time);
        } else {
            lastCalc.lastTime = 0;
        }


        var planNode = j.planNode({'data': lastCalc});
        $('div.plan ol').append(planNode);
    });

    $('div.plan').on('click', 'button.remove', function () {
        $(this).closest('li').nextAll('li').remove();
        $(this).closest('li').remove();
    });

    $('div.plan').on('click', 'button.set', function () {
        var parent = $(this).closest('li');
        $('#speed').val(parent.find('input[name="speed"]').val());
        $('#alt').val(parent.find('input[name="alt"]').val());
        $('#drag').val(parent.find('input[name="drag"]').val());
        $('#time').val(parent.find('input[name="dragTime"]').val());
        startCalculation(false);
        $(this).closest('li').nextAll('li').remove();
        $('#add').trigger('click')
    });

    $('div.plan').on('click', 'button.sim', function () {
        var parent = $(this).closest('li');
        $('#speed').val(parent.find('input[name="speed"]').val());
        $('#alt').val(parent.find('input[name="alt"]').val());
        $('#drag').val(parent.find('input[name="drag"]').val());
        $('#time').val(parent.find('input[name="dragTime"]').val());
        startCalculation(true);
    });

    $('#reset-ship').on('click', function () {
        $('#thrust-spent').val('0');
        flight.ship.timeThrusted = 0;
    });
    $('#refresh-ship').on('click', function () {
        $('#thrust-spent').val(flight.ship.thrustTime - flight.ship.timeThrusted);
    });

    $('#body').on('change', function () {
        var selectedBodyName = $('#body').find('option:selected').val();
        var selectedBody = window.bodies[selectedBodyName];
        window.localStorage.setItem('body', selectedBodyName);
        $('#alt').val(selectedBody.defaultStartAlt);
    }).trigger('change');

});
