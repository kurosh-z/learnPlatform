import React, { useMemo, useEffect } from 'react'
import { ReactThreeFiber } from 'react-three-fiber'
import { animated } from 'react-spring'
import { SpringStartFn, SpringValues } from '@react-spring/core'
import { AvectorProps, AVectorComp, AnimatedVecProps } from './Vector'
import { addVectors } from '../shared'

export type AnimatedVectorOpProps = Omit<AnimatedVecProps, 'vector'>
export type SetVectorOp = SpringStartFn<Omit<AnimatedVecProps, 'vector'>>
type VectorOpProps = {
    op: 'add'
    vec1: ReactThreeFiber.Vector3
    vec2: ReactThreeFiber.Vector3
    from: AnimatedVecProps
    setSpringRef: React.MutableRefObject<SetVectorOp>
    pause: boolean
} & Omit<AvectorProps, 'from'>

const VectorOp: React.FC<VectorOpProps> = ({
    vec1,
    vec2,
    op,
    children,
    ...rest
}) => {
    if (children) {
        throw new Error('expected no children in VectorOp Component!')
    }
    const vector = useMemo(() => {
        if (op === 'add' && vec1) {
            console.log(vec1, vec2)
            return addVectors(vec1, vec2)
        } else return [0, 2, 2]
    }, [vec1, vec2, op])

    return <AVectorComp vector={vector} {...rest} />
}

export default animated(VectorOp)
