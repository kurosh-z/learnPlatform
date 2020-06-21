import {
    SpringStartFn,
    SpringConfig,
    SpringDefaultProps,
} from '@react-spring/core'

type AnimSettings = {
    config?: SpringConfig
    delay?: number
    default?: SpringDefaultProps
}

type ToFn<T> = (
    args: object | number | string | Array<number | object | string>
) =>
    | T
    | {
          from?: T
          to?: T
          config?: AnimSettings['config']
          dely?: number
          default?: AnimSettings['default']
      }

type AnimCustomStrFn<T> = (props: {
    to?: T | ToFn<T>
    from?: T | ToFn<T>
    config?: AnimSettings['config']
    default?: AnimSettings['default']
    cancel?: boolean
}) => Promise<any>

export type AnimStartFn<T> = SpringStartFn<T> | AnimCustomStrFn<T>

export type AnimSetFn<T> = React.MutableRefObject<AnimStartFn<T>>

export type SingleAnim<T> = {
    set: AnimSetFn<T>
    to: T | ToFn<T>
    from?: T | ToFn<T>
    immediate?: boolean
    settings?: AnimSettings
    meta: string
    payload?: object | number | string | Function
}

export type ConcurrentAnims = SingleAnim<any>[]
/* =================  SUBSECTTION ====================  */

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
    queue: ConcurrentAnims[] = []
    currCon = 0
    constructor({ title, meta, secNumber, subNumber }: SubsectionArgs) {
        this.title = title
        this.meta = meta
        this.secNumber = secNumber
        this.subNumber = subNumber
    }
    add<T>(anim: SingleAnim<T>) {
        // const anim = { ...rest, immediate }
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
    counter(subNum?: number) {
        //if subNum is given it returns the number of animations for that sub otherwise for subs
        let count = 0
        if (typeof subNum === 'number') {
            for (const concurrent of this.subs[subNum].queue) {
                count += concurrent.length
            }
            return count
        }
        for (const sub of this.subs) {
            for (const concurrent of sub.queue) {
                count += concurrent.length
            }
        }
        this.num_anims = count
        return count
    }
}
