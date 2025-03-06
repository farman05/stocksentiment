const getRandomThree = (arr)=> {
    return arr.sort(() => Math.random() - 0.5).slice(0, 3);
}

export {
    getRandomThree
}
