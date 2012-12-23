(function(global) {
    function $(id) {
        return document.getElementById(id);
    }

    var AudioContext = global.AudioContext || global.webkitAudioContext;
    var context = new AudioContext();
    var sampler = new WaveZutaZuta(context);
    var node;
    var audioSource;

    sampler.onFinished = function() {
        node.disconnect();
        $('play').disabled = false;
        $('stop').disabled = true;
    };

    window.addEventListener('load', function() {
        $('play').addEventListener('click', function() {
            $('play').disabled = true;
            $('stop').disabled = false;
            var tempo = $('tempo').value * 1;
            var unit = 60 / tempo / 16;
            var keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
            var i;

            // 適当なところから音をとる
            for(i = 0; i < keys.length; ++i) {
                sampler.setNote(keys[i], Math.random() * audioSource.duration);
            }

            var score = [];
            var score_text = $('score').value.split('');
            var ch;
            for(i = 0; i < score_text.length; ++i) {
                ch = score_text[i];
                if('a' <= ch && ch <= 'z') {
                    score.push({
                        sound: score_text[i],
                        length: unit
                    });
                } else if(ch == '0') {
                    score.push({
                        sound: WaveZutaZuta.REST,
                        length: unit
                    });
                } else if(ch == '-') {
                    score[score.length-1].length += unit;
                }
            }

            node = sampler.getAudioNode(score);
            node.connect(context.destination);
        });

        $('stop').addEventListener('click', function() {
            sampler.onFinished();
        });
    });

    window.addEventListener('dragover', function(e) {
        e.preventDefault();
    }, false);
    window.addEventListener('dragenter', function(e) {
        e.preventDefault();
    }, false);
    window.addEventListener('drop', function(e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.addEventListener('load', function(e) {
            var data = e.target.result;
            $('file').innerText = 'Now Decoding...';
            sampler.onSuccess = function(self, source) {
                $('file').innerText = file.name;
                $('play').disabled = false;
                audioSource = source;
            };
            sampler.loadAudio(data);
        });
        var buf = reader.readAsArrayBuffer(file);
        $('file').innerText = 'Now Loading...';
    }, false);
})(this);