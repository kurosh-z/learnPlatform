import React, { useMemo } from 'react'
import { ReactThreeFiber } from 'react-three-fiber'
import { Vector3 } from 'three'

import Vector, { VectorProps } from './Vector'

type VectorOpProps = {
    op: 'add'
    vector1: ReactThreeFiber.Vector3
    vector2: ReactThreeFiber.Vector3
} & Omit<VectorProps, 'vector'>

const VectorOp: React.FC<VectorOpProps> = ({
    vector1,
    vector2,
    op,
    ...rest
}) => {
    const vector = useMemo(() => {
        if (op === 'add') {
            const _vector1 =
                vector1 instanceof Vector3 ? vector1 : new Vector3(...vector1)
            const _vector2 =
                vector2 instanceof Vector3 ? vector2 : new Vector3(...vector2)
            const res = new Vector3()
            return res.addVectors(_vector1, _vector2)
        }
    }, [vector1, vector2, op])

    return <Vector vector={vector} {...rest} />
}

export default VectorOp
