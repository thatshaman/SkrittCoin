// Generates unique Skritt names

var Skritt = function () {

    var self = this;
    self.Name = "Skritt";

    var nameparts = [
        ["Acl", "Arr", "Brac", "Cakil", "Chak", "Chik'", "Terk", "Tin", "Ch'", "Drez", "Qiq", "Ftak", "Ftok", "Gatt", "Grret", "Hipp", "Hitk", "Jith", "Katt", "Kik", "Korri", "Lee", "Lorr", "Mrrak", "Nak'", "Pokk", "Que", "Rach", "Rak", "Rek", "Rik", "Ropp", "Tri", "Sik'", "Sipt", "Chal", "Tchik", "Tek'", "Tik", "Tre'", "Utt", "Yikk", "Yut", "Zott"],
        ["", "", "", "", "", "i", "sti", "ach", "ip'", "ka", "ki", "ra", "ka", "'", "'k"],
        ["'lik", "tock", "teki", "'tchik", "akka", "chek", "'kh", "'ikeek", "'ikkat", "kaid", "ata", "kari", "kit", "totch", "'kee", "'r", "tack", "iti", "tukk", "ilak", "'ta", "rokk", "'cha", "tiq", "'gune", "'sip", "'cee"]
    ];

    _constructor = function () {
        self.Name = generateName();
    }

    function generateName() {
        var retval = "";
        for (var i = 0; i < nameparts.length; i++) {
            retval += nameparts[i][Math.floor((Math.random() * nameparts[i].length))];
        }
        retval = retval.replace(/\'\'/g, "'");
        retval = retval.replace(/\'\'/g, "'");
        retval = retval.replace(/ii/g, "i");
        return retval;
    }

    _constructor();
}