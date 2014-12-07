var bodies = {
    'G': 6.673E-12,
    'moho': {
        m: 2.5263617E22, //kg
        r: 250000, //m
        defaultStartAlt: 12000 //m
    },
    'eve': {
        m: 1.2244127E24, //kg
        r: 700000, //m
        defaultStartAlt: 96708 //m
    },
    'gilly': {
        m: 1.2420512E18, //kg
        r: 13000, //m
        defaultStartAlt: 12000 //m
    },
    'kerbin': {
        m: 5.2915793E23, //kg
        r: 600000, //m
        defaultStartAlt: 69000 //m
    },
    'mun': {
        m: 9.7600236E21, //kg
        r: 200000, //m
        defaultStartAlt: 12000 //m
    },
    'minmus': {
        m: 2.6457897E20, //kg
        r: 60000, //m
        defaultStartAlt: 12000 //m
    },
    'duna': {
        m: 4.5154812E22, //kg
        r: 320000, //m
        defaultStartAlt: 41406 //m
    },
    'ike': {
        m: 2.7821949E21, //kg
        r: 130000, //m
        defaultStartAlt: 12000 //m
    }

};

var flight = {
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
    setInitialCOnditions: function(timeLimit, startSpeed, startAlt) {
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
        var mpl = 100000; //perfomance multiplier, higher value is more precise, may affect perfomance
        for (var i=this.init.time; i >= 0; i--) {
            for (var j=0; j <= mpl; j++) {
                if(this.alt - this.speed > 0) {
                    var altRatio = (this.body.r + this.alt) * (this.body.r + this.alt);
                    this.g = bodies['G'] * (this.body.m / altRatio);

                    this.time = (this.init.time - i) + Number(j / mpl);
                    this.speed = this.speed + (Number(this.g - this.drag) / mpl);
                    this.alt = this.alt - (this.speed / mpl);

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
    $('#ok').on('click', function() {
        var body = bodies[$('#body option:selected').val()];
        var timeLimit = Number($('#time').val()) || 600;
        var startSpeed = Number($('#speed').val()) || 0;
        var startAlt = Number($('#alt').val()) || body.defaultStartAlt;
        var drag = Number($('#drag').val());

        flight.setBody(body);
        flight.setInitialCOnditions(timeLimit, startSpeed, startAlt);
        var calc = flight.calculate(drag);

        console.log(calc);
        var statusMsg = (calc.status === 'crash')?'Ситуация у поверхности (за 1 сек): ':'Ситуация: ';

        var text = 'Рассчет для высоты ' + startAlt + ', лимит времени: ' + timeLimit + ' сек. (~' + Math.round(timeLimit) / 60 + ' мин.). Стартовое g - ' + calc.startG +  'м/сек, конечное g - ' + calc.g + 'м/сек. торможение: ' + drag + 'м/сек.<br />Результат: '

        text += (calc.status === 'crash')?'Падение на секунде ' + (Number(calc.time) + 1) + ' (~' + Math.round(calc.time / 60) + ' мин.)<br/>':'Падение продолжается на секунде ' + calc.time + ' (~' + Math.round(calc.time / 60) + ' мин.)<br/>';

        text += statusMsg + 'Время полета: ' + calc.time + 'сек. (~' + Math.round(calc.time / 60) + ' мин.), высота: ' + calc.alt + 'м, скорость: ' + calc.speed + ' м/сек.';

        $('#flight').html(text);

    });
    $('#time').on('change', function() {
        $('#time-in-m').html('сек. (~' + Math.round(Number($(this).val()) / 60) + ' мин)');
    })

});
