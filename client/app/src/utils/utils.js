function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const calculateBensShares = (beneficiaries, fixed = 0) => {
    let allStake = 0;

    beneficiaries.forEach((ben) => {
        allStake += +ben.stake;
    });

    return beneficiaries.map(ben => ({
        ...ben,
        share: (ben.stake / allStake * 100).toFixed(fixed),
    }));
};

/*
*  Date
*/

const moment = require('moment');

const dateFormat = 'DD/MM/YYYY H:mm';

const formatDate = (solidityDate) => {
    const jsDate = new Date(solidityDate * 1000);

    return moment(jsDate).format(dateFormat);
};

export { debounce, calculateBensShares, formatDate };
