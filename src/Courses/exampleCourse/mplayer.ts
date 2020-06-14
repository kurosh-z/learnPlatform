import { Section, ConcurrentSanims } from './anim_section'
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
const flush = async ({
    queue,
    subNum,
    secNum,
    setProgress,
    progressRef,
    num_anims,
    reverse = false,
}: {
    queue: ConcurrentSanims[]
    secNum: number
    subNum: number
    setProgress: SetProgressbar
    progressRef: ProgressRef
    num_anims: number
    reverse?: boolean
    immediate?: boolean
}) => {
    if (reverse) {
        let conNum = queue.length - 1
        for (const concurrent of queue.reverse()) {
            await Promise.all(
                concurrent.reverse().map((anim) => {
                    const set = anim.set

                    const { from, to, settings, meta } = anim.getProps({
                        secNum,
                        subNum,
                        conNum,
                    })

                    return typeof from === 'function'
                        ? set.current(from)
                        : set.current({
                              from: to,
                              to: from,
                              ...settings,
                          })
                })
            )
            conNum--
        }
    } else {
        let conNum = 0
        const results = []
        for (const concurrent of queue) {
            const res = await Promise.all(
                // map all the concurrent animation to single animation (Sanim)
                concurrent.map((sanim) => {
                    const set = sanim.set
                    const sanimList = sanim.getAnimList({
                        secNum,
                        subNum,
                        conNum,
                    })

                    if (secNum === progressRef.current.sec) {
                        progressRef.current.sanim++
                    } else {
                        progressRef.current.sec = secNum
                        progressRef.current.sanim = 1
                    }
                    // map all animations in Sanim to their set functions
                    return Promise.all(
                        sanimList.map((anim) => {
                            // rest is like a payload and carries some more information
                            // for some set functions that are actually a wrapper for springSet
                            const { from, to, settings, meta, ...rest } = anim
                            const progress =
                                (progressRef.current.sanim / num_anims) * 100
                            setProgress((i) => {
                                if (i === secNum) {
                                    return {
                                        width: progress + '%',
                                        titleColor:
                                            progress === 100
                                                ? '#279c3c'
                                                : 'black',
                                        config: VSLOW,
                                    }
                                } else return {}
                            })
                            // console.log(
                            //     'num_anims, animCount',
                            //     num_anims,
                            //     progressRef.current.sanim
                            // )

                            return typeof to === 'function'
                                ? set.current(to)
                                : set.current({
                                      from,
                                      to,
                                      ...settings,
                                      ...rest,
                                  })
                        })
                    )
                })
            )
            results.push(res)
            conNum++
        }

        return results
    }
}

type MplayerArgs = {
    sections: Section[]
    setProgress: SetProgressbar
    progressRef: ProgressRef
    playfrom?: { secNum: number; subNum: number; conNum: number }
}
export const mplayer = async ({
    sections,
    setProgress,
    progressRef,
}: MplayerArgs) => {
    const resutls = []
    for (const section of sections) {
        for (const sub of section.subs) {
            const res = await flush({
                queue: sub.queue,
                secNum: sub.secNumber,
                subNum: sub.subNumber,
                num_anims: section.num_anims,
                setProgress,
                progressRef,
            })
            resutls.push(res)
        }
    }

    return resutls
}
