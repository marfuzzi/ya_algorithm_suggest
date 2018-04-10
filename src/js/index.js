import './../sass/styles.scss';
import streets from './streets';
import tree from './tree';

const input = document.querySelector('.input');
const streetContainer = document.querySelector('.container');
const button = document.querySelector('.button');

input.oninput = () => {
    if (input.value === '') {
        streetContainer.innerHTML = '';
        return;
    }
    // console.time('search');
    streetContainer.innerHTML = Object.keys(tree.find(input.value)).join('<br/>');
    // console.timeEnd('search');
};

button.addEventListener('click', () => {
    tree.render();
});
