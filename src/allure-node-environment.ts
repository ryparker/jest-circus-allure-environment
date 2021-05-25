import NodeEnvironment = require('jest-environment-node');

import extendAllureBaseEnvironment from './allure-base-environment';

export default extendAllureBaseEnvironment(NodeEnvironment);
