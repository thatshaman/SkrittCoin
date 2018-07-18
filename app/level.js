var Level = function (seed) {

    var self = this;

    self.seed = seed;

    // Generic tile types
    self.tiletypes = {
        unknown: -1, none: 0, player: 1,
        gravel: 2, sand: 3, rock: 4,
        water: 5, lava: 6,
        shiny: 10, chest: 11,
        mud: 20,
        stone: 50,
        prop: 60
    };

    // Chunk size & number of chunks
    self.chunks = {
        size: 32, x: 16, y: 16
    };

    self.dirtyChunks = [];

    // Map size
    self.dimensions = {
        width: self.chunks.x * self.chunks.size,
        height: self.chunks.y * self.chunks.size,
    }

    self.map = [];
    self.velocity = [];

    ////////////////////////////////////////////////////

    _constructor = function () {

        for (var y = 0; y < self.chunks.y; y++) {
            self.dirtyChunks[y] = [];
            for (x = 0; x < self.chunks.x; x++) {
                self.dirtyChunks[y][x] = true;
            }
        }

        for (var y = 0; y < self.dimensions.height; y++) {
            self.map[y] = [];
        }

        //
        // Generate map
        //

        for (y = 0; y < self.dimensions.height; y++) {
            self.map[y] = [];
            self.velocity[y] = [];
            for (x = 0; x < self.dimensions.width; x++) {
                self.map[y][x] = self.tiletypes.mud;
                self.velocity[y][x] = false;
            }
        }


        var seededRandom = new SeededRandom(seed);

        var cellmap = new CellMap(self.seed);
        var cells;
        var third = self.dimensions.height / 3;
        var half = self.dimensions.height / 3;

        // Fill entire map with mud and gravel
        cells = cellmap.Generate(self.dimensions.width, self.dimensions.height, 3, 0.3, 3, 4);
        for (var y = 0; y < self.dimensions.height; y++) {
            for (var x = 0; x < self.dimensions.width; x++) {
                if (cells[y][x]) {
                    self.map[y][x] = self.tiletypes.gravel;
                } else {
                    if (seededRandom.Next() < 0.6) {
                        self.map[y][x] = self.tiletypes.mud;
                    } else {
                        self.map[y][x] = self.tiletypes.mud + Math.floor((Math.random() * 9) + 1);
                    }
                }
            }
        }

        // Generate "caves" by hollowing out terrain
        cells = cellmap.Generate(self.dimensions.width, self.dimensions.height, 2, 0.7, 3, 4);
        for (var y = 0; y < self.dimensions.height; y++) {
            for (var x = 0; x < self.dimensions.width; x++) {
                if (!cells[y][x]) {
                    self.map[y][x] = self.tiletypes.none;
                }
            }
        }

        // Create rock structures
        cells = cellmap.Generate(self.dimensions.width, self.dimensions.height, 2, 0.5, 3, 4);
        for (var y = 0; y < self.dimensions.height; y++) {
            for (var x = 0; x < self.dimensions.width; x++) {
                if (!cells[y][x]) {
                    if (seededRandom.Next() < 0.6) {
                        self.map[y][x] = self.tiletypes.stone;
                    } else {
                        self.map[y][x] = self.tiletypes.stone + Math.floor((Math.random() * 9) + 1);
                    }

                }
            }
        }

        // Place more sand and gravel
        cells = cellmap.Generate(self.dimensions.width, self.dimensions.height, 2, 0.6, 3, 4);
        for (var y = 0; y < self.dimensions.height; y++) {
            for (var x = 0; x < self.dimensions.width; x++) {
                if (!cells[y][x]) {
                    if (y < third) {
                        self.map[y][x] = self.tiletypes.sand;
                    } else if (y > (third * 2)) {
                        if (seededRandom.Next() < 0.8) {
                            self.map[y][x] = self.tiletypes.gravel;
                        } else {
                            self.map[y][x] = self.tiletypes.sand;
                        }
                    } else {
                        if (seededRandom.Next() < 0.5) {
                            self.map[y][x] = self.tiletypes.gravel;
                        } else {
                            self.map[y][x] = self.tiletypes.sand;
                        }
                    }
                }
            }
        }

        // Add water (or lava at last third of the map)
        cells = cellmap.Generate(self.dimensions.width, self.dimensions.height, 2, 0.7, 3, 4);
        for (var y = 0; y < self.dimensions.height; y++) {
            for (var x = 0; x < self.dimensions.width; x++) {
                if (!cells[y][x]) {
                    if (y < third) {
                        if (seededRandom.Next() < 0.5) {
                            self.map[y][x] = self.tiletypes.water;
                        }
                    } else if (y > (third * 2)) {
                        self.map[y][x] = self.tiletypes.lava;
                    } else {
                        self.map[y][x] = self.tiletypes.water;
                    }
                }
            }
        }


        // Shinies, chests and falling rocks

        // Top level
        for (i = 0; i < 500; i++) {
            self.map[Math.floor(seededRandom.Next() * third)][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.shiny;
            self.map[Math.floor(seededRandom.Next() * third)][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.rock;
            if (i % 2 == 0) {
                self.map[Math.floor(seededRandom.Next() * third)][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.chest;
            }
        }

        // Center
        for (i = 0; i < 1000; i++) {
            self.map[Math.floor((seededRandom.Next() * third) + third)][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.shiny;
            self.map[Math.floor((seededRandom.Next() * third) + third)][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.rock;
            if (i % 2 == 0) {
                self.map[Math.floor((seededRandom.Next() * third) + third)][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.chest;
            }
        }

        // Bottom
        for (i = 0; i < 1500; i++) {
            self.map[Math.floor((seededRandom.Next() * third) + (third * 2)) - 1][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.shiny;
            self.map[Math.floor((seededRandom.Next() * third) + (third * 2)) - 1][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.rock;
            if (i % 2 == 0) {
                self.map[Math.floor((seededRandom.Next() * third) + (third * 2))][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.chest;
            }
        }

        // "unique prop"
        self.map[Math.floor((seededRandom.Next() * third) + (third * 2))][Math.floor(seededRandom.Next() * self.dimensions.width)] = self.tiletypes.prop;

        // Overrides for special levels

        if (seed === 0x666) {
            // Replace all gravel with lava
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    if (self.map[y][x] === self.tiletypes.sand || self.map[y][x] == self.tiletypes.gravel) {
                        self.map[y][x] = self.tiletypes.lava;
                    }
                }
            }
        } else if (seed === 0x1337) {
            // Replace all rocks with chests and gravel with shinies
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    if (self.map[y][x] === self.tiletypes.chest) {
                        self.map[y][x] = self.tiletypes.rock;
                    } else if (self.map[y][x] === self.tiletypes.gravel) {
                        self.map[y][x] = self.tiletypes.shiny;
                    }
                }
            }
        } else if (seed === 0xC0FFEE) {
            // Entire map made out of dirt (except shinies)
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    if (self.map[y][x] === self.tiletypes.chest || self.map[y][x] === self.tiletypes.shiny) {
                        //
                    } else {
                        self.map[y][x] = self.tiletypes.mud;
                    }
                }
            }
        } else if (seed === 0xDEAD) {
            // Entire map made out of lava
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    self.map[y][x] = self.tiletypes.lava;
                }
            }
        }
        else if (seed === 0x404) {
            // Empty map
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    self.map[y][x] = self.tiletypes.none;
                }
            }
        } else if (seed === 0xFF00FF) {
            // Repeating pattern of dirt and shinies
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    if (x * y % 4 == 0) {
                        self.map[y][x] = self.tiletypes.shiny;
                    } else {
                        self.map[y][x] = self.tiletypes.mud;
                    }
                }
            }
        } else if (seed === 0x7777777) {
            // Replace all shinies with chests
            for (y = 0; y < self.dimensions.height; y++) {
                for (x = 0; x < self.dimensions.width; x++) {
                    if (self.map[y][x] === self.tiletypes.shiny) {
                        self.map[y][x] = self.tiletypes.chest;
                    }
                }
            }
        }

        // Clear debris from first 4 layers
        for (x = 0; x < self.dimensions.width; x++) {
            for (y = 0; y < 4; y++) {
                if ((self.map[y][x] >= self.tiletypes.mud && self.map[y][x] < self.tiletypes.rock) || self.map[y][x] === self.tiletypes.sand || self.map[y][x] === self.tiletypes.gravel || self.map[y][x] === self.tiletypes.none) {
                    // keep
                } else {
                    self.map[y][x] = self.tiletypes.mud;
                }
            }
        }
    }

    // Change tile type and velocity at coordinates and mark chunk as dirty
    self.setTile = function (x, y, value, velocity) {
        self.map[y][x] = value;
        self.velocity[y][x] = velocity;

        var chunkx = Math.floor(x / self.chunks.size);
        var chunky = Math.floor(y / self.chunks.size);

        self.dirtyChunks[chunky][chunkx] = true;

        if (chunky > 0) {
            self.dirtyChunks[chunky - 1][chunkx] = true;
        }
    }

    // Request tile type from coordinates
    self.getTile = function (x, y) {
        if (x >= 0 && y >= 0 && x < self.dimensions.width && y < self.dimensions.height) {
            return self.map[y][x];
        } else {
            return self.tiletypes.unknown;
        }
    }

    // Get tile velocity from coordinates
    self.getVelocity = function (x, y) {
        if (x > 0 && y > 0 && x < self.dimensions.width && y < self.dimensions.height) {
            return self.velocity[y][x];
        } else {
            return 0;
        }
    }

    // Loop through dirty chunks (bottom to top)
    self.Update = function () {
        var updates = 0;
        for (var y = self.chunks.y - 1; y > -1; y--) {
            for (var x = 0; x < self.chunks.x; x++) {
                if (self.dirtyChunks[y][x]) {
                    updateChunk(x, y);
                    updates++;
                }
            }
        }

        return updates;
    }

    // Loop through chunk tiles (bottom to top)
    function updateChunk(cX, xY) {

        // Unmark chunk as being dirty for next pass
        self.dirtyChunks[xY][cX] = false;

        var left = cX * self.chunks.size;
        var top = xY * self.chunks.size;

        var tileinfo = [
            [-1, -1, -1],
            [-1, -1, -1],
            [-1, -1, -1]
        ];

        ////////////////////////////////
        //       0       1       2
        //    +------+-------+-------+
        // 0  | ...  |  top  |  ...  |
        //    +------+-------+-------+
        // 1  | left | value | right |
        //    +------+-------+-------+
        // 2  |  bl  | value |   br  |
        //    +------+-------+-------+
        //
        ////////////////////////////////

        for (var y = top + self.chunks.size - 1; y > top - 1; y--) {
            for (var x = left; x < left + self.chunks.size; x++) {

                self.velocity[y][x] = false;

                tileinfo = [
                    [-1, self.getTile(x, y - 1), -1],
                    [self.getTile(x - 1, y), self.getTile(x, y), self.getTile(x + 1, y)],
                    [self.getTile(x - 1, y + 1), self.getTile(x, y + 1), self.getTile(x + 1, y + 1)],
                ];
                
                //
                //  Gravel
                //

                if (tileinfo[1][1] === self.tiletypes.gravel) {
                    if (tileinfo[2][1] === self.tiletypes.none) {
                        self.setTile(x, y + 1, self.tiletypes.gravel, true);
                        self.setTile(x, y, self.tiletypes.none, false);
                    }
                }

                //
                //  Rocks
                //

                if (tileinfo[1][1] === self.tiletypes.rock) {
                    if (tileinfo[2][1] === self.tiletypes.none) {
                        self.setTile(x, y + 1, self.tiletypes.rock, true);
                        self.setTile(x, y, self.tiletypes.none, false);
                    }
                }

                //
                //  Sand
                //

                if (tileinfo[1][1] === self.tiletypes.sand) {
                    if (tileinfo[2][1] === self.tiletypes.none) {
                        self.setTile(x, y + 1, self.tiletypes.sand, true);
                        self.setTile(x, y, self.tiletypes.none, false);
                    } else if (tileinfo[1][0] === self.tiletypes.none && tileinfo[2][0] === self.tiletypes.none) {
                        self.setTile(x - 1, y + 1, self.tiletypes.sand, true);
                        self.setTile(x, y, self.tiletypes.none, false);
                    } else if (tileinfo[1][2] === self.tiletypes.none && tileinfo[2][2] === self.tiletypes.none) {
                        self.setTile(x + 1, y + 1, self.tiletypes.sand, true);
                        self.setTile(x, y, self.tiletypes.none, false);
                    }
                }

                //
                //  Water
                //

                if (tileinfo[1][1] === self.tiletypes.water) {
                    if (tileinfo[2][1] === self.tiletypes.none) {
                        self.setTile(x, y + 1, self.tiletypes.water, true);
                    } else {
                        if (tileinfo[1][0] === self.tiletypes.none && tileinfo[2][0] === self.tiletypes.none) {
                            self.setTile(x - 1, y, self.tiletypes.water, false);
                        }

                        if (tileinfo[1][2] === self.tiletypes.none && tileinfo[2][2] === self.tiletypes.none) {
                            self.setTile(x + 1, y, self.tiletypes.water, false);
                        }
                    }
                }

                //
                //  Lava
                //

                if (tileinfo[1][1] === self.tiletypes.lava) {
                    if (tileinfo[2][1] === self.tiletypes.none) {
                        self.setTile(x, y + 1, self.tiletypes.lava, true);
                    } else {
                        if (tileinfo[1][0] === self.tiletypes.none && tileinfo[2][0] === self.tiletypes.none) {
                            self.setTile(x - 1, y, self.tiletypes.lava, false);
                        }

                        if (tileinfo[1][2] === self.tiletypes.none && tileinfo[2][2] === self.tiletypes.none) {
                            self.setTile(x + 1, y, self.tiletypes.lava, false);
                        }
                    }
                }
            }
        }
    }

    _constructor();

};