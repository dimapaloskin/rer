var execa = require('execa');

module.exports = rer;

var onExit = function() {
  process.exit();
}

function rer(args) {

  var cmd = args.join(' ');
  var runner = execa.shell.bind(execa.shell, cmd, {
    stdio: [0, 1, 2]
  });

  run(runner);
}

const constants = {
  EXIT: new Buffer([0x03]),
  RERUN: new Buffer([0x12])
};

function getProc(runner, evts) {

  var proc = runner()

  proc.addListener('exit', onExit);

  return proc;
}

function run(runner) {

  var proc = getProc(runner);

  var stdin = process.stdin;
  var stdout = process.stdout;

  stdin.setRawMode(true);
  process.stdin.on('data', function(e) {

    if (e.equals(constants.EXIT)) {
      process.kill(proc.pid);
      return process.exit();
    }

    if (e.equals(constants.RERUN)) {
      proc.removeListener('exit', onExit);
      process.kill(proc.pid);
      proc = getProc(runner);

      return;
    }

    stdout.write(e);

  });

}
