import {
    SpringStartFn,
    SpringConfig,
    SpringDefaultProps,
} from '@react-spring/core'

type FnToFrom<T> = (args?: object | number | string) => T
export type SanimSet<T> = React.MutableRefObject<
    SpringStartFn<T | Function> | SpringStartFn<T>
>
type SanimTF<T> = T | FnToFrom<T>
type SanimSettings = {
    config?: SpringConfig
    delay?: number
    default?: SpringDefaultProps
}
export type SanimAddArgs<T> = {
    to: SanimTF<T>
    from?: SanimTF<T>
    settings?: SanimSettings
    meta: string
    payload?: object | number | string | Function
}

/* =================  SANIM ====================  */

export class Sanim<T = object> {
    set: SanimSet<T>
    from: SanimTF<T>
    all: {
        [keys: string]: (SanimAddArgs<T> & { from: SanimTF<T> })[]
    } = {}
    currIndex: { secNum: number; subNum: number; conNum: number } = {
        secNum: 0,
        subNum: 0,
        conNum: 0,
    }
    currIndexKey = '0-0-0'
    constructor({ set, from }: { set: SanimSet<T>; from: SanimTF<T> }) {
        this.set = set
        this.from = from
    }

    add({
        to,
        from,
        settings = {},
        meta,
        secNum,
        subNum,
        conNum,
        payload,
    }: SanimAddArgs<T> & {
        secNum?: number
        subNum?: number
        conNum?: number
    }) {
        const currSec = this.currIndex.secNum
        const currSub = this.currIndex.subNum
        const currCon = this.currIndex.conNum
        const last_index = currSec + '-' + currSub + '-' + currCon
        const index_key = secNum + '-' + subNum + '-' + conNum
        this.currIndex = { secNum, subNum, conNum }

        if (!index_key) {
            throw new Error(
                `index_key is undefined! recieved args: secNum:${secNum}, subNum:${subNum}, conNum:${conNum}`
            )
        }

        let _from: typeof from
        // : SanimTF<T>

        if (typeof this.from === 'function') {
            if (this.isEmpty(this.all)) {
                _from = from ? from : this.from
            } else {
                const last = this.all[last_index]
                const len = last.length
                _from = from ? from : last[len - 1].to
            }
        } else {
            if (this.isEmpty(this.all)) {
                _from = from ? from : this.from
            } else {
                const last = this.all[last_index]
                const len = last.length
                _from = {
                    ...last[len - 1].from,
                    ...last[len - 1].to,
                    ...from,
                }
            }
        }

        // for the case that in one index_key contains more than one animation with the same set (for example same animation with
        // different delays  after each others) we push every animations in a list so all[index] is a list of animations
        if (!this.all[index_key]) {
            this.all[index_key] = [{ from: _from, to, settings, meta, payload }]
        } else {
            this.all[index_key].push({
                from: _from,
                to,
                settings,
                meta,
                payload,
            })
        }

        this.currIndexKey = index_key

        return this
    }

    isEmpty(arg: object) {
        if (arg === undefined || arg === null) {
            throw new Error(`object is undefined or null!`)
        }
        if (typeof arg === 'object') {
            return Object.keys(arg).length === 0
        }
    }

    getAnimList({
        secNum,
        subNum,
        conNum,
    }: {
        secNum: number
        subNum: number
        conNum: number
    }) {
        const index_key = secNum + '-' + subNum + '-' + conNum
        const res = this.all[index_key]
        if (!res) {
            {
                console.log(this.all)
                throw new Error(
                    `no props could be found for index_key:${index_key}`
                )
            }
        } else return res
    }
}

/* =================  SUBSECTTION ====================  */
export type ConcurrentSanims = Sanim<any>[]

type SubsectionArgs = {
    title: string
    meta?: string
    secNumber: number
    subNumber: number
}

export class Subsection {
    title: string
    meta?: string
    secNumber: number
    subNumber: number
    queue: ConcurrentSanims[] = []
    currCon = 0
    constructor({ title, meta, secNumber, subNumber }: SubsectionArgs) {
        this.title = title
        this.meta = meta
        this.secNumber = secNumber
        this.subNumber = subNumber
    }
    add<T extends object>({
        anim,
        props,
    }: {
        anim: Sanim<T>
        props: SanimAddArgs<T>
    }) {
        anim.add({
            secNum: this.secNumber,
            subNum: this.subNumber,
            conNum: this.currCon,
            ...props,
        })

        let currConList = this.queue[this.currCon]
        if (currConList) {
            currConList.push(anim)
        } else {
            currConList = [anim]
            this.queue.push(currConList)
        }
        return this
    }
    nextCon() {
        this.currCon++
        return this
    }
}

/* ================  SECTTION ====================  */
type SectionArgs = {
    title: string
    secNumber: number
    meta?: string
    subs: Subsection[]
}

export class Section {
    title: string
    secNumber: number
    meta?: string
    subs: Subsection[]
    num_anims: number
    constructor({ title, secNumber, meta, subs }: SectionArgs) {
        this.title = title
        this.secNumber = secNumber
        this.meta = meta
        this.subs = subs
        this.num_anims = this.counter()
    }
    counter() {
        let count = 0
        let subNum = 0
        let conNum = 0
        for (const sub of this.subs) {
            for (const concurrent of sub.queue) {
                for (const sanim of concurrent) {
                    const sanimList = sanim.getAnimList({
                        secNum: this.secNumber,
                        subNum,
                        conNum,
                    })
                    for (const _ of sanimList) {
                        count++
                    }
                }
                conNum++
            }
            subNum++
            conNum = 0 //reset conNum for new subSection!
        }

        return count
    }
}
