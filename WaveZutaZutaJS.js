(function(global) {
    global.WaveZutaZuta = WaveZutaZuta;
    var BUFFER_SIZE = 2048;

    function WaveZutaZuta(context) {
        this.context = context;
        this.notes = {};
    }

    WaveZutaZuta.prototype.loadAudio = function(source) {
        var context = this.context;
        var self = this;
        context.decodeAudioData(
            source,
            function (buf) {
                self.sourceBuffer = buf;
                self.sampleRate = buf.sampleRate;
                self.onSuccess(self, buf);
                self.notes[WaveZutaZuta.REST] = buf.length;
            },
            function () {
                self.onError(self);
            });
    };

    WaveZutaZuta.prototype.onSuccess = function() {};
    WaveZutaZuta.prototype.onError = function() {};
    WaveZutaZuta.prototype.onFinished = function() {};

    WaveZutaZuta.prototype.setNote = function(key, time) {
        this.notes[key] = (time * this.sampleRate) | 0;
    };

    WaveZutaZuta.prototype.getAudioNode = function(score) {
        var context = this.context;
        var node;
        if (context.createScriptProcessor) {
            node = context.createScriptProcessor(BUFFER_SIZE, 0, 1);
        } else {
            // old method
            node = context.createJavaScriptNode(BUFFER_SIZE, 0, 1);

        }
        var self = this;
        var score_pos = 0, note_pos = 0;
        var sourcedata = self.sourceBuffer.getChannelData(0);
        var notes = this.notes;
        var sampleRate = this.sampleRate;
        var executedOnFinished = false;

        node.onaudioprocess = function(buf) {
            var data = buf.outputBuffer.getChannelData(0);
            var i;
            var pos, note;
            if(score_pos >= score.length) {
                for(i = 0; i < data.length; ++i) {
                    data[i] = 0;
                }
                if(!executedOnFinished) {
                    self.onFinished(self, node);
                    executedOnFinished = true;
                }
                return;
            }
            for(i = 0; i < data.length; ++i) {
                if(score_pos >= score.length) {
                    data[i] = 0;
                    continue;
                }
                note = score[score_pos];
                pos = notes[note.sound] + note_pos;
                if(pos < sourcedata.length) {
                    data[i] = sourcedata[pos];
                } else {
                    data[i] = 0;
                    console.log(sourcedata.length);
                }
                ++note_pos;
                if(note_pos >= note.length * sampleRate) {
                    note_pos = 0;
                    ++score_pos;
                }
            }
        };
        return node;
    };

    WaveZutaZuta.REST = '';

})(this);
