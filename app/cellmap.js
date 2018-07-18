// Generate "organic" 1bit cells

var CellMap = function (seed) {

    var self = this;
    self.seededRandom = new SeededRandom(seed);

    _constructor = function () {
        //
    }

    this.Generate = function (width, height, steps, start, kill, spawn) {

        var retval = [];

        for (var y = 0; y < height; y++) {
            retval[y] = [];
            for (var x = 0; x < width; x++) {
                if (self.seededRandom.Next() < start) {
                    retval[y][x] = true;
                } else {
                    retval[y][x] = false;
                }
            }
        }

        for (var s = 0; s < steps; s++) {

            var temp = [];
            for (var y = 0; y < height; y++) {
                temp[y] = [];
                for (var x = 0; x < width; x++) {
                    var alive = 0;

                    // top left
                    if (x > 0 && y > 0 && retval[y - 1][x - 1]) alive++;

                    // top
                    if (y > 0 && retval[y - 1][x]) alive++;

                    // top right
                    if (y > 0 && x < width && retval[y - 1][x + 1]) alive++;

                    // left
                    if (x > 0 && retval[y][x - 1]) alive++;

                    // right
                    if (x < width && retval[y][x + 1]) alive++;


                    // bottom left
                    if (x > 0 && y < (height - 1) && retval[y + 1][x - 1]) alive++;

                    // bottom
                    if (y < (height - 1) && retval[y + 1][x]) alive++;

                    // bottom right
                    if (x < width && y < (height - 1) && retval[y + 1][x + 1]) alive++;


                    if (retval[y][x]) {
                        if (alive < kill) {
                            temp[y][x] = false;
                        }
                        else {
                            temp[y][x] = true;
                        }
                    }
                    else {
                        if (alive > spawn) {
                            temp[y][x] = true;
                        }
                        else {
                            temp[y][x] = false;
                        }
                    }
                }
            }

            retval = temp;
        }

        return retval;
    }

    _constructor();
};