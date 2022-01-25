import { clone, weightRandom } from '../functions/util.js';

class Character {
    constructor() {}

    #characters;
    #characterPullCount;
    #rateableKnife;
    #rate;

    initial({characters}) {
        this.#characters = characters;
        return this.count;
    }

    get count() {
        return Object.keys(this.#characters).length;
    }

    config({
        characterPullCount = 3,
        rateableKnife = 10,
    } = {}) {
        this.#characterPullCount = characterPullCount;
        this.#rateableKnife = rateableKnife;
    }

    random() {
        return this.rateable();
    }

    rateable() {
        if(!this.#rate) {
            this.#rate = {};
            for(const id in this.#characters) {
                this.#rate[id] = 1;
            }
        }

        const r = [];
        new Array(this.#characterPullCount)
            .fill(0)
            .forEach(()=>{
                r.push(
                    weightRandom(Object
                        .keys(this.#rate)
                        .filter(id=>!r.includes(id))
                        .map(id=>([id,this.#rate[id]]))
                    )
                )
            });

        let min = Infinity;
        for(const id in this.#rate) {
            if(r.includes(id)) {
                min = Math.min(min, this.#rate[id]);
                continue;
            }
            min = Math.min(min, ++ this.#rate[id]);
        }
        if(min > this.#rateableKnife) {
            for(const id in this.#rate) {
                this.#rate[id] -= this.#rateableKnife;
            }
        }
        return r.map(id=>clone(this.#characters[id]));
    }

}

export default Character;