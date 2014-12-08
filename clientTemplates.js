/*
    Самописный генератор клиентских jade-шаблонов, неинтересен :)
 */
fs = require('fs');
jade = require('jade');
file = require('file');
workdir = process.cwd();
clientTemplatesFile = workdir + '/static/js/templates.js';

fs.writeFileSync(clientTemplatesFile, 'window.j = {};\n');
file.walkSync(workdir + '/jade/views', function(dirPath, dirs, files) {
    var clientTemplate, filename, relPath, slashPath, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
        filename = files[_i];
        file = fs.readFileSync(dirPath + '/' + filename);
        clientTemplate = jade.compileClient(file, {
            compileDebug: false,
            debug: false,
            self: false,
            locals: true
        });
        fs.appendFileSync(clientTemplatesFile, 'window.j["' + filename.split('.')[0] + '"] = ');
        fs.appendFileSync(clientTemplatesFile, clientTemplate.toString().replace('anonymous', ''));
        _results.push(fs.appendFileSync(clientTemplatesFile, '\n'));
    }
    return _results;
});
