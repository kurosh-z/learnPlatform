import React, { useRef, useMemo } from 'react'
import { Section, Subsection, ConcurrentAnims } from './anim_section'
import { SetProgressbar } from './Progressbar'
import { sConfigs } from './anim-utils'

const VSLOW = sConfigs['VSLOW']
type CurrentProgress = {
    sec: number
    sub: number
    con: number
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
        if (concurrent.state === 'CREATED') {
            concurrent.state = 'ACTIVE'
            const promise = Promise.all(
                // map all the concurrent animation to single animation
                concurrent.anims.map((anim, idx) => {
                    const {
                        set,
                        from,
                        to,
                        settings,
                        payload,
                        immediate = false,
                        meta,
                    } = anim
                    if (idx > 0) {
                        concurrent['anims'][idx - 1].state = 'FINISHED'
                    }
                    // if already animated just returns!
                    if (anim.state !== 'CREATED') {
                        return
                    }
                    anim.state = 'ACTIVE'
                    if (secNum === progressRef.current.sec) {
                        progressRef.current.sanim++
                    } else {
                        progressRef.current.sec = secNum
                        progressRef.current.sanim = 1
                    }

                    const progress =
                        (progressRef.current.sanim / num_anims) * 100
                    setProgress.current((i) => {
                        if (i === secNum) {
                            return {
                                width: progress + '%',
                                titleColor:
                                    progress === 100 ? '#279c3c' : 'black',
                                config: VSLOW,
                            }
                        } else return {}
                    })
                    // if it's immediate don't schedule it just run!
                    if (immediate) {
                        set.current({
                            from,
                            to,
                            payload,
                            immediate,
                            ...settings,
                        })
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
}
function createAsyncAnim(generator: typeof prepareQueue) {
    let globalNonce: object
    return async function (args: PrepareQueueArgs) {
        const localNonce = (globalNonce = new Object())
        const iter = generator(args)
        // let resumeValue
        let i = 0
        for (;;) {
            const n = iter.next()
            if (n.done) {
                return n.value
            }
            await n.value
            const last = args.queue[i].anims.length - 1
            // last anim is not set to finished yet!
            args.queue[i].anims[last].state = 'FINISHED'
            args.queue[i].state === 'FINISHED'
            i++
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

type OnPlayEnd = () => void
type OnPlayStart = () => void

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

        // setState(set: (state: PState) => PState) {
        //     this.state = set(this.state)
    }

    async play(args?: { onPlayStart?: OnPlayStart; onPlayEnd?: OnPlayEnd }) {
        const resutls = []
        const { onPlayStart, onPlayEnd } = args || {}

        if (onPlayStart) {
            await (async function () {
                onPlayStart()
            })()
        }
        console.log('playing...')
        for (const section of this.sections) {
            if (section.state === 'ACTIVE') {
                // break the loop if section is still active so that other sections don't get started!
                break
            }
            console.log(section.secNumber, section.state)
            if (section.state === 'CREATED') {
                console.log('got to the play!')
                section.state = 'ACTIVE'
                let conCurrNum = 0
                for (const sub of section.subs) {
                    if (sub.state === 'CREATED') {
                        // set sub active
                        sub.state = 'ACTIVE'
                        const flushId =
                            section.secNumber +
                            '_' +
                            sub.subNumber +
                            '_' +
                            conCurrNum
                        if (!this._flush_storage[flushId]) {
                            this._flush_storage[flushId] = createAsyncAnim(
                                prepareQueue
                            )
                        }
                        const flush = this._flush_storage[flushId]

                        const res = await flush({
                            queue: sub.queue,
                            secNum: sub.secNumber,
                            subNum: sub.subNumber,
                            num_anims: section.num_anims,
                            setProgress: this.setProgress,
                            progressRef: this.progressRef,
                        })
                        // sub finished
                        sub.state = 'FINISHED'
                        resutls.push(res)
                    }
                }
                conCurrNum++
            }
            section.state = 'FINISHED'
        }

        if (onPlayEnd) {
            await (async function () {
                onPlayEnd()
            })()
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
            con: 0,
            sanim: curr_num_anims,
        }
        // update sections
        this.sections[secNum].subs[subNum] = sub
        this.sections[secNum].state = 'CREATED'

        // update num_anim in section
        this.sections[secNum].counter()
        this.play()
    }
}

export function useMathPlayer(
    setProgressbarRef: React.MutableRefObject<SetProgressbar>
) {
    const progressRef = useRef({ sec: 0, sub: 0, con: 0, sanim: 0 })
    const mplayer = useMemo(() => {
        return new Mplayer({
            setProgress: setProgressbarRef,
            progressRef: progressRef,
        })
    }, [])
    return mplayer
}
