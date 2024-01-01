// Wait some time before executing a callback
export async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Shuffle array elements
export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

// Pick random item from list
export function choose(list) {
    return list[Math.floor((Math.random()*list.length))];
}

export function isAlpha(key) {
    return /^[a-zA-Z]$/.test(key);
}