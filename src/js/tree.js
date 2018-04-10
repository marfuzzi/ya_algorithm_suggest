import streets from './streets';
import renderTree from './renderTree';

/**
 * @class Класс, отвечающий за построение суффиксного дерева
 */
class Tree {
    constructor(parent, name, link) {
        this.parent = parent;
        this.name = name || '';
        this.children = {};
        this.link = [];
        if (arguments.length >= 3) {
            this.link.push(link);
        }
    }

    /**
     * возвращает путь от корня
     * @returns {string} путь
     */
    way() {
        return this.parent ? this.parent.way() + this.name : this.name;
    }

    /**
     * раскрывает преффиксные ссылки
     * @param {object} set объект, в который производиться вывод
     */
    top(set) {
        for (let n = 0; n < this.link.length && set.limit > 0; n++) { // перебор всех преффиксных ссылок
            if (this.link[n] !== null) { // ссылка есть
                this.link[n].top(set); // сделаем для нее рекурсивный вызов с текущим объектом
            } else { // конечная null ссылка данный узел является полным суффиксом
                const way = this.way();
                if (!(way in set.nodes)) {
                    set.limit--;
                }
                set.nodes[way] = this;
            }
        }
    }

    /**
     * поиск всех соответствий (полных суффиксов) доступных из данного узла
     * @param {number} set число лимит выборки (рекурсивный вызов передает сюда объект)
     * @returns {object} объект найденных суффиксов в формате { "суффикс": {узел}, ... }
     */
    all(set) {
        if (typeof set !== 'object') {
            set = {
                nodes: {},
                limit: set || 10,
            };
        }
        const _oldSuffix = Object.keys(this.children);

        for (let n = 0; n < _oldSuffix.length && set.limit > 0; n++) {
            this.children[_oldSuffix[n]].all(set);
        }
        this.top(set);
        return set.nodes;
    }

    /**
     * функция запроса к дереву
     * @param {string} action действие для рекурсивного запроса
     * ("add" - добавление узла, "see" - проход по пути в дереве)
     * @param {string} newSuffix один из новых постфиксов (которые метод add() сгенерировал из добавляемого суффикса);
     * Или искомый (при action="see") путь
     * @param {object} set при action=="add" содержит префиксную ссылку сгенерированную в add()
     * или null если более длинного суффикса нет
     * @returns {object} Возвращет ссылку на лист
     */
    do(action, newSuffix, set) {
        let _newSuffix = newSuffix.toLowerCase();
        let oldSuffixArr = Object.keys(this.children);
        // находим ключ потомка начинающегося с той же буквы, что и добавляемый ключ
        let oldSuffix = oldSuffixArr.filter(function (suff) {
            return suff[0].toLowerCase() === _newSuffix[0];
        })[0];
        // если имеющийся суффикс не был найден, примем за имеющийся индекс пустую строку ""
        oldSuffix = oldSuffix || '';
        let _oldSuffix = oldSuffix.toLowerCase();

        // теперь найдем общий префикс для имеющегося и добавляемого ключей:
        let n = 0;
        // в n будет число совпадающих символов с начала ключевых добавляемой и имеющейся строк
        while (_oldSuffix[n] === (_newSuffix[n] || NaN)) {
            n++;
        }
        // найдем общий префикс
        let preffix= oldSuffix.slice(0, n);
        // найдем несовпадающие хвосты суффиксов
        oldSuffix = oldSuffix.slice(n);
        newSuffix = newSuffix.slice(n);

        let _preffix = preffix.toLowerCase();
        _oldSuffix = oldSuffix.toLowerCase();

        if (_preffix) { // не нулевой общий префикс, ветвление имеющегося узла
            if (_oldSuffix) { // не нулевой остаток имеющегося узла
                // разрешен только поиск
                if (action === 'see') {
                    return this.children[_preffix + _oldSuffix];
                } else if (action === 'add') { // разрешена запись в дерево
                    // правим имя старого узла
                    this.children[_preffix + _oldSuffix].name = oldSuffix;
                    // вставляем по ключу (по общему префиксу)
                    this.children[_preffix] = new Tree(this, preffix);
                    // устанавливаем ему потомком по ключу [_oldSuffix] узел [_preffix + _oldSuffix]
                    this.children[_preffix].children[_oldSuffix] = this.children[_preffix + _oldSuffix];
                    // правим потомку сменившегося родителя
                    this.children[_preffix].children[_oldSuffix].parent = this.children[_preffix];
                    // удаляем скопированный в новое место узел [_preffix + _oldSuffix]
                    delete this.children[_preffix + _oldSuffix];
                }
            }
            // продолжаем рекурсивно выстраивать нашу текущую цепь
            return this.children[_preffix].do(action, newSuffix, set);
        } else { // нулевой общий префикс, добавляем узел в текущий
            if (_newSuffix) { // не нулевой литерал остаток добавляемого узла
                if (action === 'see') {
                    return null;
                }
                // текущий суффикс наибольший (из генерированных в add())
                return this.children[_newSuffix] = new Tree(this, newSuffix, set);
            } else { // нулевой, означает что данный итоговый суффикс является законченным (лист)
            // здесь уникальный суффикс
                if (action === 'add') {// разрешена запись
                    this.link.push(set);
                }
                return this; // возвращаем найденый лист
            }
        }
    }

    /**
     * запускает поиск по дереву
     * @param {string} substr строка, по которой осуществляется поиск
     * @returns {object} объект найденных суффиксов в формате { "суффикс": {узел}, ... }
     */
    find(substr) {
        const node = this.do('see', substr);
        // если нет совпадений (или искомый путь не является префиксом найденного)
        if (node === null || node.way().toLowerCase().slice(0, substr.length) !== substr.toLowerCase()) {
            return []; // вернуть пустой массив
        }
        return node.all(10);
    }

    /**
     * добавляет в this узел потомка со всеми его суффиксами и постфиксами
     * @param {string} suffix добавляемый суффикс
     * @returns {object} возвращает дерево c добавленными узлами
     */
    add(suffix) {
        const node = this.do('see', suffix);
        // продолжаем только если такого суффикса в дереве еще нет
        if (node === null || node.way().toLowerCase() !== suffix.toLowerCase() || node.link.length === 0) {
            for (let link = null, n = 0; n < suffix.length; n++) {
                link = this.do('add', suffix.slice(n), link);
            }
        }
        return this;
    }

    /**
     * визуализация дерева с помощью d3
     */
    render() {
        const obj = {};
        obj.name = 'Suffixtree';
        obj.children = createObjforRender(this.children);
        renderTree(obj);

        /**
         * преобразует объект tree в объект для отрисовки
         * @param {object} initial исходное дерево
         */
        function createObjforRender(initial) {
            if (Object.keys(initial).length === 0) {
                return [];
            }
            const array = [];
            for (const key in initial) {
                array.push({'name': key,'children': createObjforRender(initial[key].children)});
            }
            return array;
        }
    }
}

const tree = new Tree();
// tree.add('cacao');
// console.time('timer');
streets.forEach(function (street) {
    tree.add(street);
});
// console.timeEnd('timer');
// console.log('tree',tree);
export default tree;
