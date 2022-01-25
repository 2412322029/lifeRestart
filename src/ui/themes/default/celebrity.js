export default class Celebrity extends ui.view.DefaultTheme.CelebrityUI {
    constructor() {
        super();
        this.btnRetry.on(Laya.Event.CLICK, this, this.random);
        this.btnNext.on(Laya.Event.CLICK, this, this.next);
        this.panelCharacter.vScrollBar.elasticDistance = 150;
    }

    #characters;
    #selected;
    static #createComponent = Laya.plugin.extractComponents(Celebrity.uiView, ['boxCharacter','boxTalent']);
    #createCharacterItem(dataSource, click) {
        const {name, property, talent} = dataSource;
        const style = $ui.common.characterItem;
        const item = Celebrity.#createComponent('boxCharacter');
        const vboxStates = item.getChildByName('vboxStates');
        const boxName = item.getChildByName('boxName');
        boxName.label = name;

        const p = $_.clone(property);
        for(const k in p)
            if(Math.abs(p[k] - Math.PI) < 0.0000001)
                p[k] = 'π';

        vboxStates.label = $_.format($lang.F_PropertyStr, p);
        $_.deepMapSet(boxName, style.name);
        $_.deepMapSet(vboxStates, style.state);
        for(const t of talent) {
            const i = Celebrity.#createComponent('boxTalent');
            i.label = $_.format($lang.F_TalentSelection, t);
            i.y = vboxStates.height+vboxStates.space;
            $_.deepMapSet(i, $ui.common.card[t.grade].normal);
            vboxStates.addChild(i);
        }
        const box = new Laya.Box();
        box.height = vboxStates.space;
        box.y = vboxStates.height;
        vboxStates.addChild(box);
        vboxStates.scaleY = 0;

        item.dataSource = dataSource;
        item.switch = showDetails => vboxStates.scaleY = !!showDetails?1:0;
        item.click = (cb, caller) => {
            boxName.offAll(Laya.Event.CLICK);
            boxName.on(Laya.Event.CLICK, caller || this, cb);
        }
        if(click) item.click(click);
        return item;
    }

    init() {
        this.random();
    }

    close() {
        this.#selected = null;
        this.vboxCharacter.destroyChildren(true);
    }

    random() {
        this.#selected = null;
        this.vboxCharacter.destroyChildren(true);
        this.#characters = core.characterRandom();
        this.#characters.forEach(character => {
            const item = this.#createCharacterItem(character);
            this.vboxCharacter.addChild(item);
            item.click(()=>{
                if(this.#selected) this.#selected.switch(false);
                this.#selected = item;
                item.switch(true);
                item.event(Laya.Event.RESIZE);
            });
        });
    }

    next() {
        if(!this.#selected) {
            $$event('message', ['M_PleaseSelectOne']);
            return;
        }
        const {property: propertyAllocate, talent: talents} = this.#selected.dataSource;
        const replace = core.remake(talents.map(talent => talent.id));
        if(replace.length > 0) {
            $$event('message', [replace.map(v => ['F_TalentReplace', v])]);
        }
        $ui.switchView(
            UI.pages.TRAJECTORY,
            {
                propertyAllocate, talents,
                enableExtend: false,
            }
        );
    }

}