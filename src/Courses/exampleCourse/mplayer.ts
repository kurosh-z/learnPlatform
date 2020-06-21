import { Section, Subsection, ConcurrentAnims } from './anim_section'
import { SetProgressbar } from './Progressbar'
import { sConfigs } from './anim-utils'

const VSLOW = sConfigs['VSLOW']
type CurrentProgress = {
    sec: number
    sub: number
    con: number
    sobj: number
    sanim: number
}
type ProgressRef = React.MutableRefObject<CurrentProgress>

type PrepareQueueArgs = {
    queue: ConcurrentAnims[]
    secNum: number
    subNum: number
    setProgress: React.MutableRefObject<SetProgressbar>
    progressRef: ProgressRef
    num_anims: number
}

function* prepareQueue({
    queue,
    subNum,
    secNum,
    setProgress,
    progressRef,
    num_anims,
}: PrepareQueueArgs) {
    for (const concurrent of queue) {
        const promise = Promise.all(
            // map all the concurrent animation to single animation
            concurrent.map((anim) => {
                const {
                    set,
                    from,
                    to,
                    settings,
                    payload,
                    immediate = false,
                    meta,
                } = anim
                // console.log(meta)
                if (secNum === progressRef.current.sec) {
                    progressRef.current.sanim++
                } else {
                    progressRef.current.sec = secNum
                    progressRef.current.sanim = 1
                }
                // map all animation in to (they are animation with all with a same set function but posiibly with differnt settings like different delays!)

                const progress = (progressRef.current.sanim / num_anims) * 100
                setProgress.current((i) => {
                    if (i === secNum) {
                        return {
                            width: progress + '%',
                            titleColor: progress === 100 ? '#279c3c' : 'black',
                            config: VSLOW,
                        }
                    } else return {}
                })
                // console.log(
                //     'num_anims, animCount',
                //     num_anims,
                //     progressRef.current.sanim
                // )
                if (immediate) {
                    set.current({ from, to, payload, immediate, ...settings })
                    return
                }

                return typeof to === 'function'
                    ? set.current(to)
                    : set.current({
                          from,
                          to,
                          payload,
                          ...settings,
                      })
            })
        )
        yield promise
    }
}
function createAsyncAnim(generator: typeof prepareQueue) {
    let globalNonce: object
    return async function (args: PrepareQueueArgs) {
        const localNonce = (globalNonce = new Object())
        const iter = generator(args)
        let resumeValue
        for (;;) {
            const n = iter.next()
            if (n.done) {
                return n.value
            }
            resumeValue = await n.value
            if (localNonce !== globalNonce) {
                return
            }
        }
    }
}

type MplayerArgs = {
    setProgress: React.MutableRefObject<SetProgressbar>
    progressRef: ProgressRef
}

export class Mplayer {
    _flush_storage = {}
    sections: Section[] = []
    setProgress: React.MutableRefObject<SetProgressbar>
    progressRef: ProgressRef
    constructor({ setProgress, progressRef }: MplayerArgs) {
        this.progressRef = progressRef
        this.setProgress = setProgress
    }

    add_section(section: Section) {
        const secNum = section.secNumber
        this.sections[secNum] = section
    }

    async play() {
        const resutls = []
        for (const section of this.sections) {
            let conCurrNum = 0
            for (const sub of section.subs) {
                const flushId =
                    section.secNumber + '_' + sub.subNumber + '_' + conCurrNum

                this._flush_storage[flushId] = createAsyncAnim(prepareQueue)
                const flush = this._flush_storage[flushId]

                const res = await flush({
                    queue: sub.queue,
                    secNum: sub.secNumber,
                    subNum: sub.subNumber,
                    num_anims: section.num_anims,
                    setProgress: this.setProgress,
                    progressRef: this.progressRef,
                })
                resutls.push(res)
            }
            conCurrNum++
        }

        return resutls
    }
    async update(sub: Subsection) {
        const subNum = sub.subNumber
        const secNum = sub.secNumber
        // reset progressbar
        this.setProgress.current((i) => {
            if (i === secNum) {
                return {
                    width: '0%',
                    titleColor: 'black',
                    immediate: true,
                }
            } else return {}
        })

        const curr_num_anims =
            subNum - 1 >= 0 ? this.sections[secNum].counter(subNum - 1) : 0

        this.progressRef.current = {
            sec: secNum,
            sub: subNum,
            sanim: curr_num_anims,
            con: 0,
            sobj: 0,
        }
        console.log('progress got update')
        // update sections
        this.sections[secNum].subs[subNum] = sub
        // update num_anim in section
        const num_anims = this.sections[secNum].counter()
        let is_sub = false

        for (const flush_key in this._flush_storage) {
            const split_id = flush_key.split('_')
            const id_sec = split_id[0]
            const id_sub = split_id[1]
            if (id_sec === `${secNum}` && id_sub === `${subNum}`) {
                is_sub = true
                const flush = this._flush_storage[flush_key]
                const ret = await flush({
                    queue: sub.queue,
                    secNum: sub.secNumber,
                    subNum: sub.subNumber,
                    num_anims,
                    setProgress: this.setProgress,
                    progressRef: this.progressRef,
                })

                return ret
            }
        }
        //if sub is new we should add it to it's own section
        if (!is_sub) {
            const section = this.sections[secNum]
            const conCurrNum = section.subs.length
            const flushId =
                section.secNumber + '_' + sub.subNumber + '_' + conCurrNum

            this._flush_storage[flushId] = createAsyncAnim(prepareQueue)
            const flush = this._flush_storage[flushId]
            const ret = await flush({
                queue: sub.queue,
                secNum: sub.secNumber,
                subNum: sub.subNumber,
                num_anims,
                setProgress: this.setProgress,
                progressRef: this.progressRef,
            })

            return ret
        }
    }
}
