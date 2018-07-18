// Loot table generation and distribution

var Loot = function (seed) {

    var self = this;
    self.seed = seed;

    var seededRandom;

    var counter = {};

    _constructor = function () {
        seededRandom = new SeededRandom(self.seed);

        self.Shuffle();

        counter = {
            "Masterwork": Math.floor(seededRandom.Next() * self.lootTable.Masterwork.length),
            "Rare": Math.floor(seededRandom.Next() * self.lootTable.Rare.length),
            "Exotic": Math.floor(seededRandom.Next() * self.lootTable.Exotic.length),
            "Legendary": Math.floor(seededRandom.Next() * self.lootTable.Legendary.length)
        };

    }

    this.Next = function () {
        var retval = {};
        var rng = Math.floor(seededRandom.Next() * 200);

        var level = "Junk";

        if (rng === 199) {
            retval = Object.create(self.lootTable.Legendary[counter.Legendary]);
            counter.Legendary = (counter.Legendary + 1) % self.lootTable.Legendary.length;
            retval.level = ("Legendary");
        } else if (rng > 180) {
            retval = Object.create(self.lootTable.Exotic[counter.Exotic]);
            counter.Exotic = (counter.Exotic + 1) % self.lootTable.Exotic.length;
            retval.level = ("Exotic");
        } else if (rng > 150) {
            retval = Object.create(self.lootTable.Rare[counter.Rare]);
            counter.Rare = (counter.Rare + 1) % self.lootTable.Rare.length;
            retval.level = ("Rare");
        } else if (rng > 100) {
            retval = Object.create(self.lootTable.Masterwork[counter.Masterwork]);
            counter.Masterwork = (counter.Masterwork + 1) % self.lootTable.Masterwork.length;
            retval.level = ("Masterwork");
        } else {
            retval = Object.create(self.lootTable.Junk[Math.floor(seededRandom.Next() * self.lootTable.Junk.length)]);
            retval.level = ("Junk");
        }

        if (retval.image === undefined) {
            retval.image = "BC3B1852C800AF7632AFA2CCC8957A913B443EB8/65901.png";
        }

        if (retval.blurb === undefined) {
            retval.blurb = "";
        }

        retval.image = "https://render.guildwars2.com/file/" + retval.image;

        return retval;
    }


    this.Shuffle = function () {

        var random = 0;
        var temp;

        Object.keys(self.lootTable).forEach(function (key) {

            for (var i = self.lootTable[key].length - 1; i > 0; i--) {

                random = Math.floor(seededRandom.Next() * (i + 1));
                temp = self.lootTable[key][i];
                self.lootTable[key][i] = self.lootTable[key][random];
                self.lootTable[key][random] = temp;
            }
        });
    }


    self.lootTable = {
        "Junk": [
            { "name": "Buzzing Crystal", "image": "045C05C2F83A59FC4B6F15073465C5D3040E4DF5/65674.png", "value": 1 },
            { "name": "Charged Crystal", "image": "CCD82DEAF5B09C98135FC37F239163DAAEC65C1A/866794.png", "value": 2 },
            { "name": "Shocking Crystal", "image": "DC7B02A1EA0EB491BE7E47D55D060B5121D67572/866795.png", "value": 3 },
            { "name": "Cog", "image": "A64CDE12565E07F00470D710377A5EAB5E953816/62264.png", "value": 1 },
            { "name": "Sprocket", "image": "FC637AA3031B585F5B025B12670C6CD5A5C1BA51/63130.png", "value": 2 },
            { "name": "Pebble", "image": "510AABA4DA240FFD6C0572975B04CDB56D5BD960/65902.png", "value": 2 },
            { "name": "Gravel", "image": "0D6AE55445EB2307096D75E84C7EC8B3D4BBE942/866810.png", "value": 3 },
            { "name": "Stone", "image": "7B06ED1024070C05FBA8E7AA0B6B96464DBE9E6F/866811.png", "value": 4 },
            { "name": "Glob of Globby Gloop", "image": "217DAAE092C21CAFE4F2625C1C12F3B156FA099B/866801.png", "value": 4 },
            { "name": "Spider Leg", "image": "655258C8EA581EFA37F845D3F4CAFEE309AD19A9/65899.png", "value": 2 },
            { "name": "Broken Lockpick", "image": "667427C607F636E5082362919CD208D8F4E07DA5/866816.png", "value": 2 },
            { "name": "Unidentifiable Object", "image": "BC3B1852C800AF7632AFA2CCC8957A913B443EB8/65901.png", "value": 2 },
            { "name": "Shiny Bauble", "image": "034B091471E6067C2B0BCC70FE04D2F3AE51F291/1010539.png", "value": 2 },
            { "name": "Broken Spoon", "image": "6F2215EB6E98B707DA6214AABF510667A6CE6609/66821.png", "value": 3 },
            { "name": "Gravel", "image": "0D6AE55445EB2307096D75E84C7EC8B3D4BBE942/866810.png", "value": 1 },
            { "name": "Clump of Tar", "image": "0759C04469062C150B34010A15534E21A49A2C55/61968.png", "value": 1 },
            { "name": "Ruined Ore Chunk", "image": "C15F220F0B4DAAE4FEC6673B4B9E3037F9E0114A/63125.png", "value": 2 },
            { "name": "Spike", "image": "330DDC66936948D90E2E0401984B14D740EC6C6F/1701108.png", "value": 2 },
            { "name": "Invisible Slippers", "image": "BFA446B0EC0E9901DE3C639A93F50728BC0B262B/1294766.png", "blurb": "Shiny Slippers are much better", "value": 1 },
            { "name": "Permanent Bank Access Contract", "image": "7FF140AC1A1D55682BBDA15027F3247316F6FC0B/1518928.png", "blurb": "Skritt don't need banks..", "value": 1 },
            { "name": "Vial of Liquid Aurillium", "image": "A66CEF1B9C032C240EDB9077FCD53493CD5AC6B9/1203050.png", "blurb": "Tastes awful", "value": 5 },
            { "name": "Chak Egg Sac", "image": "FE73F012119252F1935797B2EC2C94482AB5A308/831485.png", "blurb": "Worthless", "value": 1 }
        ],
        "Masterwork": [
            { "name": "Mini Queen Jennah", "image": "203CEDF1FD17B3BAB99A244DAC49FD5C4838B60C/625610.png", "blurb": "Gotta collect them all", "value": 1 },
            { "name": "Mini Braham Eirsson", "image": "2E3DB63900140D6AD86F29E608172871EAB0C755/930971.png", "blurb": "...", "value": 0 },
            { "name": "Bag of Loot", "image": "EBC5CEC199D1E51B02756A1C796A65E9D24F04B5/63171.png", "blurb": "At least it's not a Loot Box", "value": 10 },
            { "name": "Loot Box", "image": "900B6F07174AEFC96A664AC6115D2DABC90B06B8/66867.png", "blurb": "At least it's not a Bag of Loot", "value": 10 },
            { "name": "Two Blues and a Green", "image": "C8EAC643C02F41B918D79031B6060B0CBFE40CAD/64967.png", "blurb": "It's something", "value": 13 },
            { "name": "((48696e74))", "image": "947ECC342812A70E05F7926560D0779DB272E7BD/1894772.png", "blurb": ".. how did this get here?", "value": 7 },
            { "name": "Piece of Candy Corn", "image": "7AF3232140CB5DF159E4E54C2F092F69B5BD460F/499376.png", "blurb": "Rich in nutrients!", "value": 12 },
            { "name": "Princess Wand", "image": "54CE07DFC9C03F9A03ECF99098D25B0FE022F241/526329.png", "blurb": "Sparkles!", "value": 10 },
            { "name": "Skritt Axe", "image": "EB593444A3ED065F7BE3EC71713CF80D145EABCB/455858.png", "value": 10 },
            { "name": "Skritt Dagger", "image": "D64150A50A46C5B695D5E9074CCC745824084778/1302063.png", "value": 10 },
            { "name": "Skritt Mace", "image": "45EFD897BE5F522F3CC210FBC3DE227C050731AA/1894691.png", "value": 10 },
            { "name": "Skritt Pistol", "image": "0B14BB6F00DC32751041D1AB07F827C451E85E3D/63138.png", "value": 10 },
            { "name": "Skritt Scepter", "image": "02C8490298FE3913CDF15B30126275DBC8FD94F9/66919.png", "value": 10 },
            { "name": "Skritt Sword", "image": "3254C66ED1675657E0B7C2FBBC09FBF2FBAA74A6/62762.png", "value": 10 },
            { "name": "Skritt Focus", "image": "F06472A03B49AA6C9256195FC43B49BEA26595D0/62859.png", "value": 10 },
            { "name": "Skritt Torch", "image": "69199C0E95BA240B6CA6ACED5CE60C72C1BB7E03/1227595.png", "value": 10 },
            { "name": "Skritt Shield", "image": "61E5A8E5A91D4FED0815606C71975F0EBF0D032C/1767176.png", "value": 10 },
            { "name": "Skritt Greatsword", "image": "A30DA1A1EF05BD080C95AE2EF0067BADCDD0D89D/456014.png", "value": 10 },
            { "name": "Skritt Hammer", "image": "042999E003ABE71E0AB73B189A5EA40D07BF91C4/1200206.png", "value": 10 },
            { "name": "Skritt Longbow", "image": "80EFB82DBBED06CEB6E1060D94A8D7C031010108/1302060.png", "value": 10 },
            { "name": "Skritt Rifle", "image": "C0D57D1F7409665A13064405566EFB25DBD44C0A/1701378.png", "value": 10 },
            { "name": "Skritt Short Bow", "image": "C6110F52DF5AFE0F00A56F9E143E9732176DDDE9/65015.png", "value": 10 },
            { "name": "Skritt Staff", "image": "6CFF221BAA7877C54B243D1DE9C8A211BB6AE170/65938.png", "value": 10 },
            { "name": "Skritt Warhorn", "image": "21CDE31E53E0055C9DB4D8071A57EF755F4647C6/591621.png", "value": 10 },
            { "name": "Skritt Harpoon", "image": "077FA8A55003E5E6112E05C7BE74CFE7D5B7CC46/66764.png", "value": 10 },
            { "name": "Skritt Speargun", "image": "0C7E685C63F9DE19773912E935E31BCCE7CB0756/757307.png", "value": 10 },
            { "name": "Skritt Trident", "image": "7752546F45001E31C7A40CA8CAE105239706271D/1767178.png", "value": 10 },
            { "name": "50 Shades of Green", "image": "A37D593D033147230D7D7FD0EEB9FD6D26E325DF/1201872.png", "blurb": "Trahearne's favorite book on photosynthesis", "value": 20 },
            { "name": "How to house train your Charr", "image": "A37D593D033147230D7D7FD0EEB9FD6D26E325DF/1201872.png", "blurb": "And other useful tips on keeping a pet", "value": 20 },
            { "name": "The Human Gods", "image": "A37D593D033147230D7D7FD0EEB9FD6D26E325DF/1201872.png", "blurb": "A guide on useless deities", "value": 20 },
            { "name": "Norn or large human?", "image": "A37D593D033147230D7D7FD0EEB9FD6D26E325DF/1201872.png", "blurb": "How to tell the difference in 148 easy steps.", "value": 20 },
            { "name": "the Asuran Master Race", "image": "A37D593D033147230D7D7FD0EEB9FD6D26E325DF/1201872.png", "blurb": "A guide on Asura, by Asura for Asura (in cooperation with Asura)", "value": 20 },
            { "name": "Black Lion Claim Ticket Scrap Fragment", "image": "11584F0949262E213209D810B24C680BBA65FEBC/575163.png", "blurb": "Collect 10 fragments to turn in for a Black Lion Claim Ticket Scrap", "value": 11 },
            { "name": "Skritt Adoption License", "image": "A49E6BBB38D25AD6B8FA796548D940F2EDCC654F/1964041.png", "blurb": "Gain a random Skritt that you do not already own from the Black Lion Skritt Storage.", "value": 10 },
            { "name": "Redundant Gizmo of Redundancy", "image": "7DA347EF665D6474C548DDC90909F4984253CAAA/1302245.png", "blurb": "Don't make me repeat myself", "value": 8 }
        ],
        "Rare": [
            { "name": "Shiny Mirror", "image": "97FC4CBB921AA7B439ECBE063C9639185C02D570/1894609.png", "blurb": "How do they work?", "value": 24 },
            { "name": "Blockchain Sword", "image": "959F043BDE7D62EA5B1D0D1ABE31AAE3516B06FB/499466.png", "blurb": "Deep Learning! Big Data! Dismemberment!", "value": 32 },
            { "name": "Joko Action Figure", "image": "4D2D0DDD342ABA44CFFEC6ACF0F3C6C2D9079B3C/1766844.png", "blurb": "- Praise! -", "value": 30 },
            { "name": "Mystic Small Change", "image": "AB0317DF5B0E1BA47436A5420248660765154C08/62864.png", "blurb": "As inflated as the real deal.", "value": 22 },
            { "name": "+42 Agony Infusion", "image": "3504CD3199285BC1293FAE249ACF9461C50994DB/1465586.png", "blurb": "T4 Daily | 40k AP (dps + bbq ONLY)", "value": 41 },
            { "name": "Strange Rock", "image": "F911BF0D16B9284160DA1ABBDE9CF5971B26566A/1493441.png", "blurb": "This strange rock appears to be humming with magic.", "value": 45 },
            { "name": "Potato", "image": "24CE9454113F0609E6E9B655EF0670B40D5522EC/63245.png", "blurb": "It's rare to find these underground..", "value": 20 },
            { "name": "Green Rose Dye", "image": "FFE3A6302A0409148059239E05C9064D5DAF1E04/561734.png", "blurb": "So that's where they've put it!", "value": 25 },
            { "name": "Assassin's Assassin's Boots of the Assassin", "image": "AE7700B57D429E421133FBCC5C431BF73BC91AD2/218913.png", "blurb": "Needs more Assassins", "value": 40 },
            { "name": "AAAAHHHHHH!!!", "image": "EAD3540691D702A52E617140055725DF41BBBA49/1766899.png", "blurb": "-Sugarcube", "value": 36 },
            { "name": "Choya Pet", "image": "FFF329C6B1C7639914B4B63F0FA9E064423CDC34/1822054.png", "blurb": "Ch-ch-ch-choya!", "value": 22 },
            { "name": "Buffalo Wings Glider", "image": "0B79E2A53AA492BCF823AACDAC9E2E415DE9040B/561717.png", "blurb": "Tasty!", "value": 44 },
            { "name": "Dark Shadow Abyss Gloom Dye", "image": "FFE3A6302A0409148059239E05C9064D5DAF1E04/561734.png", "blurb": "Not shiny", "value": 25 },
            { "name": "Polearm", "image": "DCAD6461D629BBB5417CD8B6170E7CE27EB4DEF8/65195.png", "blurb": "Shame no one knows how to use one", "value": 22 },
            { "name": "Choyamander's Compendium", "image": "1F64A2799FC8666FFC66FE56DAA75C02E7E9BA6F/66753.png", "blurb": "Unlock the ability to become a liability.", "value": 33 }
        ],
        "Exotic": [
            { "name": "CharrioKart 64 cartridge", "image": "93FE6D582B9877ED617FFFE2F94977A4A83E2C13/543823.png", "blurb": "Here we go!", "value": 64 },
            { "name": "Trained Choya Hammer Skin", "image": "414690C8EB3F22B35E411DA7C3B54925C6755733/1822179.png", "blurb": "(sniff) (grumble)", "value": 69 },
            { "name": "Mistcleaver", "image": "201CC6E60448CB4BA8AD919C74904EE1F9AEC54F/66597.png", "blurb": "didn't this get lost in the mists.. and look better?", "value": 75 },
            { "name": "Endless Interlude Tonic", "image": "0BFBBB54FE485DBCF55615156603E53F02440437/222718.png", "blurb": "/dance", "value": 50 },
            { "name": "Win trading for dummies", "image": "7B6AAFCE03BC3461207425B1FC91DB463AC3F79D/511799.png", "blurb": "Step 1: Don't.", "value": 50 },
            { "name": "Historical Guide to Tyria", "image": "60A6FCE7EFFB7EE9F512F51402CE6D0529380B7D/866778.png", "blurb": "'Highly inaccurate' -Lore Nerd", "value": 111 }
        ],
        "Legendary": [
            { "name": "How to Dance, Volume 2", "image": "0378716BA836504AF1C5AF550019689F4F99ED18/575158.png", "blurb": "Heeey Macarena Ahai!", "value": 250 },
            { "name": "Legendary Aquabreather", "image": "AFBE55FC08ABD32007F3EA0F77F14306AC07283D/499490.png", "blurb": "You filthy elitist", "value": 200 },
            { "name": "the Table", "image": "1F3B984AD4B31032F13977CE69E549F4BB05FDE0/1227673.png", "blurb": "Everything is on it!", "value": 225 }

        ]
    };


    _constructor();
};