// Generate pseudo random numbers from a seed

var SeededRandom = function (seed) {

    var self = this;
    self.seed = seed;

    _constructor = function () {
        if (self.seed === 0 || self.seed === undefined) {
            self.seed = Math.floor((Math.random() * 2147483647) + 1);
        }
    }

    this.Next = function () {
        var retval = Math.sin(self.seed++) * 10000;
        return retval - Math.floor(retval);
    }

    _constructor();

};