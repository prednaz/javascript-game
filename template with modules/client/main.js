import {Apple} from './export-a-class.js';

import {square} from './export-a-function.js';

import {CANVAS_SIZE} from './export-a-identifier.js';


const socket = io();

new Apple();

console.log(square(8));

console.log(CANVAS_SIZE);