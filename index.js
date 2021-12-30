const readlineSync = require('readline-sync');
const exec = require('child_process').exec;
const colors = require('colors/safe');
exec("chcp 65001");

const monster = {
    maxHealth: 10,
    name: "Лютый",
    moves: [
        {
            "name": "Удар когтистой лапой",
            "physicalDmg": 3, // физический урон
            "magicDmg": 0,    // магический урон
            "physicArmorPercents": 20, // физическая броня
            "magicArmorPercents": 20,  // магическая броня
            "cooldown": 0     // ходов на восстановление
        },
        {
            "name": "Огненное дыхание",
            "physicalDmg": 0,
            "magicDmg": 4,
            "physicArmorPercents": 0,
            "magicArmorPercents": 0,
            "cooldown": 3
        },
        {
            "name": "Удар хвостом",
            "physicalDmg": 2,
            "magicDmg": 0,
            "physicArmorPercents": 50,
            "magicArmorPercents": 0,
            "cooldown": 2
        },
    ]
}

const wizard = {
    maxHealth: 10,
    name: "Боевой маг Евстафий",
    moves: [
        {
            "name": "Удар боевым кадилом",
            "physicalDmg": 2,
            "magicDmg": 0,
            "physicArmorPercents": 0,
            "magicArmorPercents": 50,
            "cooldown": 0
        },
        {
            "name": "Вертушка левой пяткой",
            "physicalDmg": 4,
            "magicDmg": 0,
            "physicArmorPercents": 0,
            "magicArmorPercents": 0,
            "cooldown": 4
        },
        {
            "name": "Каноничный фаербол",
            "physicalDmg": 0,
            "magicDmg": 5,
            "physicArmorPercents": 0,
            "magicArmorPercents": 0,
            "cooldown": 3
        },
        {
            "name": "Магический блок",
            "physicalDmg": 0,
            "magicDmg": 0,
            "physicArmorPercents": 100,
            "magicArmorPercents": 100,
            "cooldown": 4
        },
    ]
}

const levels = ["Easy", "Medium", "Hard"];
const initialLevelHealth = [10, 7, 5];

let isGame = true;

// создание копии объектов и добавление двух значений для обработки событий
let monsterDeepClone = JSON.parse(JSON.stringify(monster));
let wizardDeepClone = JSON.parse(JSON.stringify(wizard));

monsterDeepClone.moves.forEach(cd => {
    cd.cooldown_time = cd.cooldown
    cd.isUsed = false
})

wizardDeepClone.moves.forEach(cd => {
    cd.cooldown_time = cd.cooldown
    cd.isUsed = false
})

// функция начала игры
function gameStart() {
    let startGame = readlineSync.keyInSelect(levels, "Choose the difficulty level:");

    if (startGame === -1) {
        console.log(colors.yellow('Вы выбрали Easy уровень'))
        console.log(colors.bgMagenta(`Ваше начальное здоровье равно ${initialLevelHealth[0]}\n`))
    } else {
        console.log(colors.yellow(`Вы выбрали ${levels[startGame]} уровень`))
        console.log(colors.bgMagenta(`Ваше начальное здоровье равно ${initialLevelHealth[startGame]}\n`))
    }

    console.log('Первым атакует Монстр Лютый');
}

// цикл, в котором функция gameplay вызывается, пока идет игра
gameStart()
while (isGame) {
    gameplay(monsterDeepClone, wizardDeepClone)
}

// функция, в которой обрабатывается cooldown атак персонажей
function cooldownMove(enemy) {
    enemy.moves.forEach(cdMove => {
        if (cdMove.isUsed) {
            if (cdMove.cooldown_time === 0) {
                cdMove.cooldown_time = cdMove.cooldown;
                cdMove.isUsed = false
            } else {
                cdMove.cooldown_time -= 1
            }
        }
    })
}

// функция, которая рандомно выбирает атаку
function monsterRandomMove(monsterDeepClone) {
    let rand = Math.floor(Math.random() * monsterDeepClone.moves.length);
    let activeMove = monsterDeepClone.moves[rand];
    if (!activeMove.isUsed ) {
        activeMove.isUsed = true;
        cooldownMove(monsterDeepClone)
        return activeMove
    } else {
        return monsterRandomMove(monsterDeepClone)
    }
}

// функция, в которой пользователь выбирает атаку и исключает ее, если она в кулдауне
function wizardMove(wizardDeepClone) {
    let wizardAttackArr = [];
    for (let move of Object.values(wizardDeepClone.moves)) {
        if (!move.isUsed) {
            wizardAttackArr.push(move.name)
        }
    }

    let wizardAttack = readlineSync.keyInSelect(wizardAttackArr, "Выберите атаку:");
    if (wizardAttack === -1) {
        return wizardMove(wizardDeepClone)
    }

    let wizardAttackMove = wizardDeepClone.moves.find(move => move.name === wizardAttackArr[wizardAttack]);
    wizardAttackMove.isUsed = true;
    cooldownMove(wizardDeepClone)
    return wizardAttackMove
}

// функция, в которой происходит вызов двух функций с выбором атак и возвращается функция battle
function gameplay(monsterDeepClone, wizardDeepClone) {
    let monsterAttack = monsterRandomMove(monsterDeepClone);
    console.log(`Лютый(компьютер) атакует: ` + colors.red(`${monsterAttack.name}`));

    let wizardAttack = wizardMove(wizardDeepClone);
    console.log(`Маг Евстафий(Вы) атакует: ` + colors.green(`${wizardAttack.name}\n`));

    return battle(monsterDeepClone, wizardDeepClone, monsterAttack, wizardAttack)   
}

// функция, в которой происходит взаимное нанесение атак и возвращается либо конец игры, либо ее продолжение
function battle(monsterDeepClone, wizardDeepClone, monsterAttack, wizardAttack) {
    
    let pdDmgMonster = monsterAttack.physicalDmg;
    let mdDmgMonster = monsterAttack.magicDmg;
    let pdArmorMonster = monsterAttack.physicArmorPercents;
    let mdArmorMonster = monsterAttack.magicArmorPercents;

    let pdDmgWizard = wizardAttack.physicalDmg;
    let mdDmgWizard = wizardAttack.magicDmg;
    let pdArmorWizard = wizardAttack.physicArmorPercents;
    let mdArmorWizard = wizardAttack.magicArmorPercents;

    monsterDeepClone.maxHealth -= (pdDmgWizard * ((100 - pdArmorMonster) / 100) + mdDmgWizard * ((100 - mdArmorMonster) / 100))
    wizardDeepClone.maxHealth -= (pdDmgMonster * ((100 - pdArmorWizard) / 100) + mdDmgMonster * ((100 - mdArmorWizard) / 100))

    if (monsterDeepClone.maxHealth <= 0 && wizardDeepClone.maxHealth > 0) {
        console.log(colors.green("Поздравляю, Вы победили Лютого!"))
        return isGame = false
    }
    else if (monsterDeepClone.maxHealth > 0 && wizardDeepClone.maxHealth <= 0) {
        console.log(colors.red("Увы, но вы проиграли Лютому в жесточайшей схватке :("))
        return isGame = false
    } else if (monsterDeepClone.maxHealth <= 0 && wizardDeepClone.maxHealth <= 0) {
        console.log(colors.red("Бой был жестоким, поэтому никто не смог выжить в этой схватке"))
        return isGame = false
    } else {
        console.log("Обе атаки прошли успешно!\n")
        console.log(colors.red("Здоровье Лютого: " + monsterDeepClone.maxHealth))
        console.log(colors.green("Ваше здоровье: " + wizardDeepClone.maxHealth + "\n"))
    }
}



