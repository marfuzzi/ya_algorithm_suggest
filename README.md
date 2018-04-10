Suggest - алгоритм
---------------------
Задание по алгоритмам для ШРИ-2018

* [DEMO]()

**Задание**

Есть большой массив названий улиц, и инпут на сайте, в котором эту улицу нужно выбрать. При вводе пользователю предлагается до 10 улиц, в названии которых есть введенная пользователем подстрока без учета регистра (т.е. на ввод "тверская" должно найтись "ул. Тверская").
Нужно реализовать функцию, которая принимает на вход строку input, и возвращает массив найденных улиц(не больше 10).

**Реализация**

В задании реализован поиск по суффиксному дереву.
Для построения дерева использован упрощенный алгоритм Вейнера https://habrahabr.ru/post/258121/.
Поиск по дереву осуществляется таким образом:
1. Задаем искомый путь в дереве
2. Проходим по дереву по этому пути
3. Если такого пути нет, то и соответствия суффиксу нет
4. Если есть, то смотрим префиксные ссылки
5. Перебираем префиксные ссылки
6. Выдаем точные совпадения и узлы к которым искомый является префиксом

Визуализация суффиксного дерева выполняется с помощью d3js.

**Нюансы по реализации**

1. Как выбрать 10 узлов?<br/>
Понятно, что суффикс можно достроить как в большую так и в меньшую сторону.
По логике, с математической точки зрения,  нужно выбирать "ближайшие", т.е расстояние до которых минимально.
Но с практической точки зрения, люди в основном ищут название улицы с первой буквы, поэтому все-же лучше
перебирать в сторону постфиксов.(здесь лучше реализовать автокомплит)
Но задача поставлена так, что должна осуществляться выдача и тех улиц, в которых искомая подстрока может находиться в середине.
Не очень понятно, какой логикой руководствоваться.

2. В реализации буква Е и Ё различны:<br/>
"четвЁртый проспект новогиреево" != "четвЕртый проспект новогиреево"
Хотя в действительности мы это игнорируем

3. Добавлено поле name в узлах для быстрого вынимания литералов при обратном проходе по преффиксным ссылкам.

4. В отличие от других реализаций, использовании суффиксного дерева помогает избежать дубликатов, т.е если в исходном массиве строк, есть одиноковые, при поиске выведется только одна.

**Оценка**
Поиск по дереву - О(n), где n - длина вводимой строки.
Построение дерева происходит на этапе инициализации, и совершает O(n) операций(?).
Поиск происходит быстро)

**Production**
```
npm i
npm run build
```
**Development**
```
npm i
npm run start
```
Открываем по адресу http://localhost:9000

**Linter**
```
npm run lint
```

**Технологии**

* сборка Webpack
* препроцессор SASS
* eslint, csscomb (linter)
* Babel
